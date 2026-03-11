const quotes = {
    easy: [
        "Practice makes perfect.",
        "Success starts with effort.",
        "Keep moving forward.",
        "Believe in yourself."
    ],
    medium: [
        "Programming is the art of breaking problems into smaller pieces.",
        "Success is not final failure is not fatal.",
        "Hard work beats talent when talent doesn't work hard."
    ],
    hard: [
        "The future belongs to those who believe in the beauty of their dreams and persist.",
        "In programming every error is a clue that leads you closer to the solution.",
        "Discipline is choosing what you want most over what you want now."
    ]
};

const quoteElement = document.getElementById("quote");
const inputArea = document.getElementById("input-area");
const startBtn = document.getElementById("start-btn");
const difficultySelect = document.getElementById("difficulty");
const leaderboardEl = document.getElementById("leaderboard");
const timerBar = document.getElementById("timer-bar");

const wpmDisplay = document.getElementById("wpm");
const accuracyDisplay = document.getElementById("accuracy");
const mistakesDisplay = document.getElementById("mistakes");
const timerDisplay = document.getElementById("timer");

const correctSound = document.getElementById("correct-sound");
const wrongSound = document.getElementById("wrong-sound");
const finishSound = document.getElementById("finish-sound");

let timer = 60;
let timerId = null;
let mistakes = 0;
let isTyping = false;
let currentQuote = [];

//---------------------- LOAD NEW QUOTE ----------------------//
function loadNewQuote() {
    const diff = difficultySelect.value;
    const list = quotes[diff];
    const random = Math.floor(Math.random() * list.length);

    quoteElement.innerHTML = "";
    currentQuote = list[random].split("");

    currentQuote.forEach(char => {
        const span = document.createElement("span");
        span.innerText = char;
        quoteElement.appendChild(span);
    });

    quoteElement.querySelector("span").classList.add("current");
}

//---------------------- START TEST ----------------------//
function startTest() {
    loadNewQuote();
    inputArea.value = "";
    inputArea.disabled = false;
    inputArea.focus();

    timer = 60;
    mistakes = 0;
    isTyping = false;
    wpmDisplay.textContent = 0;
    accuracyDisplay.textContent = "0%";
    mistakesDisplay.textContent = 0;
    timerDisplay.textContent = timer + "s";
    timerBar.style.width = "100%";

    clearInterval(timerId);
}

//---------------------- INPUT EVENT ----------------------//
inputArea.addEventListener("input", () => {
    const chars = quoteElement.querySelectorAll("span");
    const typed = inputArea.value.split("");

    if (!isTyping) {
        isTyping = true;
        timerId = setInterval(() => {
            timer--;
            timerDisplay.textContent = timer + "s";
            timerBar.style.width = (timer / 60 * 100) + "%";
            if (timer <= 0) endTest();
        }, 1000);
    }

    let allCorrect = true;

    chars.forEach((char, i) => {
        if (!typed[i]) {
            char.className = "";
            allCorrect = false;
        } else if (typed[i] === char.innerText) {
            char.className = "correct";
            correctSound.play();
        } else {
            if (char.className !== "incorrect") {
                mistakes++;
                mistakesDisplay.textContent = mistakes;
                wrongSound.play();
            }
            char.className = "incorrect";
            allCorrect = false;
        }
    });

    // Highlight next char
    chars.forEach(c => c.classList.remove("current"));
    if (chars[typed.length]) chars[typed.length].classList.add("current");

    // Update WPM and Accuracy
    const correctChars = typed.filter((c, i) => c === chars[i].innerText).length;
    const accuracy = Math.round((correctChars / typed.length) * 100) || 0;
    accuracyDisplay.textContent = accuracy + "%";

    const minutes = (60 - timer) / 60;
    const wpm = Math.round((correctChars / 5) / minutes) || 0;
    wpmDisplay.textContent = wpm;

    //---------------------- FINISH TEST EARLY ----------------------//
    if (allCorrect && typed.length === chars.length) {
        endTest();
    }
});

//---------------------- END TEST ----------------------//
function endTest() {
    clearInterval(timerId);
    inputArea.disabled = true;
    finishSound.play();
    saveScore();
}

//---------------------- SAVE SCORE ----------------------//
function saveScore() {
    const wpm = parseInt(wpmDisplay.textContent);
    const score = { wpm, date: new Date().toLocaleString() };

    let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    leaderboard.push(score);

    leaderboard.sort((a, b) => b.wpm - a.wpm);
    leaderboard = leaderboard.slice(0, 5);

    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
    renderLeaderboard();
}

//---------------------- RENDER LEADERBOARD ----------------------//
function renderLeaderboard() {
    const data = JSON.parse(localStorage.getItem("leaderboard")) || [];
    leaderboardEl.innerHTML = "";

    if (data.length === 0) {
        leaderboardEl.innerHTML = "<li>No scores yet. Play a test to add your score!</li>";
        return;
    }

    data.forEach(entry => {
        const li = document.createElement("li");
        li.textContent = `${entry.wpm} WPM — ${entry.date}`;
        leaderboardEl.appendChild(li);
    });
}

renderLeaderboard();

//---------------------- THEME TOGGLE ----------------------//
const themeToggle = document.getElementById("theme-toggle");
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light");
    themeToggle.textContent = document.body.classList.contains("light") ? "🌙" : "☀️";
});

// ---------------------- START BUTTON ----------------------//
startBtn.addEventListener("click", startTest);