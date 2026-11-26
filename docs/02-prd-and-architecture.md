# DriftPulse 产品需求文档（PRD）与系统架构

## 1. MVP 核心功能模块
1. **跨账户持仓合并（Cross-Account Aggregation）**
   - 支持按账户录入持仓（如 `IBKR - Taxable`、`Schwab - Roth IRA`、`Futu - Margin`），区分 `Taxable` 与 `Tax-Advantaged`。
   - 按 ETF 代码（Ticker）自动汇总总市值、总份额、账户分布及当前权重。
   - 支持通用与常见券商 CSV 粘贴/文件导入。
2. **再平衡执行引擎（Rebalancing Engine）**
   - **Buy-Only 省税模式**：计算各 ETF 距离目标市值的正缺口 `deficit_i = max(0, targetWeight_i * (totalValue + newCash) - currentValue_i)`。按缺口比例分配 `newCash`；若 `newCash > sum(deficit)`，先填满所有缺口，剩余现金按目标权重分配。严格保证零卖出且 `sum(buy) <= newCash`。
   - **Full Rebalancing 全量模式**：支持设定漂移阈值 `driftThresholdPct`（低于阈值标记为 `HOLD`），若在 `Taxable` 账户触发卖出，自动标记 `taxWarning: true` 提示资本利得税与 Wash Sale 风险。
   - **整股/碎股切换**：开启 `wholeSharesOnly` 时向下取整股数并计算剩余找零现金 `leftoverCash`。
3. **组合回撤与风险诊断（Diagnostics）**
   - 计算组合加权历史净值曲线、总收益率、CAGR、最大回撤（Max Drawdown 含峰谷日期）、年化波动率、Sharpe Ratio（无风险利率假设 4%）、加权费率（Weighted Expense Ratio）及两两相关性矩阵。

## 2. 技术架构路线图
- **Phase 1（当前交付，\$0 运维成本）**：
  - 纯原生 ES Modules + HTML/CSS + 原生 SVG 图表，零外部 npm 运行时依赖。
  - 数据持久化于浏览器 `localStorage`，支持 Cloudflare Pages / Vercel 一键静态部署。
- **Phase 2（商业化扩展）**：
  - 接入 Creem Checkout + Webhook 验证 Pro 授权。
  - 增加 Cloudflare Workers 行情代理与 Resend 邮件漂移告警。
