export const CONFIG = {
  brandName: 'DriftPulse',
  brandTaglineZh: '跨账户 ETF 权重偏离与回撤计算器',
  brandTaglineEn: 'Cross-Account ETF Drift & Drawdown Calculator',
  pricing: {
    monthlyUsd: 9,
    annualUsd: 79,
    // 后续接通 Stripe Payment Link 后填入此处即可一键切换为 Stripe 订阅收款
    stripeMonthlyUrl: '',
    stripeAnnualUrl: '',
    // 可选：Ko-fi / Gumroad 离线模板或赞赏链接
    templateOrSupportUrl: ''
  },
  supportEmail: 'bobrobotguo@gmail.com',
  riskFreeRateAnnual: 0.04,
  storageKey: 'driftpulse_state_v1'
};
