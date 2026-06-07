import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  Send,
  Loader
} from 'lucide-react';

export const Transfer: React.FC = () => {
  const currentUser = useAuthStore((state) => state.user);
  
  const [balance, setBalance] = useState<number | null>(null);
  const [receiverEmail, setReceiverEmail] = useState('');
  const [amount, setAmount] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchBalance = async () => {
    try {
      const res = await api.get('/wallet/balance');
      setBalance(res.data.balance);
    } catch (err) {
      console.error(err);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid transfer amount greater than zero.');
      setLoading(false);
      return;
    }

    if (balance !== null && numericAmount > balance) {
      setError('Insufficient funds in your wallet.');
      setLoading(false);
      return;
    }

    if (receiverEmail.toLowerCase() === currentUser?.email.toLowerCase()) {
      setError('Cannot transfer funds to yourself.');
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/wallet/transfer', {
        receiverEmail: receiverEmail.trim(),
        amount: numericAmount,
      });
      
      setBalance(res.data.balance);
      setSuccess(true);
      setAmount('');
      setReceiverEmail('');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Transfer failed. Check the recipient email and try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  if (fetchLoading) {
    return (
      <div className="h-[80vh] w-full flex items-center justify-center">
        <Loader className="animate-spin text-indigo-600 dark:text-indigo-400" size={36} />
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-2xl mx-auto">
      
      {/* Page Header */}
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Send Money</h1>
        <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">Transfer funds instantly to any registered user email address.</p>
      </div>

      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card p-8 text-center space-y-6"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-sm"
            >
              <CheckCircle2 size={42} />
            </motion.div>
            
            <div className="space-y-2">
              <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white">Transfer Complete!</h3>
              <p className="text-slate-500 dark:text-zinc-400 text-sm max-w-md mx-auto">
                Your payment has been sent and locked. The recipient's balance has been updated instantly.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-900/40 p-4 rounded-2xl flex items-center justify-between text-sm max-w-sm mx-auto">
              <span className="text-slate-400 dark:text-zinc-500 font-medium">New Wallet Balance</span>
              <span className="font-display font-bold text-slate-800 dark:text-zinc-200">
                {balance !== null ? formatCurrency(balance) : '$0.00'}
              </span>
            </div>

            <button
              onClick={() => setSuccess(false)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-semibold shadow-md transition-all text-sm"
            >
              Send Another Transfer
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-6 sm:p-8 space-y-8"
          >
            {/* Balance banner */}
            <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-950/50 rounded-2xl text-sm">
              <span className="text-indigo-600 dark:text-indigo-400 font-medium">Available Balance</span>
              <span className="font-display font-bold text-indigo-700 dark:text-indigo-300">
                {balance !== null ? formatCurrency(balance) : '$0.00'}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 p-4 rounded-2xl flex gap-3 text-rose-700 dark:text-rose-400 text-sm">
                  <AlertCircle className="shrink-0" size={18} />
                  <span>{error}</span>
                </div>
              )}

              {/* Recipient Input */}
              <div>
                <label htmlFor="receiverEmail" className="block text-sm font-medium text-slate-700 dark:text-zinc-300">
                  Recipient Email Address
                </label>
                <div className="mt-2 relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 dark:text-zinc-500">
                    <Search size={18} />
                  </div>
                  <input
                    id="receiverEmail"
                    type="email"
                    required
                    value={receiverEmail}
                    onChange={(e) => setReceiverEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-sm"
                    placeholder="friend@example.com"
                  />
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-zinc-300">
                  Transfer Amount
                </label>
                <div className="mt-2 relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 dark:text-zinc-500 font-display font-semibold text-lg">
                    $
                  </div>
                  <input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 font-display font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400 focus:border-transparent transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white rounded-2xl font-semibold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 hover:-translate-y-0.5 disabled:-translate-y-0 transition-all flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Transfer</span>
                    <Send size={16} />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
