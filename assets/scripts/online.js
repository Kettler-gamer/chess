let socket;

function setUpSocketConnection(adress) {
  socket = new WebSocket("ws://" + adress);

  socket.onopen = function (e) {
    console.log("Connection established");
  };

  socket.onmessage = (event) => {
    const data = event.data;
    commandHandler(data);
  };

  socket.onclose = function (event) {
    if (event.wasClean) {
      console.log(
        `[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`
      );
    } else {
      // e.g. server process killed or network down
      // event.code is usually 1006 in this case
      console.log("Connection failed! Please check your connection!");
    }
  };

  socket.onerror = function (error) {
    console.log(error);
  };
}

function commandHandler(command) {
  switch (true) {
    case command.includes("start-"):
      gameMode = "online";
      if (command.includes("white")) {
        amIWhite = true;
        myTurn = true;
      } else {
        amIWhite = false;
        myTurn = false;
        playfield.parentElement.style = "transform: rotateZ(180deg)";
      }
      startGame();
      break;
    case command.includes("moved"):
      synchronizeMove(command);
      break;
  }
}

function synchronizeMove(command) {
  const commandArr = command.split(" ");
  const piece = document.querySelector(`#${commandArr[1]}`);
  const block = document.querySelector(`#${commandArr[2]}`);
  if (block.children.length > 0) {
    block.childNodes[0].remove();
  }
  block.append(piece);
  myTurn = true;
}
