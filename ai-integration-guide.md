# GoTaskMind - 核心功能实现与DeepSeek API集成指南

## 一、网站核心功能分析

GoTaskMind是一个基于Next.js的AI驱动项目管理平台，目前实现了以下核心功能：

### 1. 核心功能模块

1. **项目规划演示（app/page.tsx）**
   - 自然语言输入项目描述
   - AI生成任务分解、时间线和团队工作流程（目前仅为前端演示）
   - 响应式设计支持桌面和移动端

2. **任务管理系统（app/tasks/page.tsx）**
   - 任务的CRUD操作
   - 任务分类、优先级和状态管理
   - 搜索、过滤和排序功能
   - 使用localStorage进行本地数据持久化

3. **功能展示页面（app/features/page.tsx）**
   - 展示六大核心功能
   - 交互式功能介绍

### 2. 技术栈

- Next.js 15.2.4 + React 19 + TypeScript
- Tailwind CSS + shadcn/ui组件库
- Lucide React图标库
- 数据存储在localStorage（目前无后端）

## 二、DeepSeek API集成方案

### 1. 创建API集成模块

首先需要创建专门的模块来处理与DeepSeek API的通信：

```typescript
// app/lib/ai-service.ts

/**
 * AI服务类，用于处理与DeepSeek API的通信
 */
export class AIService {
  private apiKey: string;
  private baseUrl: string;
  
  /**
   * 构造函数
   * @param apiKey DeepSeek API密钥
   */
  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.deepseek.com/v1';
  }

  /**
   * 发送请求到DeepSeek API
   * @param endpoint API端点
   * @param data 请求数据
   * @returns Promise<any> API响应数据
   */
  private async request(endpoint: string, data: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`API错误: ${response.status} ${await response.text()}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('DeepSeek API请求失败:', error);
      throw error;
    }
  }

  /**
   * 使用DeepSeek模型生成任务分解
   * @param projectDescription 项目描述
   * @returns Promise<string> 生成的任务分解JSON字符串
   */
  async generateTaskBreakdown(projectDescription: string): Promise<string> {
    const prompt = this.getTaskBreakdownPrompt(projectDescription);
    
    const data = {
      model: 'deepseek-chat', // 使用DeepSeek聊天模型
      messages: [
        {
          role: 'system',
          content: '你是一个专业的项目规划助手，擅长将项目描述转换为详细的任务列表。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'text' }
    };
    
    const result = await this.request('chat/completions', data);
    return result.choices[0].message.content;
  }

  /**
   * 生成任务分解提示词
   * @param projectDescription 项目描述
   * @returns string 格式化的提示词
   */
  private getTaskBreakdownPrompt(projectDescription: string): string {
    return `请将以下项目描述分解为详细的任务列表，包括子任务、依赖关系、优先级和时间估计。

项目描述: ${projectDescription}

请以JSON格式返回，确保JSON可以被正确解析。格式如下：
{
  "tasks": [
    {
      "title": "任务标题",
      "description": "任务描述",
      "category": "work/personal/learning/other",
      "priority": "low/medium/high",
      "estimatedHours": 数字,
      "dependencies": ["其他任务ID列表"],
      "subTasks": ["子任务列表"]
    }
  ]
}`;
  }

  /**
   * 分析项目进度并提供智能建议
   * @param projectData 项目数据
   * @returns Promise<string> AI生成的建议
   */
  async analyzeProject(projectData: any): Promise<string> {
    const data = {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的项目管理顾问，擅长分析项目进度并提供优化建议。'
        },
        {
          role: 'user',
          content: `请分析以下项目数据并提供智能建议，包括瓶颈识别、资源优化和进度改进：\n\n${JSON.stringify(projectData, null, 2)}`
        }
      ],
      temperature: 0.5,
      max_tokens: 1000
    };
    
    const result = await this.request('chat/completions', data);
    return result.choices[0].message.content;
  }
}

/**
 * 创建AI服务实例的工厂函数
 * @returns AIService 实例
 */
export function createAIService(): AIService {
  // 从环境变量获取API密钥
  const apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('DeepSeek API密钥未配置');
  }
  return new AIService(apiKey);
}
```

### 2. 创建环境变量配置

创建一个环境变量文件来存储API密钥：

```env
# .env.local
NEXT_PUBLIC_DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

### 3. 创建API路由处理程序

为了安全地处理API请求，创建Next.js API路由：

```typescript
// app/api/ai/route.ts

import { NextResponse } from 'next/server';
import { AIService } from '@/lib/ai-service';

/**
 * 处理AI任务分解请求
 */
export async function POST(request: Request) {
  try {
    const { projectDescription } = await request.json();
    
    if (!projectDescription) {
      return NextResponse.json(
        { error: '项目描述不能为空' },
        { status: 400 }
      );
    }
    
    // 创建AI服务实例
    const aiService = new AIService(process.env.DEEPSEEK_API_KEY || '');
    
    // 生成任务分解
    const taskBreakdown = await aiService.generateTaskBreakdown(projectDescription);
    
    // 解析生成的JSON
    const parsedTasks = JSON.parse(taskBreakdown);
    
    return NextResponse.json({
      success: true,
      tasks: parsedTasks.tasks
    });
  } catch (error) {
    console.error('AI任务分解失败:', error);
    return NextResponse.json(
      { error: '任务分解生成失败，请重试' },
      { status: 500 }
    );
  }
}
```

### 4. 前端集成

修改主页，添加真实的AI功能集成：

```typescript
// app/page.tsx 中相关部分修改

// 添加状态管理
const [projectPrompt, setProjectPrompt] = useState('');
const [generatedTasks, setGeneratedTasks] = useState<any[]>([]);
const [isGenerating, setIsGenerating] = useState(false);

// 修改生成计划函数
const handleGenerate = async () => {
  if (!projectPrompt.trim()) {
    setProjectPrompt(examplePrompts[currentExample]);
    return;
  }
  
  setIsGenerating(true);
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectDescription: projectPrompt }),
    });
    
    const data = await response.json();
    if (data.success) {
      // 将生成的任务保存到本地存储
      const tasksWithIds = data.tasks.map((task: any, index: number) => ({
        ...task,
        id: `ai-generated-${Date.now()}-${index}`,
        status: 'todo',
        createdAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 默认7天后
      }));
      
      // 获取现有任务
      const existingTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      // 合并任务
      const updatedTasks = [...existingTasks, ...tasksWithIds];
      // 保存到本地存储
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      // 设置生成的任务
      setGeneratedTasks(tasksWithIds);
      
      // 显示成功消息
      alert('任务生成成功！已添加到任务列表。');
      
      // 跳转到任务页面
      window.location.href = '/tasks';
    } else {
      alert('任务生成失败: ' + data.error);
    }
  } catch (error) {
    console.error('生成失败:', error);
    alert('生成过程中出现错误，请重试。');
  } finally {
    setIsGenerating(false);
  }
};

// 修改输入框，使其可编辑
<Input
  placeholder={examplePrompts[currentExample]}
  value={projectPrompt}
  onChange={(e) => setProjectPrompt(e.target.value)}
  className="bg-background border-border text-foreground placeholder:text-muted-foreground text-base h-12 cursor-text transition-all hover:border-primary/50"
  aria-label="项目描述输入"
/>
```

## 三、DeepSeek API配置详情

### 1. 获取DeepSeek API密钥

1. 访问 [DeepSeek AI官网](https://www.deepseek.com/)
2. 注册账号并登录
3. 导航到API部分，创建新的API密钥
4. 将获取的API密钥复制到`.env.local`文件中

### 2. API配置说明

DeepSeek API配置需要以下主要参数：

- **API密钥**：用于身份验证
- **模型选择**：推荐使用`deepseek-chat`或`deepseek-coder`
- **请求参数**：
  - `temperature`：控制输出随机性（0-1）
  - `max_tokens`：最大输出token数
  - `messages`：消息数组，包含系统提示和用户输入

### 3. 安全注意事项

- 不要在客户端代码中直接暴露API密钥
- 使用环境变量和API路由进行中间层处理
- 考虑添加请求限制和错误处理
- 实现请求超时和重试机制

## 四、详细提示词模板

### 1. 任务分解提示词

```
请将以下项目描述分解为详细的任务列表，包括任务标题、描述、类别、优先级、时间估计、依赖关系和子任务。

项目描述: [用户输入的项目描述]

请以JSON格式返回，确保JSON可以被正确解析。格式如下：
{
  "tasks": [
    {
      "title": "任务标题",
      "description": "详细描述任务内容和目标",
      "category": "work/personal/learning/other",
      "priority": "low/medium/high",
      "estimatedHours": 数字,
      "dependencies": ["相关任务ID列表"],
      "subTasks": ["子任务标题1", "子任务标题2"]
    }
  ]
}

请确保任务分解：
1. 详细且可执行
2. 逻辑清晰，没有遗漏
3. 任务之间有合理的依赖关系
4. 时间估计基于行业标准
5. 优先级设置合理
```

### 2. 项目分析提示词

```
作为专业的项目管理顾问，请分析以下项目数据并提供智能建议。

项目数据：
${JSON.stringify(projectData, null, 2)}

请从以下几个方面进行分析：
1. 项目进度评估：当前进度是否符合预期？
2. 瓶颈识别：哪些任务可能成为项目瓶颈？
3. 资源优化：如何更好地分配资源？
4. 风险管理：有哪些潜在风险需要注意？
5. 改进建议：提供具体的改进措施和建议

请以清晰、结构化的方式回答，使用小标题和要点列表增强可读性。
```

### 3. 任务优先级调整提示词

```
请根据以下项目背景和任务信息，帮助我重新评估和调整任务优先级：

项目背景：[项目背景描述]
当前截止日期：[日期]
可用资源：[可用资源描述]

任务列表：
${JSON.stringify(tasks, null, 2)}

请为每个任务重新分配优先级（低/中/高），并提供以下内容：
1. 调整后的任务列表，包含优先级
2. 优先级调整的理由
3. 关键路径任务识别
4. 资源分配建议

请使用以下JSON格式返回结果：
{
  "prioritizedTasks": [
    {
      "id": "任务ID",
      "title": "任务标题",
      "priority": "low/medium/high",
      "reason": "优先级调整理由"
    }
  ],
  "criticalPath": ["关键路径任务ID列表"],
  "resourceSuggestions": ["资源分配建议列表"]
}
```

## 五、扩展功能建议

1. **任务智能推荐系统**
   - 使用DeepSeek API分析用户历史行为
   - 提供个性化任务建议和优先级调整

2. **自然语言查询接口**
   - 允许用户用自然语言查询项目状态
   - 例如："显示本周到期的高优先级任务"

3. **自动进度报告生成**
   - 定期自动生成项目进度报告
   - 包含数据可视化和趋势分析

4. **团队协作优化**
   - 基于团队成员技能和可用性的智能任务分配
   - 团队工作负载平衡建议

## 六、实施步骤

1. 安装所需依赖
```bash
pnpm add axios
```

2. 创建上述文件和代码

3. 配置环境变量

4. 测试API连接和响应

5. 部署到生产环境前进行安全审查

通过以上集成，您可以将GoTaskMind转变为一个真正的AI驱动项目管理平台，充分利用DeepSeek大模型的能力提供智能任务分解和项目分析功能。