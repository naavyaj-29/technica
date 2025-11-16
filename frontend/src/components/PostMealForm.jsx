import React, { useState } from "react";

const PostMealForm = ({ onSubmit, onCancel, user }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    servings: "",
    culturalNote: "",
    tags: [],
    image: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newMeal = {
      id: Date.now(),
      title: formData.title,
      description: formData.description,
      price: Number(formData.price),
      servings: Number(formData.servings),
      servingsLeft: Number(formData.servings),
      culturalNote: formData.culturalNote,
      tags: formData.tags,
      image: formData.image,
      chef: user?.name || "Unknown Chef",
      chefBio: "Student chef",
      dorm: user?.dorm,
      rating: 5,
      orders: 0,
    };

    onSubmit(newMeal);
  };

  return (
    <form className="meal-form" onSubmit={handleSubmit}>
      <h2>Post Your Meal</h2>

      <label>Title</label>
      <input name="title" value={formData.title} onChange={handleChange} required />

      <label>Description</label>
      <textarea name="description" value={formData.description} onChange={handleChange} required />

      <label>Price ($)</label>
      <input type="number" name="price" value={formData.price} onChange={handleChange} required />

      <label>Servings</label>
      <input type="number" name="servings" value={formData.servings} onChange={handleChange} required />

      <label>Cultural Note</label>
      <textarea name="culturalNote" value={formData.culturalNote} onChange={handleChange} />

      <label>Image URL</label>
      <input name="image" value={formData.image} onChange={handleChange} />

      <button type="submit">Post Meal</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
};

export default PostMealForm;
