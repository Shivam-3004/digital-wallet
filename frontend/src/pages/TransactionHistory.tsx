import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Loader
} from 'lucide-react';

interface TransactionItem {
  id: number;
  type: string;
  status: string;
  amount: number;
  description: string;
  createdAt: string;
  walletId: string;
  relatedWalletId: string | null;
}

export const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const size = 10;

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = '/api/v1/transactions/filter';
      const params: any = {
        page,
        size
      };

      if (type) params.type = type;
      if (status) params.status = status;
      if (minAmount) params.minAmount = parseFloat(minAmount);
      if (maxAmount) params.maxAmount = parseFloat(maxAmount);
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      // If search query is present, we can either search or filter.
      // Search uses /api/v1/transactions/search?query=...
      if (searchQuery.trim()) {
        url = '/api/v1/transactions/search';
        params.query = searchQuery.trim();
      }

      const res = await api.get(url, { params });
      
      setTransactions(res.data.data.content);
      setTotalPages(res.data.data.totalPages);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load transaction history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, type, status, searchQuery]);

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchTransactions();
  };

  const handleClearFilters = () => {
    setType('');
    setStatus('');
    setMinAmount('');
    setMaxAmount('');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
    setPage(0);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="space-y-10">
      
      {/* Page Header */}
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Transaction History</h1>
        <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">Search, filter, and review all transactions on your account.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Left Side: Filter Form Panel */}
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center gap-2 font-display font-bold text-base border-b border-slate-100 dark:border-zinc-900 pb-3">
            <Filter size={18} />
            <span>Filters</span>
          </div>

          <form onSubmit={handleApplyFilters} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">Type</label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400 focus:border-transparent text-xs"
              >
                <option value="">All Types</option>
                <option value="DEPOSIT">Deposit</option>
                <option value="WITHDRAW">Withdrawal</option>
                <option value="TRANSFER_SENT">Sent Transfer</option>
                <option value="TRANSFER_RECEIVED">Received Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">Status</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400 focus:border-transparent text-xs"
              >
                <option value="">All Statuses</option>
                <option value="SUCCESS">Success</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">Min ($)</label>
                <input 
                  type="number" 
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  placeholder="Min"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 focus:outline-none text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">Max ($)</label>
                <input 
                  type="number" 
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  placeholder="Max"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 focus:outline-none text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">From Date</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 focus:outline-none text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">To Date</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 focus:outline-none text-xs"
              />
            </div>

            <div className="pt-2 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleClearFilters}
                className="py-2.5 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 font-semibold rounded-xl text-xs"
              >
                Clear All
              </button>
              <button
                type="submit"
                className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-indigo-600/10"
              >
                Apply
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Search Box + Table Panel */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Search Box */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 dark:text-zinc-500">
              <Search size={18} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-sm shadow-sm"
              placeholder="Search descriptions (e.g. rent, refund)..."
            />
          </div>

          {/* Table Container */}
          <div className="glass-card overflow-hidden shadow-md">
            
            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 text-xs">
                {error}
              </div>
            )}

            {loading ? (
              <div className="py-24 flex items-center justify-center">
                <Loader className="animate-spin text-indigo-600 dark:text-indigo-400" size={30} />
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-24 text-center space-y-2">
                <p className="text-sm text-slate-400 dark:text-zinc-500 font-medium">No transactions found</p>
                <p className="text-xs text-slate-400 dark:text-zinc-500">Try adjusting your filters or search query.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-zinc-900 text-slate-400 dark:text-zinc-500 font-medium text-xs uppercase bg-slate-50/50 dark:bg-zinc-900/35">
                      <th className="px-6 py-4">Transaction</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-900 font-medium">
                    {transactions.map((tx) => {
                      const isSent = tx.type === 'TRANSFER_SENT' || tx.type === 'WITHDRAW';
                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/10 transition-colors">
                          <td className="px-6 py-4.5 flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${
                              isSent 
                                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400' 
                                : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                            }`}>
                              {isSent ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 dark:text-zinc-200">
                                {tx.description || tx.type.replaceAll('_', ' ')}
                              </p>
                              <p className="text-xs text-slate-400 dark:text-zinc-500 font-mono">ID: #{tx.id}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4.5 text-slate-500 dark:text-zinc-400 text-xs font-normal">
                            {new Date(tx.createdAt).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="px-6 py-4.5">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                              tx.status === 'SUCCESS'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/35 dark:text-emerald-400'
                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/35 dark:text-rose-400'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className={`px-6 py-4.5 text-right font-display font-bold ${
                            isSent ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {isSent ? '-' : '+'}{formatCurrency(tx.amount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-100 dark:border-zinc-900 flex items-center justify-between">
                <span className="text-xs text-slate-400 dark:text-zinc-500">
                  Page {page + 1} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                    className="p-2 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-xl transition-all disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(page + 1)}
                    className="p-2 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-xl transition-all disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
