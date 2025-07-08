document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const keyboardContainer = document.getElementById('keyboard-container');
    const messageContainer = document.getElementById('message-container');
    
    const WORD_LENGTH = 5;
    const MAX_TRIES = 6;
    let currentGuess = [];
    let currentRow = 0;
    let targetWord = '';

    const keys = [
        'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P',
        'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L',
        'ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'
    ];

    async function fetchWord() {
        try {
            const response = await fetch('https://random-word-api.herokuapp.com/word?length=5');
            const data = await response.json();
            targetWord = data[0].toUpperCase();
            console.log(`Target word: ${targetWord}`); // For debugging
        } catch (error) {
            console.error('Error fetching word:', error);
            messageContainer.textContent = 'Failed to load word. Please refresh.';
        }
    }

    function createBoard() {
        for (let i = 0; i < MAX_TRIES * WORD_LENGTH; i++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            tile.id = `tile-${Math.floor(i / WORD_LENGTH)}-${i % WORD_LENGTH}`;
            gameBoard.appendChild(tile);
        }
    }

    function createKeyboard() {
        const keyRows = [keys.slice(0, 10), keys.slice(10, 19), keys.slice(19)];
        keyRows.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.classList.add('keyboard-row');
            row.forEach(key => {
                const keyButton = document.createElement('button');
                keyButton.textContent = key;
                keyButton.classList.add('key');
                keyButton.setAttribute('data-key', key);
                keyButton.addEventListener('click', () => handleKeyPress(key));
                rowDiv.appendChild(keyButton);
            });
            keyboardContainer.appendChild(rowDiv);
        });
    }

    function handleKeyPress(key) {
        if (key === 'BACKSPACE') {
            if (currentGuess.length > 0) {
                currentGuess.pop();
            }
        } else if (key === 'ENTER') {
            if (currentGuess.length === WORD_LENGTH) {
                submitGuess();
            }
        } else if (currentGuess.length < WORD_LENGTH && /^[A-Z]$/.test(key)) {
            currentGuess.push(key);
        }
        updateBoard();
    }

    function updateBoard() {
        for (let i = 0; i < WORD_LENGTH; i++) {
            const tile = document.getElementById(`tile-${currentRow}-${i}`);
            tile.textContent = currentGuess[i] || '';
        }
    }

    function submitGuess() {
        const guess = currentGuess.join('');
        const guessArray = guess.split('');
        const targetArray = targetWord.split('');

        guessArray.forEach((letter, index) => {
            const tile = document.getElementById(`tile-${currentRow}-${index}`);
            const keyButton = document.querySelector(`[data-key="${letter}"]`);
            
            if (letter === targetArray[index]) {
                tile.classList.add('correct');
                keyButton.classList.add('correct');
            } else if (targetArray.includes(letter)) {
                tile.classList.add('present');
                keyButton.classList.add('present');
            } else {
                tile.classList.add('absent');
                keyButton.classList.add('absent');
            }
        });

        if (guess === targetWord) {
            messageContainer.textContent = 'Congratulations! You guessed it!';
            document.removeEventListener('keydown', handleKeyDown);
            return;
        }

        currentRow++;
        currentGuess = [];

        if (currentRow === MAX_TRIES) {
            messageContainer.textContent = `Game Over! The word was ${targetWord}`;
            document.removeEventListener('keydown', handleKeyDown);
        }
    }

    function handleKeyDown(event) {
        const key = event.key.toUpperCase();
        if (keys.includes(key)) {
            handleKeyPress(key);
        }
    }

    async function init() {
        await fetchWord();
        createBoard();
        createKeyboard();
        document.addEventListener('keydown', handleKeyDown);
    }

    init();
});