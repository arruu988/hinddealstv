import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, PlaySquare } from 'lucide-react';
import { Content } from '../types';

export function Library() {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchContent = async () => {
      const key = localStorage.getItem('userKey');
      if (!key) return;

      try {
        const res = await fetch('/api/content', { headers: { 'Authorization': `Bearer ${key}` } });
        const data = await res.json();
        if (data.success) {
          setContent(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const categories = ['All', ...Array.from(new Set(content.map(c => c.category)))];
  
  const filteredContent = filter === 'All' ? content : content.filter(c => c.category === filter);

  if (loading) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Premium Library</h1>
          <p className="text-gray-400 mt-1">Watch high quality movies, highlights and shows</p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === cat 
                  ? 'bg-white text-black' 
                  : 'bg-[#1A1A1A] text-gray-400 hover:text-white border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredContent.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
          {filteredContent.map((item) => (
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
                  {item.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-white">
                       {item.duration}
                    </div>
                  )}
                </div>
                <div className="p-3 sm:p-4 flex-1 flex flex-col justify-center">
                  <h3 className="font-semibold text-sm sm:text-base text-white line-clamp-2 group-hover:text-green-400 transition-colors leading-tight">{item.title}</h3>
                  <div className="flex items-center mt-1">
                    <p className="text-xs text-gray-500 truncate">{document.body.clientWidth < 640 ? item.category.substring(0, 10) : item.category}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <PlaySquare className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No content found in this category.</p>
        </div>
      )}
    </div>
  );
}
