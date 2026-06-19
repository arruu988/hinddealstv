import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import fs from 'fs';
import https from 'https';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc, query, where, orderBy, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBnf3s9Mpm350u18U8XYk18bhTGiKPRZtc",
  authDomain: "vip-hack-1.firebaseapp.com",
  databaseURL: "https://vip-hack-1-default-rtdb.firebaseio.com",
  projectId: "vip-hack-1",
  storageBucket: "vip-hack-1.firebasestorage.app",
  messagingSenderId: "627098671700",
  appId: "1:627098671700:web:164e1b3569defe3713abc1",
  measurementId: "G-3ZKTBMWTG7"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const uploadsDir = process.env.VERCEL ? path.join('/tmp', 'uploads') : path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  try { fs.mkdirSync(uploadsDir); } catch(e) {}
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, crypto.randomBytes(8).toString('hex') + path.extname(file.originalname))
});
const upload = multer({ storage });

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(uploadsDir));

const ADMIN_EMAIL = 'khokarkavish1@gmail.com';
const ADMIN_PASSWORD = 'h1nddealtvlive';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_vip_hack';

// --- Initialization ---
async function initializeSettings() {
  const settingsRef = doc(db, 'site_settings', 'site_locked');
  const snap = await getDoc(settingsRef);
  if (!snap.exists()) {
    await setDoc(settingsRef, { setting_value: 'false' });
  }

  const masterKey = 'lion';
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('key', '==', masterKey));
  const userSnap = await getDocs(q);
  if (userSnap.empty) {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 10);
    await addDoc(usersRef, {
      user_id: 999,
      plan: 'Master Plan',
      key: masterKey,
      expiry_date: future.toISOString(),
      is_active: 1,
      created_at: new Date().toISOString()
    });
  }
}
initializeSettings();

// --- Middlewares ---
const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const checkSiteLock = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const settingsRef = doc(db, 'site_settings', 'site_locked');
    const snap = await getDoc(settingsRef);
    if (snap.exists() && snap.data().setting_value === 'true') {
      return res.status(403).json({ error: 'Site is temporarily paused' });
    }
    next();
  } catch (err) {
    next();
  }
};

const requireUserKey = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authKey = req.headers['authorization']?.replace('Bearer ', '');
  if (!authKey) return res.status(401).json({ error: 'No key provided' });
  
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('key', '==', authKey));
    const snap = await getDocs(q);
    
    if (snap.empty) return res.status(401).json({ error: 'Token Revoked or Invalid Key' });
    
    const userDoc = snap.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() } as any;
    
    if (user.is_active === 0) return res.status(401).json({ error: 'Token Revoked' });
    
    if (new Date(user.expiry_date) < new Date()) {
      return res.status(401).json({ error: 'Key expired' });
    }
    
    (req as any).user = user;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};

// Proxy
app.get('/api/proxy-media', (req, res) => {
  const targetUrl = req.query.url as string;
  if (!targetUrl) return res.status(400).send('Missing URL');
  
  if (targetUrl.includes('show?code=')) {
    https.get(targetUrl, (pageRes) => {
      let data = '';
      pageRes.on('data', chunk => data += chunk);
      pageRes.on('end', () => {
        const match = data.match(/"downloadlink":\s*"(.*?)"/i);
        if (match && match[1]) {
          const directUrl = match[1].replace(/\\\//g, '/');
          const headers: any = {};
          if (req.headers.range) headers.range = req.headers.range;
          
          https.get(directUrl, { headers }, (mediaRes) => {
            if (mediaRes.statusCode !== 200 && mediaRes.statusCode !== 206) {
              res.status(mediaRes.statusCode || 500).send('Failed to fetch media');
              return;
            }
            res.status(mediaRes.statusCode || 200);
            res.setHeader('Content-Type', mediaRes.headers['content-type'] || 'application/octet-stream');
            if (mediaRes.headers['content-length']) res.setHeader('Content-Length', mediaRes.headers['content-length']);
            if (mediaRes.headers['accept-ranges']) res.setHeader('Accept-Ranges', mediaRes.headers['accept-ranges']);
            if (mediaRes.headers['content-range']) res.setHeader('Content-Range', mediaRes.headers['content-range']);
            mediaRes.pipe(res);
          }).on('error', (e) => res.status(500).send(e.message));
        } else {
          res.status(404).send('Direct link not found in page');
        }
      });
    }).on('error', (e) => res.status(500).send(e.message));
  } else {
    const headers: any = {};
    if (req.headers.range) headers.range = req.headers.range;
    
    const client = targetUrl.startsWith('https') ? https : require('http');
    client.get(targetUrl, { headers }, (mediaRes: any) => {
      if (mediaRes.statusCode !== 200 && mediaRes.statusCode !== 206) {
        res.status(mediaRes.statusCode || 500).send('Failed to fetch media');
        return;
      }
      res.status(mediaRes.statusCode || 200);
      res.setHeader('Content-Type', mediaRes.headers['content-type'] || 'application/octet-stream');
      if (mediaRes.headers['content-length']) res.setHeader('Content-Length', mediaRes.headers['content-length']);
      if (mediaRes.headers['accept-ranges']) res.setHeader('Accept-Ranges', mediaRes.headers['accept-ranges']);
      if (mediaRes.headers['content-range']) res.setHeader('Content-Range', mediaRes.headers['content-range']);
      mediaRes.pipe(res);
    }).on('error', (e: any) => res.status(500).send(e.message));
  }
});

// User APIs
app.post('/api/verify-key', checkSiteLock, async (req, res) => {
  const { key } = req.body;
  if (!key) return res.status(400).json({ error: 'Key required' });

  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('key', '==', key));
    const snap = await getDocs(q);
    if (snap.empty) return res.status(401).json({ error: 'Invalid key' });

    const user = snap.docs[0].data();
    if (user.is_active === 0) return res.status(401).json({ error: 'Token Revoked' });
    if (new Date(user.expiry_date) < new Date()) return res.status(401).json({ error: 'Key expired contact admin for new key' });

    res.json({ success: true, plan: user.plan, expiry: user.expiry_date, key: user.key });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

app.get('/api/content', checkSiteLock, requireUserKey, async (req, res) => {
  try {
    const contentRef = collection(db, 'content');
    const q = query(contentRef, where('is_active', '==', 1));
    const snap = await getDocs(q);
    const content = snap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
    content.sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime());
    res.json({ success: true, data: content });
  } catch (err: any) {
    console.error("Fetch content error:", err);
    res.status(500).json({ error: 'Server Error' });
  }
});

app.get('/api/content/:id', checkSiteLock, requireUserKey, async (req, res) => {
  try {
    const docRef = doc(db, 'content', req.params.id);
    const snap = await getDoc(docRef);
    if (!snap.exists() || snap.data().is_active === 0) return res.status(404).json({ error: 'Content not found' });
    res.json({ success: true, data: { id: snap.id, ...snap.data() } });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

app.post('/api/content/:id/view', checkSiteLock, requireUserKey, async (req, res) => {
  try {
    const docRef = doc(db, 'content', req.params.id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      await updateDoc(docRef, { views: (snap.data().views || 0) + 1 });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

app.get('/api/user-status', checkSiteLock, requireUserKey, (req, res) => {
  const user = (req as any).user;
  res.json({ success: true, data: user });
});

app.get('/api/site-status', async (req, res) => {
  try {
    const settingsRef = doc(db, 'site_settings', 'site_locked');
    const snap = await getDoc(settingsRef);
    res.json({ success: true, locked: snap.exists() ? snap.data().setting_value === 'true' : false });
  } catch (err) {
    res.json({ success: true, locked: false });
  }
});

// Admin APIs

app.post('/api/admin/login', (req, res) => {
  if (req.body.email === ADMIN_EMAIL && req.body.password === ADMIN_PASSWORD) {
    const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ success: true, token });
  } else if (req.body.password === ADMIN_PASSWORD && !req.body.email) {
    // Check against old logic just in case it's used elsewhere
    const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/admin/logout', (req, res) => {
  res.json({ success: true });
});

app.post('/api/admin/generate-key', requireAdmin, async (req, res) => {
  const { userId, planDuration, customDays } = req.body;
  
  const genKey = crypto.randomBytes(8).toString('hex').toUpperCase();
  
  let days = 30;
  if (customDays && parseInt(customDays) > 0) {
    days = parseInt(customDays);
  } else {
    if (planDuration === '3 Months') days = 90;
    if (planDuration === '6 Months') days = 180;
    if (planDuration === '1 Year') days = 365;
  }

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);

  try {
    const usersRef = collection(db, 'users');
    await addDoc(usersRef, {
      user_id: userId,
      plan: customDays ? `${customDays} Days` : planDuration,
      key: genKey,
      expiry_date: expiryDate.toISOString(),
      is_active: 1,
      created_at: new Date().toISOString()
    });
    res.json({ success: true, key: genKey });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/upload-content', requireAdmin, express.json(), async (req, res) => {
  const { title, description, category, duration, mediaType, pcloudLink, thumbnailUrl } = req.body;
  
  if (!pcloudLink) {
    return res.status(400).json({ error: 'Media link is required' });
  }

  const mediaUrl = pcloudLink.includes('http') ? `/api/proxy-media?url=${encodeURIComponent(pcloudLink)}` : pcloudLink;
  const thumbUrl = thumbnailUrl ? (thumbnailUrl.includes('http') ? `/api/proxy-media?url=${encodeURIComponent(thumbnailUrl)}` : thumbnailUrl) : mediaUrl;

  try {
    await addDoc(collection(db, 'content'), {
      title,
      description,
      category,
      video_url: mediaUrl,
      thumbnail_url: thumbUrl,
      duration: duration || '',
      media_type: mediaType || 'Video',
      views: 0,
      is_active: 1,
      uploaded_at: new Date().toISOString()
    });
    res.json({ success: true });
  } catch (err: any) {
    console.error("Upload error:", err);
    res.status(500).json({ error: 'Server Error' });
  }
});

app.get('/api/admin/content', requireAdmin, async (req, res) => {
  try {
    const q = query(collection(db, 'content'));
    const snap = await getDocs(q);
    const content = snap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
    content.sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime());
    res.json({ success: true, data: content });
  } catch (err: any) {
    console.error("Fetch admin content error:", err);
    res.status(500).json({ error: 'Server Error' });
  }
});

app.delete('/api/admin/content/:id', requireAdmin, async (req, res) => {
  try {
    await deleteDoc(doc(db, 'content', req.params.id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

app.put('/api/admin/content/:id/toggle', requireAdmin, async (req, res) => {
  try {
    const docRef = doc(db, 'content', req.params.id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      await updateDoc(docRef, { is_active: snap.data().is_active === 1 ? 0 : 1 });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

app.post('/api/admin/toggle-lock', requireAdmin, async (req, res) => {
  const { locked } = req.body;
  try {
    await setDoc(doc(db, 'site_settings', 'site_locked'), { setting_value: locked ? 'true' : 'false' });
    res.json({ success: true, locked });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const q = query(collection(db, 'users'), orderBy('created_at', 'desc'));
    const snap = await getDocs(q);
    const users = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

app.post('/api/admin/users/:id/revoke', requireAdmin, async (req, res) => {
  try {
    await updateDoc(doc(db, 'users', req.params.id), { is_active: 0 });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

app.get('/api/admin/settings', requireAdmin, async (req, res) => {
  try {
    const settingsRef = doc(db, 'site_settings', 'site_locked');
    const snap = await getDoc(settingsRef);
    res.json({ success: true, locked: snap.exists() ? snap.data().setting_value === 'true' : false });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Vite & Static file serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Dynamically import vite
    const viteModule = 'vite';
    const { createServer: createViteServer } = await import(viteModule);
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
