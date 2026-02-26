// ELEMENTS
const settingsScreen = document.getElementById("settings-screen");
const splashScreen = document.getElementById("splash-screen");
const lettersContainer = document.getElementById("letters");
const nameDisplay = document.getElementById("name-display");
const nameScreen = document.getElementById("name-screen");
const menuScreen = document.getElementById("menu-screen");
const ruinsScreen = document.getElementById("ruins-screen");
const playerNameText = document.getElementById("player-name");
const menuOptions = document.querySelectorAll(".menu-option");
const settingsOptions = document.querySelectorAll(".settings-option");
const languageValue = document.getElementById("language-value");
const moveSound = document.getElementById("move-sound");
const selectSound = document.getElementById("select-sound");
const menuMusic = document.getElementById("menu-music");

// STATE
let playerName = "";
let currentScreen = "splash";
let selectedIndex = 0;
let menuIndex = 0;
let settingsIndex = 0;
let languageIndex = 0;

const columns = 7;
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
const languages = ["ENGLISH", "ESPAÑOL", "FRANÇAIS", "DEUTSCH", "日本語", "中文", "한국어"];
let elements = [];

// SCREEN HELPER
function showScreen(screenEl) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  screenEl.classList.add("active");
}

// SETTINGS
function updateSettingsSelection() {
  settingsOptions.forEach(opt => opt.classList.remove("selected"));
  if (settingsOptions[settingsIndex]) {
    settingsOptions[settingsIndex].classList.add("selected");
  }
}

function cycleLanguage(direction) {
  languageIndex = (languageIndex + direction + languages.length) % languages.length;
  if (languageValue) languageValue.textContent = languages[languageIndex];
}

// LETTER GRID
alphabet.forEach(letter => {
  const div = document.createElement("div");
  div.textContent = letter;
  div.classList.add("letter");
  applyRandomShake(div);
  lettersContainer.appendChild(div);
  elements.push(div);
});

const backspaceBtn = document.createElement("div");
backspaceBtn.textContent = "Backspace";
backspaceBtn.classList.add("menu-button");

const doneBtn = document.createElement("div");
doneBtn.textContent = "Done";
doneBtn.classList.add("menu-button");

lettersContainer.after(backspaceBtn);
backspaceBtn.after(doneBtn);
elements.push(backspaceBtn);
elements.push(doneBtn);

// SHAKE
function applyRandomShake(element) {
  const duration = (Math.random() * 0.2 + 0.15).toFixed(2);
  const delay = (Math.random() * 0.5).toFixed(2);
  const x = (Math.random() * 1 + 0.5).toFixed(1);
  const y = (Math.random() * 1 + 0.5).toFixed(1);
  const name = "shake_" + Math.random().toString(36).substr(2, 5);

  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes ${name} {
      0%   { transform: translate(0,0); }
      25%  { transform: translate(${x}px, -${y}px); }
      50%  { transform: translate(-${x}px, ${y}px); }
      75%  { transform: translate(${y}px, ${x}px); }
      100% { transform: translate(0,0); }
    }
  `;
  document.head.appendChild(style);
  element.style.animation = `${name} ${duration}s ${delay}s infinite`;
}

// SELECTION
function updateSelection() {
  elements.forEach(el => el.classList.remove("selected"));
  elements[selectedIndex].classList.add("selected");
}

function updateMenuSelection() {
  menuOptions.forEach(opt => opt.classList.remove("selected"));
  menuOptions[menuIndex].classList.add("selected");
}

// MOVEMENT
function moveHorizontal(dir) {
  if (selectedIndex >= alphabet.length) return;
  const col = selectedIndex % columns + dir;
  if (col < 0 || col >= columns) return;
  const next = Math.floor(selectedIndex / columns) * columns + col;
  if (next < alphabet.length) { selectedIndex = next; playMove(); }
}

function moveVertical(dir) {
  if (selectedIndex < alphabet.length) {
    const next = selectedIndex + dir * columns;
    if (next >= 0 && next < alphabet.length) {
      selectedIndex = next;
    } else if (dir === 1) {
      selectedIndex = alphabet.length; // backspace row
    }
  } else {
    if (dir === -1) {
      selectedIndex = alphabet.length - columns;
    } else if (dir === 1 && selectedIndex === alphabet.length) {
      selectedIndex = alphabet.length + 1;
    }
  }
  playMove();
}

// ACTIVATE LETTER
function activateSelection() {
  const value = elements[selectedIndex].textContent;
  playSelect();

  if (value === "Backspace") {
    playerName = playerName.slice(0, -1);
  } else if (value === "Done") {
    if (playerName.length > 0) { switchToMenu(); return; }
  } else {
    if (playerName.length < 8) playerName += value;
  }

  nameDisplay.textContent = playerName;
}

// SWITCH SCREENS
function switchToMenu() {
  currentScreen = "menu";
  showScreen(menuScreen);
  playerNameText.textContent = playerName;
  menuIndex = 0;
  updateMenuSelection();
  menuMusic.currentTime = 0;
  menuMusic.play();
}

function resetGame() {
  playerName = "";
  nameDisplay.textContent = "";
  selectedIndex = 0;
  currentScreen = "name";
  showScreen(nameScreen);
  updateSelection();
  menuMusic.pause();
  menuMusic.currentTime = 0;
}

// SOUND
function playMove() {
  moveSound.currentTime = 0;
  moveSound.play();
  updateSelection();
}

function playSelect() {
  selectSound.currentTime = 0;
  selectSound.play();
}

// Autoplay music on first interaction
document.addEventListener('keydown', () => {
  menuMusic.play().catch(() => {});
}, { once: true });

// SINGLE KEYDOWN LISTENER
document.addEventListener("keydown", (e) => {
  switch (currentScreen) {

    case "splash":
      if (e.key === "Enter" || e.key.toLowerCase() === "z") {
        playSelect();
        showScreen(nameScreen);
        currentScreen = "name";
        updateSelection();
      }
      break;

    case "name":
      if (e.key === "ArrowRight") moveHorizontal(1);
      if (e.key === "ArrowLeft")  moveHorizontal(-1);
      if (e.key === "ArrowDown")  moveVertical(1);
      if (e.key === "ArrowUp")    moveVertical(-1);
      if (e.key === "Enter")      activateSelection();
      break;

    case "menu": {
      const total = menuOptions.length;
      if (e.key === "ArrowRight") { menuIndex = (menuIndex + 1) % total; playMove(); updateMenuSelection(); }
      if (e.key === "ArrowLeft")  { menuIndex = (menuIndex - 1 + total) % total; playMove(); updateMenuSelection(); }
      if (e.key === "ArrowDown")  { menuIndex = menuIndex < 2 ? 2 : 0; playMove(); updateMenuSelection(); }
      if (e.key === "ArrowUp")    { menuIndex = menuIndex === 2 ? 0 : menuIndex === 0 ? 1 : 0; playMove(); updateMenuSelection(); }

      if (e.key === "Enter") {
        playSelect();
        const choice = menuOptions[menuIndex].textContent;
        if (choice === "Continue") {
          currentScreen = "ruins";
          showScreen(ruinsScreen);
        }
        if (choice === "Reset") resetGame();
        if (choice === "Settings") {
          currentScreen = "settings";
          showScreen(settingsScreen);
          settingsIndex = 0;
          updateSettingsSelection();
        }
      }
      break;
    }

    case "settings":
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        settingsIndex = (settingsIndex + 1) % settingsOptions.length;
        playMove();
        updateSettingsSelection();
      }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        settingsIndex = (settingsIndex - 1 + settingsOptions.length) % settingsOptions.length;
        playMove();
        updateSettingsSelection();
      }
      if (e.key === "Enter") {
        playSelect();
        if (settingsIndex === 0) {
          currentScreen = "menu";
          showScreen(menuScreen);
          updateMenuSelection();
        } else if (settingsIndex === 1) {
          cycleLanguage(1);
        }
      }
      if (e.key === "Escape") {
        currentScreen = "menu";
        showScreen(menuScreen);
        updateMenuSelection();
      }
      break;
  }
});