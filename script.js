// --- VARIABLES ---
const cells = document.querySelectorAll('.cell');
const statusText = document.querySelector('#status');
const restartBtn = document.querySelector('#restartBtn');
const aiToggle = document.querySelector('#aiToggle');
const modeLabel = document.querySelector('#modeLabel');
const winningLine = document.querySelector('#winningLine');
const winModal = document.querySelector('#winModal');
const winnerText = document.querySelector('#winnerText');
const newGameBtn = document.querySelector('#newGameBtn');

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let isGameActive = true;
let isAiMode = false;

// Winning combinations
const winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// --- INITIALIZATION ---
initializeGame();

function initializeGame() {
    cells.forEach(cell => cell.addEventListener("click", handleCellClick));
    restartBtn.addEventListener("click", restartGame);
    newGameBtn.addEventListener("click", restartGame);
    
    aiToggle.addEventListener("change", () => {
        isAiMode = aiToggle.checked;
        modeLabel.textContent = isAiMode ? "Vs AI" : "2 Player";
        restartGame();
    });
}

function handleCellClick() {
    const cellIndex = this.getAttribute("data-index");

    // Ignore if cell filled or game over
    if (board[cellIndex] !== "" || !isGameActive) return;

    updateCell(this, cellIndex);
    checkWinner();
}

function updateCell(cell, index) {
    board[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase()); // Adds .x or .o class
}

function changePlayer() {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusText.textContent = isAiMode && currentPlayer === "O" ? "AI Thinking..." : `Player ${currentPlayer}'s Turn`;

    // Trigger AI if it's AI mode and O's turn
    if (isAiMode && currentPlayer === "O" && isGameActive) {
        setTimeout(makeAiMove, 600); // 600ms delay to feel natural
    }
}

function checkWinner() {
    let roundWon = false;
    let winPattern = [];

    for (let i = 0; i < winConditions.length; i++) {
        const [a, b, c] = winConditions[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            roundWon = true;
            winPattern = winConditions[i];
            break;
        }
    }

    if (roundWon) {
        statusText.textContent = `Player ${currentPlayer} Wins!`;
        drawWinningLine(winPattern);
        startConfetti();
        setTimeout(() => showModal(`${currentPlayer} Wins!`), 1500);
        isGameActive = false;
    } else if (!board.includes("")) {
        statusText.textContent = "Draw!";
        setTimeout(() => showModal("It's a Draw!"), 500);
        isGameActive = false;
    } else {
        changePlayer();
    }
}

// --- SMART AI LOGIC (Minimax-Lite) ---
function makeAiMove() {
    if (!isGameActive) return;

    let moveIndex;

    // 1. Try to Win
    moveIndex = findBestMove("O");
    
    // 2. If can't win, Block Player X
    if (moveIndex === -1) moveIndex = findBestMove("X");
    
    // 3. If no critical moves, pick Random
    if (moveIndex === -1) {
        let available = board.map((val, idx) => val === "" ? idx : null).filter(val => val !== null);
        moveIndex = available[Math.floor(Math.random() * available.length)];
    }

    const cell = document.querySelector(`.cell[data-index='${moveIndex}']`);
    updateCell(cell, moveIndex);
    checkWinner();
}

// Helper to find winning/blocking move
function findBestMove(player) {
    for (let condition of winConditions) {
        const [a, b, c] = condition;
        const vals = [board[a], board[b], board[c]];
        
        // Check if 2 cells are 'player' and 1 is empty
        if (vals.filter(v => v === player).length === 2 && vals.includes("")) {
            // Return the index of the empty cell
            if (board[a] === "") return a;
            if (board[b] === "") return b;
            if (board[c] === "") return c;
        }
    }
    return -1;
}

// --- VISUALS ---

function drawWinningLine(pattern) {
    const cellA = document.querySelector(`.cell[data-index='${pattern[0]}']`);
    const cellC = document.querySelector(`.cell[data-index='${pattern[2]}']`);

    const rectA = cellA.getBoundingClientRect();
    const rectC = cellC.getBoundingClientRect();
    const boardRect = document.querySelector('.board').getBoundingClientRect();

    // Calculate center points relative to board
    const x1 = rectA.left + rectA.width / 2 - boardRect.left;
    const y1 = rectA.top + rectA.height / 2 - boardRect.top;
    const x2 = rectC.left + rectC.width / 2 - boardRect.left;
    const y2 = rectC.top + rectC.height / 2 - boardRect.top;

    // Calculate length and angle
    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

    winningLine.style.width = `${length}px`;
    winningLine.style.transform = `rotate(${angle}deg)`;
    winningLine.style.top = `${y1}px`;
    winningLine.style.left = `${x1}px`;
    winningLine.style.display = 'block';
}

function showModal(msg) {
    winnerText.textContent = msg;
    winModal.classList.add('active');
}

function restartGame() {
    board.fill("");
    currentPlayer = "X";
    isGameActive = true;
    statusText.textContent = "Player X's Turn";
    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove('x', 'o');
    });
    winningLine.style.display = 'none';
    winModal.classList.remove('active');
    stopConfetti();
}

// --- CONFETTI ENGINE (Simplified) ---
let confettiInterval;
function startConfetti() {
    const canvas = document.getElementById('confetti');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#00fff2', '#ff004c', '#7000ff', '#ffffff'];

    for (let i = 0; i < 150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 8 + 2,
            speed: Math.random() * 5 + 2,
            angle: Math.random() * 360
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            p.y += p.speed;
            if (p.y > canvas.height) p.y = -10;
        });
    }
    
    confettiInterval = setInterval(draw, 20);
}

function stopConfetti() {
    clearInterval(confettiInterval);
    const canvas = document.getElementById('confetti');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
