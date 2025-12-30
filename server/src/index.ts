import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

// Cargar variables de entorno
dotenv.config();

// Importar rutas
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import clientRoutes from './routes/client.routes';
import projectRoutes from './routes/project.routes';
import taskRoutes from './routes/task.routes';
import invoiceRoutes from './routes/invoice.routes';
import dashboardRoutes from './routes/dashboard.routes';
import githubRoutes from './routes/github.routes';

// Importar middleware
import { errorHandler } from './middleware/error.middleware';

const app = express();
const httpServer = createServer(app);

// Configurar Socket.io
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001', 
  'http://localhost:3002',
  process.env.FRONTEND_URL || 'http://localhost:3000'
].filter(Boolean);

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      // Allow any Vercel preview URL
      if (origin.includes('vercel.app')) return callback(null, true);
      // Allow configured origins
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(null, true); // Allow all for now
    },
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // Allow any Vercel preview URL
    if (origin.includes('vercel.app')) return callback(null, true);
    // Allow configured origins
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(null, true); // Allow all for now
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/github', githubRoutes);

// Swagger UI - Documentación de la API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'DevPulse API Docs',
}));

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'DevPulse API is running',
    timestamp: new Date().toISOString()
  });
});

// Socket.io eventos
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  socket.on('join-project', (projectId: string) => {
    socket.join(`project-${projectId}`);
    console.log(`Socket ${socket.id} se unió al proyecto ${projectId}`);
  });

  socket.on('leave-project', (projectId: string) => {
    socket.leave(`project-${projectId}`);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Exportar io para usar en otros archivos
export { io };

// Middleware de manejo de errores
app.use(errorHandler);

// Iniciar servidor
const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  const startTime = new Date().toLocaleString('es-AR', { 
    dateStyle: 'short', 
    timeStyle: 'medium' 
  });
  
  console.log(`
  ╔══════════════════════════════════════════════════════╗
  ║                                                      ║
  ║   ⚡ DevPulse API Server                             ║
  ║   ──────────────────────────────────────────────     ║
  ║                                                      ║
  ║   🌐 Server:    http://localhost:${PORT}               ║
  ║   📚 API Docs:  http://localhost:${PORT}/api-docs       ║
  ║   🏥 Health:    http://localhost:${PORT}/api/health     ║
  ║                                                      ║
  ║   📦 Environment: ${(process.env.NODE_ENV || 'development').padEnd(20)}       ║
  ║   🕐 Started at:  ${startTime.padEnd(20)}       ║
  ║                                                      ║
  ║   ✅ Ready to accept connections                     ║
  ║                                                      ║
  ╚══════════════════════════════════════════════════════╝
  `);
});

export default app;
