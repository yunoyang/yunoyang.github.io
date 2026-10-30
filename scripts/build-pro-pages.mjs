// 업체 공개 페이지(/pro/<id>/) 정적 생성 — 구글·네이버 검색 노출용
// vb_contractors 중 업체가 앱에서 '검색 노출'을 켠(publicPage: true) 문서만 생성한다.
// Firestore는 public read라 인증 없이 REST로 읽는다. 실행: node scripts/build-pro-pages.mjs
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SITE = 'https://vibespacekorea.com';
const API = 'https://firestore.googleapis.com/v1/projects/vibespace-b2329/databases/(default)/documents/vb_contractors';

const val = v => {
  if (!v) return undefined;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('timestampValue' in v) return v.timestampValue;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(val);
  if ('mapValue' in v) return Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, val(x)]));
  return undefined;
};
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function fetchAll() {
  const out = []; let token = '';
  do {
    const res = await fetch(`${API}?pageSize=300${token ? '&pageToken=' + token : ''}`);
    const j = await res.json();
    if (j.error) throw new Error(j.error.message);
    (j.documents || []).forEach(d => out.push({ id: d.name.split('/').pop(), updateTime: d.updateTime, ...Object.fromEntries(Object.entries(d.fields || {}).map(([k, v]) => [k, val(v)])) }));
    token = j.nextPageToken || '';
  } while (token);
  return out;
}

function page(c) {
  const url = `${SITE}/pro/${c.id}/`;
  const media = (c.media || []).filter(m => m && m.url);
  const img = media.find(m => m.type === 'image');
  const title = `${c.name} — ${c.category || '인테리어'} 업체${c.area ? ' · ' + c.area : ''} | Vibespace`;
  const desc = (c.description || `${c.area || ''} ${c.category || ''} 시공 업체 ${c.name}의 시공 사진과 영상`).replace(/\s+/g, ' ').trim().slice(0, 155);
  const ld = { '@context': 'https://schema.org', '@type': 'HomeAndConstructionBusiness', name: c.name, description: desc, url,
    ...(c.address || c.area ? { address: { '@type': 'PostalAddress', streetAddress: c.address || undefined, addressLocality: c.area || undefined, addressCountry: 'KR' } } : {}),
    ...(c.phone ? { telephone: c.phone } : {}), ...(img ? { image: media.filter(m => m.type === 'image').map(m => m.url).slice(0, 6) } : {}) };
  const gallery = media.map(m => m.type === 'video'
    ? `<figure class="m"><video src="${esc(m.url)}" controls playsinline preload="metadata"${m.poster ? ` poster="${esc(m.poster)}"` : ''}></video>${m.caption ? `<figcaption>${esc(m.caption)}</figcaption>` : ''}</figure>`
    : `<figure class="m"><img src="${esc(m.url)}" alt="${esc(c.name + ' 시공 사진' + (m.caption ? ' - ' + m.caption : ''))}" loading="lazy">${m.caption ? `<figcaption>${esc(m.caption)}</figcaption>` : ''}</figure>`).join('');
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${url}">
<meta property="og:type" content="profile"><meta property="og:site_name" content="Vibespace">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">${img ? `<meta property="og:image" content="${esc(img.url)}">` : ''}
<meta property="og:locale" content="ko_KR"><meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
<link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:"Pretendard Variable",Pretendard,sans-serif;background:#f6f7f9;color:#111;line-height:1.6}
a{color:inherit;text-decoration:none}
.nav{background:#fff;border-bottom:1px solid #eef0f3;padding:12px 20px;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;z-index:5}
.nav b{font-size:15px}.nav a.cta{padding:7px 14px;background:#111;color:#fff;border-radius:20px;font-size:13px;font-weight:600}
.wrap{max-width:720px;margin:0 auto;padding:24px 20px 80px}
.hero{background:#fff;border-radius:16px;padding:24px 20px;margin-bottom:16px}
.cat{display:inline-block;font-size:12px;font-weight:600;color:#333d4b;background:#f2f4f6;border-radius:6px;padding:3px 8px;margin-bottom:10px}
h1{font-size:24px;font-weight:700;letter-spacing:-.02em}
.meta{font-size:14px;color:#6b7684;margin-top:6px}
.desc{font-size:15px;color:#333;margin-top:14px;white-space:pre-line}
.contact{display:flex;gap:8px;margin-top:18px}.contact a{flex:1;text-align:center;padding:12px;border-radius:12px;background:#111;color:#fff;font-weight:600;font-size:14px}
h2{font-size:16px;font-weight:700;margin:8px 0 12px}
.g{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
.m{background:#fff;border-radius:12px;overflow:hidden}.m img,.m video{width:100%;aspect-ratio:1;object-fit:cover;display:block;background:#eee}
.m figcaption{font-size:12px;color:#6b7684;padding:6px 10px}
.empty{color:#8b95a1;font-size:14px;background:#fff;border-radius:12px;padding:24px;text-align:center}
@media(min-width:640px){.g{grid-template-columns:repeat(3,1fr)}}
</style>
</head>
<body>
<nav class="nav"><a href="${SITE}/"><b>Vibespace</b></a><a class="cta" href="${SITE}/">셀프 인테리어 플래닝</a></nav>
<main class="wrap">
<section class="hero">
<span class="cat">${esc(c.category || '인테리어')}</span>
<h1>${esc(c.name)}</h1>
<div class="meta">${esc([c.area, c.originalCategory].filter(Boolean).join(' · '))}</div>
${c.description ? `<p class="desc">${esc(c.description)}</p>` : ''}
${c.phone ? `<div class="contact"><a href="tel:${esc(c.phone)}">전화 문의</a></div>` : ''}
</section>
<h2>시공 사진 · 영상</h2>
<div class="g" id="g">${gallery || '<div class="empty">아직 등록된 사진이 없어요</div>'}</div>
</main>
<script>
// 정적 생성 이후 업로드된 사진·영상도 바로 보이도록 최신 데이터로 갱신
fetch(${JSON.stringify(`${API}/${c.id}`)}).then(r => r.json()).then(d => {
  const a = d.fields && d.fields.media && d.fields.media.arrayValue && d.fields.media.arrayValue.values; if (!a) return;
  const e = s => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const f = m => Object.fromEntries(Object.entries(m.mapValue.fields || {}).map(([k, v]) => [k, v.stringValue]));
  const items = a.map(f).filter(m => m.url);
  if (!items.length) return;
  document.getElementById('g').innerHTML = items.map(m => m.type === 'video'
    ? '<figure class="m"><video src="' + e(m.url) + '" controls playsinline preload="metadata"></video>' + (m.caption ? '<figcaption>' + e(m.caption) + '</figcaption>' : '') + '</figure>'
    : '<figure class="m"><img src="' + e(m.url) + '" alt="' + e(${JSON.stringify(c.name)} + ' 시공 사진') + '" loading="lazy">' + (m.caption ? '<figcaption>' + e(m.caption) + '</figcaption>' : '') + '</figure>').join('');
}).catch(() => {});
</script>
</body>
</html>
`;
}

function indexPage(list) {
  return `<!DOCTYPE html>
<html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>인테리어 업체 | Vibespace</title><meta name="description" content="Vibespace에 등록된 인테리어 시공 업체의 시공 사진과 영상">
<link rel="canonical" href="${SITE}/pro/"><meta name="robots" content="index,follow">
<style>body{font-family:Pretendard,-apple-system,sans-serif;background:#f6f7f9;margin:0}main{max-width:720px;margin:0 auto;padding:24px 20px}h1{font-size:22px}a{display:block;background:#fff;border-radius:12px;padding:16px 20px;margin-bottom:8px;color:#111;text-decoration:none}span{color:#6b7684;font-size:13px;margin-left:6px}</style>
</head><body><main><h1>인테리어 업체</h1>
${list.map(c => `<a href="/pro/${c.id}/"><b>${esc(c.name)}</b><span>${esc([c.category, c.area].filter(Boolean).join(' · '))}</span></a>`).join('\n')}
</main></body></html>
`;
}

function updateSitemap(list) {
  const f = path.join(ROOT, 'sitemap.xml');
  let xml = fs.readFileSync(f, 'utf8');
  xml = xml.replace(/\s*<url>\s*<loc>https:\/\/vibespacekorea\.com\/pro\/[^<]*<\/loc>[\s\S]*?<\/url>/g, '');
  const entries = [{ id: '', updateTime: new Date().toISOString() }, ...list].map(c => `
  <url>
    <loc>${SITE}/pro/${c.id ? c.id + '/' : ''}</loc>
    <lastmod>${String(c.updateTime || '').slice(0, 10)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${c.id ? '0.7' : '0.6'}</priority>
  </url>`).join('');
  xml = xml.replace('</urlset>', entries + '\n</urlset>');
  fs.writeFileSync(f, xml);
}

const all = await fetchAll();
const list = all.filter(c => c.publicPage === true && c.name).sort((a, b) => a.name.localeCompare(b.name, 'ko'));
const dir = path.join(ROOT, 'pro');
// 노출을 끈 업체의 페이지는 삭제
if (fs.existsSync(dir)) for (const d of fs.readdirSync(dir)) if (d !== 'index.html' && !list.some(c => c.id === d)) fs.rmSync(path.join(dir, d), { recursive: true, force: true });
fs.mkdirSync(dir, { recursive: true });
for (const c of list) { fs.mkdirSync(path.join(dir, c.id), { recursive: true }); fs.writeFileSync(path.join(dir, c.id, 'index.html'), page(c)); }
fs.writeFileSync(path.join(dir, 'index.html'), indexPage(list));
updateSitemap(list);
console.log(`pro pages: ${list.length}`);
