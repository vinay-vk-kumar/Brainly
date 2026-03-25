import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../Config";
import { ArrowLeft, Trash2, Eye, User, Mail, X } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ThemeToggle } from "../components/ThemeToggle";
import { Spinner } from "../components/Spinner";

type BugStatus = "open" | "in_progress" | "closed";
type FilterTab = "all" | BugStatus;

interface Bug {
    _id: string;
    description: string;
    priority: "low" | "medium" | "high";
    status: BugStatus;
    imageUrl?: string;
    createdAt: string;
    userId: {
        fullName: string;
        email: string;
    };
}

const PRIORITY_STYLES: Record<string, string> = {
    high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

const STATUS_STYLES: Record<BugStatus, string> = {
    open: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    in_progress: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    closed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

const STATUS_LABELS: Record<BugStatus, string> = {
    open: "Open",
    in_progress: "In Progress",
    closed: "Closed",
};

const FILTER_TABS: { id: FilterTab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "open", label: "Open" },
    { id: "in_progress", label: "In Progress" },
    { id: "closed", label: "Closed" },
];

export const AdminBugDashboard = () => {
    const [bugs, setBugs] = useState<Bug[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<FilterTab>("all");
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

    const token = localStorage.getItem("Authorization");
    const headers = { Authorization: token };

    useEffect(() => {
        fetchBugs();
    }, []);

    const fetchBugs = async () => {
        try {
            const res = await axios.get(`${BACKEND_URL}/api/v1/bugs/admin`, { headers });
            if (res.data.success) setBugs(res.data.bugs);
        } catch (error) {
            toast.error("Failed to load bugs");
        } finally {
            setLoading(false);
        }
    };

    const deleteBug = async (id: string) => {
        if (!confirm("Are you sure you want to delete this report?")) return;
        try {
            await axios.delete(`${BACKEND_URL}/api/v1/bugs/admin/${id}`, { headers });
            toast.success("Bug deleted");
            setBugs(prev => prev.filter(b => b._id !== id));
        } catch {
            toast.error("Failed to delete bug");
        }
    };

    const updateStatus = async (id: string, status: BugStatus) => {
        setUpdatingStatus(id);
        try {
            await axios.patch(`${BACKEND_URL}/api/v1/bugs/admin/${id}/status`, { status }, { headers });
            setBugs(prev => prev.map(b => b._id === id ? { ...b, status } : b));
            toast.success(`Marked as ${STATUS_LABELS[status]}`);
        } catch (e: any) {
            toast.error(e.response?.data?.message || "Failed to update status");
        } finally {
            setUpdatingStatus(null);
        }
    };

    const filteredBugs = activeTab === "all" ? bugs : bugs.filter(b => b.status === activeTab);

    const counts: Record<FilterTab, number> = {
        all: bugs.length,
        open: bugs.filter(b => b.status === "open").length,
        in_progress: bugs.filter(b => b.status === "in_progress").length,
        closed: bugs.filter(b => b.status === "closed").length,
    };

    if (loading) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400">
                <Spinner size="lg" label="Loading bug reports" />
                <p className="text-sm font-medium">Loading reports…</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-4 sm:px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link to="/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold">Bug Reports</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{bugs.length} total report{bugs.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <span className="hidden sm:block text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg text-sm">
                        Admin Panel
                    </span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
                {/* Status Filter Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                    {FILTER_TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                                }`}
                        >
                            {tab.label}
                            <span className={`px-1.5 py-0.5 rounded-md text-xs font-bold ${activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                                {counts[tab.id]}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Bug Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredBugs.length === 0 ? (
                        <div className="col-span-full text-center py-20 text-gray-400">
                            {activeTab === "all" ? "No bug reports yet. Good job! 🎉" : `No ${STATUS_LABELS[activeTab as BugStatus] || ''} bugs.`}
                        </div>
                    ) : (
                        filteredBugs.map((bug) => (
                            <div key={bug._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col transition-all hover:shadow-md">
                                {/* Card Header */}
                                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${PRIORITY_STYLES[bug.priority]}`}>
                                            {bug.priority}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[bug.status]}`}>
                                            {STATUS_LABELS[bug.status]}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-400 dark:text-gray-500 font-mono shrink-0">
                                        {new Date(bug.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                {/* Description */}
                                <div className="p-5 flex-1">
                                    <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap text-sm leading-relaxed line-clamp-4">
                                        {bug.description}
                                    </p>

                                    {/* User Info */}
                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-1.5">
                                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                            <User size={13} className="text-indigo-500 shrink-0" />
                                            <span className="font-medium text-gray-800 dark:text-gray-200 truncate">{bug.userId?.fullName || "Unknown"}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                            <Mail size={13} className="text-indigo-500 shrink-0" />
                                            <span className="truncate">{bug.userId?.email || "No email"}</span>
                                        </div>
                                    </div>

                                    {/* Status Changer */}
                                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Change Status</label>
                                        <select
                                            value={bug.status}
                                            disabled={updatingStatus === bug._id}
                                            onChange={(e) => updateStatus(bug._id, e.target.value as BugStatus)}
                                            className="w-full px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-60"
                                        >
                                            <option value="open">Open</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="px-5 pb-4 flex justify-between items-center gap-2">
                                    {bug.imageUrl ? (
                                        <button
                                            onClick={() => setSelectedImage(`${BACKEND_URL}${bug.imageUrl}`)}
                                            className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium"
                                        >
                                            <Eye size={14} /> View Screenshot
                                        </button>
                                    ) : <div />}
                                    <button
                                        onClick={() => deleteBug(bug._id)}
                                        className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 dark:hover:text-red-400 font-medium"
                                    >
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Image Modal */}
            {selectedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setSelectedImage(null)}>
                    <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={e => e.stopPropagation()}>
                        <button
                            className="absolute -top-10 right-0 text-white/80 hover:text-white flex items-center gap-1.5 text-sm"
                            onClick={() => setSelectedImage(null)}
                        >
                            <X size={18} /> Close
                        </button>
                        <img src={selectedImage} alt="Bug Screenshot" className="w-full h-full object-contain rounded-xl shadow-2xl" />
                    </div>
                </div>
            )}
        </div>
    );
};
