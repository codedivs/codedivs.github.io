"use strict";
const container = document.getElementById("main_div");
const categoryChips = document.getElementById("category-chips");
const searchBox = document.getElementById("search-box");
const suggestionsBox = document.getElementById("search-suggestions");
let allGames = [];
let allCategories = new Set();
// ==================== YOUR ADSENSE PUBLISHER ID & SLOT ====================
const ADSENSE_CLIENT = "ca-pub-4027126264219673"; //
const ADSENSE_SLOT_INFEED = "2687901104"; //"In-feed ad"
// ==========================================================================
// ------------------------------------------------------------------
// Global variables for pagination (one game at a time)
// ------------------------------------------------------------------
let currentFiltered = [];
let currentIndex = 0;
let currentCategory = 'all';
let currentSearch = '';

// ------------------------------------------------------------------
// Render a single game
// ------------------------------------------------------------------
function renderGame(game) {
  container.innerHTML = "";
  if (!game) {
    container.innerHTML = `<p style="text-align:center;padding:3rem;color:#888;">No games found.</p>`;
    return;
  }

  const playUrl = `/game.html?g=${encodeURIComponent(game.game_id)}`;
  const stars = "⭐".repeat(Math.min(Math.max(game.stars || 3, 1), 5));
  const difficulty = (game.difficulty || "medium").toLowerCase();

  const card = document.createElement("section");
  card.className = "game-card";
  card.dataset.category = game.category || "General";
  card.dataset.title = game.game_name.toLowerCase();
  card.innerHTML = `
    <article class="game-card-inner" tabindex="0">
      <h2 class="game-title">${escapeHtml(game.game_name)}</h2>
      <img src="${escapeHtml(game.game_icon)}"
           alt="${escapeHtml(game.game_name)} icon"
           loading="lazy" class="game-icon"
           onerror="this.src='assets/img/fallback.png'">
      <div class="game-footer">
        <span class="game-difficulty ${difficulty}">
          ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </span>
        <a href="${playUrl}" class="play-btn">Play Now</a>
        <span class="game-stars" title="${game.stars || 3} stars">${stars}</span>
      </div>
    </article>
  `;

  // Create navigation container
  const navContainer = document.createElement("div");
  navContainer.className = "nav-container";

  const prevButton = document.createElement("button");
  prevButton.textContent = "Previous";
  prevButton.disabled = currentIndex === 0;
  prevButton.onclick = () => {
    if (currentIndex > 0) {
      currentIndex--;
      renderGame(currentFiltered[currentIndex]);
    }
  };

	/**
  const pageInfo = document.createElement("span");
  pageInfo.textContent = `${currentIndex + 1} / ${currentFiltered.length}`;
  **/
  const nextButton = document.createElement("button");
  nextButton.textContent = "Next";
  nextButton.disabled = currentIndex === currentFiltered.length - 1;
  nextButton.onclick = () => {
    if (currentIndex < currentFiltered.length - 1) {
      currentIndex++;
      renderGame(currentFiltered[currentIndex]);
    }
  };

  navContainer.appendChild(prevButton);
  //navContainer.appendChild(pageInfo);
  navContainer.appendChild(nextButton);

  // Append card and navigation
  container.appendChild(card);
  container.appendChild(navContainer);

  // Add swipe functionality for touch
  let touchStartY = 0;
  let touchEndY = 0;
  const threshold = 50; // pixels

  card.addEventListener('touchstart', (e) => {
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  card.addEventListener('touchend', (e) => {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe(touchStartY, touchEndY);
  }, { passive: true });

  // Add swipe functionality for mouse
  let mouseStartY = 0;
  let mouseEndY = 0;
  let isDragging = false;

  card.addEventListener('mousedown', (e) => {
    isDragging = true;
    mouseStartY = e.screenY;
    e.preventDefault();
  });

  card.addEventListener('mousemove', (e) => {
    if (isDragging) {
      mouseEndY = e.screenY;
    }
  });

  card.addEventListener('mouseup', (e) => {
    if (isDragging) {
      mouseEndY = e.screenY;
      handleSwipe(mouseStartY, mouseEndY);
      isDragging = false;
    }
  });

  card.addEventListener('mouseleave', () => {
    if (isDragging) {
      handleSwipe(mouseStartY, mouseEndY);
      isDragging = false;
    }
  });

  // Swipe handler
  function handleSwipe(startY, endY) {
    const deltaY = endY - startY;
    if (Math.abs(deltaY) < threshold) return;
    if (deltaY < -threshold && currentIndex < currentFiltered.length - 1) {
      // Swipe up (delta negative) -> next
      currentIndex++;
      renderGame(currentFiltered[currentIndex]);
    } else if (deltaY > threshold && currentIndex > 0) {
      // Swipe down (delta positive) -> previous
      currentIndex--;
      renderGame(currentFiltered[currentIndex]);
    }
  }

  // For now, no ad insertion per game to avoid overload
}

// ------------------------------------------------------------------
// Apply filters (category + search)
// ------------------------------------------------------------------
function applyFilters() {
  let filtered = allGames;
  if (currentCategory !== 'all') {
    filtered = filtered.filter(g => (g.category || "General") === currentCategory);
  }
  if (currentSearch) {
    const searchLower = currentSearch.toLowerCase();
    filtered = filtered.filter(g => g.game_name.toLowerCase().includes(searchLower) || (g.category || "General").toLowerCase().includes(searchLower));
  }
  if (filtered.length === 0) {
    renderGame(null);
    return;
  }
  currentFiltered = filtered.sort(() => 0.5 - Math.random());
  currentIndex = 0;
  renderGame(currentFiltered[currentIndex]);
}

// ------------------------------------------------------------------
// Category chips
// ------------------------------------------------------------------
function createCategoryChips() {
  categoryChips.innerHTML = "";
  const allChip = document.createElement("span");
  allChip.className = "chip active";
  allChip.textContent = "All Games";
  allChip.dataset.category = "all";
  allChip.onclick = () => filterByCategory("all");
  categoryChips.appendChild(allChip);
  [...allCategories].sort().forEach(cat => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = cat;
    chip.dataset.category = cat;
    chip.onclick = () => filterByCategory(cat);
    categoryChips.appendChild(chip);
  });
}

// ------------------------------------------------------------------
// FILTER BY CATEGORY
// ------------------------------------------------------------------
function filterByCategory(selectedCat) {
  currentCategory = selectedCat;
  document.querySelectorAll(".chip").forEach(chip => {
    chip.classList.toggle("active", chip.dataset.category === selectedCat);
  });
  applyFilters();
}

// ------------------------------------------------------------------
// Search functionality
// ------------------------------------------------------------------
searchBox.addEventListener('input', (e) => {
  const query = e.target.value.trim().toLowerCase();
  suggestionsBox.innerHTML = '';
  if (!query) {
    suggestionsBox.style.display = 'none';
    return;
  }
  const matching = allGames.filter(g => 
    g.game_name.toLowerCase().includes(query) || (g.category || "General").toLowerCase().includes(query)
  );
  matching.slice(0, 10).forEach(g => {
    const item = document.createElement('div');
    item.className = 'suggestion-item';
    item.textContent = g.game_name;
    item.onclick = () => {
      searchBox.value = g.game_name;
      suggestionsBox.style.display = 'none';
      currentSearch = g.game_name;
      applyFilters();
    };
    suggestionsBox.appendChild(item);
  });
  suggestionsBox.style.display = matching.length ? 'block' : 'none';
});

searchBox.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    currentSearch = searchBox.value.trim();
    suggestionsBox.style.display = 'none';
    applyFilters();
  }
});

searchBox.addEventListener('blur', () => {
  setTimeout(() => {
    suggestionsBox.style.display = 'none';
  }, 100);
});

// ------------------------------------------------------------------
// Fetch games data
// ------------------------------------------------------------------
async function loadGames() {
  try {
    const response = await fetch('/games_in_library.json'); // Adjust the path if necessary
    if (!response.ok) {
      throw new Error('Failed to load games data');
    }
    allGames = await response.json();
    allGames.forEach(g => allCategories.add(g.category || "General"));
    createCategoryChips();
    applyFilters();
  } catch (error) {
    console.error('Error loading games:', error);
    container.innerHTML = `<p style="text-align:center;padding:3rem;color:#888;">Error loading games. Please try again later.</p>`;
  }
}

// Load games on page load
document.addEventListener('DOMContentLoaded', loadGames);

// ------------------------------------------------------------------
// Utility function: escape HTML
// ------------------------------------------------------------------
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
