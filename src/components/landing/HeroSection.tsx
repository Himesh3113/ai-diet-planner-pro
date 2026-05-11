'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles, TrendingDown, Apple, Brain } from 'lucide-react';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

const stats = [
  { icon: TrendingDown, value: '94%', label: 'Goal Achievement', color: '#39FF14' },
  { icon: Apple, value: '500K+', label: 'Meals Planned', color: '#00F0FF' },
  { icon: Brain, value: 'GPT-4o', label: 'AI Engine', color: '#A855F7' },
];

const floatingBadges = [
  { text: 'Macro Tracking', delay: 0, x: '-10%', y: '15%' },
  { text: 'Instant Plans', delay: 0.3, x: '85%', y: '10%' },
  { text: '-12kg in 8 weeks', delay: 0.6, x: '80%', y: '75%' },
  { text: 'Muscle Gain Mode', delay: 0.9, x: '-8%', y: '80%' },
];

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050507] pt-20"
    >
      {/* Background gradient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
          style={{
            background: 'radial-gradient(circle, #39FF14 0%, transparent 70%)',
            top: '-10%',
            left: '-15%',
            animation: 'blob 9s infinite',
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-15 blur-[100px] animation-delay-2000"
          style={{
            background: 'radial-gradient(circle, #00F0FF 0%, transparent 70%)',
            top: '20%',
            right: '-10%',
            animation: 'blob 11s infinite',
            animationDelay: '2s',
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-10 blur-[90px] animation-delay-4000"
          style={{
            background: 'radial-gradient(circle, #A855F7 0%, transparent 70%)',
            bottom: '-5%',
            left: '40%',
            animation: 'blob 13s infinite',
            animationDelay: '4s',
          }}
        />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Floating badges (desktop only) */}
      {floatingBadges.map((badge, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: badge.delay + 1.2, duration: 0.5 }}
          className="absolute hidden lg:flex glass text-white/80 text-xs font-medium px-3 py-2 rounded-full border border-white/10 shadow-lg z-10"
          style={{
            left: badge.x,
            top: badge.y,
            animation: `float ${5 + i}s ease-in-out infinite`,
            animationDelay: `${i * 0.7}s`,
          }}
        >
          {badge.text}
        </motion.div>
      ))}

      {/* Main content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* Badge */}
          <motion.div variants={itemVariants} className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-[#39FF14]/25 text-xs font-semibold text-[#39FF14] uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Nutrition Intelligence
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05] text-white mb-6"
          >
            Eat Smart.{' '}
            <span className="relative inline-block">
              <span
                className="relative z-10"
                style={{
                  background: 'linear-gradient(135deg, #39FF14 0%, #00F0FF 50%, #A855F7 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Live Better.
              </span>
              <span
                className="absolute inset-0 blur-2xl opacity-40"
                style={{
                  background: 'linear-gradient(135deg, #39FF14, #00F0FF, #A855F7)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Live Better.
              </span>
            </span>
          </motion.h1>

          {/* Sub headline */}
          <motion.p
            variants={itemVariants}
            className="max-w-2xl mx-auto text-lg md:text-xl text-white/55 leading-relaxed mb-10"
          >
            Your personal AI nutritionist crafts hyper-personalized meal plans, tracks macros in
            real-time, and adapts to your body so you hit your goals faster than ever.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-14"
          >
            <Link
              id="hero-start-btn"
              href="/signup"
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#39FF14] text-black font-bold text-base shadow-[0_0_30px_rgba(57,255,20,0.5)] hover:shadow-[0_0_50px_rgba(57,255,20,0.7)] transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Start For Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            <a
              id="hero-demo-btn"
              href="#features"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full glass border border-white/15 text-white font-semibold text-base hover:border-white/30 hover:bg-white/10 transition-all duration-300"
            >
              See How It Works
            </a>
          </motion.div>

          {/* Stats row */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-6 md:gap-10"
          >
            {stats.map(({ icon: Icon, value, label, color }) => (
              <div key={label} className="flex items-center gap-3 group">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: `${color}18`,
                    border: `1px solid ${color}30`,
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div className="text-left">
                  <div className="text-xl font-bold text-white leading-none">{value}</div>
                  <div className="text-xs text-white/40 mt-0.5">{label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050507] to-transparent pointer-events-none" />
    </section>
  );
}
