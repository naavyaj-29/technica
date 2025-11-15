import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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
    culturalNote: String,
    rating: Number,
    orders: Number,
    originKey: String,
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
    const meal = new Meal(req.body);
    const saved = await meal.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Error creating meal:", err);
    res.status(400).json({ error: "Failed to create meal" });
  }
});

// (Optional) PATCH to reserve a serving
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
