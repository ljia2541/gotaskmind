# Creem 支付集成设置指南

本指南将帮助您在 GoTaskMind 项目中配置和使用 Creem 支付系统。

## 📋 目录

1. [Creem 账户设置](#creem-账户设置)
2. [产品创建](#产品创建)
3. [环境变量配置](#环境变量配置)
4. [Webhook 配置](#webhook-配置)
5. [测试支付流程](#测试支付流程)
6. [部署到生产环境](#部署到生产环境)
7. [故障排除](#故障排除)

## 🚀 Creem 账户设置

### 1. 注册 Creem 账户

1. 访问 [Creem.io](https://creem.io)
2. 点击 "Sign Up" 创建账户
3. 完成邮箱验证和账户设置

### 2. 获取 API 密钥

1. 登录 Creem 控制台
2. 导航到 **API Keys** 部分
3. 点击 "Create API Key"
4. 复制生成的 API 密钥（格式：`creem_xxxxxxxx`）

### 3. 获取 Webhook 密钥

1. 在控制台中找到 **Webhooks** 部分
2. 创建新的 webhook endpoint
3. 复制 webhook 密钥用于签名验证

## 📦 产品创建

### 创建月度 Pro 计划产品

1. 登录 Creem 控制台
2. 导航到 **Products** 标签页
3. 点击 "Add Product"
4. 填写产品信息：
   ```
   产品名称: GoTaskMind Pro Monthly
   描述: Unlimited projects, tasks, and team members with advanced AI features
   价格: $8.00 USD
   类型: Recurring (订阅)
   计费周期: Monthly
   ```
5. 保存产品并复制产品 ID（格式：`prod_xxxxxxxx`）

### 创建年度 Pro 计划产品

1. 重复上述步骤创建年度计划：
   ```
   产品名称: GoTaskMind Pro Annual
   描述: Save 8% with annual billing - all Pro features included
   价格: $88.00 USD
   类型: Recurring (订阅)
   计费周期: Yearly
   ```
2. 保存产品并复制产品 ID

## ⚙️ 环境变量配置

### 1. 复制环境变量模板

```bash
cp .env.example .env.local
```

### 2. 配置环境变量

在 `.env.local` 文件中添加以下配置：

```env
# Creem Payment API
CREEM_API_KEY=creem_your_api_key_here
CREEM_WEBHOOK_SECRET=your_webhook_secret_here

# Product IDs from Creem Dashboard
CREEM_PRO_MONTHLY_PRODUCT_ID=prod_pro_monthly_id_here
CREEM_PRO_ANNUAL_PRODUCT_ID=prod_pro_annual_id_here

# 其他现有配置...
DEEPSEEK_API_KEY=your_deepseek_api_key_here
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

### 3. 验证配置

确保所有必要的变量都已设置：

- ✅ `CREEM_API_KEY`: Creem API 密钥
- ✅ `CREEM_WEBHOOK_SECRET`: Webhook 签名密钥
- ✅ `CREEM_PRO_MONTHLY_PRODUCT_ID`: 月度计划产品 ID
- ✅ `CREEM_PRO_ANNUAL_PRODUCT_ID`: 年度计划产品 ID

## 🔗 Webhook 配置

### 1. 设置 Webhook URL

在 Creem 控制台中设置 webhook URL：

```
开发环境: http://localhost:3000/api/payment/webhook
生产环境: https://yourdomain.com/api/payment/webhook
```

### 2. 配置事件类型

启用以下 webhook 事件：

- `checkout.completed` - 支付完成
- `payment.succeeded` - 支付成功
- `payment.failed` - 支付失败
- `subscription.created` - 订阅创建
- `subscription.canceled` - 订阅取消

### 3. 测试 Webhook

使用 Creem 控制台的 webhook 测试功能验证连接。

## 🧪 测试支付流程

### 1. 启动开发服务器

```bash
npm run dev
# 或
pnpm dev
```

### 2. 访问定价页面

打开浏览器访问 `http://localhost:3000/pricing`

### 3. 测试支付流程

1. 点击 "Sign Up & Upgrade" 按钮
2. 如果未登录，会先跳转到 Google 登录
3. 登录后再次点击升级按钮
4. 应该会跳转到 Creem 支付页面
5. 使用测试卡信息完成支付
6. 支付成功后应该重定向到成功页面

### 4. 测试环境支付卡

在测试环境中，您可以使用以下测试卡信息：

```
卡号: 4242 4242 4242 4242
有效期: 任意未来日期
CVV: 任意3位数字
持卡人姓名: 任意姓名
```

## 🚀 部署到生产环境

### 1. 更新环境变量

在部署平台（Vercel、Netlify 等）中设置生产环境变量：

```env
NODE_ENV=production
CREEM_API_KEY=creem_production_api_key
CREEM_WEBHOOK_SECRET=production_webhook_secret
CREEM_PRO_MONTHLY_PRODUCT_ID=prod_production_monthly_id
CREEM_PRO_ANNUAL_PRODUCT_ID=prod_production_annual_id
NEXTAUTH_URL=https://yourdomain.com
```

### 2. 更新 Creem 控制台配置

1. 将 webhook URL 更新为生产环境地址
2. 确保产品配置使用生产环境的产品 ID
3. 禁用测试模式

### 3. 验证生产环境

1. 部署应用程序
2. 测试完整的支付流程
3. 检查 webhook 日志确保正常接收事件

## 🔧 故障排除

### 常见问题

#### 1. API 密钥错误

**错误**: `401 Unauthorized`

**解决方案**:
- 检查 `.env.local` 中的 `CREEM_API_KEY` 是否正确
- 确保使用的是正确的环境密钥（测试/生产）

#### 2. 产品 ID 错误

**错误**: `404 Product Not Found`

**解决方案**:
- 验证 `.env.local` 中的产品 ID 是否正确
- 确保产品在 Creem 控制台中处于活跃状态

#### 3. Webhook 签名验证失败

**错误**: `401 Signature verification failed`

**解决方案**:
- 检查 `CREEM_WEBHOOK_SECRET` 是否正确
- 确保 webhook URL 可以从外部访问
- 检查服务器时间是否准确

#### 4. 重定向 URL 错误

**错误**: 支付成功后无法正确重定向

**解决方案**:
- 检查 `NEXTAUTH_URL` 配置是否正确
- 确保 success URL 可以正常访问
- 检查 CORS 配置

### 调试技巧

#### 1. 启用详细日志

在开发环境中，查看控制台输出的详细信息：

```typescript
// 在 API 路由中添加调试日志
console.log('Creem API 请求:', {
  url: CREEM_API_BASE_URL,
  productId: PRODUCT_IDS[planId],
  userId,
  userEmail
})
```

#### 2. 检查网络请求

使用浏览器开发者工具检查：
- API 请求是否正常发送
- 响应状态码和内容
- 重定向是否正确执行

#### 3. 验证 Creem 控制台

检查 Creem 控制台中的：
- 支付记录
- Webhook 日志
- 错误信息

## 📞 获取支持

如果您在设置过程中遇到问题：

1. **Creem 文档**: [docs.creem.io](https://docs.creem.io)
2. **Creem 支持**: 通过 Creem 控制台提交支持请求
3. **项目问题**: 检查 GitHub Issues 或创建新的 issue

## ✅ 检查清单

在完成设置后，请确认以下事项：

- [ ] Creem 账户已创建并验证
- [ ] API 密钥已获取并配置
- [ ] 月度和年度产品已创建
- [ ] 环境变量已正确设置
- [ ] Webhook URL 已配置并可访问
- [ ] 开发环境测试通过
- [ ] 生产环境配置完成
- [ ] 错误处理机制正常工作

恭喜！您已成功在 GoTaskMind 中集成了 Creem 支付系统！🎉