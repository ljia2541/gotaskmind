# Supabase Google 登录配置指南

本文档提供了在项目中配置和使用 Supabase Google 登录的详细步骤。

## 1. 在 Supabase 控制台设置 Google OAuth

1. 登录 Supabase 控制台，进入你的项目
2. 点击左侧栏的「Authentication」图标
3. 在「Configuration」部分点击「Providers」
4. 找到并展开「Google」选项
5. 复制提供的回调 URL（格式：https://<project-ref>.supabase.co/auth/v1/callback）

## 2. 在 Google Cloud Console 创建 OAuth 应用

1. 登录 [Google Cloud Console](https://console.cloud.google.com/)
2. 选择或创建一个项目
3. 在导航菜单中，选择「APIs & Services」>「Credentials」
4. 点击「Create Credentials」>「OAuth client ID」
5. 如果提示，请先配置 OAuth 同意屏幕：
   - 选择「External」
   - 填写应用名称、用户支持电子邮件、开发者联系信息
   - 在「Scopes」步骤中，添加范围：
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `openid`
   - 在「Test Users」步骤中，添加测试用户（开发阶段）
6. 创建 OAuth 客户端 ID：
   - **Application type**: 选择「Web application」
   - **Name**: 你的应用名称（如：GoTaskMind）
   - **Authorized JavaScript origins**: http://localhost:3000（开发环境）
   - **Authorized redirect URIs**: 粘贴从 Supabase 获取的回调 URL
7. 点击「Create」创建客户端
8. 复制生成的「Client ID」和「Client secret」

## 3. 在 Supabase 控制台完成配置

1. 返回 Supabase 控制台的 Google 配置页面
2. 将「Google Enabled」设置为「ON」
3. 粘贴 Google OAuth 应用的「Client ID」和「Client secret」
4. 点击「Save」保存配置

## 4. 代码说明

本项目已经实现了以下核心功能：

1. **Supabase服务器端客户端**：`app/utils/supabase/server.ts`
2. **中间件**：`middleware.ts`（用于会话刷新和路由保护）
3. **Google登录路由**：`app/api/auth/google/route.ts`
4. **Google回调处理**：`app/api/auth/google/callback/route.ts`
5. **会话检查API**：`app/api/auth/session/route.ts`
6. **登出API**：`app/api/auth/logout/route.ts`
7. **认证钩子**：`app/hooks/use-auth.ts`（支持 Google 登录）

## 5. 使用说明

应用现在可以通过以下方式使用 Google 登录：

1. 用户调用 `loginWithGoogle()` 函数或访问 `/api/auth/google`
2. 重定向到 Google 授权页面
3. 用户授权后，重定向回应用的回调 URL
4. 系统完成认证流程并创建用户会话
5. 用户被重定向到应用首页

## 6. 在组件中使用

```tsx
import { useAuth } from '@/app/hooks/use-auth';

function LoginButton() {
  const { loginWithGoogle, user, logout } = useAuth();

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

注意：Google OAuth 的 Client ID 和 Secret 需要在 Supabase 控制台中配置，不需要在环境变量中设置。

## 8. 注意事项

1. 确保在生产环境中正确配置 `NEXT_PUBLIC_SITE_URL`
2. 生产环境中应使用 HTTPS
3. 在 Google Cloud Console 中，生产环境需要添加正确的域名
4. 定期更新依赖包以获取安全修复
5. 根据需要调整 OAuth 权限范围（当前设置为 `openid profile email`）

## 9. 故障排除

如果遇到认证问题，请检查以下几点：

1. **环境变量是否正确配置**
2. **Google OAuth 应用的回调 URL 是否与 Supabase 提供的一致**
3. **Supabase 控制台中的 Google 客户端 ID 和密钥是否正确**
4. **OAuth 同意屏幕是否配置完整**
5. **测试用户是否已添加**（对于未发布的应用）
6. **检查浏览器控制台和服务器日志以获取详细错误信息**

## 10. 测试流程

1. 确保 Supabase 和 Google OAuth 配置完成
2. 启动开发服务器：`pnpm dev`
3. 访问 http://localhost:3000
4. 点击 Google 登录按钮
5. 在 Google 授权页面完成授权
6. 验证是否成功登录并显示用户信息

## 11. 总结

本项目现在使用 Google 登录作为唯一的认证方式，基于 Supabase 的认证系统：

- **统一的会话管理**：使用 Supabase 的认证系统
- **简洁的 API 端点结构**：`/api/auth/google` 和 `/api/auth/google/callback`
- **标准的用户信息格式**：统一的用户数据结构
- **完善的中间件处理**：统一的会话刷新和路由保护

系统已经完全配置好，用户可以使用 Google 账号轻松登录。