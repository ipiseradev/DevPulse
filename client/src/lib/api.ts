import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// ============== TYPES ==============
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  githubUsername?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  notes?: string;
  _count?: { projects: number; invoices: number };
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD';
  budget?: number;
  startDate?: string;
  endDate?: string;
  client?: { id: string; name: string; company?: string };
  _count?: { tasks: number; invoices: number };
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  hours: number;
  dueDate?: string;
  project?: { id: string; name: string };
}

export interface Invoice {
  id: string;
  number: string;
  amount: number;
  tax: number;
  total: number;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  issueDate: string;
  dueDate: string;
  client?: { id: string; name: string };
  project?: { id: string; name: string };
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface GitHubStats {
  totalCommits: number;
  totalRepos: number;
  totalPRs: number;
  totalIssues: number;
  lastSyncAt: string;
  contributionData?: { date: string; count: number }[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// ============== API CLIENT ==============
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// =============== AUTH ===============
export const authAPI = {
  login: async (email: string, password: string) => {
    const { data } = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', { email, password });
    return data;
  },
  
  register: async (name: string, email: string, password: string) => {
    const { data } = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', { name, email, password });
    return data;
  },
  
  getMe: async () => {
    const { data } = await api.get<ApiResponse<User>>('/auth/me');
    return data;
  },
};

// =============== DASHBOARD ===============
export interface DashboardMetrics {
  overview: {
    totalClients: number;
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    totalInvoices: number;
    paidInvoices: number;
    pendingInvoices: number;
    totalRevenue: number;
    pendingRevenue: number;
  };
  recentProjects: Project[];
  upcomingTasks: Task[];
  charts: {
    projectsByStatus: { status: string; count: number }[];
    hoursPerProject: { projectName: string; hours: number }[];
  };
}

export interface MonthlyRevenue {
  month: number;
  monthName: string;
  revenue: number;
}

export const dashboardAPI = {
  getMetrics: async () => {
    const { data } = await api.get<ApiResponse<DashboardMetrics>>('/dashboard/metrics');
    return data;
  },
  
  getActivity: async () => {
    const { data } = await api.get('/dashboard/activity');
    return data;
  },
  
  getRevenue: async (year?: number) => {
    const { data } = await api.get<ApiResponse<MonthlyRevenue[]>>('/dashboard/revenue', { params: { year } });
    return data;
  },
};

// =============== CLIENTS ===============
export interface ClientInput {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  notes?: string;
}

export const clientsAPI = {
  getAll: async (params?: { search?: string; page?: number; limit?: number }) => {
    const { data } = await api.get('/clients', { params });
    return data;
  },
  
  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<Client>>(`/clients/${id}`);
    return data;
  },
  
  create: async (clientData: ClientInput) => {
    const { data } = await api.post<ApiResponse<Client>>('/clients', clientData);
    return data;
  },
  
  update: async (id: string, clientData: Partial<ClientInput>) => {
    const { data } = await api.put<ApiResponse<Client>>(`/clients/${id}`, clientData);
    return data;
  },
  
  delete: async (id: string) => {
    const { data } = await api.delete(`/clients/${id}`);
    return data;
  },
};

// =============== PROJECTS ===============
export interface ProjectInput {
  name: string;
  description?: string;
  status?: string;
  budget?: number;
  startDate?: string;
  endDate?: string;
  clientId?: string;
}

export const projectsAPI = {
  getAll: async (params?: { status?: string; clientId?: string; search?: string; page?: number; limit?: number }) => {
    const { data } = await api.get('/projects', { params });
    return data;
  },
  
  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<Project>>(`/projects/${id}`);
    return data;
  },
  
  create: async (projectData: ProjectInput) => {
    const { data } = await api.post<ApiResponse<Project>>('/projects', projectData);
    return data;
  },
  
  update: async (id: string, projectData: Partial<ProjectInput>) => {
    const { data } = await api.put<ApiResponse<Project>>(`/projects/${id}`, projectData);
    return data;
  },
  
  delete: async (id: string) => {
    const { data } = await api.delete(`/projects/${id}`);
    return data;
  },
};

// =============== TASKS ===============
export interface TaskInput {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  hours?: number;
  dueDate?: string;
  projectId: string;
}

export const tasksAPI = {
  getAll: async (params?: { projectId?: string; status?: string; priority?: string }) => {
    const { data } = await api.get('/tasks', { params });
    return data;
  },
  
  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
    return data;
  },
  
  create: async (taskData: TaskInput) => {
    const { data } = await api.post<ApiResponse<Task>>('/tasks', taskData);
    return data;
  },
  
  update: async (id: string, taskData: Partial<TaskInput>) => {
    const { data } = await api.put<ApiResponse<Task>>(`/tasks/${id}`, taskData);
    return data;
  },
  
  delete: async (id: string) => {
    const { data } = await api.delete(`/tasks/${id}`);
    return data;
  },
};

// =============== INVOICES ===============
export interface InvoiceItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceInput {
  clientId: string;
  projectId?: string;
  items: InvoiceItemInput[];
  tax?: number;
  dueDate: string;
  notes?: string;
}

export const invoicesAPI = {
  getAll: async (params?: { status?: string; clientId?: string; page?: number }) => {
    const { data } = await api.get('/invoices', { params });
    return data;
  },
  
  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<Invoice>>(`/invoices/${id}`);
    return data;
  },
  
  create: async (invoiceData: InvoiceInput) => {
    const { data } = await api.post<ApiResponse<Invoice>>('/invoices', invoiceData);
    return data;
  },
  
  updateStatus: async (id: string, status: string) => {
    const { data } = await api.patch(`/invoices/${id}/status`, { status });
    return data;
  },
  
  downloadPDF: async (id: string) => {
    const response = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
    return response.data;
  },
  
  delete: async (id: string) => {
    const { data } = await api.delete(`/invoices/${id}`);
    return data;
  },
};

// =============== GITHUB ===============
export const githubAPI = {
  getStats: async () => {
    const { data } = await api.get<ApiResponse<GitHubStats | null>>('/github/stats');
    return data;
  },
  
  sync: async () => {
    const { data } = await api.post<ApiResponse<GitHubStats>>('/github/sync');
    return data;
  },
  
  getProfile: async () => {
    const { data } = await api.get('/github/profile');
    return data;
  },
  
  connect: async (accessToken: string) => {
    const { data } = await api.post('/github/connect', { accessToken });
    return data;
  },
  
  disconnect: async () => {
    const { data } = await api.post('/github/disconnect');
    return data;
  },
};

// =============== USER ===============
export interface ProfileInput {
  name?: string;
  avatar?: string;
}

export const userAPI = {
  getProfile: async () => {
    const { data } = await api.get<ApiResponse<User>>('/users/profile');
    return data;
  },
  
  updateProfile: async (profileData: ProfileInput) => {
    const { data } = await api.put<ApiResponse<User>>('/users/profile', profileData);
    return data;
  },
  
  changePassword: async (currentPassword: string, newPassword: string) => {
    const { data } = await api.put('/users/password', { currentPassword, newPassword });
    return data;
  },
};

export default api;
