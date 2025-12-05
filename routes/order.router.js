import {Router} from "express"
import express from "express"
const orderRouter = Router()
import auth from "../middleware/auth.js"
import { cashOnDeliveryController, getOrderDetail, paymentController, webhookStripe } from "../controllers/order.controller.js"

orderRouter.post("/cash-on-delivery",auth,cashOnDeliveryController)
orderRouter.post("/checkout",auth,paymentController)
orderRouter.get("/order-details",auth,getOrderDetail)
// orderRouter.post("/webhook", express.raw({ type: "application/json" }),webhookStripe)

export default orderRouter;