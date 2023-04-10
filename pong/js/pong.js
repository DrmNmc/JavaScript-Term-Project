const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let playerScore = 0;
let computerScore = 0;
let playerWins = 0;
let computerWins = 0;
let paddleSpeed = 8;

const paddleWidthHorz = 150;
const paddleHeightHorz = 10;

const paddleWidthVert = 10;
const paddleHeightVert = 150;

const ballSize = 10;
const initialBallSpeed = 8;

//location of initial paddles
const playerPaddleV = {
  x: 0,
  y: canvas.height / 2 - paddleHeightVert / 2,
};
const playerPaddleH = {
  x: canvas.width / 2 - paddleWidthHorz / 2,
  y: canvas.height - paddleHeightHorz,
};
const computerPaddleV = {
  x: canvas.width - paddleWidthVert,
  y: canvas.height / 2 - paddleHeightVert / 2,
};
const computerPaddleH = {
  x: canvas.width / 2 - paddleWidthHorz / 2,
  y: 0,
};

//ball location and ball x and y velocity
const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  vx: initialBallSpeed, //begin by moving horizontally only, from the middle of canvas
  vy: 0,
};

function drawBackground() {
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

function drawPaddle(x, y, width, height) {
  ctx.fillStyle = "white";
  ctx.fillRect(x, y, width, height);
}

function drawBall(x, y, size) {
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2, true);
  ctx.fillStyle = "white";
  ctx.fill();
}

function drawScore() {
  ctx.font = "24px Arial";
  ctx.fillStyle = "white";
  ctx.fillText("User: " + playerScore, 10, 30);
  ctx.fillText("Computer: " + computerScore, canvas.width - 150, 30);
}

function drawWins() {
  ctx.font = "24px Arial";
  ctx.fillStyle = "white";
  ctx.fillText("User Wins: " + playerWins, 10, canvas.height - 10);
  ctx.fillText(
    "Computer Wins: " + computerWins,
    canvas.width - 200,
    canvas.height - 10
  );
}

//instead of one listen event make a keystate so that both paddles can be moved simultaneously.
const keyState = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
};

//stop the paddles at canvas edge or else move on keydown
function movePlayerPaddles() {
  if (keyState.ArrowUp && playerPaddleV.y > 0) {
    playerPaddleV.y -= paddleSpeed;
  }
  if (
    keyState.ArrowDown &&
    playerPaddleV.y < canvas.height - paddleHeightVert
  ) {
    playerPaddleV.y += paddleSpeed;
  }
  if (keyState.ArrowLeft && playerPaddleH.x > 0) {
    playerPaddleH.x -= paddleSpeed;
  }
  if (keyState.ArrowRight && playerPaddleH.x < canvas.width - paddleWidthHorz) {
    playerPaddleH.x += paddleSpeed;
  }
}

function moveComputerPaddles() {
  let computerPaddleSpeedV =
    Math.abs(ball.y - (computerPaddleV.y + paddleHeightVert / 2)) / 10;
  let computerPaddleSpeedH =
    Math.abs(ball.x - (computerPaddleH.x + paddleWidthHorz / 2)) / 10;

  if (ball.y < computerPaddleV.y + paddleHeightVert / 2) {
    computerPaddleV.y -= computerPaddleSpeedV;
  } else {
    computerPaddleV.y += computerPaddleSpeedV;
  }
  computerPaddleV.y = Math.max(
    Math.min(computerPaddleV.y, canvas.height - paddleHeightVert),
    0
  );

  if (ball.x < computerPaddleH.x + paddleWidthHorz / 2) {
    computerPaddleH.x -= computerPaddleSpeedH;
  } else {
    computerPaddleH.x += computerPaddleSpeedH;
  }
  computerPaddleH.x = Math.max(
    Math.min(computerPaddleH.x, canvas.width - paddleWidthHorz),
    0
  );
}

//this will change the direction of the ball(velocities with vx and vy) and maps it to x and y.
function moveBall() {
  ball.x += ball.vx;
  ball.y += ball.vy;
}

function checkCollisions() {
  //collision with vertical paddles checks ball position and paddle position to detect collision.
  if (
    (ball.y >= playerPaddleV.y &&
      ball.y <= playerPaddleV.y + paddleHeightVert && //check paddle edge hit, not wall hit at paddle location.
      ball.x <= playerPaddleV.x + paddleWidthVert) ||
    (ball.y >= computerPaddleV.y &&
      ball.y <= computerPaddleV.y + paddleHeightVert &&
      ball.x + ballSize >= computerPaddleV.x)
  ) {
    //the math isn't flawless but this takes into account where the paddle is and causes the ball to angle off of the paddle
    //in a direction relative to how close it is to the edge of the paddle.
    const paddle =
      ball.x <= playerPaddleV.x + paddleWidthVert
        ? playerPaddleV
        : computerPaddleV;
    const relativeY = (ball.y - paddle.y) / paddleHeightVert;
    //the angle is determined by the relativeY (for verticle) in relation to 90 degrees (math.pi/2)
    const angle = (relativeY - 0.5) * (Math.PI / 2);
    ball.vx = -ball.vx;
    //the velocity of the ball's y movement takes the angle and math.sin (for verticle) to determine the new velocity (direction) along the y axis.
    ball.vy = Math.sin(angle) * 10;
  }

  //collision with horizontal paddles
  if (
    (ball.x >= playerPaddleH.x &&
      ball.x <= playerPaddleH.x + paddleWidthHorz &&
      ball.y + ballSize >= playerPaddleH.y) ||
    (ball.x >= computerPaddleH.x &&
      ball.x <= computerPaddleH.x + paddleWidthHorz &&
      ball.y <= computerPaddleH.y + paddleHeightHorz)
  ) {
    const paddle =
      ball.y + ballSize >= playerPaddleH.y ? playerPaddleH : computerPaddleH;
    const relativeX = (ball.x - paddle.x) / paddleWidthHorz;
    const angle = (relativeX - 0.5) * (Math.PI / 2);
    ball.vy = -ball.vy;
    ball.vx = Math.sin(angle) * 10;

    //BALL SLOWING DOWN FIX
    //this is a fix loosely based on a stack overflow suggestion of a similar issue. The magnitude must be calculated, and the speed of the ball
    //can be maintained by taking the angle (which also becomes the velocity) of the ball, and divide it by magnitude,
    //and then multiply it by initial speed.
    //It doesn't keep it perfectly balanced, but it doesn't allow for slowing, as was occuring.
    const magnitude = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    ball.vx = (ball.vx / magnitude) * initialBallSpeed;
    ball.vy = (ball.vy / magnitude) * initialBallSpeed;
  }
}

function checkScore() {
  if (ball.y - ballSize / 2 <= 0) {
    playerScore++;
    resetBall();
  } else if (ball.y + ballSize / 2 >= canvas.height) {
    computerScore++;
    resetBall();
  } else if (ball.x - ballSize / 2 <= 0) {
    computerScore++;
    resetBall();
  } else if (ball.x + ballSize / 2 >= canvas.width) {
    playerScore++;
    resetBall();
  }

  if (playerScore >= 7 || computerScore >= 7) {
    if (playerScore > computerScore) {
      playerWins++;
    } else {
      computerWins++;
    }
    if (playerWins == 3 || computerWins == 3) {
      gameOver();
    }
    playerScore = 0;
    computerScore = 0;
  }
}

function gameOver() {
  const gameOverModal = document.getElementById("gameOverModal");
  const gameOverMessage = document.getElementById("gameOverMessage");
  const playAgainButton = document.getElementById("playAgainButton");
  const returnToInterfaceButton = document.getElementById(
    "returnToInterfaceButton"
  );

  if (playerWins > computerWins) {
    gameOverMessage.textContent = "Game Over: User wins!";
  } else {
    gameOverMessage.textContent = "Game Over: Computer wins!";
  }

  gameOverModal.style.display = "flex";

  playAgainButton.addEventListener("click", () => {
    gameOverModal.style.display = "none";
    resetGame();
  });

  returnToInterfaceButton.addEventListener("click", () => {
    window.location.href = "../interface.html";
  });
}

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.vx = initialBallSpeed;
  ball.vy = 0;
}

function resetGame() {
  playerScore = 0;
  computerScore = 0;
  playerWins = 0;
  computerWins = 0;
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawPaddle(
    playerPaddleV.x,
    playerPaddleV.y,
    paddleWidthVert,
    paddleHeightVert
  );
  drawPaddle(
    playerPaddleH.x,
    playerPaddleH.y,
    paddleWidthHorz,
    paddleHeightHorz
  );
  drawPaddle(
    computerPaddleV.x,
    computerPaddleV.y,
    paddleWidthVert,
    paddleHeightVert
  );
  drawPaddle(
    computerPaddleH.x,
    computerPaddleH.y,
    paddleWidthHorz,
    paddleHeightHorz
  );
  drawBall(ball.x, ball.y, ballSize);
  drawScore();
  drawWins();
  moveBall();
  moveComputerPaddles();
  movePlayerPaddles();

  checkCollisions();
  checkScore();

  requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", (event) => {
  if (event.key in keyState) {
    keyState[event.key] = true;
  }
});

window.addEventListener("keyup", (event) => {
  if (event.key in keyState) {
    keyState[event.key] = false;
  }
});
gameLoop();
