import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import server from "./app";
// TCP 1
mongoose
    .connect(process.env.MONGO_URL as string, {})
    .then((data) => {
        console.log("MongoDB connection succeed");
        const PORT = process.env.PORT ?? 3003;
        server.listen(PORT, function () {
            console.info(`The server is running successfully on port: ${PORT}`);
            console.info(`Admin poject on http://localhost:${PORT}/admin \n`);
        })
    })
    .catch((err) => console.log("ERROR on connection MongoDB", err));