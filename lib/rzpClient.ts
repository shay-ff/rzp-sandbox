import { Road_Rage } from "next/font/google";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.razorpay_key,
  key_secret: process.env.razorpay_secret,
});


razorpay.orders.create({
    amount : 5000,
    currency : "INR"
});

// i need to call it and print it
razorpay.orders.create({
    amount : 5000,
    currency : "INR"
}).then((order) => {
    console.log(order);
}).catch((error) => {
    console.error(error);
});



export default razorpay;