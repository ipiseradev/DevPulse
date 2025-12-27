'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  User, 
  FolderPlus, 
  UserPlus, 
  FileText, 
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ArrowUpRight,
  MoreVertical,
  Calendar,
  Zap,
  Mail,
  Bug,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ActivityItem {
  id: string;
  type: 'project_created' | 'client_added' | 'task_completed' | 'invoice_created' | 'login' | 'bug_reported' | 'marketing_email';
  title: string;
  description: string;
  timestamp: Date;
  user: string;
  importance: 'low' | 'medium' | 'high';
}

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'project_created',
    title: 'Arquitectura Sistema ERP',
    description: 'Fase de inicialización completada para cliente GlobalLogistics.',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    user: 'Ignacio Pisera',
    importance: 'high'
  },
  {
    id: '2',
    type: 'task_completed',
    title: 'Optimización de Querys SQL',
    description: 'Reducción de latencia en un 40% en módulo de facturación.',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    user: 'Ignacio Pisera',
    importance: 'medium'
  },
  {
    id: '3',
    type: 'client_added',
    title: 'Nueva cuenta: TechFlow Inc.',
    description: 'Contrato de mantenimiento anual firmado y verificado.',
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    user: 'Sistema',
    importance: 'high'
  },
  {
    id: '4',
    type: 'bug_reported',
    title: 'Excepción de Red en Auth',
    description: 'Error 502 detectado en el endpoint /api/auth/verify.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    user: 'Sentinel Bot',
    importance: 'high'
  },
  {
    id: '5',
    type: 'invoice_created',
    title: 'Factura #INV-99011',
    description: 'Generada automáticamente para el periodo de Diciembre.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
    user: 'DevPulse Billing',
    importance: 'medium'
  },
  {
    id: '6',
    type: 'marketing_email',
    title: 'Campaña "Enero 2026"',
    description: '500 correos enviados satisfactoriamente.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    user: 'Marketing Engine',
    importance: 'low'
  },
];

const activityConfig = {
  project_created: { icon: FolderPlus, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  client_added: { icon: UserPlus, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  task_completed: { icon: CheckCircle2, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
  invoice_created: { icon: FileText, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  bug_reported: { icon: Bug, color: 'text-red-400', bg: 'bg-red-400/10' },
  marketing_email: { icon: Mail, color: 'text-violet-400', bg: 'bg-violet-400/10' },
  login: { icon: User, color: 'text-zinc-400', bg: 'bg-zinc-400/10' },
};

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setActivities(mockActivities);
      setIsLoading(false);
    }, 600);
  }, []);

  const formatTime = (date: Date) => {
    const diff = new Date().getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
  };

  const filteredActivities = activities
    .filter(a => filter === 'all' || a.type === filter)
    .filter(a => 
      searchQuery === '' || 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">Log de Actividad</h1>
          <p className="text-zinc-500 text-lg font-medium italic">Monitor de eventos centralizado y auditoría de sistemas.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-xl flex items-center gap-3">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Sincronización en Vivo</span>
           </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        {/* Advanced Filters Toolbar */}
        <div className="w-full xl:w-72 flex-shrink-0 space-y-6">
           <div className="relative group">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar en el log..."
                className="w-full bg-zinc-900/40 border border-zinc-800 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all placeholder:text-zinc-700 shadow-inner"
              />
           </div>

           <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-5 space-y-4">
              <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] px-1">Clasificación</h3>
              <div className="flex flex-col gap-1">
                 {['all', ...Object.keys(activityConfig)].map((key) => (
                   <button
                      key={key}
                      onClick={() => setFilter(key)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all font-bold text-[11px] uppercase tracking-tight group ${
                        filter === key 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10' 
                        : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300'
                      }`}
                   >
                     <span className="flex items-center gap-3">
                        {key === 'all' ? <Zap className="w-3.5 h-3.5" /> : <div className={`w-1 h-3.5 rounded-full ${filter === key ? 'bg-white' : 'bg-zinc-700'}`} />}
                        {key === 'all' ? 'Ver Todo' : key.replace('_', ' ')}
                     </span>
                     {filter === key && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
                   </button>
                 ))}
              </div>
           </div>
        </div>

        {/* Timeline Visualization */}
        <div className="flex-1 space-y-4">
           {isLoading ? (
             <div className="py-24 flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-zinc-800 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em]">Inyectando Datos</p>
             </div>
           ) : (
             <div className="relative pl-0 md:pl-12 lg:pl-20">
                {/* Visual Timeline Bar */}
                <div className="absolute left-[31px] md:left-[79px] lg:left-[111px] top-4 bottom-0 w-px bg-gradient-to-b from-blue-500/50 via-zinc-800 to-transparent hidden md:block" />

                <div className="space-y-8">
                   <AnimatePresence mode="popLayout">
                      {filteredActivities.map((activity, index) => {
                        const config = activityConfig[activity.type] || activityConfig.login;
                        const Icon = config.icon;
                        
                        return (
                          <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.05, duration: 0.4 }}
                            className="relative flex flex-col md:flex-row gap-8 items-start group"
                          >
                            {/* Metadata Column (Mobile: hidden or simple) */}
                            <div className="hidden md:flex flex-col items-end w-24 flex-shrink-0 pt-3">
                               <span className="text-[11px] font-black text-zinc-500 uppercase tracking-tighter tabular-nums">
                                  {formatTime(activity.timestamp)}
                               </span>
                               <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-[0.1em] mt-1">Ago 2025</span>
                            </div>

                            {/* Center Bubble */}
                            <div className={`relative z-10 w-16 h-16 rounded-[2rem] ${config.bg} ${config.color} border border-white/5 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 flex-shrink-0`}>
                               <Icon className="w-7 h-7" />
                               {activity.importance === 'high' && (
                                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full border-4 border-[#070709] flex items-center justify-center animate-pulse">
                                     <AlertTriangle className="w-2.5 h-2.5 text-white" />
                                  </div>
                               )}
                            </div>

                            {/* Content Card */}
                            <div className="flex-1 bg-zinc-900/40 border border-zinc-800 p-7 rounded-[2.5rem] hover:bg-zinc-900/60 hover:border-blue-500/20 transition-all duration-300 shadow-xl hover:shadow-blue-500/5 group/card">
                               <div className="flex items-start justify-between gap-4">
                                  <div className="space-y-1">
                                     <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-bold text-white tracking-tight group-hover/card:text-blue-400 transition-colors">{activity.title}</h3>
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-800 text-[9px] font-black text-zinc-500 group-hover/card:text-zinc-300 transition-colors uppercase">
                                           EVT-{activity.id.padStart(4, '0')}
                                        </div>
                                     </div>
                                     <p className="text-sm text-zinc-500 font-medium leading-relaxed italic">{activity.description}</p>
                                  </div>
                                  <button className="p-2 text-zinc-800 hover:text-zinc-400 transition-colors">
                                     <MoreVertical className="w-4 h-4" />
                                  </button>
                               </div>
                               
                               <div className="flex flex-wrap items-center gap-6 mt-6 pt-5 border-t border-zinc-800/50">
                                  <div className="flex items-center gap-2.5">
                                     <div className="w-6 h-6 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                                        <User className="w-3.5 h-3.5 text-zinc-500" />
                                     </div>
                                     <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{activity.user}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2.5 ml-auto">
                                     <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                                        activity.importance === 'high' ? 'bg-red-500/10 text-red-500' :
                                        activity.importance === 'medium' ? 'bg-amber-500/10 text-amber-500' :
                                        'bg-zinc-800 text-zinc-600'
                                     }`}>
                                        Severidad: {activity.importance}
                                     </div>
                                  </div>
                               </div>
                            </div>
                          </motion.div>
                        );
                      })}
                   </AnimatePresence>
                </div>
                
                {!isLoading && filteredActivities.length === 0 && (
                  <div className="py-24 flex flex-col items-center justify-center opacity-20 text-zinc-500">
                     <History className="w-20 h-20 mb-4 stroke-1" />
                     <p className="font-black uppercase tracking-[0.5em] text-[10px]">Sin coincidencias en la red</p>
                  </div>
                )}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
