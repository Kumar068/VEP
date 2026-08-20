// server/index.js
// ─────────────────────────────────────────────────────────────────────────────
// Express API server — Reels management backend
// Port: 3001  (Vite frontend proxies /api → this server in dev)
// ─────────────────────────────────────────────────────────────────────────────

import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ── Paths ────────────────────────────────────────────────────────────────────
const DATA_FILE   = path.join(__dirname, 'data', 'reels.json');
const UPLOAD_DIR  = path.join(__dirname, '..', 'public', 'content', 'reels');

// Ensure directories exist
fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ── JSON persistence helpers ──────────────────────────────────────────────────
function readReels() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeReels(reels) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(reels, null, 2));
}

// ── Multer — video uploads ────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename:    (_req,  file, cb) => {
    const ext  = path.extname(file.originalname);
    const safe = file.originalname
      .replace(/[^a-z0-9.\-_]/gi, '_')
      .toLowerCase()
      .replace(ext, '');
    cb(null, `${safe}_${Date.now()}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith('video/')) cb(null, true);
  else cb(new Error('Only video files are accepted'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB
});

// ── Express app ───────────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded videos in production (Vite serves public/ in dev)
app.use('/content/reels', express.static(UPLOAD_DIR));

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/reels — list all reels (newest first)
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/reels', (_req, res) => {
  const reels = readReels()
    .filter(r => r.visible !== false)
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  res.json(reels);
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/reels/all — list ALL reels (for admin, includes hidden)
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/reels/all', (_req, res) => {
  const reels = readReels()
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  res.json(reels);
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/reels — upload a new reel
// Body (multipart): file + title + category + tag + year + color
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/reels', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No video file provided' });
  }

  const { title, category, tag, year, color } = req.body;

  if (!title || !tag) {
    // Clean up orphaned file
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: 'title and tag are required' });
  }

  const reel = {
    id:          uuidv4(),
    title:       title.trim(),
    category:    (category || '').trim(),
    tag:         tag.trim().toUpperCase(),
    year:        year || new Date().getFullYear().toString(),
    color:       color || '#1152d4',
    videoSrc:    `/content/reels/${req.file.filename}`,
    filename:    req.file.filename,
    sizeBytes:   req.file.size,
    uploadedAt:  new Date().toISOString(),
    visible:     true,
  };

  const reels = readReels();
  reels.push(reel);
  writeReels(reels);

  res.status(201).json(reel);
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/reels/:id — update metadata (no re-upload)
// ─────────────────────────────────────────────────────────────────────────────
app.patch('/api/reels/:id', (req, res) => {
  const reels = readReels();
  const idx   = reels.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Reel not found' });

  const allowed = ['title', 'category', 'tag', 'year', 'color', 'visible'];
  allowed.forEach(key => {
    if (req.body[key] !== undefined) reels[idx][key] = req.body[key];
  });
  reels[idx].updatedAt = new Date().toISOString();

  writeReels(reels);
  res.json(reels[idx]);
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/reels/:id — remove metadata + video file
// ─────────────────────────────────────────────────────────────────────────────
app.delete('/api/reels/:id', (req, res) => {
  const reels = readReels();
  const idx   = reels.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Reel not found' });

  const [reel] = reels.splice(idx, 1);
  writeReels(reels);

  // Delete the video file if it exists
  if (reel.filename) {
    const filePath = path.join(UPLOAD_DIR, reel.filename);
    try { fs.unlinkSync(filePath); } catch { /* already gone */ }
  }

  res.json({ success: true, deleted: reel.id });
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[API Error]', err.message);
  res.status(500).json({ error: err.message });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🎬  Reels API running at http://localhost:${PORT}`);
  console.log(`    Upload dir : ${UPLOAD_DIR}`);
  console.log(`    Data file  : ${DATA_FILE}\n`);
});
