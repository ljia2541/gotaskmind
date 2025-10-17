import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * 隐私政策页面
 */
export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">隐私政策</CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <p>最后更新日期：2024年10月</p>
          
          <h2>1. 介绍</h2>
          <p>欢迎使用 GoTaskMind。我们非常重视您的隐私，并致力于保护您的个人信息。本隐私政策旨在帮助您了解我们如何收集、使用、存储和保护您的信息，以及您对这些信息所享有的权利。</p>
          
          <h2>2. 我们收集的信息</h2>
          <ul>
            <li><strong>个人信息：</strong>当您使用 Google 账号登录时，我们可能会收集您的姓名、电子邮箱地址和头像等信息。</li>
            <li><strong>使用数据：</strong>我们可能会收集有关您如何使用我们服务的数据，例如您访问的页面和功能。</li>
          </ul>
          
          <h2>3. 我们如何使用您的信息</h2>
          <p>我们使用您的信息主要用于：</p>
          <ul>
            <li>提供、维护和改进我们的服务</li>
            <li>处理您的账户注册和身份验证</li>
            <li>确保服务的安全性和完整性</li>
          </ul>
          
          <h2>4. 数据存储和保护</h2>
          <p>我们采用行业标准的安全措施来保护您的个人信息免受未授权访问、使用或披露。您的信息仅在必要的时间内保存，以实现本隐私政策所述的目的。</p>
          
          <h2>5. 第三方服务</h2>
          <p>我们使用 Google OAuth 进行身份验证。通过使用我们的服务，您同意 Google 根据其隐私政策处理您的信息。</p>
          
          <h2>6. 您的权利</h2>
          <p>您有权访问、更正或删除您的个人信息。如果您想行使这些权利，请联系我们。</p>
          
          <h2>7. 变更</h2>
          <p>我们可能会不时更新本隐私政策。当我们进行重大变更时，我们会通过在我们的网站上发布新的隐私政策来通知您。</p>
          
          <h2>8. 联系我们</h2>
          <p>如果您对本隐私政策有任何问题或疑虑，请联系我们：privacy@gotaskmind.com</p>
        </CardContent>
      </Card>
    </div>
  );
}