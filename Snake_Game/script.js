const board = document.querySelector(".board");
const startButton = document.querySelector(".btn-start");
const modal = document.querySelector(".modal");
const startGameModal = document.querySelector(".start-game");
const gameOverModal = document.querySelector(".game-over");
const restartButton = document.querySelector(".btn-restart");

const highScoreElement = document.querySelector("#high-score");
const scoreElement = document.querySelector("#score");
const timeElement = document.querySelector("#time");

// Measure the actual rendered block size instead of assuming 50px.
// Mobile screens use a smaller grid cell (see the @media rule in style.css),
// so the column/row count must be derived from the real size, not a constant.
function getBlockSize() {
    const probe = document.createElement("div");
    probe.classList.add("block");
    probe.style.visibility = "hidden";
    board.appendChild(probe);
    const rect = probe.getBoundingClientRect();
    board.removeChild(probe);
    return { width: rect.width || 50, height: rect.height || 50 };
}

const { width: blockWidth, height: blockHeight } = getBlockSize();

let highScore = localStorage.getItem("highScore") || 0;
let score = 0;
let time = `00:00`;

highScoreElement.innerText = highScore;

const cols = Math.floor(board.clientWidth / blockWidth);
const rows = Math.floor(board.clientHeight / blockHeight);

let intervalId = null;
let timeIntervalId = null;

let food = {x: Math.floor(Math.random() * rows), y: Math.floor(Math.random() * cols)};

const blocks = [];
let snake = [
    {
        x: 1, y: 3
    } ];

let direction = 'down';

for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
        const block = document.createElement("div");
        block.classList.add("block");
        board.appendChild(block);
        blocks[` ${row},${col} `] = block;
    }
}

function render() {

    let head = null;

    blocks[` ${food.x},${food.y} `].classList.add("food");

    if (direction === 'left') {
        head = { x: snake[0].x, y: snake[0].y - 1 };
    }
    else if (direction === 'right') {
        head = { x: snake[0].x, y: snake[0].y + 1 };
    }
    else if (direction === 'down') {
        head = { x: snake[0].x + 1, y: snake[0].y };
    }
    else if (direction === 'up') {
        head = { x: snake[0].x - 1, y: snake[0].y };
    }

    // Wall collision logic
    if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {
        
        clearInterval(intervalId);
        clearInterval(timeIntervalId);

        modal.style.display = "flex";
        startGameModal.style.display = "none";
        gameOverModal.style.display = "flex";

        return;
    }

    // Food consume logic
    let ateFood = false;
    if (head.x == food.x && head.y == food.y) {

        blocks[` ${food.x},${food.y} `].classList.remove("food");
        do {
            food = {
                x: Math.floor(Math.random() * rows),
                y: Math.floor(Math.random() * cols)
            };
        } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
        blocks[` ${food.x},${food.y} `].classList.add("food");
        
        ateFood = true;

        score += 10;
        scoreElement.innerText = score;

        if (score > highScore) {
            highScore = score;
            localStorage.setItem("highScore", highScore.toString());
            highScoreElement.innerText = highScore;
        }
    }

    snake.forEach(segment => {
        blocks[` ${segment.x},${segment.y} `].classList.remove("fill");
    })

    snake.unshift(head);
    if (!ateFood) {
        snake.pop();
    }

    snake.forEach(segment => {
        blocks[` ${segment.x},${segment.y} `].classList.add("fill");
    })
}

function updateTime() {
    let [min, sec] = time.split(":").map(Number);

    sec++;

    if (sec === 60) {
        sec = 0;
        min++;
    }

    time =
        String(min).padStart(2, "0") +
        ":" +
        String(sec).padStart(2, "0");

    timeElement.innerText = time;
}

startButton.addEventListener("click", () => {

    modal.style.display = "none";

    clearInterval(intervalId);
    clearInterval(timeIntervalId);

    intervalId = setInterval(() => {
        render();
    }, 300);

    timeIntervalId = setInterval(updateTime, 1000);
});

restartButton.addEventListener("click", restartGame);

function restartGame() {

    blocks[` ${food.x},${food.y} `].classList.remove("food");
    snake.forEach(segment => {
        blocks[` ${segment.x},${segment.y} `].classList.remove("fill");
    })

    score = 0;
    time = `00:00`;

    scoreElement.innerText = score;
    timeElement.innerText = time;
    highScoreElement.innerText = highScore;

    modal.style.display = "none";
    direction = 'down';
    snake = [ {x: 1, y: 3} ];
    do {
            food = {
                x: Math.floor(Math.random() * rows),
                y: Math.floor(Math.random() * cols)
            };
    } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
    blocks[` ${food.x},${food.y} `].classList.add("food");

    clearInterval(intervalId);
    clearInterval(timeIntervalId);

    intervalId = setInterval(render, 300);
    timeIntervalId = setInterval(updateTime, 1000);
}

window.addEventListener("keydown", (event) => {
    if (event.key == "ArrowUp" && direction !== "down") {
        direction = "up";
    } else if (event.key == "ArrowDown" && direction !== "up") {
        direction = "down";
    } else if (event.key == "ArrowLeft" && direction !== "right") {
        direction = "left";
    } else if (event.key == "ArrowRight" && direction !== "left") {
        direction = "right";
    }
})

// --- Mobile support ---

// Shared handler used by both the on-screen D-pad and swipe gestures,
// mirroring the same "no reversing into yourself" rule as the keyboard handler.
function setDirection(newDirection) {
    if (newDirection === "up" && direction !== "down") {
        direction = "up";
    } else if (newDirection === "down" && direction !== "up") {
        direction = "down";
    } else if (newDirection === "left" && direction !== "right") {
        direction = "left";
    } else if (newDirection === "right" && direction !== "left") {
        direction = "right";
    }
}

// On-screen D-pad buttons (shown on touch devices / small screens via CSS)
document.querySelectorAll(".touch-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        setDirection(btn.dataset.dir);
    });
    // touchstart fires faster than click and avoids the ~300ms tap delay
    btn.addEventListener("touchstart", (event) => {
        event.preventDefault();
        setDirection(btn.dataset.dir);
    }, { passive: false });
});

// Swipe gestures directly on the game board
let touchStartX = 0;
let touchStartY = 0;
const swipeThreshold = 20; // minimum px movement to register as a swipe

board.addEventListener("touchstart", (event) => {
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
}, { passive: true });

board.addEventListener("touchmove", (event) => {
    // Stop the page from scrolling while swiping to steer the snake
    event.preventDefault();
}, { passive: false });

board.addEventListener("touchend", (event) => {
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;

    if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < swipeThreshold) {
        return; // too small to count as a swipe
    }

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        setDirection(deltaX > 0 ? "right" : "left");
    } else {
        setDirection(deltaY > 0 ? "down" : "up");
    }
});