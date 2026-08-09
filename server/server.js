// // server/server.js
// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import { connectDB } from './config/db.js';

// // Import routes
// import patientRoutes from './routes/patientRoutes.js';
// import admissionRoutes from './routes/admissionRoutes.js';
// import timelineRoutes from './routes/timelineRoutes.js';
// import evidenceRoutes from './routes/evidenceRoutes.js';
// import queryRoutes from './routes/queryRoutes.js';
// import evaluationRoutes from './routes/evaluationRoutes.js';

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Connect to MongoDB
// connectDB();

// // Middleware
// app.use(cors({
//   origin: ['http://localhost:5173', 'http://localhost:5000'],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));
// app.use(express.json());

// // Health check
// app.get('/api/health', (req, res) => {
//   res.json({
//     success: true,
//     message: 'PatientLens API is running',
//     timestamp: new Date().toISOString()
//   });
// });

// // Root route
// app.get('/', (req, res) => {
//   res.json({
//     name: 'PatientLens API',
//     version: '1.0.0',
//     status: 'running',
//     disclaimer: 'Research Prototype — Not for Clinical Use',
//     endpoints: {
//       patients: '/api/patients',
//       patient: '/api/patients/:subjectId',
//       admissions: '/api/admissions',
//       admission: '/api/admissions/:hadmId',
//       timeline: '/api/admissions/:hadmId/timeline',
//       evidence: '/api/evidence/:eventId',
//       query: '/api/query',
//       evaluation: '/api/evaluation'
//     }
//   });
// });

// // API Routes
// app.use('/api/patients', patientRoutes);
// app.use('/api/admissions', admissionRoutes);
// app.use('/api/timeline', timelineRoutes);
// app.use('/api/evidence', evidenceRoutes);
// app.use('/api/query', queryRoutes);
// app.use('/api/evaluation', evaluationRoutes);

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error('Error:', err.stack);
//   res.status(err.status || 500).json({
//     success: false,
//     error: err.message || 'Something went wrong!'
//   });
// });

// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     error: `Route not found: ${req.method} ${req.originalUrl}`
//   });
// });

// app.listen(PORT, () => {
//   console.log(`✅ Server running on port ${PORT}`);
//   console.log(`📊 API available at http://localhost:${PORT}/api/health`);
// });

// server/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";            // named import

import patientRoutes from "./routes/patientRoutes.js";
import admissionRoutes from "./routes/admissionRoutes.js";
import timelineRoutes from "./routes/timelineRoutes.js";
import evidenceRoutes from "./routes/evidenceRoutes.js";
import queryRoutes from "./routes/queryRoutes.js";
import evaluationRoutes from "./routes/evaluationRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5000"], credentials: true }));
app.use(express.json());

app.get("/api/health", (req, res) =>
  res.json({ success: true, message: "PatientLens API is running" })
);

app.use("/api/patients", patientRoutes);
app.use("/api/admissions", admissionRoutes);
app.use("/api", timelineRoutes);     // -> /api/admissions/:hadmId/timeline
app.use("/api/evidence", evidenceRoutes);
app.use("/api", queryRoutes);        // -> /api/query
app.use("/api/evaluation", evaluationRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => console.log(`PatientLens API on http://localhost:${PORT}`));