import mongoose from "mongoose";
import config from "./index";

const connectDB = async () => {
    try {
        await mongoose.connect(config.MONGO_URI as string);
        console.log("MongoDB connected");
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1); // Exit on failure
    }
};

export default connectDB;
