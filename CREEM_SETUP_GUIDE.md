# 🚀 Creem支付设置 - 完整实施指南

## 📋 概述
本指南将帮助您完成GoTaskMind项目的Creem支付系统配置，包含从注册到测试的所有步骤。

## 🎯 预期结果
完成后您将拥有：
- ✅ 完全功能的在线支付系统
- ✅ 自动化订阅管理
- ✅ 安全的支付处理
- ✅ 完整的错误处理和用户反馈

---

## 步骤1: 注册Creem账户并获取API密钥

### 1.1 注册账户
1. **访问**: [https://creem.io](https://creem.io)
2. **点击**: "Sign Up" 或 "Get Started"
3. **填写信息**:
   - 邮箱地址
   - 密码（建议使用强密码）
   - 公司/项目名称
4. **验证邮箱**: 检查邮箱并点击验证链接
5. **完成个人资料**: 添加必要的信息

### 1.2 获取API密钥
1. **登录**: [https://dashboard.creem.io](https://dashboard.creem.io)
2. **导航**: Settings → API Keys
3. **创建新密钥**:
   - 点击 "Create New API Key"
   - 命名为 "GoTaskMind Production"
   - 选择权限：Full Access
   - 复制生成的密钥（格式：`creem_abcdefghijk...`）
   - ⚠️ **重要**: 立即保存密钥，页面刷新后将无法再次查看

### 1.3 获取Webhook密钥
1. **导航**: Settings → Webhooks
2. **创建Webhook端点**:
   - 点击 "Add Webhook"
   - 命名为 "GoTaskMind Production"
   - URL: `https://yourdomain.com/api/payment/webhook`（先用测试URL）
   - 保存并复制Webhook Secret

---

## 步骤2: 创建产品（根据您的定价方案）

### 2.1 创建Free产品（参考）
虽然Free计划不需要支付，但建议创建以便管理：
1. **导航**: Products → Create Product
2. **填写信息**:
   ```
   产品名称: GoTaskMind Free
   产品描述: Basic AI features for individuals
   价格: $0.00
   类型: One-time (或直接跳过)
   ```

### 2.2 创建Pro产品（月付）
1. **点击**: "Add Product"
2. **基本信息**:
   ```
   产品名称: GoTaskMind Pro Monthly
   产品描述: Unlimited projects and advanced AI features for teams
   ```

3. **定价信息**:
   ```
   价格: $8.00 USD
   类型: Recurring Subscription
   计费周期: Monthly
   货币: USD
   ```

4. **产品设置**:
   ```
   成功页面: https://yourdomain.com/payment/success
   取消页面: https://yourdomain.com/pricing?canceled=true
   ```

5. **保存并复制产品ID**（格式：`prod_xxxxxxxx`）

### 2.3 创建Pro产品（年付）
重复上述步骤，设置：
```
产品名称: GoTaskMind Pro Annual
价格: $88.00 USD ($7.33/月)
计费周期: Yearly
```

---

## 步骤3: 配置环境变量

### 3.1 复制环境变量模板
```bash
cp .env.example .env.local
```

### 3.2 配置本地环境变量
编辑 `.env.local` 文件：

```env
# Creem Payment Configuration
CREEM_API_KEY=creem_your_actual_api_key_here
CREEM_WEBHOOK_SECRET=your_actual_webhook_secret_here

# Product IDs from Creem Dashboard
CREEM_PRO_MONTHLY_PRODUCT_ID=prod_pro_monthly_id
CREEM_PRO_ANNUAL_PRODUCT_ID=prod_pro_annual_id

# Development Settings
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000

# AI Configuration
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

### 3.3 验证环境变量
确保所有变量都已正确设置，无拼写错误。

---

## 步骤4: 设置Webhook端点

### 4.1 配置开发环境Webhook
1. **回到Creem控制台**
2. **导航**: Settings → Webhooks
3. **编辑现有Webhook**:
   ```
   URL: http://localhost:3000/api/payment/webhook
   Secret: (使用之前复制的webhook secret)
   ```

4. **启用事件类型**:
   - ✅ checkout.completed
   - ✅ payment.succeeded
   - ✅ payment.failed
   - ✅ subscription.created
   - ✅ subscription.canceled
   - ✅ subscription.updated

### 4.2 测试Webhook连接
1. **点击**: "Test Webhook"
2. **选择事件类型**: checkout.completed
3. **发送测试**: 检查是否收到200响应
4. **查看日志**: 确认请求成功到达您的服务器

### 4.3 使用ngrok测试（推荐）
如果本地开发无法接收webhook：
```bash
# 安装ngrok
npm install -g ngrok

# 启动ngrok
ngrok http 3000

# 使用生成的URL更新webhook
# 例如: https://abc123.ngrok.io/api/payment/webhook
```

---

## 步骤5: 测试完整支付流程

### 5.1 启动开发服务器
```bash
npm run dev
# 或
pnpm dev
```

### 5.2 访问定价页面
打开浏览器访问: `http://localhost:3000/pricing`

### 5.3 测试Pro计划支付流程

#### 5.3.1 未登录用户流程
1. **点击**: "Sign Up & Upgrade" 在Pro计划下
2. **预期**: 跳转到Google登录页面
3. **登录**: 使用Google账户登录
4. **重定向**: 回到定价页面
5. **再次点击**: "Upgrade to Pro"
6. **预期**: 跳转到Creem支付页面

#### 5.3.2 已登录用户流程
1. **直接点击**: "Upgrade to Pro"
2. **预期**: 跳转到Creem支付页面

#### 5.3.3 在Creem支付页面
1. **使用测试卡信息**:
   ```
   卡号: 4242 4242 4242 4242
   有效期: 12/25 (或任意未来日期)
   CVV: 123
   姓名: Test User
   ```
2. **填写邮箱**: test@example.com
3. **点击**: "Pay $8.00"

#### 5.3.4 支付成功验证
1. **重定向**: 应该自动跳转到 `http://localhost:3000/payment/success`
2. **显示**: "支付成功！"页面
3. **验证**: 订单详情显示正确
4. **检查**: 浏览器URL包含正确的session_id参数

### 5.4 测试年付计划（可选）
选择年付选项，测试$88的年付Pro计划。

---

## 🔍 故障排除指南

### 常见问题及解决方案

#### 问题1: API密钥错误
```
错误: 401 Unauthorized
解决: 检查.env.local中的CREEM_API_KEY是否正确复制
```

#### 问题2: 产品ID错误
```
错误: Product not found
解决: 确认Creem控制台中的产品ID与.env.local中的匹配
```

#### 问题3: Webhook无法接收
```
错误: Webhook delivery failed
解决:
1. 检查URL是否可访问
2. 使用ngrok创建临时公网URL
3. 检查防火墙设置
```

#### 问题4: 重定向失败
```
错误: 支付后无法返回成功页面
解决:
1. 检查NEXTAUTH_URL设置
2. 确认success URL在Creem产品设置中正确
```

#### 问题5: 签名验证失败
```
错误: Signature verification failed
解决:
1. 检查CREEM_WEBHOOK_SECRET是否正确
2. 确保没有多余的空格或换行符
```

### 调试技巧

#### 1. 查看控制台日志
```bash
# 在终端中查看详细日志
npm run dev 2>&1 | grep -E "(Creem|payment|checkout)"
```

#### 2. 检查网络请求
- 使用浏览器开发者工具
- 查看Network标签页
- 检查API请求和响应

#### 3. 验证环境变量
```javascript
// 在浏览器控制台中检查
console.log(process.env.NEXT_PUBLIC_CREEM_API_KEY)
```

---

## ✅ 验证清单

完成设置后，请确认以下事项：

### 账户配置
- [ ] Creem账户已创建并验证
- [ ] API密钥已获取并保存
- [ ] Webhook密钥已配置

### 产品配置
- [ ] Pro月付产品已创建
- [ ] Pro年付产品已创建
- [ ] 所有产品ID已记录

### 技术配置
- [ ] .env.local文件已配置
- [ ] 所有必需变量已设置
- [ ] 开发服务器正常启动
- [ ] Webhook端点可访问

### 测试验证
- [ ] 定价页面正常显示 (Free $0, Pro $8/月, Pro $88/年)
- [ ] 未登录用户登录流程正常
- [ ] 支付跳转功能正常
- [ ] Creem支付页面加载正常
- [ ] 测试卡支付成功 ($8或$88)
- [ ] 成功页面正常显示
- [ ] 订单信息正确显示

---

## 🚀 部署到生产环境

### 1. 创建生产环境产品
在Creem控制台中创建生产版本的产品，使用不同的产品ID。

### 2. 更新生产环境变量
```env
NODE_ENV=production
CREEM_API_KEY=creem_production_api_key
CREEM_WEBHOOK_SECRET=production_webhook_secret
NEXTAUTH_URL=https://yourdomain.com
```

### 3. 更新Webhook URL
```
生产环境: https://yourdomain.com/api/payment/webhook
```

---

## 📞 获取支持

如果遇到问题：
1. **Creem文档**: [docs.creem.io](https://docs.creem.io)
2. **Creem支持**: dashboard中的Support页面
3. **项目问题**: GitHub Issues

---

## 🎉 恭喜！

完成以上步骤后，您的GoTaskMind项目将拥有完整的支付系统！用户可以：
- 查看清晰的定价方案
- 安全地升级到付费计划
- 享受自动化的订阅管理
- 获得即时的功能解锁

现在您可以专注于业务发展，让Creem处理复杂的支付流程！