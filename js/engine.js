/**
 * DriftPulse 量化核心引擎（纯函数，浏览器与 Node.js 测试共用）
 */

export function aggregateHoldings(holdings, prices = {}) {
  const byTicker = new Map();
  let totalValue = 0;

  for (const item of holdings) {
    const ticker = String(item.ticker || '').trim().toUpperCase();
    const shares = Number(item.shares);
    if (!ticker || !Number.isFinite(shares) || shares < 0) continue;

    const unitPrice = Number(item.price ?? prices[ticker] ?? 0);
    const value = shares * unitPrice;
    totalValue += value;

    if (!byTicker.has(ticker)) {
      byTicker.set(ticker, {
        ticker,
        shares: 0,
        price: unitPrice,
        value: 0,
        accounts: [],
        hasTaxable: false
      });
    }

    const entry = byTicker.get(ticker);
    entry.shares += shares;
    entry.value += value;
    if (unitPrice > 0) entry.price = unitPrice;
    if (item.accountType === 'Taxable') entry.hasTaxable = true;
    entry.accounts.push({
      account: item.account || 'Default',
      accountType: item.accountType || 'Taxable',
      shares,
      value
    });
  }

  const items = Array.from(byTicker.values()).map((entry) => ({
    ...entry,
    currentWeightPct: totalValue > 0 ? (entry.value / totalValue) * 100 : 0
  }));

  return { totalValue, items };
}

export function computeRebalance({
  holdings = [],
  targets = {},
  newCash = 0,
  mode = 'buy-only',
  driftThresholdPct = 2.0,
  wholeSharesOnly = false,
  prices = {}
}) {
  const cleanCash = Math.max(0, Number(newCash) || 0);
  const targetEntries = Object.entries(targets)
    .map(([t, w]) => [t.trim().toUpperCase(), Number(w) || 0])
    .filter(([, w]) => w > 0);

  const weightSum = targetEntries.reduce((acc, [, w]) => acc + w, 0);
  if (targetEntries.length === 0 || Math.abs(weightSum - 100) > 0.05) {
    return {
      ok: false,
      errorCode: 'INVALID_TARGET_WEIGHTS',
      weightSum
    };
  }

  const { totalValue, items } = aggregateHoldings(holdings, prices);
  const itemMap = new Map(items.map((i) => [i.ticker, i]));
  const allTickers = Array.from(new Set([...itemMap.keys(), ...targetEntries.map(([t]) => t)]));
  const targetMap = new Map(targetEntries);
  const postTotalValue = totalValue + cleanCash;

  const rows = allTickers.map((ticker) => {
    const existing = itemMap.get(ticker);
    const price = Number(existing?.price || prices[ticker] || 0);
    const currentValue = existing?.value || 0;
    const currentShares = existing?.shares || 0;
    const currentWeightPct = totalValue > 0 ? (currentValue / totalValue) * 100 : 0;
    const targetWeightPct = targetMap.get(ticker) || 0;
    const targetValue = (targetWeightPct / 100) * postTotalValue;
    const diffValue = targetValue - currentValue;

    return {
      ticker,
      price,
      currentShares,
      currentValue,
      currentWeightPct,
      targetWeightPct,
      driftPct: currentWeightPct - targetWeightPct,
      targetValue,
      diffValue,
      hasTaxable: existing?.hasTaxable ?? true,
      action: 'HOLD',
      actionAmount: 0,
      actionShares: 0,
      taxWarning: false
    };
  });

  if (mode === 'buy-only') {
    if (cleanCash > 0) {
      const deficits = rows.map((r) => Math.max(0, r.diffValue));
      const totalDeficit = deficits.reduce((a, b) => a + b, 0);

      rows.forEach((row, idx) => {
        if (totalDeficit <= 0) {
          row.actionAmount = (row.targetWeightPct / 100) * cleanCash;
        } else if (cleanCash <= totalDeficit) {
          row.actionAmount = (deficits[idx] / totalDeficit) * cleanCash;
        } else {
          const extra = cleanCash - totalDeficit;
          row.actionAmount = deficits[idx] + (row.targetWeightPct / 100) * extra;
        }
        row.action = row.actionAmount > 0.01 ? 'BUY' : 'HOLD';
      });
    }
  } else {
    rows.forEach((row) => {
      const absDrift = Math.abs(row.driftPct);
      const shouldAct = cleanCash > 0 || absDrift >= driftThresholdPct || (row.targetWeightPct === 0 && row.currentValue > 0);
      if (!shouldAct || Math.abs(row.diffValue) < 0.01) {
        row.action = 'HOLD';
        row.actionAmount = 0;
      } else if (row.diffValue > 0) {
        row.action = 'BUY';
        row.actionAmount = row.diffValue;
      } else {
        row.action = 'SELL';
        row.actionAmount = Math.abs(row.diffValue);
        row.taxWarning = row.hasTaxable;
      }
    });
  }

  let totalAllocatedBuy = 0;
  let totalAllocatedSell = 0;

  rows.forEach((row) => {
    if (row.price > 0 && row.action !== 'HOLD') {
      const rawShares = row.actionAmount / row.price;
      row.actionShares = wholeSharesOnly ? Math.floor(rawShares) : Number(rawShares.toFixed(4));
      row.actionAmount = wholeSharesOnly ? row.actionShares * row.price : row.actionAmount;
      if (row.actionShares === 0) {
        row.action = 'HOLD';
        row.actionAmount = 0;
        row.taxWarning = false;
      }
    }
    if (row.action === 'BUY') totalAllocatedBuy += row.actionAmount;
    if (row.action === 'SELL') totalAllocatedSell += row.actionAmount;

    const signedDelta = row.action === 'BUY' ? row.actionAmount : row.action === 'SELL' ? -row.actionAmount : 0;
    const projectedValue = row.currentValue + signedDelta;
    row.projectedWeightPct = postTotalValue > 0 ? (projectedValue / postTotalValue) * 100 : 0;
  });

  const leftoverCash = Math.max(0, cleanCash + totalAllocatedSell - totalAllocatedBuy);

  return {
    ok: true,
    mode,
    totalValue,
    newCash: cleanCash,
    postTotalValue,
    totalAllocatedBuy,
    totalAllocatedSell,
    leftoverCash,
    rows: rows.sort((a, b) => b.targetWeightPct - a.targetWeightPct || b.currentValue - a.currentValue)
  };
}

export function computePortfolioDiagnostics(targets, etfUniverse, dates, riskFreeRateAnnual = 0.04) {
  const entries = Object.entries(targets)
    .map(([t, w]) => [t.trim().toUpperCase(), Number(w) || 0])
    .filter(([t, w]) => w > 0 && etfUniverse[t]?.nav?.length === dates.length);

  const weightSum = entries.reduce((acc, [, w]) => acc + w, 0);
  if (entries.length === 0 || weightSum <= 0) {
    return null;
  }

  const normalized = entries.map(([t, w]) => ({ ticker: t, weight: w / weightSum, etf: etfUniverse[t] }));

  // 计算组合加权净值序列（初始 100）
  const portfolioNav = dates.map((_, idx) => {
    let val = 0;
    for (const item of normalized) {
      val += item.weight * item.etf.nav[idx];
    }
    return Number(val.toFixed(2));
  });

  // 计算水下回撤序列与最大回撤
  let peak = portfolioNav[0];
  let peakIdx = 0;
  let maxDrawdown = 0;
  let mddPeakDate = dates[0];
  let mddTroughDate = dates[0];

  const drawdowns = portfolioNav.map((val, idx) => {
    if (val > peak) {
      peak = val;
      peakIdx = idx;
    }
    const dd = (val - peak) / peak;
    if (dd < maxDrawdown) {
      maxDrawdown = dd;
      mddPeakDate = dates[peakIdx];
      mddTroughDate = dates[idx];
    }
    return Number((dd * 100).toFixed(2));
  });

  // 计算周期收益率（约季度步长，年化因子 4）
  const periodReturns = [];
  for (let i = 1; i < portfolioNav.length; i++) {
    periodReturns.push((portfolioNav[i] - portfolioNav[i - 1]) / portfolioNav[i - 1]);
  }
  const years = 6.75; // 2020-01 至 2026-10
  const totalReturn = (portfolioNav[portfolioNav.length - 1] / portfolioNav[0]) - 1;
  const cagr = Math.pow(1 + totalReturn, 1 / years) - 1;

  const meanRet = periodReturns.reduce((a, b) => a + b, 0) / periodReturns.length;
  const variance = periodReturns.reduce((a, b) => a + Math.pow(b - meanRet, 2), 0) / Math.max(1, periodReturns.length - 1);
  const annualVolatility = Math.sqrt(variance) * Math.sqrt(4);
  const sharpeRatio = annualVolatility > 0 ? (cagr - riskFreeRateAnnual) / annualVolatility : 0;

  const weightedExpenseRatio = normalized.reduce((acc, item) => acc + item.weight * item.etf.expenseRatio, 0);

  // 相关性矩阵
  const tickers = normalized.map((n) => n.ticker);
  const assetReturns = normalized.map((n) => {
    const rets = [];
    for (let i = 1; i < n.etf.nav.length; i++) {
      rets.push((n.etf.nav[i] - n.etf.nav[i - 1]) / n.etf.nav[i - 1]);
    }
    return rets;
  });

  const correlationMatrix = tickers.map((_, i) =>
    tickers.map((__, j) => (i === j ? 1 : Number(pearson(assetReturns[i], assetReturns[j]).toFixed(2))))
  );

  return {
    dates,
    portfolioNav,
    drawdowns,
    totalReturnPct: totalReturn * 100,
    cagrPct: cagr * 100,
    maxDrawdownPct: maxDrawdown * 100,
    mddPeakDate,
    mddTroughDate,
    annualVolatilityPct: annualVolatility * 100,
    sharpeRatio,
    weightedExpenseRatioPct: weightedExpenseRatio * 100,
    tickers,
    correlationMatrix
  };
}

function pearson(xs, ys) {
  const n = xs.length;
  if (n === 0) return 0;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < n; i++) {
    const a = xs[i] - mx;
    const b = ys[i] - my;
    num += a * b;
    dx += a * a;
    dy += b * b;
  }
  const denom = Math.sqrt(dx * dy);
  return denom === 0 ? 0 : num / denom;
}
