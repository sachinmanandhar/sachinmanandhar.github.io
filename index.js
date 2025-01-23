document.addEventListener("DOMContentLoaded", function () {
  const interestItems = document.querySelectorAll(".interest-item");
  const projectCards = document.querySelectorAll(".project-card");
  const projectFilter = document.getElementById("projectFilter");
  let activeCategory = null;

  function filterProjects(category) {
    if (category === "all") {
      projectCards.forEach((card) => card.classList.remove("hidden"));
    } else {
      projectCards.forEach((card) => {
        const tags = card.dataset.tags.split(",");
        if (tags.includes(category)) {
          card.classList.remove("hidden");
        } else {
          card.classList.add("hidden");
        }
      });
    }
  }

  // Handle dropdown filter change
  projectFilter.addEventListener("change", function () {
    const selectedCategory = this.value;
    activeCategory = selectedCategory;

    // Update interest items active state
    interestItems.forEach((item) => {
      if (item.dataset.category === selectedCategory) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    filterProjects(selectedCategory);
  });

  // Handle interest items click
  interestItems.forEach((item) => {
    item.addEventListener("click", function () {
      const category = this.dataset.category;

      // Toggle active state
      if (activeCategory === category) {
        // If clicking the same category, clear filter
        activeCategory = null;
        interestItems.forEach((i) => i.classList.remove("active"));
        projectFilter.value = "all"; // Reset dropdown
        projectCards.forEach((card) => card.classList.remove("hidden"));
      } else {
        // Apply new filter
        activeCategory = category;
        interestItems.forEach((i) => i.classList.remove("active"));
        this.classList.add("active");
        projectFilter.value = category; // Update dropdown

        // Scroll to projects section
        document.getElementById("projects").scrollIntoView({
          behavior: "smooth",
        });

        filterProjects(category);
      }
    });
  });
});
