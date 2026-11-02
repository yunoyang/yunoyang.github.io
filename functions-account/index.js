// 탈퇴 계정 영구 삭제 — 푸시 함수와 분리된 코드베이스 (APNs 시크릿 없이 배포 가능)
const { onSchedule } = require('firebase-functions/v2/scheduler');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();
const REGION = 'asia-northeast3';

// 탈퇴 후 30일이 지나도록 재로그인하지 않은 계정의 데이터를 영구 삭제 (개인정보처리방침 보관기간)
// 공동작업자가 있는 프로젝트는 삭제하지 않고 첫 번째 공동작업자에게 소유권을 넘긴다
const WITHDRAW_RETENTION_DAYS = 30;
async function purgeAccount(userDoc) {
  const email = userDoc.id, bucket = admin.storage().bucket();
  const owned = new Map();
  for (const field of ['ownerEmail', 'meta.owner.email']) {
    (await db.collection('vb_projects').where(field, '==', email).get()).forEach(d => owned.set(d.id, d));
  }
  for (const [id, d] of owned) {
    const others = (d.data().meta?.collaborators || []).filter(c => c?.email && c.email !== email);
    if (others.length) {
      const next = others.find(c => c.role !== '뷰어') || others[0];
      await d.ref.update({
        ownerEmail: next.email,
        'meta.owner': { email: next.email, name: next.name || next.email.split('@')[0] },
        'meta.collaborators': others.filter(c => c.email !== next.email),
      });
    } else {
      await d.ref.delete();
      await bucket.deleteFiles({ prefix: `styleImages/${id}/` });
    }
  }
  const delAll = async q => { const s = await q.get(); await Promise.all(s.docs.map(x => x.ref.delete())); };
  await delAll(db.collection('vb_contractors').where('contactEmail', '==', email));
  await delAll(db.collection('vb_exports').where('ownerEmail', '==', email));
  await delAll(db.collection('vb_notifications').where('to', '==', email.replace(/\./g, '_')));
  await bucket.deleteFiles({ prefix: `portfolio/${email}/` });
  await bucket.deleteFiles({ prefix: `avatars/${email}.jpg` });
  await db.collection('vb_users').doc(email.replace(/\./g, '_')).delete();
  await userDoc.ref.delete();
  await admin.auth().getUserByEmail(email).then(u => admin.auth().deleteUser(u.uid)).catch(e => {
    if (e.code !== 'auth/user-not-found') throw e;
  });
}
exports.purgeWithdrawnAccounts = onSchedule({ schedule: '0 4 * * *', timeZone: 'Asia/Seoul', region: REGION, timeoutSeconds: 540 }, async () => {
  const cutoff = new Date(Date.now() - WITHDRAW_RETENTION_DAYS * 86400000);
  const snap = await db.collection('vb_users').where('withdrawn', '==', true).where('withdrawnAt', '<', cutoff).get();
  for (const d of snap.docs) {
    try { await purgeAccount(d); console.log('purged account', d.id); }
    catch (e) { console.error('purge failed', d.id, e); } // 다음 날 재시도
  }
});
