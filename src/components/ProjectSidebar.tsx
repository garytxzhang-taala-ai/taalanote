import React, { useState } from 'react';
import { Plus, ChevronRight, ChevronDown, Folder, FileText, GraduationCap, History, BarChart2 } from 'lucide-react';
import { Project, EvaluationReport } from '../types';

interface ProjectSidebarProps {
  projects: Project[];
  testHistory?: EvaluationReport[];
  selectedProjectId: string | null;
  selectedTaskId: string | null;
  selectedReportId?: string | null;
  activeModule: 'project' | 'capability-test';
  onSelectProject: (projectId: string) => void;
  onSelectTask: (projectId: string, taskId: string) => void;
  onSelectReport?: (report: EvaluationReport) => void;
  onCreateProject: () => void;
}

export const ProjectSidebar: React.FC<ProjectSidebarProps> = ({ 
  projects, 
  testHistory = [],
  selectedProjectId, 
  selectedTaskId,
  selectedReportId,
  activeModule,
  onSelectProject, 
  onSelectTask,
  onSelectReport,
  onCreateProject
}) => {
  // Local state to track expanded projects (independent of selection)
  // Initialize with all projects expanded for better visibility
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set(projects.map(p => p.id)));

  const toggleExpand = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  if (activeModule === 'capability-test') {
    return (
      <div className="w-64 bg-gray-50 border-r flex flex-col shrink-0 h-full">
        <div className="p-4 border-b bg-gray-50">
           <div className="flex items-center gap-2 text-gray-800 font-bold px-2">
             <History size={20} className="text-taala-500" />
             <span>历史评测记录</span>
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-2 py-4">
          <div className="space-y-1">
            {testHistory.length > 0 ? (
              testHistory.map(report => (
                <div 
                  key={report.id}
                  onClick={() => onSelectReport?.(report)}
                  className={`
                    group flex flex-col px-3 py-3 rounded-lg cursor-pointer transition-all text-sm border
                    ${selectedReportId === report.id 
                      ? 'bg-white shadow-sm border-taala-200 ring-1 ring-taala-100' 
                      : 'border-transparent hover:bg-white hover:shadow-sm hover:border-gray-100 text-gray-700'}
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900 truncate flex-1">{report.taskId.replace('test-', '评测任务 ')}</span>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                      report.aiCapability.overallScore >= 85 ? 'bg-green-100 text-green-700' :
                      report.aiCapability.overallScore >= 70 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {report.aiCapability.overallScore}分
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                       <BarChart2 size={10} />
                       {report.date.split(' ')[0]}
                    </span>
                    <ChevronRight size={14} className={`text-gray-300 transition-transform ${selectedReportId === report.id ? 'translate-x-1 text-taala-400' : 'group-hover:translate-x-0.5'}`} />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400 text-sm">
                <GraduationCap size={32} className="mx-auto mb-2 opacity-20" />
                <p>暂无评测记录</p>
                <p className="text-xs mt-1">完成一次测试后将在此显示</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-gray-50 border-r flex flex-col shrink-0 h-full">
      <div className="p-4">
        <button 
          onClick={onCreateProject}
          className="w-full bg-taala-500 text-white rounded-lg py-2.5 px-4 flex items-center justify-center space-x-2 hover:bg-taala-600 transition shadow-sm font-medium text-sm"
        >
          <Plus size={18} />
          <span>新建项目</span>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        <div className="mb-6">
          <div className="text-xs font-semibold text-gray-400 mb-3 px-2 uppercase tracking-wider">我的项目</div>
          <div className="space-y-1">
            {projects.map(project => {
              const isExpanded = expandedProjects.has(project.id);
              const isProjectSelected = activeModule === 'project' && selectedProjectId === project.id && !selectedTaskId;

              return (
                <div key={project.id} className="select-none">
                  {/* Project Item */}
                  <div 
                    className={`
                      group flex items-center px-2 py-2 rounded-lg cursor-pointer transition-colors text-sm
                      ${isProjectSelected ? 'bg-white shadow-sm border border-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100'}
                    `}
                    onClick={() => onSelectProject(project.id)}
                  >
                    <button 
                      className="p-1 hover:bg-gray-200 rounded mr-1 text-gray-400"
                      onClick={(e) => toggleExpand(project.id, e)}
                    >
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                    <Folder size={16} className={`mr-2 ${isProjectSelected ? 'text-taala-500' : 'text-gray-400'}`} />
                    <span className="font-medium truncate flex-1">{project.name}</span>
                  </div>

                  {/* Tasks List (Collapsible) */}
                  {isExpanded && (
                    <div className="ml-4 pl-4 border-l border-gray-200 mt-1 space-y-0.5">
                      {project.tasks.map(task => {
                        const isTaskSelected = activeModule === 'project' && selectedTaskId === task.id;
                        return (
                          <div 
                            key={task.id}
                            className={`
                              flex items-center px-2 py-1.5 rounded-md cursor-pointer text-xs transition-colors
                              ${isTaskSelected ? 'bg-taala-50 text-taala-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}
                            `}
                            onClick={() => onSelectTask(project.id, task.id)}
                          >
                            <FileText size={12} className="mr-2 opacity-70" />
                            <span className="truncate">{task.title}</span>
                          </div>
                        );
                      })}
                      {project.tasks.length === 0 && (
                        <div className="px-2 py-1.5 text-xs text-gray-400 italic pl-6">
                          暂无任务
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
