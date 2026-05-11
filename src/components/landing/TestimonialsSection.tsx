'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Fitness Coach',
    avatar: 'SC',
    avatarColor: '#39FF14',
    rating: 5,
    quote:
      "AI Diet Planner Pro completely transformed how I manage nutrition for my clients. The AI meal plans are incredibly accurate and save me hours every week.",
  },
  {
    name: 'Marcus Rodriguez',
    role: 'Competitive Bodybuilder',
    avatar: 'MR',
    avatarColor: '#00F0FF',
    rating: 5,
    quote:
      "Lost 18kg in 12 weeks without losing muscle mass. The macro tracking and adaptive replanning are on another level. Best investment I've made.",
  },
  {
    name: 'Priya Sharma',
    role: 'Software Engineer',
    avatar: 'PS',
    avatarColor: '#A855F7',
    rating: 5,
    quote:
      "As someone with multiple food allergies, finding safe meal plans was always a nightmare. AI Diet Planner Pro handles everything automatically. It is a game changer.",
  },
  {
    name: 'Jake Thompson',
    role: 'Marathon Runner',
    avatar: 'JT',
    avatarColor: '#EC4899',
    rating: 5,
    quote:
      "My race times improved by 8% after following the AI's performance nutrition plan. The science behind it is legit and the UX is beautiful.",
  },
  {
    name: 'Elena Kowalski',
    role: 'Nutritionist',
    avatar: 'EK',
    avatarColor: '#F59E0B',
    rating: 5,
    quote:
      "I recommend AI Diet Planner Pro to all my patients. The insights are science-backed, the interface is clean, and the AI is genuinely impressive.",
  },
  {
    name: 'David Park',
    role: 'CrossFit Athlete',
    avatar: 'DP',
    avatarColor: '#39FF14',
    rating: 5,
    quote:
      "Three months in and I'm down 10kg while hitting new PRs in the gym. The meal prep scheduler alone is worth the subscription.",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6 },
  }),
};

export default function TestimonialsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="testimonials" className="relative py-28 bg-[#050507] overflow-hidden">
      {/* Background accent */}
      <div
        className="absolute bottom-0 right-0 w-[600px] h-[600px] opacity-[0.05] blur-[120px] pointer-events-none rounded-full"
        style={{ background: 'radial-gradient(circle, #00F0FF, transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00F0FF]/25 bg-[#00F0FF]/5 text-xs font-semibold text-[#00F0FF] uppercase tracking-widest mb-5">
            Social Proof
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-5">
            Loved by{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #00F0FF, #A855F7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              10,000+ users
            </span>
          </h2>
          <p className="max-w-lg mx-auto text-white/50 text-lg leading-relaxed">
            Real results from real people. Join a community that&apos;s transforming their health with AI.
          </p>
        </motion.div>

        {/* Testimonial grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="group relative glass rounded-2xl border border-white/[0.07] hover:border-white/15 p-6 flex flex-col gap-4 transition-all duration-300"
            >
              {/* Quote icon */}
              <Quote
                className="absolute top-5 right-5 w-8 h-8 opacity-10 group-hover:opacity-20 transition-opacity duration-300"
                style={{ color: t.avatarColor }}
              />

              {/* Stars */}
              <div className="flex items-center gap-1">
                {Array.from({ length: t.rating }).map((_, s) => (
                  <Star key={s} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                ))}
              </div>

              {/* Quote text */}
              <p className="text-sm text-white/60 leading-relaxed group-hover:text-white/75 transition-colors duration-300 flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t border-white/[0.06]">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-black shrink-0"
                  style={{ background: t.avatarColor }}
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{t.name}</div>
                  <div className="text-xs text-white/40">{t.role}</div>
                </div>
              </div>

              {/* Bottom accent */}
              <div
                className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `linear-gradient(90deg, transparent, ${t.avatarColor}50, transparent)` }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
