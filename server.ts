import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import firebaseConfig from './firebase-applet-config.json';

dotenv.config();

if (!getApps().length) {
  initializeApp({
    projectId: firebaseConfig.projectId,
  });
}
const adminAuth = getAuth();

const app = express();
const PORT = 3000;
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

app.use(express.json({ limit: '20mb' }));
app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '7d' }));

// Rate limiters
const enquiryRateMap = new Map<string, number[]>();
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX_REQUESTS = 10;

const authRateMap = new Map<string, number[]>();
const AUTH_RATE_WINDOW_MS = 15 * 60 * 1000;
const AUTH_RATE_MAX_REQUESTS = 20;

function checkAuthRateLimit(req: express.Request, res: express.Response): boolean {
  const clientIp =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    'unknown';
  const now = Date.now();
  const recent = (authRateMap.get(clientIp) || []).filter((ts) => now - ts < AUTH_RATE_WINDOW_MS);
  if (recent.length >= AUTH_RATE_MAX_REQUESTS) {
    res.status(429).json({
      error: 'Too many authentication attempts. Please wait 15 minutes and try again.',
    });
    return false;
  }
  recent.push(now);
  authRateMap.set(clientIp, recent);
  return true;
}

// Strict single-admin credential verification
const ADMIN_EMAIL = 'charvisolarenergy@gmail.com';
// Salted scrypt hash for configured administrator password
const DEFAULT_ADMIN_SCRYPT =
  'be2693d3d364da388f52e0a6cfa47641:b87074db2a71eb4bbe96c3315103b7d3135e37251d2284b348b39dcf7c9d3454a094d4ccfa04abc2fd75de8313c74c3430a48840b7c905a3582b0ba89612ba15';
const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  crypto
    .createHash('sha256')
    .update(`${firebaseConfig.projectId}:${firebaseConfig.apiKey}:charvi-admin-session`)
    .digest('hex');

function verifyAdminPassword(candidate: string): boolean {
  if (process.env.ADMIN_PASSWORD) {
    const a = Buffer.from(candidate, 'utf8');
    const b = Buffer.from(process.env.ADMIN_PASSWORD, 'utf8');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  }
  const [salt, expectedHex] = DEFAULT_ADMIN_SCRYPT.split(':');
  const derived = crypto.scryptSync(candidate, salt, 64);
  const expected = Buffer.from(expectedHex, 'hex');
  return derived.length === expected.length && crypto.timingSafeEqual(derived, expected);
}

function issueAdminSessionToken(email: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      email,
      iat: Date.now(),
      exp: Date.now() + 12 * 60 * 60 * 1000,
    }),
    'utf8'
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `cts_adm.${payload}.${sig}`;
}

function verifyAdminSessionToken(token: string): { email: string } | null {
  if (!token.startsWith('cts_adm.')) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [, payload, sig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');
  const a = Buffer.from(sig, 'utf8');
  const b = Buffer.from(expectedSig, 'utf8');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      email?: string;
      exp?: number;
    };
    if (!decoded.exp || Date.now() > decoded.exp) return null;
    if (decoded.email?.toLowerCase() !== ADMIN_EMAIL) return null;
    return { email: ADMIN_EMAIL };
  } catch {
    return null;
  }
}

async function requireAdmin(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing bearer token' });
  }
  const token = authHeader.slice(7);

  // 1. Check server-issued HMAC admin session token
  const session = verifyAdminSessionToken(token);
  if (session) {
    (req as express.Request & { adminEmail?: string }).adminEmail = session.email;
    return next();
  }

  // 2. Or check verified Firebase ID token for the single authorized admin email
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    if (!decoded.email || !decoded.email_verified || decoded.email.toLowerCase() !== ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Forbidden: Only authorized administrator permitted' });
    }
    (req as express.Request & { adminEmail?: string }).adminEmail = decoded.email;
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired session' });
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'charvi-solar-epc' });
});

app.get('/api/public-config', (_req, res) => {
  res.json({
    googleMapsApiKey:
      process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '',
    appUrl: process.env.APP_URL || '',
  });
});

// Step 1: Strictly verify admin email before revealing password field
app.post('/api/admin/verify-email', (req, res) => {
  if (!checkAuthRateLimit(req, res)) return;
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ ok: false, allowed: false, error: 'Please enter an email address.' });
  }
  if (email !== ADMIN_EMAIL) {
    return res.status(403).json({
      ok: false,
      allowed: false,
      error: 'Access Denied: This email is not authorized for the administrator panel.',
    });
  }
  return res.json({ ok: true, allowed: true, email: ADMIN_EMAIL });
});

// Step 2: Verify admin email + password and issue signed session token
app.post('/api/admin/login', (req, res) => {
  if (!checkAuthRateLimit(req, res)) return;
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  if (email !== ADMIN_EMAIL) {
    return res.status(403).json({
      ok: false,
      error: 'Access Denied: Only the authorized administrator email is permitted.',
    });
  }
  if (!password || !verifyAdminPassword(password)) {
    return res.status(401).json({
      ok: false,
      error: 'Invalid password. Please check your credentials and try again.',
    });
  }
  const token = issueAdminSessionToken(ADMIN_EMAIL);
  return res.json({ ok: true, email: ADMIN_EMAIL, token });
});

// Verify active admin session token
app.get('/api/admin/session', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false });
  }
  const session = verifyAdminSessionToken(authHeader.slice(7));
  if (!session) {
    return res.status(401).json({ ok: false });
  }
  return res.json({ ok: true, email: session.email });
});

// Rate-limited, spam-checked enquiry notification / validation endpoint
app.post('/api/enquiries/notify', async (req, res) => {
  const clientIp =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    'unknown';
  const now = Date.now();
  const recent = (enquiryRateMap.get(clientIp) || []).filter((ts) => now - ts < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX_REQUESTS) {
    return res.status(429).json({
      error: 'Too many requests submitted. Please wait a few minutes or call our branch directly.',
    });
  }
  recent.push(now);
  enquiryRateMap.set(clientIp, recent);

  const { honeypot, enquiryCode, customerName, mobile, city, propertyType, systemType } =
    req.body || {};

  // Honeypot spam trap
  if (honeypot && String(honeypot).trim().length > 0) {
    return res.status(400).json({ error: 'Invalid submission.' });
  }

  if (!customerName || !mobile || !city || !propertyType || !systemType) {
    return res.status(400).json({ error: 'Required fields missing.' });
  }

  // Optional webhook trigger for real admin email notifications
  const webhookUrl = process.env.ENQUIRY_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: ADMIN_EMAIL,
          subject: `New Solar Enquiry ${enquiryCode || ''} — ${customerName} (${city})`,
          payload: req.body,
        }),
      });
    } catch (err) {
      console.warn('Enquiry webhook notification failed:', err);
    }
  }

  res.json({ ok: true });
});

// Admin-authenticated media upload (Images, MP4 videos, PDF datasheets)
const ALLOWED_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'video/mp4': '.mp4',
  'application/pdf': '.pdf',
};

app.post('/api/media/upload', requireAdmin, (req, res) => {
  const { filename, mimeType, base64Data } = req.body || {};
  if (!filename || !mimeType || !base64Data) {
    return res.status(400).json({ error: 'Missing filename, mimeType, or file data.' });
  }
  const ext = ALLOWED_MIME[String(mimeType).toLowerCase()];
  if (!ext) {
    return res.status(400).json({
      error: 'Unsupported file format. Allowed: JPG, PNG, WebP, MP4, PDF.',
    });
  }
  const cleanBaseName = String(filename)
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 60);
  const rawBase64 = String(base64Data).includes(',')
    ? String(base64Data).split(',')[1]
    : String(base64Data);
  const buffer = Buffer.from(rawBase64, 'base64');
  if (buffer.length === 0 || buffer.length > 15 * 1024 * 1024) {
    return res.status(400).json({ error: 'File must be between 1 byte and 15 MB.' });
  }

  const finalName = `${cleanBaseName || 'asset'}_${Date.now()}${ext}`;
  const targetPath = path.join(UPLOADS_DIR, finalName);
  fs.writeFileSync(targetPath, buffer);

  res.json({
    ok: true,
    url: `/uploads/${finalName}`,
    sizeBytes: buffer.length,
    filename: finalName,
  });
});

app.delete('/api/media/file', requireAdmin, (req, res) => {
  const { url } = req.body || {};
  if (typeof url === 'string' && url.startsWith('/uploads/')) {
    const fileName = path.basename(url);
    const fullPath = path.join(UPLOADS_DIR, fileName);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
  res.json({ ok: true });
});

// Dynamic XML Sitemap
const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/services',
  '/residential-solar',
  '/commercial-solar',
  '/industrial-solar',
  '/on-grid-solar',
  '/off-grid-solar',
  '/hybrid-solar',
  '/pm-surya-ghar-subsidy',
  '/projects',
  '/products',
  '/reviews',
  '/faq',
  '/contact',
  '/get-quote',
  '/meerut-solar',
  '/aligarh-solar',
  '/privacy-policy',
  '/terms-and-conditions',
];

app.get('/sitemap.xml', (req, res) => {
  const baseUrl =
    process.env.APP_URL || `${req.protocol}://${req.get('host') || 'localhost:3000'}`;
  const urls = PUBLIC_ROUTES.map(
    (route) => `  <url>
    <loc>${baseUrl.replace(/\/$/, '')}${route}</loc>
    <changefreq>${route === '/' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`
  ).join('\n');
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`);
});

app.get('/robots.txt', (req, res) => {
  const baseUrl =
    process.env.APP_URL || `${req.protocol}://${req.get('host') || 'localhost:3000'}`;
  res.type('text/plain').send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${baseUrl.replace(/\/$/, '')}/sitemap.xml`);
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Charvi Technologies and Services server listening on port ${PORT}`);
  });
}

startServer();
