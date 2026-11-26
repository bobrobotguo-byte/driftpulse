import { CONFIG } from './config.js';
import { ETF_UNIVERSE, HISTORICAL_DATES, PRESET_PORTFOLIOS } from './market-data.js';
import { computeRebalance, computePortfolioDiagnostics } from './engine.js';
import { parseBrokerCSV } from './csv-parser.js';
import { I18N } from './i18n.js';
import { renderLineChart, renderCorrelationMatrix } from './charts.js';

const priceMap = Object.fromEntries(Object.entries(ETF_UNIVERSE).map(([k, v]) => [k, v.price]));

const defaultPreset = PRESET_PORTFOLIOS.bogleheads;
let state = loadState() || {
  lang: 'zh',
  holdings: structuredClone(defaultPreset.holdings),
  targets: structuredClone(defaultPreset.targets),
  newCash: defaultPreset.newCash,
  mode: 'buy-only',
  driftThresholdPct: 2,
  wholeSharesOnly: false
};

const els = {
  langToggle: document.getElementById('langToggle'),
  presetButtons: document.getElementById('presetButtons'),
  holdingsBody: document.getElementById('holdingsBody'),
  weightAlert: document.getElementById('weightAlert'),
  newCashInput: document.getElementById('newCashInput'),
  modeBuyOnlyBtn: document.getElementById('modeBuyOnlyBtn'),
  modeFullBtn: document.getElementById('modeFullBtn'),
  thresholdInput: document.getElementById('thresholdInput'),
  wholeSharesInput: document.getElementById('wholeSharesInput'),
  rebalanceBody: document.getElementById('rebalanceBody'),
  rebalanceSummary: document.getElementById('rebalanceSummary'),
  kpiCagr: document.getElementById('kpiCagr'),
  kpiMdd: document.getElementById('kpiMdd'),
  kpiMddRange: document.getElementById('kpiMddRange'),
  kpiSharpe: document.getElementById('kpiSharpe'),
  kpiEr: document.getElementById('kpiEr'),
  navChart: document.getElementById('navChart'),
  ddChart: document.getElementById('ddChart'),
  corrMatrix: document.getElementById('corrMatrix'),
  addRowBtn: document.getElementById('addRowBtn'),
  normalizeBtn: document.getElementById('normalizeBtn'),
  openCsvBtn: document.getElementById('openCsvBtn'),
  csvModal: document.getElementById('csvModal'),
  csvTextarea: document.getElementById('csvTextarea'),
  csvCancelBtn: document.getElementById('csvCancelBtn'),
  csvApplyBtn: document.getElementById('csvApplyBtn'),
  copyMdBtn: document.getElementById('copyMdBtn'),
  proUpgradeBtn: document.getElementById('proUpgradeBtn')
};

function loadState() {
  try {
    const raw = localStorage.getItem(CONFIG.storageKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveState() {
  try {
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(state));
  } catch {
    // 忽略隐私模式存储限制
  }
}

function t(key) {
  return I18N[state.lang][key] || key;
}

function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (I18N[state.lang][key]) {
      el.textContent = I18N[state.lang][key];
    }
  });
  renderPresets();
}

function renderPresets() {
  els.presetButtons.innerHTML = Object.values(PRESET_PORTFOLIOS)
    .map((p) => `<button class="btn btn-secondary preset-btn" data-preset="${p.id}" type="button">${state.lang === 'zh' ? p.nameZh : p.nameEn}</button>`)
    .join('');

  els.presetButtons.querySelectorAll('.preset-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const p = PRESET_PORTFOLIOS[btn.dataset.preset];
      state.holdings = structuredClone(p.holdings);
      state.targets = structuredClone(p.targets);
      state.newCash = p.newCash;
      els.newCashInput.value = p.newCash;
      renderAll();
    });
  });
}

function renderHoldings() {
  const tickerOptions = Object.keys(ETF_UNIVERSE);
  els.holdingsBody.innerHTML = state.holdings
    .map((h, idx) => {
      const price = h.price ?? priceMap[h.ticker] ?? 0;
      const val = (Number(h.shares) || 0) * price;
      const targetVal = state.targets[h.ticker] ?? 0;
      const optionsHtml = tickerOptions
        .map((tk) => `<option value="${tk}" ${tk === h.ticker ? 'selected' : ''}>${tk}</option>`)
        .join('');

      return `
        <tr data-idx="${idx}">
          <td><input class="inp-account" value="${h.account}" /></td>
          <td>
            <select class="inp-type">
              <option value="Taxable" ${h.accountType === 'Taxable' ? 'selected' : ''}>Taxable</option>
              <option value="Tax-Advantaged" ${h.accountType === 'Tax-Advantaged' ? 'selected' : ''}>Tax-Advantaged</option>
            </select>
          </td>
          <td><select class="inp-ticker">${optionsHtml}</select></td>
          <td><input class="inp-shares" type="number" min="0" step="0.01" value="${h.shares}" /></td>
          <td>$${val.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
          <td><input class="inp-target" type="number" min="0" max="100" step="1" value="${targetVal}" /></td>
          <td><button class="btn btn-ghost btn-del" type="button">×</button></td>
        </tr>
      `;
    })
    .join('');

  els.holdingsBody.querySelectorAll('tr').forEach((tr) => {
    const idx = Number(tr.dataset.idx);
    tr.querySelector('.inp-account').addEventListener('change', (e) => {
      state.holdings[idx].account = e.target.value;
      saveState();
    });
    tr.querySelector('.inp-type').addEventListener('change', (e) => {
      state.holdings[idx].accountType = e.target.value;
      renderRebalance();
    });
    tr.querySelector('.inp-ticker').addEventListener('change', (e) => {
      const newTicker = e.target.value;
      state.holdings[idx].ticker = newTicker;
      if (state.targets[newTicker] === undefined) state.targets[newTicker] = 0;
      renderAll();
    });
    tr.querySelector('.inp-shares').addEventListener('input', (e) => {
      state.holdings[idx].shares = Number(e.target.value) || 0;
      renderAll();
    });
    tr.querySelector('.inp-target').addEventListener('change', (e) => {
      const tk = state.holdings[idx].ticker;
      state.targets[tk] = Number(e.target.value) || 0;
      renderAll();
    });
    tr.querySelector('.btn-del').addEventListener('click', () => {
      state.holdings.splice(idx, 1);
      renderAll();
    });
  });
}

function renderRebalance() {
  const result = computeRebalance({
    holdings: state.holdings,
    targets: state.targets,
    newCash: state.newCash,
    mode: state.mode,
    driftThresholdPct: state.driftThresholdPct,
    wholeSharesOnly: state.wholeSharesOnly,
    prices: priceMap
  });

  if (!result.ok) {
    els.weightAlert.textContent = t('weightError').replace('{sum}', result.weightSum.toFixed(1));
    els.weightAlert.classList.remove('hidden');
    els.rebalanceBody.innerHTML = '';
    els.rebalanceSummary.textContent = '';
    return;
  }

  els.weightAlert.classList.add('hidden');
  els.rebalanceBody.innerHTML = result.rows
    .map((r) => {
      const badgeCls = r.action === 'BUY' ? 'badge-buy' : r.action === 'SELL' ? 'badge-sell' : 'badge-hold';
      const warnHtml = r.taxWarning ? `<span class="badge badge-warn" title="${t('taxWarningTip')}">Tax!</span>` : '';
      const driftSign = r.driftPct > 0 ? '+' : '';
      return `
        <tr>
          <td><strong>${r.ticker}</strong></td>
          <td><span class="badge ${badgeCls}">${r.action}</span>${warnHtml}</td>
          <td>$${r.actionAmount.toFixed(2)}</td>
          <td>${r.actionShares}</td>
          <td class="${Math.abs(r.driftPct) >= state.driftThresholdPct ? 'neg' : 'muted'}">${driftSign}${r.driftPct.toFixed(2)}%</td>
          <td>${r.projectedWeightPct.toFixed(1)}% <span class="muted">(${r.targetWeightPct}%)</span></td>
        </tr>
      `;
    })
    .join('');

  els.rebalanceSummary.textContent =
    state.lang === 'zh'
      ? `当前总市值：$${result.totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })} ｜ 计划买入：$${result.totalAllocatedBuy.toFixed(2)} ｜ 计划卖出：$${result.totalAllocatedSell.toFixed(2)} ｜ 剩余现金：$${result.leftoverCash.toFixed(2)}`
      : `Current Value: $${result.totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })} | Buy: $${result.totalAllocatedBuy.toFixed(2)} | Sell: $${result.totalAllocatedSell.toFixed(2)} | Leftover Cash: $${result.leftoverCash.toFixed(2)}`;
}

function renderDiagnostics() {
  const diag = computePortfolioDiagnostics(state.targets, ETF_UNIVERSE, HISTORICAL_DATES, CONFIG.riskFreeRateAnnual);
  if (!diag) return;

  els.kpiCagr.textContent = `${diag.cagrPct.toFixed(2)}%`;
  els.kpiMdd.textContent = `${diag.maxDrawdownPct.toFixed(2)}%`;
  els.kpiMddRange.textContent = `${diag.mddPeakDate} → ${diag.mddTroughDate}`;
  els.kpiSharpe.textContent = diag.sharpeRatio.toFixed(2);
  els.kpiEr.textContent = `${diag.weightedExpenseRatioPct.toFixed(3)}%`;

  renderLineChart(els.navChart, { dates: diag.dates, values: diag.portfolioNav, color: '#3b82f6', fill: 'rgba(59,130,246,0.12)' });
  renderLineChart(els.ddChart, { dates: diag.dates, values: diag.drawdowns, color: '#ef4444', fill: 'rgba(239,68,68,0.14)', suffix: '%' });
  renderCorrelationMatrix(els.corrMatrix, { tickers: diag.tickers, matrix: diag.correlationMatrix });
}

function renderAll() {
  saveState();
  applyI18n();
  renderHoldings();
  renderRebalance();
  renderDiagnostics();
}

// 事件绑定
els.langToggle.addEventListener('click', () => {
  state.lang = state.lang === 'zh' ? 'en' : 'zh';
  renderAll();
});

els.newCashInput.addEventListener('input', (e) => {
  state.newCash = Math.max(0, Number(e.target.value) || 0);
  saveState();
  renderRebalance();
});

els.thresholdInput.addEventListener('input', (e) => {
  state.driftThresholdPct = Math.max(0, Number(e.target.value) || 0);
  saveState();
  renderRebalance();
});

els.wholeSharesInput.addEventListener('change', (e) => {
  state.wholeSharesOnly = e.target.checked;
  saveState();
  renderRebalance();
});

els.modeBuyOnlyBtn.addEventListener('click', () => {
  state.mode = 'buy-only';
  els.modeBuyOnlyBtn.classList.add('active');
  els.modeFullBtn.classList.remove('active');
  saveState();
  renderRebalance();
});

els.modeFullBtn.addEventListener('click', () => {
  state.mode = 'full';
  els.modeFullBtn.classList.add('active');
  els.modeBuyOnlyBtn.classList.remove('active');
  saveState();
  renderRebalance();
});

els.addRowBtn.addEventListener('click', () => {
  state.holdings.push({ account: 'IBKR - Taxable', accountType: 'Taxable', ticker: 'VOO', shares: 10 });
  if (state.targets.VOO === undefined) state.targets.VOO = 0;
  renderAll();
});

els.normalizeBtn.addEventListener('click', () => {
  const activeTickers = Array.from(new Set(state.holdings.map((h) => h.ticker)));
  const sum = activeTickers.reduce((acc, tk) => acc + (Number(state.targets[tk]) || 0), 0);
  if (sum <= 0) return;
  const nextTargets = {};
  let running = 0;
  activeTickers.forEach((tk, idx) => {
    if (idx === activeTickers.length - 1) {
      nextTargets[tk] = Math.max(0, Number((100 - running).toFixed(1)));
    } else {
      const val = Number((((Number(state.targets[tk]) || 0) / sum) * 100).toFixed(1));
      nextTargets[tk] = val;
      running += val;
    }
  });
  state.targets = nextTargets;
  renderAll();
});

els.openCsvBtn.addEventListener('click', () => els.csvModal.classList.remove('hidden'));
els.csvCancelBtn.addEventListener('click', () => els.csvModal.classList.add('hidden'));
els.csvApplyBtn.addEventListener('click', () => {
  const { holdings } = parseBrokerCSV(els.csvTextarea.value);
  if (holdings.length > 0) {
    state.holdings = holdings;
    const eqWeight = Number((100 / new Set(holdings.map((h) => h.ticker)).size).toFixed(1));
    state.targets = {};
    holdings.forEach((h) => {
      if (state.targets[h.ticker] === undefined) state.targets[h.ticker] = eqWeight;
    });
    renderAll();
  }
  els.csvModal.classList.add('hidden');
});

els.copyMdBtn.addEventListener('click', async () => {
  const res = computeRebalance({
    holdings: state.holdings,
    targets: state.targets,
    newCash: state.newCash,
    mode: state.mode,
    driftThresholdPct: state.driftThresholdPct,
    wholeSharesOnly: state.wholeSharesOnly,
    prices: priceMap
  });
  if (!res.ok) return;
  const lines = ['| Ticker | Action | Amount | Shares |', '| --- | --- | ---: | ---: |'];
  res.rows.forEach((r) => lines.push(`| ${r.ticker} | ${r.action} | $${r.actionAmount.toFixed(2)} | ${r.actionShares} |`));
  await navigator.clipboard?.writeText(lines.join('\n')).catch(() => {});
  const old = els.copyMdBtn.textContent;
  els.copyMdBtn.textContent = t('copied');
  setTimeout(() => { els.copyMdBtn.textContent = old; }, 1500);
});

els.proUpgradeBtn.addEventListener('click', () => {
  if (CONFIG.pricing.creemMonthlyUrl) {
    window.open(CONFIG.pricing.creemMonthlyUrl, '_blank', 'noopener');
  } else {
    alert(
      state.lang === 'zh'
        ? '尚未配置 Creem Checkout 链接：请按 docs/04-account-and-launch-checklist.md 开立 Creem 账号并填入 web/js/config.js。'
        : 'Creem Checkout URL not configured yet. See docs/04-account-and-launch-checklist.md.'
    );
  }
});

// 初始化控件值并首次渲染
els.newCashInput.value = state.newCash;
els.thresholdInput.value = state.driftThresholdPct;
els.wholeSharesInput.checked = state.wholeSharesOnly;
renderAll();
