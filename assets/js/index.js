 "use strict";

    fetch("games_in_library.json")
      .then(response => {
        if (!response.ok) throw new Error("Unable to load games JSON.");
        return response.json();
      })
      .then(games => {
        const container = document.getElementById("main_div");

        const schemaData = {
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "Online Games Library",
          "description": "A collection of coding, language, and brain-training games.",
          "itemListElement": []
        };

        games.forEach((game, index) => {
          const card = document.createElement("section");
          card.className = "game-card";

          card.innerHTML = `
            <h2>${game.game_name}</h2>
            <img src="${game.game_icon}" alt="${game.game_name} icon">
            <a href="${game.game_link}">Play Game</a>
          `;

          container.appendChild(card);

          schemaData.itemListElement.push({
            "@type": "ListItem",
            "position": index + 1,
            "url": game.game_link,
            "name": game.game_name,
            "image": game.game_icon
          });
        });

        document.getElementById("game-schema").textContent =
          JSON.stringify(schemaData, null, 2);
      })
      .catch(console.error);
