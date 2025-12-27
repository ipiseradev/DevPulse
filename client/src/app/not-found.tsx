'use client';

import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-lg">
        {/* 404 Number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="mb-8"
        >
          <h1 className="text-[150px] font-bold leading-none bg-gradient-to-r from-sky-400 via-fuchsia-400 to-sky-400 bg-clip-text text-transparent">
            404
          </h1>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-semibold text-slate-100 mb-4">
            Página no encontrada
          </h2>
          <p className="text-slate-400 mb-8">
            Lo sentimos, la página que buscas no existe o ha sido movida. 
            Verifica la URL o regresa al inicio.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/">
            <Button size="lg" leftIcon={<Home className="w-5 h-5" />}>
              Ir al Inicio
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="secondary" leftIcon={<ArrowLeft className="w-5 h-5" />}>
              Volver al Dashboard
            </Button>
          </Link>
        </motion.div>

        {/* Decorative elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 flex items-center justify-center gap-2 text-slate-600"
        >
          <Search className="w-4 h-4" />
          <span className="text-sm">¿Necesitas ayuda? Contacta soporte</span>
        </motion.div>
      </div>
    </div>
  );
}
