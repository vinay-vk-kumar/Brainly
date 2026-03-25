import express, { Request, Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { BugModel, UserModel } from "../Db"; // Ensure UserModel is imported if needed for role check
import { upload } from "../middleware/upload";
import { z } from "zod";

const router = express.Router();

// --- 1. REPORT BUG (User) ---
router.post("/", authMiddleware, upload.single("image"), async (req: Request, res: Response) => {
    try {
        const { description, priority } = req.body;
        const userId = (req as any).userId;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

        if (!description) {
            res.status(400).json({ success: false, message: "Description is required" });
            return;
        }

        await BugModel.create({
            userId,
            description,
            priority: priority || "medium",
            imageUrl,
            status: "open"
        });

        res.status(201).json({ success: true, message: "Bug reported successfully" });

    } catch (error) {
        console.error("Report Bug Error:", error);
        res.status(500).json({ success: false, message: "Failed to report bug" });
    }
});

// --- 2. GET BUGS (Admin Only) ---
router.get("/admin", authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const user = await UserModel.findById(userId);

        if (!user || user.role !== "admin") {
            res.status(403).json({ success: false, message: "Access denied. Admins only." });
            return;
        }

        // Populate userId with fullName and email as requested
        const bugs = await BugModel.find()
            .populate("userId", "fullName email")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, bugs });

    } catch (error) {
        console.error("Get Bugs Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch bugs" });
    }
});

// --- 3. DELETE BUG (Admin Only) ---
router.delete("/admin/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const user = await UserModel.findById(userId);

        if (!user || user.role !== "admin") {
            res.status(403).json({ success: false, message: "Access denied. Admins only." });
            return;
        }

        const bugId = req.params.id;
        await BugModel.findByIdAndDelete(bugId);

        res.status(200).json({ success: true, message: "Bug deleted successfully" });

    } catch (error) {
        console.error("Delete Bug Error:", error);
        res.status(500).json({ success: false, message: "Failed to delete bug" });
    }
});

// --- 4. UPDATE BUG STATUS (Admin Only) ---
router.patch("/admin/:id/status", authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const user = await UserModel.findById(userId);

        if (!user || user.role !== "admin") {
            res.status(403).json({ success: false, message: "Access denied. Admins only." });
            return;
        }

        const { status } = req.body;
        const validStatuses = ["open", "in_progress", "closed"];
        if (!validStatuses.includes(status)) {
            res.status(400).json({ success: false, message: "Invalid status. Must be one of: open, in_progress, closed" });
            return;
        }

        const bugId = req.params.id;
        const bug = await BugModel.findByIdAndUpdate(bugId, { status }, { new: true });

        if (!bug) {
            res.status(404).json({ success: false, message: "Bug not found" });
            return;
        }

        res.status(200).json({ success: true, message: "Status updated", bug });

    } catch (error) {
        console.error("Update Bug Status Error:", error);
        res.status(500).json({ success: false, message: "Failed to update bug status" });
    }
});

export default router;

