import express from "express";
import Meal from "../models/Meal.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const meal = new Meal(req.body);
    await meal.save();
    res.status(201).json({ message: "Meal posted!", meal });
  } catch (error) {
    console.error("Error posting meal:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;