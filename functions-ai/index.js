// 바이브스페이스 AI 함수 (푸시 알림 codebase와 분리 — 시크릿 독립 배포)
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const REGION = 'asia-northeast3';

// ===== 도면 AI 분석: 평면도 이미지 → 구역(이름·경계·치수) JSON =====
// 시크릿: firebase functions:secrets:set ANTHROPIC_API_KEY
const ANTHROPIC_API_KEY = defineSecret('ANTHROPIC_API_KEY');
const PLAN_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['name', 'width_mm', 'height_mm', 'outline', 'zones'],
  properties: {
    name: { type: 'string', description: '도면 제목/단지·호수 (없으면 빈 문자열)' },
    width_mm: { type: 'number', description: '건물 외곽 전체 가로 길이(mm), 치수선 합계 기준' },
    height_mm: { type: 'number', description: '건물 외곽 전체 세로 길이(mm)' },
    outline: { type: 'object', additionalProperties: false, required: ['x0', 'y0', 'x1', 'y1'],
      description: '건물 외곽(치수선이 가리키는 범위)의 이미지 내 위치, 0~1 정규화 좌표',
      properties: { x0: { type: 'number' }, y0: { type: 'number' }, x1: { type: 'number' }, y1: { type: 'number' } } },
    zones: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['name', 'poly'],
      properties: {
        name: { type: 'string', description: '실 이름 (거실, 안방, 주방, 욕실1 …)' },
        floor: { type: 'string', description: '도면에 적힌 바닥 마감 (없으면 빈 문자열)' },
        poly: { type: 'array', description: '실 경계 다각형 꼭짓점, 시계방향, 이미지 0~1 정규화 [x,y]',
          items: { type: 'array', items: { type: 'number' } } },
      } } },
  },
};
exports.analyzePlan = onCall({ region: REGION, secrets: [ANTHROPIC_API_KEY], timeoutSeconds: 300, memory: '512MiB' }, async req => {
  if (!req.auth) throw new HttpsError('unauthenticated', '로그인이 필요해요');
  const imageUrl = String(req.data?.imageUrl || '');
  if (!/^https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/vibespace-b2329\./.test(imageUrl)) throw new HttpsError('invalid-argument', '도면 이미지 주소가 올바르지 않아요');
  const Anthropic = require('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY.value() });
  const res = await client.beta.messages.create({
    model: 'claude-opus-5-5',
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'high', format: { type: 'json_schema', schema: PLAN_SCHEMA } },
    messages: [{ role: 'user', content: [
      { type: 'image', source: { type: 'url', url: imageUrl } },
      { type: 'text', text: [
        '한국 아파트/주택 인테리어 평면도입니다. 각 실(방·거실·주방·욕실·현관·발코니·드레스룸·다용도실·복도 등)을 구역으로 나눠 주세요.',
        '- poly: 각 실의 벽 안쪽 경계를 꼭짓점 다각형으로. 좌표는 이미지 전체 기준 0~1 (왼쪽 위 0,0). 직각 위주로, 인접 실과 경계를 공유하게.',
        '- 실들이 서로 겹치지 않게, 건물 외곽 안을 빠짐없이 채우게.',
        '- width_mm/height_mm: 바깥 치수선 합계(mm). 치수가 없으면 일반적인 아파트 비율로 추정.',
        '- outline: 그 치수가 가리키는 건물 외곽 범위의 이미지 내 정규화 좌표.',
        '- 이름이 같은 실은 "욕실1", "욕실2"처럼 구분. 도면에 적힌 실명을 우선 사용.',
      ].join('\n') },
    ] }],
  });
  if (res.stop_reason === 'refusal') throw new HttpsError('failed-precondition', '도면을 분석하지 못했어요');
  const text = (res.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
  try { return JSON.parse(text); }
  catch (e) { throw new HttpsError('internal', '분석 결과를 읽지 못했어요'); }
});
