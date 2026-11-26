/**
 * 通用与常见券商 CSV 持仓解析器
 */

const HEADER_ALIASES = {
  account: ['account', 'account name', 'broker', '账户', '账号'],
  accountType: ['account type', 'type', 'tax status', '账户类型'],
  ticker: ['ticker', 'symbol', 'etf', 'code', '代码', '标的代码'],
  shares: ['shares', 'quantity', 'qty', 'position', '持仓数量', '股数'],
  price: ['price', 'market price', 'last price', '现价', '价格']
};

function normalizeHeader(cell) {
  return String(cell || '').trim().toLowerCase().replace(/["']/g, '');
}

function matchColumn(headers, aliases) {
  return headers.findIndex((h) => aliases.includes(h));
}

export function parseBrokerCSV(csvText) {
  const lines = String(csvText || '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    return { holdings: [], warnings: ['EMPTY_OR_NO_ROWS'] };
  }

  const headers = lines[0].split(',').map(normalizeHeader);
  const tickerIdx = matchColumn(headers, HEADER_ALIASES.ticker);
  const sharesIdx = matchColumn(headers, HEADER_ALIASES.shares);
  const accountIdx = matchColumn(headers, HEADER_ALIASES.account);
  const accountTypeIdx = matchColumn(headers, HEADER_ALIASES.accountType);
  const priceIdx = matchColumn(headers, HEADER_ALIASES.price);

  if (tickerIdx === -1 || sharesIdx === -1) {
    return { holdings: [], warnings: ['MISSING_REQUIRED_COLUMNS'] };
  }

  const holdings = [];
  const warnings = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
    const rawTicker = (cols[tickerIdx] || '').toUpperCase();
    const rawShares = Number(cols[sharesIdx]);

    if (!rawTicker || rawTicker === 'TOTAL' || rawTicker === 'CASH' || !Number.isFinite(rawShares) || rawShares <= 0) {
      warnings.push(`SKIPPED_ROW_${i + 1}`);
      continue;
    }

    const rawAccount = accountIdx !== -1 && cols[accountIdx] ? cols[accountIdx] : 'Imported Account';
    const rawType = accountTypeIdx !== -1 && /ira|roth|401k|tax-adv|免税/i.test(cols[accountTypeIdx] || '')
      ? 'Tax-Advantaged'
      : 'Taxable';
    const rawPrice = priceIdx !== -1 ? Number(cols[priceIdx]) : undefined;

    holdings.push({
      account: rawAccount,
      accountType: rawType,
      ticker: rawTicker,
      shares: rawShares,
      ...(Number.isFinite(rawPrice) && rawPrice > 0 ? { price: rawPrice } : {})
    });
  }

  return { holdings, warnings };
}
