/**
 * Renders a 1080×1920 result card (Instagram Story size) on a canvas.
 * Everything is drawn by hand so the card looks identical on the web and in the APK.
 */
import type { FeedbackStatus } from '@/types';
import { DEVELOPER } from '@/utils/external';

export interface ShareCardData {
  /** Small line above the headline, e.g. "Daily mystery #21". */
  eyebrow: string;
  /** Big line, e.g. "Solved in 3/6". */
  headline: string;
  won: boolean;
  score: number;
  /** One line under the score, e.g. "3 guesses · 2 clues". */
  detail: string;
  /** Feedback grid rows (5 cells each). */
  rows?: FeedbackStatus[][];
  /** Simple result tiles for modes without a feedback grid. */
  tiles?: ('hit' | 'miss' | 'empty')[];
  /** Only shown when the player chose to include it (spoiler). */
  reveal?: string;
  cta: string;
}

const W = 1080;
const H = 1920;
const MINT = '#4be3a0';
const GOLD = '#f4c95d';
const RED = '#ff7a7a';
const INK = '#f2fbf6';
const MUTED = 'rgba(226, 244, 235, 0.62)';
const DISPLAY = '"Bricolage Grotesque Variable", "Geist Variable", system-ui, sans-serif';
const SANS = '"Geist Variable", system-ui, sans-serif';

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 100 100">
<defs>
<radialGradient id="bg" cx="28%" cy="18%" r="95%"><stop offset="0" stop-color="#2c7d5a"/><stop offset="0.45" stop-color="#0f2c21"/><stop offset="1" stop-color="#06100d"/></radialGradient>
<radialGradient id="lens" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff" stop-opacity="0.3"/><stop offset="0.55" stop-color="#bff5dc" stop-opacity="0.1"/><stop offset="1" stop-color="#4be3a0" stop-opacity="0.16"/></radialGradient>
<linearGradient id="ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.95"/><stop offset="0.5" stop-color="#d9f7ea" stop-opacity="0.55"/><stop offset="1" stop-color="#fff" stop-opacity="0.25"/></linearGradient>
<linearGradient id="handle" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8ff7c9"/><stop offset="1" stop-color="#21a56d"/></linearGradient>
<clipPath id="clip"><circle cx="44" cy="44" r="23"/></clipPath>
</defs>
<rect width="100" height="100" rx="24" fill="url(#bg)"/>
<rect x="57" y="64" width="34" height="12" rx="6" transform="rotate(45 57 64)" fill="url(#handle)"/>
<rect x="60" y="64.5" width="24" height="3" rx="1.5" transform="rotate(45 57 64)" fill="#fff" opacity="0.45"/>
<g clip-path="url(#clip)">
<circle cx="44" cy="44" r="23" fill="#0b2219" opacity="0.55"/>
<g stroke="#e9fff5" stroke-opacity="0.85" stroke-width="1.8" fill="none" stroke-linejoin="round">
<path d="M44 35.5l8.1 5.9-3.1 9.5h-10l-3.1-9.5z" fill="#e9fff5" fill-opacity="0.9"/>
<path d="M44 35.5V24M52.1 41.4l11-3.6M49 50.9l6.8 9.3M39 50.9l-6.8 9.3M35.9 41.4l-11-3.6"/>
<path d="M44 24l-9 -3M44 24l9 -3M63.1 37.8l2.5-9.3M63.1 37.8l7 6.2M55.8 60.2l9.2 1M55.8 60.2l-2 9M32.2 60.2l-9.2 1M32.2 60.2l2 9M24.9 37.8l-2.5-9.3M24.9 37.8l-7 6.2"/>
</g>
<circle cx="44" cy="44" r="23" fill="url(#lens)"/>
<ellipse cx="35" cy="33" rx="11" ry="6.5" transform="rotate(-35 35 33)" fill="#fff" opacity="0.28"/>
</g>
<circle cx="44" cy="44" r="25.5" fill="none" stroke="url(#ring)" stroke-width="5"/>
</svg>`;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Shrinks the font until the text fits the width. */
function fitText(ctx: CanvasRenderingContext2D, text: string, weight: number, size: number, family: string, maxW: number): number {
  let s = size;
  ctx.font = `${weight} ${s}px ${family}`;
  while (ctx.measureText(text).width > maxW && s > 20) {
    s -= 4;
    ctx.font = `${weight} ${s}px ${family}`;
  }
  return s;
}

async function ensureFonts() {
  if (typeof document === 'undefined' || !document.fonts) return;
  try {
    await Promise.all([
      document.fonts.load(`800 120px "Bricolage Grotesque Variable"`),
      document.fonts.load(`600 40px "Geist Variable"`),
    ]);
  } catch {
    /* system font fallback is fine */
  }
}

function drawBackground(ctx: CanvasRenderingContext2D) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#0d2a1d');
  g.addColorStop(0.45, '#08170f');
  g.addColorStop(1, '#050c0a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // Mowing stripes, fading out towards the top.
  for (let i = 0; i < 16; i++) {
    if (i % 2) continue;
    const y = 760 + i * 80;
    ctx.fillStyle = `rgba(120, 255, 190, ${0.018 + (i / 16) * 0.02})`;
    ctx.fillRect(0, y, W, 80);
  }

  // Floodlight from the top left.
  const f = ctx.createRadialGradient(160, -60, 20, 160, -60, 1100);
  f.addColorStop(0, 'rgba(160, 255, 210, 0.30)');
  f.addColorStop(0.4, 'rgba(75, 227, 160, 0.08)');
  f.addColorStop(1, 'rgba(75, 227, 160, 0)');
  ctx.fillStyle = f;
  ctx.fillRect(0, 0, W, H);

  // Centre circle peeking in at the bottom.
  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(W / 2, H + 60, 300, Math.PI, 2 * Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, H - 240);
  ctx.lineTo(W, H - 240);
  ctx.stroke();
}

function glassPanel(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  roundRect(ctx, x, y, w, h, 56);
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 60;
  ctx.shadowOffsetY = 24;
  ctx.fillStyle = 'rgba(255,255,255,0.065)';
  ctx.fill();
  ctx.restore();
  ctx.save();
  roundRect(ctx, x, y, w, h, 56);
  const edge = ctx.createLinearGradient(x, y, x, y + h);
  edge.addColorStop(0, 'rgba(255,255,255,0.28)');
  edge.addColorStop(1, 'rgba(255,255,255,0.05)');
  ctx.strokeStyle = edge;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();
}

const CELL_COLOR: Record<FeedbackStatus, string> = { correct: MINT, partial: GOLD, wrong: 'rgba(255,255,255,0.14)' };

export async function renderShareCard(data: ShareCardData): Promise<Blob> {
  await ensureFonts();
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');
  ctx.textBaseline = 'alphabetic';

  drawBackground(ctx);

  // Brand
  try {
    const logo = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(LOGO_SVG)}`);
    ctx.drawImage(logo, 96, 150, 124, 124);
  } catch {
    /* card still works without the mark */
  }
  ctx.fillStyle = INK;
  ctx.font = `700 54px ${DISPLAY}`;
  ctx.fillText('Football Detective', 248, 228);

  // Eyebrow + headline
  ctx.fillStyle = MINT;
  ctx.font = `600 44px ${SANS}`;
  ctx.fillText(data.eyebrow, 96, 440);
  ctx.fillStyle = INK;
  const hs = fitText(ctx, data.headline, 800, 118, DISPLAY, W - 192);
  ctx.font = `800 ${hs}px ${DISPLAY}`;
  ctx.fillText(data.headline, 92, 440 + hs + 10);

  // Score panel
  const py = 660;
  const ph = 420;
  glassPanel(ctx, 72, py, W - 144, ph);
  const scoreText = data.score.toLocaleString('en-US');
  ctx.font = `800 220px ${DISPLAY}`;
  const sw = ctx.measureText(scoreText).width;
  ctx.font = `700 72px ${DISPLAY}`;
  const uw = ctx.measureText('XP').width;
  const startX = (W - (sw + 24 + uw)) / 2;
  ctx.fillStyle = data.won ? INK : 'rgba(242,251,246,0.75)';
  ctx.font = `800 220px ${DISPLAY}`;
  ctx.fillText(scoreText, startX, py + 250);
  ctx.fillStyle = MINT;
  ctx.font = `700 72px ${DISPLAY}`;
  ctx.fillText('XP', startX + sw + 24, py + 250);
  ctx.fillStyle = MUTED;
  ctx.font = `500 40px ${SANS}`;
  ctx.textAlign = 'center';
  ctx.fillText(data.detail, W / 2, py + 340);
  ctx.textAlign = 'left';

  // Grid
  let gy = py + ph + 90;
  if (data.rows && data.rows.length) {
    const cell = 104;
    const gap = 18;
    const rowW = 5 * cell + 4 * gap;
    const rows = data.rows.slice(0, 6);
    const scale = rows.length > 5 ? 0.86 : 1;
    const c = cell * scale;
    const g = gap * scale;
    const rw = rowW * scale;
    rows.forEach((row, r) => {
      row.slice(0, 5).forEach((st, i) => {
        const x = (W - rw) / 2 + i * (c + g);
        const y = gy + r * (c + g);
        roundRect(ctx, x, y, c, c, 26 * scale);
        ctx.fillStyle = CELL_COLOR[st];
        ctx.fill();
        if (st !== 'wrong') {
          roundRect(ctx, x, y, c, c * 0.45, 26 * scale);
          ctx.fillStyle = 'rgba(255,255,255,0.18)';
          ctx.fill();
        }
      });
    });
    gy += rows.length * (c + g);
  } else if (data.tiles && data.tiles.length) {
    const n = data.tiles.length;
    const per = Math.min(n, 8);
    const size = n > 8 ? 84 : 112;
    const gap = 20;
    const lines = Math.ceil(n / per);
    for (let l = 0; l < lines; l++) {
      const slice = data.tiles.slice(l * per, l * per + per);
      const rw = slice.length * size + (slice.length - 1) * gap;
      slice.forEach((t, i) => {
        const x = (W - rw) / 2 + i * (size + gap);
        const y = gy + l * (size + gap);
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.fillStyle = t === 'hit' ? MINT : t === 'miss' ? RED : 'rgba(255,255,255,0.12)';
        ctx.fill();
        if (t !== 'empty') {
          ctx.strokeStyle = 'rgba(6,16,13,0.85)';
          ctx.lineWidth = 9;
          ctx.lineCap = 'round';
          ctx.beginPath();
          const cx = x + size / 2;
          const cy = y + size / 2;
          const k = size * 0.18;
          if (t === 'hit') {
            ctx.moveTo(cx - k * 1.1, cy + 2);
            ctx.lineTo(cx - k * 0.2, cy + k * 0.95);
            ctx.lineTo(cx + k * 1.2, cy - k * 0.9);
          } else {
            ctx.moveTo(cx - k, cy - k);
            ctx.lineTo(cx + k, cy + k);
            ctx.moveTo(cx + k, cy - k);
            ctx.lineTo(cx - k, cy + k);
          }
          ctx.stroke();
        }
      });
    }
    gy += lines * (size + gap);
  }

  if (data.reveal) {
    ctx.fillStyle = MUTED;
    ctx.font = `500 38px ${SANS}`;
    ctx.textAlign = 'center';
    ctx.fillText('The player was', W / 2, gy + 70);
    ctx.fillStyle = INK;
    const rs = fitText(ctx, data.reveal, 700, 60, DISPLAY, W - 192);
    ctx.font = `700 ${rs}px ${DISPLAY}`;
    ctx.fillText(data.reveal, W / 2, gy + 70 + rs + 12);
    ctx.textAlign = 'left';
  }

  // Footer
  ctx.textAlign = 'center';
  ctx.fillStyle = INK;
  ctx.font = `700 58px ${DISPLAY}`;
  ctx.fillText(data.cta, W / 2, H - 330);
  ctx.fillStyle = MUTED;
  ctx.font = `500 36px ${SANS}`;
  ctx.fillText(`Football Detective by @${DEVELOPER.handle}`, W / 2, H - 140);
  ctx.textAlign = 'left';

  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not create image'))), 'image/png');
  });
}
