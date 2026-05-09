import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

// ================= LOGIN =================
const loginUser = async (req, res) => {
  let { email, password } = req.body;

  try {
    console.log("BODY:", req.body);

    // ✅ normalize email
    email = email.trim().toLowerCase();
    console.log("EMAIL AFTER NORMALIZE:", email);

    // ✅ debug - all users
    const allUsers = await userModel.find();
    console.log("ALL USERS:", allUsers);

    // ✅ only ONE query
    const user = await userModel.findOne({ email });
    console.log("FOUND USER:", user);

    if (!user) {
      return res.json({ success: false, message: "User Doesn't exist" });
    }

    // password check
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid Credentials" });
    }

    // token
    const token = createToken(user._id);

    res.json({
      success: true,
      token,
      role: user.role,

      user: {
        _id: user._id   // ✅ ये add करो
      }

    });

  } catch (error) {
    console.log("LOGIN ERROR:", error);
    res.json({ success: false, message: "Error" });
  }
};

// ================= REGISTER =================
const registerUser = async (req, res) => {
  let { name, email, password } = req.body;

  try {
    // normalize email
    email = email.trim().toLowerCase();

    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Invalid Email" });
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "Password too short" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      role: "user"
    });

    const user = await newUser.save();

    const token = createToken(user._id);

    res.json({
      success: true,
      token,
      role: user.role,

      user: {
        _id: user._id   // ✅ ये add करो
      }

    });

  } catch (error) {
    console.log("REGISTER ERROR:", error);
    res.json({ success: false, message: "Error" });
  }
};

// ================= TOKEN =================
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
};

export { loginUser, registerUser };