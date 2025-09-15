// Create a representation of the DOM (Document Object Model)

const startText = document.getElementById('startPress');
const paddle1 = document.getElementById('paddle1');
const paddle2 = document.getElementById('paddle2');
const ball = document.getElementById('ball');
const player1ScoreElement = document.getElementById('player1Score');
const player2ScoreElement = document.getElementById('player2Score');
const lossSound = document.getElementById('lossSound');
const wallSound = document.getElementById('wallSound');
const paddleSound = document.getElementById('paddleSound');


// #Game Variables

let gameRunning = false;

// Key Press.
let keysPressed = {};
console.log(gameRunning);

// Start Game Function.
document.addEventListener('keydown', startGame);
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);
function startGame() {
  gameRunning = true;
  startText.style.display = 'none';
  console.log('start');
  // Remove Event Listener.
  document.removeEventListener('keydown', startGame);
  gameLoop();
}

// Add the game Loop.

function gameLoop() {
  if (gameRunning) {
    updatePaddle1();
    updatePaddle2();
    moveBall();

    setTimeout(gameLoop, 8);
  }
}

function handleKeyDown(e) {
  keysPressed[e.key] = true;
}

function handleKeyUp(e) {
  keysPressed[e.key] = false;
}

let paddle1Speed = 0;
let paddle1Y = 150; // Top part of the paddle.

let paddle2Speed = 0;
let paddle2Y = 150; // Top part of the paddle.

let player1Score = 0;
let player2Score = 0;
//____________ ball
let ballX = 290; // Game wifth / 2 - ball Widht
let ballSpeedX = 2

let ballY = 190; // Game height / 2 - ball Widht
let ballSpeedY = 2

const paddleAcceleration = 1;
const maxPaddleSpeed = 5;
const paddleDeceleration = 1;
const gameHeight = 400; // game Area height;
const gameWidth = 600;

//______________________ Paddle 1.

function updatePaddle1() {
  if (keysPressed['w']) {
    paddle1Speed = Math.max(paddle1Speed - paddleAcceleration, -maxPaddleSpeed);
  }
  else if (keysPressed['s']) {
    paddle1Speed = Math.min(paddle1Speed + paddleAcceleration, maxPaddleSpeed);
  }
  else {
    if (paddle1Speed > 0) {
      paddle1Speed = Math.max(paddle1Speed - paddleDeceleration, 0);
    }
    else if (paddle1Speed < 0) {
      paddle1Speed = Math.min(paddle1Speed + paddleDeceleration, 0);
    }
  }
  paddle1Y += paddle1Speed;
  if (paddle1Y < 0) {
    paddle1Y = 0;
  }
  if (paddle1Y > gameHeight - paddle1.clientHeight) {
    paddle1Y = gameHeight - paddle1.clientHeight;
  }
  paddle1.style.top = paddle1Y + 'px';
}

//______________________ Paddle 2.

function updatePaddle2() {
  if (keysPressed['ArrowUp']) {
    paddle2Speed = Math.max(paddle2Speed - paddleAcceleration, -maxPaddleSpeed);
  }
  else if (keysPressed['ArrowDown']) {
    paddle2Speed = Math.min(paddle2Speed + paddleAcceleration, maxPaddleSpeed);
  }
  else {
    if (paddle2Speed > 0) {
      paddle2Speed = Math.max(paddle2Speed - paddleDeceleration, 0);
    }
    else if (paddle2Speed < 0) {
      paddle2Speed = Math.min(paddle2Speed + paddleDeceleration, 0);
    }
  }
  paddle2Y += paddle2Speed;
  if (paddle2Y < 0) {
    paddle2Y = 0;
  }
  if (paddle2Y > gameHeight - paddle2.clientHeight) {
    paddle2Y = gameHeight - paddle2.clientHeight;
  }
  paddle2.style.top = paddle2Y + 'px';
}

function moveBall() {
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  if (ballY >= gameHeight - ball.clientHeight || ballY <= 0) {
    ballSpeedY = -ballSpeedY;
    playSound(wallSound);
  }

  //______________ Paddle 1 collition
  if (ballX <= paddle1.clientWidth
    && ballY >= paddle1Y &&
    ballY <= paddle1Y + paddle1.clientHeight
  ) {
    ballSpeedX = -ballSpeedX;
    playSound(paddleSound);
  }

  //______________ Paddle 1 collition

  if (ballX >= gameWidth - paddle2.clientWidth - ball.clientWidth
    && (ballY >= paddle2Y) &&
    ballY <= paddle2Y + paddle2.clientHeight
  ) {
    ballSpeedX = -ballSpeedX;
    playSound(paddleSound);
  }

  //___________ Out of Game Area.

  if (ballX <= 0) {
    player2Score += 1;
    playSound(lossSound);
    updateScoreboard();
    resetBall();
    pauseGame();
  }
  else if (ballX >= gameWidth - ball.clientWidth) {
    player1Score += 1;
    playSound(lossSound);
    updateScoreboard();
    resetBall();
    pauseGame();
  }
  ball.style.left = ballX + 'px';
  ball.style.top = ballY + 'px';

}

function updateScoreboard() {
  player1ScoreElement.textContent = player1Score;
  player2ScoreElement.textContent = player2Score;
}

function resetBall() {
  ballX = gameWidth / 2 - ball.clientWidth / 2;
  ballY = gameHeight / 2 - ball.clientHeight / 2;
  ballSpeedX = Math.random() > 0.5 ? 2 : -2;
  ballSpeedY = Math.random() > 0.5 ? 2 : -2;
};

function pauseGame() {
  gameRunning = false;
  document.addEventListener('keydown', startGame);
};

function playSound(sound) {
  sound.currentTime = 0;
  sound.play();
}