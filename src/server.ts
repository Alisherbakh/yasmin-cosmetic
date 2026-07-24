import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();


mongoose.connect(process.env.MONGO_URL as string)
.then((data) => {
        console.log("MongoDB connection succeed");
        const PORT = process.env.PORT ?? 3004;
        
    })
    .catch((err) => console.log("ERROR on connection MongoDB", err));