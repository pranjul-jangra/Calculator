// DOM elements
const display = document.getElementById('display');
const secondaryDisplay = document.getElementById('secondaryDisplay');
const popup = document.getElementById('popup');
const historyContainer = document.getElementById('historyContainer');
const memoryIndicator = document.getElementById('memoryIndicator');

// State variables
let memory = 0;
let history = [];
let isDarkTheme = false;

// Display functions
function assignToDisplay(primary, secondary) {
    display.textContent = primary;
    secondaryDisplay.textContent = secondary;
}

function insertToDisplay(primary, secondary) {
    display.textContent += primary;
    secondaryDisplay.textContent += secondary;
}

// Clear functions
function clearAll() {
    assignToDisplay('Let\'s Calculate!', '');
}

function clearOne() {
    if (
        display.textContent === 'Let\'s Calculate!' ||
        display.textContent === '0' ||
        display.textContent.length === 1 ||
        display.textContent === 'NaN'
    ) {
        clearAll();
        return;
    }
    assignToDisplay(display.textContent.slice(0, -1), secondaryDisplay.textContent.slice(0, -1));
}

// Number input
function insertNumber(num) {
    if (
        display.textContent === 'Let\'s Calculate!' ||
        display.textContent === '0' ||
        display.textContent === '' ||
        display.textContent === 'NaN'
    ) {
        assignToDisplay(num, num);
        return;
    }

    if (display.textContent.at(-1) === ')') {
        insertToDisplay(`*${num}`, `*${num}`);
        return;
    }

    insertToDisplay(num, num);
}

// Decimal point
function insertDecimal() {
    const lastDotIndex = display.textContent.lastIndexOf('.');
    const lastOperatorIndex = display.textContent.search(/[+\-*/%](?!.*[+\-*/%])/);

    if (lastDotIndex > lastOperatorIndex) {
        showPopup('Invalid insertion');
        return;
    }

    if (
        display.textContent === 'Let\'s Calculate!' ||
        display.textContent === '' ||
        display.textContent === 'NaN'
    ) {
        assignToDisplay('0.', '0.');
        return;
    }

    if (display.textContent.at(-1) === ')') {
        insertToDisplay('*0.', '*0.');
        return;
    }

    if (/\d/.test(display.textContent.at(-1))) {
        insertToDisplay('.', '.');
    } else {
        insertToDisplay('0.', '0.');
    }
}

// Operator input
function insertOperator(op) {
    // Convert display symbols to actual operators
    const actualOp = op === '×' ? '*' : op === '÷' ? '/' : op;

    if (
        display.textContent === 'Let\'s Calculate!' ||
        display.textContent === '' ||
        display.textContent === 'NaN'
    ) {
        if (/[+*/%]/.test(actualOp)) {
            showPopup(`Can't insert ${op} at the beginning`);
            return;
        } else {
            assignToDisplay('-', '-');
            return;
        }
    }

    if (display.textContent === '-') {
        if (/[+*/%]/.test(actualOp)) {
            showPopup(`Can't change '-' to '${op}' at the beginning`);
            return;
        }
    }

    if (display.textContent.at(-1) === '(') {
        if (/[+*/%]/.test(actualOp)) {
            showPopup(`Can't insert ${op} immediately after '('`);
            return;
        } else {
            insertToDisplay('-', '-');
            return;
        }
    }

    if (display.textContent.at(-2) === '(' && display.textContent.at(-1) === '-') {
        if (/[+*/%]/.test(actualOp)) {
            showPopup(`Can't change '-' to '${op}'`);
            return;
        }
    }

    if (display.textContent.at(-1) === '.') {
        insertToDisplay(`0${actualOp}`, `0${actualOp}`);
        return;
    }

    if (/[+\-*/%]/.test(display.textContent.at(-1))) {
        assignToDisplay(display.textContent.slice(0, -1) + actualOp, secondaryDisplay.textContent.slice(0, -1) + actualOp);
        return;
    }

    insertToDisplay(actualOp, actualOp);
}

// Bracket input
function insertBracket(bracket) {
    if (bracket === '(') {
        if (
            display.textContent === 'Let\'s Calculate!' ||
            display.textContent === '0' ||
            display.textContent === 'NaN'
        ) {
            assignToDisplay('(', '(');
            return;
        }

        if (display.textContent.at(-1) === '.') {
            insertToDisplay('0*(', '0*(');
            return;
        }

        if (/\d/.test(display.textContent.at(-1))) {
            insertToDisplay('*(', '*(');
            return;
        }

        if (display.textContent.at(-1) === ')') {
            insertToDisplay('*(', '*(');
            return;
        }

        insertToDisplay('(', '(');
    } else {
        let openBraces = 0, closeBraces = 0;
        for (let char of display.textContent) {
            if (char === '(') openBraces++;
            if (char === ')') closeBraces++;
        }

        if (closeBraces >= openBraces) {
            showPopup('Unmatched closing braces');
            return;
        }

        if (display.textContent.at(-1) === '(') {
            showPopup("Can't insert empty braces");
            return;
        }

        if (/[+\-*/%]/.test(display.textContent.at(-1))) {
            showPopup('Invalid insertion before closing brace');
            return;
        }

        if (display.textContent.at(-1) === '.') {
            insertToDisplay('0)', '0)');
            return;
        }

        insertToDisplay(')', ')');
    }
}

// Function input
function insertFunction(func) {
    const functionMap = {
        '√(': 'Math.sqrt(',
        '∛(': 'Math.cbrt(',
        'sin(': 'Math.sin(',
        'cos(': 'Math.cos(',
        'tan(': 'Math.tan(',
        'log(': 'Math.log10(',
        'ln(': 'Math.log('
    };

    const jsFunc = functionMap[func] || func;

    if (
        display.textContent === 'Let\'s Calculate!' ||
        display.textContent === '0' ||
        display.textContent === 'NaN'
    ) {
        assignToDisplay(func, jsFunc);
        return;
    }

    if (display.textContent.at(-1) === '.') {
        insertToDisplay(`0*${func}`, `0*${jsFunc}`);
        return;
    }

    if (/\d/.test(display.textContent.at(-1))) {
        insertToDisplay(`*${func}`, `*${jsFunc}`);
        return;
    }

    insertToDisplay(func, jsFunc);
}

// Power function
function insertPower() {
    if (
        display.textContent === 'Let\'s Calculate!' ||
        display.textContent === '' ||
        display.textContent === 'NaN'
    ) {
        showPopup('Need a base number first');
        return;
    }

    if (/[+\-*/%]/.test(display.textContent.at(-1))) {
        showPopup('Invalid position for power');
        return;
    }

    insertToDisplay('^', '**');
}

// Constants
function insertConstant(constant) {
    const constantMap = {
        'π': Math.PI,
        'e': Math.E
    };

    const value = constantMap[constant];

    if (
        display.textContent === 'Let\'s Calculate!' ||
        display.textContent === '0' ||
        display.textContent === 'NaN'
    ) {
        assignToDisplay(constant, value);
        return;
    }

    if (/\d/.test(display.textContent.at(-1)) || display.textContent.at(-1) === ')') {
        insertToDisplay(`*${constant}`, `*${value}`);
        return;
    }

    insertToDisplay(constant, value);
}

// Computation
function compute() {
    if (
        /[+\-*/%]/.test(display.textContent.at(-1)) ||
        display.textContent.at(-1) === '('
    ) {
        showPopup('Incomplete expression');
        return;
    }

    if (
        display.textContent === 'Let\'s Calculate!' ||
        display.textContent === 'NaN'
    ) {
        showPopup('Provide a valid expression');
        clearAll();
        return;
    }

    try {
        const expression = secondaryDisplay.textContent;
        const result = eval(expression);

        if (result === Infinity) {
            showPopup('Invalid format: Division by zero');
            assignToDisplay('Let\'s Calculate!', '');
            return;
        } else if (isNaN(result)) {
            showPopup("NaN: Expression can't be computed");
            assignToDisplay('Let\'s Calculate!', '');
            return;
        }

        // Add to history
        addToHistory(display.textContent, result);

        // Format result
        const formattedResult = formatResult(result);
        assignToDisplay(formattedResult, formattedResult);
    } catch (error) {
        showPopup('Invalid expression');
    }
}

// Format result
function formatResult(result) {
    if (Number.isInteger(result)) {
        return result.toString();
    } else {
        return parseFloat(result.toFixed(10)).toString();
    }
}

// Memory functions
function memoryStore() {
    if (display.textContent === 'Let\'s Calculate!' || display.textContent === 'NaN') {
        showPopup('No value to store');
        return;
    }

    const value = parseFloat(display.textContent);
    if (!isNaN(value)) {
        memory = value;
        memoryIndicator.classList.add('active');
        showPopup('Value stored in memory');
    }
}

function memoryRecall() {
    if (memory === 0) {
        showPopup('Memory is empty');
        return;
    }

    const memoryStr = memory.toString();
    if (display.textContent === 'Let\'s Calculate!' || display.textContent === '0') {
        assignToDisplay(memoryStr, memoryStr);
    } else {
        insertToDisplay(memoryStr, memoryStr);
    }
}

function memoryAdd() {
    if (display.textContent === 'Let\'s Calculate!' || display.textContent === 'NaN') {
        showPopup('No value to add');
        return;
    }

    const value = parseFloat(display.textContent);
    if (!isNaN(value)) {
        memory += value;
        memoryIndicator.classList.add('active');
        showPopup('Value added to memory');
    }
}

function memoryClear() {
    memory = 0;
    memoryIndicator.classList.remove('active');
    showPopup('Memory cleared');
}

// History functions
function addToHistory(expression, result) {
    const historyItem = {
        expression: expression,
        result: result,
        timestamp: new Date()
    };

    history.unshift(historyItem);
    if (history.length > 50) {
        history.pop();
    }

    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    if (history.length === 0) {
        historyContainer.innerHTML = '<div style="color: rgba(255, 255, 255, 0.6); text-align: center; padding: 20px; font-size: 0.9rem;">No calculations yet</div>';
        return;
    }

    historyContainer.innerHTML = '';
    history.forEach((item, index) => {
        const historyDiv = document.createElement('div');
        historyDiv.className = 'history-item';
        historyDiv.innerHTML = `
                    <div class="history-expression">${item.expression}</div>
                    <div class="history-result">= ${formatResult(item.result)}</div>
                `;
        historyDiv.onclick = () => {
            assignToDisplay(formatResult(item.result), formatResult(item.result));
        };
        historyContainer.appendChild(historyDiv);
    });
}

function clearHistory() {
    history = [];
    updateHistoryDisplay();
    showPopup('History cleared');
}

// Popup function
let popupTimeout;
function showPopup(message) {
    popup.textContent = message;
    popup.classList.add('show');
    clearTimeout(popupTimeout);
    popupTimeout = setTimeout(() => {
        popup.classList.remove('show');
    }, 3000);
}

// Keyboard support
document.addEventListener('keydown', (e) => {
    const key = e.key;
    if (['Backspace', 'Enter', 'Delete'].includes(key)) e.preventDefault();

    // Add button press animation
    const button = findButtonByKey(key);
    if (button) {
        button.classList.add('button-pressed');
        setTimeout(() => button.classList.remove('button-pressed'), 100);
    }

    // Key mappings
    const keyMap = {
        'Enter': () => compute(),
        '=': () => compute(),
        'Backspace': () => clearOne(),
        'Delete': () => clearAll(),
        'Escape': () => clearAll(),
        'c': () => clearAll(),
        'C': () => clearAll(),
        '/': () => insertOperator('/'),
        '*': () => insertOperator('*'),
        '-': () => insertOperator('-'),
        '+': () => insertOperator('+'),
        '%': () => insertOperator('%'),
        '.': () => insertDecimal(),
        '(': () => insertBracket('('),
        ')': () => insertBracket(')'),
        's': () => insertFunction('sin('),
        'S': () => insertFunction('√('),
        'l': () => insertFunction('log('),
        'L': () => insertFunction('ln('),
        'p': () => insertConstant('π'),
        'e': () => insertConstant('e')
    };

    // Handle digits
    if (!isNaN(key) && key !== ' ') {
        insertNumber(key);
        return;
    }

    // Handle mapped keys
    if (keyMap[key]) {
        keyMap[key]();
        return;
    }
});

function findButtonByKey(key) {
    const buttons = document.querySelectorAll('button');
    for (let button of buttons) {
        const text = button.textContent;
        if (
            (key === 'Enter' && text === '=') ||
            (key === 'Backspace' && text === '←') ||
            (key === 'Delete' && text === 'C') ||
            (key === '/' && text === '÷') ||
            (key === '*' && text === '×') ||
            text === key
        ) {
            return button;
        }
    }
    return null;
}

// Visual animation to show when keyboard button is pressed
document.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        e.target.classList.add('button-pressed');
        setTimeout(() => e.target.classList.remove('button-pressed'), 100);
    }
});

// Prevent context menu on long press for mobile
document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'BUTTON') {
        e.preventDefault();
    }
});

// Add swipe gestures for mobile
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
    if (!touchStartX || !touchStartY) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchStartX - touchEndX;
    const deltaY = touchStartY - touchEndY;

    // Swipe left to clear one
    if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 50) {
        clearOne();
    }

    // Swipe right to clear all
    if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX < -50) {
        clearAll();
    }

    touchStartX = 0;
    touchStartY = 0;
});

// Add vibration feedback for mobile
function vibrate() {
    if ('vibrate' in navigator) {
        navigator.vibrate(10);
    }
}

// Add vibration to button clicks
document.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        vibrate();
    }
});

// Scientific notation support
function toScientificNotation(num) {
    if (Math.abs(num) < 1e-6 || Math.abs(num) >= 1e12) {
        return num.toExponential(6);
    }
    return num.toString();
}

// Add precision control
let precision = 10;

function setPrecision(newPrecision) {
    precision = newPrecision;
}

// Enhanced error handling
function handleError(error) {
    console.error('Calculator error:', error);
    showPopup('Calculation error occurred');
    clearAll();
}

// Add undo functionality
let lastState = { display: 'Let\'s Calculate!', secondary: '' };

function saveState() {
    lastState = {
        display: display.textContent,
        secondary: secondaryDisplay.textContent
    };
}

function undo() {
    assignToDisplay(lastState.display, lastState.secondary);
}

// Auto-save state before operations
const originalInsertToDisplay = insertToDisplay;
insertToDisplay = function (primary, secondary) {
    saveState();
    originalInsertToDisplay(primary, secondary);
};

const originalAssignToDisplay = assignToDisplay;
assignToDisplay = function (primary, secondary) {
    if (primary !== 'Let\'s Calculate!') {
        saveState();
    }
    originalAssignToDisplay(primary, secondary);
};

// Add keyboard shortcut help
function showKeyboardHelp() {
    const helpText = `
                Keyboard Shortcuts:
                • Numbers: 0-9
                • Operators: +, -, *, /, %
                • Decimal: .
                • Brackets: (, )
                • Calculate: Enter or =
                • Clear: Delete or C
                • Backspace: ←
                • Square root: S
                • Sine: s
                • Log: l
                • Natural log: L
                • Pi: p
                • Euler's number: e
                • Clear All: Escape
            `;
    showPopup(helpText);
}

// Add double-tap to clear
let lastTap = 0;
display.addEventListener('touchend', (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    if (tapLength < 500 && tapLength > 0) {
        clearAll();
    }
    lastTap = currentTime;
});

// Speech functionality
let shouldAnnounce = JSON.parse(localStorage.getItem("calc-announce") || "true");
const speakerBTN = document.getElementById("speaker");
speakerBTN.addEventListener("click", toggleAnnounce);

// Initial update
(() => {
    speakerBTN.textContent = shouldAnnounce ? "🔊" : "🔇"
})();

function toggleAnnounce (){
    shouldAnnounce = !shouldAnnounce;
    localStorage.setItem('calc-announce', JSON.stringify(shouldAnnounce));
    speakerBTN.textContent = shouldAnnounce ? "🔊" : "🔇";
}

function announceResult(result) {
    if(!shouldAnnounce) return;

    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(`Result: ${result}`);
        utterance.rate = 0.7;
        utterance.volume = 0.3;
        speechSynthesis.speak(utterance);
    }
}

const originalCompute = compute;
compute = function () {
    const oldDisplay = display.textContent;
    originalCompute();

    // Announce result if it changed
    if (display.textContent !== oldDisplay && display.textContent !== 'Let\'s Calculate!') {
        announceResult(display.textContent);
    }
};