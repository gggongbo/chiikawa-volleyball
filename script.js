// 캔버스 및 컨텍스트 설정
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 게임 설정
const GRAVITY = 0.6;
const GROUND_Y = canvas.height - 50;
const NET_HEIGHT = 150;
const BALL_BOUNCE = 0.8;
const WIN_SCORE_DIFFERENCE = 5;

// 게임 상태 관리
let gameMode = "menu"; // 'menu', 'singlePlayer', 'twoPlayer'
let gameState = {
  playerScore: 0,
  enemyScore: 0,
  ballServe: "player",
  isGameRunning: false,
  winner: null,
};

// 화면 요소 참조
const menuScreen = document.getElementById("menuScreen");
const gameScreen = document.getElementById("gameScreen");
const winScreen = document.getElementById("winScreen");
const singlePlayerBtn = document.getElementById("singlePlayerBtn");
const twoPlayerBtn = document.getElementById("twoPlayerBtn");
const singlePlayerControls = document.getElementById("singlePlayerControls");
const twoPlayerControls = document.getElementById("twoPlayerControls");
const playAgainBtn = document.getElementById("playAgainBtn");
const backToMenuBtn = document.getElementById("backToMenuBtn");

// 이미지 로드
const images = {
  player: new Image(),
  enemy: new Image(),
  ball: new Image(),
};

images.player.src = "images/hachiware.png";
images.enemy.src = "images/chiikawa.png";
images.ball.src = "images/ball.png";

// 플레이어 객체
const player = {
  x: 100,
  y: GROUND_Y - 60,
  width: 60,
  height: 60,
  velocityX: 0,
  velocityY: 0,
  speed: 5,
  jumpPower: 15,
  onGround: true,
  side: "left",
};

// 적/2P 플레이어 객체
const enemy = {
  x: canvas.width - 160,
  y: GROUND_Y - 60,
  width: 60,
  height: 60,
  velocityX: 0,
  velocityY: 0,
  speed: 3,
  jumpPower: 13,
  onGround: true,
  side: "right",
  aiTimer: 0,
  // 2P 모드에서는 speed가 player와 동일하게 조정됨
  playerSpeed: 5,
  playerJumpPower: 15,
};

// 공 객체
const ball = {
  x: canvas.width / 2,
  y: 100,
  radius: 20,
  velocityX: 3,
  velocityY: 0,
  lastTouchedBy: null,
};

// 네트 객체
const net = {
  x: canvas.width / 2 - 5,
  y: GROUND_Y - NET_HEIGHT,
  width: 10,
  height: NET_HEIGHT,
};

// 키보드 입력 처리
const keys = {};

document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  keys[e.key.toLowerCase()] = true;

  // ESC키로 메뉴로 돌아가기
  if (e.key === "Escape" && gameMode !== "menu") {
    showMenu();
  }
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
  keys[e.key.toLowerCase()] = false;
});

// 화면 전환 함수들
function showMenu() {
  gameMode = "menu";
  gameState.isGameRunning = false;
  menuScreen.classList.remove("hidden");
  gameScreen.classList.add("hidden");
  winScreen.classList.add("hidden");
}

function showGame(mode) {
  gameMode = mode;
  menuScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  winScreen.classList.add("hidden");

  // 조작법 표시 전환
  if (mode === "singlePlayer") {
    singlePlayerControls.classList.remove("hidden");
    twoPlayerControls.classList.add("hidden");
    // AI 모드로 적 설정
    enemy.speed = 3;
    enemy.jumpPower = 13;
  } else {
    singlePlayerControls.classList.add("hidden");
    twoPlayerControls.classList.remove("hidden");
    // 2P 모드로 적 설정 (플레이어와 동일한 능력)
    enemy.speed = enemy.playerSpeed;
    enemy.jumpPower = enemy.playerJumpPower;
  }

  initializeGame();
}

function showWinScreen(winner, finalScore) {
  winScreen.classList.remove("hidden");
  document.getElementById("winnerText").textContent = `승자: ${winner}!`;
  document.getElementById(
    "winScoreText"
  ).textContent = `최종 점수: ${finalScore.player} - ${finalScore.enemy}`;
  gameState.isGameRunning = false;
}

// 게임 초기화
function initializeGame() {
  gameState.playerScore = 0;
  gameState.enemyScore = 0;
  gameState.ballServe = "player";
  gameState.isGameRunning = true;
  gameState.winner = null;

  // 플레이어 위치 리셋
  player.x = 100;
  player.y = GROUND_Y - player.height;
  player.velocityX = 0;
  player.velocityY = 0;
  player.onGround = true;

  // 적 위치 리셋
  enemy.x = canvas.width - 160;
  enemy.y = GROUND_Y - enemy.height;
  enemy.velocityX = 0;
  enemy.velocityY = 0;
  enemy.onGround = true;
  enemy.aiTimer = 0;

  resetBall();
  updateScore();
}

// 플레이어 업데이트 (1P)
function updatePlayer() {
  // 좌우 이동
  if (keys["ArrowLeft"] && player.x > 0) {
    player.velocityX = -player.speed;
  } else if (
    keys["ArrowRight"] &&
    player.x < canvas.width / 2 - player.width - 20
  ) {
    player.velocityX = player.speed;
  } else {
    player.velocityX *= 0.8; // 마찰
  }

  // 점프
  if (keys[" "] && player.onGround) {
    player.velocityY = -player.jumpPower;
    player.onGround = false;
  }

  // 물리 적용
  player.x += player.velocityX;
  player.y += player.velocityY;
  player.velocityY += GRAVITY;

  // 바닥 충돌
  if (player.y >= GROUND_Y - player.height) {
    player.y = GROUND_Y - player.height;
    player.velocityY = 0;
    player.onGround = true;
  }

  // 경계 제한
  if (player.x < 0) player.x = 0;
  if (player.x > canvas.width / 2 - player.width - 20) {
    player.x = canvas.width / 2 - player.width - 20;
  }
}

// AI 적 업데이트 (1P 모드)
function updateEnemyAI() {
  const ballDistance = Math.abs(ball.x - (enemy.x + enemy.width / 2));
  const ballOnEnemySide = ball.x > canvas.width / 2;

  enemy.aiTimer++;

  // AI 행동 결정
  if (ballOnEnemySide && ballDistance < 200) {
    // 공이 적 쪽에 있고 가까울 때
    if (ball.x > enemy.x + enemy.width / 2 + 20) {
      enemy.velocityX = enemy.speed; // 오른쪽으로
    } else if (ball.x < enemy.x + enemy.width / 2 - 20) {
      enemy.velocityX = -enemy.speed; // 왼쪽으로
    } else {
      enemy.velocityX *= 0.8;
    }

    // 점프 조건
    if (
      ball.y < enemy.y &&
      ballDistance < 80 &&
      enemy.onGround &&
      enemy.aiTimer > 20
    ) {
      enemy.velocityY = -enemy.jumpPower;
      enemy.onGround = false;
      enemy.aiTimer = 0;
    }
  } else {
    // 기본 위치로 복귀
    const homeX = canvas.width - 160;
    if (enemy.x < homeX - 10) {
      enemy.velocityX = enemy.speed * 0.5;
    } else if (enemy.x > homeX + 10) {
      enemy.velocityX = -enemy.speed * 0.5;
    } else {
      enemy.velocityX *= 0.8;
    }
  }
}

// 2P 플레이어 업데이트 (2P 모드)
function updateEnemyPlayer() {
  // 좌우 이동 (A, D 키)
  if (keys["a"] && enemy.x > canvas.width / 2 + 20) {
    enemy.velocityX = -enemy.speed;
  } else if (keys["d"] && enemy.x < canvas.width - enemy.width) {
    enemy.velocityX = enemy.speed;
  } else {
    enemy.velocityX *= 0.8; // 마찰
  }

  // 점프 (W 키)
  if (keys["w"] && enemy.onGround) {
    enemy.velocityY = -enemy.jumpPower;
    enemy.onGround = false;
  }
}

// 적 업데이트 (모드에 따라 AI 또는 플레이어)
function updateEnemy() {
  if (gameMode === "singlePlayer") {
    updateEnemyAI();
  } else if (gameMode === "twoPlayer") {
    updateEnemyPlayer();
  }

  // 물리 적용
  enemy.x += enemy.velocityX;
  enemy.y += enemy.velocityY;
  enemy.velocityY += GRAVITY;

  // 바닥 충돌
  if (enemy.y >= GROUND_Y - enemy.height) {
    enemy.y = GROUND_Y - enemy.height;
    enemy.velocityY = 0;
    enemy.onGround = true;
  }

  // 경계 제한
  if (enemy.x < canvas.width / 2 + 20) {
    enemy.x = canvas.width / 2 + 20;
  }
  if (enemy.x > canvas.width - enemy.width) {
    enemy.x = canvas.width - enemy.width;
  }
}

// 공 업데이트
function updateBall() {
  ball.x += ball.velocityX;
  ball.y += ball.velocityY;
  ball.velocityY += GRAVITY * 0.3; // 공에는 약간의 중력만

  // 좌우 벽 충돌 (득점)
  if (ball.x <= ball.radius) {
    // 적 득점
    gameState.enemyScore++;
    gameState.ballServe = "enemy";
    resetBall();
    updateScore();
    checkWinCondition();
  } else if (ball.x >= canvas.width - ball.radius) {
    // 플레이어 득점
    gameState.playerScore++;
    gameState.ballServe = "player";
    resetBall();
    updateScore();
    checkWinCondition();
  }

  // 천장 충돌
  if (ball.y <= ball.radius) {
    ball.y = ball.radius;
    ball.velocityY = Math.abs(ball.velocityY) * BALL_BOUNCE;
  }

  // 바닥 충돌
  if (ball.y >= GROUND_Y - ball.radius) {
    ball.y = GROUND_Y - ball.radius;
    ball.velocityY = -Math.abs(ball.velocityY) * BALL_BOUNCE;
    ball.velocityX *= 0.9; // 바닥에서 마찰
  }

  // 네트 충돌
  if (
    ball.x + ball.radius > net.x &&
    ball.x - ball.radius < net.x + net.width &&
    ball.y + ball.radius > net.y
  ) {
    if (ball.x < net.x + net.width / 2) {
      ball.x = net.x - ball.radius;
    } else {
      ball.x = net.x + net.width + ball.radius;
    }
    ball.velocityX = -ball.velocityX * BALL_BOUNCE;
  }

  // 플레이어와 공 충돌
  checkBallPlayerCollision(player);
  checkBallPlayerCollision(enemy);
}

// 공과 플레이어 충돌 검사
function checkBallPlayerCollision(playerObj) {
  const dx = ball.x - (playerObj.x + playerObj.width / 2);
  const dy = ball.y - (playerObj.y + playerObj.height / 2);
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < ball.radius + 30) {
    // 충돌 감지
    // 충돌 각도 계산
    const angle = Math.atan2(dy, dx);
    const power = 8;

    // 공의 새로운 속도
    ball.velocityX = Math.cos(angle) * power;
    ball.velocityY = Math.sin(angle) * power;

    // 위쪽으로 쳐올리기
    if (ball.velocityY > -2) {
      ball.velocityY = -Math.abs(ball.velocityY) - 2;
    }

    ball.lastTouchedBy = playerObj.side;

    // 공을 플레이어 밖으로 밀어내기
    const pushDistance = ball.radius + 30 - distance;
    ball.x += Math.cos(angle) * pushDistance;
    ball.y += Math.sin(angle) * pushDistance;
  }
}

// 승리 조건 확인 (5점차 이상으로 승리)
function checkWinCondition() {
  const scoreDifference = Math.abs(
    gameState.playerScore - gameState.enemyScore
  );

  if (scoreDifference >= WIN_SCORE_DIFFERENCE) {
    if (gameState.playerScore > gameState.enemyScore) {
      gameState.winner = "player";
      showWinScreen("하치와레", {
        player: gameState.playerScore,
        enemy: gameState.enemyScore,
      });
    } else {
      gameState.winner = "enemy";
      showWinScreen("치이카와", {
        player: gameState.playerScore,
        enemy: gameState.enemyScore,
      });
    }
  }
}

// 공 리셋
function resetBall() {
  if (gameState.ballServe === "player") {
    ball.x = canvas.width / 4;
    ball.y = 100;
    ball.velocityX = 3;
  } else {
    ball.x = (canvas.width * 3) / 4;
    ball.y = 100;
    ball.velocityX = -3;
  }
  ball.velocityY = 0;
  ball.lastTouchedBy = null;
}

// 점수 업데이트
function updateScore() {
  document.getElementById("playerScore").textContent = gameState.playerScore;
  document.getElementById("enemyScore").textContent = gameState.enemyScore;
}

// 렌더링
function render() {
  // 배경 클리어
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 코트 라인 그리기
  ctx.strokeStyle = "#FFF";
  ctx.lineWidth = 3;

  // 중앙선
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, GROUND_Y);
  ctx.stroke();

  // 바닥선
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(canvas.width, GROUND_Y);
  ctx.stroke();

  // 네트 그리기
  ctx.fillStyle = "#8B4513";
  ctx.fillRect(net.x, net.y, net.width, net.height);

  // 네트 패턴
  ctx.strokeStyle = "#654321";
  ctx.lineWidth = 2;
  for (let i = net.y; i < net.y + net.height; i += 20) {
    ctx.beginPath();
    ctx.moveTo(net.x, i);
    ctx.lineTo(net.x + net.width, i);
    ctx.stroke();
  }

  // 플레이어 그리기
  if (images.player.complete) {
    ctx.drawImage(
      images.player,
      player.x,
      player.y,
      player.width,
      player.height
    );
  } else {
    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(player.x, player.y, player.width, player.height);
  }

  // 적 그리기
  if (images.enemy.complete) {
    ctx.drawImage(images.enemy, enemy.x, enemy.y, enemy.width, enemy.height);
  } else {
    ctx.fillStyle = "#F44336";
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  }

  // 공 그리기
  if (images.ball.complete) {
    ctx.drawImage(
      images.ball,
      ball.x - ball.radius,
      ball.y - ball.radius,
      ball.radius * 2,
      ball.radius * 2
    );
  } else {
    ctx.fillStyle = "#FF9800";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // 그림자 그리기
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.ellipse(
    player.x + player.width / 2,
    GROUND_Y + 5,
    player.width / 3,
    10,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.ellipse(
    enemy.x + enemy.width / 2,
    GROUND_Y + 5,
    enemy.width / 3,
    10,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.ellipse(ball.x, GROUND_Y + 5, ball.radius / 2, 5, 0, 0, Math.PI * 2);
  ctx.fill();
}

// 게임 루프
function gameLoop() {
  if (gameState.isGameRunning) {
    updatePlayer();
    updateEnemy();
    updateBall();
  }

  // 게임이 실행 중이거나 메뉴가 아닐 때만 렌더링
  if (gameMode !== "menu") {
    render();
  }

  requestAnimationFrame(gameLoop);
}

// 이벤트 리스너 설정
singlePlayerBtn.addEventListener("click", () => showGame("singlePlayer"));
twoPlayerBtn.addEventListener("click", () => showGame("twoPlayer"));
playAgainBtn.addEventListener("click", () => showGame(gameMode));
backToMenuBtn.addEventListener("click", () => showMenu());

// 게임 재시작 (R키)
document.addEventListener("keydown", (e) => {
  if ((e.key === "r" || e.key === "R") && gameState.isGameRunning) {
    initializeGame();
  }
});

// 게임 시작
document.addEventListener("DOMContentLoaded", () => {
  showMenu();
  gameLoop();
});
