'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Mail, MessageCircle, Sparkles, Users } from 'lucide-react';

const footerLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Privacy', href: '#' },
  { label: 'Terms', href: '#' },
];

const socialLinks = [
  { icon: MessageCircle, href: '#', label: 'Community' },
  { icon: Users, href: '#', label: 'Coaches' },
  { icon: Mail, href: '#', label: 'Contact' },
];

export default function CTASection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <>
      {/* ─── CTA Banner ─── */}
      <section className="relative py-28 bg-[#050507] overflow-hidden">
        {/* Glow orbs */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] opacity-10 blur-[120px] rounded-full"
            style={{ background: 'radial-gradient(ellipse, #39FF14 0%, #00F0FF 50%, transparent 80%)' }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 text-center" ref={ref}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-[#39FF14]/25 text-xs font-semibold text-[#39FF14] uppercase tracking-widest mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              Start For Free - No Credit Card
            </div>

            {/* Headline */}
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.08]">
              Your best body{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #39FF14 0%, #00F0FF 60%, #A855F7 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                starts today.
              </span>
            </h2>

            <p className="max-w-xl mx-auto text-lg text-white/50 leading-relaxed mb-10">
              Join 10,000+ users who are transforming their nutrition with AI. No guesswork.
              No bland diets. Just science-backed results.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                id="cta-signup-btn"
                href="/signup"
                className="group relative inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-[#39FF14] text-black font-bold text-base shadow-[0_0_40px_rgba(57,255,20,0.5)] hover:shadow-[0_0_60px_rgba(57,255,20,0.75)] transition-all duration-300 hover:scale-105 active:scale-95 w-full sm:w-auto"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <Link
                id="cta-features-btn"
                href="#features"
                className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full glass border border-white/15 text-white font-semibold text-base hover:border-white/30 hover:bg-white/10 transition-all duration-300 w-full sm:w-auto"
              >
                Explore Features
              </Link>
            </div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-6 mt-12 text-white/35 text-sm"
            >
              {['Free 14-day trial', 'No credit card required', 'Cancel anytime'].map((item) => (
                <span key={item} className="font-medium">{item}</span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="relative border-t border-white/[0.06] bg-[#030305] py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Brand */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#39FF14]/15 border border-[#39FF14]/30 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-[#39FF14]" />
              </div>
              <span className="font-bold text-white">
                AI Diet Planner<span className="text-[#39FF14]"> Pro</span>
              </span>
            </div>

            {/* Links */}
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {footerLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-white/35 hover:text-white/70 transition-colors duration-200"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Socials */}
            <div className="flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg glass border border-white/[0.07] flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/[0.04] text-center text-xs text-white/20">
            (c) {new Date().getFullYear()} AI Diet Planner Pro. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
