import express from "express";
import cors from "cors";
import dotenv from "dotenv";
 dotenv.config();
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import connectDB from "./config/connectDB.js";
import userRouter from "./routes/user.route.js";
import categoryRouter from "./routes/category.route.js";
import subCategoryRouter from "./routes/subCategory.route.js";


const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "https://binkeyit-fe.vercel.app",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("CORS: Not allowed by policy"), false);
  },
  credentials: true,
}));
app.use(express.json())
app.use(express());
app.use(cookieParser());
app.use(morgan());
app.use(helmet({
    crossOriginResourcePolicy:false
}))

app.use("/api/user",userRouter)
app.use("/api/category",categoryRouter)
app.use("/api/subCategory",subCategoryRouter)


const PORT = 8080 || process.env.PORT;

connectDB().then(()=>{
   app.listen(PORT,()=>{
    console.log("server is ruuning at ",PORT)
})
})
