/* ================================================
   app.js — Logic utama: render UI, update data
   Versi Firebase (data real dari ESP32)
   ================================================ */

import { startFirebaseListener } from './firebase.js';

// ════════════════════════════════════════════════
// SVG VALVE
// ════════════════════════════════════════════════

const PIPE = `
  <rect x="0"   y="55" width="50"  height="20" rx="3" fill="#c9cdd6"/>
  <rect x="1"   y="57" width="48"  height="16" rx="2" fill="#dde1e9"/>
  <rect x="2"   y="58" width="46"  height="5"  rx="1" fill="white" opacity=".45"/>
  <rect x="120" y="55" width="50"  height="20" rx="3" fill="#c9cdd6"/>
  <rect x="121" y="57" width="48"  height="16" rx="2" fill="#dde1e9"/>
  <rect x="122" y="58" width="46"  height="5"  rx="1" fill="white" opacity=".45"/>`;

const FLANGES = `
  <rect x="46"  y="51" width="8" height="28" rx="3" fill="#b0b8c8"/>
  <rect x="47"  y="53" width="6" height="24" rx="2" fill="#c9cdd6"/>
  <rect x="116" y="51" width="8" height="28" rx="3" fill="#b0b8c8"/>
  <rect x="117" y="53" width="6" height="24" rx="2" fill="#c9cdd6"/>`;

const BODY = `
  <rect x="52" y="40" width="66" height="50" rx="9" fill="#a0a8b8"/>
  <rect x="54" y="38" width="62" height="50" rx="8" fill="#d1d5df"/>
  <rect x="56" y="39" width="58" height="10" rx="6" fill="white" opacity=".3"/>
  <rect x="54" y="77" width="62" height="11" rx="0" fill="black" opacity=".05"/>`;

const STEM = `
  <rect x="81" y="12" width="8"  height="28" rx="4" fill="#aab0c0"/>
  <rect x="82" y="13" width="6"  height="26" rx="3" fill="#d1d5df"/>
  <rect x="82" y="13" width="6"  height="6"  rx="3" fill="white" opacity=".3"/>
  <rect x="79" y="36" width="12" height="6"  rx="3" fill="#b0b8c8"/>`;

const BORE_OPEN = `
  <ellipse cx="85" cy="63" rx="13" ry="12" fill="#6b7280"/>
  <ellipse cx="85" cy="63" rx="11" ry="10" fill="#374151"/>
  <ellipse cx="85" cy="63" rx="8"  ry="7"  fill="#1f2937"/>
  <ellipse cx="85" cy="63" rx="5"  ry="4"  fill="#16a34a" opacity=".5"/>
  <g stroke="#16a34a" stroke-width="2" stroke-linecap="round" opacity=".85">
    <line x1="62" y1="63" x2="74" y2="63"/>
    <polyline points="71,59 75,63 71,67"/>
    <line x1="95" y1="63" x2="107" y2="63"/>
    <polyline points="96,59 92,63 96,67"/>
  </g>`;

const BORE_CLOSED = `
  <ellipse cx="85" cy="63" rx="14" ry="13" fill="#9ca3af"/>
  <ellipse cx="85" cy="63" rx="12" ry="11" fill="#ef4444"/>
  <ellipse cx="85" cy="60" rx="8"  ry="5"  fill="white" opacity=".18"/>
  <line x1="78" y1="56" x2="92" y2="70" stroke="white" stroke-width="2.5" stroke-linecap="round" opacity=".65"/>
  <line x1="92" y1="56" x2="78" y2="70" stroke="white" stroke-width="2.5" stroke-linecap="round" opacity=".65"/>`;

function wheelSVG(ringColor) {
  return `<g transform="translate(85,13)">
    <circle r="16" fill="#b0b8c8" transform="translate(1,1)"/>
    <circle r="16" fill="none" stroke="#7a8398" stroke-width="3.5"/>
    <circle r="16" fill="none" stroke="#c9cdd6" stroke-width="1.5"/>
    <line x1="0"   y1="-16" x2="0"   y2="-6"  stroke="#8a93a8" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="0"   y1="6"   x2="0"   y2="16"  stroke="#8a93a8" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="-16" y1="0"   x2="-6"  y2="0"   stroke="#8a93a8" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="6"   y1="0"   x2="16"  y2="0"   stroke="#8a93a8" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="-11" y1="-11" x2="-5"  y2="-5"  stroke="#8a93a8" stroke-width="2"   stroke-linecap="round"/>
    <line x1="5"   y1="5"   x2="11"  y2="11"  stroke="#8a93a8" stroke-width="2"   stroke-linecap="round"/>
    <line x1="11"  y1="-11" x2="5"   y2="-5"  stroke="#8a93a8" stroke-width="2"   stroke-linecap="round"/>
    <line x1="-5"  y1="5"   x2="-11" y2="11"  stroke="#8a93a8" stroke-width="2"   stroke-linecap="round"/>
    <circle r="5.5" fill="#7a8398"/>
    <circle r="4"   fill="#aab0c0"/>
    <circle r="2"   fill="#d1d5df"/>
    <ellipse cx="-3" cy="-4" rx="3" ry="2" fill="white" opacity=".2" transform="rotate(-30)"/>
    <circle r="19" fill="none" stroke="${ringColor}" stroke-width="2" stroke-dasharray="4 3"/>
  </g>`;
}

function statusDot(color) {
  return `
    <circle cx="85" cy="100" r="5.5" fill="${color}"/>
    <circle cx="85" cy="100" r="9"   fill="none" stroke="${color}" stroke-width="1.5" opacity=".4"/>`;
}

function buildValveSVG(isOpen) {
  const color = isOpen ? '#16a34a' : '#ef4444';
  return PIPE + FLANGES + BODY
       + (isOpen ? BORE_OPEN : BORE_CLOSED)
       + STEM + wheelSVG(color) + statusDot(color);
}

// ════════════════════════════════════════════════
// UPDATE UI
// ════════════════════════════════════════════════

export function setValve(n, isOpen) {
  document.getElementById('vs' + n).innerHTML = buildValveSVG(isOpen);

  const card  = document.getElementById('vc' + n);
  const badge = document.getElementById('vb' + n);

  card.className  = 'valve-card ' + (isOpen ? 'open' : 'closed');
  badge.className = 'valve-badge ' + (isOpen ? 'open' : 'closed');
  badge.textContent = isOpen ? 'TERBUKA' : 'TERTUTUP';
}

export function updateMetrics(d) {
  document.getElementById('val-v').innerHTML   = d.v.toFixed(1) + '<span class="unit">V</span>';
  document.getElementById('val-a').innerHTML   = d.a.toFixed(2) + '<span class="unit">A</span>';
  document.getElementById('val-p').innerHTML   = d.p.toFixed(0) + '<span class="unit">W</span>';
  document.getElementById('val-bat').innerHTML = d.pct.toFixed(0) + '<span class="unit">%</span>';

  document.getElementById('batt-fill').style.width = d.pct + '%';
  document.getElementById('batt-pct').textContent  = d.pct + '%';

  const bb = document.getElementById('batt-badge');
  if (d.pct < 50) {
    bb.textContent = '● AMAN';
    bb.className   = 'badge aman';
    document.getElementById('batt-fill').style.background = '#16a34a';
  } else {
    bb.textContent = '● WASPADA';
    bb.className   = 'badge waspada';
    document.getElementById('batt-fill').style.background = '#d97706';
  }

  document.getElementById('ts').textContent =
    'Update: ' + new Date().toLocaleString('id-ID');
}

// ════════════════════════════════════════════════
// INDIKATOR STATUS KONEKSI
// ════════════════════════════════════════════════

function showConnecting() {
  document.getElementById('ts').textContent = '🔄 Menghubungkan ke Firebase...';
}

function showConnected() {
  // Timestamp ditangani oleh updateMetrics()
}

// ════════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════════

// Render awal valve (semua tertutup sampai data masuk)
[1, 2].forEach(n => setValve(n, false));
showConnecting();

// Mulai listener Firebase
startFirebaseListener((data) => {
  updateMetrics(data);
  data.valve.forEach((isOpen, i) => setValve(i + 1, isOpen));
});