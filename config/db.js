import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    console.log("USED URI:", process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI);

    console.log("DB Connected");
  } catch (error) {
    console.log("DB connection error:", error);
    process.exit(1);
  }
};