"use strict";

fetch('games_in_library.json')
  .then(response => {
    if (!response.ok) throw new Error("Unable to load games library.");
    return response.json();
  })
  .then(games => {
    const container = document.getElementById("main_div");
    if (!container) return;

    // Optional structured data
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Ultimate Quiz+ Games Collection",
      "description": "Free browser-based educational and fun games.",
      "itemListElement": []
    };

    games.forEach((game, index) => {
      // Create the card container
      const card = document.createElement("section");
      card.className = "game-card";

      // Generate star string
      const stars = "⭐".repeat(Math.min(game.stars || 1, 5));

      /**
      // Determine final play URL
      const playUrl = game.game_id.startsWith("http")
        ? game.game_id
        : `${window.location.origin}/${game.game_id}`;
**/
      const playUrl = `/game.html?g=${game.game_id}`;
      card.innerHTML = `
        <article class="game-card-inner">
          <h2 class="game-title">${game.game_name}</h2>
          <img 
            src="${game.game_icon}" 
            alt="${game.game_name} icon" 
            loading="lazy"
            class="game-icon"
          >
          

          <div class="game-footer">
            <span class="game-difficulty ${game.difficulty || 'medium'}">
              ${(game.difficulty || 'medium').charAt(0).toUpperCase() + (game.difficulty || 'medium').slice(1)}
            </span>

            <a href="${playUrl}" class="play-btn" rel="noopener">
              Play Now →
            </a>

            <span class="game-stars" title="${game.stars} stars">${stars}</span>
          </div>
        </article>
      `;

      container.appendChild(card);

      // Add to schema.org JSON-LD
      schemaData.itemListElement.push({
        "@type": "ListItem",
        "position": index + 1,
        "url": playUrl,
        "name": game.game_name,
        "image": `${window.location.origin}/${game.game_icon}`
      });
    });

    // Inject structured data (optional but great for SEO)
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schemaData, null, 2);
    document.head.appendChild(script);
  })
  .catch(err => {
    console.error(err);
    document.getElementById("main_div").innerHTML = 
      `<p style="color:red; text-align:center; padding: 2rem;">
        Failed to load games. Please check your internet connection or try again later.
      </p>`;
  });
// Auto-group game cards into full-screen pages
function createPager() {
  const container = document.getElementById('pager');
  const cards = Array.from(container.querySelectorAll('.game-card'));
  if (cards.length === 0) return;

  // Clear current content
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

// Run on load + resize
window.addEventListener('load', createPager);
window.addEventListener('resize', () => {
  setTimeout(createPager, 300); // small delay to avoid layout thrashing
});
