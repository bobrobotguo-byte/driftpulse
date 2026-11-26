// 2020-01 至 2026-10 季度/关键节点高保真净值序列（含 2020 疫情回撤、2022 股债双杀、2023-2026 走势）
export const HISTORICAL_DATES = [
  '2020-01', '2020-03', '2020-06', '2020-09', '2020-12',
  '2021-03', '2021-06', '2021-09', '2021-12',
  '2022-03', '2022-06', '2022-09', '2022-12',
  '2023-03', '2023-06', '2023-09', '2023-12',
  '2024-03', '2024-06', '2024-09', '2024-12',
  '2025-03', '2025-06', '2025-09', '2025-12',
  '2026-03', '2026-06', '2026-10'
];

export const ETF_UNIVERSE = {
  VOO: {
    ticker: 'VOO',
    nameZh: '标普 500 ETF',
    nameEn: 'Vanguard S&P 500 ETF',
    category: 'US Equity',
    price: 548.20,
    expenseRatio: 0.0003,
    nav: [100, 80.2, 96.4, 104.8, 117.5, 124.6, 135.1, 135.8, 150.7, 143.5, 120.4, 114.5, 123.1, 132.2, 143.6, 138.9, 155.3, 171.4, 178.6, 188.9, 193.5, 189.2, 204.8, 214.1, 223.4, 229.8, 238.5, 246.2]
  },
  VTI: {
    ticker: 'VTI',
    nameZh: '全美股市 ETF',
    nameEn: 'Vanguard Total Stock Market ETF',
    category: 'US Equity',
    price: 294.60,
    expenseRatio: 0.0003,
    nav: [100, 79.1, 96.8, 105.5, 119.8, 127.4, 137.8, 137.6, 150.2, 142.1, 118.4, 113.0, 121.0, 129.8, 140.5, 135.8, 152.1, 167.2, 173.0, 183.5, 188.4, 183.7, 198.9, 207.8, 216.9, 222.5, 231.0, 238.4]
  },
  QQQ: {
    ticker: 'QQQ',
    nameZh: '纳斯达克 100 ETF',
    nameEn: 'Invesco QQQ Trust',
    category: 'US Tech',
    price: 518.40,
    expenseRatio: 0.0020,
    nav: [100, 86.5, 112.4, 126.2, 142.8, 145.2, 161.4, 162.8, 181.5, 165.0, 128.1, 122.4, 121.8, 146.5, 169.0, 163.8, 188.2, 204.1, 220.4, 224.8, 235.6, 226.4, 251.2, 266.0, 279.5, 288.4, 302.1, 314.8]
  },
  VXUS: {
    ticker: 'VXUS',
    nameZh: '非美全球股市 ETF',
    nameEn: 'Vanguard Total International Stock ETF',
    category: 'Intl Equity',
    price: 64.15,
    expenseRatio: 0.0007,
    nav: [100, 76.8, 89.5, 95.1, 111.2, 115.4, 121.8, 118.2, 120.4, 113.2, 98.5, 88.2, 100.8, 107.4, 110.1, 106.2, 116.5, 121.4, 122.6, 132.1, 123.5, 127.8, 134.2, 137.9, 141.0, 143.6, 146.8, 149.5]
  },
  SCHD: {
    ticker: 'SCHD',
    nameZh: '美股红利价值 ETF',
    nameEn: 'Schwab U.S. Dividend Equity ETF',
    category: 'Dividend',
    price: 29.45,
    expenseRatio: 0.0006,
    nav: [100, 78.4, 89.2, 96.5, 114.6, 128.5, 135.2, 133.4, 148.2, 146.8, 134.1, 127.8, 143.2, 139.5, 141.2, 139.0, 148.5, 158.6, 156.2, 169.4, 168.1, 166.5, 173.8, 179.2, 184.6, 188.9, 193.4, 198.2]
  },
  BND: {
    ticker: 'BND',
    nameZh: '美国综合债券 ETF',
    nameEn: 'Vanguard Total Bond Market ETF',
    category: 'Bonds',
    price: 73.80,
    expenseRatio: 0.0003,
    nav: [100, 101.2, 104.5, 105.1, 106.2, 102.6, 104.4, 104.3, 104.1, 97.9, 93.4, 89.0, 90.4, 93.2, 92.4, 89.5, 95.3, 94.6, 94.8, 99.6, 96.6, 98.8, 99.9, 101.4, 102.8, 103.5, 104.9, 106.1]
  },
  TLT: {
    ticker: 'TLT',
    nameZh: '20年+美债 ETF',
    nameEn: 'iShares 20+ Year Treasury Bond ETF',
    category: 'Long Bonds',
    price: 92.40,
    expenseRatio: 0.0015,
    nav: [100, 114.8, 115.2, 115.4, 112.1, 97.4, 103.6, 103.8, 106.8, 95.6, 83.2, 74.8, 73.2, 78.8, 76.9, 67.8, 75.1, 72.1, 70.6, 76.2, 68.8, 71.4, 70.2, 72.6, 74.1, 75.8, 77.2, 78.5]
  },
  GLD: {
    ticker: 'GLD',
    nameZh: '黄金 ETF',
    nameEn: 'SPDR Gold Shares',
    category: 'Gold',
    price: 248.90,
    expenseRatio: 0.0040,
    nav: [100, 103.8, 115.4, 122.1, 123.5, 110.8, 115.2, 114.0, 118.8, 126.4, 117.5, 108.1, 118.2, 128.4, 124.9, 120.2, 134.1, 144.6, 151.2, 171.4, 170.8, 189.2, 198.4, 206.5, 214.0, 218.6, 224.2, 231.5]
  },
  SGOV: {
    ticker: 'SGOV',
    nameZh: '0-3月超短美债 ETF',
    nameEn: 'iShares 0-3 Month Treasury Bond ETF',
    category: 'Cash',
    price: 100.45,
    expenseRatio: 0.0009,
    nav: [100, 100.3, 100.4, 100.4, 100.5, 100.5, 100.5, 100.5, 100.6, 100.7, 101.0, 101.6, 102.6, 103.8, 105.1, 106.5, 107.9, 109.3, 110.8, 112.3, 113.6, 114.8, 116.0, 117.1, 118.2, 119.2, 120.2, 121.3]
  },
  VT: {
    ticker: 'VT',
    nameZh: '全球股市 ETF',
    nameEn: 'Vanguard Total World Stock ETF',
    category: 'Global Equity',
    price: 121.30,
    expenseRatio: 0.0007,
    nav: [100, 78.5, 93.8, 101.4, 116.2, 122.1, 131.0, 129.4, 137.8, 130.2, 110.4, 102.6, 112.4, 120.5, 128.2, 123.6, 136.8, 147.8, 151.9, 161.8, 160.2, 158.9, 170.4, 177.2, 183.6, 188.1, 194.2, 199.8]
  },
  SMH: {
    ticker: 'SMH',
    nameZh: '半导体 ETF',
    nameEn: 'VanEck Semiconductor ETF',
    category: 'Sector Tech',
    price: 256.80,
    expenseRatio: 0.0035,
    nav: [100, 84.2, 109.5, 125.4, 154.2, 172.8, 186.4, 188.2, 224.6, 192.4, 142.8, 131.5, 145.8, 186.2, 214.5, 206.8, 250.4, 312.6, 368.4, 348.2, 354.6, 326.8, 378.4, 402.1, 424.5, 442.0, 468.2, 486.4]
  },
  VGT: {
    ticker: 'VGT',
    nameZh: '美股信息技术 ETF',
    nameEn: 'Vanguard Information Technology ETF',
    category: 'US Tech',
    price: 622.10,
    expenseRatio: 0.0010,
    nav: [100, 84.8, 110.2, 123.6, 143.2, 146.8, 163.5, 165.2, 186.4, 166.8, 129.4, 122.1, 129.8, 156.4, 178.2, 172.5, 198.4, 218.6, 238.2, 241.5, 256.4, 244.8, 272.6, 289.4, 304.2, 314.8, 329.5, 342.6]
  }
};

export const PRESET_PORTFOLIOS = {
  bogleheads: {
    id: 'bogleheads',
    nameZh: '经典三基金 (60/20/20)',
    nameEn: 'Bogleheads 3-Fund (60/20/20)',
    newCash: 2500,
    holdings: [
      { account: 'IBKR - Taxable', accountType: 'Taxable', ticker: 'VTI', shares: 48 },
      { account: 'IBKR - Taxable', accountType: 'Taxable', ticker: 'VXUS', shares: 82 },
      { account: 'Schwab - Roth IRA', accountType: 'Tax-Advantaged', ticker: 'BND', shares: 92 },
      { account: 'Futu - Margin', accountType: 'Taxable', ticker: 'VTI', shares: 15 }
    ],
    targets: { VTI: 60, VXUS: 20, BND: 20 }
  },
  techDividend: {
    id: 'techDividend',
    nameZh: '科技成长 + 红利防守',
    nameEn: 'Tech Growth + Dividend Defense',
    newCash: 3000,
    holdings: [
      { account: 'IBKR - Taxable', accountType: 'Taxable', ticker: 'VOO', shares: 30 },
      { account: 'Futu - Margin', accountType: 'Taxable', ticker: 'QQQ', shares: 22 },
      { account: 'Schwab - Roth IRA', accountType: 'Tax-Advantaged', ticker: 'SCHD', shares: 210 },
      { account: 'IBKR - Taxable', accountType: 'Taxable', ticker: 'SGOV', shares: 35 }
    ],
    targets: { VOO: 40, QQQ: 30, SCHD: 20, SGOV: 10 }
  },
  allWeather: {
    id: 'allWeather',
    nameZh: '全天候风险平价',
    nameEn: 'All-Weather Risk Parity',
    newCash: 2000,
    holdings: [
      { account: 'IBKR - Taxable', accountType: 'Taxable', ticker: 'VTI', shares: 35 },
      { account: 'Schwab - IRA', accountType: 'Tax-Advantaged', ticker: 'TLT', shares: 110 },
      { account: 'Schwab - IRA', accountType: 'Tax-Advantaged', ticker: 'BND', shares: 65 },
      { account: 'Futu - Margin', accountType: 'Taxable', ticker: 'GLD', shares: 18 }
    ],
    targets: { VTI: 30, TLT: 40, BND: 15, GLD: 15 }
  }
};
