/**
 * Vibespace Icon Sprite — Single Source of Truth
 *
 * ✅ 이 파일 하나만 수정하면 icons.html(미리보기) + index.html(실제 서비스)에 동시 반영됩니다.
 *
 * 사용법 (HTML):
 *   <svg class="icon" width="24" height="24"><use href="#icon-이름"/></svg>
 *
 * 색상은 CSS color 속성으로 제어:
 *   <svg class="icon" width="17" height="17" style="color:var(--danger)"><use href="#icon-trash-2"/></svg>
 *
 * 아이콘 추가:
 *   VS_ICONS 객체에 'icon-name': '<path d="..."/>' 형태로 추가
 */
const VS_ICONS = {

  // ── Navigation & UI ────────────────────────────────────────────────────────
  'arrow-left':     '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
  'chevron-right':  '<polyline points="9 18 15 12 9 6"/>',
  'chevron-down':   '<polyline points="6 9 12 15 18 9"/>',
  'chevron-left':   '<polyline points="15 18 9 12 15 6"/>',
  'x':              '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  'search':         '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  'plus':           '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  'menu':           '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',

  // ── Project & Files ────────────────────────────────────────────────────────
  'folder-open':    '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>',
  'file-text':      '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>',
  'file-down':      '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/>',
  'printer':        '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  'copy':           '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  'layout-grid':    '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',

  // ── User & Auth ────────────────────────────────────────────────────────────
  'user':           '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  'users':          '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  'log-out':        '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',

  // ── Communication & Share ──────────────────────────────────────────────────
  'share-2':        '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',
  'link':           '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  'home':           '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  'mail':           '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
  'message-square': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  'phone':          '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.49 12 19.79 19.79 0 0 1 1.21 3.18 2 2 0 0 1 3.22 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>',

  // ── Status & Feedback ──────────────────────────────────────────────────────
  'check-circle':   '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  'check':          '<polyline points="20 6 9 17 4 12"/>',
  'info':           '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  'star':           '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  'lightbulb':      '<line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>',

  // ── Work & Schedule ────────────────────────────────────────────────────────
  'clock':          '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  'calendar':       '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  'map-pin':        '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  'dollar-sign':    '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',

  // ── Destructive ────────────────────────────────────────────────────────────
  'trash-2':        '<path fill-rule="evenodd" clip-rule="evenodd" d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5C20 5.55228 19.5523 6 19 6H5C4.44772 6 4 5.55228 4 5Z" style="fill:currentColor;stroke:none"/><path fill-rule="evenodd" clip-rule="evenodd" d="M8.77778 3.33333C8.77778 2.59695 9.37473 2 10.1111 2L13.8889 2C14.6253 2 15.2222 2.59695 15.2222 3.33333C15.2222 3.70152 15.5207 4 15.8889 4H16V6H15.8889C14.6463 6 13.6023 5.15015 13.3062 4L10.6938 4C10.3977 5.15015 9.35367 6 8.11111 6H8V4L8.11111 4C8.4793 4 8.77778 3.70152 8.77778 3.33333Z" style="fill:currentColor;stroke:none"/><path fill-rule="evenodd" clip-rule="evenodd" d="M5.91695 8.00345C6.46733 7.95758 6.95068 8.36657 6.99654 8.91695L7.7673 18.1661C7.85368 19.2027 8.72022 20 9.76039 20H14.2396C15.2798 20 16.1463 19.2027 16.2327 18.1661L17.0034 8.91695C17.0493 8.36657 17.5327 7.95758 18.083 8.00345C18.6334 8.04931 19.0424 8.53266 18.9965 9.08304L18.2258 18.3322C18.053 20.4053 16.32 22 14.2396 22H9.76039C7.68004 22 5.94697 20.4053 5.77421 18.3322L5.00345 9.08304C4.95758 8.53266 5.36657 8.04931 5.91695 8.00345Z" style="fill:currentColor;stroke:none"/>',

};

// ── Auto-inject sprite into DOM ──────────────────────────────────────────────
(function injectSprite() {
  if (document.getElementById('vs-icon-sprite')) return;

  const symbols = Object.entries(VS_ICONS).map(([id, inner]) =>
    `<symbol id="icon-${id}" viewBox="0 0 24 24">${inner}</symbol>`
  ).join('');

  const sprite = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  sprite.id = 'vs-icon-sprite';
  sprite.setAttribute('aria-hidden', 'true');
  sprite.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;');
  sprite.innerHTML = symbols;

  if (document.body) {
    document.body.insertBefore(sprite, document.body.firstChild);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      document.body.insertBefore(sprite, document.body.firstChild);
    });
  }
})();
