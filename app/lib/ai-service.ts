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
    // 检测输入语言（简单实现：检查是否包含中文字符）
    const containsChinese = /[\u4e00-\u9fa5]/.test(projectDescription);
    const language = containsChinese ? '中文' : '英文';
    
    // 根据输入语言设置提示词
    return `${containsChinese ? '请将以下项目描述分解为详细的任务列表。' : 'Please break down the following project description into a detailed task list.'}

${containsChinese ? '项目描述' : 'Project Description'}: ${projectDescription}

${containsChinese ? '请只返回纯JSON格式内容，不要包含任何Markdown格式（如json代码块）或其他文本。格式如下：' : 'Please return only pure JSON format content, without any Markdown formatting (such as json code blocks) or other text. Format as follows:'}
{
  "tasks": [
    {
      "title": "${containsChinese ? '任务标题' : 'Task Title'}",
      "description": "${containsChinese ? '详细的任务描述' : 'Detailed Task Description'}",
      "category": "work"${containsChinese ? '或' : 'or'}"personal"${containsChinese ? '或' : 'or'}"learning"${containsChinese ? '或' : 'or'}"other",
      "priority": "low"${containsChinese ? '或' : 'or'}"medium"${containsChinese ? '或' : 'or'}"high",
      "estimatedHours": ${containsChinese ? '数字（可选）' : 'number (optional)'}
    }
  ]
}

${containsChinese ? '重要注意事项' : 'Important Notes'}：
1. ${containsChinese ? '确保category的值只能是work、personal、learning或other中的一个' : 'Ensure that category value is one of work, personal, learning, or other'}
2. ${containsChinese ? '确保priority的值只能是low、medium或high中的一个' : 'Ensure that priority value is one of low, medium, or high'}
3. ${containsChinese ? '请严格按照指定的JSON格式返回，不要包含额外的字段' : 'Please return strictly in the specified JSON format without additional fields'}
4. ${containsChinese ? '生成的任务应该详细、可执行且逻辑清晰' : 'Generated tasks should be detailed, executable, and logically clear'}
5. ${containsChinese ? '请确保输出是有效的JSON，不要包含任何代码块标记或说明文字' : 'Please ensure the output is valid JSON without any code block markers or explanatory text'}
6. ${containsChinese ? '请确保生成的任务标题和描述语言与输入语言保持一致' : 'Please ensure that the generated task titles and descriptions maintain the same language as the input'}`;
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
 * 注意：此函数仅在服务端使用，确保API密钥不会暴露给客户端
 * @returns AIService 实例
 */
export function createAIService(): AIService {
  // 从环境变量获取API密钥（不使用NEXT_PUBLIC_前缀以保护安全）
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('DeepSeek API密钥未配置');
  }
  return new AIService(apiKey);
}