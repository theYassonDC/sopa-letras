import {words } from "./words.js";
// Variables globales
let currentUser = '';
let selectedLetters = [];
let foundWords = [];
let wordSearchMatrix = [];
let wordPositions = [];
let foundLetters = new Set();
let time = 0;
let foundWordAv = false;
let intervalTime;
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
const timeVisual = document.getElementById("time");
const finalTimeVisual = document.getElementById("final-time");

// Event Listeners
startBtn.addEventListener('click', startGame);
hintBtn.addEventListener('click', showHint);
restartBtn.addEventListener('click', restartGame);

// Temporizador 
function convertirSegundos(segundos) {
    // Validar que sea un número positivo
    if (isNaN(segundos) || segundos < 0) {
        return "Por favor, ingresa un número válido de segundos";
    }

    // Calcular horas, minutos y segundos
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segundosRestantes = segundos % 60;

    // Formatear el resultado
    const partes = [];
    
    if (horas > 0) {
        partes.push(`${horas} hora${horas > 1 ? 's' : ''}`);
    }
    
    if (minutos > 0) {
        partes.push(`${minutos} minuto${minutos > 1 ? 's' : ''}`);
    }
    
    if (segundosRestantes > 0) {
        partes.push(`${segundosRestantes} segundo${segundosRestantes > 1 ? 's' : ''}`);
    }

    // Devolver el resultado formateado
    return partes.length > 0 ? partes.join(', ') : '0 segundos';
}

// Inicializar la sopa de letras
function initializeWordSearch() {
    // Crear matriz vacía de 16x16 para más espacio
    wordSearchMatrix = Array(16).fill().map(() => Array(16).fill(''));
    wordPositions = [];
    foundLetters.clear();
    foundWords = [];
    selectedLetters = [];
    time = 0;
    
    // Colocar palabras en la matriz
    words.forEach(word => {
        placeWord(word.word);
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
    
    while (!placed && attempts < 200) {
        attempts++;
        
        // Elegir dirección aleatoria
        const direction = directions[Math.floor(Math.random() * directions.length)];
        
        // Elegir posición inicial aleatoria
        let startX = Math.floor(Math.random() * 16);
        let startY = Math.floor(Math.random() * 16);
        
        // Verificar si la palabra cabe en esa dirección
        const endX = startX + direction.x * (word.length - 1);
        const endY = startY + direction.y * (word.length - 1);
        
        if (endX < 0 || endX >= 16 || endY < 0 || endY >= 16) {
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
            positions.push({ x, y, letter: word[i] });
        }
        
        wordPositions.push({
            word: word,
            positions: positions,
            direction: direction
        });
        
        placed = true;
    }
    
    if (!placed) {
        console.warn(`No se pudo colocar la palabra: ${word}`);
    }
}

// Rellenar espacios vacíos con letras aleatorias
function fillEmptySpaces() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
            if (wordSearchMatrix[y][x] === '') {
                wordSearchMatrix[y][x] = letters[Math.floor(Math.random() * letters.length)];
            }
        }
    }
}

// Renderizar la sopa de letras en el DOM
function renderWordSearch() {
    wordSearch.innerHTML = '';
    wordSearch.style.gridTemplateColumns = 'repeat(16, 1fr)';
    
    for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
            const letter = document.createElement('div');
            letter.className = 'letter';
            letter.textContent = wordSearchMatrix[y][x];
            letter.dataset.x = x;
            letter.dataset.y = y;
            
            // Marcar como encontrada si ya pertenece a una palabra encontrada
            const key = `${x},${y}`;
            if (foundLetters.has(key)) {
                letter.classList.add('found');
            }
            
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
        wordItem.textContent = word.word;
        wordItem.id = `word-${word.word}`;
        if (foundWords.includes(word.word)) {
            wordItem.classList.add('word-found');
        }
        
        wordList.appendChild(wordItem);
    });
}

// Seleccionar una letra
function selectLetter(x, y) {
    const letterElement = document.querySelector(`.letter[data-x="${x}"][data-y="${y}"]`);
    
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
    
    // Convertir las letras seleccionadas a un string
    const selectedWord = selectedLetters.map(letter => letter.letter).join('');
    
    // Verificar si coincide con alguna palabra de la lista (en cualquier dirección)
    let matchedWord = null;
    
    // Verificar la palabra en la dirección seleccionada
    matchedWord = words.find(word => 
        word.word === selectedWord || 
        word.word === selectedWord.split('').reverse().join('')
    );
    console.log(matchedWord)
    // Si no coincide directamente, verificar si las letras seleccionadas forman una palabra en la matriz
    if (!matchedWord) {
        matchedWord = findWordInMatrix(selectedLetters);
    }
    
    if (matchedWord && !foundWords.includes(matchedWord.word)) {
        // Marcar la palabra como encontrada
        foundWords.push(matchedWord.word);
        
        // Encontrar las posiciones reales de la palabra en la matriz
        const wordData = wordPositions.find(wp => wp.word === matchedWord.word);
        if (wordData) {
            // Marcar las letras como encontradas permanentemente
            wordData.positions.forEach(pos => {
                const key = `${pos.x},${pos.y}`;
                foundLetters.add(key);
                
                const letterElement = document.querySelector(`.letter[data-x="${pos.x}"][data-y="${pos.y}"]`);
                if (letterElement) {
                    letterElement.classList.add('found');
                    foundWordAv = true
                    setTimeout(() => foundWordAv = false, 1000)
                    letterElement.classList.remove('selected');
                }
            });
            if (foundWordAv) {
                alert(`Encontraste la palabra: ${matchedWord.word} de ${matchedWord.student}`)
            }
        }

        
        // Actualizar la lista de palabras
        renderWordList();
        
        // Limpiar la selección
        clearSelection();
        
        // Verificar si se completó el juego
        if (foundWords.length === words.length) {
            setTimeout(showCongratulations, 500);
        }
    } else if (selectedLetters.length > 15) {
        // Si la selección es demasiado larga y no forma una palabra, limpiar
        clearSelection();
    }
}

// Nueva función para encontrar palabras en la matriz basándose en las letras seleccionadas
function findWordInMatrix(selectedLetters) {
    // Ordenar las letras por posición para determinar la dirección
    const sortedByX = [...selectedLetters].sort((a, b) => a.x - b.x);
    const sortedByY = [...selectedLetters].sort((a, b) => a.y - b.y);
    
    // Verificar si forman una línea recta
    const isHorizontal = sortedByY.every((letter, i, arr) => 
        i === 0 || letter.y === arr[i-1].y);
    const isVertical = sortedByX.every((letter, i, arr) => 
        i === 0 || letter.x === arr[i-1].x);
    const isDiagonal = sortedByX.every((letter, i, arr) => 
        i === 0 || (letter.x - arr[i-1].x === letter.y - arr[i-1].y));
    const isDiagonalInverse = sortedByX.every((letter, i, arr) => 
        i === 0 || (letter.x - arr[i-1].x === -(letter.y - arr[i-1].y)));
    
    // Si no forman una línea recta, no es una selección válida
    if (!isHorizontal && !isVertical && !isDiagonal && !isDiagonalInverse) {
        return null;
    }
    
    // Obtener la palabra de la matriz según las posiciones seleccionadas
    let wordFromMatrix = '';
    const positions = selectedLetters.map(letter => ({x: letter.x, y: letter.y}));
    
    // Ordenar las posiciones según la dirección
    if (isHorizontal) {
        positions.sort((a, b) => a.x - b.x);
    } else if (isVertical) {
        positions.sort((a, b) => a.y - b.y);
    } else if (isDiagonal) {
        positions.sort((a, b) => a.x - b.x);
    } else if (isDiagonalInverse) {
        positions.sort((a, b) => a.x - b.x);
    }
    
    // Construir la palabra desde la matriz
    positions.forEach(pos => {
        wordFromMatrix += wordSearchMatrix[pos.y][pos.x];
    });
    
    // Verificar si esta palabra existe en nuestra lista
    const matchedWord = words.find(word => 
        word.word === wordFromMatrix || 
        word.word === wordFromMatrix.split('').reverse().join('')
    );
    
    return matchedWord;
}

// Limpiar la selección actual
function clearSelection() {
    selectedLetters.forEach(letter => {
        const letterElement = document.querySelector(`.letter[data-x="${letter.x}"][data-y="${letter.y}"]`);
        if (letterElement && !letterElement.classList.contains('found')) {
            letterElement.classList.remove('selected');
        }
    });
    
    selectedLetters = [];
}

// Mostrar una pista
function showHint() {
    if (foundWords.length >= words.length) return;
    
    // Encontrar una palabra no encontrada
    const remainingWords = words.filter(word => !foundWords.includes(word.word));
    if (remainingWords.length === 0) return;
    
    const hintWord = remainingWords[Math.floor(Math.random() * remainingWords.length)];
    // Resaltar la palabra en la lista
    const wordElement = document.getElementById(`word-${hintWord.word}`);
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
    clearInterval(intervalTime)
    intervalTime = null
    finalTimeVisual.textContent = convertirSegundos(time)
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
    if (!intervalTime) {
        intervalTime = setInterval(() => {
            time += 1;
            timeVisual.innerText = convertirSegundos(time);
        }, 1000)
    }
}

// Reiniciar el juego
function restartGame() {
    foundWords = [];
    selectedLetters = [];
    foundLetters.clear();
    
    congratulationsSection.classList.add('hidden');
    userSection.classList.remove('hidden');
    
    usernameInput.value = '';
}