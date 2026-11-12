import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, Settings, Bell, Zap, TrendingUp, AlertCircle, Play, Eye, BarChart3, Network } from 'lucide-react';

export default function VioletAIDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedAssistant, setSelectedAssistant] = useState(null);
  const [metrics, setMetrics] = useState({
    activeAssistants: 34,
    tasksInProgress: 18,
    systemReliability: 99.8,
    dataProcessed: 2.4,
    successRate: 98.7,
    activeLearners: 1247
  });

  const sidebarItems = [
    { icon: '🎯', label: 'Dashboard', id: 'dashboard', desc: 'Command Overview' },
    { icon: '🧠', label: 'AI Interface', id: 'ai', desc: 'Master Controls' },
    { icon: '👥', label: 'Assistants', id: 'assistants', desc: '77 AI Assistants' },
    { icon: '📓', label: 'Notebook', id: 'notebook', desc: 'Notes & Knowledge' },
    { icon: '⚙️', label: 'Task Engine', id: 'tasks', desc: 'Research & Tasks' },
    { icon: '🔬', label: 'Research OS', id: 'research', desc: 'Learning & Analysis' },
    { icon: '🎨', label: 'Content Studio', id: 'studio', desc: 'Media & Creation' },
    { icon: '🌐', label: 'Website Builder', id: 'website', desc: 'Sites & Pages' },
    { icon: '💼', label: 'Business Hub', id: 'business', desc: 'Sales & Proposals' },
    { icon: '📊', label: 'Analytics', id: 'analytics', desc: 'Metrics & Insights' },
    { icon: '🚀', label: 'Delivery Center', id: 'delivery', desc: 'Deployment' },
    { icon: '🏥', label: 'System Health', id: 'health', desc: 'Diagnostics' },
    { icon: '⚡', label: 'Settings', id: 'settings', desc: 'Configuration' },
  ];

  const assistants = [
    { id: 1, name: 'Communication Analyst', role: 'Language Patterns', color: 'emerald' },
    { id: 2, name: 'Vibration Mapper', role: 'Frequency Analysis', color: 'blue' },
    { id: 3, name: 'Pattern Recognizer', role: 'Data Patterns', color: 'purple' },
    { id: 4, name: 'Music Theorist', role: 'Sonic Patterns', color: 'indigo' },
    { id: 5, name: 'Research Coordinator', role: 'Study Design', color: 'pink' },
    { id: 6, name: 'Knowledge Synthesizer', role: 'Integration', color: 'cyan' },
  ];

  const recentTasks = [
    { id: 1, title: 'Analyze Communication Patterns', priority: 'high', status: 'In Progress' },
    { id: 2, title: 'Vibration Frequency Study', priority: 'medium', status: 'In Progress' },
    { id: 3, title: 'Language Pattern Mapping', priority: 'high', status: 'In Progress' },
  ];

  const researchModules = [
    { name: 'Vibration Science', items: 285, icon: '🔊' },
    { name: 'Communication Linguistics', items: 412, icon: '💬' },
    { name: 'Music Theory & Patterns', items: 356, icon: '🎵' },
    { name: 'Pattern Recognition', items: 528, icon: '🔍' },
    { name: 'Language Evolution', items: 203, icon: '📚' },
    { name: 'Unconventional Thinking', items: 441, icon: '💭' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-violet-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 flex h-screen">
        {/* ==================== SIDEBAR ==================== */}
        <aside className="w-80 border-r border-violet-500/20 bg-slate-950/80 backdrop-blur-xl overflow-y-auto scrollbar-hide">
          <div className="p-8 border-b border-violet-500/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-purple-600 rounded-lg flex items-center justify-center text-xl font-bold">
                ⭐
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-wider">VIOLET AI</h1>
                <p className="text-xs text-violet-400 tracking-widest">MASTER COMMAND CENTER</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">Research • Learning • Exploration</p>
          </div>

          {/* Search */}
          <div className="p-6 border-b border-violet-500/20">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Ask Violet AI or use a command..."
                className="w-full bg-slate-900 border border-violet-500/30 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
          </div>

          {/* Sidebar Items */}
          <nav className="p-4 space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                  activeSection === item.id
                    ? 'bg-violet-500/30 border-l-2 border-violet-400'
                    : 'hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{item.label}</p>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </div>
              </button>
            ))}
          </nav>

          {/* Quick Actions */}
          <div className="p-6 border-t border-violet-500/20">
            <p className="text-xs font-bold text-violet-400 mb-3 tracking-widest">QUICK ACTIONS</p>
            <div className="space-y-2">
              <button className="w-full bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 rounded-lg px-3 py-2 text-xs font-semibold text-left">
                📝 New Task
              </button>
              <button className="w-full bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg px-3 py-2 text-xs font-semibold text-left">
                🎯 Start Session
              </button>
              <button className="w-full bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg px-3 py-2 text-xs font-semibold text-left">
                📤 Upload Files
              </button>
            </div>
          </div>
        </aside>

        {/* ==================== MAIN CONTENT ==================== */}
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          {/* Header */}
          <header className="border-b border-violet-500/20 bg-slate-950/80 backdrop-blur-xl p-6 sticky top-0 z-20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black tracking-wider">WELCOME BACK, RESEARCHER</h2>
                <p className="text-sm text-slate-400 mt-1">All systems online. Your research center is fully operational.</p>
              </div>
              <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-slate-800 rounded-lg transition">
                  <Bell className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-slate-800 rounded-lg transition">
                  <Settings className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-purple-600 rounded-full flex items-center justify-center font-bold">
                  R
                </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="p-8">
            {/* ========== METRICS ROW ========== */}
            <div className="grid grid-cols-6 gap-4 mb-8">
              {[
                { label: 'ACTIVE ASSISTANTS', value: metrics.activeAssistants, unit: '/77', color: 'from-emerald-500' },
                { label: 'TASKS IN PROGRESS', value: metrics.tasksInProgress, unit: '', color: 'from-blue-500' },
                { label: 'SYSTEM RELIABILITY', value: metrics.systemReliability, unit: '%', color: 'from-green-500' },
                { label: 'DATA PROCESSED (24H)', value: metrics.dataProcessed, unit: 'TB', color: 'from-cyan-500' },
                { label: 'SUCCESS RATE', value: metrics.successRate, unit: '%', color: 'from-green-400' },
                { label: 'ACTIVE LEARNERS', value: '1.2K', unit: '+124', color: 'from-purple-500' },
              ].map((metric, idx) => (
                <div key={idx} className={`bg-gradient-to-br ${metric.color} to-slate-900 border border-slate-700 rounded-xl p-4`}>
                  <p className="text-xs text-slate-300 font-bold tracking-widest mb-2">{metric.label}</p>
                  <p className="text-3xl font-black tracking-tight">
                    {metric.value}<span className="text-lg text-slate-400">{metric.unit}</span>
                  </p>
                  {idx === 2 && <div className="w-full h-1 bg-green-500 rounded-full mt-2"></div>}
                </div>
              ))}
            </div>

            {/* ========== MAIN GRID ========== */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              {/* System Overview */}
              <div className="col-span-2 border border-violet-500/20 bg-slate-900/50 backdrop-blur rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black tracking-wider">SYSTEM AWARENESS ENVIRONMENT</h3>
                  <Play className="w-5 h-5 text-violet-400" />
                </div>
                
                <div className="relative w-full h-80 flex items-center justify-center mb-6">
                  {/* Central AI Logo */}
                  <div className="absolute">
                    <div className="w-32 h-32 border-2 border-violet-400 rounded-full flex items-center justify-center animate-pulse">
                      <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-4xl font-black">
                        🧠
                      </div>
                    </div>
                  </div>

                  {/* Orbiting Elements */}
                  {['Data Layer', 'Central Hub', 'Analytics', 'Security', 'Applications', 'Interface'].map((item, idx) => {
                    const angle = (idx / 6) * 360;
                    const x = Math.cos((angle * Math.PI) / 180) * 120;
                    const y = Math.sin((angle * Math.PI) / 180) * 120;
                    return (
                      <div
                        key={idx}
                        className="absolute w-24 h-24 border border-slate-600 rounded-lg bg-slate-800/50 flex items-center justify-center text-xs font-bold text-center p-2"
                        style={{
                          transform: `translate(${x}px, ${y}px)`,
                        }}
                      >
                        {item}
                      </div>
                    );
                  })}
                </div>

                <div className="text-xs text-slate-400 text-center">
                  BUILDING THE DIGITAL RESEARCH ECOSYSTEM
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <div className="border border-violet-500/20 bg-slate-900/50 rounded-xl p-4">
                  <p className="text-xs font-bold text-violet-400 mb-3 tracking-widest">COMMAND CENTER</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status</span>
                      <span className="text-green-400 font-bold">🟢 ONLINE</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sessions</span>
                      <span className="font-bold">847</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Response Time</span>
                      <span className="font-bold">142ms</span>
                    </div>
                  </div>
                </div>

                <div className="border border-violet-500/20 bg-slate-900/50 rounded-xl p-4">
                  <p className="text-xs font-bold text-violet-400 mb-3 tracking-widest">RESEARCH FOCUS</p>
                  <div className="space-y-2 text-sm">
                    <p className="text-violet-300">Communication Patterns</p>
                    <p className="text-slate-400">Vibration Analysis</p>
                    <p className="text-slate-400">Music Theory</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ========== RESEARCH MODULES ========== */}
            <div className="border border-violet-500/20 bg-slate-900/50 backdrop-blur rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-black tracking-wider mb-6">RESEARCH MODULES & RESOURCES</h3>
              <div className="grid grid-cols-3 gap-4">
                {researchModules.map((module, idx) => (
                  <div
                    key={idx}
                    className="border border-slate-700 bg-slate-800/50 hover:bg-slate-800 rounded-lg p-4 cursor-pointer transition"
                  >
                    <p className="text-2xl mb-2">{module.icon}</p>
                    <p className="font-semibold text-sm mb-1">{module.name}</p>
                    <p className="text-xs text-slate-400">{module.items} Resources</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ========== ASSISTANTS & TASKS ========== */}
            <div className="grid grid-cols-2 gap-6">
              <div className="border border-violet-500/20 bg-slate-900/50 backdrop-blur rounded-2xl p-6">
                <h3 className="text-lg font-black tracking-wider mb-4">ACTIVE ASSISTANTS</h3>
                <div className="space-y-3">
                  {assistants.map((asst) => (
                    <div
                      key={asst.id}
                      onClick={() => setSelectedAssistant(asst.id)}
                      className={`p-3 rounded-lg cursor-pointer transition border ${
                        selectedAssistant === asst.id
                          ? 'border-violet-400 bg-violet-500/20'
                          : 'border-slate-700 bg-slate-800/30 hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm">{asst.name}</p>
                          <p className="text-xs text-slate-400">{asst.role}</p>
                        </div>
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-violet-500/20 bg-slate-900/50 backdrop-blur rounded-2xl p-6">
                <h3 className="text-lg font-black tracking-wider mb-4">RESEARCH TASKS</h3>
                <div className="space-y-3">
                  {recentTasks.map((task) => (
                    <div key={task.id} className="p-3 border border-slate-700 bg-slate-800/30 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{task.title}</p>
                          <p className="text-xs text-slate-400 mt-1">Priority: {task.priority}</p>
                        </div>
                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                          {task.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
