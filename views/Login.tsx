import React from 'react';
import { getUsers } from '../utils';
import { User, UserRole } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const LoginView: React.FC<LoginProps> = ({ onLogin }) => {
  const users = getUsers();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-600 to-indigo-900 text-white">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-gray-800">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Daily Wage System</h1>
          <p className="text-gray-500">ระบบจัดการค่าจ้างรายวัน</p>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">เลือกบทบาทเพื่อเข้าใช้งาน (Demo)</p>
          
          <div className="space-y-2">
            {users.map(user => (
              <button
                key={user.id}
                onClick={() => onLogin(user)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all hover:shadow-md flex items-center gap-4 ${
                  user.role === UserRole.WORKER ? 'border-green-100 hover:border-green-500 bg-green-50' :
                  user.role === UserRole.SUPERVISOR ? 'border-blue-100 hover:border-blue-500 bg-blue-50' :
                  'border-purple-100 hover:border-purple-500 bg-purple-50'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                  user.role === UserRole.WORKER ? 'bg-green-500' :
                  user.role === UserRole.SUPERVISOR ? 'bg-blue-500' : 'bg-purple-500'
                }`}>
                  {user.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500 uppercase">{user.role}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
          <p>Mock Data & System Demo</p>
        </div>
      </div>
    </div>
  );
};
