import mongoose from "mongoose";
import OrderModel from "../models/order.model.js";
import CartProductModel from "../models/cartProduct.model.js";
import UserModel from "../models/user.model.js";
import stripe from "../config/stripe.js"


const priceWithDiscount = (price, discount = 1) => {
  const discountAmount = Math.ceil((Number(price) * Number(discount)) / 100);
  const actualPrice = Number(price) - Number(discountAmount);
  return actualPrice;
};

const getOrderProductItems = async({lineItems,userId,addressId,paymentId,payment_status}
      )=>{
  const productList = []

  if(lineItems?.data?.length){
    for(const items of lineItems.data){
      const product = await stripe.products.retrieve(items.price.product)

      const payload = {
         userId: userId,
        orderId: `ORD-${new mongoose.Types.ObjectId()}`,
        productId:product.metadata.productId,
        product_details: {
          name: product.name,
          image: product.images,
        },
        paymentId: paymentId,
        payment_status:payment_status,
        delivery_address:addressId ,
        subTotalAmt:Number(items.amount_total/100),
        totalAmt: Number(items.amount_total/100),
      }

      productList.push(payload)
    }
  }

  return productList;
}

export const cashOnDeliveryController = async (req, res) => {
  try {
    const userId = req.userId;
    const { list_items, totalAmt, addressId, subTotalAmt } = req.body;
    // console.log("list_items",list_items)
    // console.log("totalAmt",totalAmt)
    // console.log("addressId",addressId)

    const payload = list_items.map((el) => {
      return {
        userId: userId,
        orderId: `ORD-${new mongoose.Types.ObjectId()}`,
        productId: el.productId._id,
        product_details: {
          name: el.productId.name,
          image: el.productId.image,
        },
        paymentId: "",
        payment_status: "CASH ON DELIVERY",
        delivery_address: addressId,
        subTotalAmt: subTotalAmt,
        totalAmt: totalAmt,
      };
    });

    console.log("payload", payload);

    const generateOrder = await OrderModel.insertMany(payload);

    const removeCartItems = await CartProductModel.deleteMany({
      userId: userId,
    });
    const updateInUser = await UserModel.updateOne(
      { _id: userId },
      { shopping_cart: [] }
    );

    return res.status(200).json({
      message: "order successfull",
      success: true,
      error: false,
      data: generateOrder,
    });
  } catch (error) {
    console.log("Controller Error:", error);
    return res.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

export const paymentController = async (req, res) => {
  try {
    const userId = req.userId;
    const { list_items, totalAmt, addressId, subTotalAmt } = req.body;

    const line_items = list_items.map((item) => {
      return {
        price_data: {
          currency: "inr",
          product_data: {
            name: item.productId.name,
            images: item.productId.image,
            metadata: {
              productId: item.productId._id,
            },
          },
          unit_amount: priceWithDiscount(
            item.productId.price,
            item.productId.discount
          )*100,
        },
        adjustable_quantity: {
          enabled: true,
          minimum: 1,
        },
        quantity: item.quantity,
      };
    });

    const user = await UserModel.findById(userId);

    const params = {
      submit_type: "pay",
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user.email,
      metadata: {
        userId: userId,
        addressId: addressId,
      },
      line_items: line_items,
      success_url: `http://localhost:5173/success`,
      cancel_url: `http://localhost:5173/cancel`,
    };

    const session = await stripe.checkout.sessions.create(params);

    return res.status(200).json(session);
  } catch (error) {
    console.log("Controller Error:", error);
    return res.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

export const webhookStripe = async(request,response)=>{

console.log(">>> stripe signature header:", request.headers["stripe-signature"]);
console.log(">>> content-type:", request.headers["content-type"]);
console.log(">>> typeof req.body:", typeof request.body);
console.log(">>> Buffer.isBuffer(req.body):", Buffer.isBuffer(request.body));
console.log(">>> is req.body._readableState present?:", !!request.body && !!request.body._readableState);

   
  const endpointSecret = process.env.STRIPE_ENDPOINT_WEBHOOK_SECRET_KEY;
  let event;
  if (endpointSecret) {
    // Get the signature sent by Stripe
    const signature = request.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        signature,
        endpointSecret
      );
    } catch (err) {
      console.log(`⚠️ Webhook signature verification failed.`, err.message);
      return response.sendStatus(400);
    }
  }

    console.log("Event received:", event.type);
    console.log("event",event)

   switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata.userId
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id)

      const orderProduct = await getOrderProductItems({
        lineItems:lineItems,
        userId:userId,
        addressId:session.metadata.addressId,
        paymentId:session.payment_intent,
        payment_status:session.payment_status
      })
      // console.log("order product",orderProduct)
      
      const order = await OrderModel.insertMany(orderProduct)

      if(order){
        const removeCartItems = await  UserModel.findByIdAndUpdate(userId,{
          shopping_cart:[]
        })

        const removeCartProductDB = await CartProductModel.deleteMany({userId:userId})
      }
      
      // Then define and call a method to handle the successful payment intent.
      // handlePaymentIntentSucceeded(paymentIntent);
      break;
   }
   
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
   response.json({received: true});
}

export const getOrderDetail = async(req,res)=>{
  try {
    const userId = req.userId;

    const order = await OrderModel.find({userId:userId}).sort({createdAt:-1}).populate('delivery_address').populate('product_details')

    if(!order){
      return res.status(400).json({
        message:"Order not found",
        error:true,
        success:false
      })
    }

    return res.status(200).json({
      message:"order detail fetch successfully",
      error:false,
      success:true,
      data:order
    })

  } catch (error) {
       console.log("Controller Error:", error);
    return res.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
}





