export const API_BASE_URL = import.meta.env.VITE_DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1';
export const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || '';

export const VOLCENGINE_API_KEY = import.meta.env.VITE_VOLCENGINE_API_KEY || '30990ea2-2d47-44f7-9aa3-39dc6a44b636';
export const VOLCENGINE_API_URL = '/api/proxy/volcengine';
export const VOLCENGINE_IMAGE_MODEL = import.meta.env.VITE_VOLCENGINE_IMAGE_MODEL || 'doubao-seedream-4-5-251128';

/**
 * DeepSeek Chat API
 */
export const chat = async (messages: { role: string; content: string }[]) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Chat API failed: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('[API] Chat failed:', error);
    throw error;
  }
};

export const chatStream = async (
  messages: { role: string; content: string }[],
  onChunk: (content: string) => void,
  signal?: AbortSignal
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        stream: true
      }),
      signal
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Chat API failed: ${response.status} ${JSON.stringify(errorData)}`);
    }

    if (!response.body) throw new Error('No response body');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim() === '') continue;
        if (line.trim() === 'data: [DONE]') return;

        if (line.startsWith('data: ')) {
          try {
            const json = JSON.parse(line.slice(6));
            const content = json.choices[0]?.delta?.content || '';
            if (content) onChunk(content);
          } catch (e) {
            console.warn('Failed to parse stream chunk', e);
          }
        }
      }
    }
  } catch (error) {
    console.error('[API] Chat stream failed:', error);
    throw error;
  }
};

// Mock Image Generation (Fallback)
// 使用 Picsum Seed 机制，确保不同 Prompt 生成不同图片，且无预设分类限制
const generateMockImage = async (prompt: string): Promise<string> => {
  console.log('[API] Generating mock image for prompt:', prompt);

  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1500));

  // 使用 prompt + 时间戳作为随机种子，确保每次生成都不一样，但又与输入相关
  // 移除所有预设分类逻辑，实现真正的通用随机生图
  const seed = `${encodeURIComponent(prompt)}-${Date.now()}`;
  return `https://picsum.photos/seed/${seed}/800/600`;
};

/**
 * 生成图片 API
 * 使用火山引擎 Ark 接口 (OpenAI 兼容)
 */
export const generateImage = async (prompt: string): Promise<string> => {
  console.log('[API] Generating image for prompt:', prompt);

  // Extract aspect ratio from prompt if present (hacky way since we combined it)
  // Volcengine requires at least 3,686,400 pixels for doubao-seedream-4-5
  let size = "2048x2048"; // 1:1 (4,194,304 pixels)
  if (prompt.includes("比例: 3:4")) size = "1728x2304"; // 3:4 (3,981,312 pixels)
  else if (prompt.includes("比例: 16:9")) size = "2560x1440"; // 16:9 (3,686,400 pixels)
  // else 1:1 -> 1024x1024

  try {
    const response = await fetch(`${VOLCENGINE_API_URL}/api/v3/images/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VOLCENGINE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: VOLCENGINE_IMAGE_MODEL,
        prompt: prompt,
        size: size,
        n: 1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] Volcengine Error Details:', errorText);
      throw new Error(`API call failed with status: ${response.status}, body: ${errorText}`);
    }

    const data = await response.json();
    const imageUrl = data.data?.[0]?.url;
    
    if (!imageUrl) {
      console.warn('[API] Unexpected response format:', data);
      throw new Error('No image URL in response');
    }

    return imageUrl;

  } catch (error) {
    console.error('[API] Real API failed, falling back to mock:', error);
    return generateMockImage(prompt);
  }
};

export interface PromptEvaluationResult {
  score: number;
  analysis: string;
  suggestions: {
    original: string;
    improved: string;
    reason: string;
  }[];
}

export const evaluatePrompt = async (prompt: string): Promise<PromptEvaluationResult> => {
  const systemPrompt = `你是一个小红书 Prompt 优化专家。请对用户的 Prompt 进行评分（0-100）和点评。
  请严格按照以下 JSON 格式返回（纯 JSON，不要 Markdown）：
  {
    "score": 85,
    "analysis": "简短评价 Prompt 的清晰度和有效性",
    "suggestions": [
       { "original": "原描述", "improved": "优化后的描述", "reason": "优化理由（如增加受众、场景、语气等）" }
    ]
  }`;
  
  try {
    const response = await chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ]);
    
    const jsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Prompt evaluation failed:', error);
    return {
      score: 0,
      analysis: '评分服务暂时不可用',
      suggestions: []
    };
  }
};

export interface CapabilityTestTask {
  title: string;
  value: string;
  positioning: string;
  goal: string;
}

export const generateCapabilityTestTask = async (): Promise<CapabilityTestTask> => {
  const systemPrompt = `你是一个小红书运营专家。请随机生成一个具体的、有挑战性的小红书运营任务，用于测试运营人员的能力。
  
  任务范围（随机选择其一）：
  1. 美妆护肤类（如平价好物、成分党分析）
  2. 穿搭时尚类（如季节搭配、显瘦技巧）
  3. 家居生活类（如收纳整理、租房改造）
  4. 美食探店类（如独居食谱、网红店测评）
  5. 职场干货类（如面试技巧、工具推荐）

  请严格按照以下 JSON 格式返回（纯 JSON，不要 Markdown）：
  {
    "title": "任务标题（如：为一款平价国货散粉生成夏季控油测评笔记）",
    "value": "核心价值（如：通过真实测评展示产品的极致性价比与持妆能力，建立'学生党/油皮救星'的品牌心智。）",
    "positioning": "人设定位（如：专注于平价好物挖掘的真实测评博主，语气真诚、接地气，拒绝过度营销感。）",
    "goal": "核心目标（如：产出一篇高互动图文笔记（预期点赞收藏 500+），重点突出'8小时不脱妆'与'磨皮级柔焦'两大卖点，引导用户在评论区求链接。）"
  }`;

  try {
    const response = await chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: '请生成一个新的测试任务' }
    ]);

    const jsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Task generation failed:', error);
    // Fallback task
    return {
      title: "为一款平价国货散粉生成夏季控油测评笔记",
      value: "核心价值：通过真实测评展示产品的极致性价比与持妆能力，建立'学生党/油皮救星'的品牌心智。",
      positioning: "人设定位：专注于平价好物挖掘的真实测评博主，语气真诚、接地气，拒绝过度营销感。",
      goal: "核心目标：产出一篇高互动图文笔记（预期点赞收藏 500+），重点突出'8小时不脱妆'与'磨皮级柔焦'两大卖点，引导用户在评论区求链接。"
    };
  }
};

export interface ContentAuditResult {
  risks: {
    level: 'high' | 'medium' | 'low';
    type: string;
    description: string;
    suggestion: string;
  }[];
}

export const auditContent = async (content: string): Promise<ContentAuditResult> => {
  const systemPrompt = `你是一个小红书内容合规审计专家。请检查以下笔记内容是否存在风险（广告法极限词、虚假宣传、平台敏感词、诱导互动等）。
  请严格按照以下 JSON 格式返回（纯 JSON，不要 Markdown）：
  {
    "risks": [
      { "level": "high", "type": "风险类型", "description": "风险描述", "suggestion": "修改建议" }
    ]
  }
  如果无明显风险，请返回空数组。`;
  
  try {
    const response = await chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: content }
    ]);
    
    const jsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Content audit failed:', error);
    return { risks: [] };
  }
};

