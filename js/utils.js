/* ==========================================================================
   utils.js - Shared utility functions
   ========================================================================== */

/**
 * Format a number as Nepali Rupees (Rs).
 * @param {number} value
 * @returns {string} e.g. "Rs 1,23,456.78"
 */
function formatCurrency(value) {
  if (isNaN(value) || value === null) return 'Rs 0.00';
  const num = Number(value);
  // Indian/Nepali numbering system uses lakhs/crores grouping (en-IN)
  return 'Rs ' + num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Format a number as a percentage with 2 decimals.
 * @param {number} value
 * @returns {string}
 */
function formatPercent(value) {
  if (isNaN(value) || value === null) return '0.00%';
  return Number(value).toFixed(2) + '%';
}

/**
 * Round a number to 2 decimal places (banker-safe enough for currency display).
 * @param {number} num
 * @returns {number}
 */
function round2(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Validate that a value is a positive number.
 * @param {*} value
 * @returns {boolean}
 */
function isPositiveNumber(value) {
  const n = Number(value);
  return !isNaN(n) && isFinite(n) && n > 0;
}

/**
 * Show an error message under an input field.
 * @param {HTMLElement} inputEl
 * @param {string} message
 */
function showFieldError(inputEl, message) {
  if (!inputEl) return;
  inputEl.classList.add('calc-form__input--error');
  const errorEl = inputEl.parentElement.querySelector('.calc-form__error');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('calc-form__error--visible');
  }
}

/**
 * Clear error message under input field.
 * @param {HTMLElement} inputEl
 */
function clearFieldError(inputEl) {
  if (!inputEl) return;
  inputEl.classList.remove('calc-form__input--error');
  const errorEl = inputEl.parentElement.querySelector('.calc-form__error');
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.remove('calc-form__error--visible');
  }
}

/**
 * Save data to localStorage safely (catches quota errors).
 * @param {string} key
 * @param {*} data
 */
function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    // Storage may be full or disabled (private mode) — fail silently
  }
}

/**
 * Read data from localStorage.
 * @param {string} key
 * @returns {*} parsed value or null
 */
function readFromStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Debounce function — delays calling fn until after `wait` ms have elapsed
 * since the last invocation. Useful for live calculation on input.
 * @param {Function} fn
 * @param {number} wait
 * @returns {Function}
 */
function debounce(fn, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), wait);
  };
}
