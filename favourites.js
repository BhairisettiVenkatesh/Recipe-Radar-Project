let favorites = {};
let currentRecipe = null;

document.addEventListener("DOMContentLoaded", () => {
  const stored = localStorage.getItem("recipeFavorites");
  favorites = stored ? JSON.parse(stored) : {};
  renderFavorites();
});

const favoritesContainer = document.getElementById("favorites-container");

const modal = document.getElementById("recipe-modal");
const overlay = document.getElementById("overlay");
const modalCloseBtn = document.getElementById("modal-close");
const modalTitle = document.getElementById("modal-title");
const modalIngredients = document.getElementById("modal-ingredients");
const modalInstructions = document.getElementById("modal-instructions");
const modalImage = document.getElementById("modal-image");
const modalSourceLink = document.getElementById("modal-source-link");
const favoriteBtn = document.getElementById("favorite-btn");

modalCloseBtn.addEventListener("click", closeModal);
overlay.addEventListener("click", closeModal);

favoriteBtn.addEventListener("click", () => {
  if (currentRecipe) {
    toggleFavorite(currentRecipe);
    closeModal();
    renderFavorites();
  }
});

function renderFavorites() {
  favoritesContainer.innerHTML = "";

  const favArray = Object.values(favorites);
  if (favArray.length === 0) {
    favoritesContainer.innerHTML =
      '<p class="message">You have no favorite recipes yet.</p>';
    return;
  }

  favArray.forEach((recipe) => {
    const card = document.createElement("div");
    card.className = "recipe-card";

    card.innerHTML = `
      <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
      <div class="recipe-body">
        <h3 class="recipe-title">${recipe.strMeal}</h3>
        <div class="card-actions">
          <button class="btn-view">View Recipe</button>
          <button class="btn-fav-toggle active" title="Remove favorite">
            <i class="fa-solid fa-heart"></i>
          </button>
        </div>
      </div>
    `;

    const viewBtn = card.querySelector(".btn-view");
    const favBtn = card.querySelector(".btn-fav-toggle");

    viewBtn.addEventListener("click", () => openModal(recipe));

    favBtn.addEventListener("click", () => {
      toggleFavorite(recipe);
      renderFavorites();
    });

    favoritesContainer.appendChild(card);
  });
}

function openModal(recipe) {
  currentRecipe = recipe;
  modalTitle.textContent = recipe.strMeal;
  modalImage.src = recipe.strMealThumb;
  modalImage.alt = recipe.strMeal;

  modalIngredients.innerHTML = "";
  for (let i = 1; i <= 20; i++) {
    const ingredient = recipe[`strIngredient${i}`];
    const measure = recipe[`strMeasure${i}`];
    if (ingredient && ingredient.trim() !== "") {
      const li = document.createElement("li");
      li.textContent = `${ingredient}${measure ? ` - ${measure}` : ""}`;
      modalIngredients.appendChild(li);
    }
  }

  modalInstructions.textContent =
    recipe.strInstructions || "No instructions available.";

  if (recipe.strSource) {
    modalSourceLink.href = recipe.strSource;
    modalSourceLink.parentElement.style.display = "block";
  } else {
    modalSourceLink.parentElement.style.display = "none";
  }

  favoriteBtn.textContent = "Remove from Favorites";
  favoriteBtn.style.backgroundColor = "#ff5b5b";

  modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
  overlay.classList.add("hidden");
}

function toggleFavorite(recipe) {
  if (favorites[recipe.idMeal]) {
    delete favorites[recipe.idMeal];
  }
  localStorage.setItem("recipeFavorites", JSON.stringify(favorites));
}
