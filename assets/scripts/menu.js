function setMainMenu() {
  pageMenu.innerHTML = `
    <h1 class="page-title">Welcome to Chess!</h1>
    <button class="btn" onclick="startButtonClick()">Start</button>`;
}

function startButtonClick() {
  setChoicesMenu();
}

function setChoicesMenu() {
  pageMenu.innerHTML = `
    <div class="choice-menu">
        <button class="btn" onclick="playAsWhite(true)">Play as White against AI</button>
        <button class="btn" onclick="playAsWhite(false)">Play as Black against AI</button>
        <button class="btn" onclick="localMultiplayerClick()">Play local multiplayer</button>
    </div>`;
}

function setGameOverScreen(winMessage) {
  pageMenu.style = "";
  pageMenu.innerHTML = `
  <h1 class="page-title">${winMessage}</h1>
  <button class="btn" onclick="restartGameClick()">Restart</button>`;
}

function restartGameClick() {
  setChoicesMenu();
  pageCover.style = "";
  removeAllPieces();
  it = 0;
}
