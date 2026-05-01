// ================================
// SMART RECIPE FINDER PROJECT
// Uses TheMealDB API
// ================================

// Get elements from HTML
const form = document.getElementById("searchForm");
const input = document.getElementById("searchInput");
const recipesDiv = document.getElementById("recipes");
const detailsDiv = document.getElementById("recipeDetails");

// Handle form submit (allows Enter key search)
form.addEventListener("submit", function(event) {
  event.preventDefault(); // prevent page refresh
  searchRecipes();
});

// ================================
// SEARCH RECIPES FUNCTION
// ================================
async function searchRecipes() {
  let text = input.value.toLowerCase().trim();

  if (text === "") {
    recipesDiv.innerHTML = "Please enter an ingredient.";
    return;
  }

  recipesDiv.innerHTML = "Loading...";
  detailsDiv.innerHTML = "";

  // split multiple ingredients by comma
  let ingredients = text.split(",");

  try {
    let allResults = [];

    // API calls for each ingredient
    for (let i = 0; i < ingredients.length; i++) {
      let ing = ingredients[i].trim();

      let response = await fetch(
        "https://www.themealdb.com/api/json/v1/1/filter.php?i=" + ing
      );

      let data = await response.json();

      if (data.meals) {
        allResults.push(data.meals);
      }
    }

    if (allResults.length === 0) {
      recipesDiv.innerHTML = "No recipes found.";
      return;
    }

    // find recipes that match ALL ingredients
    let commonMeals = allResults[0];

    for (let i = 1; i < allResults.length; i++) {
      let currentList = allResults[i];

      commonMeals = commonMeals.filter(function(meal) {
        return currentList.some(function(item) {
          return item.idMeal === meal.idMeal;
        });
      });
    }

    if (commonMeals.length === 0) {
      recipesDiv.innerHTML = "No matching recipes found.";
      return;
    }

    displayRecipes(commonMeals);

  } catch (error) {
    console.log(error);
    recipesDiv.innerHTML = "Error loading recipes.";
  }
}

// ================================
// DISPLAY RECIPES
// ================================
function displayRecipes(meals) {
  recipesDiv.innerHTML = "";

  for (let i = 0; i < meals.length; i++) {
    let meal = meals[i];

    let card = document.createElement("div");
    card.className = "recipe-card";

    let img = document.createElement("img");
    img.src = meal.strMealThumb;

    let title = document.createElement("h3");
    title.textContent = meal.strMeal;

    card.appendChild(img);
    card.appendChild(title);

    // click event for details
    card.addEventListener("click", function() {
      getRecipeDetails(meal.idMeal);
    });

    recipesDiv.appendChild(card);
  }
}

// ================================
// GET FULL RECIPE DETAILS
// ================================
async function getRecipeDetails(id) {
  detailsDiv.innerHTML = "Loading recipe...";

  try {
    let response = await fetch(
      "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id
    );

    let data = await response.json();
    let meal = data.meals[0];

   detailsDiv.innerHTML = `
  <h2>${meal.strMeal}</h2>
  <img src="${meal.strMealThumb}">
  <p><strong>Instructions:</strong></p>
  <p>${meal.strInstructions}</p>
`;

detailsDiv.scrollIntoView({ behavior: "smooth" });

  } catch (error) {
    console.log(error);
    detailsDiv.innerHTML = "Error loading recipe details.";
  }
}