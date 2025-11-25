// assets/js/games.js
// Reusable quiz engine – just change the URL like: /game.html?g=capital_cities

const urlParams = new URLSearchParams(window.location.search);
const GAME_NAME = urlParams.get('g') || 'capital_cities'; // default fallback
let questions = [];
let current = 0;
let score = 0;
let startTime;
let timerInterval;
let answering = false; // Flag to prevent multiple clicks

async function loadAndStart() {
  try {
    const basePath = window.basePath;
    const res = await fetch(basePath + GAME_NAME + ".json");
    if (!res.ok) throw new Error('Game not found');
    const data = await res.json();
    questions = shuffle(data.questions);
    if (questions.length < 10) {
      console.warn(`Only ${questions.length} questions available, proceeding with all.`);
    } else {
      questions = questions.slice(0, 10);
    }
    startGame();
  } catch (err) {
    document.getElementById('question').innerHTML = `
      <p style="color:red;font-size:1.5em">
        Game "${GAME_NAME}" not found!<br><br>
        Check the URL or the file: assets/games/${GAME_NAME}.json
      </p>`;
    if (!urlParams.get('g')) {
      console.log('No game parameter provided in URL.');
    }
  }
}

function startGame() {
  score = 0;
  current = 0;
  startTime = Date.now();
  document.getElementById('result').innerHTML = '';
  startTimer();
  showQuestion();
}

function startTimer() {
  timerInterval = setInterval(() => {
    const secs = Math.floor((Date.now() - startTime) / 1000);
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    document.getElementById('timer').textContent = `${m}:${s}`;
  }, 500);
}

function showQuestion() {
  if (current >= questions.length) {
    endGame();
    return;
  }
  const q = questions[current];
  document.getElementById('question').textContent = q.question;
  const answersDiv = document.getElementById('answers');
  answersDiv.innerHTML = '';
  const options = shuffle([...q.incorrect_answers, q.correct_answer]);
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'answer';
    btn.textContent = opt;
    btn.addEventListener('click', () => {
      if (answering) return;
      answering = true;
      choose(opt === q.correct_answer, btn);
    });
    answersDiv.appendChild(btn);
  });
}

function choose(isCorrect, clickedBtn) {
  // disable all
  document.querySelectorAll('.answer').forEach(b => {
    b.disabled = true; // Use disabled for buttons
    if (b.textContent === questions[current].correct_answer) {
      b.classList.add('correct');
    }
  });
  if (isCorrect) {
    score++;
    clickedBtn.classList.add('correct');
  } else {
    clickedBtn.classList.add('wrong');
  }
  setTimeout(() => {
    current++;
    answering = false;
    showQuestion();
  }, 1300); // Configurable delay; could make dynamic if needed
}

function endGame() {
  clearInterval(timerInterval);
  const totalSecs = Math.floor((Date.now() - startTime) / 1000);
  const m = String(Math.floor(totalSecs / 60)).padStart(2, '0');
  const s = String(totalSecs % 60).padStart(2, '0');
  document.getElementById('question').textContent = 'Finished!';
  document.getElementById('answers').innerHTML = '';
  document.getElementById('result').innerHTML = `
    <div>Score: <strong>${score}/${questions.length}</strong></div>
    <div style="margin-top:20px">Time: <strong>${m}:${s}</strong></div>
    <button class="restart" onclick="loadAndStart()">Play Again</button>
  `;
  // Optional: Save high score to localStorage
  const highScore = localStorage.getItem(`highScore_${GAME_NAME}`) || 0;
  if (score > highScore) {
    localStorage.setItem(`highScore_${GAME_NAME}`, score);
    document.getElementById('result').innerHTML += `<div>New High Score!</div>`;
  }
}

// Fisher–Yates shuffle
function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Start automatically
window.addEventListener('DOMContentLoaded', loadAndStart);
