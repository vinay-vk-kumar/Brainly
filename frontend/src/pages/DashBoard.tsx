import { useState, useEffect, useRef } from 'react'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable';

import { Button } from '../components/Button'

import { SortableCard } from '../components/SortableCard'
import { CardSkeleton } from '../components/CardSkeleton'
import { CreateContentModal } from '../components/CreateContentModal'
import { SideBar } from '../components/SIdeBar'
import { useContent } from '../hooks/useContent'
import axios from 'axios'
import { BACKEND_URL } from '../Config'
import { Search, Plus, Menu, Sparkles, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import toast from 'react-hot-toast'

import { ExpandedCardModal } from '../components/ExpandedCardModal'
import { ReportBugModal } from '../components/ReportBugModal'
import { ThemeToggle } from '../components/ThemeToggle'

function DashBoard() {
    const [modalOpen, setModalOpen] = useState(false)
    const { contents, refresh, loading, setContents } = useContent();
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [editingContent, setEditingContent] = useState<any>(null);
    const [expandedContent, setExpandedContent] = useState<any>(null);
    const [bugModalOpen, setBugModalOpen] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);

    // Debounce search input 300 ms
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(t);
    }, [search]);

    // Ctrl+K / Cmd+K focuses search
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );



    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`${BACKEND_URL}/api/v1/content`, {
                data: { contentId: id },
                headers: { Authorization: localStorage.getItem("Authorization") }
            });
            toast.success("Content deleted");
            refresh();
        } catch (e) {
            console.error("Delete error", e);
            toast.error("Failed to delete content");
        }
    };

    const handleEdit = (content: any) => {
        setEditingContent(content);
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setEditingContent(null);
    };

    const handlePin = async (id: string, currentPinStatus: boolean) => {
        try {
            await axios.put(`${BACKEND_URL}/api/v1/content/toggle-pin`,
                { contentId: id, isPinned: !currentPinStatus },
                { headers: { Authorization: localStorage.getItem("Authorization") } }
            );
            refresh(); // Refresh to re-sort
            toast.success(currentPinStatus ? "Item Unpinned" : "Item Pinned");
        } catch (e) {
            toast.error("Failed to update pin status");
        }
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setContents((items) => {
                // Optimization: We should only reorder the UNPINNED items among themselves.
                // The indices in arrayMove are based on the passed array.
                // Since we only pass unpinned items to SortableContext, 'items' here refers to the state 'contents'.
                // We need to carefully construct the new state.

                const unpinnedItems = items.filter(i => !i.isPinned);
                const pinnedItems = items.filter(i => i.isPinned);

                const oldUnpinnedIndex = unpinnedItems.findIndex(i => i._id === active.id);
                const newUnpinnedIndex = unpinnedItems.findIndex(i => i._id === over.id);

                if (oldUnpinnedIndex !== -1 && newUnpinnedIndex !== -1) {
                    const reorderedUnpinned = arrayMove(unpinnedItems, oldUnpinnedIndex, newUnpinnedIndex);

                    // Assign new order values based on index LOCAL STATE UPDATE
                    const updatedReorderedUnpinned = reorderedUnpinned.map((item, index) => ({
                        ...item,
                        order: index
                    }));

                    // Prepare updates for backend
                    const updates = updatedReorderedUnpinned.map((item) => ({
                        _id: item._id,
                        order: item.order
                    }));

                    // Send updates to backend
                    axios.put(`${BACKEND_URL}/api/v1/content/reorder`, { items: updates }, {
                        headers: { Authorization: localStorage.getItem("Authorization") }
                    }).catch(err => console.error("Reorder save failed", err));

                    return [...pinnedItems, ...updatedReorderedUnpinned];
                }

                return items;
            });
        }
    }

    const filteredContents = [...contents].sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return (a.order || 0) - (b.order || 0);
    }).filter(c => {
        const matchesFilter = filter === 'all' || c.type === filter;
        const q = debouncedSearch.toLowerCase();
        const matchesSearch = !q || c.title.toLowerCase().includes(q) ||
            c.content?.toLowerCase().includes(q) ||
            c.metadata?.description?.toLowerCase().includes(q);
        return matchesFilter && matchesSearch;
    });


    return (
        <div className='flex bg-gray-50 dark:bg-gray-900 min-h-screen font-sans transition-colors duration-300 custom-scrollbar'>
            <SideBar
                activeFilter={filter}
                onSelect={(f) => {
                    if (f === 'report-bug') {
                        setBugModalOpen(true);
                    } else {
                        setFilter(f);
                    }
                }}
                isOpen={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
            />

            <div className='flex-1 ml-0 md:ml-64 p-4 md:p-8 transition-all duration-300 ease-out'>
                <CreateContentModal
                    open={modalOpen}
                    onClose={handleModalClose}
                    initialData={editingContent}
                    onSuccess={refresh}
                />

                <div className='sticky top-3 z-10 mb-8 rounded-2xl glass-surface p-4 md:p-5'>
                    {/* Row 1: Title + actions */}
                    <div className='flex justify-between items-center gap-3'>
                        <div className="flex items-center gap-3 min-w-0">
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(true)}
                                className="md:hidden shrink-0 rounded-xl p-2 text-gray-500 transition hover:bg-gray-200/80 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                <Menu size={24} />
                            </button>
                            <div className="min-w-0">
                                <motion.h1
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white truncate"
                                >
                                    My Brain
                                </motion.h1>
                                <p className="hidden md:block text-gray-500 dark:text-gray-400 mt-1 text-sm">All your notes, links, and ideas.</p>
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                            <ThemeToggle className="md:hidden" />
                            <span className="md:hidden">
                                <Button text='Add' variant='primary' startIcon={<Plus size={18} />} onClick={() => setModalOpen(true)} />
                            </span>
                            <span className="hidden md:block">
                                <Button text='Add Content' variant='primary' startIcon={<Plus size={20} />} onClick={() => setModalOpen(true)} />
                            </span>
                        </div>
                    </div>

                    {/* Row 2: Search — full width on all sizes */}
                    <div className="relative mt-3 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition z-10" size={18} />
                        <input
                            ref={searchRef}
                            type="text"
                            placeholder="Search… (Ctrl+K)"
                            className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-sm transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>


                {loading ? (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10'>
                        {[...Array(8)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04, duration: 0.35 }}
                            >
                                <CardSkeleton />
                            </motion.div>
                        ))}
                    </div>
                ) : filteredContents.length === 0 ? (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.35 }}
                            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white/60 px-8 py-16 text-center dark:border-gray-700 dark:bg-gray-800/40"
                        >
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                                <Sparkles size={28} strokeWidth={1.75} />
                            </div>
                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">No content yet</p>
                            <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
                                {search || filter !== "all"
                                    ? "Try clearing search or picking another category in the sidebar."
                                    : "Add your first note, link, or idea with the button above."}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                ) : (
                    <>
                        {/* Pinned Items - No Drag and Drop */}
                        {filteredContents.some(c => c.isPinned) && (
                            <div className='mb-8'>
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                    Pinned
                                </h2>
                                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                                    {filteredContents.filter(c => c.isPinned).map((c) => (
                                        <SortableCard
                                            key={c._id}
                                            id={c._id}
                                            content={c}
                                            onDelete={() => handleDelete(c._id)}
                                            onEdit={() => handleEdit(c)}
                                            onPin={() => handlePin(c._id, c.isPinned || false)}
                                            onExpand={() => setExpandedContent(c)}
                                            onChange={(updatedItem) => {
                                                setContents(prev => prev.map(item => item._id === updatedItem._id ? { ...item, ...updatedItem } : item));
                                            }}
                                        />
                                    ))}
                                </div>
                                <div className="h-px bg-gray-200 dark:bg-gray-700 my-8"></div>
                            </div>
                        )}

                        {/* Unpinned Items - Draggable */}
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={filteredContents.filter(c => !c.isPinned).map(c => c._id)}
                                strategy={rectSortingStrategy}
                            >
                                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10'>
                                    {filteredContents.filter(c => !c.isPinned).map((c) => (
                                        <SortableCard
                                            key={c._id}
                                            id={c._id}
                                            content={c}
                                            onDelete={() => handleDelete(c._id)}
                                            onEdit={() => handleEdit(c)}
                                            onPin={() => handlePin(c._id, c.isPinned || false)}
                                            onExpand={() => setExpandedContent(c)}
                                            onChange={(updatedItem) => {
                                                setContents(prev => prev.map(item => item._id === updatedItem._id ? { ...item, ...updatedItem } : item));
                                            }}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </>
                )}
            </div>

            <ExpandedCardModal
                content={expandedContent}
                onClose={() => setExpandedContent(null)}
                onChange={(updatedItem) => {
                    setExpandedContent(updatedItem);
                    setContents(prev => prev.map(c => c._id === updatedItem._id ? updatedItem : c));
                }}
            />

            <ReportBugModal
                isOpen={bugModalOpen}
                onClose={() => setBugModalOpen(false)}
            />
        </div>

    )
}

export default DashBoard
