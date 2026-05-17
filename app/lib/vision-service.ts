/**
 * Vision Service - NVIDIA Nemotron Nano 2 VL via OpenRouter
 * Used for "from photo" mind map generation
 */

export class VisionService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';
  private model = 'nvidia/nemotron-nano-12b-v2-vl:free';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Analyze an image and extract structured information suitable for mind map generation
   */
  async analyzeImage(imageUrl: string): Promise<string> {
    const prompt = this.buildPrompt();

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': 'https://www.gotaskmind.com',
        'X-Title': 'GoTaskMind',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Vision API error: ${response.status} ${err}`);
    }

    const result = await response.json();
    let content = result.choices[0].message.content.trim();

    // Strip code blocks if model wraps output
    content = content.replace(/^```(?:markdown|md)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();

    return content;
  }

  private buildPrompt(): string {
    return `You are analyzing an image to generate a mind map from it.

Analyze the image and extract the key topics, concepts, and structure visible. Identify:
- Main topics or themes
- Key sub-topics and categories
- Relationships between concepts
- Any hierarchical structure visible in diagrams, charts, or organizational layouts

Then output a complete mind map in Markdown hierarchical list format:
1. First line is a suitable topic title (use # heading)
2. Use - for hierarchical list branches
3. Indentation represents hierarchy
4. Generate 3-5 main branches, each with 2-4 sub-nodes
5. Output ONLY the Markdown mind map, no other text
6. Content should be specific, valuable, and logically clear

Example format:
# [Topic Title]
## Branch 1
- Sub-node 1
  - Detail 1
  - Detail 2
- Sub-node 2
## Branch 2
- Sub-node 1
  - Detail 1

If the image contains text (e.g., screenshots, documents, slides), extract and organize the key information into a mind map structure.`;
  }
}

export function createVisionService(): VisionService {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not configured');
  }
  return new VisionService(apiKey);
}