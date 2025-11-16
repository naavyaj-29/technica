// App.jsx (ChefPostingSystem)

import React, { useEffect, useState } from "react";
import styles from "./App.module.css";
import CommunityPage from "./CommunityPage.jsx";
import "./index.css";

import {
  Search,
  Plus,
  User,
  MessageCircle,
  Bell,
  Heart,
  DollarSign,
  Users,
  ChefHat,
  Star,
  MapPin,
  Send,
  X,
  Globe2,
} from "lucide-react";

import GlobeView from "./GlobeView.jsx";

// ---- API base URL (frontend <-> backend bridge) ----
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

// Safely map a tag string into a CSS-friendly key
const safeTagClass = (tag) =>
  tag.toLowerCase().replace(/[^a-z0-9]+/g, "_");

const ChefPostingSystem = () => {
  const [currentView, setCurrentView] = useState("feed");
  const [user, setUser] = useState(null);
  const [meals, setMeals] = useState([]);
  const [filteredMeals, setFilteredMeals] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [chatMessage, setChatMessage] = useState("");

  // Map from cultural origin key -> coordinates (for globe pins)
  const ORIGIN_COORDS = {
    punjabi: { lat: 31.1471, lng: 75.3412 }, // Punjab, India
    japanese: { lat: 35.6762, lng: 139.6503 }, // Tokyo, Japan
    "middle eastern": { lat: 30.0444, lng: 31.2357 }, // Cairo-ish
    mexican: { lat: 19.4326, lng: -99.1332 }, // Mexico City
  };

  // Sample fallback meals (used if backend is down / empty)
  const sampleMeals = [
    {
      id: 1,
      title: "Authentic Butter Chicken",
      description:
        "Creamy, rich butter chicken with homemade naan. My grandmother's recipe from Punjab!",
      chef: "Priya Sharma",
      chefBio: "Engineering major, food enthusiast",
      dorm: "West Hall",
      price: 8,
      servings: 6,
      servingsLeft: 4,
      image:
        "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&h=600&fit=crop",
      tags: ["Punjabi", "halal", "spicy-medium"],
      dishMatters:
        "This dish reminds me of family dinners back home. It's comfort food that brings people together!",
      rating: 4.8,
      orders: 24,
      originKey: "punjabi",
      lat: 31.1471,
      lng: 75.3412,
    },
    {
      id: 2,
      title: "Vegan Ramen Bowl",
      description:
        "Rich miso broth with fresh vegetables and homemade noodles",
      chef: "Kenji Tanaka",
      chefBio: "CS major, ramen enthusiast",
      dorm: "East Hall",
      price: 10,
      servings: 8,
      servingsLeft: 8,
      image:
        "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop",
      tags: ["Japanese", "vegan", "spicy-mild"],
      dishMatters:
        "Learning to make ramen from scratch connected me to my heritage. Each bowl is made with care!",
      rating: 4.9,
      orders: 31,
      originKey: "japanese",
      lat: 35.6762,
      lng: 139.6503,
    },
    {
      id: 3,
      title: "Falafel Wraps",
      description:
        "Crispy falafel with tahini sauce, fresh veggies in warm pita",
      chef: "Layla Hassan",
      chefBio: "Biology major, home chef",
      dorm: "North Hall",
      price: 6,
      servings: 10,
      servingsLeft: 2,
      image:
        "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800&h=600&fit=crop",
      tags: ["Middle Eastern", "vegan", "halal"],
      dishMatters:
        "Street food from my childhood. Simple, healthy, and full of flavor!",
      rating: 4.7,
      orders: 18,
      originKey: "middle eastern",
      lat: 30.0444,
      lng: 31.2357,
    },
    {
      id: 4,
      title: "Vegetarian Tacos",
      description:
        "Black bean and sweet potato tacos with fresh salsa and guacamole",
      chef: "Maria Rodriguez",
      chefBio: "Art major, taco Tuesday organizer",
      dorm: "South Hall",
      price: 7,
      servings: 12,
      servingsLeft: 10,
      image:
        "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&h=600&fit=crop",
      tags: ["Mexican", "vegetarian", "spicy-hot"],
      dishMatters:
        "Every taco tells a story. These are inspired by my abuela's secret recipes!",
      rating: 4.6,
      orders: 15,
      originKey: "mexican",
      lat: 19.4326,
      lng: -99.1332,
    },
  ];

  const allTags = [
    { name: "vegan" },
    { name: "vegetarian" },
    { name: "halal" },
    { name: "Punjabi" },
    { name: "Japanese" },
    { name: "Middle Eastern" },
    { name: "Mexican" },
    { name: "spicy-mild" },
    { name: "spicy-medium" },
    { name: "spicy-hot" },
  ];

  // --------- Fetch meals from BACKEND on mount ---------
  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/meals`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setMeals(data);
        setFilteredMeals(data);
      } catch (err) {
        console.error("Error fetching meals, using sample data:", err);
        setMeals(sampleMeals);
        setFilteredMeals(sampleMeals);
      }
    };

    fetchMeals();
  }, []);

  // --------- Filter + search whenever query / filters change ---------
  useEffect(() => {
    let filtered = meals;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (meal) =>
          meal.title.toLowerCase().includes(q) ||
          (meal.description || "").toLowerCase().includes(q) ||
          (meal.tags || []).some((tag) =>
            tag.toLowerCase().includes(q)
          )
      );
    }

    if (selectedFilters.length > 0) {
      filtered = filtered.filter((meal) =>
        selectedFilters.every((f) => (meal.tags || []).includes(f))
      );
    }

    setFilteredMeals(filtered);
  }, [searchQuery, selectedFilters, meals]);

  const toggleFilter = (tag) => {
    setSelectedFilters((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleBuyTicket = async (meal) => {
    if (meal.servingsLeft <= 0) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/meals/${meal.id}/reserve`,
        {
          method: "PATCH",
        }
      );
      if (!res.ok) throw new Error("Failed to reserve meal");
      const updated = await res.json();

      setMeals((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m))
      );

      const note = {
        id: Date.now(),
        message: `Successfully reserved ${updated.title}!`,
        time: new Date(),
      };
      setNotifications((prev) => [note, ...prev]);
      alert(`Meal reserved! You'll receive pickup details soon.`);
    } catch (err) {
      console.error(err);
      alert("Error reserving meal. Please try again.");
    }
  };

  // --------- Views ---------

  const LoginView = () => (
    <div className={styles.loginWrapper}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <ChefHat className={styles.loginIcon} />
          <h1 className={styles.h1}>Campus Chef</h1>
          <p className={styles.lead}>
            Share homemade meals with your campus community
          </p>
        </div>

        <div className={styles.formGroup}>
          <input
            type="email"
            placeholder="College Email (.edu)"
            className={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            className={styles.input}
          />
          <button
            className={styles.primaryButton}
            onClick={() =>
              setUser({
                name: "Technica Terp",
                email: "terp@umd.edu",
                dorm: "West Hall",
              })
            }
          >
            Sign In
          </button>

          <div className={styles.divider}>
            <span>Or continue with</span>
          </div>

          <button className={styles.ghostButton}>
            <svg className={styles.googleIcon} viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google SSO
          </button>

          <p className={styles.smallMuted}>
            New here? <span className={styles.link}>Create an account</span>
          </p>
        </div>
      </div>
    </div>
  );

  const MealCard = ({ meal }) => {
    return (
      <div className={styles.card} onClick={() => setSelectedMeal(meal)}>
        <div className={styles.cardImageWrapper}>
          <img
            src={meal.image}
            alt={meal.title}
            className={styles.cardImage}
          />
          <div className={styles.ratingBadge}>
            <Star className={styles.ratingIcon} />
            <span className={styles.ratingText}>{meal.rating}</span>
          </div>
          {meal.servingsLeft <= 2 && meal.servingsLeft > 0 && (
            <div className={styles.lowLeftBadge}>
              Only {meal.servingsLeft} left!
            </div>
          )}
        </div>

        <div className={styles.cardBody}>
          <h3 className={styles.cardTitle}>{meal.title}</h3>
          <p className={styles.cardDescription}>{meal.description}</p>

          <div className={styles.cardMeta}>
            <User className={styles.metaIcon} />
            <span>{meal.chef}</span>
            <MapPin className={styles.metaIcon} />
            <span>{meal.dorm}</span>
          </div>

          <div className={styles.tagRow}>
            {(meal.tags || []).map((tag) => {
              const safe = safeTagClass(tag);
              return (
                <span
                  key={tag}
                  className={`${styles.tag} ${styles[safe] || ""}`}
                >
                  {tag}
                </span>
              );
            })}
          </div>

          <div className={styles.cardFooter}>
            <div>
              <div className={styles.price}>${meal.price}</div>
              <div className={styles.servings}>
                {meal.servingsLeft}/{meal.servings} available
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleBuyTicket(meal);
              }}
              disabled={meal.servingsLeft === 0}
              className={`${styles.buyButton} ${
                meal.servingsLeft === 0 ? styles.disabledButton : ""
              }`}
            >
              {meal.servingsLeft > 0 ? "Buy Ticket" : "Sold Out"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const FeedView = () => (
    <div className={styles.feed}>
      <div className={styles.hero}>
        <h2 className={styles.heroTitle}>🌍 Try a New Culture Today!</h2>
        <p className={styles.heroLead}>
          Explore authentic homemade meals from your fellow students
        </p>
      </div>

      <div className={styles.searchCard}>
        <div className={styles.searchRow}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search meals, cuisines, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchBar}
          />
        </div>

        <div className={styles.filterRow}>
          {allTags.map((tag) => (
            <button
              key={tag.name}
              onClick={() => toggleFilter(tag.name)}
              className={`${styles.filterTag} ${
                selectedFilters.includes(tag.name)
                  ? styles.filterSelected
                  : ""
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.grid}>
        {filteredMeals.map((meal) => (
          <MealCard key={meal.id} meal={meal} />
        ))}
      </div>

      {filteredMeals.length === 0 && (
        <div className={styles.emptyState}>
          <ChefHat className={styles.emptyIcon} />
          <p>No meals found matching your criteria</p>
        </div>
      )}
    </div>
  );

  const MealDetailModal = ({ meal, onClose }) => (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalTop}>
          <img
            className={styles.modalImage}
            src={meal.image}
            alt={meal.title}
          />
          <button className={styles.closeButton} onClick={onClose}>
            <X />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>{meal.title}</h2>
            <div className={styles.modalRating}>
              <Star className={styles.ratingIconSmall} />
              <span className={styles.ratingText}>{meal.rating}</span>
              {typeof meal.orders !== "undefined" && (
                <span className={styles.ordersText}>
                  ({meal.orders} orders)
                </span>
              )}
            </div>
          </div>

          <div className={styles.modalTags}>
            {(meal.tags || []).map((tag) => {
              const safe = safeTagClass(tag);
              return (
                <span
                  key={tag}
                  className={`${styles.tag} ${styles[safe] || ""}`}
                >
                  {tag}
                </span>
              );
            })}
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Description</h3>
            <p className={styles.sectionText}>{meal.description}</p>
          </div>

          <div className={styles.noteBox}>
            <div className={styles.noteHeader}>
              <Heart className={styles.heartIcon} />
              <span className={styles.noteTitle}>
                Why this dish matters to me
              </span>
            </div>
            <p className={styles.noteText}>
              "
              {meal.dishMatters ||
                meal.culturalNote ||
                "No story added yet."}
              "
            </p>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>About the Chef</h3>
            <div className={styles.chefRow}>
              <div className={styles.chefAvatar}>
                {meal.chef?.charAt(0)}
              </div>
              <div>
                <div className={styles.chefName}>{meal.chef}</div>
                <div className={styles.chefBio}>{meal.chefBio}</div>
                <div className={styles.chefDorm}>
                  <MapPin className={styles.metaIconSmall} /> {meal.dorm}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <div>
              <div className={styles.modalPrice}>
                ${meal.price} per serving
              </div>
              <div className={styles.modalServings}>
                <Users className={styles.metaIconSmall} />{" "}
                {meal.servingsLeft} of {meal.servings} servings available
              </div>
            </div>

            <button
              onClick={() => handleBuyTicket(meal)}
              disabled={meal.servingsLeft === 0}
              className={`${styles.primaryButton} ${
                meal.servingsLeft === 0 ? styles.disabledButton : ""
              }`}
            >
              {meal.servingsLeft > 0 ? "Reserve Meal" : "Sold Out"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const CreatePostView = () => {
    const [formData, setFormData] = useState({
      title: "",
      description: "",
      price: "",
      servings: "",
      servingsLeft: "",
      image: "", // fallback URL if user pastes one
      originKey: "", // empty means "no origin selected"
      tags: [],
      dishMatters: "",
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    const toggleTag = (t) => {
      setFormData((prev) => ({
        ...prev,
        tags: prev.tags.includes(t)
          ? prev.tags.filter((x) => x !== t)
          : [...prev.tags, t],
      }));
    };

    const submit = async () => {
      try {
        let imageUrl = formData.image || "";

        // 1) Upload file if user picked one
        if (imageFile) {
          const fd = new FormData();
          fd.append("image", imageFile);

          const uploadRes = await fetch(`${API_BASE_URL}/api/upload`, {
            method: "POST",
            body: fd,
          });

          if (!uploadRes.ok) throw new Error("Image upload failed");

          const { url } = await uploadRes.json();
          imageUrl = url;
        }

        // 2) Only set coordinates if originKey is provided AND we know it
        let lat = undefined;
        let lng = undefined;
        const originKey = formData.originKey || null;
        if (originKey && ORIGIN_COORDS[originKey]) {
          lat = ORIGIN_COORDS[originKey].lat;
          lng = ORIGIN_COORDS[originKey].lng;
        }

        const newMealPayload = {
          title: formData.title || "Untitled Meal",
          description: formData.description || "",
          chef: user?.name || "Anonymous Chef",
          chefBio: "Student chef",
          dorm: user?.dorm || "Unknown Dorm",
          price: Number(formData.price) || 0,
          servings: Number(formData.servings) || 1,
          servingsLeft:
            Number(formData.servingsLeft || formData.servings) || 1,
          image:
            imageUrl ||
            "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&h=600&fit=crop",
          tags: formData.tags,
          dishMatters: formData.dishMatters || "",
          rating: 5.0,
          orders: 0,
          originKey,
          lat,
          lng,
        };

        const res = await fetch(`${API_BASE_URL}/api/meals`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newMealPayload),
        });
        if (!res.ok) throw new Error("Failed to create meal");

        const saved = await res.json();
        setMeals((prev) => [saved, ...prev]);
        setShowCreatePost(false);
        alert("Meal posted successfully!");
      } catch (err) {
        console.error("Error posting meal:", err);
        alert("Error posting meal. Please try again.");
      }
    };

    return (
      <div className={styles.createWrapper}>
        <div className={styles.createCard}>
          <h2 className={styles.h2}>Post Your Meal</h2>

          <div className={styles.formGrid}>
            <div>
              <label className={styles.label}>Meal Title *</label>
              <input
                className={styles.input}
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Authentic Butter Chicken"
              />
            </div>

            <div>
              <label className={styles.label}>Description *</label>
              <textarea
                className={styles.textarea}
                rows="3"
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
                placeholder="Describe your dish..."
              />
            </div>

            <div>
              <label className={styles.label}>Upload Photo</label>
              <div className={styles.uploadBox}>
                <ChefHat className={styles.uploadIcon} />
                <p className={styles.smallMuted}>
                  Click to upload an image of your dish
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImageFile(file);
                      setImagePreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </div>

              {imagePreview && (
                <div style={{ marginTop: "0.5rem" }}>
                  <p className={styles.smallMuted}>Preview:</p>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ maxWidth: "220px", borderRadius: "8px" }}
                  />
                </div>
              )}

              {/* Optional text URL fallback:
              <input
                className={styles.input}
                type="text"
                placeholder="or paste an image URL"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
              />
              */}
            </div>

            <div>
              <label className={styles.label}>Price per Serving *</label>
              <div className={styles.inputWithIcon}>
                <DollarSign className={styles.iconLeft} />
                <input
                  type="number"
                  className={styles.input}
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="8"
                />
              </div>
            </div>

            <div>
              <label className={styles.label}>Total Servings *</label>
              <input
                type="number"
                className={styles.input}
                value={formData.servings}
                onChange={(e) =>
                  setFormData({ ...formData, servings: e.target.value })
                }
                placeholder="10"
              />
            </div>

            <div>
              <label className={styles.label}>
                Cultural Origin (for Globe)
              </label>
              <select
                className={styles.input}
                value={formData.originKey}
                onChange={(e) =>
                  setFormData({ ...formData, originKey: e.target.value })
                }
              >
                <option value="">No origin selected</option>
                <option value="punjabi">Punjabi / North Indian</option>
                <option value="japanese">Japanese</option>
                <option value="middle eastern">Middle Eastern</option>
                <option value="mexican">Mexican</option>
              </select>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label className={styles.label}>Tags</label>
              <div className={styles.filterRow}>
                {allTags.map((t) => (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => toggleTag(t.name)}
                    className={`${styles.filterTag} ${
                      formData.tags.includes(t.name)
                        ? styles.filterSelected
                        : ""
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label className={styles.label}>
                Why This Dish Matters to You
              </label>
              <textarea
                rows="2"
                className={styles.textarea}
                value={formData.dishMatters}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dishMatters: e.target.value,
                  })
                }
                placeholder="Share the story behind this meal..."
              />
            </div>

            <div
              style={{ gridColumn: "1 / -1" }}
              className={styles.formActions}
            >
              <button
                type="button"
                className={styles.primaryButton}
                onClick={submit}
              >
                Post Meal
              </button>
              <button
                type="button"
                className={styles.ghostButton}
                onClick={() => setShowCreatePost(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ProfileView = () => (
    <div className={styles.profileWrapper}>
      <div className={styles.profileCard}>
        <div className={styles.profileTop}>
          <div className={styles.profileAvatar}>
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className={styles.h2}>{user.name}</h2>
            <p className={styles.smallMuted}>{user.email}</p>

            <div className={styles.profileMeta}>
              <span>
                <MapPin className={styles.metaIconSmall} /> {user.dorm}
              </span>
              <span>
                <Star className={styles.metaIconSmall} /> 4.8 Rating
              </span>
            </div>

            <button className={styles.ghostButtonAlt}>Edit Profile</button>
          </div>
        </div>
      </div>

      <div className={styles.profileCard}>
        <h3 className={styles.h3}>My Posted Meals</h3>
        <div className={styles.postedGrid}>
          {meals.slice(0, 2).map((meal) => (
            <div key={meal.id} className={styles.postedItem}>
              <img
                src={meal.image}
                alt={meal.title}
                className={styles.postedThumb}
              />
              <div>
                <div className={styles.postedTitle}>{meal.title}</div>
                <div className={styles.smallMuted}>
                  ${meal.price} • {meal.servingsLeft}/{meal.servings} left
                </div>
                <div className={styles.smallMuted}>
                  {meal.orders} orders
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.profileCard}>
        <h3 className={styles.h3}>Dietary Preferences</h3>
        <div className={styles.tagRow}>
          {["vegetarian", "halal", "spicy-medium"].map((tag) => (
            <span
              key={tag}
              className={`${styles.tag} ${
                styles[safeTagClass(tag)] || ""
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const ChatView = () => {
    const chats = [
      {
        id: 1,
        name: "Priya Sharma",
        lastMsg: "Thanks for ordering!",
        time: "2m ago",
        unread: 2,
      },
      {
        id: 2,
        name: "Kenji Tanaka",
        lastMsg: "Pickup at 6pm?",
        time: "1h ago",
        unread: 0,
      },
    ];

    const messages = selectedChat
      ? [
          {
            id: 1,
            sender: "them",
            text: "Hi! Thanks for ordering my butter chicken!",
            time: "2:30 PM",
          },
          {
            id: 2,
            sender: "me",
            text: "Can't wait to try it! What time should I pick it up?",
            time: "2:32 PM",
          },
          {
            id: 3,
            sender: "them",
            text: "How about 6pm at West Hall lobby?",
            time: "2:35 PM",
          },
        ]
      : [];

    return (
      <div className={styles.chatWrap}>
        <div className={styles.chatList}>
          <div className={styles.chatHeader}>
            <h3 className={styles.h3}>Messages</h3>
          </div>

          <div className={styles.chatItems}>
            {chats.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedChat(c)}
                className={`${styles.chatItem} ${
                  selectedChat?.id === c.id ? styles.chatItemActive : ""
                }`}
              >
                <div className={styles.chatAvatar}>
                  {c.name.charAt(0)}
                </div>
                <div className={styles.chatInfo}>
                  <div className={styles.chatTop}>
                    <div className={styles.chatName}>{c.name}</div>
                    <div className={styles.smallMuted}>{c.time}</div>
                  </div>
                  <div className={styles.chatBottom}>
                    <div className={styles.smallMuted}>{c.lastMsg}</div>
                    {c.unread > 0 && (
                      <div className={styles.unreadBadge}>{c.unread}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.chatPanel}>
          {selectedChat ? (
            <>
              <div className={styles.chatPanelHeader}>
                <div className={styles.chatAvatarSmall}>
                  {selectedChat.name.charAt(0)}
                </div>
                <div>
                  <div className={styles.h3}>{selectedChat.name}</div>
                  <div className={styles.smallMuted}>Active now</div>
                </div>
              </div>

              <div className={styles.chatMessages}>
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`${styles.chatMessage} ${
                      m.sender === "me" ? styles.chatMessageMine : ""
                    }`}
                  >
                    <div className={styles.chatMessageBubble}>
                      <div className={styles.smallMuted}>{m.text}</div>
                      <div className={styles.chatTime}>{m.time}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.chatComposer}>
                <input
                  className={styles.input}
                  placeholder="Type a message..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && chatMessage.trim()) {
                      setChatMessage("");
                    }
                  }}
                />
                <button className={styles.primaryButton}>
                  <Send />
                </button>
              </div>
            </>
          ) : (
            <div className={styles.emptyCenter}>
              <MessageCircle className={styles.emptyIconLarge} />
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ---------- Top-level render ---------- */

  // Only meals that have coordinates should appear on the globe
  const mealsForGlobe = filteredMeals.filter(
    (m) =>
      m.originKey &&
      typeof m.lat === "number" &&
      typeof m.lng === "number"
  );

  return (
    <div className={styles.app}>
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <div
            className={styles.brand}
            onClick={() => {
              setCurrentView("feed");
              setShowCreatePost(false);
            }}
          >
            <ChefHat className={styles.brandIcon} />
            <span className={styles.brandTitle}>Campus Chef</span>
          </div>

          <div className={styles.navActions}>
            <button
              onClick={() => {
                setCurrentView("feed");
                setShowCreatePost(false);
              }}
              className={`${styles.navBtn} ${
                currentView === "feed" ? styles.navBtnActive : ""
              }`}
            >
              Feed
            </button>

            <button
              onClick={() => {
                setCurrentView("globe");
                setShowCreatePost(false);
              }}
              className={`${styles.navBtn} ${
                currentView === "globe" ? styles.navBtnActive : ""
              }`}
            >
              <Globe2 className={styles.iconInline} /> Globe
            </button>

            <button
              onClick={() => {
                setCurrentView("community");
                setShowCreatePost(false);
              }}
              className={`${styles.navBtn} ${
                currentView === "community" ? styles.navBtnActive : ""
              }`}
            >
              Community
            </button>

            <button
              onClick={() => {
                setShowCreatePost(true);
                setCurrentView("feed");
              }}
              className={`${styles.primaryButton} ${styles.postButton}`}
            >
              <Plus className={styles.iconInline} /> Post Meal
            </button>

            <button
              onClick={() => {
                setCurrentView("chat");
                setShowCreatePost(false);
              }}
              className={styles.iconBtn}
            >
              <MessageCircle />
              {notifications.length > 0 && (
                <span className={styles.badge}>{notifications.length}</span>
              )}
            </button>

            <button className={styles.iconBtn}>
              <Bell />
              {notifications.length > 0 && (
                <span className={styles.badge}>
                  {notifications.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentView("profile")}
              className={styles.avatarBtn}
            >
              {user ? user.name.charAt(0) : "T"}
            </button>
          </div>
        </div>
      </nav>

      <main className={styles.main}>
        {showCreatePost ? (
          <CreatePostView />
        ) : !user ? (
          <LoginView />
        ) : currentView === "feed" ? (
          <FeedView />
        ) : currentView === "globe" ? (
          <GlobeView
            meals={mealsForGlobe}
            selectedMeal={selectedMeal}
            onSelectMeal={setSelectedMeal}
            onReserveMeal={handleBuyTicket}
          />
        ) : currentView === "community" ? (
          <CommunityPage />
        ) : currentView === "profile" ? (
          <ProfileView />
        ) : currentView === "chat" ? (
          <ChatView />
        ) : null}
      </main>

      {selectedMeal && (
        <MealDetailModal
          meal={selectedMeal}
          onClose={() => setSelectedMeal(null)}
        />
      )}
    </div>
  );
};

export default ChefPostingSystem;
