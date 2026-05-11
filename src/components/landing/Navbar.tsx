'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Menu, X, Zap } from 'lucide-react';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Testimonials', href: '#testimonials' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'glass border-b border-white/10 shadow-[0_4px_40px_rgba(57,255,20,0.04)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-8 h-8 rounded-lg bg-[#39FF14]/15 flex items-center justify-center border border-[#39FF14]/30 group-hover:bg-[#39FF14]/25 transition-colors duration-300">
                <Zap className="w-4 h-4 text-[#39FF14]" fill="currentColor" />
                <div className="absolute inset-0 rounded-lg bg-[#39FF14] opacity-0 group-hover:opacity-10 blur-sm transition-opacity duration-300" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white">
                AI Diet Planner<span className="text-[#39FF14]"> Pro</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-white/60 hover:text-white transition-colors duration-200 relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#39FF14] group-hover:w-full transition-all duration-300" />
                </a>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm text-white/70 hover:text-white transition-colors duration-200 px-4 py-2"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="relative text-sm font-semibold text-black bg-[#39FF14] hover:bg-[#39FF14]/90 transition-all duration-200 px-5 py-2.5 rounded-full shadow-[0_0_20px_rgba(57,255,20,0.35)] hover:shadow-[0_0_30px_rgba(57,255,20,0.55)] active:scale-95"
              >
                Get Started Free
              </Link>
            </div>

            {/* Mobile burger */}
            <button
              id="navbar-mobile-menu-toggle"
              className="md:hidden text-white/70 hover:text-white transition-colors p-1"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-nav-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 glass border-b border-white/10 px-6 py-6 md:hidden"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-base text-white/70 hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                <Link href="/login" className="text-center text-white/70 hover:text-white text-sm transition-colors">
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="text-center font-semibold text-black bg-[#39FF14] hover:bg-[#39FF14]/90 transition-all duration-200 px-5 py-3 rounded-full shadow-[0_0_20px_rgba(57,255,20,0.35)]"
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
