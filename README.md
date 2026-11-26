# DriftPulse（漂移脉搏）

面向华人与海外美股 ETF 投资者的**跨账户再平衡（Buy-Only 省税模式）与回撤诊断** Micro-SaaS。

- **100% 隐私优先**：所有持仓汇总、再平衡计算、回撤与相关性分析均在浏览器本地完成，无需绑定券商密码。
- **零外部依赖**：原生 ES Modules + 原生 SVG 图表，支持离线运行与 Cloudflare Pages / Vercel 零成本静态部署。

## 快速开始

```bash
# 运行全部单元测试
npm test

# 启动本地预览服务（默认 http://127.0.0.1:4173）
npm start
```

## 项目结构

- [docs/01-market-feasibility-report.md](docs/01-market-feasibility-report.md) — 市场调研、竞品定价与单位经济模型论证
- [docs/02-prd-and-architecture.md](docs/02-prd-and-architecture.md) — 产品需求文档与量化算法规范
- [docs/03-go-to-market-playbook.md](docs/03-go-to-market-playbook.md) — 30 天冷启动计划与中英双语推广物料
- [docs/04-account-and-launch-checklist.md](docs/04-account-and-launch-checklist.md) — 人工开户与 3 步上线清单（含 Creem 收款接入）
- `web/` — 完整中英双语 Web 应用与着陆页
- `tests/` — 量化引擎与 CSV 解析器单元测试
- `scripts/serve.mjs` — 本地静态预览服务器
