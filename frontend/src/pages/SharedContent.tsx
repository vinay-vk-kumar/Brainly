import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../Config";
import { Card } from "../components/Card";
import { ExpandedCardModal } from "../components/ExpandedCardModal";
import { CardSkeleton } from "../components/CardSkeleton";
import { BrainIcon } from "../icons/BrainIcon";
import { ThemeToggle } from "../components/ThemeToggle";
import { Spinner } from "../components/Spinner";


export default function SharedContent() {
    const { hash } = useParams();
    const [content, setContent] = useState<any>(null);
    const [expandedContent, setExpandedContent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function fetchSharedContent() {
            try {
                const response = await axios.get(`${BACKEND_URL}/api/v1/share/${hash}`);
                if (response.data.success) {
                    setContent(response.data.content);
                } else {
                    setError(true);
                }
            } catch (e) {
                console.error(e);
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        if (hash) fetchSharedContent();
    }, [hash]);

    if (loading) {
        return (
            <div className="relative min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300 flex flex-col items-center py-12 px-4">
                <div className="absolute right-4 top-4 z-10 md:right-8 md:top-8">
                    <ThemeToggle />
                </div>
                <Spinner size="lg" className="mb-6" label="Loading shared content" />
                <div className="w-full max-w-lg animate-fade-in">
                    <CardSkeleton />
                </div>
            </div>
        )
    }

    if (error || !content) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors p-4">
                <div className="text-indigo-600 dark:text-indigo-400 mb-4">
                    <BrainIcon height={64} width={64} />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mt-4">Content not found</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-center">This link might be invalid or has been disabled by the owner.</p>
            </div>
        )
    }

    return (
        <div className="relative min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300 flex flex-col items-center py-8 md:py-12 px-4">
            <div className="absolute right-4 top-4 z-10 md:right-8 md:top-8">
                <ThemeToggle />
            </div>

            <div className="mb-8 flex flex-col items-center animate-fade-in-down">
                <div className="text-indigo-600 dark:text-indigo-400 mb-2">
                    <BrainIcon height={48} width={48} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Brainly</h1>
                <p className="text-gray-500 dark:text-gray-400">Shared by {content.userId?.fullName || 'a user'}</p>
            </div>

            <div className="w-full max-w-lg animate-fade-in">
                <Card
                    {...content}
                    shareHash={null}
                    onDelete={undefined}
                    actionsEnabled={false}
                    onExpand={() => setExpandedContent(content)}
                />
            </div>

            {expandedContent && (
                <ExpandedCardModal
                    content={expandedContent}
                    onClose={() => setExpandedContent(null)}
                    onChange={(updatedItem) => {
                        // Optimistically update local state if user interacts in modal
                        setContent(updatedItem);
                        setExpandedContent(updatedItem);
                    }}
                />
            )}
        </div>
    );
}
