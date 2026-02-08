import React, { useState } from 'react';

interface LoginProps {
  onLogin: (username: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username === 'admin' && password === 'admin') {
      onLogin('admin');
    } else if (username === 'adminzhang' && password === 'adminzhang') {
      onLogin('adminzhang');
    } else {
      setError('用户名或密码错误');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">TaalaNote 运营平台</h1>
          <p className="mt-2 text-gray-600">登录您的账户</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-100 rounded-md">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              用户名
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-taala-500 focus:border-taala-500"
              placeholder="请输入用户名"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              密码
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-taala-500 focus:border-taala-500"
              placeholder="请输入密码"
            />
          </div>
          
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-taala-500 rounded-md hover:bg-taala-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-taala-500"
          >
            登录
          </button>
        </form>
        
        <div className="text-sm text-center text-gray-500">
          <p>默认账号:</p>
          <p>开发者: admin / admin</p>
          <p>用户: adminzhang / adminzhang</p>
        </div>
      </div>
    </div>
  );
}
