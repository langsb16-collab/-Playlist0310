<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI 플레이리스트 자동 생성 플랫폼

주제를 입력하면 AI가 음악과 영상을 생성합니다

## 🌐 배포된 URLs

- **메인 사이트**: https://puke365.net ⭐
- **Frontend (Cloudflare Pages)**: https://playlist0310.pages.dev
- **Backend API (Cloudflare Workers)**: https://playlist0310-api.langsb16.workers.dev
- **GitHub**: https://github.com/langsb16-collab/-Playlist0310

## ✅ 완료된 기능

### 🎨 Frontend (React + Cloudflare Pages)
- ✅ AI 플레이리스트 생성
- ✅ 트렌딩 테마 추천
- ✅ 다국어 지원 (8개 언어)
- ✅ 반응형 디자인
- ✅ 플레이리스트 히스토리
- ✅ 대시보드 & 설정

### ⚙️ Backend API (Hono + Cloudflare Workers)
- ✅ YouTube OAuth 인증 (`/api/auth/url`, `/api/auth/exchange`)
- ✅ Gemini AI 프록시 (`/api/gemini/generate`, `/api/gemini/translate`)
- ✅ 플레이리스트 CRUD (Cloudflare D1 데이터베이스)
- ✅ 채팅 API (`/api/chat/send`, `/api/chat/messages`)
- ✅ CORS 및 보안 구성
- ✅ Secrets 관리 (API 키 보호)

### 🗄️ Database (Cloudflare D1)
- ✅ SQLite 기반 글로벌 분산 데이터베이스
- ✅ 플레이리스트 영구 저장
- ✅ 마이그레이션 적용 완료

## 🔧 기술 스택

### Frontend
- React 19, TypeScript, TailwindCSS
- Motion (Framer Motion), Lucide React
- Vite 6, Cloudflare Pages

### Backend
- Cloudflare Workers, Hono Framework
- Cloudflare D1 (SQLite), TypeScript
- Google Gemini API, YouTube API v3

## 📦 프로젝트 구조

```
playlist0310/
├── src/                        # Frontend 소스
│   ├── App.tsx
│   ├── api.ts                  # API 클라이언트
│   ├── constants.ts
│   └── main.tsx
├── api/                        # Backend API
│   ├── src/
│   │   └── index.ts            # Hono API 서버
│   ├── migrations/
│   │   └── 0001_create_playlists.sql
│   ├── wrangler.toml
│   └── package.json
├── dist/                       # Frontend 빌드 출력
└── package.json
```

## 🚀 로컬 개발

### Frontend
```bash
cd /home/user/playlist0310
npm install
npm run dev
```

### Backend API
```bash
cd /home/user/playlist0310/api
npm install
npm run dev  # http://localhost:8787
```

## 📡 API 엔드포인트

### Health Check
```
GET https://playlist0310-api.langsb16.workers.dev/health
```

### YouTube OAuth
```
GET /api/auth/url
POST /api/auth/exchange
```

### Gemini AI
```
POST /api/gemini/generate
POST /api/gemini/translate
```

### Playlists (D1 Database)
```
GET /api/playlists
POST /api/playlists
GET /api/playlists/:id
PUT /api/playlists/:id
DELETE /api/playlists/:id
```

### Chat
```
POST /api/chat/send
GET /api/chat/messages
```

## 🔒 보안 & 환경변수

### Cloudflare Secrets (설정 완료)
```bash
✅ GEMINI_API_KEY
✅ YOUTUBE_CLIENT_ID
✅ YOUTUBE_CLIENT_SECRET
```

### 환경변수
- `APP_URL`: https://puke365.net (wrangler.toml 설정)

## 🚀 배포

### Frontend 배포
```bash
cd /home/user/playlist0310
npm run build
npx wrangler pages deploy dist --project-name playlist0310
```

### Backend API 배포
```bash
cd /home/user/playlist0310/api
npx wrangler deploy
```

### 데이터베이스 마이그레이션
```bash
cd /home/user/playlist0310/api
npm run db:migrate        # Production
npm run db:migrate:local  # Local
```

## 🌍 도메인 설정

**메인 도메인**: https://puke365.net ✅ 설정 완료

Cloudflare Pages에 다음 도메인이 연결되어 있습니다:
- `puke365.net` (메인)
- `www.puke365.net`
- `playlist0310.pages.dev`

## 🎯 주요 기능

### ✅ 현재 작동
- AI 플레이리스트 생성 (Gemini API)
- 트렌딩 테마 추천
- 다국어 자동 번역
- 플레이리스트 히스토리 저장 (D1)
- 반응형 UI/UX
- FAQ 및 설정

### ⏳ 추가 개발 필요
- YouTube OAuth 플로우 완성
- 유튜브 자동 업로드
- 실시간 채팅 (Durable Objects)
- 사용자 인증 시스템

## 🧪 테스트

### API 테스트
```bash
# Health Check
curl https://playlist0310-api.langsb16.workers.dev/health

# Gemini Translation Test
curl -X POST https://playlist0310-api.langsb16.workers.dev/api/gemini/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello","targetLang":"Korean"}'
```

### Frontend 테스트
```bash
# Main domain
curl https://puke365.net/

# Cloudflare Pages
curl https://playlist0310.pages.dev/
```

## 📊 데이터베이스

### D1 Database
- **Name**: webapp-production
- **ID**: 785b47fb-de85-4a9f-a6a3-faa674d676e8

### Schema
```sql
CREATE TABLE playlists (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  theme TEXT NOT NULL,
  songs TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

## 🔑 Secrets 업데이트

Secrets를 업데이트하려면:
```bash
export CLOUDFLARE_API_TOKEN="your-token"
cd /home/user/playlist0310/api

npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put YOUTUBE_CLIENT_ID
npx wrangler secret put YOUTUBE_CLIENT_SECRET
```

## 📝 Git 워크플로우

```bash
# Frontend 변경사항 커밋
cd /home/user/playlist0310
git add .
git commit -m "Update frontend"
git push origin main

# API만 재배포
cd api
npx wrangler deploy
```

## 🎉 성과

- ✅ 완전한 풀스택 애플리케이션
- ✅ 서버리스 아키텍처 (비용 효율적)
- ✅ 글로벌 엣지 네트워크 (빠른 속도)
- ✅ 보안 API 키 관리
- ✅ 영구 데이터 저장 (D1)
- ✅ 커스텀 도메인 연결
- ✅ CI/CD 준비 완료

## 💡 문제 해결

### API 연결 오류
- CORS 설정 확인
- Secrets 설정 확인

### 데이터베이스 오류
- 마이그레이션 실행: `npm run db:migrate`

### 배포 오류
- Cloudflare 인증 확인: `npx wrangler whoami`

## 📞 지원

GitHub Issues: https://github.com/langsb16-collab/-Playlist0310/issues

---

**Status**: ✅ 프로덕션 배포 완료  
**Main URL**: https://puke365.net  
**Last Updated**: 2026-03-10
