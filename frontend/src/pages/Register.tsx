import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { Wallet, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ email: string; debugToken?: string } | null>(null);
  
  const navigate = useNavigate();

  // Password Validation
  const validatePassword = (pass: string) => {
    const minLength = pass.length >= 8;
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasDigit = /\d/.test(pass);
    const hasSpecial = /[@$!%*?&]/.test(pass);
    return minLength && hasUpper && hasLower && hasDigit && hasSpecial;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!validatePassword(password)) {
      setError(
        'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.'
      );
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/v1/auth/register', { name, email, password });
      const { email: registeredEmail, debugToken } = response.data.data;
      setSuccessData({ email: registeredEmail, debugToken });
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed. Email might already be registered.');
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-200">
        <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass border border-slate-200/60 dark:border-zinc-900/60 py-8 px-6 sm:px-10 rounded-3xl shadow-xl text-center space-y-6"
          >
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 size={36} />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white">Registration Successful!</h3>
              <p className="text-slate-500 dark:text-zinc-400 text-sm leading-relaxed">
                We've sent a verification email to <span className="font-semibold text-slate-700 dark:text-zinc-200">{successData.email}</span>. Please verify your email to activate your account.
              </p>
            </div>

            {successData.debugToken && (
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl text-left space-y-3">
                <span className="font-display font-semibold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">Developer Mode Details</span>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-normal">
                  Local environment detected. You can instantly verify your account using the token below:
                </p>
                <code className="block bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-2 rounded-xl text-xs font-mono select-all truncate text-slate-700 dark:text-zinc-300">
                  {successData.debugToken}
                </code>
                <Link 
                  to={`/verify-email?token=${successData.debugToken}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <span>Verify Email Instantly</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-2xl font-semibold hover:opacity-90 transition-all text-sm shadow-md"
              >
                Go to Log In
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-200">
      
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 dark:bg-indigo-950/10 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 dark:bg-purple-950/10 rounded-full filter blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex items-center justify-center gap-3 mb-6">
          <div className="bg-indigo-600 text-white p-2 rounded-2xl shadow-lg shadow-indigo-600/20">
            <Wallet size={24} />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-400 dark:to-indigo-500 bg-clip-text text-transparent">PayFlow</span>
        </Link>
        <h2 className="text-center text-3xl font-display font-bold tracking-tight text-slate-900 dark:text-white">
          Create your digital wallet
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 dark:text-zinc-400">
          Already have a wallet?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass border border-slate-200/60 dark:border-zinc-900/60 py-8 px-6 sm:px-10 rounded-3xl shadow-xl"
        >
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 p-4 rounded-2xl flex gap-3 text-rose-700 dark:text-rose-400 text-sm">
                <AlertCircle className="shrink-0" size={18} />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-zinc-300">
                Full Name
              </label>
              <div className="mt-1.5">
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-sm"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-zinc-300">
                Email address
              </label>
              <div className="mt-1.5">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-sm"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-zinc-300">
                Password
              </label>
              <div className="mt-1.5">
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-sm"
                  placeholder="••••••••"
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-400 dark:text-zinc-500 leading-normal">
                Must contain 8+ characters, uppercase, lowercase, number, and special character (@$!%*?&).
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-zinc-300">
                Confirm Password
              </label>
              <div className="mt-1.5">
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white rounded-2xl font-semibold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 hover:-translate-y-0.5 disabled:-translate-y-0 transition-all flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Wallet</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

    </div>
  );
};
