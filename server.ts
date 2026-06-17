import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- Database Setup ---
const db = new Database('database.sqlite');
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id BIGINT UNIQUE NOT NULL,
      username TEXT,
      plan TEXT,
      key TEXT UNIQUE NOT NULL,
      expiry_date TIMESTAMP NOT NULL,
      is_active BOOLEAN DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT,
      video_url TEXT NOT NULL,
      thumbnail_url TEXT,
      duration TEXT,
      views INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS site_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      setting_key TEXT UNIQUE NOT NULL,
      setting_value TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`);

// Initialize settings
const lockSetting = db.prepare('SELECT * FROM site_settings WHERE setting_key = ?').get('site_locked');
if (!lockSetting) {
  db.prepare('INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)').run('site_locked', 'false');
}

// Ensure uploads folder exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, crypto.randomBytes(8).toString('hex') + path.extname(file.originalname))
});
const upload = multer({ storage });

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(uploadsDir));

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

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

const checkSiteLock = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const isLocked = db.prepare('SELECT setting_value FROM site_settings WHERE setting_key = ?').get('site_locked') as any;
  if (isLocked?.setting_value === 'true') {
    return res.status(403).json({ error: 'Site is temporarily paused' });
  }
  next();
};

const requireUserKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authKey = req.headers['authorization']?.replace('Bearer ', '');
  if (!authKey) return res.status(401).json({ error: 'No key provided' });
  
  const user = db.prepare('SELECT * FROM users WHERE key = ?').get(authKey) as any;
  if (!user || user.is_active === 0) return res.status(401).json({ error: 'Token Revoked or Invalid Key' });
  
  if (new Date(user.expiry_date) < new Date()) {
    return res.status(401).json({ error: 'Key expired' });
  }
  
  (req as any).user = user;
  next();
};

// --- DB Seeding ---
const masterKey = 'tiger';
const masterUser = db.prepare('SELECT * FROM users WHERE key = ?').get(masterKey);
if (!masterUser) {
  const future = new Date();
  future.setFullYear(future.getFullYear() + 10);
  db.prepare('INSERT INTO users (user_id, plan, key, expiry_date) VALUES (?, ?, ?, ?)').run(999, 'Master Plan', masterKey, future.toISOString());
}

// --- API Endpoints ---
import https from 'https';

app.get('/api/proxy-media', (req, res) => {
  const targetUrl = req.query.url as string;
  if (!targetUrl) return res.status(400).send('Missing URL');
  
  if (targetUrl.includes('show?code=')) {
    // Attempt to scrape the direct link from the publink page
    https.get(targetUrl, (pageRes) => {
      let data = '';
      pageRes.on('data', chunk => data += chunk);
      pageRes.on('end', () => {
        const match = data.match(/"downloadlink":\s*"(.*?)"/i);
        if (match && match[1]) {
          const directUrl = match[1].replace(/\\\//g, '/');
            const headers: any = {};
            if (req.headers.range) headers.range = req.headers.range;
            
          // Proxy directly to avoid IP binding issues
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
    // If it's already a direct link
    const headers: any = {};
    if (req.headers.range) headers.range = req.headers.range;
    
    // Check if target is http or https
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
app.post('/api/verify-key', checkSiteLock, (req, res) => {
  const { key } = req.body;
  if (!key) return res.status(400).json({ error: 'Key required' });

  const user = db.prepare('SELECT * FROM users WHERE key = ?').get(key) as any;
  if (!user) return res.status(401).json({ error: 'Invalid key' });
  if (user.is_active === 0) return res.status(401).json({ error: 'Token Revoked' });
  if (new Date(user.expiry_date) < new Date()) return res.status(401).json({ error: 'Key expired' });

  res.json({ success: true, plan: user.plan, expiry: user.expiry_date });
});

app.get('/api/content', checkSiteLock, requireUserKey, (req, res) => {
  const content = db.prepare('SELECT * FROM content WHERE is_active = 1 ORDER BY id DESC').all();
  res.json({ success: true, data: content });
});

app.get('/api/content/:id', checkSiteLock, requireUserKey, (req, res) => {
  const content = db.prepare('SELECT * FROM content WHERE id = ? AND is_active = 1').get(req.params.id);
  if (!content) return res.status(404).json({ error: 'Content not found' });
  res.json({ success: true, data: content });
});

app.post('/api/content/:id/view', checkSiteLock, requireUserKey, (req, res) => {
  db.prepare('UPDATE content SET views = views + 1 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.get('/api/user-status', checkSiteLock, requireUserKey, (req, res) => {
  const user = (req as any).user;
  res.json({ success: true, data: user });
});

app.get('/api/site-status', (req, res) => {
  const lock = db.prepare('SELECT setting_value FROM site_settings WHERE setting_key = ?').get('site_locked') as any;
  res.json({ success: true, locked: lock?.setting_value === 'true' });
});

// Admin APIs
app.post('/api/admin/login', (req, res) => {
  if (req.body.password === ADMIN_PASSWORD) {
    const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/admin/logout', (req, res) => {
  res.json({ success: true });
});

app.post('/api/admin/generate-key', requireAdmin, (req, res) => {
  const { userId, planDuration } = req.body;
  
  const genKey = crypto.randomBytes(8).toString('hex').toUpperCase(); // 16 chars
  
  let days = 30;
  if (planDuration === '3 Months') days = 90;
  if (planDuration === '6 Months') days = 180;
  if (planDuration === '1 Year') days = 365;

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);

  try {
    const stmt = db.prepare('INSERT INTO users (user_id, plan, key, expiry_date) VALUES (?, ?, ?, ?)');
    stmt.run(userId, planDuration, genKey, expiryDate.toISOString());
    res.json({ success: true, key: genKey });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/upload-content', requireAdmin, express.json(), (req, res) => {
  const { title, description, category, duration, mediaType, pcloudLink, thumbnailUrl } = req.body;
  
  if (!pcloudLink) {
    return res.status(400).json({ error: 'pCloud link is required' });
  }

  // Pass it directly through our proxy or keep it as-is if it's not a link
  const mediaUrl = pcloudLink.includes('http') ? `/api/proxy-media?url=${encodeURIComponent(pcloudLink)}` : pcloudLink;
  const thumbUrl = thumbnailUrl ? (thumbnailUrl.includes('http') ? `/api/proxy-media?url=${encodeURIComponent(thumbnailUrl)}` : thumbnailUrl) : mediaUrl;

  const stmt = db.prepare('INSERT INTO content (title, description, category, video_url, thumbnail_url, duration, media_type) VALUES (?, ?, ?, ?, ?, ?, ?)');
  stmt.run(title, description, category, mediaUrl, thumbUrl, duration || '', mediaType || 'Video');
  
  res.json({ success: true });
});

app.get('/api/admin/content', requireAdmin, (req, res) => {
  const content = db.prepare('SELECT * FROM content ORDER BY uploaded_at DESC').all();
  res.json({ success: true, data: content });
});

app.delete('/api/admin/content/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM content WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.put('/api/admin/content/:id/toggle', requireAdmin, (req, res) => {
  db.prepare('UPDATE content SET is_active = NOT is_active WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.post('/api/admin/toggle-lock', requireAdmin, (req, res) => {
  const { locked } = req.body;
  db.prepare('UPDATE site_settings SET setting_value = ? WHERE setting_key = ?').run(locked ? 'true' : 'false', 'site_locked');
  res.json({ success: true, locked });
});

app.get('/api/admin/users', requireAdmin, (req, res) => {
  const users = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
  res.json({ success: true, data: users });
});

app.post('/api/admin/users/:id/revoke', requireAdmin, (req, res) => {
  db.prepare('UPDATE users SET is_active = 0 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.get('/api/admin/settings', requireAdmin, (req, res) => {
  const lock = db.prepare('SELECT setting_value FROM site_settings WHERE setting_key = ?').get('site_locked') as any;
  res.json({ success: true, locked: lock?.setting_value === 'true' });
});

// Vite & Static file serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
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

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
