/**
 * AdminPage.tsx
 * ──────────────────────────────────────────────────────────────────────────────
 * Backend admin dashboard at /admin.
 * Features: upload form (drag-and-drop + file picker), reel grid with
 * thumbnail preview, inline edit panel, delete with confirmation, visibility
 * toggle.
 * ──────────────────────────────────────────────────────────────────────────────
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReelData } from '../types';
import { getReels, uploadReel, updateReel, deleteReel } from '../services/reelsService';

// ─────────────────────────────────────────────────────────────────────────────
// Accent palette — quick color picker swatches
// ─────────────────────────────────────────────────────────────────────────────

const ACCENT_SWATCHES = [
  '#1152d4', '#f74a4a', '#00c896', '#9b59b6',
  '#f39c12', '#1abc9c', '#e74c3c', '#ff6b9d',
  '#a78bfa', '#34d399', '#fb923c', '#60a5fa',
];

const CATEGORY_OPTIONS = [
  'EDITING / COLOR GRADING',
  'VFX / MOTION DESIGN',
  'SOUND DESIGN / EDIT',
  'COLOR GRADING',
  'NARRATIVE / EDIT',
  'MOTION DESIGN',
  'VFX / COMPOSITING',
];

const TAG_OPTIONS = [
  'COMMERCIAL', 'MUSIC VIDEO', 'SHORT FILM', 'DOCUMENTARY',
  'BRAND FILM', 'ART FILM', 'FEATURE', 'DOCU', 'SCI-FI',
  'EXPERIMENTAL', 'DIGITAL', 'NARRATIVE',
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Upload Form
// ─────────────────────────────────────────────────────────────────────────────

interface UploadFormProps {
  onUploaded: () => void;
}

function UploadForm({ onUploaded }: UploadFormProps) {
  const [file, setFile]           = useState<File | null>(null);
  const [title, setTitle]         = useState('');
  const [category, setCategory]   = useState(CATEGORY_OPTIONS[0]);
  const [tag, setTag]             = useState(TAG_OPTIONS[0]);
  const [year, setYear]           = useState(new Date().getFullYear().toString());
  const [color, setColor]         = useState('#1152d4');
  const [dragging, setDragging]   = useState(false);
  const [progress, setProgress]   = useState(0);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess]     = useState(false);
  const [err, setErr]             = useState<string | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptFile = (f: File) => {
    if (!f.type.startsWith('video/')) { setErr('Please select a video file.'); return; }
    setFile(f);
    setErr(null);
    // Pre-fill title from filename (strip extension)
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' '));
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) acceptFile(f);
  }, [title]); // eslint-disable-line

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) { setErr('Title and video file are required.'); return; }

    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', title.trim());
    fd.append('category', category);
    fd.append('tag', tag);
    fd.append('year', year);
    fd.append('color', color);

    setUploading(true);
    setErr(null);
    try {
      await uploadReel(fd, (pct) => setProgress(pct));
      setSuccess(true);
      setFile(null); setTitle(''); setProgress(0);
      setTimeout(() => { setSuccess(false); onUploaded(); }, 1800);
    } catch (e: any) {
      setErr(e.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={submit} id="upload-form">
      <h2 style={styles.sectionTitle}>Upload New Reel</h2>

      {/* Drop zone */}
      <div
        ref={dropRef}
        id="drop-zone"
        style={{
          ...styles.dropZone,
          borderColor: dragging ? '#1152d4' : file ? '#00c896' : 'rgba(255,255,255,0.1)',
          background: dragging ? 'rgba(17,82,212,0.07)' : file ? 'rgba(0,200,150,0.05)' : 'rgba(255,255,255,0.02)',
        }}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept="video/*" style={{ display: 'none' }}
          onChange={e => { if (e.target.files?.[0]) acceptFile(e.target.files[0]); }} />

        {file ? (
          <div style={{ textAlign: 'center' }}>
            <div style={styles.fileIcon}>🎬</div>
            <p style={{ ...styles.mono, color: '#00c896', margin: '0.5rem 0 0.2rem' }}>{file.name}</p>
            <p style={{ ...styles.mono, color: 'rgba(255,255,255,0.3)', fontSize: '9px' }}>
              {formatBytes(file.size)} · Click to change
            </p>
          </div>
        ) : (
          <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
            <div style={styles.fileIcon}>⬆</div>
            <p style={{ ...styles.mono, color: 'rgba(255,255,255,0.4)', margin: '0.5rem 0 0.2rem' }}>
              Drag & drop video here
            </p>
            <p style={{ ...styles.mono, color: 'rgba(255,255,255,0.2)', fontSize: '9px' }}>
              or click to browse · max 500 MB · mp4 / webm / mov
            </p>
          </div>
        )}
      </div>

      {/* Metadata fields */}
      <div style={styles.fieldGrid}>
        <label style={styles.label}>
          Title *
          <input id="field-title" style={styles.input} value={title}
            onChange={e => setTitle(e.target.value)} placeholder="Untitled Reel" required />
        </label>

        <label style={styles.label}>
          Year
          <input id="field-year" style={styles.input} value={year}
            onChange={e => setYear(e.target.value)} maxLength={4} placeholder="2025" />
        </label>

        <label style={{ ...styles.label, gridColumn: '1 / -1' }}>
          Category
          <select id="field-category" style={styles.select} value={category}
            onChange={e => setCategory(e.target.value)}>
            {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>

        <label style={styles.label}>
          Tag
          <select id="field-tag" style={styles.select} value={tag}
            onChange={e => setTag(e.target.value)}>
            {TAG_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>

        <label style={styles.label}>
          Accent Color
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
            {ACCENT_SWATCHES.map(c => (
              <button key={c} type="button"
                onClick={() => setColor(c)}
                style={{
                  width: 22, height: 22, borderRadius: 4, background: c, border: 'none',
                  cursor: 'pointer', outline: color === c ? `2px solid ${c}` : '2px solid transparent',
                  outlineOffset: 2, transition: 'outline 0.15s',
                }} />
            ))}
            <input type="color" value={color} onChange={e => setColor(e.target.value)}
              style={{ width: 22, height: 22, border: 'none', background: 'none',
                cursor: 'pointer', padding: 0, borderRadius: 4 }} />
          </div>
        </label>
      </div>

      {/* Progress bar */}
      {uploading && (
        <div style={{ margin: '1rem 0', background: 'rgba(255,255,255,0.06)',
          borderRadius: 4, overflow: 'hidden', height: 4 }}>
          <div style={{ height: '100%', width: `${progress}%`,
            background: 'linear-gradient(to right, #1152d4, #00c896)',
            transition: 'width 0.2s' }} />
        </div>
      )}

      {/* Feedback */}
      {err && <p style={{ ...styles.mono, color: '#f74a4a', margin: '0.5rem 0', fontSize: '10px' }}>⚠ {err}</p>}
      {success && <p style={{ ...styles.mono, color: '#00c896', margin: '0.5rem 0', fontSize: '10px' }}>✓ Uploaded successfully!</p>}

      <button id="submit-upload" type="submit" disabled={uploading} style={{
        ...styles.btn, background: '#1152d4',
        opacity: uploading ? 0.6 : 1, cursor: uploading ? 'not-allowed' : 'pointer',
        marginTop: '1rem', width: '100%',
      }}>
        {uploading ? `Uploading… ${progress}%` : 'Upload Reel'}
      </button>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Edit Panel (slide-in)
// ─────────────────────────────────────────────────────────────────────────────

interface EditPanelProps {
  reel: ReelData;
  onClose: () => void;
  onSaved: () => void;
}

function EditPanel({ reel, onClose, onSaved }: EditPanelProps) {
  const [title, setTitle]       = useState(reel.title);
  const [category, setCategory] = useState(reel.category);
  const [tag, setTag]           = useState(reel.tag);
  const [year, setYear]         = useState(reel.year);
  const [color, setColor]       = useState(reel.color);
  const [visible, setVisible]   = useState(reel.visible);
  const [saving, setSaving]     = useState(false);
  const [err, setErr]           = useState<string | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      await updateReel(reel.id, { title, category, tag, year, color, visible });
      onSaved();
      onClose();
    } catch (e: any) {
      setErr(e.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
      {/* Backdrop */}
      <div onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />

      {/* Panel */}
      <div style={{ position: 'relative', width: '420px', height: '100vh',
        background: '#0a0a0f', borderLeft: '1px solid rgba(255,255,255,0.08)',
        padding: '2rem', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ ...styles.mono, color: '#fff', fontSize: '11px', letterSpacing: '0.3em',
            textTransform: 'uppercase', margin: 0 }}>Edit Reel</h3>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
              fontSize: '18px', cursor: 'pointer', padding: 0 }}>✕</button>
        </div>

        {/* Video preview */}
        <video src={reel.videoSrc} muted loop autoPlay playsInline
          style={{ width: '100%', aspectRatio: '9/16', objectFit: 'cover',
            borderRadius: 4, marginBottom: '1.5rem', background: '#111' }} />

        <form onSubmit={save}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={styles.label}>
              Title
              <input style={styles.input} value={title} onChange={e => setTitle(e.target.value)} />
            </label>
            <label style={styles.label}>
              Category
              <select style={styles.select} value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORY_OPTIONS.map(c => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label style={styles.label}>
              Tag
              <select style={styles.select} value={tag} onChange={e => setTag(e.target.value)}>
                {TAG_OPTIONS.map(t => <option key={t}>{t}</option>)}
              </select>
            </label>
            <label style={styles.label}>
              Year
              <input style={styles.input} value={year} onChange={e => setYear(e.target.value)} maxLength={4} />
            </label>

            <label style={styles.label}>
              Accent Color
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                {ACCENT_SWATCHES.map(c => (
                  <button key={c} type="button" onClick={() => setColor(c)}
                    style={{ width: 22, height: 22, borderRadius: 4, background: c,
                      border: 'none', cursor: 'pointer',
                      outline: color === c ? `2px solid ${c}` : '2px solid transparent',
                      outlineOffset: 2 }} />
                ))}
                <input type="color" value={color} onChange={e => setColor(e.target.value)}
                  style={{ width: 22, height: 22, border: 'none', background: 'none',
                    cursor: 'pointer', padding: 0, borderRadius: 4 }} />
              </div>
            </label>

            {/* Visibility toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <div
                onClick={() => setVisible(v => !v)}
                style={{
                  width: 36, height: 20, borderRadius: 10, position: 'relative',
                  background: visible ? '#1152d4' : 'rgba(255,255,255,0.1)',
                  transition: 'background 0.2s', cursor: 'pointer',
                }}>
                <div style={{
                  position: 'absolute', top: 2, left: visible ? 18 : 2,
                  width: 16, height: 16, borderRadius: '50%', background: '#fff',
                  transition: 'left 0.2s',
                }} />
              </div>
              <span style={{ ...styles.mono, fontSize: '10px', color: 'rgba(255,255,255,0.6)' }}>
                {visible ? 'Visible in galaxy' : 'Hidden from galaxy'}
              </span>
            </label>
          </div>

          {err && <p style={{ ...styles.mono, color: '#f74a4a', fontSize: '10px', margin: '0.75rem 0 0' }}>⚠ {err}</p>}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="submit" disabled={saving} style={{ ...styles.btn, background: '#1152d4', flex: 1 }}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <button type="button" onClick={onClose}
              style={{ ...styles.btn, background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)', flex: 1 }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Reel Card (grid item)
// ─────────────────────────────────────────────────────────────────────────────

interface ReelCardProps {
  reel: ReelData;
  onEdit: (r: ReelData) => void;
  onDelete: (id: string) => void;
  onToggleVisible: (r: ReelData) => void;
}

function ReelCard({ reel, onEdit, onDelete, onToggleVisible }: ReelCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div id={`reel-card-${reel.id}`}
      style={{ background: '#0d0d14', border: `1px solid rgba(255,255,255,${reel.visible ? '0.08' : '0.04'})`,
        borderRadius: 6, overflow: 'hidden', position: 'relative',
        opacity: reel.visible ? 1 : 0.5, transition: 'opacity 0.3s' }}>

      {/* Accent bar */}
      <div style={{ height: 2, background: reel.color }} />

      {/* Video preview (9:16 thumbnail) */}
      <div style={{ position: 'relative', aspectRatio: '9/16', overflow: 'hidden', background: '#090912' }}>
        <video ref={videoRef} src={reel.videoSrc} muted preload="metadata"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onLoadedMetadata={e => { (e.target as HTMLVideoElement).currentTime = 1; }}
        />
        {/* Tag badge */}
        <div style={{ position: 'absolute', top: 8, left: 8, background: reel.color,
          padding: '2px 8px', borderRadius: 2 }}>
          <span style={{ ...styles.mono, fontSize: '7px', color: '#fff' }}>{reel.tag}</span>
        </div>
        {!reel.visible && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
            justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
            <span style={{ ...styles.mono, fontSize: '9px', color: 'rgba(255,255,255,0.4)',
              letterSpacing: '0.2em', textTransform: 'uppercase' }}>Hidden</span>
          </div>
        )}
      </div>

      {/* Meta */}
      <div style={{ padding: '0.75rem' }}>
        <p style={{ margin: '0 0 0.2rem', fontWeight: 700, fontSize: '12px', color: '#fff',
          textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.2 }}>
          {reel.title}
        </p>
        <p style={{ ...styles.mono, fontSize: '8px', color: 'rgba(255,255,255,0.3)',
          margin: '0 0 0.1rem' }}>
          {reel.category}
        </p>
        <p style={{ ...styles.mono, fontSize: '8px', color: 'rgba(255,255,255,0.2)', margin: 0 }}>
          {reel.year} · {formatBytes(reel.sizeBytes ?? 0)}
        </p>
        <p style={{ ...styles.mono, fontSize: '7px', color: 'rgba(255,255,255,0.15)', margin: '0.3rem 0 0' }}>
          Uploaded {formatDate(reel.uploadedAt)}
        </p>

        {/* Action row */}
        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem' }}>
          <button onClick={() => onEdit(reel)} style={{ ...styles.cardBtn, flex: 1 }}>Edit</button>
          <button onClick={() => onToggleVisible(reel)}
            style={{ ...styles.cardBtn, flex: 1, color: reel.visible ? '#f39c12' : '#00c896' }}>
            {reel.visible ? 'Hide' : 'Show'}
          </button>
          {confirmDelete ? (
            <>
              <button onClick={() => onDelete(reel.id)}
                style={{ ...styles.cardBtn, color: '#f74a4a', border: '1px solid rgba(247,74,74,0.4)' }}>
                Confirm
              </button>
              <button onClick={() => setConfirmDelete(false)} style={styles.cardBtn}>✕</button>
            </>
          ) : (
            <button onClick={() => setConfirmDelete(true)}
              style={{ ...styles.cardBtn, color: '#f74a4a' }}>Delete</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin Page root
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const navigate = useNavigate();
  const [reels, setReels]           = useState<ReelData[]>([]);
  const [loading, setLoading]       = useState(true);
  const [editingReel, setEditingReel] = useState<ReelData | null>(null);
  const [search, setSearch]         = useState('');

  const fetchReels = async () => {
    try {
      const data = await getReels(true);
      setReels(data);
    } catch { /* noop */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReels(); }, []);

  const handleDelete = async (id: string) => {
    await deleteReel(id);
    setReels(prev => prev.filter(r => r.id !== id));
  };

  const handleToggleVisible = async (reel: ReelData) => {
    const updated = await updateReel(reel.id, { visible: !reel.visible });
    setReels(prev => prev.map(r => r.id === updated.id ? updated : r));
  };

  const filtered = reels.filter(r =>
    !search ||
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.tag.toLowerCase().includes(search.toLowerCase()) ||
    r.category.toLowerCase().includes(search.toLowerCase()),
  );

  const visibleCount = reels.filter(r => r.visible).length;

  return (
    <div style={{ minHeight: '100vh', background: '#050508', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>

      {/* Top Bar */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '1rem 2rem', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', position: 'sticky', top: 0,
        background: '#050508', zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
              cursor: 'pointer', ...styles.mono, fontSize: '10px', letterSpacing: '0.2em',
              textTransform: 'uppercase', padding: 0 }}>
            ← Home
          </button>
          <span style={{ color: 'rgba(255,255,255,0.12)' }}>|</span>
          <span style={{ ...styles.mono, fontSize: '10px', letterSpacing: '0.3em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
            Reels Admin
          </span>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <Stat label="Total" value={reels.length} />
          <Stat label="Visible" value={visibleCount} accent="#00c896" />
          <Stat label="Hidden" value={reels.length - visibleCount} accent="#f39c12" />
        </div>

        <button onClick={() => navigate('/projects')}
          style={{ ...styles.btn, background: 'rgba(17,82,212,0.15)',
            border: '1px solid rgba(17,82,212,0.4)', color: '#60a5fa', fontSize: '9px' }}>
          View Galaxy →
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr',
        minHeight: 'calc(100vh - 61px)' }}>

        {/* Left: Upload Form */}
        <aside style={{ borderRight: '1px solid rgba(255,255,255,0.07)',
          padding: '2rem', overflowY: 'auto', maxHeight: 'calc(100vh - 61px)', position: 'sticky', top: 61 }}>
          <UploadForm onUploaded={fetchReels} />
        </aside>

        {/* Right: Reel Grid */}
        <main style={{ padding: '2rem', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '1.5rem', gap: '1rem' }}>
            <h2 style={styles.sectionTitle}>All Reels</h2>
            <input
              id="search-reels"
              placeholder="Search title, tag, category…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...styles.input, width: '260px', margin: 0 }}
            />
          </div>

          {loading ? (
            <div style={{ ...styles.mono, color: 'rgba(255,255,255,0.3)', fontSize: '10px',
              letterSpacing: '0.2em', textTransform: 'uppercase', padding: '3rem 0' }}>
              Loading…
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ ...styles.mono, color: 'rgba(255,255,255,0.2)', fontSize: '10px',
              letterSpacing: '0.2em', textTransform: 'uppercase', padding: '3rem 0' }}>
              {search ? 'No reels match your search.' : 'No reels yet. Upload your first one →'}
            </div>
          ) : (
            <div style={{ display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: '1rem' }}>
              {filtered.map(r => (
                <ReelCard
                  key={r.id}
                  reel={r}
                  onEdit={setEditingReel}
                  onDelete={handleDelete}
                  onToggleVisible={handleToggleVisible}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Edit Panel */}
      {editingReel && (
        <EditPanel
          reel={editingReel}
          onClose={() => setEditingReel(null)}
          onSaved={fetchReels}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tiny stat widget for the header
// ─────────────────────────────────────────────────────────────────────────────

function Stat({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '18px', fontWeight: 900, color: accent ?? '#fff', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ ...styles.mono, fontSize: '7px', letterSpacing: '0.25em',
        textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>
        {label}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared micro-styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = {
  mono: {
    fontFamily: 'monospace',
  } as React.CSSProperties,

  sectionTitle: {
    fontFamily: 'monospace',
    fontSize: '10px',
    letterSpacing: '0.35em',
    textTransform: 'uppercase' as const,
    color: 'rgba(255,255,255,0.35)',
    margin: '0 0 1.5rem',
  } as React.CSSProperties,

  dropZone: {
    border: '1px dashed',
    borderRadius: 6,
    padding: '2.5rem 1.5rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
    transition: 'all 0.25s',
    minHeight: 140,
  } as React.CSSProperties,

  fileIcon: {
    fontSize: '2rem',
    lineHeight: 1,
  } as React.CSSProperties,

  fieldGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  } as React.CSSProperties,

  label: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.4rem',
    fontFamily: 'monospace',
    fontSize: '9px',
    letterSpacing: '0.25em',
    textTransform: 'uppercase' as const,
    color: 'rgba(255,255,255,0.35)',
  } as React.CSSProperties,

  input: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 4,
    color: '#fff',
    fontFamily: 'monospace',
    fontSize: '12px',
    padding: '0.55rem 0.75rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,

  select: {
    background: '#0d0d18',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 4,
    color: '#fff',
    fontFamily: 'monospace',
    fontSize: '11px',
    padding: '0.55rem 0.75rem',
    outline: 'none',
    width: '100%',
    cursor: 'pointer',
  } as React.CSSProperties,

  btn: {
    fontFamily: 'monospace',
    fontSize: '10px',
    letterSpacing: '0.2em',
    textTransform: 'uppercase' as const,
    border: 'none',
    borderRadius: 4,
    padding: '0.65rem 1.4rem',
    cursor: 'pointer',
    color: '#fff',
    transition: 'opacity 0.2s',
  } as React.CSSProperties,

  cardBtn: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 3,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'monospace',
    fontSize: '8px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase' as const,
    padding: '0.35rem 0.5rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  } as React.CSSProperties,
};
