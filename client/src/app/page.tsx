'use client';

import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { useRef } from 'react';
import { 
  Zap, 
  ArrowRight, 
  Check,
  BarChart3, 
  Users, 
  FolderKanban,
  FileText,
  Github,
  Shield,
  TrendingUp,
  Lock,
  Globe,
  Play,
  ChevronRight,
  Sparkles,
  Award,
  Clock,
  CreditCard,
  LineChart,
  Layers,
  Star,
  LayoutDashboard
} from 'lucide-react';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function LandingPage() {
  const featuresRef = useRef(null);
  const isInView = useInView(featuresRef, { once: true, margin: "-100px" });

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white antialiased">
      {/* Ambient background - Enhanced glow effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[800px] h-[800px] bg-blue-500/[0.08] rounded-full blur-[150px]" />
        <div className="absolute top-[30%] right-[10%] w-[600px] h-[600px] bg-violet-500/[0.06] rounded-full blur-[150px]" />
        <div className="absolute bottom-[10%] left-[30%] w-[500px] h-[500px] bg-indigo-500/[0.05] rounded-full blur-[150px]" />
      </div>

      {/* Navigation - Improved spacing */}
      <header className="relative z-50">
        <nav className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">DevPulse</span>
          </Link>
          
          {/* Nav links with more spacing from logo */}
          <div className="hidden lg:flex items-center gap-8 text-sm text-zinc-400 font-medium ml-16">
            <Link href="#features" className="hover:text-white transition-colors py-2">Características</Link>
            <Link href="#precio" className="hover:text-white transition-colors py-2">Precios</Link>
            <Link href="#" className="hover:text-white transition-colors py-2">Documentación</Link>
            <Link href="#" className="hover:text-white transition-colors py-2">Changelog</Link>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-zinc-400 hover:text-white font-medium transition-colors px-3 py-2">
              Iniciar sesión
            </Link>
            <Link 
              href="/register" 
              className="text-sm bg-white text-zinc-900 px-5 py-2.5 rounded-full font-medium hover:bg-zinc-100 transition-all hover:scale-[1.02]"
            >
              Empezar gratis
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero - Enhanced typography and layout */}
      <section className="relative z-10 pt-20 pb-24 lg:pt-28 lg:pb-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-[13px] text-zinc-400 mb-8 backdrop-blur-sm"
            >
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 font-medium">Nuevo</span>
              </span>
              <span className="w-px h-3.5 bg-zinc-700" />
              <span>Integración con GitHub Actions</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </motion.div>

            {/* Title with tighter line-height and more vibrant gradient */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-[2.75rem] sm:text-6xl lg:text-[4.25rem] font-semibold leading-[1.05] tracking-[-0.03em] mb-6"
            >
              La infraestructura de gestión para{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-500">
                desarrolladores independientes
              </span>
            </motion.h1>

            {/* Subtitle with constrained width for better readability */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-zinc-400 leading-relaxed mb-10 max-w-xl"
            >
              Unifica clientes, proyectos, facturación y analytics en una plataforma. Construido para profesionales que valoran su tiempo.
            </motion.p>

            {/* CTAs - Consistent text and secondary button with border */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4"
            >
              <Link 
                href="/register" 
                className="group inline-flex items-center gap-2 bg-white text-zinc-900 px-6 py-3 rounded-full font-medium hover:bg-zinc-100 transition-all hover:scale-[1.02] shadow-lg shadow-white/10"
              >
                Empezar gratis
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link 
                href="#" 
                className="inline-flex items-center gap-2 text-zinc-300 hover:text-white px-5 py-3 font-medium transition-all border border-zinc-800 rounded-full hover:border-zinc-700 hover:bg-zinc-900/50"
              >
                <Play className="w-4 h-4" />
                Ver demo (2 min)
              </Link>
            </motion.div>

            {/* Social proof with animated entrance */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-14 flex flex-wrap items-center gap-x-6 gap-y-3"
            >
              {[
                { icon: Check, text: 'Sin tarjeta de crédito', delay: 0 },
                { icon: Check, text: 'Setup en 2 minutos', delay: 0.1 },
                { icon: Check, text: '99.9% uptime SLA', delay: 0.2 },
              ].map((item, i) => (
                <motion.span 
                  key={item.text}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + item.delay }}
                  className="flex items-center gap-2 text-sm text-zinc-500"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <item.icon className="w-3 h-3 text-emerald-400" />
                  </span>
                  {item.text}
                </motion.span>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 max-w-6xl mx-auto px-6"
        >
          <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-[#09090B] shadow-[0_0_80px_-20px_rgba(59,130,246,0.15)]">
            {/* Browser chrome */}
            <div className="relative flex items-center gap-2 px-4 py-3 border-b border-zinc-800/80 bg-zinc-900/50">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-zinc-800" />
                <div className="w-3 h-3 rounded-full bg-zinc-800" />
                <div className="w-3 h-3 rounded-full bg-zinc-800" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-2 px-4 py-1 rounded-md bg-zinc-800/50 text-[11px] text-zinc-500">
                  <Lock className="w-3 h-3 text-emerald-500" />
                  app.devpulse.io/dashboard
                </div>
              </div>
            </div>
            
            {/* Dashboard content */}
            <div className="relative flex">
              {/* Mini sidebar */}
              <div className="hidden lg:flex flex-col items-center gap-4 p-4 border-r border-zinc-800/50 bg-zinc-900/30">
                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                  <LayoutDashboard className="w-4 h-4 text-zinc-400" />
                </div>
                <div className="w-8 h-8 rounded-lg bg-zinc-800/50 flex items-center justify-center">
                  <FolderKanban className="w-4 h-4 text-zinc-500" />
                </div>
                <div className="w-8 h-8 rounded-lg bg-zinc-800/50 flex items-center justify-center">
                  <Users className="w-4 h-4 text-zinc-500" />
                </div>
                <div className="w-8 h-8 rounded-lg bg-zinc-800/50 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-zinc-500" />
                </div>
              </div>

              {/* Main content */}
              <div className="flex-1 p-6">
                {/* Stats grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Ingresos', value: '$24,580', change: '+18%', up: true },
                    { label: 'Proyectos', value: '12', change: '+3', up: true },
                    { label: 'Clientes', value: '28', change: '+4', up: true },
                    { label: 'Horas', value: '186h', change: '92%', up: true },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                      className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-zinc-500">{stat.label}</span>
                        <span className="text-[10px] font-medium text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
                          {stat.change}
                        </span>
                      </div>
                      <p className="text-xl font-semibold text-white">{stat.value}</p>
                    </motion.div>
                  ))}
                </div>
                
                {/* Charts row */}
                <div className="grid lg:grid-cols-5 gap-4">
                  {/* Revenue chart */}
                  <div className="lg:col-span-3 bg-zinc-900/50 rounded-xl p-5 border border-zinc-800/50">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h4 className="text-sm font-medium text-white">Revenue</h4>
                        <p className="text-xs text-zinc-500">Últimos 12 meses</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-white">$142,580</p>
                        <p className="text-xs text-emerald-400">+24% vs año anterior</p>
                      </div>
                    </div>
                    <div className="h-32 flex items-end gap-2">
                      {[40, 55, 45, 70, 60, 80, 65, 90, 75, 95, 85, 100].map((h, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: 0.8 + i * 0.04, duration: 0.5, ease: "easeOut" }}
                          className={`flex-1 rounded-md ${
                            i === 11 
                              ? 'bg-blue-500' 
                              : 'bg-zinc-700 hover:bg-zinc-600'
                          } transition-colors cursor-pointer`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Projects status */}
                  <div className="lg:col-span-2 bg-zinc-900/50 rounded-xl p-5 border border-zinc-800/50">
                    <h4 className="text-sm font-medium text-white mb-1">Estados</h4>
                    <p className="text-xs text-zinc-500 mb-5">12 proyectos activos</p>
                    <div className="space-y-4">
                      {[
                        { label: 'En progreso', value: 5, color: 'bg-blue-500', w: 'w-[42%]' },
                        { label: 'Completados', value: 4, color: 'bg-emerald-500', w: 'w-[33%]' },
                        { label: 'En revisión', value: 2, color: 'bg-amber-500', w: 'w-[17%]' },
                        { label: 'Pendientes', value: 1, color: 'bg-zinc-600', w: 'w-[8%]' },
                      ].map((item) => (
                        <div key={item.label}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-zinc-400">{item.label}</span>
                            <span className="text-xs font-medium text-white">{item.value}</span>
                          </div>
                          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div className={`h-full ${item.color} ${item.w} rounded-full`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Social proof */}
      <section className="relative z-10 py-16 border-y border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[13px] text-zinc-500 mb-8">
            Utilizado por profesionales de empresas como
          </p>
          <div className="flex items-center justify-center gap-12 lg:gap-16 opacity-40">
            {['Stripe', 'Vercel', 'Linear', 'Notion', 'Figma', 'GitHub'].map((name) => (
              <span key={name} className="text-lg font-semibold text-zinc-300 tracking-tight">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" ref={featuresRef} className="relative z-10 py-24 lg:py-32 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <motion.div 
            className="max-w-xl mb-20"
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={stagger}
          >
            <motion.h2 variants={fadeInUp} className="text-3xl lg:text-4xl font-medium tracking-tight mb-4">
              Diseñado para desarrolladores que valoran su tiempo
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-zinc-400 text-lg">
              Una plataforma completa que simplifica la gestión de tu negocio freelance.
            </motion.p>
          </motion.div>

          {/* Features Grid */}
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16"
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={stagger}
          >
            {[
              { 
                num: '01',
                title: 'Gestión de Proyectos', 
                desc: 'Organiza tu trabajo con tableros Kanban, líneas de tiempo y seguimiento de progreso en tiempo real.'
              },
              { 
                num: '02',
                title: 'CRM Integrado', 
                desc: 'Centraliza la información de clientes, historial de proyectos y comunicaciones en un solo lugar.'
              },
              { 
                num: '03',
                title: 'Facturación Automática', 
                desc: 'Genera facturas profesionales, programa recordatorios y gestiona cobros de forma automática.'
              },
              { 
                num: '04',
                title: 'Analytics Avanzado', 
                desc: 'Visualiza métricas de rendimiento, proyecciones de ingresos y genera reportes detallados.'
              },
              { 
                num: '05',
                title: 'Integración GitHub', 
                desc: 'Conecta repositorios, visualiza actividad de desarrollo y vincula commits con proyectos.'
              },
              { 
                num: '06',
                title: 'Seguridad Enterprise', 
                desc: 'Encriptación de datos, autenticación 2FA, audit logs y cumplimiento de estándares.'
              },
            ].map((feature) => (
              <motion.div
                key={feature.num}
                variants={fadeInUp}
                className="group"
              >
                <span className="text-sm text-zinc-600 font-mono mb-4 block">
                  {feature.num}
                </span>
                <h3 className="text-xl font-medium text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-zinc-500 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6">
          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            {/* Left: Header + Stats */}
            <div className="lg:sticky lg:top-32">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-blue-400 text-sm font-medium mb-4"
              >
                TESTIMONIOS
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 }}
                className="text-3xl lg:text-4xl font-medium tracking-tight mb-6"
              >
                Profesionales de todo el mundo confían en nosotros
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-zinc-400 text-lg mb-12"
              >
                Desarrolladores, freelancers y agencias usan DevPulse para gestionar su negocio de forma eficiente.
              </motion.p>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-8">
                {[
                  { value: '5K+', label: 'Usuarios' },
                  { value: '$2.4M', label: 'Facturado' },
                  { value: '4.9', label: 'Rating' },
                ].map((stat, i) => (
                  <motion.div 
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                  >
                    <p className="text-3xl font-semibold text-white">{stat.value}</p>
                    <p className="text-sm text-zinc-500">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Company logos */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="mt-12 pt-8 border-t border-zinc-800"
              >
                <p className="text-xs text-zinc-600 uppercase tracking-wider mb-4">Nuestros usuarios trabajan en</p>
                <div className="flex items-center gap-6 text-zinc-500">
                  {['Google', 'Meta', 'Amazon', 'Stripe'].map((company) => (
                    <span key={company} className="text-sm font-medium">{company}</span>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right: Testimonials */}
            <div className="space-y-6">
              {[
                {
                  quote: "DevPulse transformó completamente cómo gestiono mi freelance. Pasé de usar 5 herramientas a tener todo en un solo lugar. Mi productividad aumentó significativamente.",
                  name: "Carlos Mendez",
                  role: "Senior Full Stack Developer",
                  company: "Ex-Google"
                },
                {
                  quote: "La integración con GitHub es exactamente lo que necesitaba. Puedo ver mis commits, PRs y vincularlos directamente con proyectos de clientes.",
                  name: "Ana Rodriguez",
                  role: "Frontend Developer",
                  company: "Freelance"
                },
                {
                  quote: "El sistema de facturación me ahorra horas cada mes. Genero facturas profesionales en segundos y mis clientes reciben recordatorios automáticos.",
                  name: "Miguel Santos",
                  role: "Mobile Developer",
                  company: "Ex-Meta"
                },
                {
                  quote: "El dashboard de analytics me da insights que antes no tenía. Ahora tomo decisiones basadas en datos reales de mi negocio.",
                  name: "Sofia Martinez",
                  role: "Backend Developer",
                  company: "Ex-Amazon"
                },
              ].map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors"
                >
                  <p className="text-zinc-300 leading-relaxed mb-5">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{testimonial.name}</p>
                      <p className="text-sm text-zinc-500">{testimonial.role}</p>
                    </div>
                    <span className="text-xs text-zinc-600 bg-zinc-800 px-2 py-1 rounded">
                      {testimonial.company}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precio" className="relative z-10 py-24 lg:py-32">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-blue-400 text-sm font-medium mb-3"
            >
              PRECIOS
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="text-3xl lg:text-4xl font-medium tracking-tight mb-4"
            >
              Un plan para cada etapa
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-zinc-400 max-w-lg mx-auto"
            >
              Comienza gratis y escala a medida que crece tu negocio. Sin costos ocultos, sin compromisos a largo plazo.
            </motion.p>
          </div>

          {/* Pricing Cards */}
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              { 
                name: 'Gratis', 
                price: '$0',
                period: '/mes',
                desc: 'Ideal para comenzar y explorar la plataforma',
                features: [
                  'Hasta 5 proyectos activos',
                  'Hasta 3 clientes',
                  'Dashboard básico',
                  'Exportación PDF',
                  'Soporte por email',
                  'Integración GitHub',
                ],
                cta: 'Comenzar gratis',
                highlight: false,
                badge: null
              },
              { 
                name: 'Profesional', 
                price: '$19',
                period: '/mes',
                desc: 'Todo lo necesario para escalar tu negocio freelance',
                features: [
                  'Proyectos ilimitados',
                  'Clientes ilimitados', 
                  'Analytics avanzado',
                  'Integración GitHub',
                  'Facturación automática',
                  'Soporte prioritario',
                ],
                cta: 'Probar 14 días gratis',
                highlight: true,
                badge: 'Recomendado'
              },
              { 
                name: 'Empresas', 
                price: 'Personalizado',
                period: '',
                desc: 'Para equipos y agencias con requerimientos específicos',
                features: [
                  'Todo lo de Profesional',
                  'Usuarios ilimitados',
                  'Acceso completo a API',
                  'SSO / SAML',
                  'SLA 99.99%',
                  'Gerente de cuenta dedicado',
                ],
                cta: 'Contactar ventas',
                highlight: false,
                badge: null
              },
            ].map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-2xl p-8 ${
                  plan.highlight 
                    ? 'bg-zinc-900 border-2 border-blue-500/50 ring-1 ring-blue-500/20' 
                    : 'bg-zinc-900/50 border border-zinc-800'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-6">
                    <span className="px-3 py-1 bg-blue-500 text-white text-[11px] font-medium rounded-full">
                      {plan.badge}
                    </span>
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-white mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-zinc-500">
                    {plan.desc}
                  </p>
                </div>
                
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-semibold text-white">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-zinc-500">{plan.period}</span>
                  )}
                </div>

                <Link
                  href="/register"
                  className={`block text-center py-3 rounded-lg font-medium text-sm transition-all mb-6 ${
                    plan.highlight
                      ? 'bg-blue-500 text-white hover:bg-blue-400'
                      : 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700'
                  }`}
                >
                  {plan.cta}
                </Link>

                <div className="pt-6 border-t border-zinc-800">
                  <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-4">
                    Incluye
                  </p>
                  <div className="space-y-3">
                    {plan.features.map((feature) => (
                      <div 
                        key={feature} 
                        className="flex items-center gap-3 text-sm text-zinc-300"
                      >
                        <Check className="w-4 h-4 text-blue-400 shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom note */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12 space-y-2"
          >
            <p className="text-sm text-zinc-500">
              Todos los planes incluyen SSL, backups diarios y 99.9% de uptime.
            </p>
            <p className="text-sm text-zinc-600">
              Precios en USD. Cancela en cualquier momento.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 lg:py-32 border-t border-zinc-800/50">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl lg:text-5xl font-medium tracking-tight mb-6"
          >
            Empieza hoy
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-zinc-400 text-lg mb-10"
          >
            Crea tu cuenta gratis y lleva tu trabajo freelance al siguiente nivel.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-white text-zinc-900 px-8 py-3.5 rounded-lg font-medium hover:bg-zinc-200 transition-colors"
            >
              Crear cuenta gratis
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-zinc-800 text-white px-8 py-3.5 rounded-lg font-medium hover:bg-zinc-700 transition-colors"
            >
              Iniciar sesión
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800/50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-5 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold">DevPulse</span>
              </div>
              <p className="text-sm text-zinc-500 max-w-xs mb-4">
                La plataforma de gestión integral para desarrolladores independientes.
              </p>
              <div className="flex items-center gap-2 text-[12px] text-zinc-500">
                <span className="flex items-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  All systems operational
                </span>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-white text-sm mb-4">Producto</h4>
              <ul className="space-y-3 text-sm text-zinc-500">
                <li><Link href="#" className="hover:text-white transition-colors">Características</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Precios</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Changelog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Roadmap</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white text-sm mb-4">Recursos</h4>
              <ul className="space-y-3 text-sm text-zinc-500">
                <li><Link href="#" className="hover:text-white transition-colors">Documentación</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">API Reference</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Status</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white text-sm mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-zinc-500">
                <li><Link href="#" className="hover:text-white transition-colors">Privacidad</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Términos</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Cookies</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">DPA</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-zinc-800/50 pt-8 flex items-center justify-between">
            <p className="text-sm text-zinc-600">
              © 2025 DevPulse Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="text-zinc-500 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-zinc-500 hover:text-white transition-colors">
                <Globe className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
