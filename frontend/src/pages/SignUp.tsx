import { useRef, useState, useEffect } from "react"
import { Button } from "../components/Button"
import { Input } from "../components/Input"
import { BrainIcon } from "../icons/BrainIcon"
import { SignUpIcon } from "../icons/SignUpIcon"
import { Link, useNavigate } from "react-router-dom"
import { BACKEND_URL } from "../Config"
import axios from "axios"
import { GoogleLogin } from '@react-oauth/google';
import toast from "react-hot-toast"
import { CheckCircle2, Mail } from "lucide-react"
import { ThemeToggle } from "../components/ThemeToggle"

export const SignUp = () => {

    const fullNameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const otpRef = useRef<HTMLInputElement>(null);

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false)
    const [otpSent, setOtpSent] = useState(false);
    const [timer, setTimer] = useState(60);
    const [currentEmail, setCurrentEmail] = useState("");

    const resendOtp = async () => {
        if (timer > 0) return;
        setLoading(true);
        try {
            const res = await axios.post(`${BACKEND_URL}/api/v1/resend-otp`, {
                email: currentEmail
            });
            if (res.data.success) {
                toast.success("New OTP sent!");
                setTimer(60);
            }
        } catch (e: any) {
            console.error(e);
            toast.error(e.response?.data?.message || "Failed to resend OTP");
        } finally {
            setLoading(false);
        }
    }

    // Timer Effect
    useEffect(() => {
        let interval: any;
        if (otpSent && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [otpSent, timer]);

    const signup = async () => {
        setLoading(true);
        const fullName = fullNameRef.current?.value;
        const email = emailRef.current?.value;
        const password = passwordRef.current?.value;

        if (!fullName || !email || !password) {
            toast.error("Please fill in all fields");
            setLoading(false);
            return;
        }

        try {
            const res = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
                fullName,
                email,
                password
            })
            if (res.data.success) {
                toast.success("OTP sent to your email!");
                setCurrentEmail(email);
                setOtpSent(true);
            }
        } catch (e: any) {
            console.error(e);
            toast.error(e.response?.data?.message || "Signup failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    const verifyOtp = async () => {
        setLoading(true);
        const otp = otpRef.current?.value;

        if (!otp) {
            toast.error("Please enter the OTP");
            setLoading(false);
            return;
        }

        try {
            const res = await axios.post(`${BACKEND_URL}/api/v1/verify-otp`, {
                email: currentEmail,
                otp
            })
            if (res.data.success) {
                toast.success("Account verified!");
                localStorage.setItem("Authorization", res.data.token);
                navigate("/dashboard");
            }
        } catch (e: any) {
            console.error(e);
            toast.error(e.response?.data?.message || "Verification failed. Invalid OTP.");
        } finally {
            setLoading(false);
        }
    }

    const onGoogleSuccess = async (credentialResponse: any) => {
        try {
            const response = await axios.post(`${BACKEND_URL}/api/v1/google-auth`, {
                token: credentialResponse.credential
            });
            localStorage.setItem("Authorization", response.data.token);
            toast.success("Welcome to Brainly!");
            navigate("/dashboard");
        } catch (e) {
            console.error("Google Auth Error", e);
            toast.error("Google Sign In Failed. Please try manually.");
        }
    }

    if (otpSent) {
        return (
            <div className="relative min-h-screen w-full bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center font-sans transition-colors duration-300 py-6 px-4">
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -left-32 top-1/4 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-600/15" />
                    <div className="absolute -right-24 bottom-1/3 h-64 w-64 rounded-full bg-violet-400/15 blur-3xl dark:bg-violet-600/10" />
                </div>
                <div className="absolute right-4 top-4 z-10 md:right-8 md:top-8">
                    <ThemeToggle />
                </div>
                <div className="relative bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-[400px] border border-gray-100 dark:border-gray-700 animate-fade-in transition-all">
                    <div className="flex flex-col items-center mb-4">
                        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-full text-indigo-600 dark:text-indigo-400 mb-3">
                            <Mail size={28} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white text-center">Check your Email</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                            We've sent a 6-digit code to <span className="font-semibold text-gray-700 dark:text-gray-300 block">{currentEmail}</span>
                        </p>
                        {/* Mock Mode Hint */}
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); verifyOtp(); }} className="space-y-4">
                        <input
                            ref={otpRef}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center text-xl tracking-widest font-mono placeholder-gray-400"
                            placeholder="000000"
                            maxLength={6}
                        />
                    </form>

                    <div className="mt-4">
                        <Button text="Verify Email" variant="primary" startIcon={<CheckCircle2 />} fullWidth={true} loading={loading} onClick={verifyOtp} />
                    </div>

                    <div className="text-center mt-3">
                        <button
                            onClick={resendOtp}
                            disabled={timer > 0 || loading}
                            className={`text-sm font-medium ${timer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300'}`}
                        >
                            {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
                        </button>
                    </div>
                    <div className="text-center mt-4 text-sm">
                        <button onClick={() => setOtpSent(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            Back to Signup
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="relative min-h-screen w-full bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center font-sans transition-colors duration-300 py-6 px-4">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-32 top-1/4 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-600/15" />
                <div className="absolute -right-24 bottom-1/3 h-64 w-64 rounded-full bg-violet-400/15 blur-3xl dark:bg-violet-600/10" />
            </div>
            <div className="absolute right-4 top-4 z-10 md:right-8 md:top-8">
                <ThemeToggle />
            </div>
            <div className="relative flex flex-col items-center mb-6 animate-fade-in-down">
                <div className="text-indigo-600 dark:text-indigo-400 mb-2">
                    <BrainIcon height={48} width={48} />
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Brainly</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Your second brain, simplified.</p>
            </div>

            <div className="relative bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-[400px] border border-gray-100 dark:border-gray-700 animate-fade-in transition-all">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 text-center">Create Account</h2>

                <form onSubmit={(e) => { e.preventDefault(); signup(); }} className="space-y-3">
                    <Input ref={fullNameRef} placeholder="Full Name" />
                    <Input ref={emailRef} placeholder="Email Address" type="email" />
                    <Input ref={passwordRef} placeholder="Password" type="password" />
                </form>

                <div className="mt-5">
                    <Button text="Sign Up" variant="primary" startIcon={<SignUpIcon />} fullWidth={true} loading={loading} onClick={signup} />
                </div>

                <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300 dark:border-gray-600"></div></div>
                    <div className="relative flex justify-center text-xs"><span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span></div>
                </div>

                <div className="flex justify-center scale-90 origin-top">
                    <GoogleLogin
                        onSuccess={onGoogleSuccess}
                        onError={() => console.log('Login Failed')}
                        theme="outline"
                        shape="pill"
                        size="large"
                        text="signup_with"
                    />
                </div>

                <div className="text-center mt-5 text-sm text-gray-600 dark:text-gray-400">
                    Already have an account? <Link to="/signin" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-500 dark:hover:text-indigo-300 hover:underline">Sign In</Link>
                </div>
            </div>
        </div>
    )
}
