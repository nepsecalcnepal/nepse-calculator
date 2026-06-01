/* ==========================================================================
   main.js - DOM bindings, UI logic, calculator wiring
   ========================================================================== */

   // Prevent clickjacking
 if (window.self !== window.top) {
  window.top.location = window.self.location;
 }
   function sanitizeInput(value) {
  return String(value)
    .replace(/[<>'"&]/g, '')
    .trim();
}
document.addEventListener('DOMContentLoaded', function () {
  initNavbar();
  initFAQ();
  initThemeToggle();
  initBuySellCalculator();
  initBrokerageCalculator();
  initCGTCalculator();
  initWACCCalculator();
  initContactForm();
  initNewsletterForm();
  initSmoothScroll();
  setCurrentYear();
});

/* =========================================================
   NAVBAR
   ========================================================= */
function initNavbar() {
  const toggle = document.querySelector('.navbar__toggle');
  const menu   = document.querySelector('.navbar__menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      toggle.classList.toggle('active');
      menu.classList.toggle('navbar__menu--active');
    });
  }
  document.querySelectorAll('.navbar__dropdown-toggle').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      if (window.innerWidth < 768) {
        e.preventDefault();
        btn.parentElement.classList.toggle('open');
      }
    });
  });
  document.addEventListener('click', function (e) {
    if (window.innerWidth < 768 && menu && menu.classList.contains('navbar__menu--active')) {
      if (!menu.contains(e.target) && !toggle.contains(e.target)) {
        menu.classList.remove('navbar__menu--active');
        toggle.classList.remove('active');
      }
    }
  });
}

/* =========================================================
   FAQ
   ========================================================= */
function initFAQ() {
  document.querySelectorAll('.faq__question').forEach(function (q) {
    q.addEventListener('click', function () {
      const item     = q.parentElement;
      const isActive = item.classList.contains('faq__item--active');
      document.querySelectorAll('.faq__item').forEach(function (i) {
        i.classList.remove('faq__item--active');
      });
      if (!isActive) item.classList.add('faq__item--active');
    });
  });
}

/* =========================================================
   THEME TOGGLE
   ========================================================= */
function initThemeToggle() {
  const toggle = document.querySelector('.theme-toggle');
  if (!toggle) return;
  const saved = readFromStorage('theme');
  if (saved === 'dark') {
    document.documentElement.classList.add('dark');
    toggle.textContent = '☀️';
  }
  toggle.addEventListener('click', function () {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    toggle.textContent = isDark ? '☀️' : '🌙';
    saveToStorage('theme', isDark ? 'dark' : 'light');
  });
}

/* =========================================================
   CALCULATOR TABS
   ========================================================= */
function switchTab(tabName) {
  document.querySelectorAll('.calculator__tab').forEach(function (t) {
    t.classList.toggle('calculator__tab--active', t.dataset.tab === tabName);
  });
  document.querySelectorAll('.calculator__panel').forEach(function (p) {
    p.classList.toggle('calculator__panel--active', p.dataset.panel === tabName);
  });
}
document.addEventListener('click', function (e) {
  const tab = e.target.closest('.calculator__tab');
  if (tab) switchTab(tab.dataset.tab);
});

/* =========================================================
   BUY / SELL CALCULATOR
   ========================================================= */
function initBuySellCalculator() {
  const form = document.getElementById('buysell-form');
  if (!form) return;

  const last = readFromStorage('lastBuySell');
  if (last) {
    Object.keys(last).forEach(function (key) {
      const el = form.querySelector('[name="' + key + '"]');
      if (el) el.value = last[key];
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    runBuySellCalculation(form);
  });

  const resetBtn = form.querySelector('[data-action="reset"]');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      form.reset();
      document.getElementById('buysell-results').innerHTML = renderPlaceholder('📊', 'Fill in the form and click <strong>Calculate</strong> to see your results.');
      form.querySelectorAll('.calc-form__input').forEach(clearFieldError);
    });
  }
}

function runBuySellCalculation(form) {
 const shares     = sanitizeInput(form.elements['shares'].value);
 const buyPrice   = sanitizeInput(form.elements['buyPrice'].value);
 const sellPrice  = sanitizeInput(form.elements['sellPrice'].value);
  const holding    = form.elements['holdingType'].value;
  const brokerBuy  = form.elements['brokerageBuy'].value;
  const brokerSell = form.elements['brokerageSell'].value;
  const sebonRate  = form.elements['sebonRate'].value;
  const dpCharge   = form.elements['dpCharge'].value;

  let valid = true;
  [['shares', shares], ['buyPrice', buyPrice], ['sellPrice', sellPrice]].forEach(function (pair) {
    const el = form.elements[pair[0]];
    clearFieldError(el);
    if (!isPositiveNumber(pair[1])) {
      showFieldError(el, 'Please enter a valid positive number');
      valid = false;
    }
  });
  if (!valid) return;

  const result = calculateBuySell({
    shares: shares, buyPrice: buyPrice, sellPrice: sellPrice,
    holdingType: holding,
    brokerageBuy:  brokerBuy  !== '' ? brokerBuy  : undefined,
    brokerageSell: brokerSell !== '' ? brokerSell : undefined,
    sebonRate: sebonRate !== '' ? sebonRate : undefined,
    dpCharge:  dpCharge  !== '' ? dpCharge  : undefined
  });

  saveToStorage('lastBuySell', {
    shares, buyPrice, sellPrice, holdingType: holding,
    brokerageBuy: brokerBuy, brokerageSell: brokerSell,
    sebonRate, dpCharge
  });

  const el = document.getElementById('buysell-results');
  el.innerHTML = renderBuySellResults(result);
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ── Render helpers ── */
function renderPlaceholder(icon, msg) {
  return '<div class="results__placeholder">' +
    '<div class="results__placeholder-icon">' + icon + '</div>' +
    '<p>' + msg + '</p></div>';
}

function row(label, value, bold) {
  return '<div class="results__row">' +
    '<span class="results__label">' + label + '</span>' +
    '<span class="results__value' + (bold ? ' results__value--bold' : '') + '">' + value + '</span>' +
    '</div>';
}

function sectionHead(icon, label, color) {
  return '<div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;' +
    'letter-spacing:0.08em;color:' + color + ';margin:14px 0 8px;' +
    'display:flex;align-items:center;gap:6px;">' +
    icon + ' ' + label +
    '<span style="flex:1;height:1px;background:var(--color-border);display:inline-block;"></span>' +
    '</div>';
}

function totalRow(label, value) {
  return '<div style="display:flex;justify-content:space-between;align-items:center;' +
    'padding:8px 0;border-top:1.5px solid var(--color-border);margin-top:4px;">' +
    '<span style="font-weight:700;font-size:0.875rem;">' + label + '</span>' +
    '<span style="font-weight:800;font-size:1rem;color:var(--color-text);">' + value + '</span>' +
    '</div>';
}

function chargeBar(label, amount, total, color) {
  const pct = total > 0 ? (amount / total) * 100 : 0;
  return '<div style="margin-bottom:8px;">' +
    '<div style="display:flex;justify-content:space-between;font-size:0.75rem;margin-bottom:3px;">' +
    '<span style="color:var(--color-text-muted);font-weight:500;">' + label + '</span>' +
    '<span style="font-weight:600;color:var(--color-text);">' + formatCurrency(amount) +
    ' <span style="color:var(--color-text-light);font-weight:400;">(' + pct.toFixed(1) + '%)</span></span>' +
    '</div>' +
    '<div style="height:7px;background:var(--color-border);border-radius:99px;overflow:hidden;">' +
    '<div style="height:100%;width:' + pct.toFixed(1) + '%;background:' + color + ';' +
    'border-radius:99px;transition:width 0.7s cubic-bezier(0.4,0,0.2,1);"></div>' +
    '</div></div>';
}

function summaryCard(topLabel, topIcon, mainValue, subValue, bgColor, borderColor, textColor) {
  return '<div style="background:' + bgColor + ';border:1.5px solid ' + borderColor + ';' +
    'border-radius:12px;padding:14px 12px;text-align:center;">' +
    '<div style="font-size:0.68rem;font-weight:700;text-transform:uppercase;' +
    'letter-spacing:0.07em;color:' + textColor + ';margin-bottom:5px;opacity:0.85;">' +
    topIcon + ' ' + topLabel + '</div>' +
    '<div style="font-size:1.45rem;font-weight:800;color:' + textColor + ';letter-spacing:-0.5px;line-height:1.2;">' +
    mainValue + '</div>' +
    '<div style="font-size:0.78rem;font-weight:600;color:' + textColor + ';opacity:0.75;margin-top:3px;">' +
    subValue + '</div>' +
    '</div>';
}

/* ── Main Buy/Sell result renderer ── */
function renderBuySellResults(r) {
  const isProfit    = r.netProfitLoss > 0;
  const isBreakEven = r.netProfitLoss === 0;
  const plLabel     = isProfit ? 'Net Profit' : (isBreakEven ? 'Break Even' : 'Net Loss');
  const plColor     = isProfit ? '#059669'    : (isBreakEven ? '#d97706'    : '#dc2626');
  const plBg        = isProfit ? '#d1fae5'    : (isBreakEven ? '#fef3c7'    : '#fee2e2');
  const plBorder    = isProfit ? '#6ee7b7'    : (isBreakEven ? '#fcd34d'    : '#fca5a5');
  const plIcon      = isProfit ? '📈'         : (isBreakEven ? '➖'         : '📉');
  const arrow       = isProfit ? '▲'          : (isBreakEven ? '─'          : '▼');

  const totalCharges = r.buyBrokerage + r.buySebon + r.sellBrokerage + r.sellSebon + r.dpCharge + r.cgtAmount;
  const chargesPct   = r.buyAmount > 0 ? (totalCharges / r.buyAmount) * 100 : 0;
  const breakEvenPrice = r.buyAmount > 0
    ? ((r.totalBuyCost + r.sellBrokerage + r.sellSebon + r.dpCharge) / Number(r.buyAmount / (r.buyAmount / r.buyBrokerageRate || 1))).toFixed(2)
    : 0;

  return (
    /* ── 3 summary cards ── */
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">' +
      summaryCard(plLabel, plIcon,
        formatCurrency(Math.abs(r.netProfitLoss)),
        arrow + ' ' + formatPercent(Math.abs(r.profitLossPct)) + ' return',
        plBg, plBorder, plColor) +
      summaryCard('Total Charges', '💸',
        formatCurrency(totalCharges),
        chargesPct.toFixed(2) + '% of buy value',
        '#eff4ff', '#c7d7fd', '#1a56db') +
    '</div>' +

    /* ── Buy side ── */
    sectionHead('🛒', 'Buy Side', '#1a56db') +
    row('Shares × Buy Price', formatCurrency(r.buyAmount)) +
    row('Brokerage (' + r.buyBrokerageRate.toFixed(3) + '%)', '− ' + formatCurrency(r.buyBrokerage)) +
    row('SEBON Fee (0.015%)', '− ' + formatCurrency(r.buySebon)) +
    totalRow('Total Buy Cost', formatCurrency(r.totalBuyCost)) +

    /* ── Sell side ── */
    sectionHead('💰', 'Sell Side', '#059669') +
    row('Shares × Sell Price', formatCurrency(r.sellAmount)) +
    row('Brokerage (' + r.sellBrokerageRate.toFixed(3) + '%)', '− ' + formatCurrency(r.sellBrokerage)) +
    row('SEBON Fee (0.015%)', '− ' + formatCurrency(r.sellSebon)) +
    row('DP Charge (flat)', '− ' + formatCurrency(r.dpCharge)) +
    row('CGT (' + r.cgtRate + '%)', '− ' + formatCurrency(r.cgtAmount)) +
    totalRow('Net Sell Revenue', formatCurrency(r.totalSellRevenue)) +

    /* ── Charges breakdown bar chart ── */
    '<div style="background:var(--color-bg-alt);border:1.5px solid var(--color-border);' +
    'border-radius:10px;padding:14px;margin-top:14px;">' +
    '<div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;' +
    'letter-spacing:0.07em;color:var(--color-text-muted);margin-bottom:10px;">📊 Where Your Money Goes</div>' +
    chargeBar('Brokerage (buy + sell)', r.buyBrokerage + r.sellBrokerage, totalCharges, '#1a56db') +
    chargeBar('SEBON Fee (buy + sell)', r.buySebon + r.sellSebon,         totalCharges, '#0ea5e9') +
    chargeBar('Capital Gains Tax',      r.cgtAmount,                      totalCharges, '#d97706') +
    chargeBar('DP Charge',              r.dpCharge,                       totalCharges, '#6b7280') +
    '</div>'
  );
}

/* =========================================================
   BROKERAGE CALCULATOR
   ========================================================= */
function initBrokerageCalculator() {
  const form = document.getElementById('brokerage-form');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const amount      = form.elements['amount'].value;
    const rateOverride = form.elements['rate'].value;
    const el          = form.elements['amount'];
    clearFieldError(el);
    if (!isPositiveNumber(amount)) {
      showFieldError(el, 'Please enter a valid amount');
      return;
    }
    const r = calculateBrokerage(Number(amount), rateOverride);
    const totalCharges = r.brokerage + r.sebon;

    document.getElementById('brokerage-results').innerHTML =
      '<div style="background:#eff4ff;border:1.5px solid #c7d7fd;border-radius:12px;' +
      'padding:14px;text-align:center;margin-bottom:14px;">' +
        '<div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;' +
        'letter-spacing:0.07em;color:#1a56db;margin-bottom:4px;">💼 Total Charges</div>' +
        '<div style="font-size:1.6rem;font-weight:800;color:#1a56db;">' + formatCurrency(totalCharges) + '</div>' +
        '<div style="font-size:0.78rem;color:#1a56db;opacity:0.75;margin-top:2px;">' +
        ((totalCharges / r.amount) * 100).toFixed(3) + '% of transaction</div>' +
      '</div>' +
      sectionHead('📋', 'Breakdown', '#1a56db') +
      row('Transaction Amount', formatCurrency(r.amount)) +
      row('Applicable Rate', r.rate.toFixed(3) + '%') +
      row('Brokerage Fee', formatCurrency(r.brokerage)) +
      row('SEBON Fee (0.015%)', formatCurrency(r.sebon)) +
      totalRow('Total Charges', formatCurrency(totalCharges)) +
      '<div style="background:var(--color-bg-alt);border:1.5px solid var(--color-border);' +
      'border-radius:10px;padding:14px;margin-top:14px;">' +
      '<div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;' +
      'letter-spacing:0.07em;color:var(--color-text-muted);margin-bottom:10px;">📊 Charge Split</div>' +
      chargeBar('Brokerage', r.brokerage, totalCharges, '#1a56db') +
      chargeBar('SEBON Fee', r.sebon,     totalCharges, '#0ea5e9') +
      '</div>';
  });
}

/* =========================================================
   CGT CALCULATOR
   ========================================================= */
function initCGTCalculator() {
  const form = document.getElementById('cgt-form');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const buy  = form.elements['buyTotal'].value;
    const sell = form.elements['sellTotal'].value;
    const ht   = form.elements['holdingType'].value;

    let valid = true;
    [['buyTotal', buy], ['sellTotal', sell]].forEach(function (pair) {
      const el = form.elements[pair[0]];
      clearFieldError(el);
      if (!isPositiveNumber(pair[1])) {
        showFieldError(el, 'Please enter a valid amount');
        valid = false;
      }
    });
    if (!valid) return;

    const r         = calculateCGT(Number(buy), Number(sell), ht);
    const isProfit  = r.isProfit;
    const taxColor  = isProfit ? '#d97706' : '#6b7280';
    const taxBg     = isProfit ? '#fef3c7' : '#f3f4f6';
    const taxBorder = isProfit ? '#fcd34d' : '#d1d5db';
    const gainColor = isProfit ? '#059669' : '#dc2626';
    const gainBg    = isProfit ? '#d1fae5' : '#fee2e2';
    const gainBorder= isProfit ? '#6ee7b7' : '#fca5a5';

    document.getElementById('cgt-results').innerHTML =
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">' +
        summaryCard(isProfit ? 'Capital Gain' : 'Capital Loss', isProfit ? '📈' : '📉',
          formatCurrency(Math.abs(r.gain)), isProfit ? 'Taxable gain' : 'No tax applicable',
          gainBg, gainBorder, gainColor) +
        summaryCard('Tax Payable', '🧾',
          isProfit ? formatCurrency(r.tax) : 'Rs 0',
          'Rate: ' + r.rate + '%',
          taxBg, taxBorder, taxColor) +
      '</div>' +
      sectionHead('📋', 'Details', '#1a56db') +
      row('Total Buy Amount',  formatCurrency(buy)) +
      row('Total Sell Amount', formatCurrency(sell)) +
      row('Gross Gain / Loss', formatCurrency(r.gain)) +
      row('CGT Rate', r.rate + '%') +
      totalRow('Capital Gains Tax', isProfit ? formatCurrency(r.tax) : 'Rs 0 (no profit)');
  });
}

/* =========================================================
   WACC CALCULATOR
   ========================================================= */
function initWACCCalculator() {
  const form = document.getElementById('wacc-form');
  if (!form) return;

  const addBtn        = form.querySelector('[data-action="add-lot"]');
  const lotsContainer = form.querySelector('.wacc-lots');

  if (addBtn) {
    addBtn.addEventListener('click', function () {
      const idx = lotsContainer.querySelectorAll('.wacc-lot').length + 1;
      const div = document.createElement('div');
      div.className = 'wacc-lot calc-form__row';
      div.innerHTML =
        '<div class="calc-form__group">' +
          '<label class="calc-form__label">Lot ' + idx + ' Shares</label>' +
          '<input type="number" class="calc-form__input" name="shares[]" min="0" step="1" placeholder="100">' +
        '</div>' +
        '<div class="calc-form__group">' +
          '<label class="calc-form__label">Lot ' + idx + ' Price (Rs)</label>' +
          '<input type="number" class="calc-form__input" name="price[]" min="0" step="0.01" placeholder="500">' +
        '</div>';
      lotsContainer.appendChild(div);
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const sharesInputs = form.querySelectorAll('input[name="shares[]"]');
    const priceInputs  = form.querySelectorAll('input[name="price[]"]');
    const lots = [];
    sharesInputs.forEach(function (s, i) {
      lots.push({ shares: s.value, price: priceInputs[i] ? priceInputs[i].value : 0 });
    });
    const r = calculateWACC(lots);

    document.getElementById('wacc-results').innerHTML =
      '<div style="background:#eff4ff;border:1.5px solid #c7d7fd;border-radius:12px;' +
      'padding:14px;text-align:center;margin-bottom:14px;">' +
        '<div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;' +
        'letter-spacing:0.07em;color:#1a56db;margin-bottom:4px;">⚖️ Average Cost Per Share</div>' +
        '<div style="font-size:1.8rem;font-weight:800;color:#1a56db;">' + formatCurrency(r.wacc) + '</div>' +
        '<div style="font-size:0.78rem;color:#1a56db;opacity:0.75;margin-top:2px;">Weighted average</div>' +
      '</div>' +
      sectionHead('📋', 'Summary', '#1a56db') +
      row('Total Shares', r.totalShares.toLocaleString('en-IN')) +
      row('Total Investment', formatCurrency(r.totalCost)) +
      totalRow('WACC per Share', formatCurrency(r.wacc));
  });
}

/* =========================================================
   CONTACT FORM
   ========================================================= */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const alertEl = document.getElementById('contact-alert');
    if (!form.checkValidity()) {
      alertEl.className = 'alert alert--error alert--visible';
      alertEl.textContent = 'Please fill in all required fields correctly.';
      return;
    }
    alertEl.className = 'alert alert--success alert--visible';
    alertEl.textContent = '✅ Thank you! Your message has been received. We will reply within 24 hours.';
    form.reset();
    setTimeout(function () { alertEl.classList.remove('alert--visible'); }, 5000);
  });
}

/* =========================================================
   NEWSLETTER FORM
   ========================================================= */
function initNewsletterForm() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    if (input.value && input.checkValidity()) {
      input.value = '';
      const msg = document.createElement('div');
      msg.style.cssText = 'color:#86efac;font-size:0.875rem;margin-top:8px;';
      msg.textContent = '✅ Subscribed!';
      form.appendChild(msg);
      setTimeout(function () { msg.remove(); }, 4000);
    }
  });
}

/* =========================================================
   SMOOTH SCROLL
   ========================================================= */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const href = link.getAttribute('href');
      if (href.length < 2) return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });
}

/* =========================================================
   FOOTER YEAR
   ========================================================= */
function setCurrentYear() {
  const el = document.getElementById('current-year');
  if (el) el.textContent = new Date().getFullYear();
}