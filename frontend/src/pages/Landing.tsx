import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { 
  Wallet, 
  ShieldCheck, 
  Zap, 
  Activity, 
  ArrowRight,
  Sun,
  Moon,
  Globe
} from 'lucide-react';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { theme, toggleTheme } = useThemeStore();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any } }
  };

  const features = [
    {
      title: "Bank-Grade Security",
      desc: "Protected by pessimistic database locking, row-level updates, and brute-force protection to keep your assets secure.",
      icon: ShieldCheck,
      color: "text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/40"
    },
    {
      title: "Instant Transfers",
      desc: "Send and receive money seamlessly across user accounts in real time. Backed by transactional ACID compliance.",
      icon: Zap,
      color: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40"
    },
    {
      title: "Detailed Audit Trail",
      desc: "Every register, login, deposit, withdrawal, and transfer action is fully tracked and recorded in secure audit databases.",
      icon: Activity,
      color: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors duration-200 overflow-x-hidden">
      
      {/* Mesh Background */}
      <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-tr from-indigo-500/10 via-purple-500/5 to-transparent dark:from-indigo-950/25 dark:via-zinc-950/0 pointer-events-none" />

      {/* Header */}
      <header className="glass border-b border-slate-200/50 dark:border-zinc-900/50 sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2 rounded-2xl shadow-md shadow-indigo-600/20">
            <Wallet size={22} />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-400 dark:to-indigo-500 bg-clip-text text-transparent">PayFlow</span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="p-2.5 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-2xl transition-all"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          {isAuthenticated ? (
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-medium shadow-lg shadow-indigo-600/25 transition-all text-sm"
            >
              Go to Dashboard
            </button>
          ) : (
            <>
              <button 
                onClick={() => navigate('/login')}
                className="hidden sm:block text-slate-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-sm transition-all"
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-medium shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 hover:-translate-y-0.5 transition-all text-sm"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-8 max-w-3xl"
        >
          <motion.div variants={itemVariants}>
            <span className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full font-semibold text-xs tracking-wider uppercase border border-indigo-100/50 dark:border-indigo-950/80">
              Introducing Digital Wallet v2
            </span>
          </motion.div>

          <motion.h1 
            variants={itemVariants} 
            className="font-display text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-none text-slate-900 dark:text-white"
          >
            The Secure Digital Wallet <br className="hidden md:inline" />
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">Built for Modern Teams</span>
          </motion.h1>

          <motion.p 
            variants={itemVariants} 
            className="text-slate-500 dark:text-zinc-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            Experience lightning-fast fund transfers, atomic database consistency, and premium analytics. All wrapped in a modern, lightweight interface.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <button 
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-semibold shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/35 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <span>Start banking now</span>
              <ArrowRight size={18} />
            </button>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer"
              className="w-full sm:w-auto px-8 py-4 glass text-slate-700 dark:text-zinc-200 rounded-2xl font-semibold hover:bg-slate-100/50 dark:hover:bg-zinc-900/40 transition-all flex items-center justify-center gap-2"
            >
              <Globe size={18} />
              <span>Read API Docs</span>
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-200/80 dark:border-zinc-900/80">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Why developers choose PayFlow</h2>
          <p className="text-slate-500 dark:text-zinc-400">An enterprise grade architecture built with cutting edge security protocols, database constraints, and custom UI modules.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="glass-card p-8 hover:scale-[1.02] cursor-default flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${feature.color} shadow-sm`}>
                  <feature.icon size={22} />
                </div>
                <h3 className="font-display text-xl font-bold text-slate-950 dark:text-white">{feature.title}</h3>
                <p className="text-slate-500 dark:text-zinc-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Showcase */}
      <section className="py-24 bg-indigo-600 dark:bg-indigo-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.25),rgba(255,255,255,0))]" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
          <div className="space-y-4 max-w-xl">
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">Scale your finance flows without breaking limits</h2>
            <p className="text-indigo-100/80 leading-relaxed text-lg">Acquire pessimistic data locking, eliminate race conditions and double spends, and secure client queries seamlessly.</p>
          </div>
          <div className="grid grid-cols-2 gap-8 w-full md:w-auto">
            <div className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10">
              <p className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight">100%</p>
              <p className="text-indigo-200/90 text-sm mt-2 font-medium">ACID Compliant</p>
            </div>
            <div className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10">
              <p className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight">&lt; 5ms</p>
              <p className="text-indigo-200/90 text-sm mt-2 font-medium">JWT Verification</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-zinc-900 py-12 px-6 bg-white dark:bg-zinc-950 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2 rounded-xl">
              <Wallet size={18} />
            </div>
            <span className="font-display font-semibold text-lg text-slate-800 dark:text-zinc-200">PayFlow</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-zinc-600">
            &copy; {new Date().getFullYear()} PayFlow Systems. All rights reserved. Made by Shivam Paliwal.
          </p>
        </div>
      </footer>

    </div>
  );
};
