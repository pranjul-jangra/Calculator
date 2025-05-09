// DOM getters : ------------------------------------------------------------------
const secondaryDisplay = document.querySelector('.scDisplay');
const popup = document.querySelector('.popup');
const display = document.querySelector('#display');

// functions : ---------------------------------------------------------------------
function clearAll() { // function to clearAll
    assignToDisplay('Let’s Calculate!', '');
}

function clearOne() { // function to clearOne
    if (
        display.textContent === 'Let’s Calculate!' ||
        display.textContent === '0' ||
        display.textContent.length === 1 ||
        display.textContent === 'NaN'
    ) {
        clearAll();
        return;
    }
    assignToDisplay(display.textContent.slice(0, -1), secondaryDisplay.textContent.slice(0, -1));
}

function compute() { // function for computing result
    if (
        /[+\-*/%]/.test(display.textContent.at(-1)) ||
        display.textContent.at(-1) === '('
    ) {
        showPopup('Incomplete expression');
        return;
    }
    if(
        display.textContent === 'Let’s Calculate!' ||
        display.textContent === 'NaN'
    ){
        showPopup('Provide a valid expression');
        clearAll();
        return ;
    }
    try {
        const result = eval(secondaryDisplay.textContent);
        if (result === Infinity) {       //handling division by zero
            showPopup('Invalid format: Division by zero');
            assignToDisplay('Let’s Calculate!', '');
            return;

        }else if(isNaN(result)){      // handling NaN
            showPopup("NaN: Expression can't be computed");
            assignToDisplay('Let’s Calculate!', '');
            return;
        }
        assignToDisplay(result, result);
    } catch (error) {
        showPopup('Invalid expression');
    }
}

let popupTimeout;
function showPopup(message) {
    popup.textContent = message;
    popup.style.display = 'block';
    clearTimeout(popupTimeout);
    popupTimeout = setTimeout(() => {
        popup.style.display = 'none';
    }, 3000);
}

document.addEventListener('keydown', (e) => {
    const key = e.key;

    // Prevent default behavior for some keys like Backspace or Enter
    if (['Backspace', 'Enter'].includes(key)) e.preventDefault();

    const arithmeticContainer = document.querySelector('.arithmeticOperators');
    const rootsContainer = document.querySelector('.roots');

    // Mapping keys to buttons
    const keyMap = {
        'Enter': '=',
        'Backspace': '←',
        'Delete': 'C',
        '/': '/',
        '*': '*',
        '-': '-',
        '+': '+',
        '%': '%',
        '.': '.',
        '(': '(',
        ')': ')',
    };

    // If key is a digit
    if (!isNaN(key) && key !== ' ') {
        simulateClick(arithmeticContainer, key);
        return;
    }

    // If key is mapped
    if (keyMap[key]) {
        const btnText = keyMap[key];
        simulateClick(arithmeticContainer, btnText);
        return;
    }

    // If key is 'r' or 'c' for square/cube root
    if (key === 's') {
        simulateClick(rootsContainer, '√');
        return;
    }

    if (key === 'c') {
        simulateClick(rootsContainer, '∛');
        return;
    }
});


function simulateClick(container, buttonText) {
    const buttons = container.querySelectorAll('button');
    buttons.forEach(btn => {
        if (btn.textContent === buttonText) {
            btn.click();
        }
    });
}


function insertToDisplay(primary, secondary) {  // concatenating the values
    display.textContent += primary;
    secondaryDisplay.textContent += secondary;
}

function assignToDisplay(primary, secondary) {  // assigning the values
    display.textContent = primary;
    secondaryDisplay.textContent = secondary;
}


// Handling events : ---------------------------------------------------------------

// 1st parent container
document.querySelector('.roots').addEventListener('click', (e) => {
    if (e.target.classList.contains('roots')) { // preventing the parent to trigger event
        return;
    }

    if (e.target.textContent === '(') { // inserting brackets
        if (
            display.textContent === 'Let’s Calculate!' ||
            display.textContent === '0' ||
            display.textContent === 'NaN'
        ) {
            assignToDisplay('(', '(');
            return;
        }

        if (display.textContent.at(-1) === '.') {   // '(' after a '.'
            insertToDisplay('0*(', '0*(');
            return;
        }

        if (/\d/.test(display.textContent.at(-1))) {   // '(' after a digit
            insertToDisplay('*(', '*(');
            return;
        }

        if (display.textContent.at(-1) === ')') {   // '(' after a ')'
            insertToDisplay('*(', '*(');
            return;
        }

        insertToDisplay('(', '(');
        return;
    }

    if (e.target.textContent === ')') {
        let openBraces = 0,
            closeBraces = 0;
        for (let char of display.textContent) {
            if (char === '(') openBraces++;
            if (char === ')') closeBraces++;
        }

        if (closeBraces >= openBraces) { // prevent extra closing braces
            showPopup('Unmatched closing braces');
            return;
        }

        if (display.textContent.at(-1) === '(') { // Prevent empty braces "()"
            showPopup("Can't insert empty braces");
            return;
        }

        if (/[+\-*/%]/.test(display.textContent.at(-1))) {
            showPopup('Invalid insertion before closing brace');
            return;
        }

        if(display.textContent.at(-1) === '.'){
            insertToDisplay('0)', '0)');
            return;
        }

        insertToDisplay(')', ')');
    }

    if (e.target.textContent === '√') { // inserting square roots
        if (
            display.textContent === 'Let’s Calculate!' ||
            display.textContent === '0' ||
            display.textContent === 'NaN'
        ) {
            assignToDisplay('√(', 'Math.sqrt(');
            return;
        }

        if (display.textContent.at(-1) === '.') {
            insertToDisplay('0*√(', '0*Math.sqrt(');
            return;
        }

        if (/\d/.test(display.textContent.at(-1))) {
            insertToDisplay('*√(', '*Math.sqrt(');
            return;
        }

        insertToDisplay('√(', 'Math.sqrt(');
    } else if (e.target.textContent === '∛') { // inserting cube roots
        if (
            display.textContent === 'Let’s Calculate!' ||
            display.textContent === '0' ||
            display.textContent === 'NaN'
        ) {
            assignToDisplay('∛(', 'Math.cbrt(');
            return;
        }

        if (display.textContent.at(-1) === '.') {
            insertToDisplay('0*∛(', '0*Math.cbrt(');
            return;
        }

        if (/\d/.test(display.textContent.at(-1))) {
            insertToDisplay('*∛(', '*Math.cbrt(');
            return;
        }

        insertToDisplay('∛(', 'Math.cbrt(');
    }
});


// 2nd parent container
document.querySelector('.arithmeticOperators').addEventListener('click', (e) => {
    if (e.target.classList.contains('arithmeticOperators')) { // preventing the parent to trigger event
        return;
    }

    if (e.target.textContent === 'C') { // clearAll button
        clearAll();
    }

    if (e.target.textContent === '←') { // clearOne button
        clearOne();
    }

    if (e.target.textContent === '=') { // compute button
        compute();
    }

    const lastDotIndex = display.textContent.lastIndexOf('.');
    const lastOperatorIndex = display.textContent.search(/[+\-*/%](?!.*[+\-*/%])/);

    if (e.target.textContent === '.') {
        if (lastDotIndex > lastOperatorIndex) { // prevent multiple dots in a numeral
            showPopup('Invalid insertion');
            return;
        }

        if (             //dot at start
            display.textContent === 'Let’s Calculate!' ||
            display.textContent === '' ||
            display.textContent === 'NaN'
        ) {
            assignToDisplay('0.', '0.');
            return;
        }

        if (display.textContent.at(-1) === ')') {    //dot after ')'
            insertToDisplay('*0.', '*0.');
            return;
        }

        if (/\d/.test(display.textContent.at(-1))) {    //dot after a digit
            insertToDisplay('.', '.');
        } else {
            insertToDisplay('0.', '0.');           // dot after an operator
        }
        return;
    }

    if (/[+\-*/%]/.test(e.target.textContent)) {
        if (       //prevent inserting operator at start except for '-'
            display.textContent === 'Let’s Calculate!' ||
            display.textContent === '' ||
            display.textContent === 'NaN'
        ) {
            if (/[+*/%]/.test(e.target.textContent)) {
                showPopup(`Can't insert ${e.target.textContent} at the beginning`);
                return;
            } else {
                assignToDisplay('-', '-');
                return;
            }
        }

        if (display.textContent === '-') {
            if (/[+*/%]/.test(e.target.textContent)) {
                showPopup(`Can't change '-' to '${e.target.textContent}' at the beginning`)
                return;
            }
        }

        if (display.textContent.at(-1) === '(') {  //prevent insertion of operator after '(' except for '-'
            if (/[+*/%]/.test(e.target.textContent)) {
                showPopup(`Can't insert ${e.target.textContent} immediately after '('`);
                return;
            } else {
                insertToDisplay('-', '-');
                return;
            }
        }

        //prevent changing '-' after a '(' into other operator
        if (display.textContent.at(-2) === '(' && display.textContent.at(-1) === '-') {
            if (/[+*/%]/.test(e.target.textContent)) {
                showPopup(`Can't change '-' to '${e.target.textContent}'`);
                return;
            }
        }

        if (display.textContent.at(-1) === '.') {      //operator after a '.'
            insertToDisplay(`0${e.target.textContent}`, `0${e.target.textContent}`);
            return;
        }

        if (/[+\-*/%]/.test(display.textContent.at(-1))) {    //prevent repeatitive operators
            assignToDisplay(display.textContent.slice(0, -1) + e.target.textContent, secondaryDisplay.textContent.slice(0, -1) + e.target.textContent);
            return;
        }

        insertToDisplay(e.target.textContent, e.target.textContent)
    }

    if (/\d/.test(e.target.textContent)) {
        if (
            display.textContent === 'Let’s Calculate!' ||
            display.textContent === '0' ||
            display.textContent === '' ||
            display.textContent === 'NaN'
        ) {
            assignToDisplay(e.target.textContent, e.target.textContent);
            return;
        }

        if (display.textContent.at(-1) === ')') {
            insertToDisplay(`*${e.target.textContent}`, `*${e.target.textContent}`);
            return;
        }

        insertToDisplay(e.target.textContent, e.target.textContent);
    }
});