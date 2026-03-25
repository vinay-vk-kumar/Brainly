import { motion, useScroll, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrainIcon } from '../icons/BrainIcon'
import { Button } from '../components/Button'
import { ThemeToggle } from '../components/ThemeToggle'
import dashboardPreview from "../assets/DashBoard.png"
import { ArrowRight, Smartphone, Share2, Zap } from 'lucide-react'


export default function LandingPage() {
    const navigate = useNavigate();
    const [navElevated, setNavElevated] = useState(false);
    const { scrollYProgress } = useScroll();
    const scrollProgress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.25 });

    useEffect(() => {
        const onScroll = () => setNavElevated(window.scrollY > 16);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Check if valid token exists to auto-redirect (optional, maybe user wants to see landing page?)
    // Let's render Landing for everyone, but "Get Started" redirects based on auth.
    const handleGetStarted = () => {
        const token = localStorage.getItem("Authorization");
        if (token) {
            navigate("/dashboard");
        } else {
            navigate("/signup");
        }
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <motion.div
                className="fixed top-0 left-0 right-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500"
                style={{ scaleX: scrollProgress }}
            />
            {/* Header */}
            <nav
                className={`fixed w-full z-50 border-b backdrop-blur-lg transition-all duration-300 ${
                    navElevated
                        ? "border-gray-200/90 bg-white/92 shadow-lg shadow-gray-900/[0.06] dark:border-gray-800/90 dark:bg-gray-950/92 dark:shadow-black/25"
                        : "border-transparent bg-white/75 dark:bg-gray-950/75"
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                        <BrainIcon height={32} width={32} />
                        <span className="text-xl font-bold tracking-tight">Brainly</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <Button text="Get Started" variant="primary" onClick={handleGetStarted} />
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
                            Your Second Brain, <span className="text-indigo-600 dark:text-indigo-400">Simplified.</span>
                        </h1>
                        <p className="text-xl text-gray-500 dark:text-gray-400 mb-10 leading-relaxed">
                            Capture your thoughts, save links, and organize your digital life in one beautiful, clutter-free workspace.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button text="Start for Free" variant="primary" onClick={handleGetStarted} startIcon={<ArrowRight size={20} />} />
                            <a href="#features" className="px-6 py-3 rounded-lg border border-gray-200 dark:border-gray-700 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                                Learn More
                            </a>
                        </div>
                    </motion.div>
                </div>

                <div className="mt-20 relative">
                    {/* Abstract BG blob */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[400px] bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden bg-white dark:bg-gray-900"
                    >
                        <img src={dashboardPreview} alt="App Dashboard Preview" className="w-full opacity-90" />
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-gray-50 dark:bg-gray-900 transition-colors scroll-mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Everything you need to stay organized</h2>
                        <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">Simple tools for complex minds.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Zap className="text-amber-500" size={32} />}
                            title="Quick Capture"
                            description="Save links, videos, social media links, and notes instantly from anywhere."
                            delay={0.1}
                        />
                        <FeatureCard
                            icon={<Smartphone className="text-indigo-500" size={32} />}
                            title="Universal Access"
                            description="Access your content from any device with a fully responsive design."
                            delay={0.2}
                        />
                        <FeatureCard
                            icon={<Share2 className="text-pink-500" size={32} />}
                            title="Easy Sharing"
                            description="Share your collections or specific items with just one click."
                            delay={0.3}
                        />
                    </div>
                </div>
            </section>

            {/* Supported Platforms Section */}
            <section className="py-16 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-8">
                        Supported Platforms
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Icons would ideally be SVGs or lucide icons where applicable. Using text/simple icons for now or generic names */}
                        <div className="flex items-center gap-2 text-xl font-bold text-gray-800 dark:text-gray-200"><span className="text-[#1DA1F2]">Twitter/X</span></div>
                        <div className="flex items-center gap-2 text-xl font-bold text-gray-800 dark:text-gray-200"><span className="text-[#E1306C]">Instagram</span></div>
                        <div className="flex items-center gap-2 text-xl font-bold text-gray-800 dark:text-gray-200"><span className="text-[#0077B5]">LinkedIn</span></div>
                        <div className="flex items-center gap-2 text-xl font-bold text-gray-800 dark:text-gray-200"><span className="text-[#FF0000]">YouTube</span></div>
                        <div className="flex items-center gap-2 text-xl font-bold text-gray-800 dark:text-gray-200"><span className="text-[#E60023]">Pinterest</span></div>
                        <div className="flex items-center gap-2 text-xl font-bold text-gray-800 dark:text-gray-200"><span className="text-[#1DB954]">Spotify</span></div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4 bg-white dark:bg-gray-950">
                <div className="max-w-4xl mx-auto bg-indigo-600 dark:bg-indigo-900 rounded-3xl p-12 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>

                    <h2 className="text-3xl sm:text-4xl font-bold mb-6 relative z-10">Ready to organize your digital life?</h2>
                    <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto relative z-10">Join thousands of users who have cleared their mind with Brainly.</p>
                    <div className="relative z-10 flex justify-center">
                        <button onClick={handleGetStarted} className="cursor-pointer bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition shadow-lg ">
                            Get Started Now
                        </button>
                    </div>
                </div>
            </section>
            <footer className="py-3 border-t border-gray-100 dark:border-gray-800 text-center text-gray-500 dark:text-gray-400">
                <p>&copy; 2026 Brainly. All rights reserved.</p>
            </footer>
        </div>
    )
}

function FeatureCard({ icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-indigo-200/60 dark:hover:border-indigo-500/25 transition-colors duration-300 cursor-default"
        >
            <div className="mb-4 bg-gray-50 dark:bg-gray-700/50 w-16 h-16 rounded-2xl flex items-center justify-center">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
        </motion.div>

    )
}
