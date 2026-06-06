import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import dotenv from "dotenv";
dotenv.config();

const ALLOWED_TYPES = ["image/png", "image/jpg", "image/jpeg"];

const storage: multer.StorageEngine = new GridFsStorage({
    url: process.env.MONGO_URI as string,
    file: (_req: Express.Request, file: Express.Multer.File) => {

        return {
            bucketName: "uploads",
            filename: `${Date.now()}_${file.originalname}`,

        };
    },
}) as multer.StorageEngine;

export const uploadFile = multer({ storage });