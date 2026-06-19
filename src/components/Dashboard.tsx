import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Calendar, Trophy, Clock, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Content, User } from '../types';

export function Dashboard() {
  const [content, setContent] = useState<Content[]>([]);
  const [userStatus, setUserStatus] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'Video' | 'Audio' | 'Image'>('Video');

  useEffect(() => {
    const fetchData = async () => {
      const key = localStorage.getItem('userKey');
      if (!key) return;

      try {
        const [contentRes, userRes] = await Promise.all([
          fetch('/api/content', { headers: { 'Authorization': `Bearer ${key}` } }),
          fetch('/api/user-status', { headers: { 'Authorization': `Bearer ${key}` } })
        ]);
        
        const contentData = await contentRes.json();
        const userData = await userRes.json();

        if (contentData.success) {
          setContent(contentData.data);
        }
        if (userData.success) {
          setUserStatus(userData.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const displayedContent = content.filter(item => {
    if (activeCategory === 'Video') return !['Audio', 'Image', 'Photos'].includes(item.media_type);
    if (activeCategory === 'Audio') return item.media_type === 'Audio';
    if (activeCategory === 'Image') return ['Image', 'Photos'].includes(item.media_type);
    return true;
  });

  if (loading) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero / Live Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-20">
          <Trophy className="w-32 h-32 text-white" />
        </div>
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-white text-xs font-semibold mb-6 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            LIVE NOW
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">Hind Deals TV Live Match Party</h2>
          <p className="text-rose-100 text-lg mb-8">Join the live stream and watch the biggest matches with premium quality directly from our servers.</p>
          <Link
            to="/live"
            className="inline-flex items-center gap-2 bg-white text-rose-600 font-bold px-6 py-3 rounded-xl hover:bg-rose-50 transition-colors shadow-lg"
          >
            <Play className="w-5 h-5 fill-current" />
            Enter Live Stream
          </Link>
        </div>
      </div>

      {/* Plan Info */}
      {userStatus && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/5 flex items-start gap-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Your Pass</p>
              <h3 className="text-xl font-bold text-white tracking-tight">{userStatus.plan}</h3>
              <p className="text-sm text-gray-500 mt-1">
                Valid until {new Date(userStatus.expiry_date).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/5 flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Time Remaining</p>
              <h3 className="text-xl font-bold text-white tracking-tight">
                {formatDistanceToNow(new Date(userStatus.expiry_date))}
              </h3>
              <p className="text-sm text-gray-500 mt-1">Active and verified</p>
            </div>
          </div>
        </div>
      )}

      {/* Premium Library Preview */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">Premium Library</h2>
          <div className="flex bg-black p-1 rounded-lg border border-white/10">
            {['Video', 'Audio', 'Image'].map((cat) => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat as 'Video' | 'Audio' | 'Image')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeCategory === cat ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                {cat}s
              </button>
            ))}
          </div>
        </div>
        
        {displayedContent.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {displayedContent.map((item) => (
              <Link key={item.id} to={`/watch/${item.id}`} className="group">
                <div className="bg-[#1A1A1A] rounded-xl overflow-hidden border border-white/5 transition-all hover:border-white/20 hover:shadow-2xl flex flex-col h-full">
                  <div className="aspect-video relative overflow-hidden bg-black/50">
                    <img
                      src={item.thumbnail_url}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2 sm:p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.media_type !== 'Image' && item.media_type !== 'File' && item.media_type !== 'Document' && (
                        <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white fill-current transform translate-y-2 group-hover:translate-y-0 transition-all duration-300" />
                      )}
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 flex-1 flex flex-col justify-center">
                    <h3 className="font-semibold text-sm sm:text-base text-white line-clamp-2 group-hover:text-green-400 transition-colors leading-tight">{item.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 truncate">{document.body.clientWidth < 640 ? item.category.substring(0, 10) : item.category}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center p-12 bg-[#1A1A1A] rounded-2xl border border-white/5">
                 <Play className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No content available in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
