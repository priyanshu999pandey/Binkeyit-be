// server.js
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
import productRouter from "./routes/product.route.js";
import cartRouter from "./routes/cart.route.js";
import addressRouter from "./routes/address.route.js";
import orderRouter from "./routes/order.router.js"; // keep normal order routes here

// Import the webhook handler directly
import { webhookStripe } from "./controllers/order.controller.js";

const app = express();

// CORS (keep as you had it)
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

// ---------- IMPORTANT: register the webhook route BEFORE express.json() ----------
app.post(
  "/api/order/webhook",
  express.raw({ type: "application/json" }), // <-- ensures req.body is a Buffer
  webhookStripe
);
// -------------------------------------------------------------------------------

// Now register the normal body-parsers and other middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(morgan('dev'));
app.use(helmet({
  crossOriginResourcePolicy: false
}));

// Mount other routers (these should NOT include /webhook)
app.use("/api/user", userRouter);
app.use("/api/category", categoryRouter);
app.use("/api/subCategory", subCategoryRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/address", addressRouter);
app.use("/api/order", orderRouter);

const PORT = process.env.PORT || 8080;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("server is running at", PORT);
  });
});
