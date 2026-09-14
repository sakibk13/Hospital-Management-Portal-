import React from 'react';
import { useAdminTheme } from '../../../admin/context/AdminThemeContext';
import { useTheme } from '../../../../contexts/ThemeContext';

const StatsCard = ({ title, value, type = 'default', icon }) => {
  // Always call hooks at the top level
  let currentTheme = 'light';
  
  // Safely try to get context values
  // Note: This pattern is still risky if contexts are missing, but hooks must run unconditionally
  // Ideally, these hooks should return a default value if context is missing
  try {
     // eslint-disable-next-line react-hooks/rules-of-hooks
     const adminContext = useAdminTheme();
     if (adminContext) currentTheme = adminContext.theme;
  } catch(e) {}

  try {
     // eslint-disable-next-line react-hooks/rules-of-hooks
     const publicContext = useTheme(); 
     if (publicContext) currentTheme = publicContext.theme;
  } catch(e) {}
  
  // Styles based on type with healthcare accent colors
  const styles = {
    default: { 
      border: 'border-l-4 border-sky-500',
      iconBg: 'bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400 border-sky-100 dark:border-sky-900',
      glow: 'shadow-[0_4px_20px_-4px_rgba(2,132,199,0.12)]'
    },
    info: { 
      border: 'border-l-4 border-blue-600',
      iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border-blue-100 dark:border-blue-900',
      glow: 'shadow-[0_4px_20px_-4px_rgba(37,99,235,0.12)]'
    },
    success: { 
      border: 'border-l-4 border-emerald-500',
      iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900',
      glow: 'shadow-[0_4px_20px_-4px_rgba(16,185,129,0.12)]'
    },
    warning: { 
      border: 'border-l-4 border-amber-500',
      iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border-amber-100 dark:border-amber-900',
      glow: 'shadow-[0_4px_20px_-4px_rgba(245,158,11,0.12)]'
    },
    critical: { 
      border: 'border-l-4 border-rose-500',
      iconBg: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border-rose-100 dark:border-rose-900',
      glow: 'shadow-[0_4px_20px_-4px_rgba(244,63,94,0.15)]'
    },
  };

  const selectedStyle = styles[type] || styles.default;
  
  const bgClass = currentTheme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200/80';
  const textClass = currentTheme === 'dark' ? 'text-gray-100' : 'text-slate-900';
  const subTextClass = currentTheme === 'dark' ? 'text-gray-400' : 'text-slate-500';

  return (
    <div className={`stat-card ${bgClass} ${selectedStyle.glow} rounded-2xl p-5 border flex items-center justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${selectedStyle.border}`}>
      <div>
        <h3 className={`text-3xl font-extrabold ${textClass} mb-1 tracking-tight`}>{value}</h3>
        <p className={`text-xs ${subTextClass} font-semibold uppercase tracking-wider`}>{title}</p>
      </div>
      
      {icon && (
        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-xl shadow-xs ${selectedStyle.iconBg}`}>
          {icon}
        </div>
      )}
    </div>
  );
};

export default StatsCard;
