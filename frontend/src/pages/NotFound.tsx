import { Brain, Home, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 font-sans transition-colors duration-300">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="flex flex-col items-center text-center max-w-md w-full"
            >
                {/* Icon */}
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 dark:bg-indigo-950/50 shadow-lg">
                    <Brain size={40} className="text-indigo-500 dark:text-indigo-400" strokeWidth={1.5} />
                </div>

                {/* 404 Number */}
                <motion.p
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="text-8xl font-extrabold text-indigo-200 dark:text-indigo-900 select-none leading-none mb-4"
                >
                    404
                </motion.p>

                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    Page not found
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                    Looks like this page doesn't exist or was moved. Check the URL or head back home.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium shadow-sm"
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-all shadow-sm"
                    >
                        <Home size={18} />
                        Go Home
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default NotFound;
