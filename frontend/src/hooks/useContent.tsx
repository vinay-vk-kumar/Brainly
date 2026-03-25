import { useEffect, useState } from "react";
import { BACKEND_URL } from "../Config";
import axios from "axios";

export interface Content {
    _id: string;
    title: string;
    link?: string;
    type: "youtube" | "twitter" | "article" | "note" | "task" | "image";
    content?: string;
    metadata?: any;
    shareHash?: string;
    isPinned?: boolean;
    order?: number;
}

export function useContent() {
    const [contents, setContents] = useState<Content[]>([])

    const [loading, setLoading] = useState(true);

    const refresh = async () => {
        const token = localStorage.getItem("Authorization");
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${BACKEND_URL}/api/v1/content`, {
                headers: {
                    "Authorization": token
                }
            });

            if (response.data.success) {
                setContents(response.data.content);
            }
        } catch (e) {
            console.error("Error fetching content", e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        refresh()
    }, [])

    return { contents, setContents, refresh, loading }
}