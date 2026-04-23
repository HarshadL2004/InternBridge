"""
resume_model.py — ML-powered resume analysis
Uses trained GradientBoosting models for ATS scoring and grade prediction.
Rule-based extraction feeds features into the model; no more fuzzy-only scoring.
"""

import fitz
import spacy
import re
from collections import Counter
import os
import joblib
import numpy as np

# ── spaCy ──────────────────────────────────────────────────────────────────────
nlp = spacy.load("en_core_web_sm")

# ── Model paths ────────────────────────────────────────────────────────────────
_MODEL_DIR = os.path.join(os.path.dirname(__file__), "trained")

def _load(name):
    return joblib.load(os.path.join(_MODEL_DIR, name))

try:
    _ats_regressor = _load("ats_score_regressor.pkl")
    _grade_clf     = _load("grade_classifier.pkl")
    _grade_le      = _load("grade_label_encoder.pkl")
    _match_clf     = _load("match_classifier.pkl")
    _match_le      = _load("match_label_encoder.pkl")
    _feature_cols  = _load("feature_cols.pkl")
    _MODELS_LOADED = True
except Exception as _e:
    _MODELS_LOADED = False
    _MODEL_LOAD_ERROR = str(_e)

# ── Skill taxonomy ─────────────────────────────────────────────────────────────
SKILL_CATEGORIES = {
    "programming": [
        "python","java","javascript","c++","c#","php","ruby","go","rust",
        "typescript","scala","kotlin","swift","r","matlab","perl","lua",
        "dart","objective-c","visual basic","cobol","fortran","assembly",
        "bash","powershell","groovy","clojure","elixir","haskell",
    ],
    "web": [
        "react","angular","vue","node","express","django","flask","spring",
        "nextjs","html","css","sass","less","bootstrap","tailwind","jquery",
        "ajax","nuxt","rest api","graphql","json","xml","http","websocket",
        "webpack","vite",
    ],
    "database": [
        "mongodb","mysql","postgresql","redis","elasticsearch","oracle",
        "sql server","sqlite","cassandra","couchdb","dynamodb","firebase",
        "mariadb","db2","neo4j","influxdb","memcached","cockroachdb",
    ],
    "cloud": [
        "aws","azure","gcp","docker","kubernetes","terraform","jenkins",
        "github actions","gitlab ci","circleci","travis ci","heroku","vercel",
        "netlify","lambda","ec2","s3","cloudformation","ansible","puppet",
        "helm","openshift","ecs","eks",
    ],
    "data": [
        "pandas","numpy","scikit-learn","tensorflow","pytorch","keras",
        "tableau","power bi","excel","hadoop","spark","kafka","airflow",
        "jupyter","matplotlib","seaborn","plotly","d3.js","bigquery",
        "snowflake","dbt","looker",
    ],
    "soft": [
        "leadership","communication","problem solving","teamwork","agile",
        "scrum","kanban","project management","time management",
        "critical thinking","analytical","creative","adaptable","organized",
        "detail-oriented","mentoring","collaboration","negotiation",
        "decision making","strategic planning",
    ],
}

ATS_CRITERIA = {
    "contact_info":   ["email","phone","address","linkedin","contact","telephone","mobile","location"],
    "summary":        ["professional summary","objective","profile","about","career summary","personal statement"],
    "experience":     ["work experience","employment","professional experience","work history","positions held"],
    "education":      ["education","degree","university","college","school","bachelor","master","phd","diploma","certificate"],
    "skills":         ["skills","technical skills","competencies","abilities","expertise","proficiencies","technologies","tools"],
    "certifications": ["certifications","licenses","awards","achievements","accreditations","professional development","training"],
}


# ─────────────────────────────────────────────────────────────────────────────
# Text helpers
# ─────────────────────────────────────────────────────────────────────────────

def extract_text(path: str) -> str:
    try:
        doc = fitz.open(path)
        raw = " ".join(page.get_text() for page in doc)
        doc.close()
        raw = re.sub(r"\n+", " ", raw)
        raw = re.sub(r"\s+", " ", raw).strip()
        return raw.lower()
    except Exception as exc:
        raise ValueError(f"Could not extract text from PDF: {exc}")


def preprocess_text(text: str):
    doc = nlp(text)
    tokens = [t.lemma_.lower() for t in doc if not t.is_stop and not t.is_punct and len(t.text) > 2]
    return tokens, doc


# ─────────────────────────────────────────────────────────────────────────────
# Feature extraction
# ─────────────────────────────────────────────────────────────────────────────

def _find_skills(text_tokens, skill_list):
    found = set()
    text_str = " ".join(text_tokens)
    for skill in skill_list:
        if skill in text_str:
            found.add(skill)
    return list(found)


def analyze_skills(text: str):
    tokens, _ = preprocess_text(text)
    skills_found = {}
    total = 0
    for cat, skills in SKILL_CATEGORIES.items():
        matched = _find_skills(tokens, skills)
        validated = [s for s in matched if re.search(r"\b" + re.escape(s) + r"\b", text, re.IGNORECASE)]
        skills_found[cat] = validated
        total += len(validated)
    return skills_found, total


def check_ats_completeness(text: str):
    completeness = {}
    for section, kws in ATS_CRITERIA.items():
        completeness[section] = any(
            re.search(r"\b" + re.escape(kw) + r"\b", text, re.IGNORECASE) for kw in kws
        )
    score = sum(completeness.values()) / len(ATS_CRITERIA) * 100
    return completeness, score


def calculate_keyword_density(text: str):
    words = re.findall(r"\b\w+\b", text)
    total = len(words)
    if total == 0:
        return {}
    freq = Counter(words)
    all_skills = [s for cat in SKILL_CATEGORIES.values() for s in cat]
    return {w: freq[w] / total * 100 for w in all_skills if w in freq}


def _syllables(word: str) -> int:
    word = word.lower()
    vowels = "aeiouy"
    count, prev_vowel = 0, False
    for ch in word:
        is_v = ch in vowels
        if is_v and not prev_vowel:
            count += 1
        prev_vowel = is_v
    if word.endswith("e"):
        count -= 1
    if word.endswith("le") and len(word) > 2 and word[-3] not in vowels:
        count += 1
    return max(1, count)


def _readability(text: str) -> float:
    sentences = [s for s in re.split(r"[.!?]+", text) if s.strip()]
    words = text.split()
    if not sentences or not words:
        return 0
    syllables = sum(_syllables(w) for w in words)
    score = 0.39 * (len(words) / len(sentences)) + 11.8 * (syllables / len(words)) - 15.59
    return max(0, round(score, 2))


def analyze_content_quality(text: str, doc):
    scores = {}
    scores["word_count"] = len([t for t in doc if not t.is_punct and not t.is_space])
    sents = list(doc.sents)
    scores["sentence_count"] = len(sents)
    scores["avg_sentence_length"] = round(sum(len(s) for s in sents) / len(sents), 2) if sents else 0
    pos_counts = Counter(t.pos_ for t in doc if not t.is_stop and not t.is_punct)
    total_m = sum(pos_counts.values())
    if total_m:
        scores["noun_ratio"] = round(pos_counts.get("NOUN", 0) / total_m, 3)
        scores["verb_ratio"] = round(pos_counts.get("VERB", 0) / total_m, 3)
        scores["adj_ratio"]  = round(pos_counts.get("ADJ",  0) / total_m, 3)
    else:
        scores["noun_ratio"] = scores["verb_ratio"] = scores["adj_ratio"] = 0
    scores["readability_score"] = _readability(text)
    return scores


def _build_feature_vector(skills_found, total_skills, completeness,
                           completeness_score, content_quality, keyword_density):
    kd_vals = list(keyword_density.values())
    return {
        "total_skills":        total_skills,
        "skill_categories":    sum(1 for v in skills_found.values() if v),
        "programming_skills":  len(skills_found.get("programming", [])),
        "web_skills":          len(skills_found.get("web", [])),
        "database_skills":     len(skills_found.get("database", [])),
        "cloud_skills":        len(skills_found.get("cloud", [])),
        "data_skills":         len(skills_found.get("data", [])),
        "soft_skills":         len(skills_found.get("soft", [])),
        "has_contact":         int(completeness.get("contact_info", False)),
        "has_summary":         int(completeness.get("summary", False)),
        "has_experience":      int(completeness.get("experience", False)),
        "has_education":       int(completeness.get("education", False)),
        "has_skills_section":  int(completeness.get("skills", False)),
        "has_certifications":  int(completeness.get("certifications", False)),
        "sections_complete":   sum(completeness.values()),
        "completeness_pct":    round(completeness_score, 2),
        "word_count":          content_quality.get("word_count", 0),
        "sentence_count":      content_quality.get("sentence_count", 0),
        "avg_sentence_length": content_quality.get("avg_sentence_length", 0),
        "noun_ratio":          content_quality.get("noun_ratio", 0),
        "verb_ratio":          content_quality.get("verb_ratio", 0),
        "adj_ratio":           content_quality.get("adj_ratio", 0),
        "readability_score":   content_quality.get("readability_score", 0),
        "keyword_count":       len(keyword_density),
        "avg_keyword_density": round(sum(kd_vals) / len(kd_vals), 4) if kd_vals else 0,
        "max_keyword_density": round(max(kd_vals), 4) if kd_vals else 0,
    }


# ─────────────────────────────────────────────────────────────────────────────
# ML prediction
# ─────────────────────────────────────────────────────────────────────────────

def _predict_with_model(feature_dict: dict):
    if not _MODELS_LOADED:
        return None, None
    try:
        X = np.array([[feature_dict[col] for col in _feature_cols]])
        score = int(round(float(_ats_regressor.predict(X)[0])))
        score = max(0, min(100, score))
        grade = _grade_le.inverse_transform(_grade_clf.predict(X))[0]
        return score, grade
    except Exception:
        return None, None


def _fallback_score(fd: dict):
    skill_score = min(fd["total_skills"] * 1.5, 12) + min(fd["skill_categories"] * 2, 10)
    skill_score = min(skill_score, 25)
    comp_score  = fd["completeness_pct"] / 100 * 20
    wc = fd["word_count"]
    content_score = (10 if 300 <= wc <= 800 else 7 if 200 <= wc <= 1000 else 4 if wc >= 150 else 0)
    if 0.25 <= fd["noun_ratio"] <= 0.65 and 0.08 <= fd["verb_ratio"] <= 0.35: content_score += 8
    elif fd["noun_ratio"] > 0.15 and fd["verb_ratio"] > 0.03:                  content_score += 5
    avg_s = fd["avg_sentence_length"]
    content_score += (7 if 10 <= avg_s <= 25 else 4 if 5 <= avg_s <= 35 else 0)
    content_score = min(content_score, 25)
    kw_score = min(fd["keyword_count"] * 0.8, 8)
    kw_score += (6 if fd["max_keyword_density"] <= 5 else 4 if fd["max_keyword_density"] <= 8 else 2)
    kw_score += (6 if 0.5 <= fd["avg_keyword_density"] <= 3 else 4 if 0.2 <= fd["avg_keyword_density"] <= 5 else 0)
    kw_score = min(kw_score, 20)
    r = fd["readability_score"]
    r_score = 10 if r <= 12 else 8 if r <= 15 else 5 if r <= 18 else 2
    total = max(0, min(int(round(skill_score + comp_score + content_score + kw_score + r_score)), 100))
    grade = "A+" if total >= 90 else "A" if total >= 80 else "B+" if total >= 70 else "B" if total >= 60 \
            else "C+" if total >= 50 else "C" if total >= 40 else "D" if total >= 30 else "F"
    return total, grade


# ─────────────────────────────────────────────────────────────────────────────
# JD matching
# ─────────────────────────────────────────────────────────────────────────────

def match_jd(resume_skills: list, required_skills: list, nice_to_have: list = None):
    nice_to_have = nice_to_have or []
    resume_set = {s.lower().strip() for s in resume_skills}
    req_set    = {s.lower().strip() for s in required_skills}
    nice_set   = {s.lower().strip() for s in nice_to_have}
    matched_req  = list(resume_set & req_set)
    matched_nice = list(resume_set & nice_set)
    match_score = (
        (len(matched_req)  / len(req_set)  * 70 if req_set  else 0)
      + (len(matched_nice) / len(nice_set) * 30 if nice_set else 0)
    )
    match_score = round(match_score, 2)
    if _MODELS_LOADED:
        try:
            enc = _match_clf.predict(np.array([[match_score]]))[0]
            recommendation = _match_le.inverse_transform([enc])[0]
        except Exception:
            recommendation = _rule_recommendation(match_score)
    else:
        recommendation = _rule_recommendation(match_score)
    return {
        "match_score":        match_score,
        "recommendation":     recommendation,
        "matched_required":   matched_req,
        "matched_nice_to_have": matched_nice,
        "missing_required":   list(req_set - resume_set),
    }


def _rule_recommendation(score: float) -> str:
    if score >= 70: return "Strong Match"
    if score >= 50: return "Good Match"
    if score >= 30: return "Partial Match"
    return "Weak Match"


# ─────────────────────────────────────────────────────────────────────────────
# Suggestions
# ─────────────────────────────────────────────────────────────────────────────

def generate_suggestions(skills_found, completeness, keyword_density, content_quality, feature_dict):
    suggestions = []
    missing_cats = [c.replace("_"," ").title() for c, v in skills_found.items() if not v]
    if missing_cats:
        suggestions.append(f"Expand technical skills: Add expertise from {', '.join(missing_cats[:2])}")
    missing_secs = [s.replace("_"," ").title() for s, v in completeness.items() if not v]
    if missing_secs:
        suggestions.append(f"Complete resume sections: Add {', '.join(missing_secs[:2])}")
    wc = content_quality.get("word_count", 0)
    if wc < 300:
        suggestions.append("Expand content: Aim for 300-800 words for better ATS visibility")
    elif wc > 1000:
        suggestions.append("Reduce verbosity: Condense to 800-1000 words for clarity")
    over = [w for w, d in keyword_density.items() if d > 5]
    if over:
        suggestions.append(f"Reduce keyword repetition: Use '{over[0]}' less frequently")
    if content_quality.get("readability_score", 0) > 18:
        suggestions.append("Improve readability: Use shorter sentences and simpler language")
    return suggestions[:4]


# ─────────────────────────────────────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────────────────────────────────────

def analyze_resume(path: str) -> dict:
    """
    ML-powered resume analysis.
    Returns score, grade, feedback, skills_found, completeness,
    keyword_density, suggestions, metrics, and model_used.
    """
    try:
        text = extract_text(path)

        if len(text.strip()) < 100:
            return {
                "score": 15, "grade": "F",
                "feedback": "Resume appears to be too short or unreadable.",
                "skills_found": {}, "completeness": {}, "keyword_density": {},
                "suggestions": ["Upload a complete resume PDF with substantial content"],
                "metrics": {}, "model_used": "none",
            }

        doc = nlp(text)

        skills_found, total_skills = analyze_skills(text)
        keyword_density            = calculate_keyword_density(text)
        completeness, comp_score   = check_ats_completeness(text)
        content_quality            = analyze_content_quality(text, doc)
        feature_dict               = _build_feature_vector(
            skills_found, total_skills, completeness,
            comp_score, content_quality, keyword_density
        )

        score, grade = _predict_with_model(feature_dict)
        if score is None:
            score, grade = _fallback_score(feature_dict)
            model_used = "rule_based_fallback"
        else:
            model_used = "gradient_boosting_ml"

        suggestions = generate_suggestions(
            skills_found, completeness, keyword_density, content_quality, feature_dict
        )

        skill_cats = sum(1 for v in skills_found.values() if v)
        feedback = ". ".join([
            f"ATS Score: {score}/100 ({grade})",
            (f"Skills: {total_skills} found in {skill_cats} categories"
             if total_skills else "Skills: No technical skills detected — consider adding"),
            f"Completeness: {comp_score:.1f}% ({sum(completeness.values())}/{len(completeness)} sections)",
            f"Content Quality: {content_quality.get('word_count',0)} words, "
            f"{content_quality.get('sentence_count',0)} sentences",
        ] + ([f"Top improvement: {suggestions[0]}"] if suggestions else []))

        return {
            "score":           score,
            "grade":           grade,
            "feedback":        feedback,
            "skills_found":    skills_found,
            "completeness":    completeness,
            "keyword_density": dict(list(keyword_density.items())[:10]),
            "suggestions":     suggestions,
            "metrics": {
                "total_skills":            total_skills,
                "skill_categories":        skill_cats,
                "completeness_percentage": round(comp_score, 1),
                "word_count":              content_quality.get("word_count", 0),
                "sentence_count":          content_quality.get("sentence_count", 0),
                "avg_sentence_length":     content_quality.get("avg_sentence_length", 0),
                "readability_score":       content_quality.get("readability_score", 0),
                "keyword_count":           feature_dict["keyword_count"],
                "avg_keyword_density":     feature_dict["avg_keyword_density"],
            },
            "model_used": model_used,
        }

    except Exception as exc:
        return {
            "score": 0, "grade": "Error",
            "feedback": f"Analysis failed: {exc}",
            "skills_found": {}, "completeness": {}, "keyword_density": {},
            "suggestions": ["Ensure file is valid PDF"], "metrics": {}, "model_used": "none",
        }