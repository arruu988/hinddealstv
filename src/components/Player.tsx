import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Eye } from 'lucide-react';
import { Content } from '../types';

export function Player() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContentAndMarkView = async () => {
      const key = localStorage.getItem('userKey');
      if (!key) return;

      try {
        const res = await fetch(`/api/content/${id}`, { headers: { 'Authorization': `Bearer ${key}` } });
        const data = await res.json();
        
        if (data.success) {
          setContent(data.data);
          // Mark view
          fetch(`/api/content/${id}/view`, { 
            method: 'POST',
            headers: { 'Authorization': `Bearer ${key}` } 
          });
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        console.error(err);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchContentAndMarkView();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    );
  }

  if (!content) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative flex items-center justify-center">
        {content.media_type === 'Image' || content.media_type === 'Photos' ? (
          <img 
            src={content.video_url} 
            alt={content.title}
            className="w-full h-full object-contain"
          />
        ) : content.media_type === 'Audio' ? (
          <audio 
            controls 
            autoPlay
            className="w-3/4"
            src={content.video_url}
          >
            Your browser does not support the audio element.
          </audio>
        ) : content.media_type === 'Document' || content.media_type === 'File' ? (
          <div className="text-center">
            <p className="text-gray-400 mb-4">This is a document or file download.</p>
            <a href={content.video_url} download className="bg-green-500 text-black px-6 py-2 rounded-full font-bold hover:bg-green-400 transition-colors">
              Download File
            </a>
          </div>
        ) : (
          <video 
            controls 
            autoPlay
            className="w-full h-full"
            poster={content.thumbnail_url}
            src={content.video_url}
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{content.title}</h1>
            <p className="text-gray-400 mt-2 text-lg leading-relaxed max-w-3xl">{content.description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
          <span className="bg-white/5 px-3 py-1 rounded-full border border-white/10">{content.category}</span>
          {content.duration && <span>• {content.duration}</span>}
          <span>• Uploaded on {new Date(content.uploaded_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
