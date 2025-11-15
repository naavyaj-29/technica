const handleBuyTicket = async (meal) => {
  if (meal.servingsLeft <= 0) return;

  try {
    const res = await fetch(`${API_BASE}/api/meals/${meal.id}/reserve`, {
      method: "PATCH",
    });
    if (!res.ok) throw new Error("Failed to reserve meal");
    const updated = await res.json();

    // update local state
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
