import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * 服务条款页面
 */
export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">服务条款</CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <p>最后更新日期：2024年10月</p>
          
          <h2>1. 接受条款</h2>
          <p>通过访问或使用 GoTaskMind 网站和服务，您同意遵守本服务条款。如果您不同意本条款的任何部分，您不得使用我们的服务。</p>
          
          <h2>2. 账户创建</h2>
          <ul>
            <li>您必须年满 13 岁才能使用我们的服务</li>
            <li>您需要使用 Google 账号登录以访问我们的服务</li>
            <li>您同意提供准确、完整和最新的信息</li>
          </ul>
          
          <h2>3. 用户行为</h2>
          <p>当使用我们的服务时，您同意不会：</p>
          <ul>
            <li>违反任何适用的法律或法规</li>
            <li>侵犯他人的知识产权</li>
            <li>上传或分享恶意软件、病毒或其他有害内容</li>
            <li>干扰或破坏服务的正常运行</li>
          </ul>
          
          <h2>4. 知识产权</h2>
          <p>GoTaskMind 的所有内容、功能和功能，包括但不限于文本、图形、徽标、图标、图像、音频剪辑、数字下载、数据汇编和软件，均为 GoTaskMind 或其许可方的财产，并受版权、商标和其他知识产权法律保护。</p>
          
          <h2>5. 服务修改</h2>
          <p>我们保留随时修改或中断服务的权利，无需事先通知。我们不对您或第三方因服务修改、暂停或终止而导致的任何损失负责。</p>
          
          <h2>6. 免责声明</h2>
          <p>我们的服务按"原样"和"可用"的基础提供，不附带任何形式的保证，无论是明示还是暗示。我们不保证服务将无中断、及时、安全或无错误。</p>
          
          <h2>7. 责任限制</h2>
          <p>在法律允许的最大范围内，GoTaskMind 及其管理人员、员工、合作伙伴、代理人、供应商或关联公司不对任何间接、偶然、特殊、后果性或惩罚性损害负责。</p>
          
          <h2>8. 条款修改</h2>
          <p>我们保留随时修改本服务条款的权利。当我们进行重大变更时，我们会通过在我们的网站上发布新的条款来通知您。您继续使用我们的服务将被视为接受修改后的条款。</p>
          
          <h2>9. 适用法律</h2>
          <p>本条款受中华人民共和国法律管辖，不考虑其法律冲突规定。</p>
          
          <h2>10. 联系我们</h2>
          <p>如果您对本服务条款有任何问题或疑虑，请联系我们：terms@gotaskmind.com</p>
        </CardContent>
      </Card>
    </div>
  );
}