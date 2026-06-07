import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { Wallet, CheckCircle2, XCircle, AlertCircle, ArrowRight, Loader } from 'lucide-react';

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token');
  const navigate = useNavigate();

  const [token, setToken] = useState(tokenFromUrl || '');
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performVerification = async (verifyToken: string) => {
    setVerifying(true);
    setError(null);
    try {
      await api.post('/api/v1/auth/verify-email', { token: verifyToken });
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Verification failed. The token may be expired or invalid.');
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    if (tokenFromUrl) {
      performVerification(tokenFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenFromUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      performVerification(token.trim());
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
          Verify your email address
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass border border-slate-200/60 dark:border-zinc-900/60 py-8 px-6 sm:px-10 rounded-3xl shadow-xl text-center"
        >
          {verifying ? (
            <div className="py-8 space-y-4">
              <Loader className="animate-spin text-indigo-600 dark:text-indigo-400 mx-auto" size={36} />
              <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">Verifying your email token...</p>
            </div>
          ) : success ? (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 size={36} />
              </div>
              <div className="space-y-2">
                <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white">Email Verified!</h3>
                <p className="text-sm text-slate-500 dark:text-zinc-400">
                  Thank you. Your email address has been verified successfully. Your wallet account is now active.
                </p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-semibold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <span>Go to Login</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ) : error ? (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <XCircle size={36} />
              </div>
              <div className="space-y-2">
                <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white">Verification Failed</h3>
                <p className="text-sm text-slate-500 dark:text-zinc-400 leading-normal">
                  {error}
                </p>
              </div>
              <div className="border-t border-slate-200 dark:border-zinc-800 pt-6">
                <p className="text-xs text-slate-400 dark:text-zinc-500 mb-4">You can manually paste your token below and try again:</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 font-mono text-center focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-sm"
                    placeholder="Paste verification token here"
                  />
                  <button
                    type="submit"
                    className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-2xl font-semibold hover:opacity-90 transition-all text-sm shadow-md"
                  >
                    Submit Verification
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle size={24} />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Enter your email verification token below to activate your wallet.
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 font-mono text-center focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-sm"
                  placeholder="Paste verification token here"
                />
                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-semibold shadow-md transition-all text-sm"
                >
                  Verify Email
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>

    </div>
  );
};
