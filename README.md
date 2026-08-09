# PatientLens

> A research prototype for exploring and evaluating patient data. **Not for clinical use.**

---

> ⚠️ **Disclaimer**
> PatientLens is a research prototype intended for experimentation and evaluation only.
> It is **not a medical device** and must **not** be used to inform clinical decisions,
> diagnosis, or treatment. Do not enter real, identifiable patient data unless your
> environment is approved for it.

---

## Overview

PatientLens is a web application for visualizing patient data and evaluating model
or analysis outputs against it. It ships with two primary views:

- **Dashboard** — the main landing view for patient data and summaries.
- **Evaluation** — tools for reviewing and scoring outputs.

## Features

- Clean, responsive UI built with React and Tailwind CSS
- Client-side routing via React Router
- Dashboard and Evaluation workflows
- Persistent "Not for Clinical Use" safety indicators throughout the interface

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React, React Router, Tailwind CSS, lucide-react |
| Build tool | Vite |
| Backend*   | Node.js / Express |
| Language   | JavaScript (JSX) |



## Project Structure

```
patientlens/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Navbar bar
│   │   │   ├── Footer.jsx           # Footer component
│   │   │   ├── SafetyBanner.jsx     # Safety warning
│   │   │   ├── PatientSelector.jsx  # Patient search
│   │   │   ├── AdmissionSelector.jsx # Admission selection
│   │   │   ├── Timeline.jsx         # Timeline display
│   │   │   ├── TimelineEvent.jsx    # Individual event
│   │   │   ├── EventFilters.jsx     # Event type filters
│   │   │   ├── QueryBox.jsx         # AI query input
│   │   │   ├── AIResponse.jsx       # AI response display
│   │   │   ├── EvidencePanel.jsx    # Source evidence
│   │   │   ├── SourceRecord.jsx     # Raw record viewer
│   │   │   └── PatientHeader.jsx    # Patient info
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx        # Main dashboard
│   │   │   ├── PatientView.jsx      # Patient timeline
│   │   │   └── Evaluation.jsx       # Evaluation dashboard
│   │   ├── services/
│   │   │   └── api.js               # API client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                          # Node.js Backend
│   ├── config/
│   │   ├── db.js                    # MongoDB connection
│   │   └── ai.js                    # LLM configuration
│   ├── models/
│   │   ├── Patient.js
│   │   ├── Admission.js
│   │   ├── Transfer.js
│   │   ├── Lab.js
│   │   ├── Medication.js
│   │   ├── Procedure.js
│   │   ├── Diagnosis.js
│   │   ├── ICUEvent.js
│   │   └── TimelineEvent.js
│   ├── controllers/
│   │   ├── patientController.js
│   │   ├── admissionController.js
│   │   ├── timelineController.js
│   │   ├── evidenceController.js
│   │   └── queryController.js
│   ├── services/
│   │   ├── safetyService.js         # Safety & abstention
│   │   ├── intentService.js         # Intent handling
│   │   ├── intentParserService.js   # LLM intent parsing
│   │   ├── retrievalService.js      # Data retrieval
│   │   ├── evidenceService.js       # Evidence validation
│   │   ├── answerService.js         # Answer generation
│   │   └── timelineService.js       # Timeline building
│   ├── routes/
│   │   ├── patientRoutes.js
│   │   ├── admissionRoutes.js
│   │   ├── timelineRoutes.js
│   │   ├── evidenceRoutes.js
│   │   ├── queryRoutes.js
│   │   └── evaluationRoutes.js
│   ├── middleware/
│   │   ├── errorMiddleware.js
│   │   └── validationMiddleware.js
│   ├── scripts/
│   │   ├── importPatients.js
│   │   ├── importAdmissions.js
│   │   ├── importTransfers.js
│   │   ├── importLabs.js
│   │   ├── importMedications.js
│   │   ├── importProcedures.js
│   │   ├── importDiagnoses.js
│   │   ├── buildTimeline.js
│   │   ├── checkDataQuality.js
│   │   └── lib/
│   │       └── csv.js              # CSV utilities
│   ├── evaluation/
│   │   ├── questions.json          # Test questions
│   │   ├── groundTruth.json        # Expected answers
│   │   ├── metrics.js              # Evaluation metrics
│   │   ├── runEvaluation.js        # Evaluation runner
│   │   ├── hallucinationTests.js   # Hallucination testing
│   │   └── results.json            # Generated results
│   ├── docs/
│   │   ├── architecture.md
│   │   ├── data-dictionary.md
│   │   ├── evaluation.md
│   │   ├── safety.md
│   │   └── error-analysis.md
│   ├── package.json
│   ├── server.js
│
├── data/                            # Dataset (not committed)
│   └── README.md                    # Dataset instructions
│
├── package.json                     # Root package.json
├── .gitignore
└── README.md                        # This file
```

## Prerequisites

- **Node.js** v18 or later — [download](https://nodejs.org/)
- **npm** v9+ (bundled with Node)
- **git**

Check your versions:

```bash
node --version
npm --version
```

## Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/Mudassarahmad21/ProjectLens-FullStackProject.git
   cd patientlens
   ```

2. **Install client dependencies**

   ```bash
   cd client
   npm install
   ```

3. **Install server dependencies** 

   ```bash
   cd ../server
   npm install
   ```

## Environment Variables

Fill in your own env values:

```bash
cp  .env
```

Typical variables (adjust to your project):

```env
# Client
VITE_API_BASE_URL=http://localhost:5000

# Server
PORT=5000
DATABASE_URL=your-database-connection-string
```

> **Note:** With Vite, only variables prefixed with `VITE_` are exposed to the frontend.

## Running the Project

### Development

Run the client:

```bash
cd client
npm run dev
```

The app will be available at **http://localhost:5173** (Vite's default).

Run the server in a separate terminal *(if applicable)*:

```bash
cd server
npm run dev
```

### Production Build

```bash
cd client
npm run build      # outputs to client/dist
npm run preview    # preview the production build locally
```

## Available Scripts

Run these from the `client/` directory:

| Command           | Description                              |
|-------------------|------------------------------------------|
| `npm run dev`     | Start the dev server with hot reload     |
| `npm run build`   | Create an optimized production build      |
| `npm run preview` | Preview the production build locally     |
| `npm run lint`    | Run the linter *(if configured)*         |

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit your changes: `git commit -m "Add your feature"`
3. Push the branch: `git push origin feature/your-feature`
4. Open a pull request

## License

Distributed under the MIT License. See `LICENSE` for details.

---

*PatientLens v0.1.0 · Research Prototype*