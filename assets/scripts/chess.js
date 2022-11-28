const playfield = document.querySelector(".playfield");
const pageMenu = document.querySelector(".page-menu");
const jsonData = fetch("./assets/json/chessPieceData.json");
const pageCover = document.querySelector(".page-cover");

const moveBlocks = [],
  attackBlocks = [];

let AITurn, chessPieces, playerIsWhite;

let blackPieceTimer = 85,
  it = 0;

pageMenu.innerHTML = `
<div class="load-screen">
  <p class="text">Loading...</p>
  <div class="circle"></div>
</div>
<h1 class="page-title" hidden>Welcome to Chess!</h1>
<button class="btn" onclick="startButtonClick()" hidden>Start</button>
<button class="btn" hidden onclick="restartGameClick()">Restart</button>
<div class="choice-menu" hidden>
  <button class="btn" onclick="playAsWhite(true)">Play as White</button>
  <button class="btn" onclick="playAsWhite(false)">Play as Black</button>
</div>`;

getData();

async function getData() {
  await Promise.all([jsonData]).then(async (response) => {
    chessPieces = await response[0].json();
  });
}

checkChessPieces();

function checkChessPieces() {
  if (chessPieces === undefined) {
    setTimeout(checkChessPieces, 100);
  } else {
    pageMenu.children[0].hidden = true;
    pageMenu.children[1].hidden = false;
    pageMenu.children[1].style = "";
    pageMenu.children[2].hidden = false;
    createPlayfield();
  }
}

function startButtonClick() {
  pageMenu.children[1].hidden = true;
  pageMenu.children[2].hidden = true;
  pageMenu.children[3].hidden = true;
  pageMenu.children[4].hidden = false;
}

function playAsWhite(choice) {
  if (choice) {
    playfield.parentElement.style = "";
  } else {
    playfield.parentElement.style = "transform: rotateZ(180deg)";
  }
  playerIsWhite = choice;
  AITurn = playerIsWhite ? false : true;
  startGame();
}

function startGame() {
  pageMenu.style = "visibility: hidden;";
  setTimeout(setUpblackPiece, 0);
}

function restartGameClick() {
  pageMenu.children[1].hidden = true;
  pageMenu.children[3].hidden = true;
  pageMenu.children[4].hidden = false;
  pageCover.style = "";
  removeAllPieces();
  it = 0;
}

function removeAllPieces() {
  for (let i = 0; i < playfield.childElementCount; i++) {
    for (let j = 0; j < playfield.children[i].childElementCount; j++) {
      const element = playfield.children[i].children[j];
      if (element.childElementCount === 0) continue;
      element.firstChild.remove();
    }
  }
}

function setUpblackPiece() {
  if (it === 16) {
    setTimeout(setUpYellowPieces, 0);
    return;
  }

  const block = document.querySelector("#" + chessPieces[it].startBlock);

  const piece = createBasicPiece(chessPieces[it].id, chessPieces[it].img);
  piece.style = playerIsWhite
    ? "scale: -1;"
    : "scale: -1; transform: translateX(1px);";

  if (!playerIsWhite) {
    piece.addEventListener("click", onChessPieceClick);
    piece.classList.add("chess-piece-hover");
    AIopponentPieces.push(piece);
  } else {
    AIPieces.push(piece);
  }

  block.append(piece);

  it++;

  setTimeout(setUpblackPiece, blackPieceTimer);
}

function setUpYellowPieces() {
  if (it === 32) {
    if (AITurn) {
      pageCover.style = "";
      setTimeout(AIMove, 1000);
    } else {
      pageCover.style = "visibility: hidden";
    }
    return;
  }

  const block = document.querySelector("#" + chessPieces[it].startBlock);

  const piece = createBasicPiece(chessPieces[it].id, chessPieces[it].img);

  if (playerIsWhite) {
    piece.addEventListener("click", onChessPieceClick);
    piece.classList.add("chess-piece-hover");
    AIopponentPieces.push(piece);
  } else {
    AIPieces.push(piece);
  }

  block.append(piece);

  it++;

  setTimeout(setUpYellowPieces, blackPieceTimer);
}

function createBasicPiece(id, img) {
  const piece = document.createElement("img");
  piece.className = "chess-piece-pic";
  piece.id = id;
  piece.src = "assets/pictures/" + img + ".webp";

  const sound = new Audio("assets/sounds/move.wav");
  sound.play();

  return piece;
}

function onChessPieceClick(event) {
  if (AITurn) return;
  const target = event.target;
  const id = target.id;
  if (
    (!playerIsWhite && id.includes("gul")) ||
    (playerIsWhite && id.includes("svart"))
  )
    return;
  resetPlayfield();
  checkPieceAlts(target, id, moveBlocks, attackBlocks, false);
}

function getNumsFromParentId(parentElement) {
  const nums = parentElement.id.split("-");
  nums[0] = nums[0].charCodeAt(0) - 64;
  nums[1] = Number(nums[1]);
  return nums;
}

function createSelectorImg(color) {
  const image = document.createElement("img");
  image.className = "selector-img";
  image.src = "assets/pictures/Selected_" + color + "_TP.webp";
  return image;
}

function switchTurn() {
  if (!winConditionMet()) {
    AITurn = !AITurn;
    if (AITurn) {
      pageCover.style = "";
      setTimeout(AIMove, 1000);
    } else {
      pageCover.style = "visibility: hidden";
    }
  }
}

function winConditionMet() {
  const blackKing = document.querySelector("#kung-svart");
  const yellowKing = document.querySelector("#kung-gul");

  if (blackKing === null || yellowKing === null) {
    let message;

    if (playerIsWhite) {
      message = blackKing === null ? "Player Wins!" : "AI Wins!";
    } else {
      message = yellowKing === null ? "Player Wins!" : "AI Wins!";
    }

    pageMenu.style = "";
    pageMenu.children[1].textContent = message;
    pageMenu.children[1].hidden = false;
    pageMenu.children[2].hidden = true;
    pageMenu.children[3].hidden = false;
    pageMenu.children[4].hidden = true;

    return true;
  } else {
    return false;
  }
}

function resetPlayfield() {
  const arr = [...moveBlocks, ...attackBlocks];

  for (let i = 0; i < arr.length; i++) {
    arr[i].element.removeEventListener("click", arr[i].func);
  }
  moveBlocks.splice(0, moveBlocks.length);
  attackBlocks.splice(0, attackBlocks.length);

  document.querySelectorAll(".selector-img").forEach((element) => {
    element.remove();
  });
}

function createPlayfield() {
  const chars = "ABCDEFGH";
  for (let i = 8; i >= 1; i--) {
    const boardRow = document.createElement("div");
    boardRow.className = "board-row";
    for (let j = 0; j < chars.length; j++) {
      const block = document.createElement("div");
      block.className = "block";
      block.id = `${chars[j]}-${i}`;
      boardRow.append(block);
    }
    playfield.append(boardRow);
  }
}
