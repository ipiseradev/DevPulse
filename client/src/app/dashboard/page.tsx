'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  FolderKanban, 
  DollarSign, 
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ChevronRight
} from 'lucide-react';
import { dashboardAPI, DashboardMetrics, MonthlyRevenue } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-500',
  IN_PROGRESS: 'bg-blue-500',
  COMPLETED: 'bg-emerald-500',
  CANCELLED: 'bg-red-500',
  ON_HOLD: 'bg-zinc-500'
};

const statusLabels: Record<string, string> = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En Progreso',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
  ON_HOLD: 'En Espera'
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, revenueRes] = await Promise.all([
          dashboardAPI.getMetrics(),
          dashboardAPI.getRevenue()
        ]);

        if (metricsRes.success) setMetrics(metricsRes.data);
        if (revenueRes.success) setMonthlyRevenue(revenueRes.data);
      } catch (error) {
        toast.error('Error al cargar métricas');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    {
      title: 'Ingresos Totales',
      value: formatCurrency(metrics?.overview.totalRevenue || 0),
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign,
    },
    {
      title: 'Proyectos Activos',
      value: metrics?.overview.activeProjects || 0,
      change: `${metrics?.overview.totalProjects || 0} total`,
      changeType: 'neutral',
      icon: FolderKanban,
    },
    {
      title: 'Clientes',
      value: metrics?.overview.totalClients || 0,
      change: '+3 este mes',
      changeType: 'positive',
      icon: Users,
    },
    {
      title: 'Tareas Completadas',
      value: metrics?.overview.completedTasks || 0,
      change: `${Math.round((metrics?.overview.completedTasks || 0) / (metrics?.overview.totalTasks || 1) * 100)}% completado`,
      changeType: 'neutral',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-semibold text-white"
          >
            Dashboard
          </motion.h1>
          <p className="text-zinc-500 mt-1">
            Bienvenido de nuevo, {user?.name?.split(' ')[0]}
          </p>
        </div>
        <div className="text-sm text-zinc-500">
          {new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-zinc-400" />
              </div>
              {stat.changeType === 'positive' && (
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
                  <ArrowUpRight className="w-3 h-3" />
                  {stat.change}
                </span>
              )}
              {stat.changeType === 'negative' && (
                <span className="flex items-center gap-1 text-xs font-medium text-red-400 bg-red-400/10 px-2 py-1 rounded-full">
                  <ArrowDownRight className="w-3 h-3" />
                  {stat.change}
                </span>
              )}
              {stat.changeType === 'neutral' && (
                <span className="text-xs text-zinc-500">
                  {stat.change}
                </span>
              )}
            </div>
            <p className="text-2xl font-semibold text-white mb-1">{stat.value}</p>
            <p className="text-sm text-zinc-500">{stat.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart - Takes 2 columns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Ingresos</h2>
              <p className="text-sm text-zinc-500">Últimos 12 meses</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-2 text-zinc-400">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                2024
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis 
                  dataKey="monthName" 
                  stroke="#52525b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#52525b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value) => [formatCurrency(Number(value) || 0), 'Ingresos']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Projects by Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Proyectos</h2>
              <p className="text-sm text-zinc-500">Por estado</p>
            </div>
          </div>
          {metrics?.charts.projectsByStatus && metrics.charts.projectsByStatus.length > 0 ? (
            <div className="space-y-4">
              {metrics.charts.projectsByStatus.map((item) => {
                const total = metrics.charts.projectsByStatus.reduce((acc, curr) => acc + curr.count, 0);
                const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
                return (
                  <div key={item.status}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-zinc-400">{statusLabels[item.status] || item.status}</span>
                      <span className="text-sm font-medium text-white">{item.count}</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${statusColors[item.status] || 'bg-zinc-600'} rounded-full transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <FolderKanban className="w-10 h-10 text-zinc-700 mb-3" />
              <p className="text-zinc-500 text-sm">No hay proyectos aún</p>
              <Link 
                href="/dashboard/projects/new" 
                className="text-blue-400 text-sm mt-2 hover:underline"
              >
                Crear proyecto
              </Link>
            </div>
          )}
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Proyectos Recientes</h2>
            <Link 
              href="/dashboard/projects" 
              className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              Ver todos
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {metrics?.recentProjects && metrics.recentProjects.length > 0 ? (
            <div className="space-y-3">
              {metrics.recentProjects.slice(0, 5).map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${statusColors[project.status]}`} />
                    <div>
                      <p className="text-sm font-medium text-white">{project.name}</p>
                      <p className="text-xs text-zinc-500">{project.client?.name || 'Sin cliente'}</p>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-500">
                    {statusLabels[project.status]}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <FolderKanban className="w-8 h-8 text-zinc-700 mb-2" />
              <p className="text-zinc-500 text-sm">No hay proyectos recientes</p>
            </div>
          )}
        </motion.div>

        {/* Upcoming Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Tareas Próximas</h2>
            <Link 
              href="/dashboard/tasks" 
              className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              Ver todas
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {metrics?.upcomingTasks && metrics.upcomingTasks.length > 0 ? (
            <div className="space-y-3">
              {metrics.upcomingTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{task.title}</p>
                      <p className="text-xs text-zinc-500">{task.project?.name || 'Sin proyecto'}</p>
                    </div>
                  </div>
                  {task.dueDate && (
                    <span className="text-xs text-zinc-500">
                      {new Date(task.dueDate).toLocaleDateString('es-ES')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <CheckCircle2 className="w-8 h-8 text-zinc-700 mb-2" />
              <p className="text-zinc-500 text-sm">No hay tareas pendientes</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
