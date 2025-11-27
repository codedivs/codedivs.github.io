"use strict";

fetch('games_in_library.json')
  .then(response => {
    if (!response.ok) throw new Error("Unable to load games library.");
    return response.json();
  })
  .then(games => {
    const container = document.getElementById("pager");  // ← NOW CORRECT ID
    if (!container) return;

    const schemaData = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Ultimate Quiz+ Games Collection",
      "description": "Free browser-based educational and fun games.",
      "itemListElement": []
    };

    games.forEach((game, index) => {
      const card = document.createElement("section");
      card.className = "game-card";

      const stars = "★".repeat(Math.min(game.stars || 1, 5));
      const playUrl = `/game.html?g=${game.game_id}`;

      card.innerHTML = `
        <article class="game-card-inner">
          <h2 class="game-title">${game.game_name}</h2>
          <img src="${game.game_icon}" alt="${game.game_name} icon" loading="lazy" class="game-icon">
          <div class="game-footer">
            <span class="game-difficulty ${game.difficulty || 'medium'}">
              ${(game.difficulty || 'medium').charAt(0).toUpperCase() + (game.difficulty || 'medium').slice(1)}
            </span>
            <span class="game-stars" title="${game.stars} stars">${stars}</span>
            <a href="${playUrl}" class="play-btn" rel="noopener">Play Now →</a>
          </div>
        </article>
      `;

      container.appendChild(card);

      schemaData.itemListElement.push({
        "@type": "ListItem",
        "position": index + 1,
        "url": playUrl,
        "name": game.game_name,
        "image": `${window.location.origin}/${game.game_icon}`
      });
    });

    // Inject JSON-LD
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schemaData, null, 2);
    document.head.appendChild(script);

    // Now create the full-screen pager
    createPager();
  })
  .catch(err => {
    console.error(err);
    document.getElementById("pager").innerHTML =
      `<p style="color:red; text-align:center; padding: 2rem;">
        Failed to load games. Please check your internet connection.
      </p>`;
  });

// ——— FULL-SCREEN VERTICAL SWIPE PAGER ———
function createPager() {
  const container = document.getElementById('pager');
  const cards = Array.from(container.querySelectorAll('.game-card'));
  if (cards.length === 0) return;

  // Clear and rebuild pages
  container.innerHTML = '';

  let perPage = 1;
  if (window.innerWidth >= 1200) perPage = 4;
  else if (window.innerWidth >= 900) perPage = 2;

  for (let i = 0; i < cards.length; i += perPage) {
    const page = document.createElement('div');
    page.className = 'page';

    const chunk = cards.slice(i, i + perPage);
    chunk.forEach(card => page.appendChild(card));
    container.appendChild(page);
  }
}

// Rebuild on resize (with debounce)
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(createPager, 200);
});
