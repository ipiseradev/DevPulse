import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

// Obtener todos los clientes del usuario
export const getClients = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { search, page = '1', limit = '10' } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where = {
      userId,
      ...(search && {
        OR: [
          { name: { contains: search as string, mode: 'insensitive' as const } },
          { email: { contains: search as string, mode: 'insensitive' as const } },
          { company: { contains: search as string, mode: 'insensitive' as const } }
        ]
      })
    };

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        include: {
          _count: {
            select: { projects: true, invoices: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.client.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        clients,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener clientes'
    });
  }
};

// Obtener un cliente por ID
export const getClientById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const client = await prisma.client.findFirst({
      where: { id, userId },
      include: {
        projects: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        _count: {
          select: { projects: true, invoices: true }
        }
      }
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    res.json({
      success: true,
      data: client
    });
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cliente'
    });
  }
};

// Crear cliente
export const createClient = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { name, email, phone, company, address, notes } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado'
      });
    }

    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        company,
        address,
        notes,
        userId
      }
    });

    res.status(201).json({
      success: true,
      message: 'Cliente creado exitosamente',
      data: client
    });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear cliente'
    });
  }
};

// Actualizar cliente
export const updateClient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { name, email, phone, company, address, notes } = req.body;

    // Verificar que el cliente pertenece al usuario
    const existingClient = await prisma.client.findFirst({
      where: { id, userId }
    });

    if (!existingClient) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    const client = await prisma.client.update({
      where: { id },
      data: { name, email, phone, company, address, notes }
    });

    res.json({
      success: true,
      message: 'Cliente actualizado exitosamente',
      data: client
    });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar cliente'
    });
  }
};

// Eliminar cliente
export const deleteClient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Verificar que el cliente pertenece al usuario
    const existingClient = await prisma.client.findFirst({
      where: { id, userId }
    });

    if (!existingClient) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    await prisma.client.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Cliente eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar cliente'
    });
  }
};
