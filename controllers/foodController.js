// import foodModel from "../models/foodModel.js";
import foodModel from "../models/foodModel.js";
import userModel from "../models/userModel.js";
import fs from "fs";

// add food items

const addFood = async (req, res) => {

  console.log("BODY:", req.body);
  // console.log("USERID:", req.body.userId);

  console.log("USERID:", req.userId);
  console.log("FILE:", req.file);

  if (!req.file) {
    return res.json({ success: false, message: "Image missing" });
  }

  let image_filename = req.file.filename;

  // let image_filename = `${req.file.filename}`;
  // const food = new foodModel({
  //   name: req.body.name,

  const name = req.body.name || req.body["name "] || "";

  const food = new foodModel({
    name: name.trim(),
    description: req.body.description,
    // price: req.body.price,

    price: Number(req.body.price),

    category: req.body.category,
    image: image_filename,
  });
  try {
    // let userData = await userModel.findById(req.body.userId);

    let userData = await userModel.findById(req.userId);

    if (userData && userData.role === "admin") {
      await food.save();
      res.json({ success: true, message: "Food Added" });
    } else {
      res.json({ success: false, message: "You are not admin" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// all foods
const listFood = async (req, res) => {
  try {
    const foods = await foodModel.find({});
    res.json({ success: true, data: foods });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// remove food item
const removeFood = async (req, res) => {
  try {
    let userData = await userModel.findById(req.userId);
    if (userData && userData.role === "admin") {
      const food = await foodModel.findById(req.body.id);
      fs.unlink(`uploads/${food.image}`, () => { });
      await foodModel.findByIdAndDelete(req.body.id);
      res.json({ success: true, message: "Food Removed" });
    } else {
      res.json({ success: false, message: "You are not admin" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export { addFood, listFood, removeFood };