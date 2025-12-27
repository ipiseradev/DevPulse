'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Calendar,
  Users,
  FolderKanban,
  DollarSign,
  Loader2,
  CheckCircle2,
  FileBarChart
} from 'lucide-react';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const reportTypes: ReportType[] = [
  {
    id: 'monthly_revenue',
    name: 'Ingresos Mensuales',
    description: 'Resumen de ingresos del mes actual con desglose por proyecto',
    icon: DollarSign,
    color: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'clients',
    name: 'Lista de Clientes',
    description: 'Listado completo de clientes con información de contacto',
    icon: Users,
    color: 'from-sky-500 to-cyan-500',
  },
  {
    id: 'projects',
    name: 'Estado de Proyectos',
    description: 'Informe detallado del estado de todos los proyectos',
    icon: FolderKanban,
    color: 'from-fuchsia-500 to-pink-500',
  },
  {
    id: 'invoices',
    name: 'Resumen de Facturas',
    description: 'Listado de facturas con estado de pago',
    icon: FileText,
    color: 'from-amber-500 to-orange-500',
  },
];

export default function ReportsPage() {
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);
  const [generatedReports, setGeneratedReports] = useState<string[]>([]);

  const generateReport = async (reportId: string) => {
    setGeneratingReport(reportId);
    
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In production, this would call the API to generate PDF
      // const response = await fetch(`/api/reports/${reportId}`);
      // const blob = await response.blob();
      // downloadBlob(blob, `report-${reportId}.pdf`);
      
      setGeneratedReports(prev => [...prev, reportId]);
      toast.success('Reporte generado exitosamente');
      
      // Simulate download
      setTimeout(() => {
        toast.success('Descarga iniciada');
      }, 500);
      
    } catch (error) {
      toast.error('Error al generar reporte');
    } finally {
      setGeneratingReport(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Reportes</h1>
        <p className="text-slate-400">Genera y descarga reportes en PDF</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <FileBarChart className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{reportTypes.length}</p>
              <p className="text-xs text-slate-500">Tipos de reporte</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/20">
              <Download className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{generatedReports.length}</p>
              <p className="text-xs text-slate-500">Generados hoy</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-fuchsia-500/20">
              <Calendar className="w-5 h-5 text-fuchsia-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">Dic 2024</p>
              <p className="text-xs text-slate-500">Periodo actual</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <CheckCircle2 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">PDF</p>
              <p className="text-xs text-slate-500">Formato</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Report Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {reportTypes.map((report, index) => {
          const Icon = report.icon;
          const isGenerating = generatingReport === report.id;
          const isGenerated = generatedReports.includes(report.id);
          
          return (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6 group"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${report.color} shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{report.name}</h3>
                      <p className="text-sm text-slate-400 mt-1">{report.description}</p>
                    </div>
                    {isGenerated && (
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Listo
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 mt-4">
                    <Button
                      onClick={() => generateReport(report.id)}
                      disabled={isGenerating}
                      size="sm"
                      leftIcon={isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    >
                      {isGenerating ? 'Generando...' : 'Generar PDF'}
                    </Button>
                    
                    {isGenerated && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toast.success('Abriendo reporte...')}
                      >
                        Ver último
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Info */}
      <div className="glass-card p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-slate-700/50">
            <FileText className="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white mb-2">Sobre los reportes</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-sky-500 rounded-full" />
                Los reportes se generan en formato PDF de alta calidad
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-sky-500 rounded-full" />
                Incluyen gráficos e información detallada
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-sky-500 rounded-full" />
                Puedes compartirlos con tus clientes
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
