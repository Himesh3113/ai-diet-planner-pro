'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  Brain,
  BarChart3,
  Utensils,
  Zap,
  RefreshCcw,
  ShieldCheck,
  Target,
  Clock,
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Meal Plans',
    description:
      'GPT-4o analyzes your biometrics, food preferences, and goals to generate fully personalized weekly meal plans in seconds.',
    color: '#39FF14',
    gradient: 'from-[#39FF14]/20 to-[#39FF14]/5',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Macro Tracking',
    description:
      'Log meals with a single tap. Instantly see calories, protein, carbs, and fats with beautiful visual breakdowns.',
    color: '#00F0FF',
    gradient: 'from-[#00F0FF]/20 to-[#00F0FF]/5',
  },
  {
    icon: Target,
    title: 'Smart Goal Engine',
    description:
      'Whether it\'s fat loss, muscle gain, or maintenance, the AI recalibrates your plan every week based on your actual progress.',
    color: '#A855F7',
    gradient: 'from-[#A855F7]/20 to-[#A855F7]/5',
  },
  {
    icon: Utensils,
    title: '500,000+ Recipe Library',
    description:
      'Browse a massive database of recipes filtered by diet type, cuisine, prep time, and macros. Never eat boring food again.',
    color: '#EC4899',
    gradient: 'from-[#EC4899]/20 to-[#EC4899]/5',
  },
  {
    icon: RefreshCcw,
    title: 'Adaptive Replanning',
    description:
      'Skipped a meal? Ate out? Just tell the AI and it auto-adjusts the rest of your day to keep you on track without guilt.',
    color: '#F59E0B',
    gradient: 'from-[#F59E0B]/20 to-[#F59E0B]/5',
  },
  {
    icon: Zap,
    title: 'Instant Nutrition Insights',
    description:
      'Ask the AI anything: "Is this breakfast too heavy before a workout?" Get science-backed answers in plain English.',
    color: '#39FF14',
    gradient: 'from-[#39FF14]/20 to-[#39FF14]/5',
  },
  {
    icon: ShieldCheck,
    title: 'Allergy & Diet Safe',
    description:
      'Set any dietary restriction like keto, vegan, gluten-free, or halal and every suggestion is automatically filtered and verified.',
    color: '#00F0FF',
    gradient: 'from-[#00F0FF]/20 to-[#00F0FF]/5',
  },
  {
    icon: Clock,
    title: 'Meal Prep Scheduler',
    description:
      'Generate a full weekly prep schedule with batch-cooking instructions, shopping lists, and time estimates.',
    color: '#A855F7',
    gradient: 'from-[#A855F7]/20 to-[#A855F7]/5',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6 },
  }),
};

export default function FeaturesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="features" className="relative py-28 bg-[#050507] overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full opacity-[0.04] blur-[140px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #39FF14, transparent 70%)' }} />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#39FF14]/20 bg-[#39FF14]/5 text-xs font-semibold text-[#39FF14] uppercase tracking-widest mb-5">
            Everything You Need
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-5">
            Features built for{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #39FF14, #00F0FF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              real results
            </span>
          </h2>
          <p className="max-w-xl mx-auto text-white/50 text-lg leading-relaxed">
            Every feature is designed around one mission: helping you transform your body through smarter nutrition.
          </p>
        </motion.div>

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group relative rounded-2xl glass border border-white/[0.07] hover:border-white/15 p-6 transition-all duration-300 cursor-default overflow-hidden"
              >
                {/* Card gradient top-left glow */}
                <div
                  className={`absolute top-0 left-0 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${feature.gradient} -translate-x-1/2 -translate-y-1/2`}
                />

                {/* Icon */}
                <div
                  className="relative w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    background: `${feature.color}12`,
                    border: `1px solid ${feature.color}25`,
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color: feature.color }} />
                </div>

                <h3 className="text-base font-bold text-white mb-2 leading-snug">
                  {feature.title}
                </h3>
                <p className="text-sm text-white/45 leading-relaxed group-hover:text-white/60 transition-colors duration-300">
                  {feature.description}
                </p>

                {/* Bottom accent line */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${feature.color}50, transparent)`,
                  }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
