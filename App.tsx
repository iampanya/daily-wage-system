import React, { useState, useEffect } from 'react';
import { LoginView } from './views/Login';
import { WorkerView } from './views/Worker';
import { SupervisorView } from './views/Supervisor';
import { AuditorView } from './views/Auditor';
import { User, UserRole } from './types';
import { initializeData, getUsers } from './utils';
import { LogOutIcon } from './components/Icons';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeData();
    // Simulate checking session or loading initial data
    setTimeout(() => setLoading(false), 500);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    // Removed confirm dialog to ensure logout works reliably on all devices
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 text-gray-400 gap-4">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm px-4 py-3 flex justify-between items-center no-print">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-base font-bold shadow-sm ${
             currentUser.role === UserRole.WORKER ? 'bg-green-600' :
             currentUser.role === UserRole.SUPERVISOR ? 'bg-blue-600' : 'bg-purple-600'
          }`}>
            {currentUser.name.charAt(0)}
          </div>
          <div className="leading-tight">
            <div className="font-bold text-gray-800 text-sm">{currentUser.name}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">{currentUser.role}</div>
          </div>
        </div>
        <button 
          type="button"
          onClick={handleLogout}
          className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors rounded-full active:scale-95"
          aria-label="ออกจากระบบ"
        >
          <LogOutIcon className="w-6 h-6" />
        </button>
      </nav>

      {/* Main Content */}
      <main className="p-4 md:p-6 max-w-4xl mx-auto">
        {currentUser.role === UserRole.WORKER && <WorkerView currentUser={currentUser} />}
        {currentUser.role === UserRole.SUPERVISOR && <SupervisorView currentUser={currentUser} />}
        {currentUser.role === UserRole.AUDITOR && <AuditorView />}
      </main>
    </div>
  );
}