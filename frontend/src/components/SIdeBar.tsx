import { Home, Youtube, Share2, FileText, StickyNote, CheckSquare, Image as ImageIcon, LogOut, Brain, X, Bug } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";


interface SideBarProps {
    activeFilter: string;
    onSelect: (filter: string) => void;
    isOpen?: boolean;
    onClose?: () => void;
}

export const SideBar = ({ activeFilter, onSelect, isOpen, onClose }: SideBarProps) => {
    const items = [
        { id: 'all', label: 'All Notes', icon: Home },
        { id: 'youtube', label: 'Videos', icon: Youtube },
        { id: 'twitter', label: 'Social Media', icon: Share2 },
        { id: 'article', label: 'Articles', icon: FileText },
        { id: 'image', label: 'Images', icon: ImageIcon },
        { id: 'note', label: 'Notes', icon: StickyNote },
        { id: 'task', label: 'Tasks', icon: CheckSquare },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/50 md:hidden"
                    onClick={onClose}
                    aria-hidden
                />
            )}

            <div className={`w-64 h-screen max-h-screen fixed border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 left-0 top-0 flex flex-col z-30 transition-transform duration-300 ease-in-out will-change-transform shadow-xl shadow-gray-900/5 dark:shadow-black/30 md:translate-x-0 md:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="shrink-0 pt-6 px-6">
                    <div className="flex justify-between items-center gap-2">
                        <div className="flex items-center gap-2 text-2xl font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer" onClick={() => onSelect('all')}>
                            <Brain size={28} className="shrink-0" />
                            <span className="whitespace-nowrap">Brainly</span>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                            <ThemeToggle />
                            {onClose && (
                                <button type="button" onClick={onClose} className="md:hidden rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700" aria-label="Close menu">
                                    <X size={22} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto custom-scrollbar pt-6 px-4 space-y-1 pb-4">
                    {items.map(item => (
                        <div
                            key={item.id}
                            onClick={() => {
                                onSelect(item.id);
                                if (onClose && window.innerWidth < 768) onClose();
                            }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 active:scale-[0.98] ${activeFilter === item.id ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'}`}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </div>
                    ))}

                    {/* Admin Panel */}
                    {localStorage.getItem("role") === "admin" && (
                        <div
                            onClick={() => window.location.href = "/admin/bugs"}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 font-semibold transition-all duration-200 mt-2 border border-indigo-100 dark:border-indigo-800"
                        >
                            <span>Admin Panel</span>
                        </div>
                    )}
                </div>

                <div className="shrink-0 p-4 border-t border-gray-100 dark:border-gray-700 space-y-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
                    <div
                        onClick={() => onSelect('report-bug')}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                    >
                        <Bug size={20} className="text-red-500 shrink-0" />
                        <span>Report Bug</span>
                    </div>

                    <button onClick={() => { localStorage.removeItem("Authorization"); localStorage.removeItem("role"); window.location.href = "/"; }} className="flex items-center gap-3 px-4 py-3 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl w-full transition-colors duration-200">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </>
    )
}
