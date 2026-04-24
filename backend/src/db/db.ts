import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config()

export async function connectDB(){
    try {
        await mongoose.connect(process.env.MONGO_URI!)
    } catch (error) {
        console.log("DB Connection Error", error);
        process.exit(1)
    }
    
}