/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, MessageSquare, Settings as SettingsIcon, Database, Activity, ShieldCheck, Home, User, Folder } from 'lucide-react';
import ChatInterface from './components/ChatInterface';
import Workspace from './components/Workspace';
import LandingPage from './components/landing/LandingPage';
import KnowledgeBase from './components/KnowledgeBase';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import Profile from './components/Profile';
import ClickSpark from './components/bits/ClickSpark';

type View = 'landing' | 'workspace' | 'knowledge' | 'analytics' | 'settings' | 'profile' | 'chat';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('landing');

  return (
    <>
      <ClickSpark />

      <AnimatePresence mode="wait">
        {currentView === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LandingPage onNavigate={(view) => setCurrentView(view as View)} />
          </motion.div>
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex h-screen bg-[#050505] text-zinc-400 font-sans selection:bg-emerald-500/30"
          >
            {/* Sidebar */}
            <aside className="w-64 border-r border-zinc-800 flex flex-col bg-[#0A0A0A] z-20">
              <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center cursor-pointer" onClick={() => setCurrentView('landing')}>
                  <div className="w-4 h-4 bg-black rounded-sm rotate-45"></div>
                </div>
                <span className="text-white font-bold tracking-tight text-lg">INSIGHTBOT</span>
              </div>

              <nav className="flex-1 px-4 space-y-1 mt-4">
                <NavItem
                  icon={<Home size={18} />}
                  label="Home"
                  onClick={() => setCurrentView('landing')}
                />
                <NavItem
                  icon={<MessageSquare size={18} />}
                  label="AI Chat"
                  active={currentView === 'chat'}
                  onClick={() => setCurrentView('chat')}
                />
                <NavItem
                  icon={<Folder size={18} />}
                  label="Upload Documents"
                  active={currentView === 'workspace'}
                  onClick={() => setCurrentView('workspace')}
                />
                <NavItem
                  icon={<Database size={18} />}
                  label="Knowledge Base"
                  active={currentView === 'knowledge'}
                  onClick={() => setCurrentView('knowledge')}
                />
                <NavItem
                  icon={<Activity size={18} />}
                  label="Analytics"
                  active={currentView === 'analytics'}
                  onClick={() => setCurrentView('analytics')}
                />
              </nav>

              <div className="p-4 mt-auto space-y-2">
                <button
                  onClick={() => setCurrentView('profile')}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${currentView === 'profile' ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-900 text-zinc-500'
                    }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
                    <img src="https://picsum.photos/seed/user123/32/32" alt="Avatar" referrerPolicy="no-referrer" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold truncate">Neural Architect</p>
                    <p className="text-[10px] text-zinc-600 font-mono">Level 42</p>
                  </div>
                </button>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-widest font-mono">
                    <ShieldCheck size={12} className="text-emerald-500" />
                    Secure Link
                  </div>
                  <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '65%' }}
                      className="h-full bg-emerald-500"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-600">Neural capacity at 65%</p>
                </div>

                <div className="pt-2">
                  <NavItem
                    icon={<SettingsIcon size={18} />}
                    label="Settings"
                    active={currentView === 'settings'}
                    onClick={() => setCurrentView('settings')}
                  />
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
              {/* Background Decorative Elements */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentView}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  {currentView === 'chat' && <ChatInterface />}
                  {currentView === 'workspace' && <Workspace onAnalysisComplete={() => setCurrentView('chat')} />}
                  {currentView === 'knowledge' && <KnowledgeBase />}
                  {currentView === 'analytics' && <Analytics />}
                  {currentView === 'settings' && <Settings />}
                  {currentView === 'profile' && <Profile />}
                </motion.div>
              </AnimatePresence>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all group ${active
        ? 'text-emerald-500'
        : 'hover:bg-zinc-900/50 text-zinc-500 hover:text-zinc-300'
        }`}
    >
      {active && (
        <motion.div
          layoutId="nav-bg"
          className="absolute inset-0 bg-emerald-500/10 rounded-xl -z-10"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <span className={`${active ? 'text-emerald-500' : 'text-zinc-600 group-hover:text-zinc-400'} transition-colors`}>
        {icon}
      </span>
      <span className="font-medium">{label}</span>
      {active && (
        <motion.div
          layoutId="active-pill"
          className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
        />
      )}
    </button>
  );
}


