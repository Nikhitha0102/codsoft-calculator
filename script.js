// Fixed Simple Calculator logic with visible display color and previous-value line

const displayEl = document.getElementById('display');
const prevEl = document.getElementById('prevDisplay');
const calculator = document.getElementById('calculator');

let current = '';     // current input string (what user is typing)
let previous = null;  // stored previous number (float)
let operation = null; // 'add', 'subtract', 'multiply', 'divide'
let justEvaluated = false; // true right after pressing '='

function opSymbol(op) {
  if (!op) return '';
  if (op === 'add') return '+';
  if (op === 'subtract') return '−';
  if (op === 'multiply') return '×';
  if (op === 'divide') return '÷';
  return '';
}

function updateDisplay() {
  // prev line shows previous value and operator if present
  if (previous !== null && operation !== null) {
    prevEl.textContent = String(previous) + ' ' + opSymbol(operation);
  } else {
    prevEl.textContent = '';
  }

  if (current === '' && previous === null) {
    displayEl.textContent = '0';
  } else if (current !== '') {
    displayEl.textContent = current;
  } else if (previous !== null) {
    // show previous when current empty
    displayEl.textContent = String(previous);
  } else {
    displayEl.textContent = '0';
  }
}

function clearAll(){
  current = '';
  previous = null;
  operation = null;
  justEvaluated = false;
  updateDisplay();
}

function appendNumber(num){
  // If we just evaluated and user starts typing a number, start a new input
  if (justEvaluated && operation === null) {
    current = '';
    previous = null;
    justEvaluated = false;
  } else if (justEvaluated && operation !== null) {
    // if evaluated but there's an operation (rare), just continue
    justEvaluated = false;
  }

  // Replace 'Error' with fresh input
  if (current === 'Error') current = '';

  if (num === '.' && current.includes('.')) return;
  // Prevent multiple leading zeros like "000"
  if (current === '0' && num === '0') return;
  if (current === '0' && num !== '.') current = num; // replace leading zero
  else current = current + num;

  updateDisplay();
}

function chooseOperation(op){
  // If no input and no previous, nothing to do
  if (current === '' && previous === null) return;

  // If user has a previous number but hasn't typed the second and presses different operator -> change operator
  if (current === '' && previous !== null) {
    operation = op; // just change operator
    justEvaluated = false;
    updateDisplay();
    return;
  }

  // Normal flow: move current into previous (or compute chain)
  if (previous === null) {
    previous = parseFloat(current || '0');
  } else {
    // If user typed a second number, compute chain (e.g., 2 + 3 + -> 5)
    if (current !== '') {
      previous = compute(previous, parseFloat(current));
    }
  }

  operation = op;
  current = '';
  justEvaluated = false;
  updateDisplay();
}

function compute(a, b) {
  let result = a;
  if (operation === 'add') result = a + b;
  if (operation === 'subtract') result = a - b;
  if (operation === 'multiply') result = a * b;
  if (operation === 'divide') result = (b === 0 ? NaN : a / b);

  // fix floating precision to 9 decimal places max
  return Math.round((result + Number.EPSILON) * 1e9) / 1e9;
}

function equals(){
  // nothing to compute
  if (operation === null && current === '') return;

  // If there's no previous but there's current and an operation missing, just show current
  if (previous === null && operation === null) {
    updateDisplay();
    return;
  }

  // If second operand missing, use previous as second operand (so 5 + = -> 10)
  let b;
  if (current === '') {
    b = previous;
  } else {
    b = parseFloat(current);
  }

  const a = previous === null ? 0 : previous;
  const result = compute(a, b);

  current = isNaN(result) ? 'Error' : String(result);
  previous = null;
  operation = null;
  justEvaluated = true;
  updateDisplay();
}

function toggleNeg(){
  if (current === '' && previous !== null && justEvaluated) {
    // if just evaluated and user toggles, toggle the current numeric display
    current = String(previous);
    previous = null;
  }

  if (current === '' ) {
    current = '0';
  }

  if (current === 'Error') return;

  if (current.startsWith('-')) current = current.slice(1);
  else current = '-' + current;

  updateDisplay();
}

function percent(){
  if (current === '' && previous !== null && justEvaluated) {
    // apply percent to the displayed previous result
    current = String(previous / 100);
    previous = null;
    justEvaluated = false;
    updateDisplay();
    return;
  }

  if (current === '') return;
  const num = parseFloat(current);
  current = String(num / 100);
  updateDisplay();
}

// Click handling (buttons)
calculator.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  if (btn.dataset.number !== undefined) {
    appendNumber(btn.dataset.number);
    return;
  }

  const action = btn.dataset.action;
  if (!action) return;

  if (action === 'clear') clearAll();
  else if (action === 'neg') toggleNeg();
  else if (action === 'percent') percent();
  else if (action === 'equals') equals();
  else if (['add','subtract','multiply','divide'].includes(action)) chooseOperation(action);
});

// Keyboard support
window.addEventListener('keydown', (e) => {
  // numbers and dot
  if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
    appendNumber(e.key);
    return;
  }

  if (e.key === '+') chooseOperation('add');
  else if (e.key === '-') chooseOperation('subtract');
  else if (e.key === '*') chooseOperation('multiply');
  else if (e.key === '/') chooseOperation('divide');
  else if (e.key === 'Enter' || e.key === '=') equals();
  else if (e.key === 'Backspace') {
    // if just evaluated, clear last result; else remove last digit
    if (justEvaluated) {
      current = '';
      previous = null;
      operation = null;
      justEvaluated = false;
      updateDisplay();
    } else {
      current = current.slice(0, -1);
      updateDisplay();
    }
  } else if (e.key.toLowerCase() === 'c') {
    clearAll();
  }
});

// initial render
updateDisplay();


