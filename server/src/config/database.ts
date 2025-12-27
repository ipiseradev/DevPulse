import { PrismaClient } from '@prisma/client';

// Crear una única instancia de Prisma Client
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['error']
});

export default prisma;
