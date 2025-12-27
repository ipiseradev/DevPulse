'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Smartphone, 
  Check, 
  Copy, 
  RefreshCw,
  Lock,
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function TwoFactorPage() {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  
  // Mock secret key - in production this would come from backend
  const secretKey = 'JBSWY3DPEHPK3PXP';
  const backupCodes = [
    'A1B2-C3D4-E5F6',
    'G7H8-I9J0-K1L2',
    'M3N4-O5P6-Q7R8',
    'S9T0-U1V2-W3X4',
    'Y5Z6-A7B8-C9D0',
  ];

  const handleEnable2FA = () => {
    setShowSetup(true);
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      toast.error('El código debe tener 6 dígitos');
      return;
    }

    setIsVerifying(true);
    
    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In production, verify with backend
    if (verificationCode === '123456') {
      setIs2FAEnabled(true);
      setShowSetup(false);
      toast.success('2FA activado correctamente');
    } else {
      // For demo, accept any 6-digit code
      setIs2FAEnabled(true);
      setShowSetup(false);
      toast.success('2FA activado correctamente');
    }
    
    setIsVerifying(false);
  };

  const handleDisable2FA = () => {
    setIs2FAEnabled(false);
    toast.success('2FA desactivado');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado al portapapeles');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Autenticación de Dos Factores</h1>
        <p className="text-slate-400">Añade una capa extra de seguridad a tu cuenta</p>
      </div>

      {/* Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`glass-card p-6 border-2 ${
          is2FAEnabled ? 'border-emerald-500/30' : 'border-amber-500/30'
        }`}
      >
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${
            is2FAEnabled ? 'bg-emerald-500/20' : 'bg-amber-500/20'
          }`}>
            <Shield className={`w-6 h-6 ${
              is2FAEnabled ? 'text-emerald-400' : 'text-amber-400'
            }`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-white">
                {is2FAEnabled ? '2FA Activado' : '2FA Desactivado'}
              </h2>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                is2FAEnabled 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-amber-500/20 text-amber-400'
              }`}>
                {is2FAEnabled ? 'Seguro' : 'Recomendado'}
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              {is2FAEnabled 
                ? 'Tu cuenta está protegida con autenticación de dos factores.'
                : 'Activa 2FA para proteger tu cuenta con un código adicional al iniciar sesión.'
              }
            </p>
            
            <div className="mt-4">
              {is2FAEnabled ? (
                <Button 
                  variant="ghost" 
                  onClick={handleDisable2FA}
                  className="text-red-400 hover:text-red-300"
                >
                  Desactivar 2FA
                </Button>
              ) : (
                <Button onClick={handleEnable2FA} leftIcon={<Lock className="w-4 h-4" />}>
                  Activar 2FA
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Setup Modal */}
      {showSetup && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-sky-400" />
            Configurar 2FA
          </h3>

          <div className="space-y-6">
            {/* Step 1: App */}
            <div className="flex items-start gap-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 font-bold text-sm">
                1
              </span>
              <div>
                <p className="font-medium text-white">Descarga una app de autenticación</p>
                <p className="text-sm text-slate-400 mt-1">
                  Recomendamos Google Authenticator, Authy o Microsoft Authenticator
                </p>
              </div>
            </div>

            {/* Step 2: Secret Key */}
            <div className="flex items-start gap-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 font-bold text-sm">
                2
              </span>
              <div className="flex-1">
                <p className="font-medium text-white">Ingresa esta clave en tu app</p>
                <div className="mt-2 flex items-center gap-2">
                  <code className="flex-1 px-4 py-2 bg-slate-800 rounded-lg text-sky-400 font-mono text-sm">
                    {secretKey}
                  </code>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyToClipboard(secretKey)}
                    leftIcon={<Copy className="w-4 h-4" />}
                  >
                    Copiar
                  </Button>
                </div>
              </div>
            </div>

            {/* Step 3: Verify */}
            <div className="flex items-start gap-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 font-bold text-sm">
                3
              </span>
              <div className="flex-1">
                <p className="font-medium text-white">Ingresa el código de verificación</p>
                <div className="mt-2 flex items-center gap-2">
                  <Input
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="max-w-32 text-center font-mono text-lg"
                  />
                  <Button 
                    onClick={handleVerify}
                    isLoading={isVerifying}
                    leftIcon={<Check className="w-4 h-4" />}
                  >
                    Verificar
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-700/50">
            <Button variant="ghost" onClick={() => setShowSetup(false)}>
              Cancelar
            </Button>
          </div>
        </motion.div>
      )}

      {/* Backup Codes - Show only when 2FA is enabled */}
      {is2FAEnabled && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-semibold text-white">Códigos de Respaldo</h3>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowBackupCodes(!showBackupCodes)}
              leftIcon={showBackupCodes ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            >
              {showBackupCodes ? 'Ocultar' : 'Mostrar'}
            </Button>
          </div>
          
          <p className="text-sm text-slate-400 mb-4">
            Guarda estos códigos en un lugar seguro. Puedes usarlos para acceder a tu cuenta si pierdes acceso a tu app de autenticación.
          </p>

          {showBackupCodes && (
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, index) => (
                <code 
                  key={index}
                  className="px-3 py-2 bg-slate-800 rounded-lg text-slate-300 font-mono text-sm text-center"
                >
                  {code}
                </code>
              ))}
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => copyToClipboard(backupCodes.join('\n'))}
              leftIcon={<Copy className="w-4 h-4" />}
            >
              Copiar todos
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={() => toast.success('Códigos regenerados')}
            >
              Regenerar
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
