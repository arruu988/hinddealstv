import { useEffect, useState } from 'react';
import { User as UserIcon, Calendar, KeyRound, Clock, ShieldCheck } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { User } from '../types';

export function Profile() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const key = localStorage.getItem('userKey');
      if (!key) return;

      try {
        const res = await fetch('/api/user-status', { headers: { 'Authorization': `Bearer ${key}` } });
        const data = await res.json();
        if (data.success) {
          setUser(data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, []);

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Your Profile</h1>
        <p className="text-gray-400">Manage your subscription and account details.</p>
      </div>

      <div className="bg-[#1A1A1A] rounded-3xl border border-white/10 p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <ShieldCheck className="w-48 h-48 text-white" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-6 mb-10">
            <div className="w-20 h-20 bg-gradient-to-tr from-gray-800 to-gray-700 rounded-2xl flex items-center justify-center shadow-lg border border-white/5">
               <UserIcon className="w-10 h-10 text-gray-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Access User</h2>
              <p className="text-gray-400 mt-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                Active Subscription
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-black/40 p-5 rounded-2xl border border-white/5 flex items-start gap-4">
              <KeyRound className="w-6 h-6 text-emerald-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Access Key</p>
                <p className="text-white font-mono text-lg">{user.key.slice(0, 4)}••••••••{user.key.slice(-4)}</p>
              </div>
            </div>

            <div className="bg-black/40 p-5 rounded-2xl border border-white/5 flex items-start gap-4">
              <ShieldCheck className="w-6 h-6 text-blue-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Current Plan</p>
                <p className="text-white font-semibold text-lg">{user.plan}</p>
              </div>
            </div>

            <div className="bg-black/40 p-5 rounded-2xl border border-white/5 flex items-start gap-4">
              <Calendar className="w-6 h-6 text-purple-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Expires On</p>
                <p className="text-white font-semibold text-lg">{format(new Date(user.expiry_date), 'dd MMM yyyy')}</p>
              </div>
            </div>

            <div className="bg-black/40 p-5 rounded-2xl border border-white/5 flex items-start gap-4">
              <Clock className="w-6 h-6 text-rose-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Time Left</p>
                <p className="text-white font-semibold text-lg">{formatDistanceToNow(new Date(user.expiry_date))}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
