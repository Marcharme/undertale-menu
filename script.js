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
const languageValue   = document.getElementById("language-value");

const moveSound = document.getElementById("move-sound");
const selectSound = document.getElementById("select-sound");
const menuMusic = document.getElementById("menu-music");

// STATE
let playerName = "";
let currentScreen = "splash";
const columns = 7;
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");

let elements = [];
let selectedIndex = 0;
let menuIndex = 0;

let settingsIndex = 0;
const languages   = ["ENGLISH"];       // extend as desired
let languageIndex = 0;

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

// CREATE LETTER GRID
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

// SHAKE FUNCTION
function applyRandomShake(element) {
  const duration = (Math.random() * 0.2 + 0.15).toFixed(2);
  const delay = (Math.random() * 0.5).toFixed(2);
  const xAmount = (Math.random() * 1 + 0.5).toFixed(1);
  const yAmount = (Math.random() * 1 + 0.5).toFixed(1);

  const animationName = "shake_" + Math.random().toString(36).substr(2, 5);

  const keyframes = `
    @keyframes ${animationName} {
      0% { transform: translate(0,0); }
      25% { transform: translate(${xAmount}px, -${yAmount}px); }
      50% { transform: translate(-${xAmount}px, ${yAmount}px); }
      75% { transform: translate(${yAmount}px, ${xAmount}px); }
      100% { transform: translate(0,0); }
    }
  `;

  const styleSheet = document.createElement("style");
  styleSheet.innerHTML = keyframes;
  document.head.appendChild(styleSheet);

  element.style.animation = `${animationName} ${duration}s infinite`;
  element.style.animationDelay = `${delay}s`;
}

// SELECTION UPDATES
function updateSelection() {
  elements.forEach(el => el.classList.remove("selected"));
  elements[selectedIndex].classList.add("selected");
}

function updateMenuSelection() {
  menuOptions.forEach(opt => opt.classList.remove("selected"));
  menuOptions[menuIndex].classList.add("selected");
}

// MOVE LETTER CURSOR
function moveHorizontal(direction) {
  if (selectedIndex >= alphabet.length) return;

  const row = Math.floor(selectedIndex / columns);
  const col = selectedIndex % columns;
  const newCol = col + direction;

  if (newCol < 0 || newCol >= columns) return;

  const newIndex = row * columns + newCol;
  if (newIndex >= alphabet.length) return;

  selectedIndex = newIndex;
  playMove();
}

function moveVertical(direction) {
  if (selectedIndex < alphabet.length) {
    const row = Math.floor(selectedIndex / columns);
    const col = selectedIndex % columns;

    const newRow = row + direction;
    const newIndex = newRow * columns + col;

    if (newIndex >= 0 && newIndex < alphabet.length) {
      selectedIndex = newIndex;
    }
    else if (direction === 1) {
      selectedIndex = alphabet.length;
    }
  } else {
    if (direction === -1) {
      selectedIndex = alphabet.length - columns;
    } else if (direction === 1 && selectedIndex === alphabet.length) {
      selectedIndex = alphabet.length + 1;
    }
  }

  playMove();
}

// ACTIVATE SELECTION
function activateSelection() {
  const value = elements[selectedIndex].textContent;
  playSelect();

  if (value === "Backspace") {
    playerName = playerName.slice(0, -1);
  } else if (value === "Done") {
    if (playerName.length > 0) {
      switchToMenu();
      return;
    }
  } else {
    if (playerName.length < 8) {
      playerName += value;
    }
  }

  nameDisplay.textContent = playerName;
}

// SWITCH TO MENU
function switchToMenu() {
  currentScreen = "menu";
  nameScreen.classList.remove("active");
  menuScreen.classList.add("active");
  playerNameText.textContent = playerName;

  menuIndex = 0;
  updateMenuSelection();
  
  // Play menu music
  menuMusic.currentTime = 0;
  menuMusic.play();
}

// RESET GAME
function resetGame() {
  playerName = "";
  nameDisplay.textContent = "";
  selectedIndex = 0;
  currentScreen = "name";
  menuScreen.classList.remove("active");
  ruinsScreen.classList.remove("active");
  nameScreen.classList.add("active");
  updateSelection();
  
  // Stop menu music
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

document.addEventListener("keydown", (e) => {
  if (currentScreen === "splash") {
    /* … existing splash logic … */
  } else if (currentScreen === "name") {
    /* … existing name logic … */
  } else if (currentScreen === "menu") {
    if (e.key === "Enter") {
      playSelect();
      const choice = menuOptions[menuIndex].textContent;
      if (choice === "Continue") {
        currentScreen = "ruins";
        menuScreen.classList.remove("active");
        ruinsScreen.classList.add("active");
      }
      if (choice === "Reset") resetGame();
      if (choice === "Settings") {
        currentScreen = "settings";
        menuScreen.classList.remove("active");
        settingsScreen.classList.add("active");

        settingsIndex = 0;
        updateSettingsSelection();
      }
    }
  } else if (currentScreen === "settings") {
    // arrow navigation between rows
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
        // EXIT
        currentScreen = "menu";
        settingsScreen.classList.remove("active");
        menuScreen.classList.add("active");
        updateMenuSelection();
      } else if (settingsIndex === 1) {
        // LANGUAGE
        cycleLanguage(1);
      }
    }

    if (e.key === "Escape") {
      currentScreen = "menu";
      settingsScreen.classList.remove("active");
      menuScreen.classList.add("active");
      updateMenuSelection();
    }
  }
});

// existing second keydown listener remains unchanged
document.addEventListener("keydown", (e) => {
  if (currentScreen === "splash") {
    if (e.key.toLowerCase() === "z" || e.key === "Enter") {
      splashScreen.classList.remove("active");
      nameScreen.classList.add("active");
      currentScreen = "name";
      playSelect();
      updateSelection();
    }
  } else if (currentScreen === "name") {
    if (e.key === "ArrowRight") moveHorizontal(1);
    if (e.key === "ArrowLeft") moveHorizontal(-1);
    if (e.key === "ArrowDown") moveVertical(1);
    if (e.key === "ArrowUp") moveVertical(-1);
    if (e.key === "Enter") activateSelection();
  } else if (currentScreen === "menu") {
    const totalOptions = menuOptions.length;
    
    if (e.key === "ArrowRight") {
      menuIndex = (menuIndex + 1) % totalOptions;
      playMove();
      updateMenuSelection();
    }
    if (e.key === "ArrowLeft") {
      menuIndex = (menuIndex - 1 + totalOptions) % totalOptions;
      playMove();
      updateMenuSelection();
    }
    if (e.key === "ArrowDown") {
      if (menuIndex < 2) {
        menuIndex = 2;
      } else {
        menuIndex = 0;
      }
      playMove();
      updateMenuSelection();
    }
    if (e.key === "ArrowUp") {
      if (menuIndex === 2) {
        menuIndex = 0;
      } else if (menuIndex === 0) {
        menuIndex = 1;
      } else {
        menuIndex = 0;
      }
      playMove();
      updateMenuSelection();
    }
    
    if (e.key === "Enter") {
      playSelect();
      const choice = menuOptions[menuIndex].textContent;
      if (choice === "Continue") {
        currentScreen = "ruins";
        menuScreen.classList.remove("active");
        ruinsScreen.classList.add("active");
      }
      if (choice === "Reset") resetGame();
    }
  }
});