'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Command, 
  FolderKanban, 
  Users, 
  FileText, 
  Settings,
  LayoutDashboard,
  ListTodo,
  Github,
  ArrowRight,
  X
} from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'page' | 'client' | 'project' | 'task';
  title: string;
  subtitle?: string;
  href: string;
  icon: React.ElementType;
}

const defaultResults: SearchResult[] = [
  { id: 'dashboard', type: 'page', title: 'Dashboard', subtitle: 'Ir al panel principal', href: '/dashboard', icon: LayoutDashboard },
  { id: 'projects', type: 'page', title: 'Proyectos', subtitle: 'Ver todos los proyectos', href: '/dashboard/projects', icon: FolderKanban },
  { id: 'tasks', type: 'page', title: 'Tareas', subtitle: 'Gestionar tareas', href: '/dashboard/tasks', icon: ListTodo },
  { id: 'clients', type: 'page', title: 'Clientes', subtitle: 'Ver clientes', href: '/dashboard/clients', icon: Users },
  { id: 'invoices', type: 'page', title: 'Facturas', subtitle: 'Gestionar facturas', href: '/dashboard/invoices', icon: FileText },
  { id: 'github', type: 'page', title: 'GitHub', subtitle: 'Ver estadísticas de GitHub', href: '/dashboard/github', icon: Github },
  { id: 'settings', type: 'page', title: 'Configuración', subtitle: 'Ajustes de la cuenta', href: '/dashboard/settings', icon: Settings },
];

const typeLabels = {
  page: 'Páginas',
  client: 'Clientes',
  project: 'Proyectos',
  task: 'Tareas',
};

const typeColors = {
  page: 'bg-sky-500/20 text-sky-400',
  client: 'bg-emerald-500/20 text-emerald-400',
  project: 'bg-fuchsia-500/20 text-fuchsia-400',
  task: 'bg-amber-500/20 text-amber-400',
};

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Filter results based on query
  const filteredResults = query === '' 
    ? defaultResults 
    : defaultResults.filter(result => 
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.subtitle?.toLowerCase().includes(query.toLowerCase())
      );

  // Group results by type
  const groupedResults = filteredResults.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open with Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      
      // Close with Escape
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Navigation within results
  const handleKeyNavigation = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filteredResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filteredResults[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredResults[selectedIndex]);
    }
  }, [filteredResults, selectedIndex]);

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    router.push(result.href);
  };

  const handleClose = () => {
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(0);
  };

  return (
    <>
      {/* Trigger button for sidebar */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 transition-all group"
      >
        <Search className="w-5 h-5" />
        <span className="flex-1 text-left text-sm">Buscar...</span>
        <kbd className="hidden md:flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/50 text-xs text-slate-500 group-hover:bg-slate-700/50">
          <Command className="w-3 h-3" />
          K
        </kbd>
      </button>

      {/* Command Palette Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="fixed left-1/2 top-[20%] -translate-x-1/2 w-full max-w-xl bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden z-50"
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 border-b border-slate-700/50">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  onKeyDown={handleKeyNavigation}
                  placeholder="Buscar páginas, clientes, proyectos..."
                  className="flex-1 bg-transparent py-4 text-slate-100 placeholder-slate-500 focus:outline-none"
                />
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto p-2">
                {filteredResults.length === 0 ? (
                  <div className="py-8 text-center text-slate-500">
                    <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p>No se encontraron resultados para "{query}"</p>
                  </div>
                ) : (
                  Object.entries(groupedResults).map(([type, results]) => (
                    <div key={type} className="mb-2 last:mb-0">
                      <div className="px-3 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                        {typeLabels[type as keyof typeof typeLabels]}
                      </div>
                      {results.map((result, index) => {
                        const globalIndex = filteredResults.indexOf(result);
                        const Icon = result.icon;
                        return (
                          <button
                            key={result.id}
                            onClick={() => handleSelect(result)}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                              selectedIndex === globalIndex
                                ? 'bg-sky-500/10 text-white'
                                : 'text-slate-300 hover:bg-slate-800/50'
                            }`}
                          >
                            <div className={`p-2 rounded-lg ${typeColors[result.type as keyof typeof typeColors]}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 text-left">
                              <div className="font-medium">{result.title}</div>
                              {result.subtitle && (
                                <div className="text-sm text-slate-500">{result.subtitle}</div>
                              )}
                            </div>
                            {selectedIndex === globalIndex && (
                              <ArrowRight className="w-4 h-4 text-sky-400" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800">↑</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800">↓</kbd>
                    Navegar
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800">Enter</kbd>
                    Seleccionar
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800">Esc</kbd>
                  Cerrar
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
