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
app.use(cors({
    origin:process.env.FRONTEND_URL,
    credentials:true,
}))
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
