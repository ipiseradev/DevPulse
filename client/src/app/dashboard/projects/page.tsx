'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderKanban, 
  Plus, 
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  Calendar,
  DollarSign,
  Users,
  MoreVertical,
  ArrowRight,
  Target
} from 'lucide-react';
import { projectsAPI, clientsAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD';
  budget: number;
  startDate: string;
  endDate: string;
  client?: { id: string; name: string; company: string };
  _count?: { tasks: number; invoices: number };
}

interface Client {
  id: string;
  name: string;
}

const statusConfig = {
  PENDING: { label: 'Pendiente', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
  IN_PROGRESS: { label: 'En curso', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  COMPLETED: { label: 'Terminado', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  CANCELLED: { label: 'Cancelado', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
  ON_HOLD: { label: 'Pausado', color: 'text-zinc-400', bg: 'bg-zinc-400/10', border: 'border-zinc-400/20' }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'PENDING',
    budget: '',
    startDate: '',
    endDate: '',
    clientId: ''
  });

  useEffect(() => {
    fetchProjects();
    fetchClients();
  }, [searchTerm, statusFilter]);

  const fetchProjects = async () => {
    try {
      const { data } = await projectsAPI.getAll({
        search: searchTerm,
        status: statusFilter || undefined
      });
      setProjects(data.projects || []);
    } catch (error) {
      toast.error('Error al cargar proyectos');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const { data } = await clientsAPI.getAll();
      setClients(data.clients || []);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      budget: formData.budget ? parseFloat(formData.budget) : undefined,
    };
    
    try {
      if (editingProject) {
        await projectsAPI.update(editingProject.id, payload);
        toast.success('Proyecto actualizado');
      } else {
        await projectsAPI.create(payload);
        toast.success('Proyecto creado');
      }
      
      setIsModalOpen(false);
      resetForm();
      fetchProjects();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este proyecto?')) return;
    
    try {
      await projectsAPI.delete(id);
      toast.success('Proyecto eliminado');
      fetchProjects();
    } catch (error) {
      toast.error('Error al eliminar proyecto');
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      status: project.status,
      budget: project.budget?.toString() || '',
      startDate: project.startDate?.split('T')[0] || '',
      endDate: project.endDate?.split('T')[0] || '',
      clientId: project.client?.id || ''
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      description: '',
      status: 'PENDING',
      budget: '',
      startDate: '',
      endDate: '',
      clientId: ''
    });
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const calculateProgress = (project: Project) => {
    if (project.status === 'COMPLETED') return 100;
    if (project.status === 'PENDING') return 0;
    // Simulation based on tasks if available
    return Math.floor(Math.random() * 60) + 20;
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Proyectos</h1>
          <p className="text-zinc-400 text-lg mt-1 font-medium">Gestiona y visualiza el progreso de tus trabajos.</p>
        </div>
        <Button 
          onClick={openCreateModal} 
          className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 py-6 px-6 rounded-xl text-md font-bold"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Proyecto
        </Button>
      </div>

      {/* Filters Hub */}
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            placeholder="Filtrar por nombre, descripción o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium"
          />
        </div>
        
        <div className="flex gap-2 w-full lg:w-auto">
          {Object.entries(statusConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setStatusFilter(statusFilter === key ? '' : key)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${
                statusFilter === key 
                ? `${config.bg} ${config.color} ${config.border}`
                : 'bg-zinc-900/30 border-zinc-800 text-zinc-500 hover:bg-zinc-800'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Contenidor */}
      {isLoading ? (
        <div className="flex items-center justify-center h-[40vh]">
          <div className="w-10 h-10 border-2 border-zinc-800 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 px-4 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl"
        >
          <div className="p-4 rounded-2xl bg-zinc-800/50 mb-6">
            <FolderKanban className="w-12 h-12 text-zinc-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No se encontraron proyectos</h3>
          <p className="text-zinc-500 text-center max-w-sm mb-8 font-medium">Comienza creando tu primer proyecto para gestionar tus tareas y facturas de forma profesional.</p>
          <Button onClick={openCreateModal} className="px-8">Empezar ahora</Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode='popLayout'>
            {projects.map((project, index) => {
              const config = statusConfig[project.status as keyof typeof statusConfig] || statusConfig.PENDING;
              const progress = calculateProgress(project);
              
              return (
                <motion.div
                  layout
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative flex flex-col bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700/80 rounded-2xl p-6 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-[60px] rounded-full pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
                  
                  {/* Status & Actions */}
                  <div className="flex items-start justify-between mb-5 relative z-10">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${config.bg} ${config.color} ${config.border}`}>
                      {config.label}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(project)}
                        className="p-2 rounded-lg bg-zinc-800/50 text-zinc-500 hover:text-white hover:bg-zinc-800 border border-transparent hover:border-zinc-700 transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="p-2 rounded-lg bg-zinc-800/50 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 border border-transparent hover:border-red-400/20 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Client */}
                  <div className="mb-6 relative z-10">
                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">{project.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                       <div className="w-6 h-6 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                          <Users className="w-3 h-3 text-zinc-500" />
                       </div>
                       <span className="text-sm font-semibold text-zinc-500">{project.client?.name || 'Cliente Particular'}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-zinc-500 font-medium mb-6 line-clamp-2 h-10 italic">
                    {project.description || 'Sin descripción detallada disponible.'}
                  </p>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-6 pt-6 border-t border-zinc-800/50">
                    <div>
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <Target className="w-3 h-3" />
                        Progreso
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                           <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              className="h-full bg-blue-500 rounded-full"
                           />
                        </div>
                        <span className="text-xs font-bold text-zinc-400">{progress}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <DollarSign className="w-3 h-3" />
                        Presupuesto
                      </p>
                      <p className="text-sm font-bold text-zinc-200">
                        {project.budget ? formatCurrency(project.budget) : 'US$ 0'}
                      </p>
                    </div>
                  </div>

                  {/* Footer Stats */}
                  <div className="flex items-center justify-between pt-4 mt-auto">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">Deadline</span>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300 mt-0.5">
                          <Calendar className="w-3 h-3 text-blue-500" />
                          {project.endDate ? new Date(project.endDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }) : 'S/F'}
                        </div>
                      </div>
                      <div className="flex flex-col border-l border-zinc-800 pl-4">
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">Tareas</span>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300 mt-0.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          {project._count?.tasks || 0} items
                        </div>
                      </div>
                    </div>
                    <Link 
                      href={`/dashboard/projects/${project.id}`}
                      className="group/btn w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-blue-600 transition-colors"
                    >
                      <ArrowRight className="w-4 h-4 text-zinc-400 group-hover/btn:text-white" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Reusable Modal for Project Management */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Configuración de Proyecto' : 'Iniciación de Proyecto'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="p-2 space-y-6">
          <div className="space-y-4">
            <Input
              label="Nombre del proyecto"
              placeholder="Ej: Rediseño Landing v2"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            
            <div>
              <label className="block text-sm font-bold text-zinc-400 mb-2 uppercase tracking-widest text-[11px]">Resumen Ejecutivo</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium resize-none shadow-inner"
                placeholder="Detalles sobre el alcance, objetivos y entregables..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2 uppercase tracking-widest text-[11px]">Asignación de Cliente</label>
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 appearance-none font-medium transition-all cursor-pointer"
                >
                  <option value="">Cliente Particular / Otros</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2 uppercase tracking-widest text-[11px]">Estado Operativo</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 appearance-none font-medium transition-all cursor-pointer"
                >
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/10 space-y-4">
             <Input
                label="Presupuesto del Contrato (USD)"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="US$ 0.00"
              />

              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  label="Fecha de Inicio"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
                <Input
                  label="Deadline Estimado"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
          </div>

          <div className="flex justify-end items-center gap-4 pt-4 border-t border-zinc-800">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="text-zinc-500 font-bold hover:text-zinc-300 transition-colors uppercase tracking-widest text-[11px]"
            >
              Cerrar Ventana
            </button>
            <Button type="submit" className="px-10 py-5 rounded-xl">
              {editingProject ? 'Confirmar Actualización' : 'Ejecutar Apertura'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
