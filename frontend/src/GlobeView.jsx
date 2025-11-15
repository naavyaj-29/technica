// GlobeView.jsx
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import styles from "./App.module.css";
import { Globe2, Star, MapPin, Users, Heart, X } from "lucide-react";

// Same tag sanitizer as in App.jsx so CSS module classes line up
const safeTagClass = (tag) => {
  return "tag_" + tag.replace(/[^a-zA-Z0-9]/g, "_");
};

/* ---------- 3D Globe Component (Earth-textured) ---------- */

const Globe = ({ meals, onPinClick, selectedMealId }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const globeRef = useRef(null);
  const pinsRef = useRef([]);
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;

    let width = currentMount.clientWidth || 800;
    let height = currentMount.clientHeight || 500;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617); // deep navy background
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    currentMount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Earth sphere with continents texture
    const radius = 1.5;
    const segments = 48;

    const earthGeometry = new THREE.SphereGeometry(
      radius,
      segments,
      segments / 2
    );

    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load(
      "https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg"
    );

    // Fork & knife icon texture for pins
    const forkKnifeTexture = textureLoader.load(
      "https://img.icons8.com/ios-filled/100/ffffff/meal.png"
    );

    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      flatShading: true,
      metalness: 0.1,
      roughness: 0.9,
    });

    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earthMesh);
    globeRef.current = earthMesh;

    // Start tilted
    earthMesh.rotation.y = -0.9;
    earthMesh.rotation.x = 0.25;

    // Atmosphere glow
    const atmosphereGeometry = new THREE.SphereGeometry(
      radius * 1.05,
      48,
      24
    );
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.18,
      side: THREE.BackSide,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    earthMesh.add(atmosphere);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
    keyLight.position.set(4, 3, 5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x60a5fa, 0.5);
    rimLight.position.set(-4, -2, -5);
    scene.add(rimLight);

    // Group meals by region/coordinates so multiple dishes share a single pin
    const regionMap = {};
    (meals || []).forEach((meal) => {
      if (typeof meal.lat !== "number" || typeof meal.lng !== "number") return;
      const key = `${meal.lat.toFixed(3)},${meal.lng.toFixed(3)}`;
      if (!regionMap[key]) {
        regionMap[key] = {
          lat: meal.lat,
          lng: meal.lng,
          mealIds: [meal.id],
        };
      } else {
        regionMap[key].mealIds.push(meal.id);
      }
    });

    // Pins (fork & knife sprites per region cluster)
    pinsRef.current = [];
    Object.values(regionMap).forEach((region) => {
      const { lat, lng, mealIds } = region;

      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      const pinRadius = radius * 1.05;

      const x = -pinRadius * Math.sin(phi) * Math.cos(theta);
      const y = pinRadius * Math.cos(phi);
      const z = pinRadius * Math.sin(phi) * Math.sin(theta);

      const isSelected =
        selectedMealId != null && mealIds.includes(selectedMealId);

      const clusterSize = mealIds.length;
      const baseScale = 0.35 + 0.06 * Math.min(clusterSize - 1, 4);
      const selectedBoost = isSelected ? 0.08 : 0;
      const finalScale = baseScale + selectedBoost;

      const spriteMaterial = new THREE.SpriteMaterial({
        map: forkKnifeTexture,
        color: isSelected
          ? new THREE.Color(0xf97316) // amber-500 when selected
          : new THREE.Color(0xfacc15), // amber-300
        transparent: true,
      });

      const pinSprite = new THREE.Sprite(spriteMaterial);
      pinSprite.scale.set(finalScale, finalScale, 1);
      pinSprite.position.set(x, y, z);

      pinSprite.userData = { mealIds };
      pinsRef.current.push(pinSprite);

      earthMesh.add(pinSprite);
    });

    // Mouse interactions
    const handleMouseDown = (e) => {
      isDragging.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isDragging.current) return;

      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;

      earthMesh.rotation.y += deltaX * 0.005;
      earthMesh.rotation.x += deltaY * 0.005;

      earthMesh.rotation.x = Math.max(
        Math.min(earthMesh.rotation.x, Math.PI / 2),
        -Math.PI / 2
      );

      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    const handleWheel = (e) => {
      const dz = e.deltaY * 0.002;
      camera.position.z += dz;
      camera.position.z = Math.min(Math.max(camera.position.z, 3), 8);
    };

    const handleClick = (e) => {
      if (isDragging.current) return;

      const mouse = new THREE.Vector2();
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(pinsRef.current);

      if (intersects.length > 0) {
        const mealIds = intersects[0].object.userData.mealIds;
        if (mealIds && mealIds.length) {
          onPinClick(mealIds);
        }
      }
    };

    renderer.domElement.addEventListener("mousedown", handleMouseDown);
    renderer.domElement.addEventListener("mousemove", handleMouseMove);
    renderer.domElement.addEventListener("mouseup", handleMouseUp);
    renderer.domElement.addEventListener("mouseleave", handleMouseUp);
    renderer.domElement.addEventListener("wheel", handleWheel, {
      passive: true,
    });
    renderer.domElement.addEventListener("click", handleClick);

    // Resize
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current)
        return;
      const newWidth = mountRef.current.clientWidth || 800;
      const newHeight = mountRef.current.clientHeight || 500;
      rendererRef.current.setSize(newWidth, newHeight);
      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      if (!isDragging.current) {
        earthMesh.rotation.y += 0.0008;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("mousedown", handleMouseDown);
      renderer.domElement.removeEventListener("mousemove", handleMouseMove);
      renderer.domElement.removeEventListener("mouseup", handleMouseUp);
      renderer.domElement.removeEventListener("mouseleave", handleMouseUp);
      renderer.domElement.removeEventListener("wheel", handleWheel);
      renderer.domElement.removeEventListener("click", handleClick);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (
        renderer &&
        renderer.domElement &&
        currentMount.contains(renderer.domElement)
      ) {
        currentMount.removeChild(renderer.domElement);
      }
    };
  }, [meals, onPinClick, selectedMealId]);

  return (
    <div
      ref={mountRef}
      style={{
        width: "100%",
        height: "500px",
        borderRadius: "24px",
        overflow: "hidden",
      }}
    />
  );
};

/* ---------- Small Globe Preview Card for Region Pins ---------- */

const GlobeRegionPreview = ({
  regionMeals,
  onClose,
  onOpenCarousel,
  onOpenMeal,
}) => {
  if (!regionMeals || regionMeals.length === 0) return null;
  const primary = regionMeals[0];
  const extraCount = regionMeals.length - 1;

  const regionLabel =
    primary.originKey === "generic"
      ? "Featured Dishes"
      : primary.originKey
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

  return (
    <div
      style={{
        position: "absolute",
        right: "1.5rem",
        top: "8rem",
        maxWidth: "260px",
        maxHeight: "320px",
        background: "rgba(15,23,42,0.96)",
        borderRadius: "16px",
        boxShadow: "0 18px 45px rgba(15,23,42,0.75)",
        border: "1px solid rgba(148,163,184,0.35)",
        padding: "12px 14px",
        backdropFilter: "blur(12px)",
        color: "#e5e7eb",
        zIndex: 10,
        fontSize: "0.85rem",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "4px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Globe2 size={16} />
          <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>
            {regionLabel}
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            border: "none",
            background: "transparent",
            color: "#9ca3af",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <X size={14} />
        </button>
      </div>

      <p
        style={{
          margin: 0,
          opacity: 0.8,
          marginBottom: "6px",
          cursor: regionMeals.length > 1 ? "pointer" : "default",
        }}
        onClick={() => {
          if (regionMeals.length > 1) {
            onOpenCarousel(regionMeals);
          } else {
            onOpenMeal(primary);
          }
        }}
      >
        {regionMeals.length} dish
        {regionMeals.length > 1 ? "es" : ""} from this region
      </p>

      <div
        style={{
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid rgba(55,65,81,0.8)",
          marginBottom: "6px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "8px",
            padding: "6px 8px",
            background:
              "linear-gradient(135deg, rgba(30,64,175,0.4), rgba(236,72,153,0.18))",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              overflow: "hidden",
              flexShrink: 0,
              background: "#020617",
            }}
          >
            <img
              src={primary.image}
              alt={primary.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontWeight: 600,
                fontSize: "0.87rem",
                marginBottom: "2px",
              }}
            >
              {primary.title}
            </div>
            <div
              style={{
                fontSize: "0.78rem",
                opacity: 0.85,
                marginBottom: "2px",
              }}
            >
              by {primary.chef}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.78rem",
              }}
            >
              <Star size={12} />
              <span>{primary.rating}</span>
              <span style={{ opacity: 0.75 }}>
                • {primary.orders} order{primary.orders === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          marginBottom: extraCount > 0 ? "4px" : "8px",
          maxHeight: "96px",
          overflowY: "auto",
        }}
      >
        {regionMeals.slice(0, 3).map((m) => (
          <li
            key={m.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "2px",
              cursor: "pointer",
            }}
            onClick={() => onOpenMeal(m)}
          >
            <span
              style={{
                fontSize: "0.8rem",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "150px",
              }}
            >
              {m.title}
            </span>
            <span style={{ fontSize: "0.8rem", opacity: 0.9 }}>
              ${m.price}
            </span>
          </li>
        ))}
      </ul>

      {extraCount > 0 && (
        <div
          style={{
            fontSize: "0.76rem",
            opacity: 0.8,
            marginBottom: "6px",
          }}
        >
          + {extraCount} more dish{extraCount === 1 ? "" : "es"} in this region
        </div>
      )}

      <button
        onClick={() => {
          if (regionMeals.length > 1) {
            onOpenCarousel(regionMeals);
          } else {
            onOpenMeal(primary);
          }
        }}
        style={{
          width: "100%",
          borderRadius: "999px",
          border: "none",
          padding: "6px 10px",
          fontSize: "0.8rem",
          fontWeight: 500,
          cursor: "pointer",
          background: "linear-gradient(135deg, #2563eb, #4f46e5, #ec4899)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          marginTop: "2px",
        }}
      >
        View more details
      </button>
    </div>
  );
};

/* ---------- Carousel modal for multiple dishes from a region ---------- */

const RegionCarouselModal = ({
  meals,
  currentIndex,
  onClose,
  onPrev,
  onNext,
  onReserveMeal,
}) => {
  const meal = meals[currentIndex];
  if (!meal) return null;

  const regionLabel =
    meal.originKey === "generic"
      ? "Featured Dishes"
      : meal.originKey
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div
        className={styles.modal}
        style={{
          width: "min(440px, 95vw)",
          maxHeight: "80vh",
          borderRadius: "20px",
          overflowY: "auto",
          overflowX: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalTop} style={{ position: "relative" }}>
          <img
            className={styles.modalImage}
            src={meal.image}
            alt={meal.title}
            style={{
              width: "100%",
              height: "190px",
              objectFit: "cover",
            }}
          />
          <button
            className={styles.closeButton}
            onClick={onClose}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              width: "28px",
              height: "28px",
              borderRadius: "999px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(15,23,42,0.85)",
              border: "1px solid rgba(148,163,184,0.6)",
            }}
          >
            <X size={16} />
          </button>
          <div
            style={{
              position: "absolute",
              left: "10px",
              top: "10px",
              padding: "4px 10px",
              borderRadius: "999px",
              background: "rgba(15,23,42,0.8)",
              border: "1px solid rgba(148,163,184,0.6)",
              fontSize: "0.75rem",
              color: "#e5e7eb",
            }}
          >
            {currentIndex + 1} / {meals.length} • {regionLabel}
          </div>
        </div>

        <div
          className={styles.modalBody}
          style={{
            padding: "12px 14px",
            maxHeight: "calc(80vh - 230px)",
            overflowY: "auto",
          }}
        >
          <div className={styles.modalHeader}>
            <h2
              className={styles.modalTitle}
              style={{ fontSize: "1.05rem", marginBottom: "4px" }}
            >
              {meal.title}
            </h2>
            <div className={styles.modalRating}>
              <Star className={styles.ratingIconSmall} />
              <span className={styles.ratingText}>{meal.rating}</span>
              <span className={styles.ordersText}>
                ({meal.orders} orders)
              </span>
            </div>
          </div>

          <div className={styles.modalTags} style={{ marginBottom: "8px" }}>
            {meal.tags.map((tag) => {
              const safe = safeTagClass(tag);
              return (
                <span
                  key={tag}
                  className={`${styles.tag} ${styles[safe] || ""}`}
                  style={{ fontSize: "0.75rem", padding: "2px 8px" }}
                >
                  {tag}
                </span>
              );
            })}
          </div>

          <div className={styles.section}>
            <h3
              className={styles.sectionTitle}
              style={{ fontSize: "0.9rem", marginBottom: "4px" }}
            >
              Description
            </h3>
            <p
              className={styles.sectionText}
              style={{
                fontSize: "0.8rem",
                maxHeight: "90px",
                overflowY: "auto",
              }}
            >
              {meal.description}
            </p>
          </div>

          <div className={styles.noteBox} style={{ marginBottom: "10px" }}>
            <div className={styles.noteHeader}>
              <Heart className={styles.heartIcon} />
              <span
                className={styles.noteTitle}
                style={{ fontSize: "0.85rem" }}
              >
                Why this dish matters to me
              </span>
            </div>
            <p
              className={styles.noteText}
              style={{
                fontSize: "0.8rem",
                maxHeight: "80px",
                overflowY: "auto",
              }}
            >
              "{meal.culturalNote}"
            </p>
          </div>

          <div className={styles.section}>
            <h3
              className={styles.sectionTitle}
              style={{ fontSize: "0.9rem", marginBottom: "4px" }}
            >
              About the Chef
            </h3>
            <div className={styles.chefRow}>
              <div className={styles.chefAvatar}>{meal.chef.charAt(0)}</div>
              <div>
                <div
                  className={styles.chefName}
                  style={{ fontSize: "0.9rem" }}
                >
                  {meal.chef}
                </div>
                <div
                  className={styles.chefBio}
                  style={{ fontSize: "0.78rem" }}
                >
                  {meal.chefBio}
                </div>
                <div className={styles.chefDorm}>
                  <MapPin className={styles.metaIconSmall} /> {meal.dorm}
                </div>
              </div>
            </div>
          </div>

          <div
            className={styles.modalFooter}
            style={{ marginTop: "8px", gap: "8px" }}
          >
            <div>
              <div
                className={styles.modalPrice}
                style={{ fontSize: "1rem", marginBottom: "2px" }}
              >
                ${meal.price} per serving
              </div>
              <div
                className={styles.modalServings}
                style={{ fontSize: "0.78rem" }}
              >
                <Users className={styles.metaIconSmall} /> {meal.servingsLeft}{" "}
                of {meal.servings} servings available
              </div>
            </div>

            <button
              onClick={() => onReserveMeal && onReserveMeal(meal)}
              disabled={meal.servingsLeft === 0}
              className={`${styles.primaryButton} ${
                meal.servingsLeft === 0 ? styles.disabledButton : ""
              }`}
              style={{ padding: "6px 14px", fontSize: "0.85rem" }}
            >
              {meal.servingsLeft > 0 ? "Reserve Meal" : "Sold Out"}
            </button>
          </div>
        </div>

        {meals.length > 1 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 14px 12px",
              gap: "8px",
              borderTop: "1px solid rgba(31,41,55,0.8)",
              background: "rgba(15,23,42,0.9)",
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              style={{
                borderRadius: "999px",
                border: "1px solid rgba(148,163,184,0.7)",
                padding: "4px 10px",
                background: "transparent",
                color: "#e5e7eb",
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
            >
              ◀ Prev
            </button>
            <div
              style={{
                fontSize: "0.78rem",
                opacity: 0.75,
                textAlign: "center",
                flex: 1,
              }}
            >
              Swipe through dishes from this region
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              style={{
                borderRadius: "999px",
                border: "1px solid rgba(148,163,184,0.7)",
                padding: "4px 10px",
                background: "transparent",
                color: "#e5e7eb",
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
            >
              Next ▶
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ---------- Wrapper GlobeView component ---------- */

const GlobeView = ({ meals, selectedMeal, onSelectMeal, onReserveMeal }) => {
  const [selectedRegionMeals, setSelectedRegionMeals] = useState(null);
  const [regionCarouselMeals, setRegionCarouselMeals] = useState(null);
  const [regionCarouselIndex, setRegionCarouselIndex] = useState(0);

  const filteredMeals = meals || [];

  return (
    <div className={styles.globeView} style={{ position: "relative" }}>
      <div className={styles.hero}>
        <h2 className={styles.heroTitle}>Globe View 🌍</h2>
        <p className={styles.heroLead}>
          Drag to spin the Earth, scroll to zoom, and click pins to explore
          where these dishes come from culturally.
        </p>
      </div>

      <Globe
        meals={filteredMeals}
        onPinClick={(mealIds) => {
          const regionMeals = filteredMeals.filter((m) =>
            mealIds.includes(m.id)
          );
          if (regionMeals.length > 0) {
            setSelectedRegionMeals(regionMeals);
          }
        }}
        selectedMealId={selectedMeal?.id}
      />

      {selectedRegionMeals && (
        <GlobeRegionPreview
          regionMeals={selectedRegionMeals}
          onClose={() => setSelectedRegionMeals(null)}
          onOpenMeal={(meal) => {
            onSelectMeal && onSelectMeal(meal);
            setSelectedRegionMeals(null);
          }}
          onOpenCarousel={(mealsList) => {
            setRegionCarouselMeals(mealsList);
            setRegionCarouselIndex(0);
            setSelectedRegionMeals(null);
          }}
        />
      )}

      {regionCarouselMeals && regionCarouselMeals.length > 0 && (
        <RegionCarouselModal
          meals={regionCarouselMeals}
          currentIndex={regionCarouselIndex}
          onClose={() => {
            setRegionCarouselMeals(null);
            setRegionCarouselIndex(0);
          }}
          onPrev={() =>
            setRegionCarouselIndex((prev) =>
              prev === 0 ? regionCarouselMeals.length - 1 : prev - 1
            )
          }
          onNext={() =>
            setRegionCarouselIndex((prev) =>
              prev === regionCarouselMeals.length - 1 ? 0 : prev + 1
            )
          }
          onReserveMeal={onReserveMeal}
        />
      )}
    </div>
  );
};

export default GlobeView;
