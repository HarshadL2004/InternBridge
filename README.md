# 🌉 InternBridge

> **Bridging students with the right internships — powered by AI.**

InternBridge is a full-stack internship platform that connects **students**, **companies**, and **colleges** in a single unified ecosystem. It features role-based dashboards, external internship aggregation, and an ML-powered **ATS Resume Analyzer** that scores and grades resumes against real-world job criteria.

---

## 🚀 Live Demo

| Service | URL |
|---|---|
| 🌐 Frontend | *(Deployed on Vercel / Netlify)* |
| ⚙️ Backend API | [https://internbridge-backend-098c.onrender.com](https://internbridge-backend-098c.onrender.com) |
| 🤖 AI Service | *(FastAPI — Python)* |

---

## ✨ Features

### 👨‍🎓 Student
- Browse and search internships (local + external via The Muse API)
- Apply to internships with one click
- View applied internships history
- Upload resume for **ATS scoring** (ML-powered grade & suggestions)
- Access personal dashboard with resume analysis history

### 🏢 Company
- Post, edit, and delete internship listings
- Manage company profile
- View applicants per listing

### 🎓 College
- View platform-wide statistics (students, companies, applications)
- Monitor student activity and placement metrics
- ATS grade distribution charts

### 🤖 AI Resume Analyzer
- ML-powered ATS scoring (GradientBoosting model)
- Skill extraction using **spaCy NLP**
- Resume completeness report
- Job description (JD) matching with match score
- Actionable improvement suggestions

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI Framework |
| **Vite** | Build Tool & Dev Server |
| **React Router DOM v7** | Client-side Routing |
| **TailwindCSS v4** + **DaisyUI** | Styling & UI Components |
| **Chart.js** + **react-chartjs-2** | Data Visualization |
| **TanStack Query (React Query)** | Server State Management |
| **Axios** | HTTP Client |
| **SweetAlert2** | Beautiful Alerts & Modals |
| **React Icons** | Icon Library |

### Backend (Node.js)
| Technology | Purpose |
|---|---|
| **Express.js v5** | REST API Framework |
| **MongoDB** (Atlas) | Database |
| **Multer** | File Upload Handling (Resume PDFs) |
| **Axios** | Proxy calls to AI service |
| **CORS** | Cross-Origin Resource Sharing |
| **dotenv** | Environment Configuration |

### AI Service (Python)
| Technology | Purpose |
|---|---|
| **FastAPI** | High-performance API framework |
| **Uvicorn** | ASGI server |
| **spaCy** | NLP — Skill & entity extraction |
| **PyMuPDF (fitz)** | PDF text parsing |
| **scikit-learn** | GradientBoosting ATS scoring model |
| **Pydantic** | Request/Response validation |
| **NumPy** | Numerical processing |

---

## 📁 Folder Structure

```
internbridge/
├── 📂 frontend/                    # React + Vite Frontend
│   ├── index.html                  # HTML entry point
│   ├── vite.config.js              # Vite configuration
│   ├── tailwind.config.js          # TailwindCSS configuration
│   ├── postcss.config.js           # PostCSS configuration
│   ├── package.json                # Frontend dependencies
│   └── src/
│       ├── main.jsx                # App entry — Router & Providers setup
│       ├── index.css               # Global styles & design tokens
│       ├── api/
│       │   └── api.js              # Axios instance + API helper functions
│       ├── config/
│       │   └── AuthProvider.jsx    # Auth context & state management
│       ├── utils/
│       │   └── chartConfig.js      # Chart.js reusable chart configurations
│       └── components/
│           ├── Root.jsx            # Root layout (Nav + Outlet + Footer)
│           ├── Nav.jsx             # Navigation bar (role-aware, glassmorphism)
│           ├── Home.jsx            # Landing page with internship listings
│           ├── Login.jsx           # Login page
│           ├── Signup.jsx          # Registration page (Student/Company/College)
│           ├── JobDetails.jsx      # Internship detail view + Apply button
│           ├── AddJob.jsx          # Company — Post a new internship
│           ├── StudentPage.jsx     # Student dashboard (applied jobs, profile)
│           ├── CompanyPage.jsx     # Company dashboard (manage listings)
│           ├── CollegePage.jsx     # College dashboard (stats & charts)
│           ├── Dashboard.jsx       # ATS Resume Analyzer dashboard
│           ├── Footer.jsx          # Site-wide footer
│           └── shared/
│               └── UserPrivate.jsx # Protected route wrapper
│
├── 📂 backend/                     # Node.js + Express REST API
│   ├── index.js                    # Main server entry — all core routes
│   ├── package.json                # Backend dependencies
│   ├── .env                        # Environment variables (not committed)
│   ├── .gitignore
│   ├── models/
│   │   └── Resume.js               # Mongoose/MongoDB Resume schema
│   ├── routes/
│   │   └── resumeRoutes.js         # ATS Resume upload & history routes
│   └── uploads/                    # Temporary resume PDF storage
│
└── 📂 ai-service/                  # Python FastAPI ML Service
    ├── app.py                      # FastAPI entry point — /analyze, /match-jd
    ├── requirements.txt            # Python dependencies
    └── models/
        └── resume_model.py         # ML model — ATS scoring & JD matching logic
```

---

## 🔌 API Reference

### Backend (Node.js) — `https://internbridge-backend-098c.onrender.com`

#### Auth & Users
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/add_user` | Register a new user |
| `POST` | `/login` | Authenticate a user |
| `GET` | `/users` | Get all users |

#### Internships
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/internships` | Get all internships |
| `GET` | `/internships/search?title=` | Search internships by title/role |
| `GET` | `/internships/company/:email` | Get internships by company email |
| `GET` | `/internship/:id` | Get single internship details |
| `POST` | `/add_internship` | Post a new internship |
| `PUT` | `/internship/:id` | Update internship details |
| `DELETE` | `/internship/:id` | Delete an internship |

#### Applications
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/apply_internship` | Apply to an internship |
| `GET` | `/applications/student/:email` | Get all applications by student |

#### College
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/college/stats` | Get platform-wide statistics |

#### ATS Resume
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/resume/upload` | Upload & analyze a resume PDF |
| `GET` | `/api/resume/history` | Get user's resume analysis history |
| `GET` | `/api/resume/:id` | Get a specific resume analysis |
| `DELETE` | `/api/resume/:id` | Delete a resume analysis |

### AI Service (Python FastAPI)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `POST` | `/analyze` | Analyze resume PDF — returns ATS score, grade, skills |
| `POST` | `/match-jd` | Match resume skills against a job description |

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
PORT=5001
DB_USER=your_mongodb_username
DB_PASS=your_mongodb_password
AI_SERVICE_URL=http://localhost:8000
```

---

## 🏃 Getting Started

### Prerequisites
- **Node.js** v18+
- **Python** 3.9+
- **MongoDB Atlas** account
- **npm** or **yarn**

---

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/HarshadL2004/InternBridge.git
cd internbridge
```

---

### 2️⃣ Start the AI Service
```bash
cd ai-service

# Create a virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Download spaCy language model
python -m spacy download en_core_web_sm

# Run the FastAPI server
uvicorn app:app --reload --port 8000
```
> AI Service runs at: `http://localhost:8000`

---

### 3️⃣ Start the Backend
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Fill in DB_USER, DB_PASS, AI_SERVICE_URL

# Run the server
node index.js
```
> Backend runs at: `http://localhost:5001`

---

### 4️⃣ Start the Frontend
```bash
cd frontend

# Install dependencies
npm install

# Run the dev server
npm run dev
```
> Frontend runs at: `http://localhost:5173`

---

## 🏗️ Architecture Overview

```
                    ┌─────────────────────┐
                    │   React Frontend     │
                    │  (Vite + TailwindCSS)│
                    └──────────┬──────────┘
                               │ HTTP / REST
                    ┌──────────▼──────────┐
                    │   Express Backend    │
                    │  (Node.js + MongoDB) │
                    └──────┬──────┬───────┘
                           │      │
              ┌────────────▼──┐ ┌─▼──────────────────┐
              │  MongoDB Atlas│ │  FastAPI AI Service  │
              │  (Database)   │ │  (Python + spaCy +  │
              └───────────────┘ │   scikit-learn)      │
                                └──────────────────────┘
```

---

## 👥 User Roles

| Role | Access |
|---|---|
| **Student** | Browse internships, apply, ATS resume analysis |
| **Company** | Post & manage internships, view applicants |
| **College** | View statistics, monitor student placements |

---

## 📦 Deployment

| Service | Platform |
|---|---|
| Frontend | Vercel / Netlify |
| Backend | Render |
| AI Service | Render / Railway |
| Database | MongoDB Atlas |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Built with ❤️ by the InternBridge Team</p>
  <p><em>Bridging Students with Opportunities</em></p>
</div>
