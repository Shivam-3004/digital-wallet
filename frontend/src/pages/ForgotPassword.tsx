import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { Wallet, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [debugToken, setDebugToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setDebugToken(null);

    try {
      const response = await api.post('/api/v1/auth/forgot-password', { email });
      setSuccess('We have sent a password reset token to your email address.');
      
      // Check if debug token is returned in response data
      if (response.data?.data) {
        setDebugToken(response.data.data);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Email not found or error requesting password reset.');
    } finally {
      setLoading(false);
    }
  };

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
          Forgot your password?
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 dark:text-zinc-400">
          Enter your email and we'll help you reset it.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass border border-slate-200/60 dark:border-zinc-900/60 py-8 px-6 sm:px-10 rounded-3xl shadow-xl"
        >
          {success ? (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 size={36} />
              </div>
              <div className="space-y-2">
                <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white">Reset Token Sent</h3>
                <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
                  {success}
                </p>
              </div>

              {debugToken && (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl text-left space-y-3">
                  <span className="font-display font-semibold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">Developer Mode Details</span>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-normal">
                    Local environment detected. You can instantly reset your password using the token below:
                  </p>
                  <code className="block bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-2 rounded-xl text-xs font-mono select-all truncate text-slate-700 dark:text-zinc-300">
                    {debugToken}
                  </code>
                  <Link 
                    to={`/reset-password?token=${debugToken}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <span>Reset Password Instantly</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              )}

              <div className="pt-2">
                <Link
                  to="/login"
                  className="w-full py-3.5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl font-semibold hover:opacity-90 transition-all text-sm block"
                >
                  Return to Log In
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 p-4 rounded-2xl flex gap-3 text-rose-700 dark:text-rose-400 text-sm">
                  <AlertCircle className="shrink-0" size={18} />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-zinc-300">
                  Email address
                </label>
                <div className="mt-1.5">
                  <input
                    id="email"
                    name="email"
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
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white rounded-2xl font-semibold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 hover:-translate-y-0.5 disabled:-translate-y-0 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <Link to="/login" className="text-sm font-semibold text-slate-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  Back to sign in
                </Link>
              </div>
            </form>
          )}
        </motion.div>
      </div>

    </div>
  );
};
