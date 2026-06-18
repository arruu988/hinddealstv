import { useEffect, useState } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { Settings, LogOut } from 'lucide-react';

export function AdminLayout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists in localStorage
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/system-admin-portal');
        return;
      }
      try {
        const res = await fetch('/api/admin/settings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
          throw new Error('Not authenticated');
        }
        setLoading(false);
      } catch (err) {
        localStorage.removeItem('adminToken');
        navigate('/system-admin-portal');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem('adminToken');
      navigate('/system-admin-portal');
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <header className="sticky top-0 z-50 bg-[#050505] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/system-admin-portal/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Settings className="w-4 h-4 text-blue-400" />
              </div>
              <span className="font-bold tracking-tight">Admin Console</span>
            </Link>
            
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-gray-400 hover:text-white flex items-center gap-2 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
