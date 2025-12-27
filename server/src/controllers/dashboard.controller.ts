import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

// Obtener métricas del dashboard
export const getDashboardMetrics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    // Obtener contadores básicos
    const [
      totalClients,
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      totalInvoices,
      paidInvoices,
      pendingInvoices
    ] = await Promise.all([
      prisma.client.count({ where: { userId } }),
      prisma.project.count({ where: { userId } }),
      prisma.project.count({ where: { userId, status: 'IN_PROGRESS' } }),
      prisma.project.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.task.count({ where: { project: { userId } } }),
      prisma.task.count({ where: { project: { userId }, status: 'COMPLETED' } }),
      prisma.task.count({ where: { project: { userId }, status: { in: ['TODO', 'IN_PROGRESS'] } } }),
      prisma.invoice.count({ where: { client: { userId } } }),
      prisma.invoice.count({ where: { client: { userId }, status: 'PAID' } }),
      prisma.invoice.count({ where: { client: { userId }, status: { in: ['DRAFT', 'SENT'] } } })
    ]);

    // Calcular ingresos
    const invoices = await prisma.invoice.findMany({
      where: { client: { userId } },
      select: { total: true, status: true }
    });

    const totalRevenue = invoices
      .filter(inv => inv.status === 'PAID')
      .reduce((acc, inv) => acc + inv.total, 0);

    const pendingRevenue = invoices
      .filter(inv => inv.status !== 'PAID' && inv.status !== 'CANCELLED')
      .reduce((acc, inv) => acc + inv.total, 0);

    // Proyectos recientes
    const recentProjects = await prisma.project.findMany({
      where: { userId },
      include: {
        client: { select: { name: true } },
        _count: { select: { tasks: true } }
      },
      orderBy: { updatedAt: 'desc' },
      take: 5
    });

    // Tareas próximas a vencer
    const upcomingTasks = await prisma.task.findMany({
      where: {
        project: { userId },
        status: { not: 'COMPLETED' },
        dueDate: { not: null }
      },
      include: {
        project: { select: { name: true } }
      },
      orderBy: { dueDate: 'asc' },
      take: 5
    });

    // Distribución de proyectos por estado
    const projectsByStatus = await prisma.project.groupBy({
      by: ['status'],
      where: { userId },
      _count: { id: true }
    });

    // Horas trabajadas por proyecto
    const hoursPerProject = await prisma.task.groupBy({
      by: ['projectId'],
      where: { project: { userId } },
      _sum: { hours: true }
    });

    // Obtener nombres de proyectos para las horas
    const projectIds = hoursPerProject.map(p => p.projectId);
    const projectNames = await prisma.project.findMany({
      where: { id: { in: projectIds } },
      select: { id: true, name: true }
    });

    const hoursData = hoursPerProject.map(hp => ({
      projectId: hp.projectId,
      projectName: projectNames.find(p => p.id === hp.projectId)?.name || 'Desconocido',
      hours: hp._sum.hours || 0
    }));

    res.json({
      success: true,
      data: {
        overview: {
          totalClients,
          totalProjects,
          activeProjects,
          completedProjects,
          totalTasks,
          completedTasks,
          pendingTasks,
          totalInvoices,
          paidInvoices,
          pendingInvoices,
          totalRevenue,
          pendingRevenue
        },
        recentProjects,
        upcomingTasks,
        charts: {
          projectsByStatus: projectsByStatus.map(p => ({
            status: p.status,
            count: p._count.id
          })),
          hoursPerProject: hoursData
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener métricas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener métricas del dashboard'
    });
  }
};

// Obtener actividad reciente
export const getRecentActivity = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    // Tareas recientes
    const recentTasks = await prisma.task.findMany({
      where: { project: { userId } },
      include: {
        project: { select: { name: true } }
      },
      orderBy: { updatedAt: 'desc' },
      take: 10
    });

    // Formatear como actividad
    const activity = recentTasks.map(task => ({
      id: task.id,
      type: 'task',
      action: task.status === 'COMPLETED' ? 'completed' : 'updated',
      title: task.title,
      projectName: task.project.name,
      timestamp: task.updatedAt
    }));

    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Error al obtener actividad:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener actividad reciente'
    });
  }
};

// Obtener estadísticas de ingresos mensuales
export const getMonthlyRevenue = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { year = new Date().getFullYear() } = req.query;

    const invoices = await prisma.invoice.findMany({
      where: {
        client: { userId },
        status: 'PAID',
        paidDate: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${parseInt(year as string) + 1}-01-01`)
        }
      },
      select: {
        total: true,
        paidDate: true
      }
    });

    // Agrupar por mes
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      monthName: new Date(2024, i, 1).toLocaleDateString('es', { month: 'short' }),
      revenue: 0
    }));

    invoices.forEach(inv => {
      if (inv.paidDate) {
        const month = inv.paidDate.getMonth();
        monthlyData[month].revenue += inv.total;
      }
    });

    res.json({
      success: true,
      data: monthlyData
    });
  } catch (error) {
    console.error('Error al obtener ingresos mensuales:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener ingresos mensuales'
    });
  }
};
