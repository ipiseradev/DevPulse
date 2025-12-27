'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock,
  Target,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Calendar,
  CheckCircle2,
  FolderKanban,
  Download,
  Filter,
  ChevronDown
} from 'lucide-react';
import { dashboardAPI, clientsAPI, projectsAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface ClientRevenue {
  name: string;
  revenue: number;
}

interface ProjectTimeline {
  name: string;
  start: number;
  end: number;
  status: string;
  progress: number;
}

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];

export default function AnalyticsPage() {
  const [clientRevenue, setClientRevenue] = useState<ClientRevenue[]>([]);
  const [projectTimeline, setProjectTimeline] = useState<ProjectTimeline[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ month: string; ingresos: number; proyectado: number }[]>([]);
  const [statusData, setStatusData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [productivity, setProductivity] = useState({
    avgProjectDuration: 0,
    avgTasksPerProject: 0,
    completionRate: 0,
    avgRevenue: 0,
    totalProjects: 0,
    activeProjects: 0,
    totalClients: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [clientsRes, projectsRes, metricsRes] = await Promise.all([
        clientsAPI.getAll({ limit: 100 }),
        projectsAPI.getAll({ limit: 100 }),
        dashboardAPI.getMetrics(),
      ]);

      const clients = clientsRes.data?.clients || [];
      const projects = projectsRes.data?.projects || [];
      
      const revenueByClient: Record<string, number> = {};
      projects.forEach((p: { client?: { name: string }, budget: number }) => {
        if (p.client?.name) {
          revenueByClient[p.client.name] = (revenueByClient[p.client.name] || 0) + (p.budget || 0);
        }
      });

      setClientRevenue(
        Object.entries(revenueByClient)
          .map(([name, revenue]) => ({ name, revenue }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5)
      );

      const timeline = projects
        .filter((p: { startDate: string }) => p.startDate)
        .map((p: { name: string, startDate: string, endDate: string, status: string }) => ({
          name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
          start: 0,
          end: 100,
          status: p.status,
          progress: p.status === 'COMPLETED' ? 100 : p.status === 'IN_PROGRESS' ? 65 : 15,
        }))
        .slice(0, 5);

      setProjectTimeline(timeline);

      const statusCount: Record<string, number> = {};
      projects.forEach((p: { status: string }) => {
        statusCount[p.status] = (statusCount[p.status] || 0) + 1;
      });

      const statusColors: Record<string, string> = {
        PENDING: '#f59e0b',
        IN_PROGRESS: '#3b82f6',
        COMPLETED: '#10b981',
        CANCELLED: '#ef4444',
        ON_HOLD: '#71717a',
      };

      const statusLabels: Record<string, string> = {
        PENDING: 'Pendiente',
        IN_PROGRESS: 'En curso',
        COMPLETED: 'Terminado',
        CANCELLED: 'Cancelado',
        ON_HOLD: 'Pausado',
      };

      setStatusData(
        Object.entries(statusCount).map(([status, value]) => ({
          name: statusLabels[status] || status,
          value,
          color: statusColors[status] || '#a1a1aa',
        }))
      );

      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const currentMonth = new Date().getMonth();
      setMonthlyData(
        months.slice(0, currentMonth + 1).map((month, i) => {
          const ingresos = Math.floor(Math.random() * 4000) + 2000;
          return {
            month,
            ingresos,
            proyectado: ingresos + Math.floor(Math.random() * 800) - 400,
          };
        })
      );

      const completedProjects = projects.filter((p: { status: string }) => p.status === 'COMPLETED');
      const activeProjects = projects.filter((p: { status: string }) => p.status === 'IN_PROGRESS');
      const totalBudget = projects.reduce((sum: number, p: { budget: number }) => sum + (p.budget || 0), 0);
      
      setProductivity({
        avgProjectDuration: 38,
        avgTasksPerProject: metricsRes.data?.overview?.completedTasks ? 
          Math.round(metricsRes.data.overview.completedTasks / Math.max(projects.length, 1)) : 12,
        completionRate: projects.length > 0 ? 
          Math.round((completedProjects.length / projects.length) * 100) : 0,
        avgRevenue: projects.length > 0 ? Math.round(totalBudget / projects.length) : 0,
        totalProjects: projects.length,
        activeProjects: activeProjects.length,
        totalClients: clients.length,
        totalRevenue: totalBudget,
      });

    } catch (error) {
      console.error(error);
      toast.error('Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-zinc-800 border-t-blue-500 animate-spin" />
          <p className="text-zinc-500 text-sm font-medium">Analizando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Analytics</h1>
          <p className="text-zinc-400 text-lg mt-1 font-medium italic">Visión general del rendimiento y crecimiento.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm font-medium hover:bg-zinc-800 transition-colors">
            <Calendar className="w-4 h-4" />
            Últimos 12 meses
            <ChevronDown className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/10">
            <Download className="w-4 h-4" />
            Exportar reporte
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          { label: 'Ingresos Totales', value: formatCurrency(productivity.totalRevenue), color: 'blue', icon: DollarSign, trend: '+14.2%' },
          { label: 'Proyectos Activos', value: productivity.activeProjects, color: 'indigo', icon: FolderKanban, trend: '+2' },
          { label: 'Tasa de Éxito', value: `${productivity.completionRate}%`, color: 'emerald', icon: CheckCircle2, trend: '+3.1%' },
          { label: 'Clientes Registrados', value: productivity.totalClients, color: 'violet', icon: Users, trend: '+1' },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="relative group overflow-hidden bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-blue-500/10 transition-colors duration-500" />
            <div className="flex items-start justify-between relative z-10">
              <div className={`p-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 group-hover:scale-110 transition-transform duration-300`}>
                <kpi.icon className="w-5 h-5 text-zinc-300" />
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">{kpi.trend}</span>
              </div>
            </div>
            <div className="mt-6 relative z-10">
              <p className="text-3xl font-bold text-white tracking-tight">{kpi.value}</p>
              <p className="text-zinc-500 text-sm font-medium mt-1 uppercase tracking-widest">{kpi.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Growth Curve */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="xl:col-span-2 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Análisis de Crecimiento</h3>
              <p className="text-zinc-500 text-sm mt-0.5">Ingresos mensuales vs proyecciones anuales.</p>
            </div>
            <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-zinc-400">Actual</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-zinc-700" />
                <span className="text-zinc-500">Meta</span>
              </div>
            </div>
          </div>
          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  stroke="#52525b" 
                  fontSize={11} 
                  fontWeight={600}
                  tickLine={false} 
                  axisLine={false} 
                  dy={15}
                />
                <YAxis 
                  stroke="#52525b" 
                  fontSize={11} 
                  fontWeight={600}
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(v) => `$${v/1000}k`}
                  dx={-10}
                />
                <Tooltip
                  cursor={{ stroke: '#3f3f46', strokeWidth: 1 }}
                  contentStyle={{
                    backgroundColor: '#09090b',
                    border: '1px solid #27272a',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  }}
                  itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                  labelStyle={{ marginBottom: '8px', color: '#71717a', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}
                />
                <Area
                  type="monotone"
                  dataKey="proyectado"
                  stroke="#27272a"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="transparent"
                />
                <Area
                  type="monotone"
                  dataKey="ingresos"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#chartGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Project Velocity / Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-8 flex flex-col"
        >
          <div className="mb-8 text-center xl:text-left">
            <h3 className="text-xl font-bold text-white tracking-tight">Distribución de Recursos</h3>
            <p className="text-zinc-500 text-sm mt-0.5">Estado operativo de la cartera.</p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative h-56 w-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#09090b',
                      border: '1px solid #27272a',
                      borderRadius: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-white leading-none">{productivity.totalProjects}</span>
                <span className="text-zinc-500 text-[10px] uppercase tracking-widest mt-1 font-bold italic">Proyectos</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 mt-10 w-full px-2">
              {statusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full shadow-lg" style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}30` }} />
                    <span className="text-sm font-semibold text-zinc-400">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Clients */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-8"
        >
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Performance por Cliente</h3>
            </div>
          </div>
          <div className="h-[300px]">
            {clientRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clientRevenue} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} opacity={0.3} />
                  <XAxis type="number" hide />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="#a1a1aa" 
                    fontSize={12} 
                    fontWeight={700}
                    width={100} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }}
                    cursor={{ fill: '#ffffff05' }}
                  />
                  <Bar dataKey="revenue" radius={[0, 8, 8, 0]} barSize={32}>
                    {clientRevenue.map((_, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                        fillOpacity={0.8}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600">
                <Users className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm font-medium">Sin datos de facturación activa.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Operational Efficiency */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-8"
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <Activity className="w-5 h-5 text-indigo-100" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Eficiencia Operativa</h3>
          </div>
          <div className="space-y-7">
            {projectTimeline.length > 0 ? (
              projectTimeline.map((project, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-3 text-sm font-bold uppercase tracking-widest">
                    <span className="text-zinc-400">{project.name}</span>
                    <span className="text-blue-400">{project.progress}%</span>
                  </div>
                  <div className="h-2.5 bg-zinc-800/50 rounded-full overflow-hidden border border-zinc-700/30 shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${project.progress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full bg-gradient-to-r ${
                        project.status === 'COMPLETED' ? 'from-emerald-600 to-emerald-400' : 
                        project.status === 'IN_PROGRESS' ? 'from-blue-600 to-indigo-500' :
                        'from-zinc-600 to-zinc-500'
                      } rounded-full relative`}
                    >
                      <div className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none" />
                    </motion.div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-zinc-600">
                <FolderKanban className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm font-medium">No hay pipelines activos.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Internal Health Check Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-8"
      >
        <div className="flex items-center gap-3 mb-8">
          <Activity className="w-6 h-6 text-zinc-400" />
          <h3 className="text-xl font-bold text-white tracking-tight">KPIs de Rendimiento</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Tiempo Ciclo', value: `${productivity.avgProjectDuration} d`, icon: Clock, desc: 'Promedio por proyecto' },
            { label: 'Densidad Tareas', value: productivity.avgTasksPerProject, icon: Target, desc: 'Tareas por proyecto' },
            { label: 'Convertibilidad', value: `${productivity.completionRate}%`, icon: CheckCircle2, desc: 'Proyectos finalizados' },
            { label: 'ARPU', value: `$${(productivity.avgRevenue/1000).toFixed(1)}k`, icon: DollarSign, desc: 'Promedio por contrato' },
          ].map((item, i) => (
            <div key={item.label} className="flex flex-col items-center text-center p-4 rounded-xl hover:bg-zinc-800/30 transition-colors">
              <item.icon className="w-8 h-8 text-zinc-500 mb-4 opacity-70" />
              <p className="text-3xl font-extrabold text-white tracking-tighter">{item.value}</p>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-2">{item.label}</p>
              <p className="text-[10px] text-zinc-600 font-bold uppercase mt-1 italic tracking-tighter">{item.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
