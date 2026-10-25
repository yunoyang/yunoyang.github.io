# 바이브스페이스 푸시 알림 서버

앱은 이벤트(초대, 초대 수락, 현장 사진, 미팅 기록)마다 `vb_notifications` 문서를 만들고,
여기 있는 Cloud Function이 그 문서를 보고 푸시를 보냅니다. 앱 안 알림함(🔔)은 배포 전에도 동작합니다.

## 배포 전에 필요한 것
1. Firebase 프로젝트 `vibespace-b2329` 요금제를 **Blaze**로 전환 (Functions·Scheduler 필수)
2. Apple Developer 유료 멤버십 활성화 후
   - Certificates, Identifiers & Profiles → Keys → **＋** → Apple Push Notifications service (APNs) 체크 → .p8 다운로드, Key ID 메모
   - Identifiers → `com.vibespace.app` → **Push Notifications** 체크
3. Xcode → App 타깃 → Signing & Capabilities → **＋ Capability → Push Notifications** (유료 팀으로 바꾼 뒤)

## 배포
```bash
npm i -g firebase-tools
firebase login
cd functions && npm i && cd ..
firebase use vibespace-b2329
firebase functions:secrets:set APNS_KEY < AuthKey_XXXXXXXXXX.p8
firebase functions:secrets:set APNS_KEY_ID      # 10자리 Key ID
firebase functions:secrets:set APNS_TEAM_ID     # 유료 팀 ID
firebase deploy --only functions
```
- 보안 규칙: `firestore.rules.snippet` 내용을 Firebase 콘솔 → Firestore → 규칙에 추가하고 게시
- 색인: 처음 함수가 돌 때 로그에 나오는 "create index" 링크를 눌러 복합 색인 생성
  (`to + groupKey + pushedAt`, `to + read`)
- Xcode에서 개발용으로 설치한 앱은 sandbox APNs를 씁니다. 그 기기로 테스트할 땐 함수 환경변수 `APNS_SANDBOX=1`
