import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, AlertCircle, Loader2, Tv } from 'lucide-react';
import { cn } from '../lib/utils';

export function Home() {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [checkingLock, setCheckingLock] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/site-status')
      .then(res => res.json())
      .then(data => {
        if (data.locked) {
          setIsLocked(true);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setCheckingLock(false));
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!key.trim()) {
      setError('Please enter your subscription key');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/verify-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key })
      });
      
      const rawText = await res.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        throw new Error('Server returned an unexpected format. Please try again later.');
      }
      
      if (!res.ok) {
        throw new Error(data.error || 'Invalid key. Please check or contact support.');
      }

      // Store key in localStorage for session
      localStorage.setItem('userKey', key);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingLock) {
    return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center"><Loader2 className="w-8 h-8 text-green-500 animate-spin" /></div>;
  }

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6">
           <Tv className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">Site Temporarily Paused</h1>
        <p className="text-gray-400">We are currently undergoing maintenance. Will be back soon. Stay tuned!</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#1A1A1A] rounded-2xl border border-white/10 p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-green-500 to-emerald-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-green-500/20">
             <KeyRound className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Hind Deals TV Access</h1>
          <p className="text-gray-400 text-center text-sm">Enter your premium subscription key to unlock live sports and premium content library.</p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Subscription Key</label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="e.g. A1B2C3D4E5F6G7H8"
              className={cn(
                "w-full bg-black/50 border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 transition-all font-mono",
                error ? "border-red-500/50 focus:ring-red-500/50" : "border-white/10 focus:ring-green-500/50 focus:border-green-500/50"
              )}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-400 hover:to-emerald-300 text-black font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Unlock Access'}
          </button>
        </form>
      </div>
    </div>
  );
}
