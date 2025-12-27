'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  Download,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import { invoicesAPI, clientsAPI, projectsAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

interface Invoice {
  id: string;
  number: string;
  amount: number;
  tax: number;
  total: number;
  status: string;
  issueDate: string;
  dueDate: string;
  client?: { id: string; name: string };
  project?: { id: string; name: string };
}

const statusLabels: Record<string, string> = {
  DRAFT: 'Borrador',
  SENT: 'Enviada',
  PAID: 'Pagada',
  OVERDUE: 'Vencida',
  CANCELLED: 'Cancelada'
};

const statusColors: Record<string, string> = {
  DRAFT: 'badge bg-slate-600 text-slate-300',
  SENT: 'badge-info',
  PAID: 'badge-success',
  OVERDUE: 'badge-danger',
  CANCELLED: 'badge bg-slate-600 text-slate-400'
};

const statusIcons: Record<string, any> = {
  DRAFT: Clock,
  SENT: FileText,
  PAID: CheckCircle2,
  OVERDUE: AlertCircle,
  CANCELLED: FileText
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    projectId: '',
    tax: '21',
    dueDate: '',
    notes: '',
    items: [{ description: '', quantity: 1, unitPrice: 0 }]
  });

  useEffect(() => {
    fetchInvoices();
    fetchClients();
    fetchProjects();
  }, [statusFilter]);

  const fetchInvoices = async () => {
    try {
      const { data } = await invoicesAPI.getAll({
        status: statusFilter || undefined
      });
      setInvoices(data.invoices || []);
    } catch (error) {
      toast.error('Error al cargar facturas');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const { data } = await clientsAPI.getAll({ limit: 100 });
      setClients(data.clients || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data } = await projectsAPI.getAll({ limit: 100 });
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientId) {
      toast.error('Selecciona un cliente');
      return;
    }

    if (formData.items.length === 0 || !formData.items[0].description) {
      toast.error('Agrega al menos un item');
      return;
    }

    try {
      await invoicesAPI.create({
        ...formData,
        tax: parseFloat(formData.tax)
      });
      toast.success('Factura creada');
      setIsModalOpen(false);
      resetForm();
      fetchInvoices();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error');
    }
  };

  const handleDownloadPDF = async (id: string, number: string) => {
    try {
      const blob = await invoicesAPI.downloadPDF(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factura-${number}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('PDF descargado');
    } catch (error) {
      toast.error('Error al descargar PDF');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await invoicesAPI.updateStatus(id, status);
      toast.success('Estado actualizado');
      fetchInvoices();
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  const resetForm = () => {
    setFormData({
      clientId: '',
      projectId: '',
      tax: '21',
      dueDate: '',
      notes: '',
      items: [{ description: '', quantity: 1, unitPrice: 0 }]
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unitPrice: 0 }]
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    const subtotal = formData.items.reduce(
      (acc, item) => acc + item.quantity * item.unitPrice,
      0
    );
    const tax = subtotal * (parseFloat(formData.tax) / 100);
    return { subtotal, tax, total: subtotal + tax };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Facturas</h1>
          <p className="text-slate-400">Gestiona y genera tus facturas</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Nueva Factura
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['PAID', 'SENT', 'DRAFT', 'OVERDUE'].map((status) => {
          const StatusIcon = statusIcons[status];
          const count = invoices.filter(i => i.status === status).length;
          const total = invoices
            .filter(i => i.status === status)
            .reduce((acc, i) => acc + i.total, 0);
          
          return (
            <div key={status} className="glass-card p-4">
              <div className="flex items-center gap-3 mb-2">
                <StatusIcon className={`w-5 h-5 ${
                  status === 'PAID' ? 'text-green-400' :
                  status === 'OVERDUE' ? 'text-red-400' :
                  'text-slate-400'
                }`} />
                <span className="text-slate-400 text-sm">{statusLabels[status]}</span>
              </div>
              <p className="text-2xl font-bold text-slate-100">{count}</p>
              <p className="text-sm text-slate-500">{formatCurrency(total)}</p>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="input w-full md:w-48"
      >
        <option value="">Todos los estados</option>
        {Object.entries(statusLabels).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      {/* Invoices Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-16 glass-card">
          <FileText className="w-16 h-16 mx-auto text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">No hay facturas</h3>
          <p className="text-slate-500 mb-6">Crea tu primera factura</p>
          <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
            Crear Factura
          </Button>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="text-left p-4 text-slate-400 font-medium">Número</th>
                <th className="text-left p-4 text-slate-400 font-medium">Cliente</th>
                <th className="text-left p-4 text-slate-400 font-medium">Fecha</th>
                <th className="text-left p-4 text-slate-400 font-medium">Total</th>
                <th className="text-left p-4 text-slate-400 font-medium">Estado</th>
                <th className="text-right p-4 text-slate-400 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice, index) => (
                <motion.tr
                  key={invoice.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="border-t border-slate-700 hover:bg-slate-800/30"
                >
                  <td className="p-4 font-medium text-slate-100">{invoice.number}</td>
                  <td className="p-4 text-slate-300">{invoice.client?.name}</td>
                  <td className="p-4 text-slate-400">
                    {new Date(invoice.issueDate).toLocaleDateString('es-AR')}
                  </td>
                  <td className="p-4 font-semibold text-slate-100">
                    {formatCurrency(invoice.total)}
                  </td>
                  <td className="p-4">
                    <span className={statusColors[invoice.status]}>
                      {statusLabels[invoice.status]}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleUpdateStatus(invoice.id, 'PAID')}
                          className="p-2 rounded-lg hover:bg-green-500/10 text-slate-400 hover:text-green-400"
                          title="Marcar como pagada"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDownloadPDF(invoice.id, invoice.number)}
                        className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-100"
                        title="Descargar PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nueva Factura"
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Cliente *</label>
              <select
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="input"
                required
              >
                <option value="">Seleccionar cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Proyecto</label>
              <select
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="input"
              >
                <option value="">Sin proyecto</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Fecha de vencimiento"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
            />
            <Input
              label="IVA (%)"
              type="number"
              value={formData.tax}
              onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
            />
          </div>

          {/* Items */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Items</label>
            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <input
                    type="text"
                    placeholder="Descripción"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    className="input flex-1"
                  />
                  <input
                    type="number"
                    placeholder="Cant."
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                    className="input w-20"
                    min="1"
                  />
                  <input
                    type="number"
                    placeholder="Precio"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value))}
                    className="input w-28"
                    step="0.01"
                  />
                  {formData.items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeItem(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button type="button" variant="ghost" onClick={addItem} className="mt-2">
              + Agregar item
            </Button>
          </div>

          {/* Totals */}
          <div className="border-t border-slate-700 pt-4 space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span>{formatCurrency(calculateTotal().subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>IVA ({formData.tax}%)</span>
              <span>{formatCurrency(calculateTotal().tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-slate-100">
              <span>Total</span>
              <span>{formatCurrency(calculateTotal().total)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Crear Factura
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
