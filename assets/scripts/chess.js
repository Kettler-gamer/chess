const playfield = document.querySelector(".playfield");
const pageMenu = document.querySelector(".page-menu");
const jsonData = fetch("./assets/json/chessPieceData.json");

const blackPieces = [];

let yellowPieceTurn = true;

let chessPieces;

getData();

async function getData() {
  await Promise.all([jsonData]).then(async (response) => {
    chessPieces = await response[0].json();
  });
}

checkChessPieces();

function checkChessPieces() {
  if (chessPieces === undefined) {
    console.log("chessPieces undefined");
    setTimeout(checkChessPieces, 1000);
  } else {
    console.log("chessPieces NOT undefined");
    pageMenu.children[0].hidden = true;
    pageMenu.children[1].hidden = false;
    pageMenu.children[1].style = "";
    pageMenu.children[2].hidden = false;
  }
}

const pageCover = document.querySelector(".page-cover");

function startGame() {
  pageMenu.style = "visibility: hidden;";
  setTimeout(setUpblackPiece, 0);
}

function restartGame() {
  pageCover.style = "";
  removeAllPieces();
  yellowPieceTurn = true;
  it = 0;
  startGame();
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
  piece.style = "scale: -1";

  block.append(piece);
  blackPieces.push(piece);

  it++;

  setTimeout(setUpblackPiece, blackPieceTimer);
}

function setUpYellowPieces() {
  if (it === 32) {
    pageCover.style = "visibility: hidden";
    return;
  }

  const block = document.querySelector("#" + chessPieces[it].startBlock);

  const piece = createBasicPiece(chessPieces[it].id, chessPieces[it].img);
  piece.addEventListener("click", onChessPieceClick);

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
  const target = event.target;
  const id = target.id;
  if (!yellowPieceTurn && id.includes("gul")) return;
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
  nums[0] = getNumberFromChar(nums[0]);
  nums[1] = Number(nums[1]);
  return nums;
}

function addElementToMoveBlocks(element, id) {
  !id.includes("svart") && element.append(createSelectorImg("Green"));

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
  !id.includes("svart") && element.append(createSelectorImg("Red"));

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

function AIBlackMove() {
  for (let i = 0; i < blackPieces.length; i++) {
    const id = blackPieces[i].id;

    if (blackPieces[i].parentElement === null) {
      blackPieces.splice(i, 1);
      i--;
    } else {
      checkPieceAlts(blackPieces[i], id);
    }
  }

  if (attackBlocks.length > 0) {
    const rand = Math.floor(Math.random() * attackBlocks.length);

    attackBlocks[rand].func();
  } else {
    const rand = Math.floor(Math.random() * moveBlocks.length);

    moveBlocks[rand].func();
  }

  yellowPieceTurn = true;
}

function switchTurn() {
  if (winConditionMet()) {
    yellowPieceTurn = false;
  } else {
    yellowPieceTurn = !yellowPieceTurn;
    if (yellowPieceTurn === false) {
      setTimeout(AIBlackMove, 1000);
    }
  }
}

function winConditionMet() {
  const blackKing = document.querySelector("#kung-svart");
  const yellowKing = document.querySelector("#kung-gul");

  if (blackKing === null || yellowKing === null) {
    const message = blackKing === null ? "Player Wins!" : "AI wins!";

    pageMenu.style = "";
    pageMenu.children[1].textContent = message;
    pageMenu.children[2].hidden = true;
    pageMenu.children[3].hidden = false;

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

function getNumberFromChar(char) {
  switch (char) {
    case "A":
      return 1;
    case "B":
      return 2;
    case "C":
      return 3;
    case "D":
      return 4;
    case "E":
      return 5;
    case "F":
      return 6;
    case "G":
      return 7;
    case "H":
      return 8;
    default:
      return undefined;
  }
}
