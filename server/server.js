// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import { connectDB } from "./config/db.js";

// import authRoutes from "./routes/authRoutes.js";
// import patientRoutes from "./routes/patientRoutes.js";
// import admissionRoutes from "./routes/admissionRoutes.js";
// import timelineRoutes from "./routes/timelineRoutes.js";
// import evidenceRoutes from "./routes/evidenceRoutes.js";
// import queryRoutes from "./routes/queryRoutes.js";
// import evaluationRoutes from "./routes/evaluationRoutes.js";

// import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
// import { protect } from "./middleware/authMiddleware.js";

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Database
// connectDB();

// // Middleware
// app.use(
//   cors({
//     origin: [
//       "http://localhost:5173",
//       "http://localhost:5000",
//     ],
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

// app.use(express.json());

// // ================================
// // Health Check
// // ================================

// app.get("/api/health", (req, res) => {
//   res.json({
//     success: true,
//     message: "PatientLens API is running",
//     timestamp: new Date().toISOString(),
//   });
// });

// // ================================
// // Public Auth Routes
// // ================================

// app.use("/api/auth", authRoutes);

// // ================================
// // Protected API Routes
// // ================================

// app.use("/api/patients", protect, patientRoutes);

// app.use("/api/admissions", protect, admissionRoutes);

// app.use("/api", protect, timelineRoutes);

// app.use("/api/evidence", protect, evidenceRoutes);

// app.use("/api", protect, queryRoutes);

// app.use("/api/evaluation", protect, evaluationRoutes);

// // ================================
// // Error Handling
// // ================================

// app.use(notFound);
// app.use(errorHandler);

// // ================================
// // Start Server
// // ================================

// app.listen(PORT, () => {
//   console.log(`✅ PatientLens API running on http://localhost:${PORT}`);
//   console.log(
//     `📊 Health check: http://localhost:${PORT}/api/health`
//   );
// });


// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import { connectDB } from "./config/db.js";

// import authRoutes from "./routes/authRoutes.js";
// import patientRoutes from "./routes/patientRoutes.js";
// import admissionRoutes from "./routes/admissionRoutes.js";
// import timelineRoutes from "./routes/timelineRoutes.js";
// import evidenceRoutes from "./routes/evidenceRoutes.js";
// import queryRoutes from "./routes/queryRoutes.js";
// import evaluationRoutes from "./routes/evaluationRoutes.js";

// import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
// import { protect } from "./middleware/authMiddleware.js";

// dotenv.config();

// const app = express();

// // ================================
// // Database
// // ================================

// connectDB();

// // ================================
// // Middleware
// // ================================

// app.use(
//   cors({
//     origin: [
//       "http://localhost:5173",
//       process.env.FRONTEND_URL,
//     ],
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

// app.use(express.json());

// // ================================
// // Health Check
// // ================================

// app.get("/api/health", (req, res) => {
//   res.json({
//     success: true,
//     message: "PatientLens API is running",
//     timestamp: new Date().toISOString(),
//   });
// });

// // ================================
// // Public Auth Routes
// // ================================

// app.use("/api/auth", authRoutes);

// // ================================
// // Protected API Routes
// // ================================

// app.use("/api/patients", protect, patientRoutes);

// app.use("/api/admissions", protect, admissionRoutes);

// app.use("/api", protect, timelineRoutes);

// app.use("/api/evidence", protect, evidenceRoutes);

// app.use("/api", protect, queryRoutes);

// app.use("/api/evaluation", protect, evaluationRoutes);

// // ================================
// // Error Handling
// // ================================

// app.use(notFound);
// app.use(errorHandler);

// // Export app for Vercel
// export default app;


import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import admissionRoutes from "./routes/admissionRoutes.js";
import timelineRoutes from "./routes/timelineRoutes.js";
import evidenceRoutes from "./routes/evidenceRoutes.js";
import queryRoutes from "./routes/queryRoutes.js";
import evaluationRoutes from "./routes/evaluationRoutes.js";

import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import { protect } from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  "https://projectlens-fullstackproject.mlkmud56.workers.dev";

const corsOptions = {
  origin: FRONTEND_URL,
  credentials: true,
  methods: ["GET", "HEAD", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

// CORS MUST come before routes
app.use(cors(corsOptions));
app.use(express.json());

// ================================
// Database
// ================================

connectDB();

// ================================
// Health Check
// ================================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "PatientLens API is running",
    timestamp: new Date().toISOString(),
  });
});

// ================================
// Public Auth Routes
// ================================

app.use("/api/auth", authRoutes);

// ================================
// Protected API Routes
// ================================

app.use("/api/patients", protect, patientRoutes);

app.use("/api/admissions", protect, admissionRoutes);

app.use("/api", protect, timelineRoutes);

app.use("/api/evidence", protect, evidenceRoutes);

app.use("/api", protect, queryRoutes);

app.use("/api/evaluation", evaluationRoutes);

// ================================
// Error Handling
// ================================

app.use(notFound);
app.use(errorHandler);

export default app;