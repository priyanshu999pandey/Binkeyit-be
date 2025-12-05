import Stripe from "stripe";

const stripe = Stripe(process.env.STRIPE_SECERET_KEY)

export default stripe