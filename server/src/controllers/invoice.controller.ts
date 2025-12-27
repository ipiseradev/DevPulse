import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import PDFDocument from 'pdfkit';

// Generar número de factura
const generateInvoiceNumber = async (): Promise<string> => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  const count = await prisma.invoice.count({
    where: {
      createdAt: {
        gte: new Date(year, date.getMonth(), 1),
        lt: new Date(year, date.getMonth() + 1, 1)
      }
    }
  });

  return `INV-${year}${month}-${String(count + 1).padStart(4, '0')}`;
};

// Obtener todas las facturas del usuario
export const getInvoices = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { status, clientId, page = '1', limit = '10' } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where = {
      client: { userId },
      ...(status && { status: status as any }),
      ...(clientId && { clientId: clientId as string })
    };

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          client: {
            select: { id: true, name: true, company: true }
          },
          project: {
            select: { id: true, name: true }
          },
          _count: {
            select: { items: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.invoice.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        invoices,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener facturas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener facturas'
    });
  }
};

// Obtener una factura por ID
export const getInvoiceById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        client: { userId }
      },
      include: {
        client: true,
        project: true,
        items: true
      }
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Error al obtener factura:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener factura'
    });
  }
};

// Crear factura
export const createInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { clientId, projectId, items, tax, dueDate, notes } = req.body;

    // Verificar que el cliente pertenece al usuario
    const client = await prisma.client.findFirst({
      where: { id: clientId, userId }
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Calcular totales
    const amount = items.reduce((acc: number, item: any) => 
      acc + (item.quantity * item.unitPrice), 0
    );
    const taxAmount = tax ? (amount * tax / 100) : 0;
    const total = amount + taxAmount;

    // Generar número de factura
    const number = await generateInvoiceNumber();

    const invoice = await prisma.invoice.create({
      data: {
        number,
        amount,
        tax: tax || 0,
        total,
        dueDate: new Date(dueDate),
        notes,
        clientId,
        projectId,
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice
          }))
        }
      },
      include: {
        client: true,
        items: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Factura creada exitosamente',
      data: invoice
    });
  } catch (error) {
    console.error('Error al crear factura:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear factura'
    });
  }
};

// Actualizar estado de factura
export const updateInvoiceStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { status } = req.body;

    // Verificar que la factura pertenece a un cliente del usuario
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id,
        client: { userId }
      }
    });

    if (!existingInvoice) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        status,
        paidDate: status === 'PAID' ? new Date() : null
      }
    });

    res.json({
      success: true,
      message: 'Estado de factura actualizado',
      data: invoice
    });
  } catch (error) {
    console.error('Error al actualizar factura:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar factura'
    });
  }
};

// Generar PDF de factura
export const generateInvoicePDF = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        client: { userId }
      },
      include: {
        client: true,
        project: true,
        items: true
      }
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    // Crear PDF
    const doc = new PDFDocument({ margin: 50 });

    // Configurar headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=factura-${invoice.number}.pdf`);

    doc.pipe(res);

    // Header
    doc.fontSize(24).text('FACTURA', 50, 50);
    doc.fontSize(12).text(`Nº: ${invoice.number}`, 400, 50);
    doc.text(`Fecha: ${invoice.issueDate.toLocaleDateString()}`, 400, 65);
    doc.text(`Vencimiento: ${invoice.dueDate.toLocaleDateString()}`, 400, 80);

    // Status badge
    doc.fontSize(10)
       .fillColor(invoice.status === 'PAID' ? 'green' : 'red')
       .text(invoice.status, 400, 95);
    doc.fillColor('black');

    // Línea separadora
    doc.moveTo(50, 120).lineTo(550, 120).stroke();

    // Información del cliente
    doc.fontSize(12).text('CLIENTE:', 50, 140);
    doc.fontSize(10)
       .text(invoice.client.name, 50, 155)
       .text(invoice.client.email, 50, 170)
       .text(invoice.client.company || '', 50, 185)
       .text(invoice.client.address || '', 50, 200);

    // Proyecto
    if (invoice.project) {
      doc.fontSize(12).text('PROYECTO:', 300, 140);
      doc.fontSize(10).text(invoice.project.name, 300, 155);
    }

    // Tabla de items
    let yPos = 250;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Descripción', 50, yPos);
    doc.text('Cantidad', 300, yPos);
    doc.text('Precio', 380, yPos);
    doc.text('Total', 470, yPos);

    doc.moveTo(50, yPos + 15).lineTo(550, yPos + 15).stroke();
    yPos += 25;

    doc.font('Helvetica');
    for (const item of invoice.items) {
      doc.text(item.description, 50, yPos, { width: 240 });
      doc.text(item.quantity.toString(), 300, yPos);
      doc.text(`$${item.unitPrice.toFixed(2)}`, 380, yPos);
      doc.text(`$${item.total.toFixed(2)}`, 470, yPos);
      yPos += 20;
    }

    // Línea antes de totales
    doc.moveTo(350, yPos + 10).lineTo(550, yPos + 10).stroke();
    yPos += 25;

    // Totales
    doc.text('Subtotal:', 380, yPos);
    doc.text(`$${invoice.amount.toFixed(2)}`, 470, yPos);
    yPos += 20;

    if (invoice.tax > 0) {
      doc.text(`IVA (${invoice.tax}%):`, 380, yPos);
      doc.text(`$${(invoice.amount * invoice.tax / 100).toFixed(2)}`, 470, yPos);
      yPos += 20;
    }

    doc.font('Helvetica-Bold');
    doc.text('TOTAL:', 380, yPos);
    doc.text(`$${invoice.total.toFixed(2)}`, 470, yPos);

    // Notas
    if (invoice.notes) {
      yPos += 50;
      doc.font('Helvetica').fontSize(10);
      doc.text('Notas:', 50, yPos);
      doc.text(invoice.notes, 50, yPos + 15, { width: 500 });
    }

    // Footer
    doc.fontSize(8)
       .text('Generado con DevPulse', 50, 750, { align: 'center' });

    doc.end();
  } catch (error) {
    console.error('Error al generar PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar PDF'
    });
  }
};

// Eliminar factura
export const deleteInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id,
        client: { userId }
      }
    });

    if (!existingInvoice) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    await prisma.invoice.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Factura eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar factura:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar factura'
    });
  }
};
