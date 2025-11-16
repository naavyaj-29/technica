import React, { useState } from "react";
import styles from "./App.module.css";
import { X, ChefHat } from "lucide-react";

const RegisterForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dorm: "",
    bio: "",
    dietary: [],
    role: "buyer",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

  const dietaryOptions = ["vegan", "vegetarian", "halal", "gluten-free", "dairy-free", "nut-free"];
  const dormOptions = ["West Hall", "East Hall", "North Hall", "South Hall", "Central Dorm", "Graduate Housing"];

  const toggleDietary = (option) => {
    setFormData((prev) => ({
      ...prev,
      dietary: prev.dietary.includes(option)
        ? prev.dietary.filter((d) => d !== option)
        : [...prev.dietary, option],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.name || !formData.email || !formData.dorm || !formData.role) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "Failed to register");
      }

      const newUser = await response.json();
      onSuccess(newUser);
    } catch (err) {
      setError(err.message || "An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.registerCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.registerHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ChefHat style={{ width: "28px", height: "28px", color: "var(--orange-500)" }} />
            <h2 className={styles.h2}>Join DormDash</h2>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.registerForm}>
          {error && <div className={styles.errorMsg}>{error}</div>}

          <div>
            <label className={styles.label}>Full Name *</label>
            <input
              type="text"
              className={styles.input}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className={styles.label}>Email Address *</label>
            <input
              type="email"
              className={styles.input}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your.email@college.edu"
            />
          </div>

          <div>
            <label className={styles.label}>Phone Number</label>
            <input
              type="tel"
              className={styles.input}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <label className={styles.label}>Dorm *</label>
            <select
              className={styles.input}
              value={formData.dorm}
              onChange={(e) => setFormData({ ...formData, dorm: e.target.value })}
            >
              <option value="">Select your dorm</option>
              {dormOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={styles.label}>About You</label>
            <textarea
              className={styles.textarea}
              rows="2"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself (optional)..."
            />
          </div>

          <div>
            <label className={styles.label}>Dietary Preferences</label>
            <div className={styles.checkboxGroup}>
              {dietaryOptions.map((opt) => (
                <label key={opt} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.dietary.includes(opt)}
                    onChange={() => toggleDietary(opt)}
                  />
                  <span style={{ textTransform: "capitalize" }}>{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className={styles.label}>What brings you here? *</label>
            <div className={styles.roleGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="role"
                  value="buyer"
                  checked={formData.role === "buyer"}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                />
                I want to order meals
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="role"
                  value="seller"
                  checked={formData.role === "seller"}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                />
                I want to sell meals
              </label>
            </div>
          </div>

          <div className={styles.registerActions}>
            <button
              type="button"
              className={styles.ghostButton}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
