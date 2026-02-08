import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ProjectSidebar } from './components/ProjectSidebar';
import { ChatArea } from './components/ChatArea';
import { PreviewArea } from './components/PreviewArea';
import { PromptEvaluation } from './components/PromptEvaluation';
import { ContentAudit } from './components/ContentAudit';
import { ProjectDashboard } from './components/ProjectDashboard';
import { ImageGenerator } from './components/ImageGenerator';
import { NewProjectModal } from './components/NewProjectModal';
import { NewTaskModal } from './components/NewTaskModal';
import { CapabilityTestLayout } from './components/CapabilityTest/CapabilityTestLayout';
import { EvaluationReportView } from './components/EvaluationReportView';
import { HelpCenterModal } from './components/HelpCenterModal';
import { Login } from './components/Login';
import { MOCK_PROJECTS } from './data/mock';
import { Project, Task, EvaluationReport } from './types';
import {
  evaluatePrompt,
  auditContent,
  PromptEvaluationResult,
  ContentAuditResult
} from './services/api';
import { generateEvaluationReport } from './services/evaluationService';
import { X } from 'lucide-react';

function App() {
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  
  // Selection State
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'chat' | 'image-gen'>('chat');
  const [activeModule, setActiveModule] = useState<'project' | 'capability-test'>('project');
  const [currentEvaluationReport, setCurrentEvaluationReport] = useState<EvaluationReport | null>(null);
  const [testHistory, setTestHistory] = useState<EvaluationReport[]>([]);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  
  // Analysis State
  const [promptEvaluation, setPromptEvaluation] = useState<PromptEvaluationResult | null>(null);
  const [contentAudit, setContentAudit] = useState<ContentAuditResult | null>(null);

  // Derived State
  const activeProject = projects.find(p => p.id === selectedProjectId);
  const selectedTask = activeProject?.tasks.find(t => t.id === selectedTaskId);

  // Auth Handler
  const handleLogin = (username: string) => {
    setCurrentUser(username);
    setIsLoggedIn(true);
    
    // Reset UI state
    setSelectedTaskId(null);
    setPreviewImage(null);
    setViewMode('chat');
    setPromptEvaluation(null);
    setContentAudit(null);
    
    if (username === 'admin') {
      setProjects([]);
      setSelectedProjectId(null);
    } else if (username === 'adminzhang') {
      setProjects(MOCK_PROJECTS);
      // Select the first project if available
      if (MOCK_PROJECTS.length > 0) {
        setSelectedProjectId(MOCK_PROJECTS[0].id);
      }
    }
  };

  // Handlers
  const handleSelectProject = (projectId: string) => {
    setActiveModule('project');
    setSelectedProjectId(projectId);
    setSelectedTaskId(null); // Deselect task when selecting a project
    setPreviewImage(null);
  };

  const handleSwitchModule = (module: 'project' | 'capability-test') => {
    setActiveModule(module);
    if (module === 'capability-test') {
      setSelectedProjectId(null);
      setSelectedTaskId(null);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setProjects([]);
    setSelectedProjectId(null);
    setSelectedTaskId(null);
    setPreviewImage(null);
    setViewMode('chat');
    setPromptEvaluation(null);
    setContentAudit(null);
  };

  const handleSelectTask = (projectId: string, taskId: string) => {
    setSelectedProjectId(projectId);
    setSelectedTaskId(taskId);
    setPreviewImage(null); // Reset preview image when switching tasks
    setViewMode('chat');
  };

  const handleCreateProject = () => {
    setIsNewProjectModalOpen(true);
  };

  const handleProjectCreated = (newProject: Project) => {
    setProjects(prev => [...prev, newProject]);
    setSelectedProjectId(newProject.id);
    setSelectedTaskId(null);
  };

  const handleCreateTask = () => {
    if (activeProject) {
      setIsNewTaskModalOpen(true);
    }
  };

  const handleTaskCreated = (newTask: Task) => {
    if (!activeProject) return;
    
    setProjects(prev => prev.map(p => {
      if (p.id === activeProject.id) {
        return {
          ...p,
          tasks: [newTask, ...p.tasks]
        };
      }
      return p;
    }));
    
    // Select the new task
    setSelectedTaskId(newTask.id);
  };

  const handleUserMessage = async (message: string) => {
    // Reset previous analysis
    setPromptEvaluation(null);
    setContentAudit(null);
    
    try {
      const result = await evaluatePrompt(message);
      setPromptEvaluation(result);
    } catch (e) {
      console.error("Failed to evaluate prompt", e);
    }
  };

  const handleAssistantMessage = async (message: string) => {
    try {
      const result = await auditContent(message);
      setContentAudit(result);
    } catch (e) {
      console.error("Failed to audit content", e);
    }
  };

  const handleReviewTask = async () => {
    if (!selectedTask) return;
    
    // Mock messages for existing task review
    // In a real app, we'd pull the actual chat history for this task
    const mockMessages = [
      { role: 'user', content: `我想写关于 ${selectedTask.title} 的笔记` },
      { role: 'assistant', content: '好的，我们来拆解一下...' },
      { role: 'user', content: '把痛点写得再具体一点' },
      { role: 'assistant', content: '已修改...' },
      { role: 'user', content: '很好，生成正文吧' }
    ];

    const report = await generateEvaluationReport(
      mockMessages as any, 
      { title: selectedTask.title, goal: '产出爆款笔记' }
    );
    setCurrentEvaluationReport(report);
  };

  const handleReportGenerated = (report: EvaluationReport) => {
    setTestHistory(prev => [report, ...prev]);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50 text-sm text-gray-900 font-sans overflow-hidden">
      <Navbar 
        username={currentUser} 
        activeModule={activeModule}
        onSwitchModule={handleSwitchModule}
        onOpenHelp={() => setIsHelpModalOpen(true)}
        onLogout={handleLogout} 
      />
      <div className="flex-1 flex overflow-hidden">
        <ProjectSidebar 
          projects={projects}
          testHistory={testHistory}
          selectedProjectId={selectedProjectId}
          selectedTaskId={selectedTaskId}
          selectedReportId={currentEvaluationReport?.id}
          activeModule={activeModule}
          onSelectProject={handleSelectProject}
          onSelectTask={handleSelectTask}
          onSelectReport={setCurrentEvaluationReport}
          onCreateProject={handleCreateProject}
        />
        
        <div className="flex-1 flex flex-col min-w-0">
          {activeModule === 'capability-test' ? (
             <CapabilityTestLayout onReportGenerated={handleReportGenerated} />
          ) : selectedTaskId ? (
             // Task View (Chat + Preview + Bottom Panels)
             <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="flex-1 flex overflow-hidden">
                  {viewMode === 'chat' ? (
                    <ChatArea 
                      onAddToPreview={setPreviewImage} 
                      onSwitchToImageGen={() => setViewMode('image-gen')}
                    />
                  ) : (
                    <ImageGenerator 
                      onBack={() => setViewMode('chat')}
                      onAddToPreview={setPreviewImage}
                    />
                  )}
                  <PreviewArea 
                    task={selectedTask} 
                    previewImage={previewImage} 
                    onReviewTask={handleReviewTask}
                  />
                </div>
                <div className="h-48 border-t bg-white flex shrink-0">
                  <PromptEvaluation data={promptEvaluation} />
                  <ContentAudit data={contentAudit} />
                </div>
             </div>
          ) : activeProject ? (
             // Project Dashboard View
             <ProjectDashboard 
                project={activeProject} 
                onTaskClick={(taskId) => handleSelectTask(activeProject.id, taskId)}
                onCreateTask={handleCreateTask}
             />
          ) : (
             // Empty State (Should rarely happen)
             <div className="flex-1 flex items-center justify-center text-gray-400">
                请选择一个项目或任务
             </div>
          )}
        </div>
      </div>
      
      <NewProjectModal 
        isOpen={isNewProjectModalOpen} 
        onClose={() => setIsNewProjectModalOpen(false)} 
        onCreate={handleProjectCreated} 
      />
      
      <HelpCenterModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      {activeProject && (
        <NewTaskModal
          isOpen={isNewTaskModalOpen}
          onClose={() => setIsNewTaskModalOpen(false)}
          onCreate={handleTaskCreated}
          projectId={activeProject.id}
        />
      )}

      {currentEvaluationReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-8 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">任务回顾报告</h3>
              <button 
                onClick={() => setCurrentEvaluationReport(null)} 
                className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition"
              >
                <X size={20} />
              </button>
            </div>
            <EvaluationReportView report={currentEvaluationReport} />
          </div>
        </div>
      )}
    </div>
  )
}

export default App
