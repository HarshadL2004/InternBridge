from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, HTTPException, status, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
import tempfile

from models.resume_model import analyze_resume, match_jd

app = FastAPI(
    title="Resume Analyzer API",
    version="2.0.0",
    description="ML-powered resume analysis with GradientBoosting ATS scoring and JD matching.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "ok", "message": "Resume Analyzer v2 (ML-powered) is running."}


# ── Resume analysis ───────────────────────────────────────────────────────────

@app.post("/analyze")
async def analyze(
    resume: Optional[UploadFile] = File(None),
    file_path: Optional[str] = Body(None),
):
    """
    Analyze a resume PDF and return ML-powered ATS score, grade,
    skill breakdown, completeness report, and improvement suggestions.

    Supply either:
    - `resume`    – a PDF file upload (multipart/form-data), OR
    - `file_path` – an absolute server-side path (JSON body).
    """
    if resume is None and not file_path:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide either a PDF upload or a file_path in the request body.",
        )

    temp_file_path = None
    try:
        if resume:
            if resume.content_type != "application/pdf":
                raise HTTPException(
                    status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                    detail="Only PDF file uploads are supported.",
                )
            suffix = Path(resume.filename).suffix or ".pdf"
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                temp_file_path = tmp.name
                tmp.write(await resume.read())
            return analyze_resume(temp_file_path)

        return analyze_resume(file_path)

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Resume analysis failed: {exc}",
        )
    finally:
        if temp_file_path:
            try:
                Path(temp_file_path).unlink()
            except OSError:
                pass


# ── JD matching ───────────────────────────────────────────────────────────────

class JDMatchRequest(BaseModel):
    resume_skills: List[str]
    required_skills: List[str]
    nice_to_have_skills: Optional[List[str]] = []


@app.post("/match-jd")
def match_job_description(body: JDMatchRequest):
    """
    Compare extracted resume skills against a job description using the
    trained ML classifier.

    Returns match_score (0-100), recommendation label,
    matched/missing skill lists.
    """
    try:
        result = match_jd(
            resume_skills=body.resume_skills,
            required_skills=body.required_skills,
            nice_to_have=body.nice_to_have_skills,
        )
        return result
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"JD matching failed: {exc}",
        )