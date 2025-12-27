'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ListTodo, 
  Plus, 
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Loader2,
  AlertCircle,
  MoreVertical,
  Filter,
  LayoutGrid,
  ChevronRight,
  User,
  Tags
} from 'lucide-react';
import { tasksAPI, projectsAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  project?: { id: string; name: string };
}

interface Project {
  id: string;
  name: string;
}

const statusColumns = [
  { id: 'TODO', title: 'Backlog', icon: Circle, color: 'text-zinc-500', bg: 'bg-zinc-500/5', dot: 'bg-zinc-500' },
  { id: 'IN_PROGRESS', title: 'En curso', icon: Loader2, color: 'text-blue-500', bg: 'bg-blue-500/5', dot: 'bg-blue-500' },
  { id: 'IN_REVIEW', title: 'En revisión', icon: Clock, color: 'text-indigo-500', bg: 'bg-indigo-500/5', dot: 'bg-indigo-500' },
  { id: 'COMPLETED', title: 'Terminado', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/5', dot: 'bg-emerald-500' },
] as const;

const priorityConfig = {
  LOW: { label: 'Baja', color: 'text-zinc-400', bg: 'bg-zinc-400/10', border: 'border-zinc-400/20' },
  MEDIUM: { label: 'Media', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  HIGH: { label: 'Alta', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
  URGENT: { label: 'Crítica', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '',
    projectId: ''
  });

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, [selectedProject]);

  const fetchTasks = async () => {
    try {
      const params = selectedProject ? { projectId: selectedProject } : {};
      const { data } = await tasksAPI.getAll(params);
      setTasks(data.tasks || []);
    } catch (error) {
      toast.error('Error al cargar tareas');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data } = await projectsAPI.getAll({ limit: 100 });
      setProjects(data.projects || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectId) {
      toast.error('Selecciona un proyecto');
      return;
    }

    try {
      await tasksAPI.create(formData);
      toast.success('Tarea asignada correctamente');
      setIsModalOpen(false);
      resetForm();
      fetchTasks();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error');
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await tasksAPI.update(taskId, { status: newStatus });
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus as Task['status'] } : t));
      toast.success('Estado actualizado');
    } catch (error) {
      toast.error('Error al actualizar el estado');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: '',
      projectId: ''
    });
  };

  const getTasksByStatus = (status: string) => tasks.filter(t => t.status === status);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-10 h-10 border-2 border-zinc-800 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-12">
      {/* Header section with refined aesthetics */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Board de Tareas</h1>
          <p className="text-zinc-400 text-lg mt-1 font-medium italic">Gestión operativa de tu flujo de trabajo.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
             <Filter className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
             <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm font-bold pl-10 pr-4 py-2.5 rounded-xl appearance-none focus:outline-none focus:border-zinc-700 transition-all cursor-pointer min-w-[200px]"
              >
                <option value="">Vista Global</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-blue-600 hover:bg-blue-500 px-6 py-6 shadow-xl shadow-blue-600/10 rounded-xl"
          >
            <Plus className="w-5 h-5 mr-1" />
            Nueva Tarea
          </Button>
        </div>
      </div>

      {/* Modern Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
        {statusColumns.map((column) => {
          const columnTasks = getTasksByStatus(column.id);
          const Icon = column.icon;
          
          return (
            <div key={column.id} className="flex flex-col gap-5 min-w-[300px]">
              {/* Column Header */}
              <div className="flex items-center justify-between px-3 py-1">
                <div className="flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full ${column.dot}`} />
                  <h3 className="font-bold text-zinc-100 uppercase tracking-widest text-[11px]">{column.title}</h3>
                  <span className="bg-zinc-800 text-zinc-500 text-[10px] font-bold px-2 py-0.5 rounded-md border border-zinc-700/50">
                    {columnTasks.length}
                  </span>
                </div>
                <button className="text-zinc-600 hover:text-zinc-300 transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              {/* Column Content */}
              <div className={`flex flex-col gap-4 p-3 rounded-2xl border border-transparent transition-all overflow-hidden ${column.bg}`}>
                <AnimatePresence>
                  {columnTasks.map((task, index) => {
                    const priority = priorityConfig[task.priority];
                    return (
                      <motion.div
                        layout
                        key={task.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.03 }}
                        className="bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700/80 p-5 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-black/20 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between mb-3">
                           <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${priority.bg} ${priority.color} ${priority.border}`}>
                             {priority.label}
                           </span>
                           <span className="text-zinc-700 group-hover:text-zinc-500 transition-colors">
                              <MoreVertical className="w-4 h-4 cursor-pointer" />
                           </span>
                        </div>

                        <h4 className="font-bold text-zinc-200 text-md leading-tight group-hover:text-blue-400 transition-colors mb-2">{task.title}</h4>
                        
                        {task.description && (
                          <p className="text-xs text-zinc-500 font-medium line-clamp-2 italic mb-4">{task.description}</p>
                        )}

                        <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-zinc-900">
                          {task.project && (
                            <div className="flex items-center gap-2">
                               <div className="w-5 h-5 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                                  <LayoutGrid className="w-3 h-3 text-zinc-600" />
                               </div>
                               <span className="text-[10px] font-bold text-zinc-500 truncate uppercase tracking-tighter italic">{task.project.name}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-zinc-600">
                               <Calendar className="w-3.5 h-3.5" />
                               <span className="text-[10px] font-bold tracking-tight">
                                 {task.dueDate ? new Date(task.dueDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }) : 'No definida'}
                               </span>
                            </div>
                            
                            {/* Interactive mini-actions */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                               {statusColumns.filter(s => s.id !== column.id).map((s) => (
                                 <button
                                   key={s.id}
                                   title={`Mover a ${s.title}`}
                                   onClick={(e) => { e.stopPropagation(); handleStatusChange(task.id, s.id); }}
                                   className="p-1 rounded bg-zinc-900 text-zinc-600 hover:text-white hover:bg-zinc-800 border border-zinc-800"
                                 >
                                   <ChevronRight className="w-3 h-3 rotate-45" />
                                 </button>
                               ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {columnTasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 opacity-30">
                    <ListTodo className="w-8 h-8 text-zinc-600 mb-2" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Vacío</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Professional Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Especificación de Nueva Tarea"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="p-2 space-y-6">
          <div className="space-y-4">
            <Input
              label="Objetivo / Título"
              placeholder="Ej: Implementación de Webhooks"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            <div>
              <label className="block text-sm font-bold text-zinc-500 mb-2 uppercase tracking-widest text-[10px]">Detalle Funcional</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium resize-none shadow-inner text-sm"
                placeholder="Explicación detallada del requerimiento..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-zinc-500 mb-2 uppercase tracking-widest text-[10px]">Proyecto de Destino</label>
                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-3 px-4 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 font-medium transition-all"
                  required
                >
                  <option value="">Seleccionar Pipeline</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-500 mb-2 uppercase tracking-widest text-[10px]">Nivel de Prioridad</label>
                <div className="grid grid-cols-2 gap-2">
                   {Object.entries(priorityConfig).map(([key, config]) => (
                     <button
                        type="button"
                        key={key}
                        onClick={() => setFormData({ ...formData, priority: key as any })}
                        className={`text-[10px] font-bold uppercase py-2 px-1 rounded-lg border transition-all ${
                          formData.priority === key 
                          ? `${config.bg} ${config.color} ${config.border}`
                          : 'bg-zinc-950 border-zinc-800 text-zinc-600 hover:bg-zinc-900'
                        }`}
                     >
                       {config.label}
                     </button>
                   ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-zinc-900/40 rounded-2xl border border-zinc-800 space-y-4">
               <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-zinc-800 border border-zinc-700">
                     <Clock className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Fecha de Compromiso</label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full bg-transparent border-none text-zinc-300 focus:ring-0 p-0 text-md font-bold"
                    />
                  </div>
               </div>
            </div>
          </div>

          <div className="flex justify-end items-center gap-4 pt-4 border-t border-zinc-900">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="text-zinc-600 font-bold hover:text-zinc-400 transition-colors uppercase tracking-widest text-[10px]"
            >
              Cancelar
            </button>
            <Button type="submit" className="px-8 py-5 rounded-xl text-sm font-bold uppercase tracking-wider">
              Asignar Tarea
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
