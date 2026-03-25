import mongoose, { mongo } from "mongoose"
import { string } from "zod"

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    password: { type: String },
    email: { type: String, required: true, unique: true },
    otp: { type: String },
    otpExpiry: { type: Date },
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    dailyEmailCount: { type: Number, default: 0 },
    dailyEmailResetAt: { type: Date, default: null }
})

const contentSchema = new mongoose.Schema({
    link: { type: String },
    title: { type: String },
    type: { type: String, required: true },
    content: { type: String }, // Used for Note text or general textual content
    metadata: { type: mongoose.Schema.Types.Mixed }, // OpenGraph data, Task items, etc.
    shareHash: { type: String },
    order: { type: Number, default: 0 },
    isPinned: { type: Boolean, default: false },
    userId: { type: mongoose.Types.ObjectId, ref: 'user', required: true },
    createdAt: { type: Date, default: Date.now }
})

const linkSchema = new mongoose.Schema({
    hash: String,
    userId: { type: mongoose.Types.ObjectId, ref: "user", required: true, unique: true }
})

const bugSchema = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, ref: 'user', required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    imageUrl: { type: String },
    status: { type: String, enum: ['open', 'in_progress', 'closed'], default: 'open' },
    createdAt: { type: Date, default: Date.now }
})

export const UserModel = mongoose.model("user", userSchema)
export const ContentModel = mongoose.model("content", contentSchema)
export const LinkModel = mongoose.model("link", linkSchema)
export const BugModel = mongoose.model("bug", bugSchema)