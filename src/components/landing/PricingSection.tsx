'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Check, Zap, Crown, Rocket } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    id: 'starter',
    icon: Zap,
    name: 'Starter',
    badge: null,
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'Perfect to explore AI nutrition planning for free.',
    color: '#39FF14',
    features: [
      '3 AI meal plans per month',
      'Basic macro tracking',
      'Recipe library (100+)',
      '7-day meal history',
      'Email support',
    ],
    missing: ['Unlimited meal plans', 'Advanced analytics', 'Priority AI', 'Custom integrations'],
    cta: 'Get Started Free',
    ctaHref: '/signup',
    highlighted: false,
  },
  {
    id: 'pro',
    icon: Crown,
    name: 'Pro',
    badge: 'Most Popular',
    monthlyPrice: 19,
    annualPrice: 14,
    description: 'Everything you need to hit your fitness and nutrition goals.',
    color: '#39FF14',
    features: [
      'Unlimited AI meal plans',
      'Advanced macro & micro tracking',
      'Recipe library (500K+)',
      'Unlimited meal history',
      'Adaptive weekly replanning',
      'Shopping list generator',
      'Meal prep scheduler',
      'Priority AI responses',
      'Priority email & chat support',
    ],
    missing: [],
    cta: 'Start Pro Free',
    ctaHref: '/signup',
    highlighted: true,
  },
  {
    id: 'elite',
    icon: Rocket,
    name: 'Elite',
    badge: null,
    monthlyPrice: 49,
    annualPrice: 38,
    description: 'For athletes, coaches, and serious performance seekers.',
    color: '#A855F7',
    features: [
      'Everything in Pro',
      'Blood biomarker integration',
      'Athlete performance mode',
      'Coach dashboard',
      'Client meal plan management',
      'Custom branding exports',
      'API access',
      'Dedicated account manager',
      '1-on-1 nutrition strategy call',
    ],
    missing: [],
    cta: 'Go Elite',
    ctaHref: '/signup',
    highlighted: false,
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.65 },
  }),
};

export default function PricingSection() {
  const [annual, setAnnual] = useState(true);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="pricing" className="relative py-28 bg-[#050507] overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] opacity-[0.06] blur-[130px] pointer-events-none rounded-full"
        style={{ background: 'radial-gradient(circle, #A855F7, transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#A855F7]/25 bg-[#A855F7]/8 text-xs font-semibold text-[#A855F7] uppercase tracking-widest mb-5">
            Simple Pricing
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-5">
            Invest in your{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #A855F7, #00F0FF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              healthiest self
            </span>
          </h2>
          <p className="max-w-lg mx-auto text-white/50 text-lg leading-relaxed mb-8">
            No hidden fees. Cancel anytime. Start free and upgrade when you&apos;re ready.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 glass rounded-full px-2 py-2 border border-white/10">
            <button
              id="pricing-monthly-toggle"
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                !annual ? 'bg-white text-black shadow' : 'text-white/50 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              id="pricing-annual-toggle"
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                annual ? 'bg-white text-black shadow' : 'text-white/50 hover:text-white'
              }`}
            >
              Annual
              <span className="text-[10px] font-bold text-[#39FF14] bg-[#39FF14]/15 px-2 py-0.5 rounded-full">
                Save 25%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            const price = annual ? plan.annualPrice : plan.monthlyPrice;

            return (
              <motion.div
                key={plan.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className={`relative rounded-3xl flex flex-col overflow-hidden transition-all duration-300 ${
                  plan.highlighted
                    ? 'border-2 border-[#39FF14]/50 shadow-[0_0_60px_rgba(57,255,20,0.12)]'
                    : 'glass border border-white/[0.07] hover:border-white/15'
                }`}
                style={
                  plan.highlighted
                    ? { background: 'linear-gradient(160deg, rgba(57,255,20,0.06) 0%, rgba(10,10,15,0.9) 50%)' }
                    : {}
                }
              >
                {/* Popular badge */}
                {plan.badge && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="bg-[#39FF14] text-black text-xs font-bold px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(57,255,20,0.5)]">
                      {plan.badge}
                    </div>
                  </div>
                )}

                <div className="p-8 flex flex-col flex-1">
                  {/* Icon + Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: `${plan.color}15`,
                        border: `1px solid ${plan.color}30`,
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: plan.color }} />
                    </div>
                    <span className="text-white font-bold text-lg">{plan.name}</span>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-end gap-1">
                      <span className="text-5xl font-extrabold text-white">
                        {price === 0 ? 'Free' : `$${price}`}
                      </span>
                      {price > 0 && (
                        <span className="text-white/40 text-base mb-2">/mo</span>
                      )}
                    </div>
                    {annual && price > 0 && (
                      <p className="text-xs text-white/35 mt-1">Billed annually</p>
                    )}
                  </div>

                  <p className="text-sm text-white/45 leading-relaxed mb-7">{plan.description}</p>

                  {/* CTA */}
                  <Link
                    id={`pricing-cta-${plan.id}`}
                    href={plan.ctaHref}
                    className={`w-full text-center py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 mb-8 ${
                      plan.highlighted
                        ? 'bg-[#39FF14] text-black shadow-[0_0_25px_rgba(57,255,20,0.4)] hover:shadow-[0_0_40px_rgba(57,255,20,0.6)] hover:scale-[1.02]'
                        : 'glass border border-white/15 text-white hover:border-white/30 hover:bg-white/5'
                    }`}
                  >
                    {plan.cta}
                  </Link>

                  {/* Features */}
                  <div className="space-y-3 flex-1">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-start gap-2.5">
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center mt-0.5 shrink-0"
                          style={{ background: `${plan.color}20`, border: `1px solid ${plan.color}40` }}
                        >
                          <Check className="w-2.5 h-2.5" style={{ color: plan.color }} strokeWidth={3} />
                        </div>
                        <span className="text-sm text-white/65">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center text-white/30 text-sm mt-10"
        >
          All plans include a 14-day free trial. No credit card required.
        </motion.p>
      </div>
    </section>
  );
}
