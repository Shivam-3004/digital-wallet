import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { 
  ArrowDownLeft, 
  Plus, 
  Info, 
  CheckCircle2, 
  AlertCircle,
  Loader,
  ArrowRight
} from 'lucide-react';

export const Wallet: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialAction = searchParams.get('action') || 'deposit';

  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>(initialAction === 'withdraw' ? 'withdraw' : 'deposit');
  const [balance, setBalance] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  // Sync tab with query parameters
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'withdraw') {
      setActiveTab('withdraw');
    } else if (action === 'deposit') {
      setActiveTab('deposit');
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'deposit' | 'withdraw') => {
    setActiveTab(tab);
    setSearchParams({ action: tab });
    setAmount('');
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid amount greater than zero.');
      setLoading(false);
      return;
    }

    if (activeTab === 'withdraw' && balance !== null && numericAmount > balance) {
      setError('Insufficient balance to perform this withdrawal.');
      setLoading(false);
      return;
    }

    try {
      if (activeTab === 'deposit') {
        const res = await api.post('/wallet/deposit', { amount: numericAmount });
        setSuccess(`Successfully deposited ${formatCurrency(numericAmount)}.`);
        setBalance(res.data.newBalance);
      } else {
        const res = await api.post('/wallet/withdraw', { amount: numericAmount });
        setSuccess(`Successfully withdrew ${formatCurrency(numericAmount)}.`);
        setBalance(res.data.balance);
      }
      setAmount('');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Transaction failed. Please try again.');
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
    <div className="space-y-10 max-w-4xl mx-auto">
      
      {/* Page Header */}
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Wallet Manager</h1>
        <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">Add funds, withdraw money, or check your account status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        
        {/* Wallet Balance Info Panel */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card p-6 flex flex-col justify-between h-48 bg-slate-900 text-slate-900 dark:text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full filter blur-xl pointer-events-none" />
            <div className="space-y-1">
              <span className="text-slate-400 dark:text-zinc-400 font-medium text-xs uppercase tracking-wider">Account Balance</span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
                {balance !== null ? formatCurrency(balance) : '$0.00'}
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl w-fit">
              <CheckCircle2 size={14} />
              <span>Wallet Status: Active</span>
            </div>
          </div>

          <div className="glass p-5 rounded-2xl flex gap-3 text-xs leading-normal text-slate-500 dark:text-zinc-400">
            <Info className="shrink-0 text-indigo-500" size={16} />
            <span>
              All digital wallet balances are secured with row-level locks on write transactions to prevent concurrency race conditions.
            </span>
          </div>
        </div>

        {/* Deposit/Withdraw Card */}
        <div className="md:col-span-3 glass-card p-6 sm:p-8">
          
          {/* Tabs */}
          <div className="flex bg-slate-100 dark:bg-zinc-900/60 p-1 rounded-2xl mb-8">
            <button
              onClick={() => handleTabChange('deposit')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'deposit'
                  ? 'bg-white dark:bg-zinc-800 text-slate-950 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
              }`}
            >
              <Plus size={14} />
              <span>Add Cash</span>
            </button>
            <button
              onClick={() => handleTabChange('withdraw')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'withdraw'
                  ? 'bg-white dark:bg-zinc-800 text-slate-950 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
              }`}
            >
              <ArrowDownLeft size={14} />
              <span>Withdraw Cash</span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {error && (
                  <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 p-4 rounded-2xl flex gap-3 text-rose-700 dark:text-rose-400 text-sm">
                    <AlertCircle className="shrink-0" size={18} />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-4 rounded-2xl flex gap-3 text-emerald-700 dark:text-emerald-400 text-sm">
                    <CheckCircle2 className="shrink-0" size={18} />
                    <span>{success}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-zinc-300">
                    Amount (USD)
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
                      <span>{activeTab === 'deposit' ? 'Confirm Deposit' : 'Confirm Withdrawal'}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </AnimatePresence>

        </div>

      </div>

    </div>
  );
};
