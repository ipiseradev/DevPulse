import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { io } from '../index';

// Obtener todas las tareas de un proyecto
export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { projectId, status, priority } = req.query;

    // Verificar que el proyecto pertenece al usuario
    if (projectId) {
      const project = await prisma.project.findFirst({
        where: { id: projectId as string, userId }
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Proyecto no encontrado'
        });
      }
    }

    const tasks = await prisma.task.findMany({
      where: {
        project: { userId },
        ...(projectId && { projectId: projectId as string }),
        ...(status && { status: status as any }),
        ...(priority && { priority: priority as any })
      },
      include: {
        project: {
          select: { id: true, name: true }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tareas'
    });
  }
};

// Obtener una tarea por ID
export const getTaskById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const task = await prisma.task.findFirst({
      where: {
        id,
        project: { userId }
      },
      include: {
        project: {
          select: { id: true, name: true }
        }
      }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Error al obtener tarea:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tarea'
    });
  }
};

// Crear tarea
export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { title, description, status, priority, hours, dueDate, projectId } = req.body;

    // Verificar que el proyecto pertenece al usuario
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        hours: hours ? parseFloat(hours) : 0,
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId
      },
      include: {
        project: {
          select: { id: true, name: true }
        }
      }
    });

    // Emitir evento de nueva tarea
    io.to(`project-${projectId}`).emit('task-created', task);

    res.status(201).json({
      success: true,
      message: 'Tarea creada exitosamente',
      data: task
    });
  } catch (error) {
    console.error('Error al crear tarea:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear tarea'
    });
  }
};

// Actualizar tarea
export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { title, description, status, priority, hours, dueDate } = req.body;

    // Verificar que la tarea pertenece a un proyecto del usuario
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        project: { userId }
      }
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        status,
        priority,
        hours: hours ? parseFloat(hours) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        completedAt: status === 'COMPLETED' ? new Date() : null
      },
      include: {
        project: {
          select: { id: true, name: true }
        }
      }
    });

    // Emitir evento de actualización
    io.to(`project-${existingTask.projectId}`).emit('task-updated', task);

    res.json({
      success: true,
      message: 'Tarea actualizada exitosamente',
      data: task
    });
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar tarea'
    });
  }
};

// Eliminar tarea
export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Verificar que la tarea pertenece a un proyecto del usuario
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        project: { userId }
      }
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }

    await prisma.task.delete({
      where: { id }
    });

    // Emitir evento de eliminación
    io.to(`project-${existingTask.projectId}`).emit('task-deleted', { id });

    res.json({
      success: true,
      message: 'Tarea eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar tarea'
    });
  }
};
