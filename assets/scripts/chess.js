const playfield = document.querySelector(".playfield");
const pageMenu = document.querySelector(".page-menu");
const jsonData = fetch("./assets/json/chessPieceData.json");

const AIPieces = [];

let AITurn, chessPieces, playerIsWhite;

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

const pageCover = document.querySelector(".page-cover");

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

let blackPieceTimer = 85,
  it = 0;

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

function checkPieceAlts(target, id) {
  switch (true) {
    case id.startsWith("bonde"):
      bondePiece(target, id);
      break;
    case id.startsWith("häst"):
      horsePiece(target, id);
      break;
    case id.startsWith("torn"):
      tornPiece(target, id);
      break;
    case id.startsWith("löpare"):
      bishopPiece(target, id);
      break;
    case id.startsWith("drottning"):
      bishopPiece(target, id);
      tornPiece(target, id);
      break;
    case id.startsWith("kung"):
      kingPiece(target, id);
      break;
    default:
      console.log("Unkown piece!");
  }
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
  checkPieceAlts(target, id);
}

const kingAlts = [
  { x: 1, y: 1 },
  { x: 1, y: -1 },
  { x: -1, y: 1 },
  { x: -1, y: -1 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
  { x: -1, y: 0 },
  { x: 1, y: 0 },
];

function kingPiece(target, id) {
  const nums = getNumsFromParentId(target.parentElement);

  for (let i = 0; i < kingAlts.length; i++) {
    const y = 8 - nums[1] + kingAlts[i].y;
    const x = nums[0] - 1 + kingAlts[i].x;

    if (x < 0 || y < 0 || x >= 8 || y > 7) continue;

    let element = playfield.children[y].children[x];

    if (element.childElementCount > 0) {
      if (checkElementForAttack(element, id)) {
        addElementToAttackBlocks(element, id);
      }
      continue;
    }
    addElementToMoveBlocks(element, id);
  }
}

const bishopAlts = [
  { x: 1, y: 1 },
  { x: -1, y: 1 },
  { x: 1, y: -1 },
  { x: -1, y: -1 },
];

function bishopPiece(target, id) {
  const nums = getNumsFromParentId(target.parentElement);

  for (let i = 0; i < bishopAlts.length; i++) {
    let pathFound = false;
    let stepX = bishopAlts[i].x;
    let stepY = bishopAlts[i].y;

    while (!pathFound) {
      const y = 8 - nums[1] + stepY;
      const x = nums[0] - 1 + stepX;

      if (x < 0 || y < 0 || x > 7 || y > 7) break;

      let nextElement = playfield.children[y].children[x];

      if (nextElement.childElementCount > 0) {
        if (checkElementForAttack(nextElement, id)) {
          addElementToAttackBlocks(nextElement, id);
        }
        pathFound = true;
      } else {
        addElementToMoveBlocks(nextElement, id);
        stepX += bishopAlts[i].x;
        stepY += bishopAlts[i].y;
      }
    }
  }
}

const tornAlts = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

function tornPiece(target, id) {
  const nums = getNumsFromParentId(target.parentElement);

  for (let i = 0; i < tornAlts.length; i++) {
    let stepX = tornAlts[i].x;
    let stepY = tornAlts[i].y;

    let pathsFound = false;
    while (!pathsFound) {
      const y = 8 - nums[1] + stepX;
      const x = nums[0] - 1 + stepY;

      if (x < 0 || y < 0 || x > 7 || y > 7) break;

      let nextElement = playfield.children[y].children[x];

      if (nextElement.childElementCount > 0) {
        if (checkElementForAttack(nextElement, id)) {
          addElementToAttackBlocks(nextElement, id);
        }
        pathsFound = true;
      } else {
        addElementToMoveBlocks(nextElement, id);
        stepX += tornAlts[i].x;
        stepY += tornAlts[i].y;
      }
    }
  }
}

function checkElementForAttack(element, id) {
  const pieceColor = id.split("-")[1];
  if (
    element !== undefined &&
    element.childElementCount > 0 &&
    !element.children[0].id.includes(pieceColor)
  ) {
    return true;
  }
  return false;
}

function bondePiece(target, id) {
  const nums = getNumsFromParentId(target.parentElement);

  const step = id.includes("gul") ? 0 : 2;

  const y = 7 - nums[1] + step;
  const x = nums[0] - 1;

  if (x < 0 || y < 0 || x >= 8 || y > 7) return;

  const element = playfield.children[y].children[x];

  const elLeftRight = [
    playfield.children[y].children[x - 1],
    playfield.children[y].children[x + 1],
  ];

  for (let i = 0; i < elLeftRight.length; i++) {
    if (checkElementForAttack(elLeftRight[i], id))
      addElementToAttackBlocks(elLeftRight[i], id);
  }

  if (element.childElementCount > 0) return;

  addElementToMoveBlocks(element, id);

  if (y === 5 && id.includes("gul")) {
    const element2 = playfield.children[y - 1].children[x];
    if (element2.childElementCount > 0) return;
    addElementToMoveBlocks(element2, id);
  } else if (y === 2 && id.includes("svart")) {
    const element2 = playfield.children[y + 1].children[x];
    if (element2.childElementCount > 0) return;
    addElementToMoveBlocks(element2, id);
  }
}

const horseAlts = [
  { x: 1, y: 2 },
  { x: -1, y: 2 },
  { x: 1, y: -2 },
  { x: -1, y: -2 },
  { x: 2, y: 1 },
  { x: 2, y: -1 },
  { x: -2, y: 1 },
  { x: -2, y: -1 },
];

function horsePiece(target, id) {
  const nums = getNumsFromParentId(target.parentElement);

  for (let i = 0; i < horseAlts.length; i++) {
    const x = nums[0] + horseAlts[i].x - 1;
    const y = 8 - nums[1] + horseAlts[i].y;

    if (x < 0 || y < 0 || x > 7 || y > 7) continue;

    let element = playfield.children[[y]].children[x];

    if (element.childElementCount > 0) {
      if (checkElementForAttack(element, id)) {
        addElementToAttackBlocks(element, id);
      }
      continue;
    }

    addElementToMoveBlocks(element, id);
  }
}

function getNumsFromParentId(parentElement) {
  const nums = parentElement.id.split("-");
  nums[0] = nums[0].charCodeAt(0) - 64;
  nums[1] = Number(nums[1]);
  return nums;
}

function addElementToMoveBlocks(element, id) {
  const pieceCheck = playerIsWhite ? "svart" : "gul";
  !id.includes(pieceCheck) && element.append(createSelectorImg("Green"));

  moveBlocks.push({
    element: element,
    func: () => {
      moveHere(id, element.id);
    },
  });

  element.addEventListener("click", moveBlocks[moveBlocks.length - 1].func);
}

function createSelectorImg(color) {
  const image = document.createElement("img");
  image.className = "selector-img";
  image.src = "assets/pictures/Selected_" + color + "_TP.webp";
  return image;
}

function addElementToAttackBlocks(element, id) {
  const pieceCheck = playerIsWhite ? "svart" : "gul";
  !id.includes(pieceCheck) && element.append(createSelectorImg("Red"));

  attackBlocks.push({
    element: element,
    func: () => {
      attackHere(id, element.id);
    },
  });

  element.addEventListener("click", attackBlocks[attackBlocks.length - 1].func);
}

const moveBlocks = [];
const attackBlocks = [];

function moveHere(pieceId, blockId) {
  const chessPiece = document.querySelector("#" + pieceId);

  document.querySelector("#" + blockId).append(chessPiece);

  resetPlayfield();

  const sound = new Audio("assets/sounds/move.wav");
  sound.play();

  switchTurn();
}

function attackHere(pieceId, blockId) {
  const block = document.querySelector("#" + blockId);

  block.children[0].remove();

  moveHere(pieceId, blockId);
}

function AIMove() {
  for (let i = 0; i < AIPieces.length; i++) {
    const id = AIPieces[i].id;

    if (AIPieces[i].parentElement === null) {
      AIPieces.splice(i, 1);
      i--;
    } else {
      checkPieceAlts(AIPieces[i], id);
    }
  }

  if (attackBlocks.length > 0) {
    const rand = Math.floor(Math.random() * attackBlocks.length);

    attackBlocks[rand].func();
  } else {
    const rand = Math.floor(Math.random() * moveBlocks.length);

    moveBlocks[rand].func();
  }

  AITurn = false;
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
