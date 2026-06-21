import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Eye, Maximize, Minimize } from 'lucide-react';
import { Content } from '../types';

export function Player() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCustomFullscreen, setIsCustomFullscreen] = useState(false);
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setIsLandscape(window.innerWidth > window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleFullscreen = async () => {
    const el = playerRef.current;
    if (!el) return;

    if (!isCustomFullscreen) {
      const video = el.querySelector('video');
      
      // Try iOS native fullscreen first
      if (video && typeof (video as any).webkitEnterFullscreen === 'function') {
        (video as any).webkitEnterFullscreen();
        return;
      }

      // Try Standard Web Fullscreen
      try {
        if (el.requestFullscreen) {
          await el.requestFullscreen();
        } else if ((el as any).webkitRequestFullscreen) {
          await (el as any).webkitRequestFullscreen();
        }
        
        // Try orientation lock
        if (screen.orientation && screen.orientation.lock) {
          await screen.orientation.lock('landscape').catch(() => {});
        }
      } catch (err) {
        console.warn("Fullscreen API failed, depending on CSS fallback.", err);
      }
      setIsCustomFullscreen(true);
    } else {
      setIsCustomFullscreen(false);
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen().catch(() => {});
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        }
        if (screen.orientation && screen.orientation.unlock) {
          screen.orientation.unlock();
        }
      } catch (err) {}
    }
  };

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
    <div className={`max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 ${isCustomFullscreen ? 'p-0 space-y-0 max-w-full' : ''}`}>
      {!isCustomFullscreen && (
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
      )}

      <div 
        ref={playerRef} 
        style={isCustomFullscreen && !isLandscape ? {
          position: 'fixed',
          top: '50%',
          left: '50%',
          width: '100vh',
          height: '100vw',
          transform: 'translate(-50%, -50%) rotate(90deg)',
          zIndex: 9999,
          backgroundColor: 'black'
        } : {}}
        className={`${isCustomFullscreen && isLandscape ? 'fixed inset-0 min-h-screen w-screen z-[9999] bg-black' : !isCustomFullscreen ? 'aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative' : ''} flex items-center justify-center group`}
      >
        {content.media_type === 'Image' || content.media_type === 'Photos' ? (
          <img 
            src={content.video_url} 
            alt={content.title}
            className={`object-contain ${isCustomFullscreen ? 'w-full h-full' : 'w-full h-full'}`}
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
          <div className="text-center p-8">
            <p className="text-gray-400 mb-4">This is a document or file download.</p>
            <a href={content.video_url} download className="bg-green-500 text-black px-6 py-2 rounded-full font-bold hover:bg-green-400 transition-colors">
              Download File
            </a>
          </div>
        ) : (() => {
          const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
          const ytMatch = content.video_url.match(ytRegExp);
          const ytId = (ytMatch && ytMatch[2].length === 11) ? ytMatch[2] : null;

          if (ytId) {
            return (
              <iframe
                src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
                className={`w-full h-full border-none`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen={true}
              ></iframe>
            );
          }

          return (
            <video 
              controls 
              autoPlay
              playsInline
              controlsList="nodownload nofullscreen"
              className={`w-full h-full object-contain`}
              poster={content.thumbnail_url}
              src={content.video_url}
            >
              Your browser does not support the video tag.
            </video>
          );
        })()}

        {(content.media_type === 'Video' || content.media_type === 'Movies' || content.media_type === 'Shows' || content.media_type === 'Sports' || content.media_type === 'Highlights') && (
          <button 
            onClick={toggleFullscreen}
            className={`absolute bottom-12 right-2 md:bottom-10 md:right-4 bg-black/60 hover:bg-black/90 text-white p-2 rounded z-[10000] backdrop-blur-sm transition-all`}
            title="Toggle Custom Fullscreen"
          >
            {isCustomFullscreen ? <Minimize className="w-5 h-5 md:w-6 md:h-6" /> : <Maximize className="w-5 h-5 md:w-6 md:h-6" />}
          </button>
        )}
      </div>

      {!isCustomFullscreen && (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">{content.title}</h1>
              <p className="text-gray-400 mt-2 text-lg leading-relaxed max-w-3xl">{content.description}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-500">
            <span className="bg-white/5 px-3 py-1 rounded-full border border-white/10">{content.category}</span>
            {content.duration && <span>• {content.duration}</span>}
            <span>• Uploaded on {new Date(content.uploaded_at).toLocaleDateString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
