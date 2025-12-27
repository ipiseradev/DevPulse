'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  FileText, 
  Github, 
  Settings,
  LogOut,
  Zap,
  ChevronLeft,
  ListTodo,
  BarChart3,
  Calendar,
  History
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Proyectos', href: '/dashboard/projects', icon: FolderKanban },
  { name: 'Tareas', href: '/dashboard/tasks', icon: ListTodo },
  { name: 'Clientes', href: '/dashboard/clients', icon: Users },
  { name: 'Facturas', href: '/dashboard/invoices', icon: FileText },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Actividad', href: '/dashboard/activity', icon: History },
  { name: 'Calendario', href: '/dashboard/calendar', icon: Calendar },
  { name: 'GitHub', href: '/dashboard/github', icon: Github },
];

const bottomNavigation = [
  { name: 'Configuración', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`
        fixed left-0 top-0 h-screen z-40
        ${collapsed ? 'w-[72px]' : 'w-[260px]'}
        bg-[#09090B] border-r border-zinc-800/80
        flex flex-col transition-all duration-500 ease-in-out
      `}
    >
      {/* Glow effect at top */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none opacity-40" />

      {/* Logo Section */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-zinc-800/50 relative z-10">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group">
            <Zap className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-lg font-bold text-white tracking-tight"
              >
                DevPulse
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="p-1.5 rounded-lg text-zinc-600 hover:text-white hover:bg-zinc-800/50 transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="absolute -right-3 top-16 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white border-4 border-[#09090B] shadow-xl hover:scale-110 transition-transform"
          >
             <ChevronLeft className="w-3 h-3 rotate-180" />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto relative z-10 custom-scrollbar">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
                          (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                relative flex items-center gap-3 px-3 py-2 rounded-xl
                transition-all duration-300 group
                ${isActive 
                  ? 'bg-blue-600/10 text-white border border-blue-500/10 shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent'
                }
              `}
            >
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300
                ${isActive 
                   ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/10' 
                   : 'bg-zinc-900 border border-zinc-800 text-zinc-500 group-hover:border-zinc-700 group-hover:text-zinc-300'
                }
              `}>
                <Icon className={`w-3.5 h-3.5`} />
              </div>
              
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[13px] font-semibold tracking-tight"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>

              {isActive && !collapsed && (
                <motion.div
                   layoutId="active-indicator"
                   className="absolute right-2.5 w-1 h-1 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User & Settings Section */}
      <div className="px-3.5 py-4 border-t border-zinc-800/50 space-y-1 relative z-10">
        {/* Settings Link */}
        {bottomNavigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300
                ${isActive 
                  ? 'bg-zinc-800 text-white' 
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/40'
                }
              `}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="text-[13px] font-semibold">{item.name}</span>}
            </Link>
          );
        })}

        {/* User Card */}
        <div className={`mt-2 p-1.5 rounded-xl bg-zinc-900/40 border border-zinc-800/50 transition-all ${collapsed ? 'px-0 border-none bg-transparent' : 'px-2 py-2.5'}`}>
          <div className="flex items-center gap-2.5">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black shadow-lg flex-shrink-0 relative">
               <span className="text-xs">{user?.name?.charAt(0).toUpperCase()}</span>
               <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-zinc-900 rounded-full" />
             </div>
             {!collapsed && (
               <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-white truncate leading-tight">{user?.name}</p>
                  <p className="text-[9px] font-black text-zinc-500 truncate uppercase tracking-widest mt-0.5">Socio Fundador</p>
               </div>
             )}
          </div>
          {!collapsed && (
            <button
               onClick={() => logout()}
               className="w-full mt-3 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-zinc-800 text-zinc-500 text-[10px] font-bold hover:bg-red-500/10 hover:text-red-400 hover:border-red-400/20 transition-all uppercase tracking-widest"
            >
               <LogOut className="w-3 h-3" />
               Cerrar Sesión
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
