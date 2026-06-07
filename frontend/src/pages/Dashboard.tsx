import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowLeftRight, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Layers,
  ChevronRight,
  Loader
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface TransactionItem {
  id: number;
  type: string;
  amount: number;
  status: string;
  description: string;
  createdAt: string;
  walletId: string;
  relatedWalletId: string | null;
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const theme = useThemeStore((state) => state.theme);
  
  const [balance, setBalance] = useState<number | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const balanceRes = await api.get('/wallet/balance');
      setBalance(balanceRes.data.balance);

      const recentRes = await api.get('/api/v1/transactions/recent?limit=5');
      setRecentTransactions(recentRes.data.data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  // Prepare chart data based on recent transactions or placeholders if empty
  const getChartData = () => {
    if (recentTransactions.length === 0) {
      return [
        { name: 'Jan', amount: 0 },
        { name: 'Feb', amount: 120 },
        { name: 'Mar', amount: 280 },
        { name: 'Apr', amount: 200 },
        { name: 'May', amount: 450 },
        { name: 'Jun', amount: 300 },
        { name: 'Jul', amount: 600 }
      ];
    }
    
    // Map transactions chronologically
    return [...recentTransactions]
      .reverse()
      .map((tx) => ({
        name: new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount: tx.amount
      }));
  };

  if (loading) {
    return (
      <div className="h-[80vh] w-full flex items-center justify-center">
        <Loader className="animate-spin text-indigo-600 dark:text-indigo-400" size={36} />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      
      {/* Welcome message */}
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          Welcome back, {user?.name.split(' ')[0]}
        </h1>
        <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">Here is what is happening with your wallet today.</p>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 p-4 rounded-2xl text-rose-700 dark:text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Balance Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-indigo-600 dark:bg-indigo-950 text-white p-8 flex flex-col justify-between h-64 shadow-xl shadow-indigo-600/20"
        >
          {/* Decorative gradients */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)]" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full filter blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-indigo-200/90 font-medium text-sm">Available Balance</span>
              <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight">
                {balance !== null ? formatCurrency(balance) : '$0.00'}
              </h2>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-2.5 rounded-2xl">
              <Layers size={20} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="relative z-10 grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
            <button 
              onClick={() => navigate('/wallet?action=deposit')}
              className="py-2.5 bg-white text-indigo-700 hover:bg-slate-100 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Plus size={14} />
              <span>Deposit</span>
            </button>
            <button 
              onClick={() => navigate('/wallet?action=withdraw')}
              className="py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <ArrowDownLeft size={14} />
              <span>Withdraw</span>
            </button>
            <button 
              onClick={() => navigate('/transfer')}
              className="py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <ArrowLeftRight size={14} />
              <span>Transfer</span>
            </button>
          </div>
        </motion.div>

        {/* Small Analytics Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
          <div className="glass-card p-6 flex items-center gap-5">
            <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 p-3.5 rounded-2xl">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium">Income Streams</p>
              <p className="text-xl font-display font-bold mt-0.5 text-slate-900 dark:text-white">Active</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold flex items-center gap-0.5">
                <span>Direct Deposit Enabled</span>
              </p>
            </div>
          </div>

          <div className="glass-card p-6 flex items-center gap-5">
            <div className="bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 p-3.5 rounded-2xl">
              <TrendingDown size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium">Monthly Outflow</p>
              <p className="text-xl font-display font-bold mt-0.5 text-slate-900 dark:text-white">Optimized</p>
              <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 font-semibold">
                Pessimistic concurrency safe
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Main Charts & Table Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recharts Area Chart */}
        <div className="lg:col-span-2 glass-card p-6 sm:p-8 flex flex-col justify-between h-[360px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Transaction Analytics</h3>
              <p className="text-xs text-slate-400 dark:text-zinc-500">Visualization of transaction volumes over time</p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-full">Active Metrics</span>
          </div>

          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  stroke="#888888" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#888888" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: theme === 'dark' ? '#18181b' : '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    fontSize: '12px',
                    color: theme === 'dark' ? '#f4f4f5' : '#18181b'
                  }}
                  formatter={(value) => [`$${value}`, 'Amount']}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorAmount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="glass-card p-6 flex flex-col justify-between h-[360px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h3>
              <button 
                onClick={() => navigate('/history')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
              >
                <span>View all</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-zinc-900 overflow-y-auto max-h-[240px] pr-1">
              {recentTransactions.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <p className="text-sm text-slate-400 dark:text-zinc-500 font-medium">No transactions yet</p>
                  <p className="text-xs text-slate-400 dark:text-zinc-500">Perform deposits or transfers to see activity.</p>
                </div>
              ) : (
                recentTransactions.map((tx) => {
                  const isSent = tx.type === 'TRANSFER_SENT' || tx.type === 'WITHDRAW';
                  return (
                    <div key={tx.id} className="py-3.5 flex items-center justify-between gap-3 text-sm">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`p-2 rounded-xl shrink-0 ${
                          isSent 
                            ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400' 
                            : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                        }`}>
                          {isSent ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-medium truncate text-slate-800 dark:text-zinc-200">
                            {tx.description || tx.type.replaceAll('_', ' ')}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-zinc-500">
                            {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <span className={`font-semibold shrink-0 ${
                        isSent ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {isSent ? '-' : '+'}{formatCurrency(tx.amount)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
