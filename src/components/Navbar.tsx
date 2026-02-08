import React from 'react';

interface NavbarProps {
  username?: string | null;
  activeModule: 'project' | 'capability-test';
  onSwitchModule: (module: 'project' | 'capability-test') => void;
  onOpenHelp?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ username, activeModule, onSwitchModule, onOpenHelp, onLogout }) => (
  <div className="h-14 bg-white border-b flex items-center justify-between px-4 shrink-0 z-10 shadow-sm">
    <div className="flex items-center space-x-8">
      <div className="font-bold text-xl text-taala-500 tracking-tight flex items-center gap-2">
        <span>TaalaNote</span>
      </div>
      <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button 
          onClick={() => onSwitchModule('project')}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
            activeModule === 'project' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
          }`}
        >
          我的项目
        </button>
        <button 
          onClick={() => onSwitchModule('capability-test')}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
            activeModule === 'capability-test' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
          }`}
        >
          能力测试
        </button>
        <button 
          onClick={onOpenHelp}
          className="px-3 py-1.5 text-sm font-medium rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
        >
          帮助中心
        </button>
      </nav>
    </div>
    <div className="flex items-center space-x-3">
      <div className="flex flex-col items-end">
        <div className="text-xs text-gray-500">{username || 'Guest'}</div>
        {onLogout && (
          <button 
            onClick={onLogout}
            className="text-[10px] text-red-500 hover:text-red-700 cursor-pointer"
          >
            退出登录
          </button>
        )}
      </div>
      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-taala-400 to-pink-500 border-2 border-white shadow-sm"></div>
    </div>
  </div>
);
