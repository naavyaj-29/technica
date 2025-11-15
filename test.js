// server.js

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// --- Resolve __dirname for ES modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Static serving for uploaded images ---
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- Multer storage config for images ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `image-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage });

// --- MongoDB connection ---
mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 15000,
  })
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// --- Schema / Model ---
// NOTE: `dishMatters` is the canonical field for "Why this dish matters".
// We still keep `culturalNote` so old data doesn't break.

const mealSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    chef: String,
    chefBio: String,
    dorm: String,
    price: Number,
    servings: Number,
    servingsLeft: Number,
    image: String,
    tags: [String],
    dishMatters: String, // ✅ new field
    culturalNote: String, // legacy / backward-compat
    rating: Number,
    orders: Number,
    originKey: String, // can be null/undefined if user doesn't pick origin
    lat: Number,
    lng: Number,
  },
  { timestamps: true }
);

// Transform _id -> id so the frontend can keep using `meal.id`
mealSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Meal = mongoose.model("Meal", mealSchema);

// --- Routes ---

// Image upload: returns { url } that frontend will save to Mongo
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
    req.file.filename
  }`;
  res.json({ url: imageUrl });
});

// GET all meals
app.get("/api/meals", async (req, res) => {
  try {
    const meals = await Meal.find().sort({ createdAt: -1 });
    res.json(meals);
  } catch (err) {
    console.error("Error fetching meals:", err);
    res.status(500).json({ error: "Failed to fetch meals" });
  }
});

// POST create meal
app.post("/api/meals", async (req, res) => {
  try {
    const payload = { ...req.body };

    // For safety, if dishMatters not set but culturalNote is sent, map it
    if (!payload.dishMatters && payload.culturalNote) {
      payload.dishMatters = payload.culturalNote;
    }

    const meal = new Meal(payload);
    const saved = await meal.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Error creating meal:", err);
    res.status(400).json({ error: "Failed to create meal" });
  }
});

// PATCH to reserve a serving
app.patch("/api/meals/:id/reserve", async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) return res.status(404).json({ error: "Meal not found" });
    if (meal.servingsLeft <= 0)
      return res.status(400).json({ error: "Sold out" });

    meal.servingsLeft -= 1;
    const saved = await meal.save();
    res.json(saved);
  } catch (err) {
    console.error("Error reserving meal:", err);
    res.status(500).json({ error: "Failed to reserve meal" });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
