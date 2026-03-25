import { useRef, useState } from "react";
import { X, Upload, Bug } from "lucide-react";
import { Button } from "./Button";
import axios from "axios";
import { BACKEND_URL } from "../Config";
import toast from "react-hot-toast";

interface ReportBugModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ReportBugModal = ({ isOpen, onClose }: ReportBugModalProps) => {
    const descriptionRef = useRef<HTMLTextAreaElement>(null);
    const [priority, setPriority] = useState("medium");
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.size > 5 * 1024 * 1024) {
                toast.error("File size must be less than 5MB");
                return;
            }
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = async () => {
        const description = descriptionRef.current?.value;
        if (!description) {
            toast.error("Please describe the bug");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("description", description);
        formData.append("priority", priority);
        if (file) {
            formData.append("image", file);
        }

        try {
            const token = localStorage.getItem("Authorization");
            await axios.post(`${BACKEND_URL}/api/v1/bugs`, formData, {
                headers: {
                    Authorization: token
                }
            });
            toast.success("Bug reported successfully!");
            onClose();
        } catch (error: any) {
            console.error("Report Bug Error:", error);
            toast.error(error.response?.data?.message || "Failed to report bug");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <Bug size={20} />
                        <h2 className="font-bold text-lg">Report a Bug</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4 overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <textarea
                            ref={descriptionRef}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-32"
                            placeholder="What happened? Steps to reproduce... (Ctrl+Enter to submit)"
                            onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit(); }}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                        <div className="flex gap-2">
                            {['low', 'medium', 'high'].map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPriority(p)}
                                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium capitalize transition-all ${priority === p
                                        ? p === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800'
                                            : p === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800'
                                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Screenshot (Optional)</label>
                        <div className="relative group">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors h-32">
                                {previewUrl ? (
                                    <div className="relative w-full h-full flex items-center justify-center">
                                        <img src={previewUrl} alt="Preview" className="max-h-full max-w-full rounded object-contain" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-medium text-xs">
                                            Change Image
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <Upload size={24} className="mb-2" />
                                        <span className="text-xs">Click to upload (Max 5MB)</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                    <Button text="Submit Report" variant="primary" fullWidth={true} loading={loading} onClick={handleSubmit} />
                </div>
            </div>
        </div>
    );
};
