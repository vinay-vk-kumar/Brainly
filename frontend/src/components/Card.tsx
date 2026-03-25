import { Share2, Trash2, ExternalLink, Copy, Check, FileText, Youtube, Twitter, Image as ImageIcon, CheckSquare, StickyNote, Edit, Calendar, GripVertical, MoreVertical, Pin, PinOff } from "lucide-react";
import { InstagramEmbed, PinterestEmbed } from 'react-social-media-embed';
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { BACKEND_URL } from "../Config";
import { motion } from "framer-motion";

interface CardProps {
    _id: string;
    title: string;
    link?: string;
    type: "twitter" | "youtube" | "article" | "note" | "task" | "image";
    content?: string;
    metadata?: any;
    shareHash?: string | null;
    createdAt?: string;
    onDelete?: () => void;
    onEdit?: () => void;
    onPin?: () => void;
    onExpand?: () => void;
    isPinned?: boolean;
    dragHandleProps?: any;
    showFullContent?: boolean;
    actionsEnabled?: boolean;
    onChange?: (updatedContent: any) => void;
}
export const Card = ({ _id, title, link, type, content, metadata, shareHash: initialShareHash, createdAt, onDelete, onEdit, onPin, onExpand, onChange, isPinned, dragHandleProps, showFullContent = false, actionsEnabled = true }: CardProps) => {
    const [shareHash, setShareHash] = useState<string | null | undefined>(initialShareHash);
    const [tasks, setTasks] = useState<string[]>(content ? content.split('\n') : []);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [mediaLoaded, setMediaLoaded] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const articleImgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        setMediaLoaded(false);
        const timer = setTimeout(() => setMediaLoaded(true), 5000); // Fail-safe
        return () => clearTimeout(timer);
    }, [link, type]);

    // Sync local tasks state with content prop
    useEffect(() => {
        setTasks(content ? content.split('\n') : []);
    }, [content]);

    useEffect(() => {
        if (type === 'image' && imgRef.current?.complete) {
            setMediaLoaded(true);
        }
        if (type === 'article' && articleImgRef.current?.complete) {
            setMediaLoaded(true);
        }
    }, [type, link, content]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Load Twitter widget script
    useEffect(() => {
        if (type === "twitter") {
            const script = document.createElement("script");
            script.src = "https://platform.twitter.com/widgets.js";
            script.async = true;
            document.body.appendChild(script);
            return () => {
                document.body.removeChild(script);
            }
        }
    }, [type]);

    const handleShare = async () => {
        const token = localStorage.getItem("Authorization");
        try {
            if (shareHash) {
                await axios.post(`${BACKEND_URL}/api/v1/content/unshare`, { contentId: _id }, { headers: { Authorization: token } });
                setShareHash(null);
                toast.success("Link disabled");
            } else {
                const response = await axios.post(`${BACKEND_URL}/api/v1/content/share`, { contentId: _id }, { headers: { Authorization: token } });
                setShareHash(response.data.shareHash);
                toast.success("Link generated");
                const url = `${window.location.origin}/share/${response.data.shareHash}`;
                navigator.clipboard.writeText(url);
                toast("Copied to clipboard!");
            }
        } catch (e) {
            console.error("Share error", e);
            toast.error("Failed to share");
        }
        setShowMenu(false);
    };

    const copyLink = () => {
        if (!shareHash) return;
        const url = `${window.location.origin}/share/${shareHash}`;
        navigator.clipboard.writeText(url);
        toast.success("Link copied!");
        setShowMenu(false);
    };

    const toggleTask = async (index: number) => {
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
        setTasks(newTasks);

        // Persist change
        try {
            const token = localStorage.getItem("Authorization");
            const updatedContent = newTasks.join('\n');
            await axios.put(`${BACKEND_URL}/api/v1/content`, {
                contentId: _id,
                content: updatedContent,
                type: 'task',
                title,
                link
            }, { headers: { Authorization: token } });

            if (onChange) {
                onChange({
                    _id,
                    title,
                    link,
                    type: 'task',
                    content: updatedContent,
                    metadata,
                    isPinned,
                    createdAt
                });
            }
        } catch (e) {
            console.error("Failed to save task", e);
            toast.error("Failed to save task state");
        }
    };

    const MediaSkeleton = () => (
        <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mt-3 flex items-center justify-center">
            <div className="text-gray-400 dark:text-gray-600">
                <ImageIcon size={24} />
            </div>
        </div>
    );

    const renderContent = () => {
        const description = (type !== 'note' && type !== 'task' && content) ? (
            <div className={`mt-3 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap font-sans ${showFullContent ? '' : 'line-clamp-13'}`} title={content}>
                {content}
            </div>
        ) : null;

        switch (type) {
            case "youtube":
                let videoId = "";
                if (link) {
                    try {
                        const url = new URL(link);
                        videoId = url.searchParams.get("v") || "";
                        if (!videoId && link.includes("youtu.be")) {
                            videoId = link.split("/").pop() || "";
                        }
                    } catch (e) { }
                }
                return (
                    <>
                        {videoId ? (
                            <>
                                {!mediaLoaded && <MediaSkeleton />}
                                <iframe
                                    className={`w-full h-48 rounded-lg mt-3 ${mediaLoaded ? 'block' : 'hidden'}`}
                                    src={`https://www.youtube.com/embed/${videoId}`}
                                    allowFullScreen
                                    title={title}
                                    onLoad={() => setMediaLoaded(true)}
                                ></iframe>
                            </>
                        ) : null}
                        {description}
                    </>
                );
            case "twitter":
                // Detect Platform
                const isInstagram = link?.match(/instagram\.com/);
                const isLinkedIn = link?.match(/linkedin\.com/);
                const isPinterest = link?.match(/pinterest\.com/);
                const isSpotify = link?.match(/open\.spotify\.com/);
                // Default to generic/twitter if no other match

                let EmbedComponent = null;

                if (isInstagram) {
                    EmbedComponent = <InstagramEmbed url={link || ""} width="100%" />;
                } else if (isLinkedIn) {
                    // Extract activity ID
                    let embedUrl = null;
                    const activityMatch = link?.match(/activity-(\d+)/);
                    const ugcMatch = link?.match(/urn:li:ugcPost:(\d+)/);
                    const activityUrnMatch = link?.match(/urn:li:activity:(\d+)/);

                    if (activityMatch) {
                        embedUrl = `https://www.linkedin.com/embed/feed/update/urn:li:activity:${activityMatch[1]}`;
                    } else if (activityUrnMatch) {
                        embedUrl = `https://www.linkedin.com/embed/feed/update/urn:li:activity:${activityUrnMatch[1]}`;
                    } else if (ugcMatch) {
                        embedUrl = `https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:${ugcMatch[1]}`;
                    }

                    if (embedUrl) {
                        EmbedComponent = <iframe src={embedUrl} height="250" width="100%" frameBorder="0" allowFullScreen title="LinkedIn Embed" style={{ borderRadius: '8px' }}></iframe>;
                    } else {
                        // Fallback to generic card if not a supported embeddable link
                        return (
                            <div className="-mt-1 relative">
                                <div className={`p-4 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col items-center justify-center text-center gap-2 ${showFullContent ? '' : 'min-h-[150px]'}`}>
                                    <div className="bg-white dark:bg-gray-700 p-3 rounded-full shadow-sm">
                                        <Share2 className="text-blue-600 dark:text-blue-400" size={24} />
                                    </div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">View Post on LinkedIn</p>
                                    <a href={link} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:underline break-all px-4 line-clamp-1">
                                        {link}
                                    </a>
                                </div>
                                {description}
                            </div>
                        );
                    }
                } else if (isPinterest) {
                    EmbedComponent = <PinterestEmbed url={link || ""} width="100%" height={250} />;
                } else if (isSpotify) {
                    const spotifyUrl = link?.replace("open.spotify.com", "open.spotify.com/embed");
                    EmbedComponent = <iframe style={{ borderRadius: 12 }} src={spotifyUrl} width="100%" height="152" frameBorder="0" allowFullScreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>;
                } else {
                    // Default to Twitter/X style
                    return (
                        <div className="-mt-1 relative">
                            <div className={`${showFullContent ? '' : 'max-h-[250px] overflow-hidden'} rounded-lg border border-gray-100 dark:border-gray-700 relative min-h-[150px]`}>
                                <div className="absolute inset-0 bg-gray-50 dark:bg-gray-800 animate-pulse z-0 flex items-center justify-center">
                                    <Twitter className="text-gray-300 dark:text-gray-600" size={32} />
                                </div>
                                <div className="relative z-10 min-h-[150px]">
                                    <blockquote className="twitter-tweet">
                                        <a href={link?.replace("x.com", "twitter.com")}></a>
                                    </blockquote>
                                </div>
                                {!showFullContent && <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white dark:from-gray-800 to-transparent pointer-events-none z-20"></div>}
                            </div>
                            {description}
                            {!showFullContent && (
                                <div className="mt-2 text-center">
                                    <span className="text-xs text-indigo-500 dark:text-indigo-400 font-medium cursor-pointer hover:underline" onClick={onExpand}>
                                        Click to view full post
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                }

                return (
                    <div className="-mt-1 relative">
                        <div className={`${showFullContent ? '' : 'max-h-[250px] overflow-hidden'} rounded-lg border border-gray-100 dark:border-gray-700 relative min-h-[150px] bg-white dark:bg-black overflow-y-auto custom-scrollbar`}>
                            {EmbedComponent}
                            {!showFullContent && <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white dark:from-gray-800 to-transparent pointer-events-none z-20"></div>}
                        </div>
                        {description}
                    </div>
                );

            case "image":
                return (
                    <div className="relative">
                        {!mediaLoaded && <div className="absolute inset-0 z-10"><MediaSkeleton /></div>}
                        <img
                            ref={imgRef}
                            src={link}
                            alt={title}
                            className={`w-full h-48 object-cover rounded-lg mt-3 transition-opacity duration-300 ${mediaLoaded ? 'opacity-100' : 'opacity-0'}`}
                            onLoad={() => setMediaLoaded(true)}
                            onError={() => setMediaLoaded(true)}
                        />
                        {description}
                    </div>
                );
            case "article":
                return (
                    <>
                        <a href={link} target="_blank" rel="noopener noreferrer" className="block mt-3 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition group mb-2">
                            {metadata?.image && (
                                <div className="relative mb-2">
                                    {!mediaLoaded && <div className="absolute inset-0 z-10 w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>}
                                    <img
                                        ref={articleImgRef}
                                        src={metadata.image}
                                        alt={metadata.title}
                                        className={`w-full h-48 object-cover rounded-md transition-opacity duration-300 ${mediaLoaded ? 'opacity-100' : 'opacity-0'}`}
                                        onLoad={() => setMediaLoaded(true)}
                                        onError={() => setMediaLoaded(true)}
                                    />
                                </div>
                            )}
                            <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{metadata?.title || title}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">{metadata?.description}</div>
                        </a>
                        {description}

                    </>
                );
            case "note":
                return (
                    <div className="mt-3">
                        <p className={`text-gray-600 dark:text-gray-300 whitespace-pre-wrap font-mono text-sm ${showFullContent ? '' : 'line-clamp-[16]'}`}>
                            {content}
                        </p>
                    </div>
                );
            case "task":
                return (
                    <div className={`mt-3 space-y-2 ${showFullContent ? '' : 'max-h-[310px] overflow-y-auto custom-scrollbar'} pr-2`}>
                        {tasks.map((task, i) => {
                            const isChecked = task.startsWith("[x] ");
                            const cleanTask = task.replace(/^\[x\] |^\[ \] /, "");
                            return (
                                <div key={i} className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-1.5 rounded transition" onClick={() => toggleTask(i)}>
                                    <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${isChecked ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300 dark:border-gray-500'}`}>
                                        {isChecked && <Check size={12} className="text-white" />}
                                    </div>
                                    <span className={`text-sm ${isChecked ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-700 dark:text-gray-300'}`}>{cleanTask}</span>
                                </div>
                            )
                        })}
                    </div>
                );
            default:
                return null;
        }
    };

    const Icon = {
        youtube: Youtube,
        twitter: Share2,
        article: ExternalLink,
        note: StickyNote,
        task: CheckSquare,
        image: ImageIcon
    }[type] || FileText;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4 }}
            className={`bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100/90 dark:border-gray-700/90 p-5 transition-[box-shadow,transform,border-color] duration-200 hover:-translate-y-0.5 flex flex-col w-full relative group backdrop-blur-sm ${showFullContent ? 'min-h-[200px]' : 'min-h-[360px] sm:h-[500px] overflow-hidden'} ${isPinned ? 'ring-2 ring-indigo-500/20 dark:ring-indigo-400/20' : ''}`}
        >
            {/* Drag Handle - Only if NOT pinned */}
            {dragHandleProps && !isPinned && (
                <div
                    {...dragHandleProps}
                    className="absolute top-6 left-2 p-1 text-gray-300 dark:text-gray-600 cursor-grab active:cursor-grabbing hover:bg-gray-100 dark:hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 touch-none"
                    title="Drag to reorder"
                >
                    <GripVertical size={20} />
                </div>
            )}

            {/* Pinned Indicator */}
            {isPinned && (
                <div className="absolute top-6 left-2 p-1 text-indigo-500 z-10">
                    <Pin size={18} fill="currentColor" />
                </div>
            )}

            <div className={`flex justify-between items-start mb-2 ${dragHandleProps || isPinned ? 'pl-3' : ''}`}>
                <div className="flex items-center gap-3 max-w-[80%] cursor-pointer" onClick={onExpand}>
                    <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0 shadow-inner">
                        <Icon size={20} />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 leading-tight text-lg hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{title}</h3>
                </div>

                <div className="relative" ref={menuRef}>
                    {actionsEnabled && (
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition sm:opacity-0 sm:group-hover:opacity-100 opacity-100"
                        >
                            <MoreVertical size={20} />
                        </button>
                    )}

                    {showMenu && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-20 animate-fade-in max-sm:right-0">
                            {onEdit && (
                                <button
                                    onClick={() => { onEdit(); setShowMenu(false); }}
                                    className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                >
                                    <Edit size={16} className="mr-2" />
                                    Edit
                                </button>
                            )}
                            {onPin && (
                                <button
                                    onClick={() => { onPin(); setShowMenu(false); }}
                                    className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                >
                                    {isPinned ? <PinOff size={16} className="mr-2" /> : <Pin size={16} className="mr-2" />}
                                    {isPinned ? "Unpin" : "Pin"}
                                </button>
                            )}
                            <button
                                onClick={handleShare}
                                className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                            >
                                <Share2 size={16} className="mr-2" />
                                {shareHash ? "Disable Link" : "Share Link"}
                            </button>
                            {shareHash && (
                                <button
                                    onClick={copyLink}
                                    className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                >
                                    <Copy size={16} className="mr-2" />
                                    Copy Link
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={() => { onDelete(); setShowMenu(false); }}
                                    className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition border-t border-gray-50 dark:border-gray-700/50 mt-1"
                                >
                                    <Trash2 size={16} className="mr-2" />
                                    Delete
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className={`text-sm border-t border-gray-100 dark:border-gray-700 pt-3 mt-2 flex-grow ${showFullContent ? '' : 'overflow-hidden'}`}>
                {renderContent()}
            </div>

            {createdAt && (
                <div className="mt-5 pt-3 border-t border-gray-50 dark:border-gray-700/50 flex items-center text-xs text-gray-400 dark:text-gray-500 font-medium">
                    <Calendar size={12} className="mr-1.5" />
                    Added on {(() => {
                        try {
                            return format(new Date(createdAt), "MMM d, yyyy");
                        } catch (e) {
                            return "";
                        }
                    })()}
                </div>
            )}
        </motion.div>
    );
};
