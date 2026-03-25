import { useEffect, useRef, useState } from "react"
import { Button } from "../components/Button"
import { Input } from "../components/Input"
import { BrainIcon } from "../icons/BrainIcon"
import { SignUpIcon } from "../icons/SignUpIcon"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { BACKEND_URL } from "../Config"
import { GoogleLogin } from '@react-oauth/google';
import toast from "react-hot-toast"
import { ThemeToggle } from "../components/ThemeToggle"


export const SignIn = () => {

    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem("Authorization");
        if (token) {
            axios.get(`${BACKEND_URL}/api/v1/validate-token`, {
                headers: { Authorization: token },
            })
                .then((response) => {
                    if (response.data.success) {
                        navigate("/dashboard");
                    } else {
                        localStorage.removeItem("Authorization");
                    }
                })
                .catch(() => {
                    localStorage.removeItem("Authorization");
                });
        }
    }, [navigate]);

    const signin = async () => {
        setLoading(true);
        const email = emailRef.current?.value;
        const password = passwordRef.current?.value;

        if (!email || !password) {
            toast.error("Please fill in all fields.");
            setLoading(false);
            return;
        }

        try {
            const res = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
                email,
                password
            })
            if (res.data.success) {
                localStorage.setItem("Authorization", res.data.token)
                localStorage.setItem("role", res.data.role || "user")
                toast.success("Welcome back!");
                navigate("/dashboard")
            }
        } catch (e: any) {
            console.error("Signin error", e);
            toast.error(e.response?.data?.message || "Signin failed. Check credentials.");
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
            toast.success("Welcome back!");
            navigate("/dashboard");
        } catch (e) {
            console.error("Google Auth Error", e);
            toast.error("Google Sign In Failed. Please try manually.");
        }
    }


    return (
        <div className="relative h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center font-sans transition-colors duration-300 px-4">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-32 top-1/4 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-600/15" />
                <div className="absolute -right-24 bottom-1/4 h-64 w-64 rounded-full bg-violet-400/15 blur-3xl dark:bg-violet-600/10" />
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
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 text-center">Welcome Back</h2>

                <form onSubmit={(e) => { e.preventDefault(); signin(); }} className="space-y-3">
                    <Input placeholder="Email Address" ref={emailRef} type="email" />
                    <Input placeholder="Password" ref={passwordRef} type="password" />
                    <div className="flex justify-end">
                        <Link to="/forgot-password" className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 hover:underline">
                            Forgot your password?
                        </Link>
                    </div>
                </form>

                <div className="mt-5">
                    <Button text="Sign In" variant="primary" startIcon={<SignUpIcon />} fullWidth={true} loading={loading} onClick={signin} />
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
                    />
                </div>

                <div className="text-center mt-5 text-sm text-gray-600 dark:text-gray-400">
                    New here? <Link to="/signup" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-500 dark:hover:text-indigo-300 hover:underline">Create an account</Link>
                </div>
            </div>
        </div>
    )
}
