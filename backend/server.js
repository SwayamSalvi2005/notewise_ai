
import "dotenv/config";
import express        from "express";
import cors           from "cors";
import authRoutes     from "./routes/authRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import aiRoutes       from "./routes/aiRoutes.js";
import quizRoutes     from "./routes/quizRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import errorHandler   from "./middleware/errorHandler.js";

const app = express();

// ─── CORS Configuration ────────────────────────────────────────────────────────
const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:5174"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error("Not allowed by CORS: " + origin));
    },
    methods:        ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials:    true
}));

app.use(express.json());

// ─── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",      authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/ai",        aiRoutes);
app.use("/api/quizzes",   quizRoutes);
app.use("/api/activity",  activityRoutes);

// ─── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log("Database: PostgreSQL (NeonDB) via Prisma — connects on first query");
});