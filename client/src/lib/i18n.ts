// Internationalization configuration
// Simple i18n implementation for DevPulse

export type Locale = 'es' | 'en';

export interface Translations {
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    create: string;
    search: string;
    loading: string;
    error: string;
    success: string;
  };
  nav: {
    dashboard: string;
    projects: string;
    tasks: string;
    clients: string;
    invoices: string;
    calendar: string;
    analytics: string;
    settings: string;
    reports: string;
    activity: string;
    logout: string;
  };
  dashboard: {
    welcome: string;
    totalRevenue: string;
    activeProjects: string;
    totalClients: string;
    completedTasks: string;
    monthlyRevenue: string;
    projectsByStatus: string;
  };
  projects: {
    title: string;
    newProject: string;
    noProjects: string;
    status: {
      pending: string;
      inProgress: string;
      completed: string;
      cancelled: string;
      onHold: string;
    };
  };
  settings: {
    title: string;
    profile: string;
    security: string;
    notifications: string;
    appearance: string;
    changePassword: string;
    saveChanges: string;
  };
}

const translations: Record<Locale, Translations> = {
  es: {
    common: {
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      create: 'Crear',
      search: 'Buscar',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
    },
    nav: {
      dashboard: 'Dashboard',
      projects: 'Proyectos',
      tasks: 'Tareas',
      clients: 'Clientes',
      invoices: 'Facturas',
      calendar: 'Calendario',
      analytics: 'Analytics',
      settings: 'Configuración',
      reports: 'Reportes',
      activity: 'Actividad',
      logout: 'Cerrar sesión',
    },
    dashboard: {
      welcome: '¡Hola',
      totalRevenue: 'Ingresos Totales',
      activeProjects: 'Proyectos Activos',
      totalClients: 'Clientes',
      completedTasks: 'Tareas Completadas',
      monthlyRevenue: 'Ingresos Mensuales',
      projectsByStatus: 'Proyectos por Estado',
    },
    projects: {
      title: 'Proyectos',
      newProject: 'Nuevo Proyecto',
      noProjects: 'No hay proyectos',
      status: {
        pending: 'Pendiente',
        inProgress: 'En Progreso',
        completed: 'Completado',
        cancelled: 'Cancelado',
        onHold: 'En Espera',
      },
    },
    settings: {
      title: 'Configuración',
      profile: 'Perfil',
      security: 'Seguridad',
      notifications: 'Notificaciones',
      appearance: 'Apariencia',
      changePassword: 'Cambiar Contraseña',
      saveChanges: 'Guardar Cambios',
    },
  },
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      search: 'Search',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
    },
    nav: {
      dashboard: 'Dashboard',
      projects: 'Projects',
      tasks: 'Tasks',
      clients: 'Clients',
      invoices: 'Invoices',
      calendar: 'Calendar',
      analytics: 'Analytics',
      settings: 'Settings',
      reports: 'Reports',
      activity: 'Activity',
      logout: 'Logout',
    },
    dashboard: {
      welcome: 'Hello',
      totalRevenue: 'Total Revenue',
      activeProjects: 'Active Projects',
      totalClients: 'Clients',
      completedTasks: 'Completed Tasks',
      monthlyRevenue: 'Monthly Revenue',
      projectsByStatus: 'Projects by Status',
    },
    projects: {
      title: 'Projects',
      newProject: 'New Project',
      noProjects: 'No projects',
      status: {
        pending: 'Pending',
        inProgress: 'In Progress',
        completed: 'Completed',
        cancelled: 'Cancelled',
        onHold: 'On Hold',
      },
    },
    settings: {
      title: 'Settings',
      profile: 'Profile',
      security: 'Security',
      notifications: 'Notifications',
      appearance: 'Appearance',
      changePassword: 'Change Password',
      saveChanges: 'Save Changes',
    },
  },
};

// Get current locale from localStorage or default to 'es'
export const getLocale = (): Locale => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('locale');
    if (saved === 'en' || saved === 'es') return saved;
  }
  return 'es';
};

// Set locale
export const setLocale = (locale: Locale): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('locale', locale);
    window.location.reload();
  }
};

// Get translations for current locale
export const getTranslations = (locale?: Locale): Translations => {
  return translations[locale || getLocale()];
};

// Hook for using translations
export const useTranslations = () => {
  const locale = getLocale();
  return {
    t: translations[locale],
    locale,
    setLocale,
  };
};

export default translations;
