import test from 'node:test';
import assert from 'node:assert/strict';
import { aggregateHoldings, computeRebalance, computePortfolioDiagnostics } from '../web/js/engine.js';
import { ETF_UNIVERSE, HISTORICAL_DATES } from '../web/js/market-data.js';

const prices = { VTI: 200, VXUS: 50, BND: 100 };

test('aggregateHoldings merges same ticker across multiple accounts', () => {
  const res = aggregateHoldings([
    { account: 'IBKR', accountType: 'Taxable', ticker: 'VTI', shares: 10 },
    { account: 'Futu', accountType: 'Taxable', ticker: 'VTI', shares: 5 },
    { account: 'Schwab', accountType: 'Tax-Advantaged', ticker: 'BND', shares: 10 }
  ], prices);

  assert.equal(res.totalValue, 4000);
  const vti = res.items.find((i) => i.ticker === 'VTI');
  assert.equal(vti.shares, 15);
  assert.equal(vti.value, 3000);
  assert.equal(vti.currentWeightPct, 75);
});

test('computeRebalance buy-only never sells and conserves cash', () => {
  const res = computeRebalance({
    holdings: [
      { account: 'IBKR', accountType: 'Taxable', ticker: 'VTI', shares: 40 }, // 8000 (80%)
      { account: 'Schwab', accountType: 'Tax-Advantaged', ticker: 'BND', shares: 20 } // 2000 (20%)
    ],
    targets: { VTI: 50, BND: 50 },
    newCash: 2000,
    mode: 'buy-only',
    prices
  });

  assert.equal(res.ok, true);
  assert.equal(res.totalAllocatedSell, 0);
  assert.ok(Math.abs(res.totalAllocatedBuy - 2000) < 0.01);
  const bnd = res.rows.find((r) => r.ticker === 'BND');
  assert.equal(bnd.action, 'BUY');
  assert.ok(bnd.actionAmount > 1999);
});

test('computeRebalance rejects invalid target weights', () => {
  const res = computeRebalance({
    holdings: [],
    targets: { VTI: 60, BND: 30 },
    newCash: 1000,
    prices
  });
  assert.equal(res.ok, false);
  assert.equal(res.errorCode, 'INVALID_TARGET_WEIGHTS');
});

test('computeRebalance wholeSharesOnly floors shares and tracks leftover cash', () => {
  const res = computeRebalance({
    holdings: [],
    targets: { VTI: 100 },
    newCash: 550,
    mode: 'buy-only',
    wholeSharesOnly: true,
    prices
  });

  assert.equal(res.ok, true);
  assert.equal(res.rows[0].actionShares, 2);
  assert.equal(res.totalAllocatedBuy, 400);
  assert.equal(res.leftoverCash, 150);
});

test('computeRebalance full mode flags taxWarning on Taxable sell', () => {
  const res = computeRebalance({
    holdings: [
      { account: 'IBKR', accountType: 'Taxable', ticker: 'VTI', shares: 40 },
      { account: 'Schwab', accountType: 'Tax-Advantaged', ticker: 'BND', shares: 20 }
    ],
    targets: { VTI: 50, BND: 50 },
    newCash: 0,
    mode: 'full',
    driftThresholdPct: 2,
    prices
  });

  assert.equal(res.ok, true);
  const vti = res.rows.find((r) => r.ticker === 'VTI');
  assert.equal(vti.action, 'SELL');
  assert.equal(vti.taxWarning, true);
});

test('computePortfolioDiagnostics computes CAGR, MDD, Sharpe and correlation', () => {
  const diag = computePortfolioDiagnostics({ VTI: 60, VXUS: 20, BND: 20 }, ETF_UNIVERSE, HISTORICAL_DATES, 0.04);
  assert.ok(diag);
  assert.ok(diag.cagrPct > 5);
  assert.ok(diag.maxDrawdownPct < -10);
  assert.equal(diag.correlationMatrix.length, 3);
  assert.equal(diag.correlationMatrix[0][0], 1);
});
