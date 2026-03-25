import dotenv from "dotenv";
dotenv.config({ path: './src/.env' });

import express from "express";
import mongoose from "mongoose";
import cors from "cors"
import rateLimit from "express-rate-limit";
import userRouter from "./routes/user";
import contentRouter from "./routes/content"
import tokenRouter from "./routes/validateToken"
import bugRouter from "./routes/bugs"
import path from "path"

const app = express();

// Rate limiting for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, please try again after 15 minutes." }
});

app.use(express.json());
app.use(cors({
    origin: (origin, callback) => {
        const allowed = process.env.ALLOWED_ORIGIN;
        // Allow requests with no origin (mobile apps, curl, Postman) or matching origin
        if (!origin || !allowed || allowed === '*' || origin === allowed) {
            callback(null, true);
        } else {
            callback(null, true); // temporarily allow all in dev; restrict in prod
        }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.options('*', cors());

app.use("/api/v1/signin", authLimiter);
app.use("/api/v1/signup", authLimiter);
app.use("/api/v1/forgot-password", authLimiter);
app.use("/api/v1/verify-otp", authLimiter);

app.use("/api/v1", userRouter)
app.use("/api/v1", contentRouter)
app.use("/api/v1", tokenRouter)
app.use("/api/v1/bugs", bugRouter)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")))

app.listen(process.env.PORT, async () => {
    console.log("Trying to Connect DB")
    try {
        if (!process.env.MONGO_URL) {
            throw new Error("The MONGO_URL environment variable is not set.");
        }
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Server started at PORT:", process.env.PORT);
        console.log("MongoDb Connected")
    } catch (error) {
        console.log("Error : ", error)
    }
})