import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

// Configure Cloudinary from env vars
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memoryStorage — file never touches disk, goes straight to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req: any, file: any, cb: any) => {
    const allowedMime = /jpeg|jpg|png|gif|webp/;
    if (allowedMime.test(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only images are allowed (jpeg, jpg, png, gif, webp)"));
    }
};

export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter,
});

/**
 * Upload a buffer to Cloudinary and return the secure URL.
 * @param buffer  - The file buffer from multer memoryStorage
 * @param folder  - Cloudinary folder to organise uploads (e.g. "brainly/bugs")
 */
export function uploadToCloudinary(buffer: Buffer, folder: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image",
                transformation: [{ quality: "auto", fetch_format: "auto" }],
            },
            (error, result) => {
                if (error || !result) {
                    reject(error || new Error("Cloudinary upload failed"));
                } else {
                    resolve(result.secure_url);
                }
            }
        );

        // Pipe the buffer into the upload stream
        const readable = new Readable();
        readable.push(buffer);
        readable.push(null);
        readable.pipe(uploadStream);
    });
}
