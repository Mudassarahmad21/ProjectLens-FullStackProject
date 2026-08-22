# 🏥 PatientLens

**Explore structured patient journeys with evidence you can verify.**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-18.x-blue)](https://reactjs.org/)
[![Status](https://img.shields.io/badge/Status-Research%20Prototype-orange)](https://github.com)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [The Problem We Solve](#-the-problem-we-solve)
- [Our Solution](#-our-solution)
- [Key Features](#-key-features)
- [Project Flow](#-project-flow)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Dataset](#-dataset)
- [Installation & Setup](#-installation--setup)
- [Running the Application](#-running-the-application)
- [API Endpoints](#-api-endpoints)
- [Evaluation](#-evaluation)
- [Safety & Abstention](#-safety--abstention)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

---

## 📖 Overview

**PatientLens** is a research prototype that transforms fragmented, relational hospital data into an interactive, evidence-based patient journey visualization. Built for clinical-data researchers, educators, and healthcare data teams, PatientLens enables natural-language exploration of patient records while maintaining **full transparency and source provenance**.

### ⚠️ Important Notice

🚨 This is a RESEARCH PROTOTYPE and is NOT for clinical use.
🚨 It does NOT provide diagnosis, treatment recommendations, triage, or emergency guidance.
🚨 Always consult qualified healthcare professionals for medical decisions.

text

---

## 🎯 The Problem We Solve

### The Challenge

Healthcare data is scattered across multiple relational tables:

┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Patients │ │ Admissions │ │ Labs │ │ Medications │
│ subject_id │ │ hadm_id │ │ itemid │ │ pharmacy_id │
│ gender │ │ subject_id │ │ subject_id │ │ hadm_id │
│ anchor_age │ │ admittime │ │ hadm_id │ │ drug │
└─────────────┘ └─────────────┘ │ charttime │ │ starttime │
│ valuenum │ └─────────────┘
└─────────────┘

**This creates several critical problems:**

| Problem | Impact |
|---------|--------|
| **Fragmented Data** | Patient journeys are scattered across 8+ tables |
| **Complex Queries** | Researchers write complex SQL just to see a timeline |
| **No Provenance** | Can't trace answers back to source records |
| **Time-Consuming** | Manual data exploration takes hours or days |
| **Verification Gap** | No easy way to validate findings |

### Real-World Scenario

A researcher wants to answer: *"What labs were recorded before ICU admission?"*

**Traditional approach:**
1. Find patient ID in `patients` table
2. Find admissions in `admissions` table
3. Find ICU stay in `transfers` table
4. Find labs in `labevents` table
5. Filter by date
6. Join results
7. Verify data quality
8. Document findings

**Time required: 30-60 minutes per patient**

**PatientLens approach:**
1. Type: *"What labs were recorded before ICU admission?"*
2. Get answer with evidence and provenance

**Time required: 5 seconds**

---

## 💡 Our Solution

PatientLens solves these challenges through four core innovations:

### 1. Unified Timeline Engine

Raw MIMIC data is normalized into a single `timelineEvents` collection:

Raw Tables → Normalization → Timeline Events
↓
┌──────────────────────────┐
│ Admission │
│ Lab: Sodium 140 mmol/L │
│ Medication: Aspirin │
│ Transfer to ICU │
│ Procedure: CT Scan │
└──────────────────────────┘

text

### 2. Evidence-Grounded AI
User Question
↓
Intent Parser (LLM)
↓
Structured Query
↓
MongoDB Retrieval
↓
Evidence Validation
↓
Answer Generation (LLM)
↓
Answer + Evidence + Provenance

text

### 3. Full Provenance

Every claim traces back to source:
Answer: "Three laboratory measurements were recorded."
↓
Evidence: labevents | row: 12345 | field: valuenum
↓
Source: MIMIC-IV table 'labevents', row ID 12345

text

### 4. Safety First

Multi-layer safety system:
User Question
↓
Input Validator
↓
Clinical? → REJECT
↓
Notes? → ABSTAIN
↓
Supported? → RETRIEVE
↓
Evidence exists? → ANSWER
↓
No evidence? → ABSTAIN


---

## ✨ Key Features

### 🔍 Patient Journey Timeline
- Chronological visualization of all patient events
- Filter by event type (Labs, Medications, Procedures, Transfers, Diagnoses, ICU)
- Expandable event details with full source provenance
- Real-time event filtering

### 🤖 Evidence-Grounded AI
- Natural-language question answering
- Controlled intent extraction (no arbitrary queries)
- Answers generated ONLY from retrieved evidence
- Clear abstention when evidence is unavailable
- Confidence scores for every answer

### 🔒 Safety & Transparency
- Rejects clinical/medical advice requests
- Abstains from unsupported data (notes, free text, missing data)
- Full source provenance for every claim
- "Research Prototype — Not for Clinical Use" banner
- Deterministic safety rules (not LLM-dependent)

### 📊 Evaluation Dashboard
- Fact accuracy metrics
- Temporal accuracy metrics
- Provenance coverage metrics
- Abstention accuracy metrics
- AI vs Baseline comparison
- Interactive charts and tables

### 🔐 Authentication
- Secure JWT-based authentication
- User registration and login
- Protected API routes
- Session management

---

## 🔄 Project Flow

### User Journey

```mermaid
graph TD
    A[User] --> B[Login/Register]
    B --> C[Dashboard]
    C --> D[Select Patient]
    D --> E[Select Admission]
    E --> F[View Timeline]
    E --> G[Ask AI Query]
    G --> H[Get Answer with Evidence]
    F --> I[View Source Provenance]
    I --> J[Verify Data]

    graph LR
    A[MIMIC CSV] --> B[Import Scripts]
    B --> C[MongoDB Collections]
    C --> D[Timeline Builder]
    D --> E[Timeline Events]
    E --> F[React Frontend]
    F --> G[User Interaction]
    G --> H[AI Query]
    H --> I[Evidence Retrieval]
    I --> J[Answer Generation]

    graph TD
    A[User Question] --> B[Safety Check]
    B --> C{Supported?}
    C -->|Yes| D[Intent Parser]
    C -->|No| E[Abstain/Reject]
    D --> F[Structured Query]
    F --> G[MongoDB Query]
    G --> H[Retrieved Evidence]
    H --> I{Evidence exists?}
    I -->|Yes| J[Answer Generator]
    I -->|No| K[Abstain]
    J --> L[Answer + Evidence + Provenance]

 🛠 Technology Stack

Frontend
Technology	Purpose	Version
React	UI Framework	18.x
Vite	Build Tool	5.x
Tailwind CSS	Styling	3.x
React Router	Navigation	6.x
Axios	API Calls	1.x
Lucide React	Icons	0.294.x
Recharts	Charts	2.x

Backend
Technology	Purpose	Version
Node.js	Runtime	18.x
Express.js	API Framework	5.x
MongoDB	Database	6.x
Mongoose	ODM	8.x
Groq SDK	LLM Integration	1.x
CSV Parser	Data Ingestion	7.x
bcryptjs	Password Hashing	2.x
jsonwebtoken	Auth Tokens	9.x
Testing & Evaluation
Tool	Purpose
Custom Evaluation Framework	Fact accuracy, temporal accuracy, provenance, abstention
Hallucination Tests	Adversarial testing
Baseline Comparison	Keyword matching vs AI


🏗 Architecture
Data Ingestion Pipeline
text
MIMIC-IV Demo v2.2 (CSV)
    ↓
importPatients.js
importAdmissions.js
importTransfers.js
importLabs.js
importMedications.js
importProcedures.js
importDiagnoses.js
    ↓
MongoDB Collections
    ├── patients
    ├── admissions
    ├── transfers
    ├── labs
    ├── medications
    ├── procedures
    └── diagnoses
    ↓
buildTimeline.js
    ↓
timelineEvents Collection
    └── Normalized, chronological events with provenance


    AI Pipeline
text
User Question
    ↓
Input Validator & Safety Check
    ├── Clinical detection → REJECT
    ├── Notes detection → ABSTAIN
    └── Missing data detection → ABSTAIN
    ↓
Supported Intent?
    ↓
Intent Parser (LLM)
    ↓
Structured Query
    ↓
MongoDB Query
    ↓
Evidence Validator
    ↓
Answer Generator (LLM)
    ↓
Answer + Evidence + Provenance
API Architecture
text
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                       │
│   Dashboard | PatientView | Evaluation | Login/Register│
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    Express Backend                      │
│                                                         │
│   /api/auth        → Auth routes                       │
│   /api/patients    → Patient routes                     │
│   /api/admissions  → Admission routes                   │
│   /api/timeline    → Timeline routes                    │
│   /api/evidence    → Evidence routes                    │
│   /api/query       → AI query routes                   │
│   /api/evaluation  → Evaluation routes                  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                      MongoDB                            │
│   Collections: patients, admissions, timelineEvents...  │
└─────────────────────────────────────────────────────────┘


📊 Dataset
PatientLens uses the MIMIC-IV Clinical Database Demo v2.2.

Dataset Statistics
Feature	Count
Patients	100
Admissions	275
Lab Events	~107,000
Medications	~18,000
Procedures	722
Diagnoses	4,506
ICU Events	~50,000+
Data Access
Access requires:

CITI Program training completion

Signed data use agreement

Credentialed access to PhysioNet

License
MIMIC-IV is licensed under the ODC Open Database License (ODbL).

🔧 Installation & Setup
Prerequisites
Node.js (v18 or higher)

npm (v9 or higher)

MongoDB (v6 or higher) or MongoDB Atlas account

Git (for cloning)

Quick Start
bash
# 1. Clone the repository
git clone https://github.com/your-username/patientlens.git
cd patientlens

# 2. Install dependencies
npm install
cd server && npm install
cd ../client && npm install
cd ..

# 3. Set up environment variables
cd server
cp .env.example .env
# Edit .env with your MongoDB URI and API keys

# 4. Set up MongoDB (local or Atlas)
# For local MongoDB:
brew services start mongodb-community  # Mac
sudo systemctl start mongodb           # Linux

# 5. Download MIMIC-IV Demo dataset
# Visit: https://physionet.org/content/mimic-iv-demo/2.2/
# Complete CITI training and download CSV files
# Extract to: data/mimic-iv-clinical-database-demo-2.2/

# 6. Import data
cd server
npm run import:all

# 7. Build timeline
node scripts/buildTimeline.js

# 8. Start the application
cd ..
npm run dev
Detailed Setup Steps
Step 1: Clone Repository
bash
git clone https://github.com/your-username/patientlens.git
cd patientlens
Step 2: Install Dependencies
bash
# Root dependencies (includes concurrently)
npm install

# Server dependencies
cd server
npm install

# Client dependencies
cd ../client
npm install

# Return to root
cd ..
Step 3: Configure Environment
bash
cd server
cp .env.example .env
Edit server/.env:

env
# Server Configuration
PORT=5000

# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/patientlens

# AI Configuration (Groq API Key)
AI_API_KEY=your_groq_api_key_here
AI_MODEL=mixtral-8x7b-32768

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d

# Data Directory
MIMIC_DIR=./data/mimic-iv-clinical-database-demo-2.2

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
Step 4: Set Up MongoDB
Option A: Local MongoDB

bash
# Mac
brew install mongodb-community
brew services start mongodb-community

# Ubuntu
sudo apt install mongodb
sudo systemctl start mongodb

# Windows
# Download from https://www.mongodb.com/try/download/community
Option B: MongoDB Atlas (Cloud)

Create account at https://www.mongodb.com/atlas

Create a cluster

Get connection string

Update MONGO_URI in .env

Step 5: Download Dataset
Visit: https://physionet.org/content/mimic-iv-demo/2.2/

Complete required CITI training

Sign data use agreement

Download CSV files

Extract to data/mimic-iv-clinical-database-demo-2.2/

Expected structure:

text
data/
└── mimic-iv-clinical-database-demo-2.2/
    ├── hosp/
    │   ├── patients.csv.gz
    │   ├── admissions.csv.gz
    │   ├── transfers.csv.gz
    │   ├── labevents.csv.gz
    │   ├── prescriptions.csv.gz
    │   ├── procedures_icd.csv.gz
    │   └── diagnoses_icd.csv.gz
    └── icu/
        ├── chartevents.csv.gz
        ├── icustays.csv.gz
        └── d_items.csv.gz
Step 6: Import Data
bash
cd server

# Import all data (recommended)
npm run import:all

# Or import individually
npm run import:patients
npm run import:admissions
npm run import:transfers
npm run import:labs
npm run import:medications
npm run import:procedures
npm run import:diagnoses
Step 7: Build Timeline
bash
cd server
node scripts/buildTimeline.js
Step 8: Import Evaluation Results (Optional)
bash
cd server
npm run import:evaluation
▶️ Running the Application
Development Mode
bash
# From root directory - starts both client and server
npm run dev

# Or separately:
# Terminal 1: Server
cd server
npm run dev

# Terminal 2: Client
cd client
npm run dev
Access:

Frontend: http://localhost:5173

Backend: http://localhost:5000

API Health: http://localhost:5000/api/health

Production Build
bash
# Build frontend
cd client
npm run build

# Start production server
cd ../server
npm start
🔌 API Endpoints
Authentication
Method	Endpoint	Description	Auth
POST	/api/auth/register	Register user	Public
POST	/api/auth/login	Login user	Public
GET	/api/auth/me	Get current user	Private
PUT	/api/auth/profile	Update profile	Private
PUT	/api/auth/change-password	Change password	Private
POST	/api/auth/logout	Logout	Private
Patients
Method	Endpoint	Description	Auth
GET	/api/patients	List all patients	Private
GET	/api/patients/:subjectId	Get patient by ID	Private
GET	/api/patients/:subjectId/admissions	Get patient's admissions	Private
Admissions
Method	Endpoint	Description	Auth
GET	/api/admissions	List admissions	Private
GET	/api/admissions/:hadmId	Get admission details	Private
Timeline
Method	Endpoint	Description	Auth
GET	/api/admissions/:hadmId/timeline	Get patient timeline	Private
GET	/api/timeline/event-types	List event types	Private
Evidence
Method	Endpoint	Description	Auth
GET	/api/evidence/:eventId	Get source evidence	Private
AI Query
Method	Endpoint	Description	Auth
POST	/api/query	Natural language query with answer	Private
Evaluation
Method	Endpoint	Description	Auth
GET	/api/evaluation/results	Get evaluation results	Private
GET	/api/evaluation/summary	Get evaluation summary	Private
🧪 Evaluation & Testing
Run AI Baseline Comparison
bash
cd server
npm run evaluate
Run Hallucination Tests
bash
# From root
npm run test:hallucination
Run Safety Tests
bash
cd server
node testSafety.js
Check Data Quality
bash
cd server
node scripts/checkDataQuality.js
Import Evaluation Results to MongoDB
bash
cd server
npm run import:evaluation
🛡 Safety & Abstention
Safety Categories
Category	Action	Example
Clinical Advice	REJECT	"What is the diagnosis?"
Treatment Recommendations	REJECT	"What treatment should be given?"
Notes/Free Text	ABSTAIN	"What do the clinical notes say?"
Missing Data	ABSTAIN	"Tell me about lifestyle factors"
Unsupported Scope	ABSTAIN	"What is the definition of diabetes?"
Supported Query	ALLOW	"What medications were prescribed?"
Safety Flow
text
User Question
     │
     ▼
┌────────────────────────────────┐
│    Input Validator & Safety    │
│  - Clinical detection (REJECT) │
│  - Notes detection (ABSTAIN)   │
│  - Missing data detection      │
└────────────────────────────────┘
     │                    │
     ▼                    ▼
  Supported?           Unsupported?
     │                    │
     ▼                    ▼
┌─────────────────┐  ┌─────────────────┐
│  Intent Parser  │  │    ABSTAIN      │
│  (LLM-assisted) │  │  or REJECT      │
└─────────────────┘  └─────────────────┘
     │
     ▼
┌────────────────────────────────┐
│    Structured Query Builder    │
│  - intent: LAB_RESULTS         │
│  - temporal: BEFORE            │
│  - reference: ICU_ADMISSION    │
└────────────────────────────────┘
     │
     ▼
┌────────────────────────────────┐
│         MongoDB Query          │
│  - Retrieve records            │
│  - Validate hadmId             │
└────────────────────────────────┘
     │
     ▼
┌────────────────────────────────┐
│    Evidence Validator          │
│  - Evidence exists?            │
│  - YES → Answer                │
│  - NO → ABSTAIN                │
└────────────────────────────────┘
     │
     ▼
┌────────────────────────────────┐
│    Answer Generator (LLM)      │
│  - Answer ONLY from evidence   │
│  - Add provenance              │
└────────────────────────────────┘
     │
     ▼
┌────────────────────────────────┐
│  Answer + Evidence + Provenance│
└────────────────────────────────┘

📁 Project Structure
text
patientlens/
├── client/                              # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Navbar.jsx          # Navigation bar
│   │   │   │   └── Footer.jsx          # Footer component
│   │   │   ├── AdmissionSelector.jsx   # Admission selection
│   │   │   ├── AIResponse.jsx          # AI response display
│   │   │   ├── EventFilters.jsx        # Timeline filters
│   │   │   ├── EvidencePanel.jsx       # Evidence modal
│   │   │   ├── PatientHeader.jsx       # Patient info header
│   │   │   ├── PatientSelector.jsx     # Patient search
│   │   │   ├── QueryBox.jsx            # AI query input
│   │   │   ├── SafetyBanner.jsx        # Safety warnings
│   │   │   ├── SourceRecord.jsx        # Source record viewer
│   │   │   ├── Timeline.jsx            # Timeline component
│   │   │   └── TimelineEvent.jsx       # Individual event
│   │   ├── context/
│   │   │   └── AuthContext.jsx         # Authentication context
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx           # Main dashboard
│   │   │   ├── PatientView.jsx         # Patient timeline view
│   │   │   ├── Evaluation.jsx          # Evaluation dashboard
│   │   │   ├── Login.jsx               # Login page
│   │   │   └── Register.jsx            # Registration page
│   │   ├── services/
│   │   │   └── api.js                  # API client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                              # Node.js Backend
│   ├── config/
│   │   ├── db.js                       # MongoDB connection
│   │   └── ai.js                       # LLM configuration
│   ├── models/
│   │   ├── User.js                     # User model
│   │   ├── Patient.js                  # Patient model
│   │   ├── Admission.js                # Admission model
│   │   ├── Transfer.js                 # Transfer model
│   │   ├── Lab.js                      # Lab model
│   │   ├── Medication.js               # Medication model
│   │   ├── Procedure.js                # Procedure model
│   │   ├── Diagnosis.js                # Diagnosis model
│   │   ├── TimelineEvent.js            # Timeline event model
│   │   └── EvaluationResult.js         # Evaluation results model
│   ├── controllers/
│   │   ├── authController.js           # Auth controller
│   │   ├── patientController.js        # Patient controller
│   │   ├── admissionController.js      # Admission controller
│   │   ├── timelineController.js       # Timeline controller
│   │   ├── evidenceController.js       # Evidence controller
│   │   ├── queryController.js          # AI query controller
│   │   └── evaluationController.js     # Evaluation controller
│   ├── services/
│   │   ├── safetyService.js            # Safety & abstention
│   │   ├── intentService.js            # Intent handling
│   │   ├── intentParserService.js      # LLM intent parsing
│   │   ├── retrievalService.js         # Data retrieval
│   │   ├── evidenceService.js          # Evidence validation
│   │   ├── answerService.js            # Answer generation
│   │   └── timelineService.js          # Timeline building
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── patientRoutes.js
│   │   ├── admissionRoutes.js
│   │   ├── timelineRoutes.js
│   │   ├── evidenceRoutes.js
│   │   ├── queryRoutes.js
│   │   └── evaluationRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js           # JWT authentication
│   │   └── errorMiddleware.js          # Error handling
│   ├── scripts/
│   │   ├── importPatients.js
│   │   ├── importAdmissions.js
│   │   ├── importTransfers.js
│   │   ├── importLabs.js
│   │   ├── importMedications.js
│   │   ├── importProcedures.js
│   │   ├── importDiagnoses.js
│   │   ├── buildTimeline.js
│   │   ├── importEvaluationResults.js
│   │   ├── checkDataQuality.js
│   │   └── lib/
│   │       └── csv.js                  # CSV utilities
│   ├── utils/
│   │   └── jwt.js                      # JWT utilities
│   ├── evaluation/
│   │   ├── questions.json              # Test questions
│   │   ├── groundTruth.json            # Expected answers
│   │   ├── metrics.js                  # Evaluation metrics
│   │   ├── runEvaluation.js            # Evaluation runner
│   │   ├── hallucinationTests.js       # Hallucination testing
│   │   └── results.json                # Generated results
│   ├── docs/
│   │   ├── architecture.md
│   │   ├── data-dictionary.md
│   │   ├── evaluation.md
│   │   ├── safety.md
│   │   └── error-analysis.md
│   ├── package.json
│   ├── server.js
│   └── .env.example
│
├── data/                                # Dataset (not committed)
│   ├── README.md
│   └── mimic-iv-clinical-database-demo-2.2/
│       ├── hosp/
│       └── icu/
│
├── package.json                         # Root package.json
├── .gitignore
├── vercel.json                          # Vercel deployment config
└── README.md                            # This file
🚀 Deployment
Deploy Backend to Vercel
Create vercel.json in root:

json
{
  "version": 2,
  "builds": [
    {
      "src": "server/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/server.js"
    }
  ],
  "env": {
    "MONGO_URI": "@mongo_uri",
    "AI_API_KEY": "@ai_api_key",
    "JWT_SECRET": "@jwt_secret",
    "FRONTEND_URL": "@frontend_url"
  }
}
Deploy:

bash
vercel --prod
Deploy Frontend to Cloudflare Pages
Build the frontend:

bash
cd client
npm run build
Deploy to Cloudflare Pages:

Connect your GitHub repository

Set build command: npm run build

Set output directory: dist

Set environment variables:

VITE_API_URL: Your Vercel backend URL

🤝 Contributing
Development Workflow
Fork the repository

Create a feature branch:

bash
git checkout -b feature/your-feature
Make changes

Test locally:

bash
npm run dev
Commit changes:

bash
git commit -m "Add: your feature description"
Push and create PR:

bash
git push origin feature/your-feature
Code Style
Frontend: ESLint + Prettier

Backend: ES Modules (import/export)

Commit messages: Conventional commits

📄 License
MIT License - See LICENSE file for details.

Dataset License
The MIMIC-IV dataset is licensed under the ODC Open Database License (ODbL). You must comply with its terms when using this dataset.

🙏 Acknowledgments
MIMIC-IV Team - For providing the dataset

PhysioNet - For hosting the data

Groq - For LLM API access

Citation
If you use PatientLens in your research, please cite:

bibtex
@misc{patientlens2026,
  title={PatientLens: Explore structured patient journeys with evidence you can verify},
  author={PatientLens Team},
  year={2026},
  howpublished={\url{https://github.com/Mudassarahmad21}}
}
Dataset citation:

bibtex
@article{mimicivdemo,
  author = {Johnson, Alistair EW and others},
  title = {MIMIC-IV Clinical Database Demo v2.2},
  year = {2023},
  publisher = {PhysioNet},
  doi = {10.13026/dp1f-ex47}
}
⚠️ Disclaimer
PatientLens is a research prototype only.

❌ NOT for clinical decision-making

❌ NOT a substitute for professional medical advice

❌ NOT approved for patient care

✅ For research and educational purposes only

Always consult qualified healthcare professionals for medical decisions.

📞 Support
GitHub Issues: https://github.com/Mudassarahmad21
Phone No: +923049750253
Email: mlkmud56@gmail.com

📈 Project Status
Component	Status
Data Ingestion	✅ Complete
Timeline Engine	✅ Complete
Frontend	✅ Complete
AI Query	✅ Complete
Safety System	✅ Complete
Authentication	✅ Complete
Evaluation	✅ Complete
Documentation	✅ Complete
Deployment	✅ Complete

🎯 Future Roadmap
□ Real-time ICU monitoring
□ Patient similarity search
□ Exportable reports (PDF)
□ Multi-patient cohort analysis
□ Explainable AI
□ Full MIMIC-IV support (notes, X-rays, ECG)
□ Mobile app
□ Federated learning
Built with ❤️by Malik Mudassar& Malik Muzammil for healthcare research

PatientLens: Explore structured patient journeys with evidence you can verify.