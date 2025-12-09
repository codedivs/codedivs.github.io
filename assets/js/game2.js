"use strict";

// Global game state
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timerInterval = null;
let seconds = 0;
let selectedQuestions = [];

// DOM Elements
const quizScreen = document.getElementById('quizScreen');
const resultScreen = document.getElementById('resultScreen');
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const scoreEl = document.getElementById('score');
const finalTimeEl = document.getElementById('finalTime');
const timeEl = document.getElementById('time');
const gameTitleEl = document.getElementById('gameTitle') || document.querySelector('h1');

// Extract game slug from URL: game.html?g=capital-cities
function getGameSlug() {
  const params = new URLSearchParams(window.location.search);
  return params.get('g') || 'capital-cities';
}
const GAME_SLUG = getGameSlug();

// Initial loading state
document.title = "Loading Game...";
if (gameTitleEl) gameTitleEl.textContent = "Loading...";

// ========================
// LOAD QUESTIONS & AUTO-START
// ========================
fetch(`/assets/games/${GAME_SLUG}.json`)
  .then(res => {
    if (!res.ok) throw new Error(`Game not found: ${GAME_SLUG}`);
    return res.json();
  })
  .then(data => {
    questions = data;

    // Update page title with nice game name
    fetch('/games_in_library.json')
      .then(r => r.json())
      .then(library => {
        const game = library.find(g => g.game_id === GAME_SLUG);
        const gameName = game
          ? game.game_name
          : GAME_SLUG.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        document.title = `${gameName} - Quiz Game`;
        if (gameTitleEl) gameTitleEl.textContent = gameName;
      })
      .catch(() => {
        const niceName = GAME_SLUG.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        document.title = `${niceName} - Quiz Game`;
        if (gameTitleEl) gameTitleEl.textContent = niceName;
      });

    console.log(`Loaded ${questions.length} questions for ${GAME_SLUG}`);
    startQuiz(); // Auto-start immediately
  })
  .catch(err => {
    console.error(err);
    document.querySelector('.container').innerHTML = `
      <div style="text-align:center; padding: 4rem; color: #fff;">
        <h1>Game Not Found</h1>
        <p>Could not load <strong>${GAME_SLUG}</strong>.</p>
        <a href="/" class="btn-primary" style="margin-top: 1rem; display: inline-block;">Back to Games</a>
      </div>
    `;
  });

// ========================
// QUIZ LOGIC
// ========================
function startQuiz() {
  if (!questions || questions.length === 0) {
    alert("No questions loaded!");
    return;
  }

  score = 0;
  seconds = 0;
  currentQuestionIndex = 0;
  if (timerInterval) clearInterval(timerInterval);

  // Randomly select 10 questions
  selectedQuestions = [...questions]
    .sort(() => 0.5 - Math.random())
    .slice(0, 10);

  showScreen('quizScreen');
  startTimer();
  showQuestion();
}

function showQuestion() {
  if (currentQuestionIndex >= selectedQuestions.length) {
    endQuiz();
    return;
  }

  const q = selectedQuestions[currentQuestionIndex];

  // Deep clone + shuffle options
  const shuffledOptions = [...q.options];
  for (let i = shuffledOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
  }

  // Store shuffled options and correct answer text temporarily on the question
  q.shuffled = shuffledOptions;
  q.correctText = q.answer;  // This is now a string like "Paris" or "H2O"

  questionEl.textContent = q.question;
  optionsEl.innerHTML = '';

  shuffledOptions.forEach(option => {
    const btn = document.createElement('div');
    btn.className = 'option';
    btn.textContent = option;
    btn.onclick = () => selectAnswer(option, btn);
    optionsEl.appendChild(btn);
  });
}

function selectAnswer(selectedText, btn) {
  const q = selectedQuestions[currentQuestionIndex];
  const correctAnswer = q.correctText;

  // Disable all clicks
  document.querySelectorAll('.option').forEach(b => b.style.pointerEvents = 'none');

  if (selectedText === correctAnswer) {
    score++;
    btn.classList.add('correct');
  } else {
    btn.classList.add('wrong');
    // Highlight the correct one
    document.querySelectorAll('.option').forEach(b => {
      if (b.textContent === correctAnswer) {
        b.classList.add('correct');
      }
    });
  }

  setTimeout(() => {
    currentQuestionIndex++;
    showQuestion();
  }, 1200);
}

function startTimer() {
  timerInterval = setInterval(() => {
    seconds++;
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    timeEl.textContent = `${mins}:${secs}`;
  }, 1000);
}

function endQuiz() {
  clearInterval(timerInterval);
  showScreen('resultScreen');
  scoreEl.textContent = score;
  finalTimeEl.textContent = timeEl.textContent;
}

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

// ========================
// BUTTONS
// ========================
document.getElementById('playAgainBtn')?.addEventListener('click', startQuiz);
document.getElementById('restartBtn')?.addEventListener('click', startQuiz);
document.getElementById('cancelBtn')?.addEventListener('click', () => location.href = '/');
