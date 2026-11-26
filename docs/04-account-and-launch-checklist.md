# 人工开户与 3 步上线清单

除以下涉及**实名认证（KYC）、验证码与收款账户绑定**的环节需由你本人操作外，其余代码、文档与测试已全部就绪。

## 1. 最小化开户清单（按优先级排序）

| 优先级 | 平台 | 用途 | 费用 | 预计耗时与说明 |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **GitHub** (`github.com`) | 托管代码仓库，触发自动部署 | 免费 | 2 分钟，需邮箱与手机号验证 |
| **2** | **Cloudflare Pages**（推荐）或 **Vercel** | 静态网站托管与全球 CDN / HTTPS | 免费 | 3 分钟，直接用 GitHub 授权登录即可 |
| **3** | **域名注册**（Cloudflare Registrar / Porkbun） | 绑定正式独立域名 | 约 \$10/年 | 备选域名：`driftpulse.app`、`driftpulse.io`、`etfpulse.app`、`rebalance.plus`、`buyonly.io` |
| **4** | **Creem** (`creem.io`) — **首选美元收款 MoR** | 全球信用卡/Apple Pay 收款，自动处理全球 VAT/GST | **3.9% + \$0.40/笔** | 10–15 分钟，支持亚洲/中国独立开发者（支持支付宝/跨境提现），零起量门槛 |
| **备选** | **Paddle** (`paddle.com`) | 备选全球 MoR 收款 | 5% + \$0.50/笔 | 审核较严格，适合已有成熟网站后备选 |
| **可选** | **Resend** (`resend.com`) | Phase 2 发送组合漂移邮件提醒 | 免费（3,000 封/月） | 2 分钟，上线后再按需接入 |

> **重要避坑提示**：**不要注册 Lemon Squeezy**。Lemon Squeezy 已被 Stripe 收购并已停止新店注册且逐步关停，请直接使用 **Creem**（首选）或 **Paddle**。

## 2. 开户完成后的 3 步上线指南

1. **推送代码到 GitHub 并绑定 Cloudflare Pages / Vercel**：
   - 将 `/Users/victor/.gemini/antigravity/scratch/driftpulse` 推送至你的 GitHub 仓库。
   - 在 Cloudflare Pages（或 Vercel）中导入该仓库，构建命令留空，输出目录填 `web`。
2. **在 Creem 创建商品并填入 Checkout 链接**：
   - 在 Creem 后台创建两个订阅商品：`DriftPulse Pro Monthly ($9/mo)` 与 `DriftPulse Pro Annual ($79/yr)`。
   - 打开 [web/js/config.js](file:///Users/victor/.gemini/antigravity/scratch/driftpulse/web/js/config.js)，将 `creemMonthlyUrl` 和 `creemAnnualUrl` 替换为你的真实 Checkout URL。
3. **验证上线**：
   - 访问你的自定义域名，确认中英切换、CSV 导入、Buy-Only 再平衡与 Pro 按钮跳转正常，即可按 [docs/03-go-to-market-playbook.md](file:///Users/victor/.gemini/antigravity/scratch/driftpulse/docs/03-go-to-market-playbook.md) 开始冷启动发帖。
