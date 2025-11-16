import mongoose from "mongoose";

const mealSchema = new mongoose.Schema({
  title: String,
  ingredients: [String],
  allergens: [String],
  chef: String,
  chefBio: String,
  tags: [String],
  countryTags: [String],
  blogLink: String,
  price: Number,
  image: String,
  servings: Number,
  servingsLeft: Number,
});

const Meal = mongoose.model("Meal", mealSchema);

export default Meal;