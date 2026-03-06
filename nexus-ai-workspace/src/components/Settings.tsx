import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, Shield, Bell, Eye, Zap, Save, RefreshCw } from 'lucide-react';

export default function Settings() {
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState({
    neuralLink: true,
    notifications: false,
    highPerformance: true,
    privacyMode: false
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1500);
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A] text-zinc-100 font-sans p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <SettingsIcon size={20} className="text-zinc-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
        </div>
        <p className="text-zinc-500 text-sm">Configure your neural workspace and security protocols.</p>
      </header>

      <div className="max-w-2xl space-y-6">
        <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <Zap size={14} className="text-emerald-500" />
            Core Configuration
          </h3>
          
          <Toggle 
            label="Neural Link Persistence" 
            description="Keep the neural connection active across sessions."
            enabled={config.neuralLink}
            onChange={() => setConfig({...config, neuralLink: !config.neuralLink})}
          />
          
          <Toggle 
            label="High Performance Mode" 
            description="Prioritize speed over resource consumption."
            enabled={config.highPerformance}
            onChange={() => setConfig({...config, highPerformance: !config.highPerformance})}
          />
        </section>

        <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <Shield size={14} className="text-blue-500" />
            Security & Privacy
          </h3>
          
          <Toggle 
            label="Stealth Mode" 
            description="Hide activity from local network scans."
            enabled={config.privacyMode}
            onChange={() => setConfig({...config, privacyMode: !config.privacyMode})}
          />
          
          <Toggle 
            label="Neural Encryption" 
            description="End-to-end encryption for all neural assets."
            enabled={true}
            disabled={true}
            onChange={() => {}}
          />
        </section>

        <div className="flex justify-end gap-4 pt-4">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
            {isSaving ? 'Synchronizing...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, description, enabled, onChange, disabled = false }: { 
  label: string, 
  description: string, 
  enabled: boolean, 
  onChange: () => void,
  disabled?: boolean
}) {
  return (
    <div className={`flex items-center justify-between ${disabled ? 'opacity-50' : ''}`}>
      <div>
        <p className="text-sm font-medium text-zinc-200">{label}</p>
        <p className="text-xs text-zinc-500">{description}</p>
      </div>
      <button 
        onClick={onChange}
        disabled={disabled}
        className={`w-12 h-6 rounded-full transition-colors relative ${enabled ? 'bg-emerald-500' : 'bg-zinc-800'}`}
      >
        <motion.div 
          animate={{ x: enabled ? 26 : 2 }}
          className="absolute top-1 left-0 w-4 h-4 rounded-full bg-white shadow-sm"
        />
      </button>
    </div>
  );
}
