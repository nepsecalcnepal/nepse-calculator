/* ==========================================================================
   calculator.js - NEPSE calculation logic
   Rates valid as of 2025
   ========================================================================== */

/**
 * NEPSE BROKERAGE RATES (2025)
 * Edit these constants if rates change.
 */
const NEPSE_RATES = {
  // Tiered brokerage based on transaction amount
  brokerage: [
    { max: 50000,    rate: 0.36 },
    { max: 500000,   rate: 0.33 },
    { max: 2000000,  rate: 0.31 },
    { max: 10000000, rate: 0.27 },
    { max: Infinity, rate: 0.24 }
  ],
  sebonFee: 0.015,   // % charged on both buy and sell
  dpCharge: 25,      // Rs flat fee on sell only
  cgt: {
    shortTerm: 7.5,  // < 365 days, individual
    longTerm: 5,     // >= 365 days, individual
    institution: 10  // institutions
  }
};

/**
 * Get applicable brokerage % for a given transaction amount.
 * @param {number} amount
 * @returns {number} percentage (e.g. 0.33)
 */
function getBrokerageRate(amount) {
  for (const tier of NEPSE_RATES.brokerage) {
    if (amount <= tier.max) return tier.rate;
  }
  return NEPSE_RATES.brokerage[NEPSE_RATES.brokerage.length - 1].rate;
}

function applyMinimumBrokerage(amount, brokerage) {
  // Flat Rs 10 minimum for transactions up to Rs 2,500
  // Rs 10 minimum (whichever higher) for Rs 2,501 to Rs 50,000
  if (amount <= 50000) return Math.max(brokerage, 10);
  return brokerage;
}

/**
 * Calculate full Buy + Sell scenario for the main calculator.
 * @param {Object} params
 * @param {number} params.shares
 * @param {number} params.buyPrice
 * @param {number} params.sellPrice
 * @param {string} params.holdingType - 'short' | 'long' | 'institution'
 * @param {number} [params.brokerageBuy]    - override % (optional)
 * @param {number} [params.brokerageSell]   - override % (optional)
 * @param {number} [params.sebonRate]       - override % (default 0.015)
 * @param {number} [params.dpCharge]        - override flat (default 25)
 * @returns {Object} all calculated values
 */
function calculateBuySell(params) {
  const shares     = Number(params.shares);
  const buyPrice   = Number(params.buyPrice);
  const sellPrice  = Number(params.sellPrice);
  const sebonRate  = params.sebonRate !== undefined ? Number(params.sebonRate) : NEPSE_RATES.sebonFee;
  const dpCharge   = params.dpCharge  !== undefined ? Number(params.dpCharge)  : NEPSE_RATES.dpCharge;

  // BUY side
  const buyAmount       = shares * buyPrice;
  const buyBrokerageRate = params.brokerageBuy !== undefined
    ? Number(params.brokerageBuy)
    : getBrokerageRate(buyAmount);
  const buyBrokerage    = applyMinimumBrokerage(buyAmount, buyAmount * (buyBrokerageRate / 100));
  const buySebon        = buyAmount * (sebonRate / 100);
  const totalBuyCost    = buyAmount + buyBrokerage + buySebon;

  // SELL side
  const sellAmount        = shares * sellPrice;
  const sellBrokerageRate = params.brokerageSell !== undefined
    ? Number(params.brokerageSell)
    : getBrokerageRate(sellAmount);
  const sellBrokerage     = applyMinimumBrokerage(sellAmount, sellAmount * (sellBrokerageRate / 100));
  const sellSebon         = sellAmount * (sebonRate / 100);

  // CGT — only when there's a profit on the gross share gain
  const grossGain = sellAmount - buyAmount;
  let cgtRate = 0;
  if (params.holdingType === 'long') cgtRate = NEPSE_RATES.cgt.longTerm;
  else if (params.holdingType === 'institution') cgtRate = NEPSE_RATES.cgt.institution;
  else cgtRate = NEPSE_RATES.cgt.shortTerm;

  const cgtAmount = grossGain > 0 ? grossGain * (cgtRate / 100) : 0;

  // Final net
  const totalSellRevenue = sellAmount - sellBrokerage - sellSebon - dpCharge - cgtAmount;
  const netProfitLoss    = totalSellRevenue - totalBuyCost;
  const profitLossPct    = totalBuyCost > 0 ? (netProfitLoss / totalBuyCost) * 100 : 0;

  return {
    // buy
    buyAmount,
    buyBrokerageRate,
    buyBrokerage,
    buySebon,
    totalBuyCost,
    // sell
    sellAmount,
    sellBrokerageRate,
    sellBrokerage,
    sellSebon,
    dpCharge,
    cgtRate,
    cgtAmount,
    totalSellRevenue,
    // summary
    grossGain,
    netProfitLoss,
    profitLossPct,
    isProfit: netProfitLoss > 0
  };
}

/**
 * Brokerage-only calculator (for the Brokerage tab).
 * @param {number} amount
 * @param {number} [overrideRate]
 */
function calculateBrokerage(amount, overrideRate) {
  const rate = overrideRate !== undefined && overrideRate !== ''
    ? Number(overrideRate)
    : getBrokerageRate(amount);
  const sebon = amount * (NEPSE_RATES.sebonFee / 100);
  const brokerage = amount * (rate / 100);
  return {
    amount,
    rate,
    brokerage,
    sebon,
    total: brokerage + sebon
  };
}

/**
 * Capital Gains Tax-only calculator.
 * @param {number} buyTotal  - gross buy amount
 * @param {number} sellTotal - gross sell amount
 * @param {string} holdingType - 'short' | 'long' | 'institution'
 */
function calculateCGT(buyTotal, sellTotal, holdingType) {
  const gain = sellTotal - buyTotal;
  let rate = NEPSE_RATES.cgt.shortTerm;
  if (holdingType === 'long') rate = NEPSE_RATES.cgt.longTerm;
  else if (holdingType === 'institution') rate = NEPSE_RATES.cgt.institution;

  const tax = gain > 0 ? gain * (rate / 100) : 0;
  return { gain, rate, tax, isProfit: gain > 0 };
}

/**
 * Weighted Average Cost (WACC) for share purchases at multiple prices.
 * @param {Array<{shares:number, price:number}>} lots
 */
function calculateWACC(lots) {
  let totalShares = 0;
  let totalCost = 0;
  for (const lot of lots) {
    const s = Number(lot.shares);
    const p = Number(lot.price);
    if (s > 0 && p > 0) {
      totalShares += s;
      totalCost += s * p;
    }
  }
  return {
    totalShares,
    totalCost,
    wacc: totalShares > 0 ? totalCost / totalShares : 0
  };
}
