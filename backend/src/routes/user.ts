import express, { Request, Response } from 'express';
import { UserModel } from "../Db";
import { z } from "zod"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { OAuth2Client } from "google-auth-library";
import { sendVerificationEmail, sendPasswordResetEmail } from "../services/email";

const EMAIL_DAILY_LIMIT = 5;

// Returns true if allowed, false if rate-limited. Persists count to DB.
async function checkAndIncrementEmailLimit(user: any): Promise<boolean> {
    const now = new Date();
    const resetAt: Date | null = user.dailyEmailResetAt;
    const isNewDay = !resetAt || resetAt.toDateString() !== now.toDateString();

    if (isNewDay) {
        user.dailyEmailCount = 1;
        user.dailyEmailResetAt = now;
    } else {
        if (user.dailyEmailCount >= EMAIL_DAILY_LIMIT) return false;
        user.dailyEmailCount += 1;
    }
    await user.save();
    return true;
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const router = express.Router();

// --- 1. SIGNUP (Email + OTP) ---
router.post("/signup", async (req: Request, res: Response) => {
    const signupSchema = z.object({
        fullName: z.string().min(2, "Full name is required"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters")
    });

    try {
        const validatedData = await signupSchema.safeParseAsync(req.body);
        if (!validatedData.success) {
            res.status(400).json({ message: validatedData.error.issues[0].message });
            return;
        }

        const { fullName, email, password } = req.body;

        const userExists = await UserModel.findOne({ email });

        // ── If user exists but is NOT yet verified, refresh their OTP and resend ──
        if (userExists && !userExists.isVerified) {
            const allowed = await checkAndIncrementEmailLimit(userExists);
            if (!allowed) {
                res.status(429).json({ success: false, message: "Too many verification emails sent today. Please try again tomorrow." });
                return;
            }
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            userExists.otp = otp;
            userExists.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
            if (password) userExists.password = await bcrypt.hash(password, 10);
            if (fullName) userExists.fullName = fullName;
            await userExists.save();
            try { await sendVerificationEmail(email, userExists.fullName, otp); } catch (e) { console.error("[Email] resend on signup:", e); }
            res.status(200).json({ success: true, message: "OTP resent to your email" });
            return;
        }

        // ── Already verified — reject duplicate ──
        if (userExists && userExists.isVerified) {
            res.status(403).json({ success: false, message: "An account with this email already exists. Please sign in." });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate Mock OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        const newUser = await UserModel.create({
            fullName,
            email,
            password: hashedPassword,
            otp,
            otpExpiry,
            isVerified: false,
            dailyEmailCount: 1,
            dailyEmailResetAt: new Date()
        });

        // Send verification email
        try {
            await sendVerificationEmail(email, fullName, otp);
        } catch (emailErr) {
            console.error("[Email] Failed to send verification email:", emailErr);
        }

        res.status(200).json({ success: true, message: "OTP sent to your email" });

    } catch (error: any) {
        console.error("Signup Error:", error);
        res.status(500).json({ success: false, message: "Signup failed" });
    }
})

// --- 2. VERIFY OTP ---
router.post("/verify-otp", async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            res.status(400).json({ success: false, message: "User not found" });
            return;
        }

        if (user.isVerified) {
            res.status(200).json({ success: true, message: "Already verified. Please login." });
            return;
        }

        if (!user.otp || user.otp !== otp) {
            res.status(400).json({ success: false, message: "Invalid OTP" });
            return;
        }

        if (user.otpExpiry && user.otpExpiry < new Date()) {
            res.status(400).json({ success: false, message: "OTP has expired" });
            return;
        }

        // Verify User
        if (!user.fullName) user.fullName = "Brainly User"; // Fix for legacy users
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        // Generate Token
        if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET missing");
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({ success: true, message: "Email verified", token, fullName: user.fullName });

    } catch (error) {
        console.error("Verify OTP Error:", error);
        res.status(500).json({ success: false, message: "Verification failed" });
    }
});

// --- 3. GOOGLE AUTH ---
router.post("/google-auth", async (req: Request, res: Response) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            res.status(400).json({ success: false, message: "Invalid token" });
            return;
        }
        const { email, name } = payload;

        let user = await UserModel.findOne({ email });

        if (!user) {
            user = await UserModel.create({
                fullName: name,
                email,
                isVerified: true // Google users are auto-verified
            });
        }

        if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET missing");
        const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

        res.json({ success: true, token: jwtToken, fullName: user.fullName });

    } catch (e) {
        console.error("Google Auth Error:", e);
        res.status(500).json({ success: false, message: "Google Auth failed" });
    }
});

router.post("/forgot-password", async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        // Check email rate limit
        const allowed = await checkAndIncrementEmailLimit(user);
        if (!allowed) {
            res.status(429).json({ success: false, message: "Too many reset emails sent today. Please try again tomorrow." });
            return;
        }

        if (!user.fullName) user.fullName = "Brainly User";
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        // Send password reset email
        try {
            await sendPasswordResetEmail(email, otp);
        } catch (emailErr) {
            console.error("[Email] Failed to send reset email:", emailErr);
        }

        res.status(200).json({ success: true, message: "OTP sent to your email" });
    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ success: false, message: "Failed to send OTP" });
    }
});

router.post("/reset-password", async (req: Request, res: Response): Promise<void> => {
    const { email, otp, newPassword } = req.body;
    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        if (!user.otp || user.otp !== otp) {
            res.status(400).json({ success: false, message: "Invalid OTP" });
            return;
        }

        if (!user.otpExpiry || user.otpExpiry < new Date()) {
            res.status(400).json({ success: false, message: "OTP expired" });
            return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        if (!user.fullName) user.fullName = "Brainly User"; // Fix for legacy users
        user.password = hashedPassword;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        res.status(200).json({ success: true, message: "Password reset successful" });
    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ success: false, message: "Failed to reset password" });
    }
});


// --- RESEND OTP ---
router.post("/resend-otp", async (req: Request, res: Response) => {
    const { email } = req.body;
    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        // Check email rate limit
        const allowed = await checkAndIncrementEmailLimit(user);
        if (!allowed) {
            res.status(429).json({ success: false, message: "Too many emails sent today. Please try again tomorrow." });
            return;
        }

        if (!user.fullName) user.fullName = "Brainly User";
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        // Send new OTP email
        try {
            await sendVerificationEmail(email, user.fullName, otp);
        } catch (emailErr) {
            console.error("[Email] Failed to resend OTP email:", emailErr);
        }

        res.status(200).json({ success: true, message: "New OTP sent to your email" });

    } catch (error) {
        console.error("Resend OTP Error:", error);
        res.status(500).json({ success: false, message: "Failed to resend OTP" });
    }
});

// --- 4. SIGNIN (Email + Password) ---
router.post("/signin", async (req: Request, res: Response) => {
    const signinSchema = z.object({
        email: z.string().email(),
        password: z.string()
    })

    try {
        const parsedData = signinSchema.safeParse(req.body);
        if (!parsedData.success) {
            res.status(400).json({ message: "Invalid input" });
            return;
        }

        const { email, password } = req.body;

        // --- ADMIN LOGIN CHECK ---
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

        if (ADMIN_EMAIL && ADMIN_PASSWORD && email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            let adminUser = await UserModel.findOne({ email: ADMIN_EMAIL });
            if (!adminUser) {
                const hashedAdminPwd = await bcrypt.hash(ADMIN_PASSWORD, 10);
                adminUser = await UserModel.create({
                    fullName: "System Admin",
                    email: ADMIN_EMAIL,
                    password: hashedAdminPwd,
                    role: "admin",
                    isVerified: true
                });
            } else if (adminUser.role !== "admin") {
                // Ensure role is admin if it exists
                adminUser.role = "admin";
                await adminUser.save();
            }

            if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET missing");
            const token = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

            res.status(200).json({
                success: true,
                message: "Admin Login Successful",
                token,
                fullName: adminUser.fullName,
                role: "admin"
            });
            return;
        }

        // --- REGULAR USER LOGIN ---
        const user = await UserModel.findOne({ email });

        if (!user) {
            res.status(403).json({ success: false, message: "User not found" });
            return;
        }

        if (!user.password) {
            res.status(403).json({ success: false, message: "Please log in with Google" });
            return;
        }

        // Check if verified
        if (!user.isVerified) {
            res.status(403).json({ success: false, message: "Email not verified. Please verify your account." });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(403).json({ success: false, message: "Invalid credentials" });
            return;
        }

        if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET missing");

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({
            success: true,
            message: "Authentication successful",
            token,
            fullName: user.fullName,
            role: user.role || "user"
        });

    } catch (error) {
        console.error("Signin Error:", error);
        res.status(500).json({ success: false, message: "Signin failed" });
    }
})

export default router