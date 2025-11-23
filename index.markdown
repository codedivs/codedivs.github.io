---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: home
---

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>Online Games Library – Coding, Language & Brain Training Games</title>

  <!-- Google AdSense (GLOBAL SCRIPT — MUST BE IN <head>) -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4027126264219673"
      crossorigin="anonymous"></script>

  <!-- SEO: Meta Description -->
  <meta name="description" content="Play coding games, language games, logic puzzles, and brain training challenges in our free online game library." />

  <!-- SEO: Better sharing on social media -->
  <meta property="og:title" content="Online Game Library">
  <meta property="og:description" content="A collection of coding, language, and brain-training games.">
  <meta property="og:type" content="website">
  <meta property="og:image" content="favicon.png">

  <!-- SEO: Schema-ready container (dynamic JSON inserted later) -->
  <script id="game-schema" type="application/ld+json"></script>

  <style>
    /* (CSS unchanged) */
    :root {
      --bg: #0d0d0d;
      --fg: #f4f4f4;
      --card-bg: #1b1b1b;
      --accent: #4ea1ff;
      --header-bg: #151515;
    }

    body {
      margin: 0;
      padding: 0;
      background: var(--bg);
      color: var(--fg);
      font-family: "Segoe UI", Arial, sans-serif;
      overflow-x: hidden;
    }

    header {
      width: 100%;
      text-align: center;
      padding: 12px 10px;
      font-size: 1.25rem;
      font-weight: 600;
      background: #151515;
      color: var(--accent);
      border-bottom: 1px solid #222;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    header h1 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    #main_div {
      width: 100%;
      max-width: 1200px;
      margin: 20px auto;
      padding: 20px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 24px;
    }

    .game-card {
      background: var(--card-bg);
      border-radius: 16px;
      padding: 18px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
      transition: transform 0.25s ease, box-shadow 0.25s ease;
      border: 1px solid #222;
    }

    .game-card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
      border-color: var(--accent);
    }

    .game-card img {
      width: 100%;
      height: 200px;
      object-fit: cover;
      border-radius: 12px;
      margin-bottom: 14px;
    }

    .game-card h2 {
      margin-bottom: 12px;
      font-size: 1.3rem;
      color: var(--accent);
      text-shadow: 0 0 8px rgba(78,161,255,0.3);
    }

    .game-card a {
      display: inline-block;
      padding: 12px 20px;
      background: var(--accent);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      transition: opacity 0.25s, transform 0.25s;
    }

    .game-card a:hover {
      transform: scale(1.05);
      opacity: 0.85;
    }

    /* ==== AdSense Footer Styling ==== */
    .adsense-footer {
      margin: 20px auto 8px;
      padding: 8px;
      max-width: 340px;
      border: 1px solid rgba(20, 255, 236, 0.15);
      border-radius: 12px;
      background: rgba(10, 18, 32, 0.6);
      text-align: center;
      backdrop-filter: blur(8px);
    }
  </style>
</head>

<body>

  <header>
    <h1>Cool Online Coding, Language, and Mind Games</h1>
  </header>

  <main id="main_div"></main>

  <!-- ====== GOOGLE ADSENSE AD UNIT (Styled with .adsense-footer) ====== -->
  <div class="adsense-footer">
    <p style="font-size:0.7rem;color:#aaa;margin-bottom:6px;">Advertisement</p>

    <ins class="adsbygoogle"
         style="display:block"
         data-ad-client="ca-pub-4027126264219673"
         data-ad-slot="3180711032"  <!-- REPLACE THIS WITH REAL SLOT ID -->
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>

    <script>
      (adsbygoogle = window.adsbygoogle || []).push({});
    </script>
  </div>
  <!-- ====== END OF AD UNIT ====== -->

  <script>
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
  </script>

</body>
</html>
