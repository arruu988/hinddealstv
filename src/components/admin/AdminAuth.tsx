import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export function AdminAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      // Save token in localStorage
      localStorage.setItem('adminToken', data.token);
      navigate('/system-admin-portal/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#111111] rounded-2xl border border-white/5 p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
             <Lock className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Admin Portal</h1>
          <p className="text-gray-500 text-sm">Target system secured.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all mb-4"
            />
            <label className="block text-sm font-medium text-gray-400 mb-2">Admin Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(
                "w-full bg-black border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 transition-all",
                error ? "border-red-500/50 focus:ring-red-500/50" : "border-white/10 focus:ring-blue-500/50 focus:border-blue-500/50"
              )}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white hover:bg-gray-200 text-black font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
