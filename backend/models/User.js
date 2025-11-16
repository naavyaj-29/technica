import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  dietary: [String],
  bio: String,
  dorm: String,
  role: { type: String, enum: ["buyer", "seller"] },
  ratings: Number,
  email: String,
  phone: String,
});

const User = mongoose.model("User", userSchema);

export default User;