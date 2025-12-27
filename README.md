# DevPulse - Dashboard de Métricas para Freelancers

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/Tailwind-3-38B2AC?style=for-the-badge&logo=tailwind-css" />
  <img src="https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql" />
  <img src="https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma" />
</div>

<br />

**DevPulse** es un dashboard completo para freelancers que permite gestionar proyectos, clientes, facturas y visualizar métricas de productividad con integración de GitHub.

## ✨ Características

### 📊 Dashboard Interactivo

- Métricas en tiempo real con gráficos de Recharts
- Visualización de ingresos mensuales
- Distribución de proyectos por estado
- Tareas próximas a vencer

### 👥 Gestión de Clientes

- CRUD completo de clientes
- Búsqueda y filtros
- Información de contacto y empresa

### 📁 Gestión de Proyectos

- Seguimiento de estado (Pendiente, En Progreso, Completado)
- Presupuestos y fechas
- Asociación con clientes
- Gestión de tareas por proyecto

### 💰 Facturas Automáticas

- Generación de facturas con items dinámicos
- Cálculo automático de IVA y totales
- Exportación a PDF profesional
- Estados: Borrador, Enviada, Pagada, Vencida

### 🐙 Integración GitHub

- Conexión con cuenta de GitHub via OAuth
- Estadísticas de commits, repos, PRs e issues
- Gráfico de contribuciones estilo GitHub
- Sincronización de datos

### 🔔 Notificaciones en Tiempo Real

- Socket.io para actualizaciones instantáneas
- Notificaciones toast personalizadas

## 🛠️ Stack Tecnológico

### Frontend

- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utility-first con tema oscuro
- **Framer Motion** - Animaciones fluidas
- **Recharts** - Gráficos interactivos
- **Lucide Icons** - Iconos modernos
- **React Query** - Gestión de estado del servidor

### Backend

- **Node.js + Express** - API REST
- **TypeScript** - Tipado estático
- **Prisma ORM** - Gestión de base de datos
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación segura
- **Socket.io** - Comunicación en tiempo real
- **PDFKit** - Generación de PDFs

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+
- PostgreSQL 14+
- npm o yarn

### Instalación

1. **Clonar el repositorio**

```bash
git clone https://github.com/tu-usuario/devpulse.git
cd devpulse
```

2. **Configurar el Backend**

```bash
cd server

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu DATABASE_URL

# Generar cliente Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Iniciar servidor de desarrollo
npm run dev
```

3. **Configurar el Frontend**

```bash
cd ../client

# Instalar dependencias
npm install

# Crear archivo de variables de entorno
# NEXT_PUBLIC_API_URL=http://localhost:3001/api
# NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Iniciar aplicación
npm run dev
```

4. **Acceder a la aplicación**

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- Prisma Studio: `npm run prisma:studio` (en /server)

## 📁 Estructura del Proyecto

```
devpulse/
├── client/                 # Frontend Next.js
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   │   ├── dashboard/ # Dashboard pages
│   │   │   ├── login/     # Auth pages
│   │   │   └── ...
│   │   ├── components/    # Componentes React
│   │   │   ├── layout/    # Sidebar, etc.
│   │   │   └── ui/        # Buttons, Cards, etc.
│   │   └── lib/           # Utilidades, API, Auth
│   └── tailwind.config.ts # Configuración Tailwind
│
└── server/                 # Backend Express
    ├── src/
    │   ├── controllers/   # Lógica de endpoints
    │   ├── routes/        # Definición de rutas
    │   ├── middleware/    # Auth, errors
    │   └── config/        # Database config
    └── prisma/
        └── schema.prisma  # Modelo de datos
```

## 🔒 Variables de Entorno

### Backend (.env)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/devpulse"
JWT_SECRET="tu_secreto_jwt"
JWT_EXPIRES_IN="7d"
PORT=3001
FRONTEND_URL="http://localhost:3000"
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

## 📡 API Endpoints

| Método   | Endpoint                 | Descripción            |
| -------- | ------------------------ | ---------------------- |
| POST     | `/api/auth/register`     | Registro de usuario    |
| POST     | `/api/auth/login`        | Inicio de sesión       |
| GET      | `/api/auth/me`           | Usuario actual         |
| GET      | `/api/dashboard/metrics` | Métricas del dashboard |
| GET/POST | `/api/clients`           | CRUD de clientes       |
| GET/POST | `/api/projects`          | CRUD de proyectos      |
| GET/POST | `/api/tasks`             | CRUD de tareas         |
| GET/POST | `/api/invoices`          | CRUD de facturas       |
| GET      | `/api/invoices/:id/pdf`  | Descargar PDF          |
| GET/POST | `/api/github/*`          | Integración GitHub     |

## 🎨 Características de Diseño

- **Dark Mode** por defecto
- Efectos **glassmorphism** modernos
- **Gradientes** vibrantes y sutiles
- **Animaciones** fluidas con Framer Motion
- Diseño **responsive** para todos los dispositivos
- **Componentes reutilizables** (Buttons, Cards, Modals, Inputs)

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

Desarrollado con ❤️ para freelancers

---

<div align="center">
  <strong>⭐ Si te gusta este proyecto, dale una estrella en GitHub!</strong>
</div>
