import React, { useEffect, useState } from 'react';
import { KeyRound, Upload, Users, Shield, Copy, Edit, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { User, Content } from '../../types';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'keys' | 'upload' | 'content' | 'settings'>('keys');

  // Key Gen State
  const [userId, setUserId] = useState('');
  const [plan, setPlan] = useState('1 Month');
  const [generatedKey, setGeneratedKey] = useState('');

  // Upload State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Movies');
  const [duration, setDuration] = useState('');
  const [pcloudLink, setPcloudLink] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [mediaType, setMediaType] = useState('Video');
  const [uploadLoading, setUploadLoading] = useState(false);

  // Settings State
  const [siteLocked, setSiteLocked] = useState(false);

  // Data
  const [usersList, setUsersList] = useState<User[]>([]);
  const [contentList, setContentList] = useState<Content[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const getAuthHeader = () => ({
    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
  });

  const fetchData = async () => {
    try {
      const [users, content, settings] = await Promise.all([
        fetch('/api/admin/users', { headers: getAuthHeader() }).then(r => r.json()),
        fetch('/api/admin/content', { headers: getAuthHeader() }).then(r => r.json()),
        fetch('/api/admin/settings', { headers: getAuthHeader() }).then(r => r.json())
      ]);
      if (users.success) setUsersList(users.data);
      if (content.success) setContentList(content.data);
      if (settings.success) setSiteLocked(settings.locked);
    } catch (err) {
      console.error(err);
    }
  };

  const generateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/generate-key', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ userId, planDuration: plan })
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedKey(data.key);
        fetchData();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyKey = () => {
    navigator.clipboard.writeText(generatedKey);
    alert('Key copied to clipboard');
  };

  const uploadContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pcloudLink) return alert('Please provide a pCloud link');
    
    setUploadLoading(true);

    try {
      const res = await fetch('/api/admin/upload-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          title, description, category, duration, pcloudLink, thumbnailUrl, mediaType
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Uploaded successfully');
        setTitle(''); setDescription(''); setDuration('');
        setPcloudLink(''); setThumbnailUrl('');
        fetchData();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadLoading(false);
    }
  };

  const toggleContentVisibility = async (id: number) => {
    await fetch(`/api/admin/content/${id}/toggle`, { 
      method: 'PUT',
      headers: getAuthHeader()
    });
    fetchData();
  };

  const deleteContent = async (id: number) => {
    if (confirm('Are you sure you want to delete this?')) {
      await fetch(`/api/admin/content/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeader()
      });
      fetchData();
    }
  };

  const toggleSiteLock = async () => {
    const res = await fetch('/api/admin/toggle-lock', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ locked: !siteLocked })
    });
    const data = await res.json();
    if (data.success) {
      setSiteLocked(data.locked);
    }
  };

  const revokeKey = async (id: number) => {
    if (confirm('Revoke access for this user?')) {
      await fetch(`/api/admin/users/${id}/revoke`, { 
        method: 'POST',
        headers: getAuthHeader()
      });
      fetchData();
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      <div className="space-y-2">
        <button className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'keys' ? 'bg-white/10 text-white font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5'}`} onClick={() => setActiveTab('keys')}><KeyRound className="w-5 h-5" /> Generate Keys</button>
        <button className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'upload' ? 'bg-white/10 text-white font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5'}`} onClick={() => setActiveTab('upload')}><Upload className="w-5 h-5" /> Upload Content</button>
        <button className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'content' ? 'bg-white/10 text-white font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5'}`} onClick={() => setActiveTab('content')}><Eye className="w-5 h-5" /> Content Manager</button>
        <button className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'settings' ? 'bg-white/10 text-white font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5'}`} onClick={() => setActiveTab('settings')}><Shield className="w-5 h-5" /> Master Settings</button>
      </div>

      <div className="md:col-span-3">
        {activeTab === 'keys' && (
          <div className="space-y-8">
            <div className="bg-[#111] p-6 rounded-2xl border border-white/5">
              <h2 className="text-xl font-bold mb-6">Create New Key</h2>
              <form onSubmit={generateKey} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">User ID</label>
                    <input type="number" required value={userId} onChange={e => setUserId(e.target.value)} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500" placeholder="e.g. 1001" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Plan Duration</label>
                    <select value={plan} onChange={e => setPlan(e.target.value)} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500">
                      <option>1 Month</option>
                      <option>3 Months</option>
                      <option>6 Months</option>
                      <option>1 Year</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">Generate</button>
              </form>
              
              {generatedKey && (
                <div className="mt-6 bg-green-500/10 border border-green-500/20 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-400">Generated successfully!</p>
                    <p className="font-mono text-xl text-white mt-1">{generatedKey}</p>
                  </div>
                  <button onClick={copyKey} className="p-2 hover:bg-white/10 rounded-lg"><Copy className="w-5 h-5 text-gray-300" /></button>
                </div>
              )}
            </div>

            <div className="bg-[#111] p-6 rounded-2xl border border-white/5">
              <h2 className="text-xl font-bold mb-4">Recent Users</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#1A1A1A]">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg font-medium text-gray-400">ID</th>
                      <th className="px-4 py-3 font-medium text-gray-400">Plan</th>
                      <th className="px-4 py-3 font-medium text-gray-400">Key</th>
                      <th className="px-4 py-3 font-medium text-gray-400">Expiry</th>
                      <th className="px-4 py-3 rounded-tr-lg font-medium text-gray-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map(u => (
                      <tr key={u.id} className="border-b border-white/5">
                        <td className="px-4 py-3 font-mono">{u.user_id}</td>
                        <td className="px-4 py-3">{u.plan}</td>
                        <td className="px-4 py-3 font-mono text-gray-500">{u.key.substring(0,6)}...</td>
                        <td className="px-4 py-3">{new Date(u.expiry_date).toLocaleDateString()}</td>
                        <td className="px-4 py-3 flex gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs ${u.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {u.is_active ? 'Active' : 'Revoked'}
                          </span>
                          {u.is_active === 1 && <button onClick={() => revokeKey(u.id)} className="text-red-400 hover:text-red-300 text-xs">Revoke</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="bg-[#111] p-6 rounded-2xl border border-white/5">
            <h2 className="text-xl font-bold mb-6">Upload Video Content</h2>
            <form onSubmit={uploadContent} className="space-y-4">
              <div><label className="block text-sm text-gray-400 mb-1">Title</label><input type="text" required value={title} onChange={e=>setTitle(e.target.value)} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2" /></div>
              <div><label className="block text-sm text-gray-400 mb-1">Description</label><textarea value={description} onChange={e=>setDescription(e.target.value)} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2" rows={3}></textarea></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Media Type</label>
                  <select value={mediaType} onChange={e=>setMediaType(e.target.value)} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2">
                    <option>Video</option>
                    <option>Image</option>
                    <option>Audio</option>
                    <option>Document</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Category</label>
                  <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2">
                    <option>Movies</option><option>Photos</option><option>Shows</option><option>Highlights</option><option>Sports</option>
                  </select>
                </div>
                <div><label className="block text-sm text-gray-400 mb-1">Duration (Optional)</label><input type="text" value={duration} onChange={e=>setDuration(e.target.value)} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Media / pCloud Link</label>
                  <input type="text" required placeholder="https://u.pcloud.link/..." value={pcloudLink} onChange={e=>setPcloudLink(e.target.value)} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Thumbnail Link (Optional/Auto for images)</label>
                  <input type="text" placeholder="Thumbnail link or leave blank" value={thumbnailUrl} onChange={e=>setThumbnailUrl(e.target.value)} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2" />
                </div>
              </div>
              <button type="submit" disabled={uploadLoading} className="w-full bg-white hover:bg-gray-200 text-black py-3 rounded-xl font-bold mt-4 flex items-center justify-center">
                {uploadLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Start Upload'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="bg-[#111] p-6 rounded-2xl border border-white/5">
            <h2 className="text-xl font-bold mb-6">Content Library</h2>
            <div className="space-y-4">
              {contentList.map(c => (
                <div key={c.id} className={`flex gap-4 p-4 rounded-xl border transition-opacity ${c.is_active ? 'border-white/10' : 'border-white/5 opacity-50'}`}>
                  <img src={c.thumbnail_url} className="w-32 h-20 object-cover rounded-lg bg-black" />
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{c.title}</h3>
                    <p className="text-sm text-gray-400">{c.category} • {c.views} views</p>
                    <p className="text-xs text-gray-600 mt-1">{c.video_url}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => toggleContentVisibility(c.id)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors" title={c.is_active ? 'Hide' : 'Show'}>
                      {c.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button onClick={() => deleteContent(c.id)} className="flex items-center gap-2 p-2 hover:bg-red-500/10 rounded-lg text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                      <span className="text-xs font-bold">Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-[#111] p-6 rounded-2xl border border-white/5">
            <h2 className="text-xl font-bold mb-6">Platform Security</h2>
            
            <div className="flex items-center justify-between p-6 bg-red-500/5 border border-red-500/20 rounded-xl">
              <div>
                <h3 className="font-bold text-white text-lg">Site Lock</h3>
                <p className="text-sm text-gray-400 mt-1">Temporarily block all users from accessing the platform. Useful for maintenance.</p>
              </div>
              <button 
                onClick={toggleSiteLock}
                className={`px-6 py-3 rounded-xl font-bold transition-colors ${siteLocked ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-red-600 text-white hover:bg-red-700'}`}
              >
                {siteLocked ? '🔓 Unlock Site' : '🔒 Lock Site'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
