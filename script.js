
   

const API_KEY = "48715a74387945d3bb359a9ff9fd9a18";  


let currentRecipe = null;
let favorites = {};

document.addEventListener("DOMContentLoaded", () => {
  const stored = localStorage.getItem("recipeFavorites");
  favorites = stored ? JSON.parse(stored) : {};
});

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const recipesContainer = document.getElementById("recipes-container");
const resultsInfo = document.getElementById("results-info");


const modal = document.getElementById("recipe-modal");
const overlay = document.getElementById("overlay");
const modalCloseBtn = document.getElementById("modal-close");
const modalTitle = document.getElementById("modal-title");
const modalIngredients = document.getElementById("modal-ingredients");
const modalInstructions = document.getElementById("modal-instructions");
const modalImage = document.getElementById("modal-image");
const modalSourceLink = document.getElementById("modal-source-link");
const favoriteBtn = document.getElementById("favorite-btn");


async function fetchRecipes(query) {
  const url = `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(
    query
  )}&number=20&apiKey=${API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  return data.results || [];
}


async function fetchRecipeDetails(id) {
  const url = `https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}`;
  const res = await fetch(url);
  return await res.json();
}


searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const query = searchInput.value.trim();
  if (!query) return;

  resultsInfo.textContent = `Searching for "${query}"...`;
  recipesContainer.innerHTML = "";

  try {
    const recipes = await fetchRecipes(query);

    if (recipes.length === 0) {
      resultsInfo.textContent = `No recipes found for "${query}".`;
      recipesContainer.innerHTML =
        '<p class="message">Try searching for something else.</p>';
    } else {
      resultsInfo.textContent = `Showing ${recipes.length} results for "${query}".`;
      renderRecipes(recipes);
    }
  } catch (err) {
    console.error(err);
    resultsInfo.textContent = "Error fetching recipes. Check your API key.";
  }
});


function renderRecipes(recipes) {
  recipesContainer.innerHTML = "";

  recipes.forEach((recipe) => {
    const card = document.createElement("div");
    card.className = "recipe-card";

    card.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.title}">
      <div class="recipe-body">
        <h3 class="recipe-title">${recipe.title}</h3>

        <div class="card-actions">
          <button class="btn-view">View Recipe</button>
          <button class="btn-fav-toggle ${
            favorites[recipe.id] ? "active" : ""
          }">
            <i class="fa-solid fa-heart"></i>
          </button>
        </div>
      </div>
    `;

    const viewBtn = card.querySelector(".btn-view");
    const favBtn = card.querySelector(".btn-fav-toggle");

    // View recipe details
    viewBtn.addEventListener("click", async () => {
      const details = await fetchRecipeDetails(recipe.id);
      openModal(details);
    });

    // Toggle favourite
    favBtn.addEventListener("click", () => {
      toggleFavorite(recipe);
      favBtn.classList.toggle("active", !!favorites[recipe.id]);
    });

    recipesContainer.appendChild(card);
  });
}


function openModal(recipe) {
  currentRecipe = recipe;

  modalTitle.textContent = recipe.title;
  modalImage.src = recipe.image;


  modalIngredients.innerHTML = "";
  if (recipe.extendedIngredients) {
    recipe.extendedIngredients.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item.original;
      modalIngredients.appendChild(li);
    });
  }

  
  modalInstructions.innerHTML =
    recipe.instructions || "No instructions available.";

  
  if (recipe.sourceUrl) {
    modalSourceLink.href = recipe.sourceUrl;
    modalSourceLink.parentElement.style.display = "block";
  } else {
    modalSourceLink.parentElement.style.display = "none";
  }

  updateFavoriteBtn();

  modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
}


modalCloseBtn.addEventListener("click", closeModal);
overlay.addEventListener("click", closeModal);

function closeModal() {
  modal.classList.add("hidden");
  overlay.classList.add("hidden");
}


function toggleFavorite(recipe) {
  if (favorites[recipe.id]) {
    delete favorites[recipe.id];
  } else {
    favorites[recipe.id] = recipe;
  }

  localStorage.setItem("recipeFavorites", JSON.stringify(favorites));
}

function updateFavoriteBtn() {
  if (!currentRecipe) return;

  if (favorites[currentRecipe.id]) {
    favoriteBtn.textContent = "Remove from Favorites";
    favoriteBtn.style.backgroundColor = "#ff5b5b";
  } else {
    favoriteBtn.textContent = "Add to Favorites";
    favoriteBtn.style.backgroundColor = "#007bff";
  }
}
