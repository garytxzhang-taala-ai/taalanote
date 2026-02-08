import { Topic } from '../types';
import { chat } from './api';

export interface HotspotData {
  topic: string;
  keywords: { word: string; increase: string }[];
}

export interface AccountData {
  topTags: string[];
  preference: string;
}

export const mockHotspotTool = async (): Promise<HotspotData[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return [
    { topic: "夏季护肤", keywords: [{ word: "控油", increase: "+120%" }, { word: "防晒", increase: "+85%" }] },
    { topic: "平价彩妆", keywords: [{ word: "学生党", increase: "+200%" }, { word: "国货", increase: "+150%" }] },
  ];
};

export const mockAccountBindingTool = async (): Promise<AccountData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return {
    topTags: ["美妆教程", "沉浸式护肤", "平价好物"],
    preference: "图文为主，偏好清晰的步骤图",
  };
};

export const generateTopics = async (hotspots: HotspotData[], account: AccountData): Promise<Topic[]> => {
  const prompt = `
    作为小红书运营专家，请根据以下数据生成5个爆款选题。
    
    热点数据: ${JSON.stringify(hotspots)}
    账号数据: ${JSON.stringify(account)}
    
    请严格按照以下 JSON 格式返回数组（纯 JSON，不要包含 Markdown 代码块标记）：
    [
      {
        "title": "标题",
        "hotness": 5, // 1-5的数字
        "competition": "high" | "medium" | "low",
        "format": "image_text" | "video",
        "logic": {
          "painPoint": "痛点",
          "solution": "解决方案",
          "quantifier": "量化指标"
        }
      }
    ]
  `;

  try {
    const response = await chat([{ role: 'user', content: prompt }]);
    const jsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("LLM Generation failed, using fallback:", error);
    // Fallback data
    return [
      {
        title: "油皮亲妈！5款百元内控油散粉测评，持妆12小时不斑驳",
        hotness: 5,
        competition: 'high',
        format: 'image_text',
        logic: { painPoint: "夏季脱妆", solution: "5款定妆技巧", quantifier: "持妆12小时" }
      },
      {
        title: "早八党必看！3分钟极速出门妆，伪素颜天花板",
        hotness: 4,
        competition: 'medium',
        format: 'video',
        logic: { painPoint: "早起时间紧", solution: "极速化妆流程", quantifier: "3分钟" }
      }
    ];
  }
};

export const optimizeCustomTopic = async (input: string): Promise<Topic> => {
  const prompt = `
    作为小红书运营专家，请优化以下选题标题，使其更具吸引力（爆款感）。
    
    原标题: "${input}"
    
    请严格按照以下 JSON 格式返回单个对象（纯 JSON，不要包含 Markdown 代码块标记）：
    {
      "title": "优化后的标题",
      "hotness": 4, // 1-5
      "competition": "medium",
      "format": "image_text",
      "logic": {
        "painPoint": "痛点",
        "solution": "解决方案",
        "quantifier": "量化指标"
      },
      "keywords": ["关键词1", "关键词2"]
    }
  `;

  try {
    const response = await chat([{ role: 'user', content: prompt }]);
    const jsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("LLM Optimization failed, using fallback:", error);
    return {
      title: `优化版：${input} - 必看攻略！3个关键点避雷`,
      hotness: 4,
      competition: 'medium',
      format: 'image_text',
      logic: { painPoint: "用户痛点", solution: "优化方案", quantifier: "3个" },
      keywords: ["热词1", "热词2"]
    };
  }
};

export const generateCrossProjectTopics = async (): Promise<string[]> => {
  const prompt = `
    作为小红书运营专家，请生成 2-3 个跨账号/跨矩阵联动的内容建议。
    格式要求：直接返回 JSON 字符串数组，例如 ["建议1", "建议2"]。不要包含 Markdown 标记。
  `;
  
  try {
    const response = await chat([{ role: 'user', content: prompt }]);
    const jsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("LLM Cross-project failed, using fallback:", error);
    return [
      "流量号发「新手化妆误区」，官方号同步发「误区对应产品解决方案」",
      "个人号发「我的护肤血泪史」，品牌号发「成分党分析」"
    ];
  }
}
