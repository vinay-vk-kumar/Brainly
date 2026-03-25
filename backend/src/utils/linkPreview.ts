import axios from 'axios';
import * as cheerio from 'cheerio';

export const getLinkPreview = async (url: string) => {
    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });
        const html = response.data;
        const $ = cheerio.load(html);

        const title = $('meta[property="og:title"]').attr('content') || $('title').text() || "";
        const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || "";
        const image = $('meta[property="og:image"]').attr('content') || "";

        return {
            title,
            description,
            image
        };
    } catch (error) {
        console.error("Error fetching link preview:", error);
        return {
            title: "",
            description: "",
            image: ""
        };
    }
}
