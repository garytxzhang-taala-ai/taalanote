import { EvaluationReport, ScoreItem } from '../types';

export const generateEvaluationReport = async (
  messages: { role: 'user' | 'assistant'; content: string }[],
  task: { title: string; goal: string },
  previewData?: { title?: string; content?: string; image?: string | null }
): Promise<EvaluationReport> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const userMessages = messages.filter(m => m.role === 'user');
  const interactionCount = userMessages.length;

  // 1. Validation: Check if there is actual user input
  if (interactionCount === 0) {
     return {
        id: Date.now().toString(),
        date: new Date().toLocaleString(),
        taskId: 'test-' + Date.now(),
        contentScore: {
            total: 0,
            dimensions: {
                aiTrace: { score: 0, comment: "无有效输入", evidence: [] },
                goalAlignment: { score: 0, comment: "无有效输入", evidence: [] },
                positioning: { score: 0, comment: "无有效输入", evidence: [] }
            },
            analysis: "未检测到任何用户交互。请在对话框中输入指令与 AI 协作完成任务。"
        },
        aiCapability: {
            problemFraming: { score: 0, comment: "未开始任务", evidence: [] },
            taskDecomposition: { score: 0, comment: "未开始任务", evidence: [] },
            qualityEvaluation: { score: 0, comment: "未开始任务", evidence: [] },
            contextEngineering: { score: 0, comment: "未开始任务", evidence: [] },
            humanAIBoundary: { score: 0, comment: "未开始任务", evidence: [] },
            reflectionIteration: { score: 0, comment: "未开始任务", evidence: [] },
            overallScore: 0,
            summary: "本次测试未检测到有效操作。请尝试向 AI 发送指令，引导它完成小红书笔记创作。"
        },
        promptStyle: {
            type: 'mixed',
            analysis: "无",
            evidence: []
        },
        metrics: {
            interactionCount: 0,
            adoptionRate: 0,
            duration: 0
        }
     };
  }

  const avgLength = userMessages.reduce((acc, m) => acc + m.content.length, 0) / (interactionCount || 1);

  // Analyze Preview Data
  const hasImage = !!previewData?.image;
  const hasContent = !!previewData?.content;
  const content = previewData?.content || '';

  // Determine Prompt Style
  let promptStyleType: 'comprehensive' | 'conversational' | 'mixed' = 'mixed';
  if (avgLength > 100 && interactionCount < 5) {
    promptStyleType = 'comprehensive';
  } else if (interactionCount > 8) {
    promptStyleType = 'conversational';
  }

  // Generate Score based on heuristics (Mock logic)
  const baseScore = 75;
  const iterationBonus = Math.min(interactionCount * 2, 10);
  const lengthBonus = Math.min(avgLength / 10, 5);
  const imageBonus = hasImage ? 5 : 0;
  
  const overallScore = Math.min(baseScore + iterationBonus + lengthBonus + imageBonus, 98);

  // Helper for generating score items
  const createScore = (score: number, comment: string, evidences: string[] = []): ScoreItem => ({
    score,
    comment,
    evidence: evidences
  });

  // Extract Mock Evidence from Content/Messages
  const contentEvidence = hasContent 
    ? [`检测到笔记包含 ${content.length} 字的正文。`, `检测到关键词覆盖：${task.title.substring(0, 4)}...`] 
    : ['未检测到有效正文内容'];
    
  const interactionEvidence = userMessages.length > 0 
    ? [`用户互动了 ${userMessages.length} 轮`, `平均指令长度 ${Math.floor(avgLength)} 字`] 
    : [];

  return {
    id: Date.now().toString(),
    date: new Date().toLocaleString(),
    taskId: 'test-' + Date.now(),
    
    // Dimension 1: Content Evaluation
    contentScore: {
      total: Math.floor(Math.random() * 15) + 80, // 80-95
      dimensions: {
        aiTrace: createScore(
          85, 
          "AI 痕迹控制尚可，但部分连接词仍显生硬。",
          ["检测到'首先'、'其次'等结构化连接词使用频率较高。", "表情包使用密度适中，符合真人习惯。"]
        ),
        goalAlignment: createScore(
          90,
          "内容高度符合任务设定的核心目标。",
          [`正文明确提到了任务要求的核心卖点。`, `标题"${previewData?.title || task.title}"具有较强吸引力。`]
        ),
        positioning: createScore(
          88,
          "语气和人设基本符合定位要求。",
          ["使用了第一人称叙述。", "口语化表达占比 70% 以上。"]
        )
      },
      analysis: `生成的内容结构完整，能够覆盖任务要求的痛点与解决方案。${hasImage ? '配图生成成功，视觉效果良好。' : '未检测到最终配图，建议配合图片提升笔记吸引力。'}但在'小红书味'（如表情包密度、口语化程度）上还有提升空间。`
    },
    
    // Dimension 2: AI Capability
    aiCapability: {
      problemFraming: createScore(
        85,
        "能够清晰定义任务目标，但在初始Prompt中对'目标受众'的描述还可以更具体。",
        interactionEvidence.length > 0 ? [`首轮指令包含了明确的任务背景设定。`] : []
      ),
      taskDecomposition: createScore(
        interactionCount > 3 ? 90 : 75,
        interactionCount > 3 
          ? "展现了优秀的分步执行能力，先定大纲再填内容，逻辑清晰。" 
          : "倾向于一次性生成所有内容，建议尝试将任务拆解为'选题-大纲-正文'多步进行。",
        [`将任务拆分为 ${interactionCount} 个交互步骤。`]
      ),
      qualityEvaluation: createScore(
        82,
        "对AI生成内容的幻觉（如虚构成分）有基本的辨识能力，但对'网感'的把控还需加强。",
        ["未出现明显的逻辑矛盾。", "修正了 AI 生成的生硬表达。"]
      ),
      contextEngineering: createScore(
        88,
        "能够有效地将任务背景（平价、学生党）传递给AI，上下文保持良好。",
        ["指令中包含'学生党'、'平价'等上下文约束关键词。"]
      ),
      humanAIBoundary: createScore(
        80,
        "能够主导创作方向，但在具体文案润色上可能过度依赖AI，建议保留更多个人风格。",
        ["主要依赖 AI 生成完整段落，人工修改痕迹较少。"]
      ),
      reflectionIteration: createScore(
        interactionCount > 5 ? 92 : 70,
        interactionCount > 5
          ? "具备极强的迭代意识，通过多轮对话不断修正AI的输出，最终效果显著提升。"
          : "较少进行追问和修正，建议在AI输出不完美时大胆提出修改意见。",
        interactionCount > 5 ? ["第 3 轮交互中提出了具体的修改意见。"] : ["交互轮次较少，未进行深度迭代。"]
      ),
      overallScore: Math.floor(overallScore),
      summary: "你已经具备了良好的 AI 协作基础，特别是在明确任务目标方面表现出色。进阶建议：尝试更精细的任务拆解，并像'主编'一样严格审核 AI 的输出，多轮打磨以追求极致效果。"
    },
    
    // Dimension 3: Prompt Style
    promptStyle: {
      type: promptStyleType,
      analysis: promptStyleType === 'comprehensive'
        ? "你倾向于通过一个详尽的 Prompt 一次性解决问题。这种风格适合明确的任务，但面对复杂创作时，可能导致 AI 顾此失彼。"
        : promptStyleType === 'conversational'
        ? "你喜欢通过对话一步步引导 AI。这是一种非常高效的协作模式，能够精准控制每个环节的产出质量。"
        : "你灵活结合了长指令与短对话，既有全局观又能处理细节，继续保持！",
      evidence: [
        `平均指令长度: ${Math.floor(avgLength)} 字符`,
        `总交互轮次: ${interactionCount} 次`
      ]
    },
    
    metrics: {
      interactionCount,
      adoptionRate: 0.85, // Mock
      duration: 120 // Mock
    }
  };
};
