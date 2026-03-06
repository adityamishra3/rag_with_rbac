import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import { checkHealth } from './api/client';

export default function App() {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [online, setOnline] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    checkHealth().then(setOnline);
    const id = setInterval(() => checkHealth().then(setOnline), 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden">
      <Sidebar selectedRoles={selectedRoles} onRolesChange={setSelectedRoles} online={online} darkMode={darkMode} onToggleDark={() => setDarkMode(v => !v)} />
      <div className="flex flex-col flex-1 min-w-0">
        <ChatArea selectedRoles={selectedRoles} />
      </div>
    </div>
  );
}
