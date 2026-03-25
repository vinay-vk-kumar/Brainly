import { X, ExternalLink, Calendar, Youtube, FileText, StickyNote, CheckSquare, Image as ImageIcon, Check, Share2 } from "lucide-react";
import { InstagramEmbed, PinterestEmbed } from 'react-social-media-embed';
import { format } from "date-fns";
import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../Config";
import toast from "react-hot-toast";

interface ExpandedCardModalProps {
    content: any;
    onClose: () => void;
    onChange?: (updatedContent: any) => void;
}

export const ExpandedCardModal = ({ content: initialContent, onClose, onChange }: ExpandedCardModalProps) => {
    const [content, setContent] = useState(initialContent);

    useEffect(() => {
        setContent(initialContent);
    }, [initialContent]);

    useEffect(() => {
        if (content?.type === "twitter") {
            const script = document.createElement("script");
            script.src = "https://platform.twitter.com/widgets.js";
            script.async = true;
            document.body.appendChild(script);
            return () => {
                document.body.removeChild(script);
            }
        }
    }, [content?.type]);

    if (!content) return null;

    const toggleTask = async (index: number) => {
        const tasks = content.content ? content.content.split('\n') : [];
        const newTasks = [...tasks];
        const line = newTasks[index];
        const isChecked = line.startsWith("[x] ");

        if (isChecked) {
            newTasks[index] = line.substring(4);
        } else {
            if (line.startsWith("[ ] ")) {
                newTasks[index] = line.replace("[ ] ", "[x] ");
            } else {
                newTasks[index] = "[x] " + line;
            }
        }

        const updatedContentStr = newTasks.join('\n');
        const updatedItem = { ...content, content: updatedContentStr };
        setContent(updatedItem);

        // Persist change
        try {
            const token = localStorage.getItem("Authorization");
            await axios.put(`${BACKEND_URL}/api/v1/content`, {
                contentId: content._id,
                content: updatedContentStr,
                type: 'task',
                title: content.title,
                link: content.link
            }, { headers: { Authorization: token } });

            if (onChange) {
                onChange(updatedItem);
            }
        } catch (e) {
            console.error("Failed to save task", e);
            toast.error("Failed to save task state");
        }
    };

    const Icon = {
        youtube: Youtube,
        twitter: Share2,
        article: FileText,
        note: StickyNote,
        task: CheckSquare,
        image: ImageIcon
    }[content.type as string] || FileText;

    const renderExpandedContent = () => {
        switch (content.type) {
            case "youtube":
                let videoId = "";
                if (content.link) {
                    try {
                        const url = new URL(content.link);
                        videoId = url.searchParams.get("v") || "";
                        if (!videoId && content.link.includes("youtu.be")) {
                            videoId = content.link.split("/").pop() || "";
                        }
                    } catch (e) { }
                }
                return (
                    <div className="w-full aspect-video">
                        <iframe
                            className="w-full h-full rounded-xl"
                            src={`https://www.youtube.com/embed/${videoId}`}
                            allowFullScreen
                            title={content.title}
                        ></iframe>
                    </div>
                );
            case "twitter":
                // Detect Platform
                const isInstagram = content.link?.match(/instagram\.com/);
                const isLinkedIn = content.link?.match(/linkedin\.com/);
                const isPinterest = content.link?.match(/pinterest\.com/);
                const isSpotify = content.link?.match(/open\.spotify\.com/);

                if (isInstagram) {
                    return (
                        <div className="flex justify-center w-full">
                            <InstagramEmbed url={content.link || ""} width="100%" />
                        </div>
                    );
                } else if (isLinkedIn) {
                    // Extract activity ID
                    let embedUrl = null;
                    const activityMatch = content.link?.match(/activity-(\d+)/);
                    const ugcMatch = content.link?.match(/urn:li:ugcPost:(\d+)/);
                    const activityUrnMatch = content.link?.match(/urn:li:activity:(\d+)/);

                    if (activityMatch) {
                        embedUrl = `https://www.linkedin.com/embed/feed/update/urn:li:activity:${activityMatch[1]}`;
                    } else if (activityUrnMatch) {
                        embedUrl = `https://www.linkedin.com/embed/feed/update/urn:li:activity:${activityUrnMatch[1]}`;
                    } else if (ugcMatch) {
                        embedUrl = `https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:${ugcMatch[1]}`;
                    }

                    if (embedUrl) {
                        return (
                            <div className="flex justify-center w-full">
                                <iframe src={embedUrl} height="550" width="100%" frameBorder="0" allowFullScreen title="LinkedIn Embed" style={{ borderRadius: '8px' }}></iframe>
                            </div>
                        );
                    } else {
                        return (
                            <div className="flex flex-col items-center justify-center p-12 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                                <div className="bg-white dark:bg-gray-700 p-4 rounded-full shadow-md mb-4">
                                    <Share2 className="text-blue-600 dark:text-blue-400" size={48} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">View on LinkedIn</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
                                    Click the link below to view this post on LinkedIn.
                                </p>
                                <a
                                    href={content.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition shadow-sm flex items-center gap-2"
                                >
                                    <ExternalLink size={18} />
                                    Open Post
                                </a>
                            </div>
                        );
                    }
                } else if (isPinterest) {
                    return (
                        <div className="flex justify-center w-full">
                            <PinterestEmbed url={content.link || ""} width="100%" height={500} />
                        </div>
                    );
                } else if (isSpotify) {
                    const spotifyUrl = content.link?.replace("open.spotify.com", "open.spotify.com/embed");
                    return (
                        <div className="w-full">
                            <iframe style={{ borderRadius: 12 }} src={spotifyUrl} width="100%" height="352" frameBorder="0" allowFullScreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
                        </div>
                    );
                }

                // Default to Twitter/X
                return (
                    <div className="flex justify-center">
                        <blockquote className="twitter-tweet">
                            <a href={content.link?.replace("x.com", "twitter.com")}></a>
                        </blockquote>
                    </div>
                );
            case "image":
                return <img src={content.link} alt={content.title} className="w-full h-auto max-h-[60vh] object-contain rounded-xl" />;
            case "article":
                return (
                    <div className="space-y-4">
                        <a href={content.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium">
                            <ExternalLink size={16} />
                            Visit Article
                        </a>
                        {content.metadata?.image && <img src={content.metadata.image} alt={content.metadata.title} className="w-full h-64 object-cover rounded-xl" />}
                        {content.metadata?.description && (
                            <p className="text-gray-600 dark:text-gray-300 italic border-l-4 border-gray-200 dark:border-gray-700 pl-4 py-1">
                                {content.metadata.description}
                            </p>
                        )}
                    </div>
                );
            case "note":
                return <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap font-mono text-base leading-relaxed">{content.content}</p>;
            case "task":
                const tasks = content.content ? content.content.split('\n') : [];
                return (
                    <div className="space-y-3">
                        {tasks.map((task: string, i: number) => {
                            const isChecked = task.startsWith("[x] ");
                            const cleanTask = task.replace(/^\[x\] |^\[ \] /, "");
                            return (
                                <div key={i} className="flex items-start gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-lg cursor-pointer transition-colors" onClick={() => toggleTask(i)}>
                                    <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${isChecked ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300 dark:border-gray-500'}`}>
                                        {isChecked && <Check size={14} className="text-white" />}
                                    </div>
                                    <span className={`text-base ${isChecked ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-800 dark:text-gray-200'}`}>{cleanTask}</span>
                                </div>
                            )
                        })}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-start p-6 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                            <Icon size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">{content.title}</h2>
                            {content.createdAt && (
                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                    <Calendar size={14} className="mr-1.5" />
                                    {(() => {
                                        try {
                                            return format(new Date(content.createdAt), "MMMM d, yyyy 'at' h:mm a");
                                        } catch (e) {
                                            return "";
                                        }
                                    })()}
                                </div>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto custom-scrollbar flex-grow">
                    {renderExpandedContent()}

                    {/* User Description - Separate from type-specific content */}
                    {content.content && content.type !== 'note' && content.type !== 'task' && (
                        <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Description</h3>
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{content.content}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
