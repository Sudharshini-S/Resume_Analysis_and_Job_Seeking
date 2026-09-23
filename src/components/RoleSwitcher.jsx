import React from 'react';
import { useAuth, ROLES } from '../context/AuthContext';
import { UserCheck, Briefcase, GraduationCap, ShieldCheck, Sparkles } from 'lucide-react';

export default function RoleSwitcher() {
  const { currentRole, switchRole } = useAuth();

  const roleOptions = [
    {
      id: ROLES.JOB_SEEKER,
      label: 'Job Seeker',
      icon: UserCheck,
      activeBorder: 'border-blue-500 bg-blue-500/10 text-blue-400'
    },
    {
      id: ROLES.RECRUITER,
      label: 'Recruiter',
      icon: Briefcase,
      activeBorder: 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
    },
    {
      id: ROLES.COUNSELOR,
      label: 'Career Counselor',
      icon: GraduationCap,
      activeBorder: 'border-amber-500 bg-amber-500/10 text-amber-400'
    },
    {
      id: ROLES.ADMIN,
      label: 'Administrator',
      icon: ShieldCheck,
      activeBorder: 'border-purple-500 bg-purple-500/10 text-purple-400'
    }
  ];

  return (
    <div className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Sparkles className="w-4 h-4 text-brand-500 animate-pulse" />
          <span>Active Testing Role Simulator:</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto">
          {roleOptions.map((opt) => {
            const IconComponent = opt.icon;
            const isSelected = currentRole === opt.id;

            return (
              <button
                key={opt.id}
                onClick={() => switchRole(opt.id)}
                className={`flex items-center space-x-2.5 px-3 py-1.5 rounded-lg border text-left transition-all duration-200 ${
                  isSelected
                    ? `${opt.activeBorder} shadow-lg shadow-black/40 font-medium`
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className={`p-1 rounded-md ${isSelected ? 'bg-current/20' : 'bg-slate-800'}`}>
                  <IconComponent className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-medium leading-tight">{opt.label}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
