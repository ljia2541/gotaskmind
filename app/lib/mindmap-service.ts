/**
 * AI Mind Map Service - Qwen3-8B (Free) via SiliconFlow
 */

export class MindMapService {
  private apiKey: string;
  private baseUrl = 'https://api.siliconflow.cn/v1';
  private model = 'Qwen/Qwen3-8B';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateMindMap(topic: string): Promise<string> {
    const prompt = this.buildPrompt(topic);

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: 'You are a mind map generator. Output ONLY valid Markdown with hierarchical bullet points. No code blocks, no explanations.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        enable_thinking: false,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`API error: ${response.status} ${err}`);
    }

    const result = await response.json();
    let content = result.choices[0].message.content.trim();

    // Strip code blocks if model wraps output
    content = content.replace(/^```(?:markdown|md)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();

    return content;
  }

  private buildPrompt(topic: string): string {
    const hasChinese = /[\u4e00-\u9fa5]/.test(topic);
    const lang = hasChinese ? 'zh' : 'en';

    if (lang === 'zh') {
      return `请为以下主题生成一个详细的思维导图，使用 Markdown 层级列表格式。

主题：${topic}

要求：
1. 第一行是主题标题（使用 # 标题格式）
2. 使用 - 或 * 的层级列表表示思维导图的分支
3. 缩进表示层级关系
4. 生成 3-5 个主要分支，每个分支下有 2-4 个子节点
5. 只输出 Markdown，不要任何其他文字
6. 内容要具体、有价值、逻辑清晰

示例格式：
# 主题
## 分支1
- 子节点1
  - 细节1
  - 细节2
- 子节点2
## 分支2
- 子节点1`;
    }

    return `Generate a detailed mind map for the following topic in Markdown hierarchical list format.

Topic: ${topic}

Requirements:
1. First line is the topic title (use # heading)
2. Use - or * for hierarchical lists representing mind map branches
3. Indentation represents hierarchy
4. Generate 3-5 main branches, each with 2-4 sub-nodes
5. Output ONLY Markdown, no other text
6. Content should be specific, valuable, and logically clear

Example format:
# Topic
## Branch 1
- Sub-node 1
  - Detail 1
  - Detail 2
- Sub-node 2
## Branch 2
- Sub-node 1`;
  }
}

export function createMindMapService(): MindMapService {
  const apiKey = process.env.SILICONFLOW_API_KEY;
  if (!apiKey) {
    throw new Error('SILICONFLOW_API_KEY not configured');
  }
  return new MindMapService(apiKey);
}
