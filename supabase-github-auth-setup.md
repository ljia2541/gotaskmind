# Supabase GitHub 登录配置指南

本文档提供了在项目中配置和使用 Supabase GitHub 登录的详细步骤。

## 1. 在 Supabase 控制台设置 GitHub OAuth

1. 登录 Supabase 控制台，进入你的项目
2. 点击左侧栏的「Authentication」图标
3. 在「Configuration」部分点击「Providers」
4. 找到并展开「GitHub」选项
5. 复制提供的回调URL（格式：https://<project-ref>.supabase.co/auth/v1/callback）

## 2. 在 GitHub 创建 OAuth 应用

1. 登录 GitHub，进入「Settings」>「Developer settings」>「OAuth Apps」
2. 点击「New OAuth App」
3. 填写信息：
   - **Application name**: GoTaskMind
   - **Homepage URL**: http://localhost:3000（开发环境）
   - **Authorization callback URL**: 粘贴从 Supabase 获取的回调URL
4. 复制生成的「Client ID」和「Client secret」

## 3. 在 Supabase 控制台完成配置

1. 返回 Supabase 控制台的 GitHub 配置页面
2. 将「GitHub Enabled」设置为「ON」
3. 粘贴 GitHub OAuth 应用的「Client ID」和「Client secret」
4. 点击「Save」保存配置

## 4. 代码说明

本项目已经实现了以下核心功能：

1. **Supabase服务器端客户端**：`app/utils/supabase/server.ts`
2. **中间件**：`middleware.ts`（用于会话刷新和路由保护）
3. **Google登录路由**：`app/api/auth/google/route.ts`
4. **Google回调处理**：`app/api/auth/google/callback/route.ts`
5. **GitHub登录路由**：`app/api/auth/github/route.ts`
6. **GitHub回调处理**：`app/api/auth/github/callback/route.ts`
7. **会话检查API**：`app/api/auth/session/route.ts`
8. **登出API**：`app/api/auth/logout/route.ts`
9. **认证钩子**：`app/hooks/use-auth.ts`（支持 GitHub 和 Google 登录）

## 5. 使用说明

应用现在可以通过以下方式使用 Google 和 GitHub 登录：

### Google 登录
1. 用户调用 `loginWithGoogle()` 函数或访问 `/api/auth/google`
2. 重定向到 Google 授权页面
3. 用户授权后，重定向回应用的回调 URL
4. 系统完成认证流程并创建用户会话
5. 用户被重定向到应用首页

### GitHub 登录
1. 用户调用 `loginWithGitHub()` 函数或访问 `/api/auth/github`
2. 重定向到 GitHub 授权页面
3. 用户授权后，重定向回应用的回调 URL
4. 系统完成认证流程并创建用户会话
5. 用户被重定向到应用首页

## 6. 在组件中使用

```tsx
import { useAuth } from '@/app/hooks/use-auth';

function LoginButton() {
  const { loginWithGoogle, loginWithGitHub, user, logout } = useAuth();

  if (user) {
    return (
      <div>
        <p>欢迎，{user.name}!</p>
        <button onClick={logout}>登出</button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={loginWithGoogle}>使用 Google 登录</button>
      <button onClick={loginWithGitHub}>使用 GitHub 登录</button>
    </div>
  );
}
```

## 7. 环境变量配置

确保在 `.env.local` 文件中配置以下变量：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key

# 站点配置
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

注意：GitHub OAuth 的 Client ID 和 Secret 需要在 Supabase 控制台中配置，不需要在环境变量中设置。

## 8. 注意事项

1. 确保在生产环境中正确配置 `NEXT_PUBLIC_SITE_URL`
2. 生产环境中应使用 HTTPS
3. 在 GitHub OAuth 应用中，生产环境需要添加正确的域名
4. 定期更新依赖包以获取安全修复
5. 根据需要调整 OAuth 权限范围（当前设置为 `read:user,user:email`）

## 9. 故障排除

如果遇到认证问题，请检查以下几点：

1. **环境变量是否正确配置**
2. **GitHub OAuth 应用的回调 URL 是否与 Supabase 提供的一致**
3. **Supabase 控制台中的 GitHub 客户端 ID 和密钥是否正确**
4. **OAuth 应用是否已激活**
5. **检查浏览器控制台和服务器日志以获取详细错误信息**

## 10. 测试流程

1. 确保 Supabase 和 GitHub OAuth 配置完成
2. 启动开发服务器：`pnpm dev`
3. 访问 http://localhost:3000
4. 点击 GitHub 登录按钮
5. 在 GitHub 授权页面完成授权
6. 验证是否成功登录并显示用户信息

## 11. 与 Google 登录的区别

Google 和 GitHub 登录现在都使用相同的 Supabase 基础架构：

- **相同的会话管理**：都使用 Supabase 的认证系统
- **相同的 API 端点结构**：`/api/auth/{provider}` 和 `/api/auth/{provider}/callback`
- **相同的用户信息格式**：统一的用户数据结构
- **相同的中间件处理**：统一的会话刷新和路由保护

这意味着你可以轻松地在两种登录方式之间切换，或者同时提供两种选项给用户。

## 12. 服务器端认证优势

本实现采用 Supabase 服务器端认证模式，具有以下优势：

1. **增强的安全性**：OAuth 客户端密钥仅在服务器端使用
2. **更好的会话管理**：使用 HttpOnly cookies 存储会话
3. **统一的认证流程**：与 Google 登录使用相同的基础架构
4. **CSRF 保护**：Supabase 自动处理 CSRF 保护
5. **更容易维护**：统一的错误处理和日志记录