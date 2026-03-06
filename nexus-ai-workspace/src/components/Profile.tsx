import React from 'react';
import { motion } from 'motion/react';
import { User, Mail, Shield, MapPin, Globe, Award } from 'lucide-react';

export default function Profile() {
  return (
    <div className="flex flex-col h-full bg-[#0A0A0A] text-zinc-100 font-sans p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
      <header className="mb-12 text-center">
        <div className="relative inline-block">
          <div className="w-32 h-32 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 mx-auto overflow-hidden">
            <img 
              src="https://picsum.photos/seed/user123/200/200" 
              alt="Profile" 
              className="w-full h-full object-cover opacity-80"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-emerald-500 border-4 border-[#0A0A0A] flex items-center justify-center">
            <Award size={20} className="text-black" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Neural Architect</h1>
        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Level 42 // Nexus Core Contributor</p>
      </header>

      <div className="max-w-3xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500">Identity Data</h3>
          <ProfileField icon={<User size={16} />} label="Full Name" value="Sreeman" />
          <ProfileField icon={<Mail size={16} />} label="Neural Address" value="sreeman301106@gmail.com" />
          <ProfileField icon={<MapPin size={16} />} label="Location" value="Earth // Sector 7" />
        </div>

        <div className="space-y-6">
          <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500">System Access</h3>
          <ProfileField icon={<Shield size={16} />} label="Clearance" value="Level Alpha" />
          <ProfileField icon={<Globe size={16} />} label="Network" value="Nexus Distributed" />
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
            <p className="text-[10px] text-emerald-500 uppercase font-mono mb-2">Neural Signature Verified</p>
            <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full w-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileField({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
      <div className="text-zinc-500">{icon}</div>
      <div>
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">{label}</p>
        <p className="text-sm font-medium text-zinc-200">{value}</p>
      </div>
    </div>
  );
}
