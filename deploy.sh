#!/bin/bash

# GitHub Pages 배포 스크립트
# main 브랜치의 빌드 결과를 gh-pages 브랜치에 배포합니다

set -e

echo "🚀 배포를 시작합니다..."

# 현재 브랜치 저장
CURRENT_BRANCH=$(git branch --show-current)

# main 브랜치로 전환
echo "📦 main 브랜치로 전환 중..."
git checkout main

# 의존성 설치 (필요한 경우)
if [ ! -d "node_modules" ]; then
  echo "📥 의존성 설치 중..."
  pnpm install
fi

# 빌드
echo "🔨 프로젝트 빌드 중..."
pnpm run build

# dist 폴더 확인
if [ ! -d "dist" ]; then
  echo "❌ dist 폴더를 찾을 수 없습니다. 빌드가 실패했을 수 있습니다."
  exit 1
fi

# gh-pages 브랜치로 전환 (없으면 생성)
echo "🌿 gh-pages 브랜치로 전환 중..."
git checkout gh-pages 2>/dev/null || git checkout -b gh-pages

# dist 폴더의 내용을 루트로 복사
echo "📋 빌드 파일 복사 중..."
cp -r dist/* .

# 변경사항 커밋
echo "💾 변경사항 커밋 중..."
git add .
git commit -m "Deploy: $(date +'%Y-%m-%d %H:%M:%S')" || echo "변경사항이 없습니다."

# gh-pages 브랜치 푸시
echo "📤 gh-pages 브랜치 푸시 중..."
git push origin gh-pages

# 원래 브랜치로 돌아가기
echo "↩️  원래 브랜치($CURRENT_BRANCH)로 돌아가는 중..."
git checkout $CURRENT_BRANCH

echo "✅ 배포가 완료되었습니다!"
echo "🌐 배포 링크: https://taejun0.github.io/front_7th_chapter2-1/"

