import express, { Request, Response } from 'express';
import { UserModel, LinkModel, ContentModel } from "../Db";
import { authMiddleware } from '../middleware/authMiddleware';
import mongoose from 'mongoose';
import { random } from '../utils/random';
import { getLinkPreview } from '../utils/linkPreview';

const router = express.Router();

interface newRequest extends Request {
    userId?: mongoose.Types.ObjectId
}

router.post("/content", authMiddleware, async (req: newRequest, res: Response) => {
    const { title, link, content, type } = req.body;

    try {
        let metadata = {};
        if (type === 'article' || (type === 'link' && link)) {
            metadata = await getLinkPreview(link);
        }

        // Find current min order to place new item at top
        const minOrderContent = await ContentModel.findOne({ userId: req.userId }).sort({ order: 1 });
        const newOrder = minOrderContent ? (minOrderContent.order || 0) - 1 : 0;

        await ContentModel.create({
            title,
            link,
            type,
            content,
            metadata,
            userId: req.userId,
            order: newOrder
        })
        res.status(200).json({ success: true, message: "Content Added" })
    }
    catch (error) {
        res.status(500).json({ success: false, message: "server error", error })
    }
})

router.put("/content", authMiddleware, async (req: newRequest, res: Response) => {
    const { contentId, title, link, content, type } = req.body;
    try {
        let metadata = {};
        if (type === 'article' || (type === 'link' && link)) {
            // Only update preview if link changed? Or always? Let's just re-fetch for simplicity or if missing.
            // For now, simple re-fetch.
            metadata = await getLinkPreview(link);
        }

        await ContentModel.updateOne(
            { _id: contentId, userId: req.userId },
            { title, link, type, content, metadata }
        );
        res.status(200).json({ success: true, message: "Content Updated" });
    } catch (e) {
        res.status(500).json({ success: false, message: "Error updating content" });
    }
});

router.get("/content", authMiddleware, async (req: newRequest, res: Response) => {
    const userId = req.userId;

    try {
        const content = await ContentModel.find({
            userId: userId
        }).sort({ isPinned: -1, order: 1 }).populate("userId", "fullName")
        res.status(200).json({
            success: true,
            content
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, error: error })
    }
})

router.delete("/content", authMiddleware, async (req: newRequest, res: Response) => {
    const contentId = req.body.contentId;

    try {
        await ContentModel.deleteMany({
            _id: contentId,
            userId: req.userId
        })
        res.status(200).json({
            message: "Deleted"
        })
    } catch (error) {
        res.status(500).json({ message: "server error", error })
    }
})

router.post("/content/share", authMiddleware, async (req: newRequest, res: Response) => {
    const { contentId } = req.body;
    try {
        const hash = random(20);
        await ContentModel.updateOne({ _id: contentId, userId: req.userId }, { shareHash: hash });
        res.json({ success: true, shareHash: hash });
    } catch (e) {
        res.status(500).json({ message: "Error sharing" });
    }
});

router.post("/content/unshare", authMiddleware, async (req: newRequest, res: Response) => {
    const { contentId } = req.body;
    try {
        await ContentModel.updateOne({ _id: contentId, userId: req.userId }, { shareHash: null });
        res.json({ success: true, message: "Unshared" });
    } catch (e) {
        res.status(500).json({ message: "Error unsharing" });
    }
});

router.put("/content/reorder", authMiddleware, async (req: newRequest, res: Response) => {
    const { items } = req.body; // Expects array of { _id, order }
    try {
        const updates = items.map((item: { _id: string, order: number }) =>
            ContentModel.updateOne({ _id: item._id, userId: req.userId }, { order: item.order })
        );
        await Promise.all(updates);
        res.json({ success: true, message: "Reordered" });
    } catch (e) {
        res.status(500).json({ message: "Error reordering" });
    }
});

router.put("/content/toggle-pin", authMiddleware, async (req: newRequest, res: Response) => {
    const { contentId, isPinned } = req.body;
    try {
        await ContentModel.updateOne({ _id: contentId, userId: req.userId }, { isPinned });
        res.json({ success: true, message: isPinned ? "Pinned" : "Unpinned" });
    } catch (e) {
        res.status(500).json({ message: "Error pinning" });
    }
});

router.get("/share/:shareHash", async (req: Request, res: Response) => {
    const { shareHash } = req.params;
    try {
        const content = await ContentModel.findOne({ shareHash }).populate("userId", "fullName");
        if (!content) {
            res.status(404).json({ message: "Not found" });
            return;
        }
        res.json({ success: true, content });
    } catch (e) {
        res.status(500).json({ message: "Error fetching" });
    }
});

router.post("/brain/share", authMiddleware, async (req: newRequest, res) => {
    const share = req.body.share;
    try {
        if (share) {
            const existingLink = await LinkModel.findOne({
                userId: req.userId
            });

            if (existingLink) {
                res.json({
                    hash: existingLink.hash
                })
                return;
            }
            const hash = random(10);
            await LinkModel.create({
                userId: req.userId,
                hash: hash
            })

            res.json({
                hash
            })
        } else {
            await LinkModel.deleteOne({
                userId: req.userId
            });

            res.status(200).json({
                message: "Removed link"
            })
        }
    } catch (error) {
        res.status(500).json({ message: "server error", error })
    }
})


router.get("/brain/:shareLink", async (req, res) => {
    const hash = req.params.shareLink;

    try {
        const link = await LinkModel.findOne({
            hash
        });

        if (!link) {
            res.status(411).json({
                message: "Sorry incorrect input"
            })
            return;
        }
        // userId
        const content = await ContentModel.find({
            userId: link.userId
        })

        console.log(link);
        const user = await UserModel.findOne({
            _id: link.userId
        })

        if (!user) {
            res.status(411).json({
                message: "user not found, error should ideally not happen"
            })
            return;
        }

        res.json({
            username: user.fullName,
            content: content
        })
    } catch (error) {
        res.status(500).json({ message: "server error", error })
    }

})

export default router