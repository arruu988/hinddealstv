import { useEffect, useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { Home, PlaySquare, User, LogOut, Tv } from 'lucide-react';
import { cn } from '../lib/utils';

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const key = localStorage.getItem('userKey');
    if (!key) {
      navigate('/');
    }

    const checkStatus = async () => {
      try {
        const [siteRes, userRes] = await Promise.all([
          fetch('/api/site-status'),
          fetch('/api/user-status', { headers: { 'Authorization': `Bearer ${key}` } })
        ]);
        
        const siteData = await siteRes.json();
        if (siteData.locked) {
          setIsLocked(true);
        }

        if (userRes.status === 401) {
             localStorage.removeItem('userKey');
             navigate('/');
        }
      } catch (err) {
        console.error(err);
      }
    };
    checkStatus();
  }, [navigate]);

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

  const handleLogout = () => {
    localStorage.removeItem('userKey');
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Library', path: '/library', icon: PlaySquare },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      <header className="sticky top-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-tr from-green-500 to-emerald-400 rounded-lg flex items-center justify-center">
                <Tv className="w-5 h-5 text-black" />
              </div>
              <span className="font-bold text-lg tracking-tight">Hind Deals TV</span>
            </Link>
            
            <nav className="hidden sm:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                      isActive 
                        ? "bg-white/10 text-white" 
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Mobile Nav */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-[#1A1A1A] border-t border-white/10 p-2 z-50">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex flex-col items-center p-2 rounded-lg transition-colors",
                  isActive ? "text-green-400" : "text-gray-500 hover:text-gray-300"
                )}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center p-2 rounded-lg text-gray-500 hover:text-gray-300 transition-colors"
          >
            <LogOut className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
