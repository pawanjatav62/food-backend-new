import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ================= PLACE ORDER =================
const placeOrder = async (req, res) => {


  console.log("USER ID:", req.userId); // ✅ यहीं लगाओ


  // const frontend_url = "http://localhost:5173";

    const frontend_url = "https://food-frontend-new-7qzm.vercel.app";


  try {
    console.log("BODY:", req.body);

    if (!req.body.items || req.body.items.length === 0) {
      return res.json({ success: false, message: "Cart is empty" });
    }

    // const newOrder = new orderModel({
    //   userId: req.body.userId,
    //   items: req.body.items,
    //   amount: req.body.amount,
    //   address: req.body.address,
    // });

    const newOrder = new orderModel({
      userId: req.userId, // ✅ FIX
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
    });

    await newOrder.save();

    // await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    await userModel.findByIdAndUpdate(req.userId, { cartData: {} });

    const line_items = req.body.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Delivery Charges",
        },
        unit_amount: 2 * 100,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      // success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,

      success_url = "https://food-frontend-new-7qzm.vercel.app/verify?success=true&orderId="+newOrder._id,


      // cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,

     cancel_url = "https://food-frontend-new-7qzm.vercel.app/verify?success=false&orderId="+newOrder._id,


    });

    res.json({ success: true, session_url: session.url });

  } catch (error) {
    console.log("🔥 FULL ERROR:", error);
    res.json({ success: false, message: error.message });
  }
};

// ================= VERIFY ORDER =================
const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;

  try {
    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      res.json({ success: true, message: "Paid" });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Not Paid" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ================= USER ORDERS =================
const userOrders = async (req, res) => {
  try {
    // ❌ old
    // const orders = await orderModel.find({ userId: req.body.userId });

    // ✅ correct
    const orders = await orderModel.find({ userId: req.userId });

    res.json({ success: true, data: orders });

  } catch (error) {
    console.log("ERROR:", error);
    res.json({ success: false, message: error.message });
  }
};

// ================= ADMIN LIST =================
const listOrders = async (req, res) => {
  try {
    // let userData = await userModel.findById(req.body.userId);

    let userData = await userModel.findById(req.userId);

    if (userData && userData.role === "admin") {
      const orders = await orderModel.find({});
      res.json({ success: true, data: orders });
    } else {
      res.json({ success: false, message: "You are not admin" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ================= UPDATE STATUS =================
const updateStatus = async (req, res) => {
  try {
    // let userData = await userModel.findById(req.body.userId);

    let userData = await userModel.findById(req.userId);

    if (userData && userData.role === "admin") {
      await orderModel.findByIdAndUpdate(req.body.orderId, {
        status: req.body.status,
      });
      res.json({ success: true, message: "Status Updated" });
    } else {
      res.json({ success: false, message: "You are not admin" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ FINAL EXPORT (VERY IMPORTANT)
export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };