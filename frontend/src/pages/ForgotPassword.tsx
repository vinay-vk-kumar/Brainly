import { useRef, useState, useEffect } from "react"
import { Button } from "../components/Button"
import { Input } from "../components/Input"
import { BrainIcon } from "../icons/BrainIcon"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { BACKEND_URL } from "../Config"
import toast from "react-hot-toast"
import { CheckCircle2, Mail } from "lucide-react"
import { ThemeToggle } from "../components/ThemeToggle"

export const ForgotPassword = () => {
    const emailRef = useRef<HTMLInputElement>(null)
    const otpRef = useRef<HTMLInputElement>(null)
    const newPasswordRef = useRef<HTMLInputElement>(null)

    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState<"email" | "otp">("email")
    const [email, setEmail] = useState("")
    const [timer, setTimer] = useState(0);

    useEffect(() => {
        let interval: any;
        if (step === "otp" && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    const resendOtp = async () => {
        if (timer > 0) return;
        setLoading(true);
        try {
            const res = await axios.post(`${BACKEND_URL}/api/v1/resend-otp`, {
                email
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

    const sendOtp = async () => {
        const emailVal = emailRef.current?.value
        if (!emailVal) {
            toast.error("Please enter your email")
            return
        }

        setLoading(true)
        try {
            const res = await axios.post(`${BACKEND_URL}/api/v1/forgot-password`, {
                email: emailVal
            })
            if (res.data.success) {
                toast.success("OTP sent to your email!")
                setEmail(emailVal)
                setStep("otp")
                setTimer(60)
            }
        } catch (e: any) {
            console.error(e)
            toast.error(e.response?.data?.message || "Failed to send OTP")
        } finally {
            setLoading(false)
        }
    }

    const resetPassword = async () => {
        const otp = otpRef.current?.value
        const newPassword = newPasswordRef.current?.value

        if (!otp || !newPassword) {
            toast.error("Please fill in all fields")
            return
        }

        setLoading(true)
        try {
            const res = await axios.post(`${BACKEND_URL}/api/v1/reset-password`, {
                email,
                otp,
                newPassword
            })
            if (res.data.success) {
                toast.success("Password reset successful!")
                navigate("/signin")
            }
        } catch (e: any) {
            console.error(e)
            toast.error(e.response?.data?.message || "Failed to reset password")
        } finally {
            setLoading(false)
        }
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
            </div>

            <div className="relative bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-[400px] border border-gray-100 dark:border-gray-700 animate-fade-in transition-all">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 text-center">
                    {step === "email" ? "Reset Password" : "Set New Password"}
                </h2>

                {step === "email" ? (
                    <>
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
                            Enter your email to receive a password reset code.
                        </p>
                        <form onSubmit={(e) => { e.preventDefault(); sendOtp(); }} className="space-y-4">
                            <Input placeholder="Email Address" ref={emailRef} type="email" />
                        </form>
                        <div className="mt-6">
                            <Button text="Send OTP" variant="primary" startIcon={<Mail size={18} />} fullWidth={true} loading={loading} onClick={sendOtp} />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="mb-6 bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                OTP sent to <span className="font-semibold">{email}</span>
                            </p>
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); resetPassword(); }} className="space-y-4">
                            <input
                                ref={otpRef}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center text-xl tracking-widest font-mono placeholder-gray-400"
                                placeholder="000000"
                                maxLength={6}
                            />
                            <Input placeholder="New Password" ref={newPasswordRef} type="password" />
                        </form>
                        <div className="mt-6">
                            <Button text="Reset Password" variant="primary" startIcon={<CheckCircle2 size={18} />} fullWidth={true} loading={loading} onClick={resetPassword} />
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
                    </>
                )}

                <div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
                    Remember your password? <Link to="/signin" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-500 dark:hover:text-indigo-300 hover:underline">Sign In</Link>
                </div>
            </div>
        </div>
    )
}
