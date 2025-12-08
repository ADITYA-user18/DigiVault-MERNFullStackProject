import express from 'express'
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import morgan from 'morgan';
import UserRouter from './routes/authRoutes.js';
import ConnectDB from './database/mongodb.js';
import cookieParser from "cookie-parser";
import FileUploadRoutes from './routes/FilesRoute.js'
import ShareRoutes from './routes/ShareRoute.js'
import setupCronJob from "./services/cronScheduler.js";
import aiRoutes from "./routes/aiRoutes.js";
const port = process.env.PORT


const app = express();
ConnectDB();
setupCronJob();
console.log("✅ Expiry Scheduler Initialized");

app.use(cookieParser());
app.use(morgan('dev'));
app.use(cors({
    origin: [
        process.env.FRONTEND_URL,                      // Local testing
        "https://digi-vault-mern-full-stack-project.vercel.app"       // <-- PASTE YOUR VERCEL URL HERE
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json());

//routes
app.use('/api/user', UserRouter)
app.use('/api/file', FileUploadRoutes)
app.use('/api/share', ShareRoutes)
app.use("/api/ai", aiRoutes);


app.get("/", (req, res) => {
    res.send("API is running successfully! 🚀");
});



app.listen(port, () => {
    console.log(`server running on port ${port}`)
})
