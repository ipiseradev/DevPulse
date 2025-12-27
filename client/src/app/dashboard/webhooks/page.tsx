'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Webhook, 
  MessageSquare, 
  Hash, 
  Plus, 
  Trash2, 
  Send,
  Check,
  AlertCircle,
  Copy,
  ExternalLink
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  platform: 'slack' | 'discord';
  events: string[];
  enabled: boolean;
  lastUsed?: Date;
}

const eventOptions = [
  { id: 'new_client', label: 'Nuevo cliente' },
  { id: 'new_project', label: 'Nuevo proyecto' },
  { id: 'task_completed', label: 'Tarea completada' },
  { id: 'invoice_paid', label: 'Factura pagada' },
  { id: 'invoice_overdue', label: 'Factura vencida' },
];

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([
    {
      id: '1',
      name: 'Slack Workspace',
      url: 'https://hooks.slack.com/services/xxx',
      platform: 'slack',
      events: ['new_client', 'new_project'],
      enabled: true,
      lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    platform: 'slack' as 'slack' | 'discord',
    events: [] as string[],
  });
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);

  const handleAddWebhook = () => {
    if (!newWebhook.name || !newWebhook.url) {
      toast.error('Completa todos los campos');
      return;
    }
    if (newWebhook.events.length === 0) {
      toast.error('Selecciona al menos un evento');
      return;
    }

    const webhook: WebhookConfig = {
      id: Date.now().toString(),
      ...newWebhook,
      enabled: true,
    };

    setWebhooks([...webhooks, webhook]);
    setNewWebhook({ name: '', url: '', platform: 'slack', events: [] });
    setShowAddModal(false);
    toast.success('Webhook agregado');
  };

  const handleDeleteWebhook = (id: string) => {
    setWebhooks(webhooks.filter(w => w.id !== id));
    toast.success('Webhook eliminado');
  };

  const handleToggleWebhook = (id: string) => {
    setWebhooks(webhooks.map(w => 
      w.id === id ? { ...w, enabled: !w.enabled } : w
    ));
  };

  const handleTestWebhook = async (id: string) => {
    setTestingWebhook(id);
    
    // Simulate test
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.success('Mensaje de prueba enviado');
    setTestingWebhook(null);
  };

  const toggleEvent = (eventId: string) => {
    if (newWebhook.events.includes(eventId)) {
      setNewWebhook({ ...newWebhook, events: newWebhook.events.filter(e => e !== eventId) });
    } else {
      setNewWebhook({ ...newWebhook, events: [...newWebhook.events, eventId] });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Webhooks</h1>
          <p className="text-slate-400">Integración con Slack y Discord</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Agregar Webhook
        </Button>
      </div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-sky-500/20">
            <Webhook className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">¿Qué son los webhooks?</h3>
            <p className="text-sm text-slate-400 mt-1">
              Los webhooks te permiten recibir notificaciones en tiempo real en tus canales de Slack o Discord
              cuando ocurren eventos importantes en DevPulse.
            </p>
            <div className="flex gap-4 mt-4">
              <a 
                href="https://api.slack.com/messaging/webhooks" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-sky-400 hover:text-sky-300 flex items-center gap-1"
              >
                Crear webhook Slack <ExternalLink className="w-3 h-3" />
              </a>
              <a 
                href="https://discord.com/developers/docs/resources/webhook" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-fuchsia-400 hover:text-fuchsia-300 flex items-center gap-1"
              >
                Crear webhook Discord <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Webhooks List */}
      <div className="space-y-4">
        {webhooks.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Webhook className="w-12 h-12 mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400">No hay webhooks configurados</p>
            <Button className="mt-4" onClick={() => setShowAddModal(true)} leftIcon={<Plus className="w-4 h-4" />}>
              Agregar primer webhook
            </Button>
          </div>
        ) : (
          webhooks.map((webhook, index) => (
            <motion.div
              key={webhook.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-5"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${
                  webhook.platform === 'slack' 
                    ? 'bg-emerald-500/20' 
                    : 'bg-indigo-500/20'
                }`}>
                  {webhook.platform === 'slack' 
                    ? <Hash className="w-6 h-6 text-emerald-400" />
                    : <MessageSquare className="w-6 h-6 text-indigo-400" />
                  }
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">{webhook.name}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      webhook.enabled 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-slate-500/20 text-slate-400'
                    }`}>
                      {webhook.enabled ? 'Activo' : 'Desactivado'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-500 mt-1 truncate">
                    {webhook.url}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {webhook.events.map(eventId => {
                      const event = eventOptions.find(e => e.id === eventId);
                      return (
                        <span 
                          key={eventId}
                          className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded"
                        >
                          {event?.label}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTestWebhook(webhook.id)}
                    isLoading={testingWebhook === webhook.id}
                    leftIcon={<Send className="w-4 h-4" />}
                  >
                    Test
                  </Button>
                  <button
                    onClick={() => handleToggleWebhook(webhook.id)}
                    className={`relative w-10 h-6 rounded-full transition-colors ${
                      webhook.enabled ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      webhook.enabled ? 'left-5' : 'left-1'
                    }`} />
                  </button>
                  <button
                    onClick={() => handleDeleteWebhook(webhook.id)}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Webhook Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Agregar Webhook</h3>
            
            <div className="space-y-4">
              <Input
                label="Nombre"
                value={newWebhook.name}
                onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                placeholder="Mi canal de Slack"
              />
              
              <Input
                label="URL del Webhook"
                value={newWebhook.url}
                onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                placeholder="https://hooks.slack.com/..."
              />

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Plataforma</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setNewWebhook({ ...newWebhook, platform: 'slack' })}
                    className={`flex-1 p-3 rounded-xl border-2 transition-colors ${
                      newWebhook.platform === 'slack'
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <Hash className={`w-6 h-6 mx-auto ${
                      newWebhook.platform === 'slack' ? 'text-emerald-400' : 'text-slate-400'
                    }`} />
                    <p className="text-sm mt-1 text-white text-center">Slack</p>
                  </button>
                  <button
                    onClick={() => setNewWebhook({ ...newWebhook, platform: 'discord' })}
                    className={`flex-1 p-3 rounded-xl border-2 transition-colors ${
                      newWebhook.platform === 'discord'
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <MessageSquare className={`w-6 h-6 mx-auto ${
                      newWebhook.platform === 'discord' ? 'text-indigo-400' : 'text-slate-400'
                    }`} />
                    <p className="text-sm mt-1 text-white text-center">Discord</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Eventos</label>
                <div className="space-y-2">
                  {eventOptions.map(event => (
                    <label 
                      key={event.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={newWebhook.events.includes(event.id)}
                        onChange={() => toggleEvent(event.id)}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-sky-500"
                      />
                      <span className="text-slate-300">{event.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-700/50">
              <Button variant="ghost" onClick={() => setShowAddModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddWebhook} leftIcon={<Plus className="w-4 h-4" />}>
                Agregar
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
