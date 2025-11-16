// server.js

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import fs from "fs";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// --- Resolve __dirname for ES modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Static serving for images AND audio ---
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); 
// (your image upload folder is also where audio will go)

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
    dishMatters: String,
    culturalNote: String,
    rating: Number,
    orders: Number,
    originKey: String,
    lat: Number,
    lng: Number,

    // ⭐ NEW FIELD to store generated history
    generatedHistory: {
      text: String,
      audioUrl: String,
      createdAt: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

mealSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Meal = mongoose.model("Meal", mealSchema);

// --- User Schema / Model ---
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: String,
    dorm: { type: String, required: true },
    bio: String,
    dietary: [String],
    role: { type: String, enum: ["buyer", "seller"], required: true },
    ratings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Transform _id -> id for user responses
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model("User", userSchema);

// --- ROUTES ---

// Image upload
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

// PATCH reserve a serving
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

// --- User Routes ---

// POST create user (registration)
app.post("/api/users", async (req, res) => {
  try {
    const { name, email, phone, dorm, bio, dietary, role } = req.body;

    // Validate required fields
    if (!name || !email || !dorm || !role) {
      return res.status(400).json({ error: "Missing required fields: name, email, dorm, role" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "User with this email already exists" });
    }

    const newUser = new User({
      name,
      email,
      phone,
      dorm,
      bio,
      dietary: dietary || [],
      role,
      ratings: 0,
    });

    const saved = await newUser.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// GET user by ID
app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// GET all users (optional, for debug/admin)
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});


// --------------------------------------------------
// ⭐ NEW: GENERATE DISH HISTORY (Gemini + ElevenLabs)
// --------------------------------------------------

app.post("/api/generate/history", async (req, res) => {
  try {
    const { title, description, tags, culturalNote } = req.body;

    // Debug: Log the API key being used
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("🔑 Using Gemini API Key:", apiKey ? `${apiKey.substring(0, 10)}...` : "NOT SET");
    
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY not set in environment" });
    }

    // --- Gemini prompt ---
    const prompt = `
Write a warm, short (120–180 words) cultural history about this dish.
Dish title: ${title}
Description: ${description}
Tags: ${tags}
Cultural note: ${culturalNote}
    `;

    // --- Gemini call ---
    const geminiResp = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`,
      { contents: [{ parts: [{ text: prompt }] }] }
    );

    const generatedText =
      geminiResp.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!generatedText)
      return res.status(500).json({ error: "Gemini returned no text" });

    // --- ElevenLabs call ---
    const audioResp = await axios.post(
      "https://api.elevenlabs.io/v1/text-to-speech/pNInz6obpgDQGcFmaJgB",
      { text: generatedText },
      {
        responseType: "arraybuffer",
        headers: {
          "xi-api-key": process.env.ELEVEN_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    // save the audio locally
    const audioFile = `history_${Date.now()}.mp3`;
    const audioPath = path.join(__dirname, "uploads", audioFile);
    fs.writeFileSync(audioPath, audioResp.data);

    const audioUrl = `${req.protocol}://${req.get("host")}/uploads/${audioFile}`;

    return res.json({
      text: generatedText,
      audioUrl,
    });

  } catch (err) {
    console.error("❌ Generation error:", err.response?.status, err.response?.data || err.message);
    const errorMsg = err.response?.data?.error?.message || err.message || "Failed to generate history";
    res.status(err.response?.status || 500).json({ error: errorMsg });
  }
});


// --- Start server ---
const port = process.env.PORT || 4000;
app.listen(port, () =>
  console.log(`API listening on http://localhost:${port}`)
);