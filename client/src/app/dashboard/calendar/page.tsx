'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  FolderKanban,
  ListTodo,
  FileText,
  Plus,
  X,
  Trash2,
  Edit2,
  Check
} from 'lucide-react';
import { projectsAPI, tasksAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'project_start' | 'project_end' | 'task_due' | 'invoice_due' | 'personal';
  color: string;
  description?: string;
}

interface Project {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface Task {
  id: string;
  title: string;
  dueDate?: string;
  status: string;
}

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const eventColors = {
  project_start: 'bg-emerald-500',
  project_end: 'bg-sky-500',
  task_due: 'bg-amber-500',
  invoice_due: 'bg-red-500',
  personal: 'bg-fuchsia-500',
};

const eventIcons = {
  project_start: FolderKanban,
  project_end: FolderKanban,
  task_due: ListTodo,
  invoice_due: FileText,
  personal: CalendarIcon,
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [personalEvents, setPersonalEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [newEvent, setNewEvent] = useState({ title: '', description: '' });

  // Load personal events from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('personalEvents');
    if (saved) {
      const parsed = JSON.parse(saved).map((e: CalendarEvent & { date: string }) => ({
        ...e,
        date: new Date(e.date),
      }));
      setPersonalEvents(parsed);
    }
  }, []);

  // Save personal events to localStorage
  useEffect(() => {
    if (personalEvents.length > 0) {
      localStorage.setItem('personalEvents', JSON.stringify(personalEvents));
    }
  }, [personalEvents]);

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        projectsAPI.getAll(),
        tasksAPI.getAll(),
      ]);

      const calendarEvents: CalendarEvent[] = [];

      // Add project events
      (projectsRes.data.projects || []).forEach((project: Project) => {
        if (project.startDate) {
          calendarEvents.push({
            id: `project-start-${project.id}`,
            title: `Inicio: ${project.name}`,
            date: new Date(project.startDate),
            type: 'project_start',
            color: eventColors.project_start,
          });
        }
        if (project.endDate) {
          calendarEvents.push({
            id: `project-end-${project.id}`,
            title: `Fin: ${project.name}`,
            date: new Date(project.endDate),
            type: 'project_end',
            color: eventColors.project_end,
          });
        }
      });

      // Add task events
      (tasksRes.data.tasks || []).forEach((task: Task) => {
        if (task.dueDate) {
          calendarEvents.push({
            id: `task-${task.id}`,
            title: task.title,
            date: new Date(task.dueDate),
            type: 'task_due',
            color: eventColors.task_due,
          });
        }
      });

      setEvents(calendarEvents);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar eventos');
    } finally {
      setIsLoading(false);
    }
  };

  const allEvents = useMemo(() => [...events, ...personalEvents], [events, personalEvents]);

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }, [currentDate]);

  const getEventsForDay = (date: Date | null) => {
    if (!date) return [];
    return allEvents.filter(event => 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const handleDayClick = (date: Date | null) => {
    if (!date) return;
    setSelectedDate(date);
  };

  const handleAddEvent = () => {
    if (!selectedDate || !newEvent.title.trim()) {
      toast.error('Ingresa un título para el evento');
      return;
    }

    const event: CalendarEvent = {
      id: `personal-${Date.now()}`,
      title: newEvent.title,
      description: newEvent.description,
      date: selectedDate,
      type: 'personal',
      color: eventColors.personal,
    };

    setPersonalEvents([...personalEvents, event]);
    setNewEvent({ title: '', description: '' });
    setShowAddModal(false);
    toast.success('Evento agregado');
  };

  const handleUpdateEvent = () => {
    if (!editingEvent || !newEvent.title.trim()) {
      toast.error('Ingresa un título para el evento');
      return;
    }

    setPersonalEvents(personalEvents.map(e => 
      e.id === editingEvent.id 
        ? { ...e, title: newEvent.title, description: newEvent.description }
        : e
    ));
    setEditingEvent(null);
    setNewEvent({ title: '', description: '' });
    toast.success('Evento actualizado');
  };

  const handleDeleteEvent = (eventId: string) => {
    setPersonalEvents(personalEvents.filter(e => e.id !== eventId));
    toast.success('Evento eliminado');
  };

  const openAddModal = () => {
    setEditingEvent(null);
    setNewEvent({ title: '', description: '' });
    setShowAddModal(true);
  };

  const openEditModal = (event: CalendarEvent) => {
    setEditingEvent(event);
    setNewEvent({ title: event.title, description: event.description || '' });
    setShowAddModal(true);
  };

  const selectedEvents = selectedDate ? getEventsForDay(selectedDate) : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Calendario</h1>
          <p className="text-slate-400">Vista de proyectos, tareas y eventos personales</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 glass-card p-6">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold text-white">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Days header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map(day => (
              <div key={day} className="text-center text-sm font-medium text-slate-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {daysInMonth.map((date, index) => {
              const dayEvents = getEventsForDay(date);
              const isSelected = selectedDate && date && 
                selectedDate.getDate() === date.getDate() &&
                selectedDate.getMonth() === date.getMonth();

              return (
                <motion.button
                  key={index}
                  whileHover={{ scale: date ? 1.05 : 1 }}
                  onClick={() => handleDayClick(date)}
                  className={`
                    aspect-square p-1 rounded-lg transition-colors relative
                    ${!date ? 'cursor-default' : 'cursor-pointer hover:bg-slate-800/50'}
                    ${isToday(date) ? 'bg-sky-500/20 ring-1 ring-sky-500' : ''}
                    ${isSelected ? 'bg-sky-500/30 ring-2 ring-sky-500' : ''}
                  `}
                >
                  {date && (
                    <>
                      <span className={`text-sm ${isToday(date) ? 'text-sky-400 font-bold' : 'text-slate-300'}`}>
                        {date.getDate()}
                      </span>
                      {dayEvents.length > 0 && (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                          {dayEvents.slice(0, 3).map((event, i) => (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${event.color}`}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-slate-700/50">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              Inicio proyecto
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <div className="w-3 h-3 rounded-full bg-sky-500" />
              Fin proyecto
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              Tarea
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <div className="w-3 h-3 rounded-full bg-fuchsia-500" />
              Personal
            </div>
          </div>
        </div>

        {/* Selected day events */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-sky-400" />
              <h3 className="font-semibold text-white">
                {selectedDate 
                  ? `${selectedDate.getDate()} de ${MONTHS[selectedDate.getMonth()]}`
                  : 'Selecciona un día'
                }
              </h3>
            </div>
            {selectedDate && (
              <Button size="sm" onClick={openAddModal} leftIcon={<Plus className="w-4 h-4" />}>
                Agregar
              </Button>
            )}
          </div>

          {selectedDate ? (
            selectedEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedEvents.map(event => {
                  const Icon = eventIcons[event.type];
                  const isPersonal = event.type === 'personal';
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 group"
                    >
                      <div className={`p-2 rounded-lg ${event.color}/20`}>
                        <Icon className={`w-4 h-4 ${event.color.replace('bg-', 'text-')}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{event.title}</p>
                        {event.description && (
                          <p className="text-xs text-slate-500 mt-1">{event.description}</p>
                        )}
                      </div>
                      {isPersonal && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(event)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-red-500/20 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <CalendarIcon className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="mb-4">No hay eventos este día</p>
                <Button size="sm" variant="ghost" onClick={openAddModal} leftIcon={<Plus className="w-4 h-4" />}>
                  Agregar evento
                </Button>
              </div>
            )
          ) : (
            <div className="text-center py-8 text-slate-500">
              <CalendarIcon className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>Selecciona un día para ver eventos</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Event Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-slate-950/80 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4 ml-72"
            >
              <div className="w-full max-w-md glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {editingEvent ? 'Editar Evento' : 'Nuevo Evento'}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-slate-400 p-3 bg-slate-800/50 rounded-lg">
                  <CalendarIcon className="w-4 h-4" />
                  {selectedDate && `${selectedDate.getDate()} de ${MONTHS[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`}
                </div>

                <Input
                  label="¿Qué tienes que hacer?"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Ej: Reunión con cliente, Entregar proyecto..."
                />

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Descripción (opcional)
                  </label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Detalles adicionales..."
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500/50 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-700/50">
                <Button variant="ghost" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={editingEvent ? handleUpdateEvent : handleAddEvent}
                  leftIcon={<Check className="w-4 h-4" />}
                >
                  {editingEvent ? 'Guardar' : 'Agregar'}
                </Button>
              </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
