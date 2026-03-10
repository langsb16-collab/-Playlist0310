<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI 플레이리스트 자동 생성 플랫폼

주제를 입력하면 AI가 음악과 영상을 생성합니다

View your app in AI Studio: https://ai.studio/apps/5167425a-9cca-4cb7-876f-9cf312db495c

## 🌐 배포된 URLs

- **Production**: https://bd88a9fe.playlist0310.pages.dev/
- **GitHub**: https://github.com/langsb16-collab/-Playlist0310
- **커스텀 도메인**: puke365.net (수동 설정 필요)

## ✅ 완료된 기능

1. **React 프론트엔드 빌드 완료**
2. **Cloudflare Pages 배포 완료**
3. **정적 사이트 호스팅 활성화**

## 🚧 미구현 기능 (서버사이드 기능)

이 프로젝트는 원래 Express + Socket.IO + YouTube API를 사용하는 서버사이드 애플리케이션입니다.
Cloudflare Pages는 정적 사이트만 지원하므로 다음 기능들은 현재 작동하지 않습니다:

1. **YouTube OAuth 인증** - 서버사이드 콜백 필요
2. **Socket.IO 실시간 채팅** - WebSocket 서버 필요
3. **API 엔드포인트** - Express 서버 필요
4. **Gemini AI API 호출** - 백엔드 API 라우트 필요

## 🔧 기술 스택

- **Frontend**: React 19, TypeScript, TailwindCSS, Vite
- **Deployment**: Cloudflare Pages
- **Status**: ✅ 프론트엔드만 활성화 (백엔드 미구현)
- **Last Updated**: 2026-03-10

## 🎯 권장 다음 단계

프로젝트를 완전히 작동시키려면 다음 중 하나를 선택해야 합니다:

### 옵션 1: Cloudflare Workers로 백엔드 재구현
- Hono 프레임워크로 API 라우트 구현
- Cloudflare D1/KV로 데이터 저장
- Durable Objects로 실시간 기능 구현

### 옵션 2: 다른 플랫폼 사용
- Vercel/Netlify (서버리스 함수 지원)
- Google Cloud Run (원본 Express 앱 그대로 배포)
- Railway/Render (풀스택 호스팅)

## 🔑 커스텀 도메인 설정 (puke365.net)

Cloudflare 대시보드에서 수동 설정 필요:
1. https://dash.cloudflare.com 로그인
2. Pages > playlist0310 프로젝트 선택
3. Custom domains > Add domain
4. `puke365.net` 입력 및 DNS 레코드 추가

## 📦 로컬 개발

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set environment variables in `.env.local`:
   ```
   GEMINI_API_KEY=your_key_here
   YOUTUBE_CLIENT_ID=your_id_here
   YOUTUBE_CLIENT_SECRET=your_secret_here
   APP_URL=http://localhost:3000
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## 📊 데이터 아키텍처

- **현재**: 정적 프론트엔드만 (상태 관리 없음)
- **필요**: Cloudflare D1 (SQLite) 또는 외부 데이터베이스 연동
