'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  User, 
  Lock, 
  Bell, 
  Palette,
  Save,
  Camera,
  Check,
  ChevronRight,
  Globe,
  Mail,
  Smartphone,
  Shield,
  CreditCard,
  Monitor,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const menuItems = [
  { id: 'profile', label: 'Cuenta y Perfil', icon: User, desc: 'Información pública y datos de contacto' },
  { id: 'security', label: 'Seguridad', icon: Shield, desc: 'Contraseña, sesiones y 2FA' },
  { id: 'notifications', label: 'Notificaciones', icon: Bell, desc: 'Alertas de proyectos e emails' },
  { id: 'billing', label: 'Facturación', icon: CreditCard, desc: 'Planes, pagos e historial' },
  { id: 'appearance', label: 'Apariencia', icon: Palette, desc: 'Temas, colores y visualización' },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    company: '',
    bio: '',
    website: '',
    location: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    projectUpdates: true,
    invoiceReminders: true,
    weeklyDigest: false,
    browserPush: false,
  });

  const [appearance, setAppearance] = useState({
    theme: 'dark',
    accentColor: 'blue',
    reducedMotion: false,
  });

  const handleProfileSave = async () => {
    setIsLoading(true);
    try {
      await api.put('/users/profile', profileData);
      toast.success('Cambios sincronizados exitosamente');
    } catch (error) {
      toast.error('Error al actualizar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    setIsLoading(true);
    try {
      await api.put('/users/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Contraseña actualizada con éxito');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error('No se pudo verificar la contraseña actual');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">Configuración del Sistema</h1>
        <p className="text-zinc-400 text-lg font-medium">Personaliza tu entorno de trabajo y preferencias de seguridad.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 group ${
                  isActive 
                  ? 'bg-blue-600/10 border-blue-500/30 text-white' 
                  : 'bg-zinc-900/30 border-transparent text-zinc-500 hover:bg-zinc-900/60 hover:text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-500 group-hover:bg-zinc-700'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold tracking-tight">{item.label}</p>
                    <p className={`text-[10px] font-medium leading-tight mt-0.5 ${isActive ? 'text-blue-400/80' : 'text-zinc-600'}`}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8 shadow-2xl shadow-black/50"
            >
              {activeTab === 'profile' && (
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-zinc-800">
                    <div className="relative group">
                       <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-4xl font-black shadow-2xl overflow-hidden">
                          {user?.name?.charAt(0).toUpperCase()}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                             <Camera className="w-8 h-8" />
                          </div>
                       </div>
                       <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 border-4 border-zinc-900 shadow-lg" title="Online" />
                    </div>
                    <div className="text-center md:text-left">
                      <h2 className="text-2xl font-bold text-white tracking-tight">{user?.name}</h2>
                      <p className="text-zinc-500 font-medium italic mb-4">{user?.email}</p>
                      <div className="flex items-center gap-2">
                         <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest">
                            Miembro PRO
                         </span>
                         <span className="px-3 py-1 bg-zinc-800 text-zinc-500 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                            DevPulse ID: {user?.id?.slice(0, 8)}
                         </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      label="NOMBRE PÚBLICO"
                      placeholder="Ej: Ignacio Pisera"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    />
                    <Input
                      label="CORREO ELECTRÓNICO"
                      type="email"
                      value={profileData.email}
                      disabled
                    />
                    <Input
                      label="TELÉFONO DE CONTACTO"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      placeholder="+54 9 11 0000-0000"
                    />
                    <Input
                      label="COMPAÑÍA / AGENCIA"
                      value={profileData.company}
                      onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                      placeholder="Freelance Studio"
                    />
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-zinc-500 mb-3 uppercase tracking-widest leading-none">BIOGRAFÍA PROFESIONAL</label>
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        rows={4}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-zinc-200 placeholder:text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium text-sm resize-none shadow-inner"
                        placeholder="Expertise, tecnologías y un breve resumen de tu carrera..."
                      />
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                       <div className="relative">
                          <label className="block text-[10px] font-black text-zinc-500 mb-3 uppercase tracking-widest leading-none">SITIO WEB / PORTFOLIO</label>
                          <div className="relative">
                             <Globe className="absolute left-4 top-3.5 w-4 h-4 text-zinc-600" />
                             <input 
                                value={profileData.website}
                                onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-sm font-medium text-zinc-300 focus:outline-none focus:border-blue-500/40 transition-all"
                                placeholder="https://miportal.com"
                             />
                          </div>
                       </div>
                       <div className="relative">
                          <label className="block text-[10px] font-black text-zinc-500 mb-3 uppercase tracking-widest leading-none">UBICACIÓN ESPACIAL</label>
                          <div className="relative">
                             <Globe className="absolute left-4 top-3.5 w-4 h-4 text-zinc-600" />
                             <input 
                                value={profileData.location}
                                onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-sm font-medium text-zinc-300 focus:outline-none focus:border-blue-500/40 transition-all"
                                placeholder="Buenos Aires, Argentina"
                             />
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 border-t border-zinc-800">
                    <Button 
                       onClick={handleProfileSave} 
                       isLoading={isLoading}
                       className="px-10 py-5 rounded-2xl font-bold uppercase tracking-wider text-sm"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Sincronizar Datos
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-8">
                  <div className="flex items-center gap-4 mb-2">
                     <div className="p-3 bg-zinc-800 rounded-2xl border border-zinc-700">
                        <Lock className="w-6 h-6 text-zinc-400" />
                     </div>
                     <div>
                        <h3 className="text-xl font-bold text-white tracking-tight">Acceso y Encriptación</h3>
                        <p className="text-zinc-500 text-sm font-medium">Mantén tus credenciales seguras y actualizadas.</p>
                     </div>
                  </div>

                  <div className="grid gap-6">
                    <Input
                      label="CONTRASEÑA ACTUAL"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    />
                    <div className="grid md:grid-cols-2 gap-6">
                      <Input
                        label="NUEVO PASSWORD"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      />
                      <Input
                        label="REPETIR PASSWORD"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button onClick={handlePasswordChange} isLoading={isLoading} className="rounded-2xl px-8">
                      Actualizar Credenciales
                    </Button>
                  </div>

                  <div className="pt-8 border-t border-zinc-800">
                    <h4 className="text-[10px] font-black text-zinc-600 mb-6 uppercase tracking-[0.2em]">Autenticación Multifactor (MFA)</h4>
                    <div className="p-6 bg-zinc-950/50 border border-zinc-800 rounded-2xl flex items-center justify-between group hover:border-blue-500/20 transition-all">
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-500">
                             <Smartphone className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">Seguridad por App</p>
                             <p className="text-xs font-medium text-zinc-500">Usa apps como Google Authenticator o Authy.</p>
                          </div>
                       </div>
                       <Button variant="secondary" className="rounded-xl text-xs font-black uppercase tracking-widest px-6">Configurar</Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Other tabs follow the same styling logic... Placeholder for brevity but keep the structure professional */}
              {activeTab === 'appearance' && (
                <div className="space-y-8">
                   <div className="flex items-center gap-4 mb-4">
                     <div className="p-3 bg-zinc-800 rounded-2xl border border-zinc-700">
                        <Palette className="w-6 h-6 text-zinc-400" />
                     </div>
                     <div>
                        <h3 className="text-xl font-bold text-white tracking-tight">Personalización Visual</h3>
                        <p className="text-zinc-500 text-sm font-medium">Configura el entorno a tu gusto visual.</p>
                     </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      { id: 'dark', label: 'Dark Mode', icon: Moon, bg: 'bg-zinc-950', border: 'border-zinc-800' },
                      { id: 'light', label: 'Light Mode', icon: Sun, bg: 'bg-zinc-100', border: 'border-zinc-300' },
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => setAppearance({ ...appearance, theme: theme.id })}
                        className={`p-6 rounded-3xl border-2 text-left transition-all relative overflow-hidden group ${
                          appearance.theme === theme.id 
                          ? 'border-blue-500 bg-blue-500/5 shadow-2xl shadow-blue-500/10' 
                          : 'border-zinc-800 bg-zinc-950/20 hover:border-zinc-700'
                        }`}
                      >
                         <div className={`w-full h-32 ${theme.bg} rounded-2xl border ${theme.border} mb-4 flex items-center justify-center relative overflow-hidden`}>
                            <theme.icon className={`w-10 h-10 ${theme.id === 'dark' ? 'text-zinc-700' : 'text-zinc-400'}`} />
                            {appearance.theme === theme.id && (
                               <motion.div layoutId="theme-active" className="absolute inset-0 bg-blue-600/10 flex items-center justify-center">
                                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                                     <Check className="w-4 h-4 text-white" />
                                  </div>
                               </motion.div>
                            )}
                         </div>
                         <p className={`text-sm font-bold uppercase tracking-widest ${appearance.theme === theme.id ? 'text-blue-400' : 'text-zinc-500'}`}>{theme.label}</p>
                      </button>
                    ))}
                  </div>

                  <div className="pt-8 border-t border-zinc-800">
                     <h4 className="text-[10px] font-black text-zinc-600 mb-6 uppercase tracking-[0.2em]">Reducción de Movimiento</h4>
                     <button 
                        onClick={() => setAppearance({...appearance, reducedMotion: !appearance.reducedMotion})}
                        className="w-full flex items-center justify-between p-6 bg-zinc-950/20 border border-zinc-800 rounded-3xl hover:bg-zinc-900 transition-all"
                     >
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-zinc-800 rounded-xl text-zinc-400">
                              <Monitor className="w-5 h-5" />
                           </div>
                           <div className="text-left">
                              <p className="text-sm font-bold text-white">Animaciones Suaves</p>
                              <p className="text-xs font-medium text-zinc-500">Desactiva transiciones para mayor rendimiento.</p>
                           </div>
                        </div>
                        <div className={`w-12 h-6 rounded-full relative transition-colors ${appearance.reducedMotion ? 'bg-zinc-700' : 'bg-blue-600'}`}>
                           <motion.div 
                              animate={{ x: appearance.reducedMotion ? 4 : 26 }}
                              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg" 
                           />
                        </div>
                     </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
