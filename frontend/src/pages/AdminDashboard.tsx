import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Users, 
  CreditCard, 
  ArrowLeftRight, 
  Ban, 
  CheckCircle,
  Loader
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  isBlocked: boolean;
}

interface StatsData {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  totalWallets: number;
  totalBalance: number;
  totalTransactions: number;
  totalTransactionAmount: number;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination for users list
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const size = 5;

  const fetchStats = async () => {
    try {
      const statsRes = await api.get('/api/v1/admin/dashboard/stats');
      setStats(statsRes.data.data);
    } catch (err) {
      console.error('Failed to fetch admin stats', err);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const usersRes = await api.get(`/api/v1/admin/users?page=${page}&size=${size}`);
      setUsers(usersRes.data.data.content);
      setTotalPages(usersRes.data.data.totalPages);
    } catch (err) {
      console.error('Failed to fetch users list', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchStats(), fetchUsers()]);
    } catch (err: any) {
      setError('Failed to load admin panel data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleBlockUser = async (userId: number, block: boolean) => {
    const action = block ? 'block' : 'unblock';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }

    try {
      await api.post(`/api/v1/admin/users/${userId}/${action}`);
      alert(`User ${action}ed successfully.`);
      fetchUsers();
      fetchStats();
    } catch (err) {
      console.error(err);
      alert(`Failed to ${action} user.`);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const getChartData = () => {
    if (!stats) return [];
    return [
      { name: 'Users', Total: stats.totalUsers, Active: stats.activeUsers, Blocked: stats.blockedUsers },
    ];
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
      
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">Platform metrics overview, user management, and ledger logs.</p>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 p-4 rounded-2xl text-rose-700 dark:text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Users */}
        <div className="glass-card p-6 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs text-slate-400 dark:text-zinc-500 font-semibold uppercase tracking-wider">Total Users</span>
            <p className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats?.totalUsers || 0}
            </p>
            <p className="text-xs text-slate-400 dark:text-zinc-500">
              {stats?.activeUsers || 0} Active / {stats?.blockedUsers || 0} Blocked
            </p>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 p-3.5 rounded-2xl">
            <Users size={22} />
          </div>
        </div>

        {/* Total Wallets */}
        <div className="glass-card p-6 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs text-slate-400 dark:text-zinc-500 font-semibold uppercase tracking-wider">Total Wallets</span>
            <p className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats?.totalWallets || 0}
            </p>
            <p className="text-xs text-slate-400 dark:text-zinc-500">
              Automatic creation active
            </p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 p-3.5 rounded-2xl">
            <CreditCard size={22} />
          </div>
        </div>

        {/* Total Balance */}
        <div className="glass-card p-6 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs text-slate-400 dark:text-zinc-500 font-semibold uppercase tracking-wider">Deposited Pool</span>
            <p className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {formatCurrency(stats?.totalBalance || 0)}
            </p>
            <p className="text-xs text-slate-400 dark:text-zinc-500">
              Cumulative wallet balance
            </p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 p-3.5 rounded-2xl">
            <CreditCard size={22} />
          </div>
        </div>

        {/* Total Transaction Amount */}
        <div className="glass-card p-6 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs text-slate-400 dark:text-zinc-500 font-semibold uppercase tracking-wider">Total Volume</span>
            <p className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {formatCurrency(stats?.totalTransactionAmount || 0)}
            </p>
            <p className="text-xs text-slate-400 dark:text-zinc-500">
              Across {stats?.totalTransactions || 0} transactions
            </p>
          </div>
          <div className="bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 p-3.5 rounded-2xl">
            <ArrowLeftRight size={22} />
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* User Management Panel */}
        <div className="lg:col-span-2 glass-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-900 pb-4">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">User Accounts</h3>
              <p className="text-xs text-slate-400 dark:text-zinc-500">Block or activate users</p>
            </div>
            {usersLoading && <Loader className="animate-spin text-indigo-600 dark:text-indigo-400" size={18} />}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-900 text-slate-400 dark:text-zinc-500 font-medium text-xs bg-slate-50/50 dark:bg-zinc-900/35">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-900 font-medium">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/10">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-800 dark:text-zinc-200">{u.name}</p>
                      <p className="text-xs text-slate-400 dark:text-zinc-500">{u.email}</p>
                    </td>
                    <td className="px-4 py-4 text-xs font-mono text-slate-500 dark:text-zinc-400">{u.role}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                        u.isBlocked 
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/35 dark:text-rose-400' 
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/35 dark:text-emerald-400'
                      }`}>
                        {u.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      {u.isBlocked ? (
                        <button
                          onClick={() => handleBlockUser(u.id, false)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 text-xs font-semibold rounded-xl inline-flex items-center gap-1"
                        >
                          <CheckCircle size={12} />
                          <span>Unblock</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBlockUser(u.id, true)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 text-xs font-semibold rounded-xl inline-flex items-center gap-1"
                        >
                          <Ban size={12} />
                          <span>Block</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-zinc-900 pt-4">
              <span className="text-xs text-slate-400 dark:text-zinc-500">
                Page {page + 1} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-xl text-xs font-semibold disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-xl text-xs font-semibold disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User distribution metrics */}
        {stats && (
          <div className="glass-card p-6 flex flex-col justify-between h-[360px]">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Active vs Blocked</h3>
              <p className="text-xs text-slate-400 dark:text-zinc-500 mb-6">User accounts breakdown</p>
            </div>

            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" fontSize={11} stroke="#888888" tickLine={false} axisLine={false} />
                  <YAxis fontSize={11} stroke="#888888" tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#18181b', 
                      border: 'none', 
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: '#f4f4f5'
                    }} 
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="Active" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Blocked" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
