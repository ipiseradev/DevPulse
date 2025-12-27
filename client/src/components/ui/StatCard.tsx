'use client';

import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  color: 'primary' | 'accent' | 'green' | 'yellow' | 'red' | 'sky' | 'fuchsia' | 'emerald' | 'amber';
  delay?: number;
}

const colorClasses = {
  primary: {
    gradient: 'from-sky-500/20 via-sky-500/10 to-transparent',
    iconGradient: 'from-sky-400 via-cyan-400 to-sky-500',
    ringColor: 'border-sky-400/40',
    pulseColor: 'bg-sky-400',
    glowColor: 'rgba(56,189,248,0.6)',
    iconText: 'text-white',
    glow: 'group-hover:shadow-[0_0_50px_-5px_rgba(56,189,248,0.5)]',
  },
  sky: {
    gradient: 'from-sky-500/20 via-sky-500/10 to-transparent',
    iconGradient: 'from-sky-400 via-cyan-400 to-sky-500',
    ringColor: 'border-sky-400/40',
    pulseColor: 'bg-sky-400',
    glowColor: 'rgba(56,189,248,0.6)',
    iconText: 'text-white',
    glow: 'group-hover:shadow-[0_0_50px_-5px_rgba(56,189,248,0.5)]',
  },
  accent: {
    gradient: 'from-fuchsia-500/20 via-fuchsia-500/10 to-transparent',
    iconGradient: 'from-fuchsia-400 via-pink-400 to-fuchsia-500',
    ringColor: 'border-fuchsia-400/40',
    pulseColor: 'bg-fuchsia-400',
    glowColor: 'rgba(217,70,239,0.6)',
    iconText: 'text-white',
    glow: 'group-hover:shadow-[0_0_50px_-5px_rgba(217,70,239,0.5)]',
  },
  fuchsia: {
    gradient: 'from-fuchsia-500/20 via-fuchsia-500/10 to-transparent',
    iconGradient: 'from-fuchsia-400 via-pink-400 to-fuchsia-500',
    ringColor: 'border-fuchsia-400/40',
    pulseColor: 'bg-fuchsia-400',
    glowColor: 'rgba(217,70,239,0.6)',
    iconText: 'text-white',
    glow: 'group-hover:shadow-[0_0_50px_-5px_rgba(217,70,239,0.5)]',
  },
  green: {
    gradient: 'from-emerald-500/20 via-emerald-500/10 to-transparent',
    iconGradient: 'from-emerald-400 via-teal-400 to-emerald-500',
    ringColor: 'border-emerald-400/40',
    pulseColor: 'bg-emerald-400',
    glowColor: 'rgba(16,185,129,0.6)',
    iconText: 'text-white',
    glow: 'group-hover:shadow-[0_0_50px_-5px_rgba(16,185,129,0.5)]',
  },
  emerald: {
    gradient: 'from-emerald-500/20 via-emerald-500/10 to-transparent',
    iconGradient: 'from-emerald-400 via-teal-400 to-emerald-500',
    ringColor: 'border-emerald-400/40',
    pulseColor: 'bg-emerald-400',
    glowColor: 'rgba(16,185,129,0.6)',
    iconText: 'text-white',
    glow: 'group-hover:shadow-[0_0_50px_-5px_rgba(16,185,129,0.5)]',
  },
  yellow: {
    gradient: 'from-amber-500/20 via-amber-500/10 to-transparent',
    iconGradient: 'from-amber-400 via-orange-400 to-amber-500',
    ringColor: 'border-amber-400/40',
    pulseColor: 'bg-amber-400',
    glowColor: 'rgba(245,158,11,0.6)',
    iconText: 'text-white',
    glow: 'group-hover:shadow-[0_0_50px_-5px_rgba(245,158,11,0.5)]',
  },
  amber: {
    gradient: 'from-amber-500/20 via-amber-500/10 to-transparent',
    iconGradient: 'from-amber-400 via-orange-400 to-amber-500',
    ringColor: 'border-amber-400/40',
    pulseColor: 'bg-amber-400',
    glowColor: 'rgba(245,158,11,0.6)',
    iconText: 'text-white',
    glow: 'group-hover:shadow-[0_0_50px_-5px_rgba(245,158,11,0.5)]',
  },
  red: {
    gradient: 'from-red-500/20 via-red-500/10 to-transparent',
    iconGradient: 'from-red-400 via-rose-400 to-red-500',
    ringColor: 'border-red-400/40',
    pulseColor: 'bg-red-400',
    glowColor: 'rgba(239,68,68,0.6)',
    iconText: 'text-white',
    glow: 'group-hover:shadow-[0_0_50px_-5px_rgba(239,68,68,0.5)]',
  },
};

export default function StatCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon,
  color,
  delay = 0
}: StatCardProps) {
  const colors = colorClasses[color] || colorClasses.primary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -6, scale: 1.02 }}
      className={`
        group relative overflow-hidden rounded-2xl p-6
        bg-slate-900/60 backdrop-blur-xl border border-slate-700/50
        transition-all duration-500
        hover:border-slate-500/50
        ${colors.glow}
      `}
    >
      {/* Animated gradient orb background */}
      <motion.div 
        className={`absolute -top-16 -right-16 w-48 h-48 rounded-full bg-gradient-radial ${colors.gradient} blur-2xl`}
        animate={{ 
          opacity: [0.4, 0.7, 0.4],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.8 }}
        />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-5">
          {/* ULTRA PROFESSIONAL Icon Container */}
          <div className="relative">
            {/* Outer pulsing ring */}
            <motion.div
              className={`absolute -inset-2 rounded-2xl border-2 ${colors.ringColor} opacity-0 group-hover:opacity-100`}
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            {/* Secondary ring */}
            <motion.div
              className={`absolute -inset-1 rounded-xl border ${colors.ringColor}`}
              animate={{ 
                rotate: 360,
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              style={{
                borderStyle: 'dashed',
                opacity: 0.3
              }}
            />
            
            {/* Main icon container with gradient */}
            <motion.div 
              className={`
                relative p-4 rounded-xl 
                bg-gradient-to-br ${colors.iconGradient}
                shadow-lg
                transition-all duration-300 
                group-hover:scale-110
              `}
              style={{
                boxShadow: `0 8px 32px -4px ${colors.glowColor}, inset 0 1px 0 rgba(255,255,255,0.2)`
              }}
              whileHover={{ rotate: [0, -8, 8, 0] }}
              transition={{ duration: 0.5 }}
            >
              {/* Inner glow */}
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* Shine effect */}
              <div className="absolute inset-0 rounded-xl overflow-hidden">
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent"
                  initial={{ x: '-100%', y: '-100%' }}
                  whileHover={{ x: '100%', y: '100%' }}
                  transition={{ duration: 0.6 }}
                />
              </div>
              
              <Icon className={`relative w-6 h-6 ${colors.iconText} drop-shadow-lg`} strokeWidth={2.5} />
            </motion.div>
            
            {/* Floating particle dots */}
            <motion.div
              className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${colors.pulseColor}`}
              animate={{ 
                scale: [0.8, 1.2, 0.8],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
          </div>
          
          {/* Change badge */}
          {change && (
            <motion.div 
              className={`
                flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-xl
                backdrop-blur-md border
                ${changeType === 'positive' 
                  ? 'bg-gradient-to-r from-emerald-500/30 to-teal-500/20 text-emerald-300 border-emerald-400/40 shadow-[0_0_20px_-3px_rgba(16,185,129,0.5)]' 
                  : ''}
                ${changeType === 'negative' 
                  ? 'bg-gradient-to-r from-red-500/30 to-rose-500/20 text-red-300 border-red-400/40 shadow-[0_0_20px_-3px_rgba(239,68,68,0.5)]' 
                  : ''}
                ${changeType === 'neutral' 
                  ? 'bg-slate-700/50 text-slate-400 border-slate-600/40' 
                  : ''}
              `}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: delay + 0.3, type: "spring", stiffness: 200 }}
            >
              {changeType === 'positive' && <TrendingUp className="w-4 h-4" />}
              {changeType === 'negative' && <TrendingDown className="w-4 h-4" />}
              <span>{change}</span>
            </motion.div>
          )}
        </div>

        <motion.h3 
          className="text-slate-400 text-xs font-semibold mb-2 uppercase tracking-widest"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: delay + 0.1 }}
        >
          {title}
        </motion.h3>
        
        <motion.p 
          className="text-4xl font-extrabold text-white tabular-nums tracking-tight"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.15 }}
        >
          {value}
        </motion.p>
      </div>
    </motion.div>
  );
}


