#!/bin/bash
# 정적 사이트 루트 파일을 Capacitor webDir(www/)로 복사
# node_modules, .git, ios/android 네이티브 프로젝트, npm/capacitor 설정 파일은 제외
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
  --exclude 'package.json' \
  --exclude 'package-lock.json' \
  --exclude 'capacitor.config.json' \
  ./ www/
echo "www/ 동기화 완료"
