import { useRef, useState, useEffect } from "react";
import { Share2, X, Youtube, FileText, StickyNote, CheckSquare, Image as ImageIcon } from "lucide-react";
import { Button } from "./Button";
import { Input } from "./Input";
import { BACKEND_URL } from "../Config";
import axios from "axios";
import toast from "react-hot-toast";

enum ContentType {
    Youtube = "youtube",
    Twitter = "twitter",
    Article = "article",
    Note = "note",
    Task = "task",
    Image = "image"
}

interface CreateContentModalProps {
    open: boolean;
    onClose: () => void;
    initialData?: any; // If provided, we are in edit mode
    onSuccess?: () => void;
}

export const CreateContentModal = ({ open, onClose, initialData, onSuccess }: CreateContentModalProps) => {
    const titleRef = useRef<HTMLInputElement>(null);
    const linkRef = useRef<HTMLInputElement>(null);
    const contentRef = useRef<HTMLTextAreaElement>(null);
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState<ContentType>(ContentType.Youtube);

    useEffect(() => {
        if (open && initialData) {
            // Pre-fill data
            setType(initialData.type);
            // We need to wait for render to set ref values, but basic state update works.
            // Using setTimeout to ensure refs are bound.
            setTimeout(() => {
                if (titleRef.current) titleRef.current.value = initialData.title || "";
                if (linkRef.current) linkRef.current.value = initialData.link || "";
                if (contentRef.current) {
                    // For tasks, show clean text only (remove [ ] or [x] prefix)
                    if (initialData.type === 'task' && initialData.content) {
                        contentRef.current.value = initialData.content.replace(/^\[(x| )\] /gm, "");
                    } else {
                        contentRef.current.value = initialData.content || "";
                    }
                }
            }, 0);
        } else if (open) {
            // Reset
            setType(ContentType.Youtube);
            setTimeout(() => {
                if (titleRef.current) titleRef.current.value = "";
                if (linkRef.current) linkRef.current.value = "";
                if (contentRef.current) contentRef.current.value = "";
            }, 0);
        }
    }, [open, initialData]);

    if (!open) return null;

    const handleSubmit = async () => {
        setLoading(true);
        const title = titleRef.current?.value;
        const link = linkRef.current?.value;
        const content = contentRef.current?.value;

        if (!title) { toast.error("Title is required"); setLoading(false); return; }
        if ((type === ContentType.Youtube || type === ContentType.Twitter || type === ContentType.Article || type === ContentType.Image) && !link) {
            toast.error("Link is required"); setLoading(false); return;
        }

        // URL Validation
        if (type === ContentType.Youtube) {
            const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
            if (!youtubeRegex.test(link || "")) {
                toast.error("Please enter a valid YouTube URL (youtube.com or youtu.be)");
                setLoading(false);
                return;
            }
        }

        if (type === ContentType.Twitter) {
            const socialRegex = /^(https?:\/\/)?(www\.)?((twitter|x)\.com|instagram\.com|linkedin\.com|facebook\.com|pinterest\.com|open\.spotify\.com)\/.+/;
            if (!socialRegex.test(link || "")) {
                toast.error("Invalid link! We support Twitter, Instagram, LinkedIn, Facebook, Pinterest, and Spotify.");
                setLoading(false);
                return;
            }
        }

        if (type === "task" && content) {
            const lines = content.split('\n');
            const invalidLines = lines.filter(line => {
                // Strip existing prefix if user typed it manually, though we strip on load
                const cleanLine = line.replace(/^\[(x| )\] /, "");
                return cleanLine.trim().split(/\s+/).length > 20;
            });

            if (invalidLines.length > 0) {
                toast.error("Tasks must be 20 words or less per item");
                setLoading(false);
                return;
            }
        }

        try {
            const token = localStorage.getItem("Authorization");

            // For tasks, ensure correct format if user edited raw text
            let finalContent = content;
            if (type === ContentType.Task && content) {
                finalContent = content.split('\n')
                    .map(line => {
                        // If user typed checks manually, keep them, otherwise default to unchecked [ ]
                        // But since we stripped them on load, we default to [ ] for new/edited lines
                        // unless they explicitly typed "[x] "
                        if (line.match(/^\[(x| )\] /)) return line;
                        return `[ ] ${line}`;
                    })
                    .join('\n');
            }

            if (initialData) {
                // Edit Mode
                await axios.put(`${BACKEND_URL}/api/v1/content`, {
                    contentId: initialData._id,
                    title,
                    link,
                    type,
                    content: finalContent
                }, {
                    headers: { "Authorization": token }
                });
                toast.success("Content updated!");
            } else {
                // Create Mode
                await axios.post(`${BACKEND_URL}/api/v1/content`, {
                    title,
                    link,
                    type,
                    content: finalContent
                }, {
                    headers: { "Authorization": token }
                });
                toast.success("Content added!");
            }
            if (onSuccess) onSuccess();
            onClose();
        } catch (e) {
            console.error(e);
            toast.error("Error saving content");
        } finally {
            setLoading(false);
        }
    };

    const TypeIcon = ({ t, icon: Icon, label }: { t: ContentType, icon: any, label: string }) => (
        <div
            onClick={() => setType(t)}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl cursor-pointer transition-all border ${type === t ? 'bg-indigo-50 border-indigo-500 text-indigo-600 dark:bg-indigo-900/30 dark:border-indigo-400 dark:text-indigo-400' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-600'}`}
        >
            <Icon size={20} />
            <span className="text-xs font-medium">{label}</span>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">{initialData ? 'Edit Content' : 'Add New Content'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content Type</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <TypeIcon t={ContentType.Youtube} icon={Youtube} label="Video" />
                            <TypeIcon t={ContentType.Twitter} icon={Share2} label="Social Media" />
                            <TypeIcon t={ContentType.Article} icon={FileText} label="Article" />
                            <TypeIcon t={ContentType.Image} icon={ImageIcon} label="Image" />
                            <TypeIcon t={ContentType.Note} icon={StickyNote} label="Note" />
                            <TypeIcon t={ContentType.Task} icon={CheckSquare} label="Task" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                            <Input ref={titleRef} placeholder="Enter title..." onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSubmit(); }} />
                        </div>

                        {(type === ContentType.Youtube || type === ContentType.Twitter || type === ContentType.Article || type === ContentType.Image) && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Link URL</label>
                                <Input ref={linkRef} placeholder="https://..." onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSubmit(); }} />
                            </div>
                        )}

                        {(type !== ContentType.Note && type !== ContentType.Task) && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Optional)</label>
                                <textarea
                                    ref={contentRef}
                                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white min-h-[80px]"
                                    placeholder="Add a description..."
                                ></textarea>
                            </div>
                        )}

                        {(type === ContentType.Note || type === ContentType.Task) && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{type === ContentType.Task ? "Tasks (one per line)" : "Note Content"}</label>
                                <textarea
                                    ref={contentRef}
                                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white min-h-[100px]"
                                    placeholder={type === ContentType.Task ? "- Buy milk\n- Walk dog" : "Type your note here..."}
                                ></textarea>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button text={loading ? "Saving..." : (initialData ? "Update Content" : "Create Content")} variant="primary" onClick={handleSubmit} loading={loading} />
                    </div>
                </div>
            </div>
        </div>
    );
};

