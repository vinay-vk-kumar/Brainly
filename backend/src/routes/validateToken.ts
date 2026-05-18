import express, { Request, Response } from 'express';
import jwt, { JwtPayload } from "jsonwebtoken";

const router = express.Router();

router.get("/validate-token", async (req: Request, res: Response) => {
    const token = req.headers.authorization;

    if (!process.env.JWT_SECRET) {
        console.error("[ValidateToken] JWT_SECRET environment variable is not set");
        res.status(500).json({ message: "Internal server configuration error" });
        return; // ← critical: stop execution
    }

    if (!token) {
        res.status(403).json({ success: false, message: "No token provided" });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;

        if (decoded.id) {
            res.status(200).json({ success: true, message: "You are already logged in" });
        } else {
            res.status(403).json({ success: false, message: "You are not logged in" });
        }
    } catch (error) {
        res.status(403).json({ success: false, message: "You are not logged in", error });
    }
});

export default router;