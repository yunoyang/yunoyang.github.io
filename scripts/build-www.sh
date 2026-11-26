#!/bin/bash
# 정적 사이트 루트 파일을 Capacitor webDir(www/)로 복사
# node_modules, .git, ios/android 네이티브 프로젝트, npm/capacitor 설정 파일은 제외
# 앱 용량 절감: 3D 모델·예시 평면도는 웹(vibespacekorea.com)에서 받아오고, 관리자·랜딩·문서 파일은 앱에 넣지 않음
set -e
cd "$(dirname "$0")/.."
mkdir -p www
rsync -a --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'ios' \
  --exclude 'android' \
  --exclude 'www' \
  --exclude 'scripts' \
  --exclude 'functions' \
  --exclude 'functions-ai' \
  --exclude 'package.json' \
  --exclude 'package-lock.json' \
  --exclude 'capacitor.config.json' \
  --exclude 'assets/models' \
  --exclude 'assets/plans' \
  --exclude 'admin.html' \
  --exclude 'design-guide.html' \
  --exclude 'icons.html' \
  --exclude 'landing*.html' \
  --exclude 'landing-bg-*.jpg' \
  --exclude 'contractor.html' \
  --exclude 'docs' \
  --exclude 'records' \
  --exclude 'functions-account' \
  --exclude 'plans' \
  --exclude '.claude' \
  --exclude '.github' \
  --exclude '*.command' \
  --exclude '*.md' \
  --delete-excluded \
  ./ www/
echo "www/ 동기화 완료"
