# 🔍 Creem支付设置检查清单

## 📋 准备工作
- [ ] 阅读完整的设置指南 (`CREEM_SETUP_GUIDE.md`)
- [ ] 确保有Google账户用于测试登录
- [ ] 准备好接收邮件的邮箱

## 步骤1: Creem账户设置
- [ ] 访问 [creem.io](https://creem.io) 并注册账户
- [ ] 完成邮箱验证
- [ ] 登录到控制台
- [ ] 在 Settings → API Keys 创建API密钥
- [ ] 复制并保存API密钥 (格式: `creem_xxxxxxxxx`)
- [ ] 在 Settings → Webhooks 创建webhook端点
- [ ] 复制并保存Webhook Secret

## 步骤2: 创建产品
### Pro产品
- [ ] 创建 "GoTaskMind Pro Monthly" ($8/月)
- [ ] 复制产品ID (格式: `prod_xxxxxxxxx`)
- [ ] 创建 "GoTaskMind Pro Annual" ($88/年)
- [ ] 复制产品ID

## 步骤3: 环境配置
- [ ] 复制 `.env.example` 到 `.env.local`
- [ ] 添加 `CREEM_API_KEY=你的API密钥`
- [ ] 添加 `CREEM_WEBHOOK_SECRET=你的webhook密钥`
- [ ] 添加2个产品ID配置 (Pro月付和年付)
- [ ] 验证所有变量都已正确设置

## 步骤4: Webhook配置
- [ ] 设置开发环境webhook: `http://localhost:3000/api/payment/webhook`
- [ ] 启用所有必需的事件类型:
  - [ ] checkout.completed
  - [ ] payment.succeeded
  - [ ] payment.failed
  - [ ] subscription.created
  - [ ] subscription.canceled
- [ ] 测试webhook连接
- [ ] 如果本地测试失败，使用ngrok创建公网URL

## 步骤5: 测试支付流程
- [ ] 启动开发服务器: `npm run dev`
- [ ] 访问: `http://localhost:3000/pricing`
- [ ] 测试未登录用户流程 (应该先跳转登录)
- [ ] 测试已登录用户流程
- [ ] 使用测试卡完成支付: `4242 4242 4242 4242`
- [ ] 验证支付成功页面正常显示
- [ ] 检查订单信息是否正确

## 🎯 最终验证
- [ ] 所有定价计划正确显示
- [ ] Free计划 ($0) 显示"Get Started"
- [ ] Pro计划显示$8/月和$88/年的定价
- [ ] 支付按钮根据登录状态显示不同文字
- [ ] 支付流程完整无错误
- [ ] 成功页面显示正确信息

## 🚨 常见问题检查
如果遇到问题，检查以下项目:
- [ ] API密钥格式正确 (以creem_开头)
- [ ] 产品ID格式正确 (以prod_开头)
- [ ] 环境变量没有多余空格
- [ ] 端口3000没有被占用 (确保与 .env.local 中配置一致)
- [ ] 网络连接正常
- [ ] 浏览器没有阻止弹窗
- [ ] 支付验证失败时检查开发环境设置

## 🐛 支付验证失败故障排除

### 1. 检查端口配置
```bash
# 确保 .env.local 中的端口配置正确
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
```

### 2. 使用测试脚本
```bash
# 在浏览器控制台运行测试脚本
node test-payment-debug.js
# 或在浏览器控制台访问 /payment/success?session_id=test123&plan_id=pro-monthly
```

### 3. 查看服务器日志
```bash
# 启动开发服务器并观察日志输出
npm run dev
# 查找 "支付验证" 相关的日志信息
```

### 4. 验证环境变量
```bash
# 确认以下变量已正确设置
CREEM_API_KEY=creem_test_*
CREEM_WEBHOOK_SECRET=whsec_*
CREEM_PRO_MONTHLY_PRODUCT_ID=prod_*
CREEM_PRO_ANNUAL_PRODUCT_ID=prod_*
```

## 📞 需要帮助？
- 查看 `CREEM_SETUP_GUIDE.md` 获取详细说明
- 检查浏览器控制台的错误信息 (F12 → Console)
- 查看终端中的服务器日志
- 运行 `test-payment-debug.js` 进行系统诊断
- 联系Creem支持或查看他们的文档

---
## ✅ 完成后
恭喜！您的GoTaskMind项目现在拥有完整的支付系统！🎉