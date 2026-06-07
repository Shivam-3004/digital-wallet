import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { 
  User as UserIcon, 
  Lock, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle,
  Loader
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { clearAuth, updateUser } = useAuthStore();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status states
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/api/v1/users/profile');
      const data = res.data.data;
      setName(data.name || '');
      setPhone(data.phone || '');
      setAddress(data.address || '');
      setCity(data.city || '');
      setState(data.state || '');
      setZipCode(data.zipCode || '');
      setCountry(data.country || '');
    } catch (err) {
      console.error(err);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await api.put('/api/v1/users/profile', {
        firstName: name,
        phone,
        address,
        city,
        state,
        zipCode,
        country
      });

      updateUser({ name: res.data.data.name });
      setSuccess('Profile updated successfully.');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      await api.post('/api/v1/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword
      });

      setSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to change password. Make sure current password is correct.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm('Are you sure you want to deactivate your wallet account? You will be signed out.')) {
      return;
    }

    try {
      await api.post('/api/v1/users/deactivate');
      clearAuth();
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Failed to deactivate account.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('CRITICAL WARNING: Are you sure you want to PERMANENTLY DELETE your wallet account? This action is irreversible and all remaining balances will be lost.')) {
      return;
    }

    try {
      await api.post('/api/v1/users/delete');
      clearAuth();
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Failed to delete account.');
    }
  };

  if (profileLoading) {
    return (
      <div className="h-[80vh] w-full flex items-center justify-center">
        <Loader className="animate-spin text-indigo-600 dark:text-indigo-400" size={36} />
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Profile Settings</h1>
        <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">Update your personal information, credentials, and account settings.</p>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Profile Info Form */}
        <div className="md:col-span-2 glass-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5 font-display font-bold text-base border-b border-slate-100 dark:border-zinc-900 pb-3">
            <UserIcon size={18} />
            <span>Personal Details</span>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4 text-sm">
            <div>
              <label className="block text-slate-500 dark:text-zinc-400 font-medium mb-1">Full Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-zinc-400 font-medium mb-1">Phone Number</label>
              <input 
                type="text" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-zinc-400 font-medium mb-1">Address</label>
              <input 
                type="text" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 dark:text-zinc-400 font-medium mb-1">City</label>
                <input 
                  type="text" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-zinc-400 font-medium mb-1">State</label>
                <input 
                  type="text" 
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 dark:text-zinc-400 font-medium mb-1">Zip Code</label>
                <input 
                  type="text" 
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-zinc-400 font-medium mb-1">Country</label>
                <input 
                  type="text" 
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/55 text-white font-semibold rounded-2xl shadow-md transition-all text-sm"
            >
              {loading ? 'Saving...' : 'Update Details'}
            </button>
          </form>
        </div>

        {/* Change Password & Actions Panel */}
        <div className="space-y-8">
          
          {/* Change Password Form */}
          <div className="glass-card p-6 space-y-6">
            <div className="flex items-center gap-2.5 font-display font-bold text-base border-b border-slate-100 dark:border-zinc-900 pb-3">
              <Lock size={18} />
              <span>Change Password</span>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-500 dark:text-zinc-400 font-medium mb-1">Current Password</label>
                <input 
                  type="password" 
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-zinc-400 font-medium mb-1">New Password</label>
                <input 
                  type="password" 
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-zinc-400 font-medium mb-1">Confirm New Password</label>
                <input 
                  type="password" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-slate-900 dark:bg-zinc-800 text-white font-semibold rounded-2xl shadow-md transition-all text-sm"
              >
                Change Password
              </button>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="glass-card p-6 space-y-6 border border-rose-100/50 dark:border-rose-950/20">
            <div className="flex items-center gap-2.5 font-display font-bold text-base text-rose-600 dark:text-rose-400 border-b border-rose-50 dark:border-rose-950/20 pb-3">
              <AlertTriangle size={18} />
              <span>Danger Zone</span>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleDeactivate}
                className="w-full py-3 border border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-400 font-semibold rounded-2xl text-xs hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all"
              >
                Deactivate Wallet Account
              </button>

              <button
                onClick={handleDelete}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md shadow-rose-600/10"
              >
                <Trash2 size={14} />
                <span>Delete Account Permanently</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
