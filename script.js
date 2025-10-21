// Variables globales
let currentUser = '';
let selectedLetters = [];
let foundWords = [];
let wordSearchMatrix = [];
let wordPositions = [];

// Lista de palabras a buscar
const words = [
    'PERSEVERANCIA', 'ATARAXIA', 'PINKY', 'AMBICION', 
    'RESILIENCIA', 'AMOR', 'FUTBOL', 'POSITIVO', 
    'CRISTIAN', 'JAZHIEL', 'EQUILIBRIO', 'ALEGRIA', 
    'PACIENCIA', 'TOLERANCIA', 'CARACTER', 'CRITERIO'
];

// Elementos del DOM
const userSection = document.getElementById('user-section');
const gameSection = document.getElementById('game-section');
const congratulationsSection = document.getElementById('congratulations');
const usernameInput = document.getElementById('username');
const startBtn = document.getElementById('start-btn');
const userDisplay = document.getElementById('user-display');
const winnerName = document.getElementById('winner-name');
const wordList = document.getElementById('word-list');
const wordSearch = document.getElementById('word-search');
const hintBtn = document.getElementById('hint-btn');
const restartBtn = document.getElementById('restart-btn');

// Event Listeners
startBtn.addEventListener('click', startGame);
hintBtn.addEventListener('click', showHint);
restartBtn.addEventListener('click', restartGame);

// Inicializar la sopa de letras
function initializeWordSearch() {
    // Crear matriz vacía de 15x15
    wordSearchMatrix = Array(15).fill().map(() => Array(15).fill(''));
    wordPositions = [];
    
    // Colocar palabras en la matriz
    words.forEach(word => {
        placeWord(word);
    });
    
    // Rellenar espacios vacíos con letras aleatorias
    fillEmptySpaces();
    
    // Renderizar la sopa de letras
    renderWordSearch();
    
    // Renderizar la lista de palabras
    renderWordList();
}

// Colocar una palabra en la matriz
function placeWord(word) {
    const directions = [
        { x: 1, y: 0 },   // Horizontal derecha
        { x: 0, y: 1 },   // Vertical abajo
        { x: 1, y: 1 },   // Diagonal abajo-derecha
        { x: 1, y: -1 },  // Diagonal arriba-derecha
        { x: -1, y: 0 },  // Horizontal izquierda
        { x: 0, y: -1 },  // Vertical arriba
        { x: -1, y: -1 }, // Diagonal arriba-izquierda
        { x: -1, y: 1 }   // Diagonal abajo-izquierda
    ];
    
    let placed = false;
    let attempts = 0;
    
    while (!placed && attempts < 100) {
        attempts++;
        
        // Elegir dirección aleatoria
        const direction = directions[Math.floor(Math.random() * directions.length)];
        
        // Elegir posición inicial aleatoria
        let startX = Math.floor(Math.random() * 15);
        let startY = Math.floor(Math.random() * 15);
        
        // Verificar si la palabra cabe en esa dirección
        const endX = startX + direction.x * (word.length - 1);
        const endY = startY + direction.y * (word.length - 1);
        
        if (endX < 0 || endX >= 15 || endY < 0 || endY >= 15) {
            continue;
        }
        
        // Verificar que no haya conflictos con otras palabras
        let conflict = false;
        for (let i = 0; i < word.length; i++) {
            const x = startX + i * direction.x;
            const y = startY + i * direction.y;
            
            if (wordSearchMatrix[y][x] !== '' && wordSearchMatrix[y][x] !== word[i]) {
                conflict = true;
                break;
            }
        }
        
        if (conflict) continue;
        
        // Colocar la palabra
        const positions = [];
        for (let i = 0; i < word.length; i++) {
            const x = startX + i * direction.x;
            const y = startY + i * direction.y;
            
            wordSearchMatrix[y][x] = word[i];
            positions.push({ x, y });
        }
        
        wordPositions.push({
            word: word,
            positions: positions
        });
        
        placed = true;
    }
}

// Rellenar espacios vacíos con letras aleatorias
function fillEmptySpaces() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    for (let y = 0; y < 15; y++) {
        for (let x = 0; x < 15; x++) {
            if (wordSearchMatrix[y][x] === '') {
                wordSearchMatrix[y][x] = letters[Math.floor(Math.random() * letters.length)];
            }
        }
    }
}

// Renderizar la sopa de letras en el DOM
function renderWordSearch() {
    wordSearch.innerHTML = '';
    
    for (let y = 0; y < 15; y++) {
        for (let x = 0; x < 15; x++) {
            const letter = document.createElement('div');
            letter.className = 'letter';
            letter.textContent = wordSearchMatrix[y][x];
            letter.dataset.x = x;
            letter.dataset.y = y;
            
            letter.addEventListener('click', () => selectLetter(x, y));
            
            wordSearch.appendChild(letter);
        }
    }
}

// Renderizar la lista de palabras
function renderWordList() {
    wordList.innerHTML = '';
    
    words.forEach(word => {
        const wordItem = document.createElement('div');
        wordItem.className = 'word-item';
        wordItem.textContent = word;
        wordItem.id = `word-${word}`;
        
        if (foundWords.includes(word)) {
            wordItem.classList.add('word-found');
        }
        
        wordList.appendChild(wordItem);
    });
}

// Seleccionar una letra
function selectLetter(x, y) {
    const letterElement = document.querySelector(`.letter[data-x="${x}"][data-y="${y}"]`);
    
    // Si la letra ya está encontrada, no hacer nada
    if (letterElement.classList.contains('found')) return;
    
    // Si la letra ya está seleccionada, quitarla de la selección
    if (letterElement.classList.contains('selected')) {
        letterElement.classList.remove('selected');
        selectedLetters = selectedLetters.filter(pos => !(pos.x === x && pos.y === y));
        return;
    }
    
    // Agregar la letra a la selección
    letterElement.classList.add('selected');
    selectedLetters.push({ x, y, letter: wordSearchMatrix[y][x] });
    
    // Verificar si se formó una palabra
    checkWord();
}

// Verificar si la selección forma una palabra
function checkWord() {
    if (selectedLetters.length < 3) return;
    
    // Obtener la palabra formada por las letras seleccionadas
    const selectedWord = selectedLetters.map(letter => letter.letter).join('');
    
    // Verificar si coincide con alguna palabra de la lista
    const matchedWord = words.find(word => 
        word === selectedWord || 
        word === selectedWord.split('').reverse().join('')
    );
    
    if (matchedWord && !foundWords.includes(matchedWord)) {
        // Marcar la palabra como encontrada
        foundWords.push(matchedWord);
        
        // Marcar las letras como encontradas
        selectedLetters.forEach(letter => {
            const letterElement = document.querySelector(`.letter[data-x="${letter.x}"][data-y="${letter.y}"]`);
            letterElement.classList.remove('selected');
            letterElement.classList.add('found');
        });
        
        // Actualizar la lista de palabras
        renderWordList();
        
        // Limpiar la selección
        selectedLetters = [];
        
        // Verificar si se completó el juego
        if (foundWords.length === words.length) {
            showCongratulations();
        }
    } else if (selectedLetters.length > 10) {
        // Si la selección es demasiado larga y no forma una palabra, limpiar
        clearSelection();
    }
}

// Limpiar la selección actual
function clearSelection() {
    selectedLetters.forEach(letter => {
        const letterElement = document.querySelector(`.letter[data-x="${letter.x}"][data-y="${letter.y}"]`);
        letterElement.classList.remove('selected');
    });
    
    selectedLetters = [];
}

// Mostrar una pista
function showHint() {
    if (foundWords.length >= words.length) return;
    
    // Encontrar una palabra no encontrada
    const remainingWords = words.filter(word => !foundWords.includes(word));
    if (remainingWords.length === 0) return;
    
    const hintWord = remainingWords[Math.floor(Math.random() * remainingWords.length)];
    
    // Resaltar la palabra en la lista
    const wordElement = document.getElementById(`word-${hintWord}`);
    wordElement.style.backgroundColor = '#f39c12';
    wordElement.style.color = 'white';
    
    setTimeout(() => {
        if (!wordElement.classList.contains('word-found')) {
            wordElement.style.backgroundColor = '';
            wordElement.style.color = '';
        }
    }, 2000);
}

// Mostrar pantalla de felicitaciones
function showCongratulations() {
    gameSection.classList.add('hidden');
    congratulationsSection.classList.remove('hidden');
    winnerName.textContent = currentUser;
}

// Iniciar el juego
function startGame() {
    const username = usernameInput.value.trim();
    
    if (username === '') {
        alert('Por favor, ingresa tu nombre de usuario');
        return;
    }
    
    currentUser = username;
    userDisplay.textContent = currentUser;
    
    userSection.classList.add('hidden');
    gameSection.classList.remove('hidden');
    
    initializeWordSearch();
}

// Reiniciar el juego
function restartGame() {
    foundWords = [];
    selectedLetters = [];
    
    congratulationsSection.classList.add('hidden');
    userSection.classList.remove('hidden');
    
    usernameInput.value = '';
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    // No es necesario hacer nada adicional al cargar
});