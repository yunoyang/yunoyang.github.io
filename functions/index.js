// 바이브스페이스 푸시 알림 — vb_notifications 문서가 생기면 받는 사람 기기로 푸시 발송
// iOS: APNs 직접 발송(.p8 키, 시크릿), Android: FCM
// 배포 방법은 README.md 참고
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const http2 = require('http2');
const crypto = require('crypto');

admin.initializeApp();
const db = admin.firestore();
const APNS_KEY = defineSecret('APNS_KEY');       // .p8 파일 내용
const APNS_KEY_ID = defineSecret('APNS_KEY_ID'); // 10자리 Key ID
const APNS_TEAM_ID = defineSecret('APNS_TEAM_ID');
const BUNDLE_ID = 'com.vibespace.app';
const APNS_HOST = process.env.APNS_SANDBOX === '1' ? 'https://api.sandbox.push.apple.com' : 'https://api.push.apple.com';
const REGION = 'asia-northeast3';
const GROUP_WINDOW_MS = 5 * 60 * 1000;

function kstHour(d = new Date()) { return (d.getUTCHours() + 9) % 24; }
function isQuiet(prefs) { if (prefs.quiet === false) return false; const h = kstHour(); return h >= 22 || h < 8; }

let _jwt = null, _jwtAt = 0;
function apnsJwt() {
  if (_jwt && Date.now() - _jwtAt < 40 * 60 * 1000) return _jwt;
  const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
  const unsigned = b64({ alg: 'ES256', kid: APNS_KEY_ID.value() }) + '.' + b64({ iss: APNS_TEAM_ID.value(), iat: Math.floor(Date.now() / 1000) });
  const sig = crypto.sign('sha256', Buffer.from(unsigned), { key: APNS_KEY.value(), dsaEncoding: 'ieee-p1363' }).toString('base64url');
  _jwt = unsigned + '.' + sig; _jwtAt = Date.now();
  return _jwt;
}
function sendApns(token, payload) {
  return new Promise(resolve => {
    const client = http2.connect(APNS_HOST);
    client.on('error', () => resolve({ ok: false }));
    const req = client.request({ ':method': 'POST', ':path': `/3/device/${token}`, authorization: `bearer ${apnsJwt()}`, 'apns-topic': BUNDLE_ID, 'apns-push-type': 'alert', 'apns-priority': '10', 'content-type': 'application/json' });
    let status = 0, body = '';
    req.on('response', h => { status = h[':status']; });
    req.on('data', c => { body += c; });
    req.on('end', () => { client.close(); resolve({ ok: status === 200, status, body }); });
    req.end(JSON.stringify(payload));
  });
}

async function deliver(userKey, n, notifId) {
  const uref = db.collection('vb_users').doc(userKey);
  const u = (await uref.get()).data() || {};
  const prefs = { collab: true, activity: true, reminder: true, estimate: true, quiet: true, ...(u.notifPrefs || {}) };
  if (prefs[n.cat] === false) return 'pref-off';
  const tokens = u.pushTokens || [];
  if (!tokens.length) return 'no-token';
  const badge = (await db.collection('vb_notifications').where('to', '==', userKey).where('read', '==', false).count().get()).data().count;
  const data = { type: n.type || '', projectId: n.projectId || '', tab: n.tab || '', refId: n.refId || '', notifId: notifId || '' };
  const dead = [];
  for (const t of tokens) {
    if (t.kind === 'apns') {
      const r = await sendApns(t.token, { aps: { alert: { title: n.title || '바이브스페이스', body: n.body || '' }, sound: 'default', badge, 'thread-id': n.projectId || 'vibespace' }, ...data });
      if (!r.ok && (r.status === 410 || /BadDeviceToken|Unregistered/.test(r.body || ''))) dead.push(t);
    } else {
      try { await admin.messaging().send({ token: t.token, notification: { title: n.title || '바이브스페이스', body: n.body || '' }, data, android: { notification: { tag: n.groupKey || undefined } } }); }
      catch (e) { if (/registration-token-not-registered|invalid-argument/.test(e.code || '')) dead.push(t); }
    }
  }
  if (dead.length) await uref.update({ pushTokens: admin.firestore.FieldValue.arrayRemove(...dead) });
  return 'sent';
}

exports.onNotificationCreated = onDocumentCreated({ document: 'vb_notifications/{id}', region: REGION, secrets: [APNS_KEY, APNS_KEY_ID, APNS_TEAM_ID] }, async event => {
  const snap = event.data; if (!snap) return;
  const n = snap.data();
  // 묶음: 같은 groupKey로 5분 안에 이미 푸시가 나갔으면 이번 건은 알림함에만 남김
  if (n.groupKey) {
    const since = admin.firestore.Timestamp.fromMillis(Date.now() - GROUP_WINDOW_MS);
    const recent = await db.collection('vb_notifications').where('to', '==', n.to).where('groupKey', '==', n.groupKey).where('pushedAt', '>=', since).limit(1).get();
    if (!recent.empty) { await snap.ref.update({ push: 'grouped' }); return; }
  }
  const u = (await db.collection('vb_users').doc(n.to).get()).data() || {};
  const prefs = { quiet: true, ...(u.notifPrefs || {}) };
  if (n.type !== 'invite' && isQuiet(prefs)) { await snap.ref.update({ push: 'quiet-pending' }); return; }
  const r = await deliver(n.to, n, snap.id);
  await snap.ref.update({ push: r, pushedAt: admin.firestore.FieldValue.serverTimestamp() });
});

// 매일 오전 8시(KST): 방해 금지 시간에 쌓인 알림을 사람별로 한 번에 + 내일 시작하는 공정 리마인더
exports.morningDigest = onSchedule({ schedule: '0 8 * * *', timeZone: 'Asia/Seoul', region: REGION, secrets: [APNS_KEY, APNS_KEY_ID, APNS_TEAM_ID] }, async () => {
  const pend = await db.collection('vb_notifications').where('push', '==', 'quiet-pending').limit(500).get();
  const byUser = {};
  pend.docs.forEach(d => { (byUser[d.data().to] = byUser[d.data().to] || []).push(d); });
  for (const [key, docs] of Object.entries(byUser)) {
    const first = docs[0].data();
    const n = docs.length === 1 ? first : { ...first, title: '바이브스페이스', body: `밤사이 새 소식 ${docs.length}개 · ${first.body}`, tab: '', type: 'digest' };
    await deliver(key, n, docs.length === 1 ? docs[0].id : '');
    await Promise.all(docs.map(d => d.ref.update({ push: 'digest', pushedAt: admin.firestore.FieldValue.serverTimestamp() })));
  }
  // 공정 시작 전날 리마인더는 21시 함수에서
});

// 매일 오후 8시(KST): 내일 시작하는 공정이 있는 프로젝트 멤버에게 리마인더
exports.eveningReminder = onSchedule({ schedule: '0 20 * * *', timeZone: 'Asia/Seoul', region: REGION }, async () => {
  const t = new Date(Date.now() + 9 * 3600e3 + 24 * 3600e3).toISOString().slice(0, 10);
  const projs = await db.collection('vb_projects').get();
  const batch = db.batch(); let n = 0;
  projs.forEach(doc => {
    const d = doc.data(), pd = d.projectData || {}, meta = d.meta || {};
    const starting = (pd.processes || []).filter(p => !p.deleted && p.scheduleStart === t);
    if (!starting.length) return;
    const emails = new Set([meta.owner?.email, ...(meta.collaborators || []).filter(c => c.role !== '뷰어').map(c => c.email)].filter(Boolean).map(e => e.toLowerCase()));
    const names = starting.map(p => p.type || p.name).join(', ');
    emails.forEach(email => {
      batch.set(db.collection('vb_notifications').doc(), { to: email.replace(/\./g, '_'), toEmail: email, type: 'reminder', cat: 'reminder', title: pd.name || '공정 리마인더', body: `내일 ${names} 공정이 시작돼요`, projectId: doc.id, projectName: pd.name || '', tab: 'plan', refId: '', groupKey: '', count: 1, actorEmail: '', actorName: '', read: false, createdAt: admin.firestore.FieldValue.serverTimestamp() });
      n++;
    });
  });
  if (n) await batch.commit();
});
