const board = document.querySelector(".board");
const startButton = document.querySelector(".btn-start");
const modal = document.querySelector(".modal");
const startGameModal = document.querySelector(".start-game");
const gameOverModal = document.querySelector(".game-over");
const restartButton = document.querySelector(".btn-restart");

const upBtn = document.querySelector("#up-btn");
const downBtn = document.querySelector("#down-btn");
const leftBtn = document.querySelector("#left-btn");
const rightBtn = document.querySelector("#right-btn");

const highScoreElement = document.querySelector("#high-score");
const scoreElement = document.querySelector("#score");
const timeElement = document.querySelector("#time");

const blockHeight = 50;
const blockWidth = 50;

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

    if(event.key === "ArrowUp"){
        changeDirection("up");
    }
    else if(event.key === "ArrowDown"){
        changeDirection("down");
    }
    else if(event.key === "ArrowLeft"){
        changeDirection("left");
    }
    else if(event.key === "ArrowRight"){
        changeDirection("right");
    }
});

function changeDirection(newDirection){

    if(newDirection === "up" && direction !== "down"){
        direction = "up";
    }

    else if(newDirection === "down" && direction !== "up"){
        direction = "down";
    }

    else if(newDirection === "left" && direction !== "right"){
        direction = "left";
    }

    else if(newDirection === "right" && direction !== "left"){
        direction = "right";
    }
}

upBtn.addEventListener("click", () => changeDirection("up"));

downBtn.addEventListener("click", () => changeDirection("down"));

leftBtn.addEventListener("click", () => changeDirection("left"));

rightBtn.addEventListener("click", () => changeDirection("right"));