import React from 'react';
import { Project } from '../types';
import { Target, Flag, Zap, FileText, Plus } from 'lucide-react';

interface ProjectDashboardProps {
  project: Project;
  onTaskClick: (taskId: string) => void;
  onCreateTask: () => void;
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ project, onTaskClick, onCreateTask }) => {
  return (
    <div className="flex-1 bg-gray-50 p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
           <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
           <div className="flex items-center space-x-2 text-sm text-gray-500">
             <span className="px-2 py-0.5 bg-taala-100 text-taala-700 rounded text-xs font-medium">{project.nature}</span>
             <span>•</span>
             <span>{project.tasks.length} 个任务</span>
           </div>
        </div>

        {/* Project Meta Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Target size={20} />
              </div>
              <h3 className="font-semibold text-gray-800">定位</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">{project.positioning}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <Flag size={20} />
              </div>
              <h3 className="font-semibold text-gray-800">短期目标</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">{project.shortTermGoal}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Zap size={20} />
              </div>
              <h3 className="font-semibold text-gray-800">愿景</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">{project.vision}</p>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50/50">
             <h3 className="font-bold text-gray-800 flex items-center gap-2">
               <FileText size={18} className="text-gray-500"/> 
               任务列表
             </h3>
             <button onClick={onCreateTask} className="px-3 py-1.5 bg-taala-500 text-white text-sm font-medium rounded-lg hover:bg-taala-600 transition flex items-center gap-1">
               <Plus size={16} /> 新建任务
             </button>
          </div>
          <div className="divide-y divide-gray-100">
             {project.tasks.length === 0 ? (
               <div className="p-8 text-center text-gray-500">暂无任务，开始创建一个吧！</div>
             ) : (
               project.tasks.map(task => (
                 <div 
                    key={task.id} 
                    onClick={() => onTaskClick(task.id)}
                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition group"
                 >
                    <div className="flex items-center gap-4">
                       <div className={`w-2 h-2 rounded-full ${task.status === 'published' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                       <div>
                          <div className="font-medium text-gray-900 group-hover:text-taala-600 transition">{task.title}</div>
                          <div className="text-xs text-gray-400 mt-0.5">最后修改: {task.lastModified}</div>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                         task.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                       }`}>
                         {task.status === 'published' ? '已发布' : '草稿'}
                       </span>
                    </div>
                 </div>
               ))
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
