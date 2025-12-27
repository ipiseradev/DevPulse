import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { io } from '../index';

// Obtener todos los proyectos del usuario
export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { status, clientId, search, page = '1', limit = '10' } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where = {
      userId,
      ...(status && { status: status as any }),
      ...(clientId && { clientId: clientId as string }),
      ...(search && {
        OR: [
          { name: { contains: search as string, mode: 'insensitive' as const } },
          { description: { contains: search as string, mode: 'insensitive' as const } }
        ]
      })
    };

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          client: {
            select: { id: true, name: true, company: true }
          },
          _count: {
            select: { tasks: true, invoices: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.project.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener proyectos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener proyectos'
    });
  }
};

// Obtener un proyecto por ID
export const getProjectById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const project = await prisma.project.findFirst({
      where: { id, userId },
      include: {
        client: true,
        tasks: {
          orderBy: { createdAt: 'desc' }
        },
        invoices: {
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { tasks: true, invoices: true }
        }
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    // Calcular estadísticas del proyecto
    const taskStats = {
      total: project.tasks.length,
      completed: project.tasks.filter(t => t.status === 'COMPLETED').length,
      inProgress: project.tasks.filter(t => t.status === 'IN_PROGRESS').length,
      totalHours: project.tasks.reduce((acc, t) => acc + t.hours, 0)
    };

    res.json({
      success: true,
      data: {
        ...project,
        taskStats
      }
    });
  } catch (error) {
    console.error('Error al obtener proyecto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener proyecto'
    });
  }
};

// Crear proyecto
export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { name, description, status, budget, startDate, endDate, clientId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado'
      });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        status,
        budget: budget ? parseFloat(budget) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        clientId,
        userId
      },
      include: {
        client: {
          select: { id: true, name: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Proyecto creado exitosamente',
      data: project
    });
  } catch (error) {
    console.error('Error al crear proyecto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear proyecto'
    });
  }
};

// Actualizar proyecto
export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { name, description, status, budget, startDate, endDate, clientId } = req.body;

    // Verificar que el proyecto pertenece al usuario
    const existingProject = await prisma.project.findFirst({
      where: { id, userId }
    });

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        name,
        description,
        status,
        budget: budget ? parseFloat(budget) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        clientId
      },
      include: {
        client: {
          select: { id: true, name: true }
        }
      }
    });

    // Emitir evento de actualización via Socket.io
    io.to(`project-${id}`).emit('project-updated', project);

    res.json({
      success: true,
      message: 'Proyecto actualizado exitosamente',
      data: project
    });
  } catch (error) {
    console.error('Error al actualizar proyecto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar proyecto'
    });
  }
};

// Eliminar proyecto
export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Verificar que el proyecto pertenece al usuario
    const existingProject = await prisma.project.findFirst({
      where: { id, userId }
    });

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    await prisma.project.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Proyecto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar proyecto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar proyecto'
    });
  }
};
