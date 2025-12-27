'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  Check
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  message: string;
  time: Date;
  read: boolean;
}

const iconMap = {
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: 'text-green-400 bg-green-500/20',
  warning: 'text-yellow-400 bg-yellow-500/20',
  info: 'text-sky-400 bg-sky-500/20',
};

// Mock notifications - in production, these would come from Socket.io
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Nuevo cliente agregado',
    message: 'Juan Pérez fue agregado exitosamente',
    time: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
  },
  {
    id: '2',
    type: 'info',
    title: 'Proyecto actualizado',
    message: 'El proyecto "Landing Page" cambió a En Progreso',
    time: new Date(Date.now() - 30 * 60 * 1000),
    read: false,
  },
  {
    id: '3',
    type: 'warning',
    title: 'Factura por vencer',
    message: 'La factura #INV-001 vence mañana',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
  },
];

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const formatTime = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes}m`;
    if (hours < 24) return `Hace ${hours}h`;
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 top-full mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-slate-400" />
              <h3 className="font-semibold text-slate-100">Notificaciones</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs bg-sky-500/20 text-sky-400 rounded-full">
                  {unreadCount} nuevas
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Notifications list */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Bell className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>No hay notificaciones</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = iconMap[notification.type];
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-4 border-b border-slate-800 hover:bg-slate-800/50 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-slate-800/30' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex gap-3">
                      <div className={`p-2 rounded-lg ${colorMap[notification.type]}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-slate-100 text-sm">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-sky-500 rounded-full flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-sm text-slate-400 mt-0.5 truncate">
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-600 mt-1">
                          {formatTime(notification.time)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-slate-700 flex justify-between">
              <button
                onClick={markAllAsRead}
                className="text-sm text-sky-400 hover:text-sky-300 flex items-center gap-1"
              >
                <Check className="w-4 h-4" />
                Marcar como leídas
              </button>
              <button
                onClick={clearAll}
                className="text-sm text-slate-400 hover:text-slate-300"
              >
                Limpiar todo
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
