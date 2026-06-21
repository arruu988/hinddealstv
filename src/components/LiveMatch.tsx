import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Radio, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const upcomingMatches = [
  { id: 1, date: new Date('2026-06-11T19:00:00.000Z'), name: "Mexico vs South Africa", group: "A", venue: "Mexico City" },
  { id: 2, date: new Date('2026-06-12T02:00:00.000Z'), name: "South Korea vs Czechia", group: "A", venue: "Zapopan" },
  { id: 3, date: new Date('2026-06-12T19:00:00.000Z'), name: "Canada vs Bosnia & Herzegovina", group: "B", venue: "Toronto" },
  { id: 4, date: new Date('2026-06-13T01:00:00.000Z'), name: "USA vs Paraguay", group: "D", venue: "Los Angeles" },
  { id: 5, date: new Date('2026-06-13T19:00:00.000Z'), name: "Qatar vs Switzerland", group: "B", venue: "Santa Clara" },
  { id: 6, date: new Date('2026-06-13T22:00:00.000Z'), name: "Brazil vs Morocco", group: "C", venue: "New Jersey" },
  { id: 7, date: new Date('2026-06-14T01:00:00.000Z'), name: "Haiti vs Scotland", group: "C", venue: "Foxborough" },
  { id: 8, date: new Date('2026-06-14T04:00:00.000Z'), name: "Australia vs Turkey", group: "D", venue: "Vancouver" },
  { id: 9, date: new Date('2026-06-14T17:00:00.000Z'), name: "Germany vs Curacao", group: "E", venue: "Houston" },
  { id: 10, date: new Date('2026-06-14T20:00:00.000Z'), name: "Netherlands vs Japan", group: "F", venue: "Arlington" },
  { id: 11, date: new Date('2026-06-14T23:00:00.000Z'), name: "Ivory Coast vs Ecuador", group: "E", venue: "Philadelphia" },
  { id: 12, date: new Date('2026-06-15T02:00:00.000Z'), name: "Sweden vs Tunisia", group: "F", venue: "Guadalajara" },
  { id: 13, date: new Date('2026-06-15T16:00:00.000Z'), name: "Spain vs Cape Verde", group: "H", venue: "Atlanta" },
  { id: 14, date: new Date('2026-06-15T19:00:00.000Z'), name: "Belgium vs Egypt", group: "G", venue: "Seattle" },
  { id: 15, date: new Date('2026-06-15T22:00:00.000Z'), name: "Saudi Arabia vs Uruguay", group: "H", venue: "Miami" },
  { id: 16, date: new Date('2026-06-16T01:00:00.000Z'), name: "Iran vs New Zealand", group: "G", venue: "Los Angeles" },
  { id: 17, date: new Date('2026-06-16T19:00:00.000Z'), name: "France vs Senegal", group: "I", venue: "New Jersey" },
  { id: 18, date: new Date('2026-06-16T22:00:00.000Z'), name: "Iraq vs Norway", group: "I", venue: "Foxborough" },
  { id: 19, date: new Date('2026-06-17T01:00:00.000Z'), name: "Argentina vs Algeria", group: "J", venue: "Kansas City" },
  { id: 20, date: new Date('2026-06-17T04:00:00.000Z'), name: "Austria vs Jordan", group: "J", venue: "Santa Clara" },
  { id: 21, date: new Date('2026-06-17T17:00:00.000Z'), name: "Portugal vs DR Congo", group: "K", venue: "Houston" },
  { id: 22, date: new Date('2026-06-17T20:00:00.000Z'), name: "England vs Croatia", group: "L", venue: "Arlington" },
  { id: 23, date: new Date('2026-06-17T23:00:00.000Z'), name: "Ghana vs Panama", group: "L", venue: "Toronto" },
  { id: 24, date: new Date('2026-06-18T02:00:00.000Z'), name: "Uzbekistan vs Colombia", group: "K", venue: "Mexico City" },
  { id: 25, date: new Date('2026-06-18T16:00:00.000Z'), name: "Czechia vs South Africa", group: "A", venue: "Atlanta" },
  { id: 26, date: new Date('2026-06-18T19:00:00.000Z'), name: "Switzerland vs Bosnia & Herzegovina", group: "B", venue: "Los Angeles" },
  { id: 27, date: new Date('2026-06-18T22:00:00.000Z'), name: "Canada vs Qatar", group: "B", venue: "Vancouver" },
  { id: 28, date: new Date('2026-06-19T01:00:00.000Z'), name: "Mexico vs South Korea", group: "A", venue: "Zapopan" },
  { id: 29, date: new Date('2026-06-19T19:00:00.000Z'), name: "USA vs Australia", group: "D", venue: "Seattle" },
  { id: 30, date: new Date('2026-06-19T22:00:00.000Z'), name: "Scotland vs Morocco", group: "C", venue: "Foxborough" },
  { id: 31, date: new Date('2026-06-20T00:30:00.000Z'), name: "Brazil vs Haiti", group: "C", venue: "Philadelphia" },
  { id: 32, date: new Date('2026-06-20T03:00:00.000Z'), name: "Turkey vs Paraguay", group: "D", venue: "Santa Clara" },
  { id: 33, date: new Date('2026-06-20T17:00:00.000Z'), name: "Netherlands vs Sweden", group: "F", venue: "Houston" },
  { id: 34, date: new Date('2026-06-20T20:00:00.000Z'), name: "Germany vs Ivory Coast", group: "E", venue: "Toronto" },
  { id: 35, date: new Date('2026-06-21T00:00:00.000Z'), name: "Ecuador vs Curacao", group: "E", venue: "Kansas City" },
  { id: 36, date: new Date('2026-06-21T04:00:00.000Z'), name: "Tunisia vs Japan", group: "F", venue: "Guadalajara" },
  { id: 37, date: new Date('2026-06-21T16:00:00.000Z'), name: "Spain vs Saudi Arabia", group: "H", venue: "Atlanta" },
  { id: 38, date: new Date('2026-06-21T19:00:00.000Z'), name: "Belgium vs Iran", group: "G", venue: "Los Angeles" },
  { id: 39, date: new Date('2026-06-21T22:00:00.000Z'), name: "Uruguay vs Cape Verde", group: "H", venue: "Miami" },
  { id: 40, date: new Date('2026-06-22T01:00:00.000Z'), name: "New Zealand vs Egypt", group: "G", venue: "Vancouver" },
  { id: 41, date: new Date('2026-06-22T17:00:00.000Z'), name: "Argentina vs Austria", group: "J", venue: "Arlington" },
  { id: 42, date: new Date('2026-06-22T21:00:00.000Z'), name: "France vs Iraq", group: "I", venue: "Philadelphia" },
  { id: 43, date: new Date('2026-06-23T00:00:00.000Z'), name: "Norway vs Senegal", group: "I", venue: "Toronto" },
  { id: 44, date: new Date('2026-06-23T03:00:00.000Z'), name: "Jordan vs Algeria", group: "J", venue: "Santa Clara" },
  { id: 45, date: new Date('2026-06-23T17:00:00.000Z'), name: "Portugal vs Uzbekistan", group: "K", venue: "Houston" },
  { id: 46, date: new Date('2026-06-23T20:00:00.000Z'), name: "England vs Ghana", group: "L", venue: "Foxborough" },
  { id: 47, date: new Date('2026-06-23T23:00:00.000Z'), name: "Panama vs Croatia", group: "L", venue: "Foxborough" },
  { id: 48, date: new Date('2026-06-24T02:00:00.000Z'), name: "Colombia vs DR Congo", group: "K", venue: "Zapopan" },
  { id: 49, date: new Date('2026-06-24T19:00:00.000Z'), name: "Switzerland vs Canada", group: "B", venue: "Vancouver" },
  { id: 50, date: new Date('2026-06-24T19:00:00.000Z'), name: "Bosnia & Herzegovina vs Qatar", group: "B", venue: "Seattle" },
  { id: 51, date: new Date('2026-06-24T22:00:00.000Z'), name: "Morocco vs Haiti", group: "C", venue: "Atlanta" },
  { id: 52, date: new Date('2026-06-24T22:00:00.000Z'), name: "Scotland vs Brazil", group: "C", venue: "Miami" },
  { id: 53, date: new Date('2026-06-25T01:00:00.000Z'), name: "South Africa vs South Korea", group: "A", venue: "Guadalajara" },
  { id: 54, date: new Date('2026-06-25T01:00:00.000Z'), name: "Czechia vs Mexico", group: "A", venue: "Mexico City" },
  { id: 55, date: new Date('2026-06-25T20:00:00.000Z'), name: "Curacao vs Ivory Coast", group: "E", venue: "Philadelphia" },
  { id: 56, date: new Date('2026-06-25T20:00:00.000Z'), name: "Ecuador vs Germany", group: "E", venue: "New Jersey" },
  { id: 57, date: new Date('2026-06-25T23:00:00.000Z'), name: "Tunisia vs Netherlands", group: "F", venue: "Kansas City" },
  { id: 58, date: new Date('2026-06-25T23:00:00.000Z'), name: "Japan vs Sweden", group: "F", venue: "Arlington" },
  { id: 59, date: new Date('2026-06-26T02:00:00.000Z'), name: "Turkey vs USA", group: "D", venue: "Los Angeles" },
  { id: 60, date: new Date('2026-06-26T02:00:00.000Z'), name: "Paraguay vs Australia", group: "D", venue: "Santa Clara" },
  { id: 61, date: new Date('2026-06-26T19:00:00.000Z'), name: "Norway vs France", group: "I", venue: "Foxborough" },
  { id: 62, date: new Date('2026-06-26T19:00:00.000Z'), name: "Senegal vs Iraq", group: "I", venue: "Toronto" },
  { id: 63, date: new Date('2026-06-27T00:00:00.000Z'), name: "Cape Verde vs Saudi Arabia", group: "H", venue: "Houston" },
  { id: 64, date: new Date('2026-06-27T00:00:00.000Z'), name: "Uruguay vs Spain", group: "H", venue: "Zapopan" },
  { id: 65, date: new Date('2026-06-27T03:00:00.000Z'), name: "New Zealand vs Belgium", group: "G", venue: "Vancouver" },
  { id: 66, date: new Date('2026-06-27T03:00:00.000Z'), name: "Egypt vs Iran", group: "G", venue: "Seattle" },
  { id: 67, date: new Date('2026-06-27T21:00:00.000Z'), name: "Panama vs England", group: "L", venue: "New Jersey" },
  { id: 68, date: new Date('2026-06-27T21:00:00.000Z'), name: "Croatia vs Ghana", group: "L", venue: "Philadelphia" },
  { id: 69, date: new Date('2026-06-27T23:30:00.000Z'), name: "Colombia vs Portugal", group: "K", venue: "Miami" },
  { id: 70, date: new Date('2026-06-27T23:30:00.000Z'), name: "DR Congo vs Uzbekistan", group: "K", venue: "Atlanta" },
  { id: 71, date: new Date('2026-06-28T02:00:00.000Z'), name: "Algeria vs Austria", group: "J", venue: "Kansas City" },
  { id: 72, date: new Date('2026-06-28T02:00:00.000Z'), name: "Jordan vs Argentina", group: "J", venue: "Arlington" },
  { id: 73, date: new Date('2026-06-28T19:00:00.000Z'), name: "2A vs 2B", group: "Knockout", venue: "Los Angeles" },
  { id: 74, date: new Date('2026-06-29T17:00:00.000Z'), name: "1C vs 2F", group: "Knockout", venue: "Houston" },
  { id: 75, date: new Date('2026-06-29T20:30:00.000Z'), name: "1E vs 3rd (A/B/C/D/F)", group: "Knockout", venue: "Foxborough" },
  { id: 76, date: new Date('2026-06-30T01:00:00.000Z'), name: "1F vs 2C", group: "Knockout", venue: "Guadalajara" },
  { id: 77, date: new Date('2026-06-30T17:00:00.000Z'), name: "2E vs 2I", group: "Knockout", venue: "Arlington" },
  { id: 78, date: new Date('2026-06-30T21:00:00.000Z'), name: "1I vs 3rd (C/D/F/G/H)", group: "Knockout", venue: "New Jersey" },
  { id: 79, date: new Date('2026-07-01T01:00:00.000Z'), name: "1A vs 3rd (C/E/F/H/I)", group: "Knockout", venue: "Mexico City" },
  { id: 80, date: new Date('2026-07-01T16:00:00.000Z'), name: "1L vs 3rd (E/H/I/J/K)", group: "Knockout", venue: "Atlanta" },
  { id: 81, date: new Date('2026-07-01T20:00:00.000Z'), name: "1G vs 3rd (A/E/H/I/J)", group: "Knockout", venue: "Seattle" },
  { id: 82, date: new Date('2026-07-01T20:00:00.000Z'), name: "1D vs 3rd (B/E/F/I/J)", group: "Knockout", venue: "Santa Clara" },
  { id: 83, date: new Date('2026-07-02T00:00:00.000Z'), name: "1H vs 2J", group: "Knockout", venue: "Los Angeles" },
  { id: 84, date: new Date('2026-07-02T19:00:00.000Z'), name: "2K vs 2L", group: "Knockout", venue: "Toronto" },
  { id: 85, date: new Date('2026-07-02T23:00:00.000Z'), name: "1B vs 3rd (E/F/G/I/J)", group: "Knockout", venue: "Vancouver" },
  { id: 86, date: new Date('2026-07-03T03:00:00.000Z'), name: "2D vs 2G", group: "Knockout", venue: "Arlington" },
  { id: 87, date: new Date('2026-07-03T18:00:00.000Z'), name: "1J vs 2H", group: "Knockout", venue: "Miami" },
  { id: 88, date: new Date('2026-07-04T01:30:00.000Z'), name: "1K vs 3rd (D/E/I/J/L)", group: "Knockout", venue: "Kansas City" },
  { id: 89, date: new Date('2026-07-04T17:00:00.000Z'), name: "Winner Match 73 vs Winner Match 75", group: "Knockout", venue: "Houston" },
  { id: 90, date: new Date('2026-07-04T21:00:00.000Z'), name: "Winner Match 74 vs Winner Match 77", group: "Knockout", venue: "Philadelphia" },
  { id: 91, date: new Date('2026-07-05T20:00:00.000Z'), name: "Winner Match 76 vs Winner Match 78", group: "Knockout", venue: "New Jersey" },
  { id: 92, date: new Date('2026-07-06T00:00:00.000Z'), name: "Winner Match 79 vs Winner Match 80", group: "Knockout", venue: "Mexico City" },
  { id: 93, date: new Date('2026-07-06T19:00:00.000Z'), name: "Winner Match 83 vs Winner Match 84", group: "Knockout", venue: "Arlington" },
  { id: 94, date: new Date('2026-07-07T00:00:00.000Z'), name: "Winner Match 81 vs Winner Match 82", group: "Knockout", venue: "Seattle" },
  { id: 95, date: new Date('2026-07-07T16:00:00.000Z'), name: "Winner Match 86 vs Winner Match 88", group: "Knockout", venue: "Atlanta" },
  { id: 96, date: new Date('2026-07-07T20:00:00.000Z'), name: "Winner Match 85 vs Winner Match 87", group: "Knockout", venue: "Vancouver" },
  { id: 97, date: new Date('2026-07-09T20:00:00.000Z'), name: "Winner Match 89 vs Winner Match 90", group: "Knockout", venue: "Foxborough" },
  { id: 98, date: new Date('2026-07-10T19:00:00.000Z'), name: "Winner Match 93 vs Winner Match 94", group: "Knockout", venue: "Los Angeles" },
  { id: 99, date: new Date('2026-07-11T21:00:00.000Z'), name: "Winner Match 91 vs Winner Match 92", group: "Knockout", venue: "Miami" },
  { id: 100, date: new Date('2026-07-12T01:00:00.000Z'), name: "Winner Match 95 vs Winner Match 96", group: "Knockout", venue: "Kansas City" },
  { id: 101, date: new Date('2026-07-14T19:00:00.000Z'), name: "Winner Match 97 vs Winner Match 98", group: "Knockout", venue: "Arlington" },
  { id: 102, date: new Date('2026-07-15T19:00:00.000Z'), name: "Winner Match 99 vs Winner Match 100", group: "Knockout", venue: "Atlanta" },
  { id: 103, date: new Date('2026-07-18T21:00:00.000Z'), name: "Loser Match 101 vs Loser Match 102", group: "Knockout", venue: "Miami" },
  { id: 104, date: new Date('2026-07-19T18:00:00.000Z'), name: "Winner Match 101 vs Winner Match 102", group: "Knockout", venue: "New Jersey" },
];

const MATCH_DURATION = 4 * 60 * 60 * 1000; // 4 hours

export function LiveMatch() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [now, setNow] = useState(new Date());
  const [forceLive, setForceLive] = useState(false);
  const [fifaUrl, setFifaUrl] = useState<string | null>(null);
  
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch('/api/site-status')
      .then(res => res.json())
      .then(data => {
        if (data.fifaUrl) setFifaUrl(data.fifaUrl);
      })
      .catch(() => {});
  }, []);

  const displayMatches = upcomingMatches.filter(m => {
    const matchEnd = new Date(m.date.getTime() + MATCH_DURATION);
    return now <= matchEnd;
  });

  const nextMatch = displayMatches.find(m => m.date > now);
  const currentMatch = displayMatches.find(m => now >= new Date(m.date.getTime() - 30 * 60000) && now <= new Date(m.date.getTime() + MATCH_DURATION));
  
  const isLive = forceLive || !!currentMatch;
  const activeMatch = currentMatch || nextMatch || displayMatches[0];

  useEffect(() => {
    // Iframe handled via JSX
  }, [isLive]);

  const timeDiff = nextMatch && !isLive ? Math.max(0, nextMatch.date.getTime() - now.getTime()) : 0;
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hrs = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((timeDiff / 1000 / 60) % 60);
  const secs = Math.floor((timeDiff / 1000) % 60);

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col pt-2 pb-8 px-2 sm:px-0 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors p-2"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <div className="flex items-center gap-3 pr-2">
          <div className="flex flex-col text-right">
            <span className="text-sm font-bold text-white">{activeMatch?.name || 'No upcoming matches'}</span>
            <span className="text-xs text-gray-400">Grp {activeMatch?.group} • {activeMatch?.venue}</span>
          </div>
        </div>
      </div>
      
      {!isLive ? (
        <div className="flex-1 rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl flex flex-col items-center justify-center p-6 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-500/10 rounded-full blur-[120px] pointer-events-none" />
          
          <Radio className="w-12 h-12 sm:w-16 sm:h-16 text-gray-500 mb-4 sm:mb-6" />
          <h2 className="text-2xl sm:text-5xl font-bold text-white mb-4 tracking-tight">Match Starting Soon</h2>
          <p className="text-gray-400 text-sm sm:text-lg mb-8 max-w-lg">
            The next match feed is offline. The stream will automatically begin when the broadcast kicks off.
          </p>

          {nextMatch && (
            <div className="bg-black/50 border border-white/10 p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-lg relative z-10 backdrop-blur-xl">
              <div className="flex justify-between text-[10px] sm:text-xs text-green-400 font-bold mb-4 uppercase tracking-wider">
                <span>{nextMatch.venue}</span>
                <span>Group {nextMatch.group}</span>
              </div>
              <h3 className="text-lg sm:text-2xl font-bold text-white mb-6 sm:mb-8 border-b border-white/10 pb-4">{nextMatch.name}</h3>
              
              <div className="flex items-center justify-center gap-3 sm:gap-4">
                {days > 0 && (
                  <>
                    <div className="flex flex-col items-center">
                      <span className="text-3xl sm:text-5xl font-bold text-white">{days.toString().padStart(2, '0')}</span>
                      <span className="text-[10px] sm:text-xs text-gray-500 mt-2 uppercase tracking-widest">Days</span>
                    </div>
                    <span className="text-3xl sm:text-5xl text-gray-600 font-light mb-6 sm:mb-6">:</span>
                  </>
                )}
                <div className="flex flex-col items-center">
                  <span className="text-3xl sm:text-5xl font-bold text-white">{hrs.toString().padStart(2, '0')}</span>
                  <span className="text-[10px] sm:text-xs text-gray-500 mt-2 uppercase tracking-widest">Hours</span>
                </div>
                <span className="text-3xl sm:text-5xl text-gray-600 font-light mb-6 sm:mb-6">:</span>
                <div className="flex flex-col items-center">
                  <span className="text-3xl sm:text-5xl font-bold text-white">{mins.toString().padStart(2, '0')}</span>
                  <span className="text-[10px] sm:text-xs text-gray-500 mt-2 uppercase tracking-widest">Mins</span>
                </div>
                <span className="text-3xl sm:text-5xl text-gray-600 font-light mb-6 sm:mb-6">:</span>
                <div className="flex flex-col items-center">
                  <span className="text-3xl sm:text-5xl font-bold tracking-tight bg-gradient-to-br from-green-400 to-emerald-600 text-transparent bg-clip-text">
                    {secs.toString().padStart(2, '0')}
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-500 mt-2 uppercase tracking-widest">Secs</span>
                </div>
              </div>
            </div>
          )}

          <button 
            onClick={() => setForceLive(true)}
            className="mt-8 text-[10px] text-gray-600 hover:text-gray-400 active:text-gray-200 transition-colors"
          >
            Force Open Player (Debug)
          </button>
        </div>
      ) : (
        <div className="w-full max-w-5xl mx-auto flex flex-col">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 border-b border-white/10 pb-4 gap-2">
             <div className="flex items-center gap-3">
                <div className="px-2 py-1 sm:px-3 rounded-full bg-red-500/20 text-red-400 text-xs sm:text-sm font-bold flex items-center gap-2 border border-red-500/30">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                  LIVE
                </div>
                <h1 className="text-lg sm:text-2xl font-bold text-white tracking-tight">Hind Deals TV Live</h1>
             </div>
             <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-md">Double-Tap Video to Seek 10s</span>
          </div>

          <div 
            ref={containerRef} 
            className={`w-full h-[60vh] sm:h-[75vh] md:h-[85vh] rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 bg-black relative shadow-2xl mx-auto flex items-center justify-center text-center ${!fifaUrl ? 'p-6' : ''}`}
          >
            {(() => {
              if (!fifaUrl) return <p className="text-xl sm:text-2xl text-gray-400 font-medium">Unable to play FIFA, contact Admin</p>;

              const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|live\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
              const ytMatch = fifaUrl.match(ytRegExp);
              const ytId = (ytMatch && ytMatch[2].length === 11) ? ytMatch[2] : null;

              if (ytId) {
                const origin = typeof window !== 'undefined' ? window.location.origin : '';
                return (
                  <iframe
                    src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&origin=${origin}`}
                    className="absolute inset-0 w-full h-full border-none"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen={true}
                  />
                );
              }

              return (
                <iframe
                  src={fifaUrl}
                  className="absolute inset-0 w-full h-full border-none"
                  allowFullScreen={true}
                />
              );
            })()}
          </div>
          
          <div className="mt-8 bg-[#111] border border-white/10 rounded-2xl p-4 sm:p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500"/> Full Schedule</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 pt-2 snap-x hide-scrollbar">
              {displayMatches.map(m => {
                const MatchLiveStatus = now >= new Date(m.date.getTime() - 30 * 60000) && now <= new Date(m.date.getTime() + MATCH_DURATION);
                return (
                  <div key={m.id} className={`flex-shrink-0 w-72 sm:w-80 flex flex-col justify-between p-4 rounded-xl border snap-center ${MatchLiveStatus ? 'bg-green-500/10 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-black/50 border-white/10'} gap-3`}>
                    <div className="flex flex-col">
                      <span className={`font-bold text-base sm:text-lg tracking-tight line-clamp-1 ${MatchLiveStatus ? 'text-green-400' : 'text-white'}`}>{m.name}</span>
                      <span className="text-xs text-gray-400 mt-1">{m.venue} <span className="mx-1">•</span> Group {m.group}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/10 pt-3 mt-1">
                      <span className="text-sm font-medium text-gray-300">{m.date.toLocaleDateString([], { month: 'short', day: 'numeric', weekday: 'short' })}</span>
                      <span className="text-sm font-bold bg-white/10 px-2 py-1 rounded text-gray-200">{m.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
