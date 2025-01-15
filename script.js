// DOM getters : ------------------------------------------------------------------
const secondaryDisplay = document.querySelector('.scDisplay');
const popup = document.querySelector('.popup');
const display = document.querySelector('#display');

// functions : ---------------------------------------------------------------------
function clearAll() { // function to clearAll
    assignToDisplay('Expression here', '');
}

function clearOne() { // function to clearOne
    if (
        display.textContent === 'Expression here' ||
        display.textContent === '0' ||
        display.textContent.length === 1
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
    if(display.textContent === 'Expression here'){
        showPopup('First provide an expression');
        clearAll();
        return ;
    }
    try {
        const result = eval(secondaryDisplay.textContent);
        if (result === Infinity) {       //handling division by zero
            showPopup('Invalid format: Division by zero');
            assignToDisplay('Expression here', '');
            return;
        }
        assignToDisplay(result, result);
    } catch (error) {
        showPopup('Invalid expression');
    }
}

function showPopup(message) { // popup message
    popup.textContent = message;
    popup.style.display = 'block';
    setTimeout(() => {
        popup.style.display = 'none';
    }, 3000);
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
            display.textContent === 'Expression here' ||
            display.textContent === '0'
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
            showPopup('Cannot insert empty braces');
            return;
        }

        if (
            display.textContent.at(-1) === '.' ||
            /[+\-*/%]/.test(display.textContent.at(-1))
        ) {
            showPopup('Invalid insertion before closing brace');
            return;
        }

        insertToDisplay(')', ')');
    }

    if (e.target.textContent === '√') { // inserting square roots
        if (
            display.textContent === 'Expression here' ||
            display.textContent === '0'
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
            display.textContent === 'Expression here' ||
            display.textContent === '0'
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
            display.textContent === 'Expression here' ||
            display.textContent === ''
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
            display.textContent === 'Expression here' ||
            display.textContent === ''
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
            display.textContent === 'Expression here' ||
            display.textContent === '0' ||
            display.textContent === ''
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