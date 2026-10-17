# Signova — A New Way to Connect

> **Indian Sign Language (ISL) Gamified Learning & Accessibility Platform**  
> *"Learn to Sign. Connect Beyond Words."*

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.2+-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-3178C6.svg?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4+-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF.svg?style=flat&logo=clerk&logoColor=white)](https://clerk.com)
[![SQLAlchemy](https://img.shields.io/badge/ORM-SQLAlchemy_2.0-D71F00.svg?style=flat&logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org)
[![License](https://img.shields.io/badge/License-Educational_Open_Standard-indigo.svg)](#license)

---

## 1. Product Overview

**Signova** is a full-stack, gamified educational web application designed to empower hearing and Deaf learners to master authentic **Indian Sign Language (ISL)**. Inspired by the bite-sized delight and motivation of Duolingo, Signova establishes its own visual identity, respectful Deaf community standards, and a curriculum grounded in verified Indian linguistics.

### Key Pillars
- **Strictly Authentic ISL**: Employs authentic two-handed manual fingerspelling and verified Indian vocabulary (*Namaste*, *Dhanyavaad*, *Pita/Father*, *Ek/1, Do/2*). Never silently substitutes ASL or foreign sign languages.
- **Enterprise-Grade Clerk Authentication**: Full Sign In, Sign Up, Email Verification, Session Management, Protected Route Guards, User Profile Management, and Sign Out.
- **Permanent Progress Retention**: Automatically preserves and synchronizes XP, streaks, passed lesson attempts, and bookmarked vocabulary across logins, seamlessly migrating any pre-login guest practice into the permanent Clerk account.
- **Three-Tier Progressive Curriculum**:
  - **Level 1 — Beginner**: ISL foundations, two-handed manual alphabet, numbers, greetings, and family signs.
  - **Level 2 — Intermediate**: Question syntax (Wh-signs at sentence ends), Topic-Comment structure, and non-manual facial markers.
  - **Level 3 — Advanced**: Campus, workplace, healthcare, emergency response, and civic discourse.
- **Spaced Repetition System (SRS)**: Leitner-inspired algorithmic review intervals that double memory intervals on correct recall and prompt reviews for weak areas.
- **Practice Centre & Conversation Lab**: Multi-mode timed quizzes, match-the-pair exercises, and realistic branching dialogue scenarios.
- **Camera Practice & Transparent AI Roadmap**: Side-by-side mirror practice with verified reference demonstrations and honest transparency—no fabricated AI scores.

---

## 2. Technology Stack & Architecture

### Frontend Architecture
- **Framework**: React 19 + TypeScript + Vite 8
- **Authentication**: `@clerk/clerk-react` with dual-mode universal provider (`ClerkAuthProvider.tsx`):
  - **Live Mode**: Directly connects to Clerk Cloud tenant using publishable key.
  - **Sandbox Mode**: Seamless fallback for local development or offline testing when no keys are configured.
- **Styling**: Tailwind CSS with custom brand tokens (Royal Indigo, Berry Pink, Coral Pink, and Sunshine Yellow) and custom 3D tactile button utilities.
- **State & Context**:
  - `ToastContext.tsx`: Micro-interaction toasts for XP awards, streak milestones, and sign bookmarks.
  - `ErrorBoundary.tsx`: Component-level crash isolation with user-friendly recovery.
  - `LoadingSkeleton.tsx`: Shimmer loading skeletons preventing layout shifts.
- **Routing**: React Router v7 with path-based auth routing and protected routes.
- **Testing**: Vitest + React Testing Library + jsdom (100% passing test suite).

### Backend Architecture
- **Framework**: Python 3.11+ FastAPI (clean, modular MVC pattern).
- **Configuration**: Pydantic BaseSettings loading `.env` with validated CORS origins.
- **Database & ORM**: SQLite (`signova.db`) + SQLAlchemy 2.0 with automatic migration columns for Clerk user identity.
- **Middleware**:
  - `auth_middleware.py`: Clerk session JWT verification, user auto-provisioning, and role-based access control (RBAC).
  - `logging_middleware.py`: Structured HTTP request duration and IP logging.
  - `error_handlers.py`: Centralized uniform JSON exception handlers.
- **Controllers & Services**:
  - `auth_controller.py` & `user_service.py`: Clerk user synchronization, profile enrichment via Clerk Secret Key, and guest-to-account progress migration.
  - `curriculum_controller.py` & `curriculum_service.py`: Levels and unit progression.
  - `lesson_controller.py` & `lesson_service.py`: Attempt evaluation, anti-duplicate XP engine, and streak calculations.
  - `signs_controller.py` & `vocabulary_service.py`: Full CRUD for ISL dictionary and bookmarking.
  - `practice_controller.py` & `practice_service.py`: Practice quizzes and question generators.
  - `revision_controller.py` & `revision_service.py`: Leitner spaced repetition review scheduler.
  - `conversation_controller.py` & `conversation_service.py`: Branching scenario simulation.
- **Testing**: Pytest + Starlette TestClient (13 integration tests passing).

---

## 3. Brand Identity & Colour Palette

| Role | Colour Name | Hex Code | Purpose |
|---|---|---|---|
| **Primary** | Royal Indigo | `#4338CA` | Primary buttons, active nav, progress bars, links, headings |
| **Secondary** | Berry Pink | `#BE185D` | Featured lessons, special challenges, secondary actions |
| **Accent** | Coral Pink | `#FB7185` | Celebratory highlights, illustrations, reward badges |
| **Background** | Cloud White | `#F8FAFC` | Main application canvas |
| **Text** | Deep Navy | `#1E293B` | High-contrast readable typography |
| **Gamification** | Sunshine Yellow | `#FBBF24` | XP stars, trophies, fire streaks, achievement accents |
| **Cards** | Soft Rose | `#FFF1F2` | Cultural callout cards and linguistic tips |

---

## 4. Directory Structure

```
signova/
├── backend/
│   ├── app/
│   │   ├── configuration/     # Pydantic settings, SQLite database setup, auto-migrations
│   │   │   ├── settings.py
│   │   │   └── database.py
│   │   ├── controllers/       # HTTP request handlers delegating to domain services
│   │   │   ├── auth_controller.py
│   │   │   ├── curriculum_controller.py
│   │   │   ├── lesson_controller.py
│   │   │   ├── signs_controller.py
│   │   │   ├── practice_controller.py
│   │   │   ├── revision_controller.py
│   │   │   ├── conversation_controller.py
│   │   │   └── profile_controller.py
│   │   ├── middleware/        # Auth, logging, and error handling middleware
│   │   │   ├── auth_middleware.py
│   │   │   ├── logging_middleware.py
│   │   │   └── error_handlers.py
│   │   ├── models/            # SQLAlchemy 2.0 ORM models (User, Level, Lesson, etc.)
│   │   ├── routes/            # FastAPI APIRouters mounted into main.py
│   │   ├── schemas/           # Pydantic request/response validation schemas
│   │   ├── services/          # Pure business logic (SRS, scoring, streak engine)
│   │   │   ├── user_service.py
│   │   │   ├── curriculum_service.py
│   │   │   ├── lesson_service.py
│   │   │   ├── vocabulary_service.py
│   │   │   ├── practice_service.py
│   │   │   ├── revision_service.py
│   │   │   └── conversation_service.py
│   │   ├── utils/             # Loggers and helper functions
│   │   ├── database.py        # Database session dependency
│   │   ├── main.py            # FastAPI application entrypoint with CORS
│   │   └── seed.py            # ISL curriculum seed dataset
│   ├── tests/                 # Pytest automated test suite (13 integration tests)
│   ├── requirements.txt       # Python dependencies
│   └── .env.example           # Backend environment configuration template
├── frontend/
│   ├── public/                # Static assets, SVG geometric logo mark
│   ├── src/
│   │   ├── auth/              # ClerkAuthProvider and ProtectedRoute components
│   │   ├── components/        # Header, Sidebar, SignDemonstration, Badges, Skeletons
│   │   ├── context/           # ToastContext for interactive micro-animations
│   │   ├── layouts/           # AppLayout shell with desktop sidebar & mobile bar
│   │   ├── pages/             # Dashboard, Learn, Lesson, Practice, Revision, Auth
│   │   ├── services/          # Centralized apiClient with dynamic Clerk token injection
│   │   ├── tests/             # Vitest test suite with Clerk mocks
│   │   ├── types/             # TypeScript contracts for backend API
│   │   ├── App.tsx            # Route definitions
│   │   ├── index.css          # Design tokens & micro-animations
│   │   └── main.tsx           # Application entrypoint
│   ├── package.json           # Frontend dependencies & scripts
│   ├── vite.config.ts         # Vite & Vitest configuration
│   ├── tailwind.config.js     # Brand color theme
│   └── .env.example           # Frontend environment configuration template
├── .gitignore                 # Secure ignore rules (secrets, databases, node_modules)
└── README.md                  # Comprehensive documentation
```

---

## 5. Getting Started

### Prerequisites
- **Python 3.10+** (Python 3.11 recommended)
- **Node.js v18+** (v20+ or v22+ recommended)
- **Git**
- **Clerk Account** (Free tier from [dashboard.clerk.com](https://dashboard.clerk.com))

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/Priyanka042601/Signova.git
cd Signova
```

---

### Step 2: Configure Environment Variables

#### 1. Backend Configuration
Create `backend/.env` based on `backend/.env.example`:
```ini
DATABASE_URL=sqlite:///./signova.db
PORT=8000
HOST=0.0.0.0
ENVIRONMENT=development
LOG_LEVEL=INFO
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000

# Clerk Authentication (From https://dashboard.clerk.com -> API Keys)
CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
CLERK_PEM_PUBLIC_KEY=
CLERK_JWKS_URL=https://api.clerk.com/v1/jwks
```

#### 2. Frontend Configuration
Create `frontend/.env` based on `frontend/.env.example`:
```ini
VITE_API_BASE_URL=http://localhost:8000/api
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
```

> **Note**: If `VITE_CLERK_PUBLISHABLE_KEY` is left blank, Signova seamlessly activates **Demo/Sandbox Mode**, enabling local testing with pre-configured guest learners without contacting external services.

---

### Step 3: Backend Setup & Seed

Open a terminal:
```bash
# Optional: Create and activate virtual environment
python -m venv .venv

# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# macOS / Linux:
source .venv/bin/activate

# Install Python requirements
pip install -r backend/requirements.txt

# Seed the database with authentic 3-level ISL curriculum
# Windows:
$env:PYTHONPATH="backend"
python backend/app/seed.py
# macOS / Linux:
PYTHONPATH="backend" python backend/app/seed.py

# Start the FastAPI backend server
# Windows:
python -m uvicorn app.main:app --app-dir backend --reload --port 8000
# macOS / Linux:
uvicorn app.main:app --app-dir backend --reload --port 8000
```

The backend will be live at:
- **API Base**: [http://localhost:8000](http://localhost:8000)
- **Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Step 4: Frontend Setup & Run

Open a second terminal:
```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```

The application is now live at:
- **Web App**: [http://localhost:5173](http://localhost:5173)

---

## 6. Running Tests

### Backend Test Suite (Pytest)
```bash
# Windows:
$env:PYTHONPATH="backend"
python -m pytest backend/tests/test_api.py -v

# macOS / Linux:
PYTHONPATH="backend" pytest backend/tests/test_api.py -v
```
*Result: 13 passed integration tests covering health check, curriculum, lesson evaluation, SRS spaced repetition, profile management, Clerk user synchronization, conversation lab, and vocabulary CRUD.*

### Frontend Test Suite (Vitest)
```bash
cd frontend
npm test
```
*Result: 7 passed component tests covering verification badges, authentic ISL sign demonstrations, responsive sidebar navigation, header streak & XP counters, and Clerk authentication screens.*

### Production Build Validation
```bash
cd frontend
npm run build
```

---

## 7. Key Features & How It Works

### 1. Clerk Authentication & Session Security
- **Sign In & Sign Up**: Full integration with Clerk's `<SignIn />` and `<SignUp />` components.
- **Duplicate Prevention**: If an already registered user attempts to register again, Clerk automatically detects the existing account and routes them directly to Sign In.
- **Progress Migration**: When a user registers or signs in, any XP, streaks, or completed lessons achieved during guest mode are permanently merged and attached to their Clerk account (`user_id`).
- **Profile Customization**: Learners can update display names, avatar expressions, and daily learning goals directly in the Profile page.

### 2. Spaced Repetition (SRS) Leitner Engine
- Every vocabulary item answered during lessons enters the learner's personal review deck.
- **Correct Recall**: Review interval doubles (e.g. 1 day → 2 days → 4 days → 8 days) and mastery score increments by +15%.
- **Incorrect Recall**: Interval resets to 1 day for immediate reinforcement, and mastery score decrements by -10%.
- Real-time indicator in the Header alerts learners when reviews are due.

### 3. ISL Visual Dictionary & Verification Badging
- Filter authentic signs by categories (Greetings, Family, Numbers, Questions, Education, Workplace).
- Every demonstration includes:
  - **Handshape Classification** (e.g., *Two-handed flat B palms pressed inward*).
  - **Movement Path Description**.
  - **Non-Manual Markers** (facial expressions, eyebrow states, head tilts).
  - **Verification Status**: `Verified ISL Sign`, `Pending ISL Review`, or `Placeholder`.
  - **Reviewer Reference**: Certified Master Trainer attribution.
- Learners can toggle any sign as a **Favourite** for quick revision.

---

## 8. Verified ISL Content Integrity

Signova adheres to strict linguistic guidelines for Indian Sign Language authenticity:
1. **Never Invent Gestures**: Every sign includes explicit attribution, licensing, and reviewer status.
2. **Community Grounded**: Built to reflect ISLRTC (Indian Sign Language Research and Training Centre) standards and Deaf community usage across India.
3. **Transparent Non-Manual Signals**: Explicitly teaches that ISL grammar relies on eyebrow position (raised for Yes/No questions, furrowed for Wh-questions), head nods, and mouthing.

---

## 9. Contributing

We welcome contributions from Deaf educators, ISL certified interpreters, linguists, and developers!

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingSignovaFeature`).
3. Commit your Changes (`git commit -m 'feat: Add new ISL verified category'`).
4. Push to the Branch (`git push origin feature/AmazingSignovaFeature`).
5. Open a Pull Request.

---

## 10. License

Distributed under the **Educational Open Standard & Cultural Heritage Fair Use** license. Dedicated to advancing Indian Sign Language accessibility and inclusion.
