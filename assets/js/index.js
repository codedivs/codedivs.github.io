"use strict";

let currentModal = null;

fetch('games_in_library.json')
  .then(r => { if (!r.ok) throw new Error(); return r.json(); })
  .then(games => {
    const container = document.getElementById("main_div");
    if (!container) return;

    // Create modal overlay (once)
    const modalHTML = `
      <div id="game-modal" class="modal-hidden">
        <div class="modal-content">
          <button id="close-modal" class="close-btn" aria-label="Close">✕</button>
          <iframe id="game-frame" src="" allowfullscreen></iframe>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById("game-modal");
    const iframe = document.getElementById("game-frame");
    const closeBtn = document.getElementById("close-modal");

    // Close modal
    const closeModal = () => {
      modal.classList.remove("modal-visible");
      setTimeout(() => {
        iframe.src = "";
        modal.classList.add("modal-hidden");
        document.body.style.overflow = "";
      }, 300);
    };

    closeBtn.onclick = closeModal;
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };
    window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

    // Generate cards
    games.forEach((game, index) => {
      const card = document.createElement("section");
      card.className = "game-card";

      const stars = "★".repeat(game.stars || 1);
      const playUrl = game.game_id.startsWith("http") ? game.game_id : game.game_id;

      card.innerHTML = `
        <img src="${game.game_icon}" alt="${game.game_name}" loading="lazy" class="game-icon">
        <h2 class="game-title">${game.game_name}</h2>
        <div class="game-footer">
          <span class="game-difficulty ${game.difficulty || 'medium'}">
            ${game.difficulty ? game.difficulty.charAt(0).toUpperCase() + game.difficulty.slice(1) : 'Medium'}
          </span>
          <button class="play-btn" data-url="${playUrl}">Play Now</button>
          <span class="game-stars">${stars}</span>
        </div>
      `;

      // Open game in modal when clicking Play
      card.querySelector(".play-btn").addEventListener("click", () => {
        iframe.src = playUrl;
        document.body.style.overflow = "hidden";
        modal.classList.remove("modal-hidden");
        requestAnimationFrame(() => modal.classList.add("modal-visible"));
        currentModal = modal;
      });

      container.appendChild(card);
    });
  })
  .catch(err => {
    console.error(err);
    document.getElementById("main_div").innerHTML = 
      `<p style="color:#ff6b6b;text-align:center;padding:3rem;">Failed to load games library.</p>`;
  });
