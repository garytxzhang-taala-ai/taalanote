export interface Task {
  id: string;
  title: string;
  status: 'draft' | 'published';
  lastModified: string;
  topic?: Topic;
  evaluationReport?: EvaluationReport;
  isCapabilityTest?: boolean;
}

export interface ScoreItem {
  score: number;
  comment: string;
  evidence?: string[];
}

export interface EvaluationReport {
  id: string;
  date: string;
  taskId: string;
  // Dimension 1: Content Evaluation
  contentScore: {
    total: number;
    dimensions: {
      aiTrace: ScoreItem;       // AI 使用痕迹
      goalAlignment: ScoreItem; // 符合长短期目标
      positioning: ScoreItem;   // 符合定位
    };
    analysis: string;
  };
  // Dimension 2: AI Capability
  aiCapability: {
    problemFraming: ScoreItem;
    taskDecomposition: ScoreItem;
    qualityEvaluation: ScoreItem;
    contextEngineering: ScoreItem;
    humanAIBoundary: ScoreItem;
    reflectionIteration: ScoreItem;
    overallScore: number;
    summary: string;
  };
  // Dimension 3: Prompt Style
  promptStyle: {
    type: 'comprehensive' | 'conversational' | 'mixed';
    analysis: string;
    evidence?: string[];
  };
  // Metrics
  metrics: {
    interactionCount: number;
    adoptionRate: number; // 0-1
    duration: number; // seconds
  };
}

export interface Topic {
  title: string;
  hotness: number; // 1-5
  competition: 'low' | 'medium' | 'high';
  format: 'image_text' | 'video';
  logic: {
    painPoint: string;
    solution: string;
    quantifier: string;
  };
  keywords?: string[]; // For custom optimization analysis
}

export interface Project {
  id: string;
  name: string;
  nature: string;
  positioning: string;
  shortTermGoal: string;
  vision: string;
  tasks: Task[];
}
