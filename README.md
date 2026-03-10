<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI 플레이리스트 자동 생성 플랫폼

주제를 입력하면 AI가 음악과 영상을 생성합니다

View your app in AI Studio: https://ai.studio/apps/5167425a-9cca-4cb7-876f-9cf312db495c

## 🌐 배포된 URLs

- **Frontend**: https://848e6208.playlist0310.pages.dev/
- **Backend API**: https://playlist0310-api.langsb16.workers.dev
- **GitHub Frontend**: https://github.com/langsb16-collab/-Playlist0310
- **커스텀 도메인**: puke365.net (Cloudflare 대시보드에서 수동 설정 필요)

## ✅ 완료된 작업

### Frontend (Cloudflare Pages)
1. **✅ React 프론트엔드** - 완전히 작동하는 UI/UX
2. **✅ 반응형 디자인** - 모바일/데스크톱 최적화
3. **✅ 다국어 지원** - 8개 언어 (한국어, 영어, 중국어, 일본어, 러시아어, 힌디어, 포르투갈어, 인도네시아어)
4. **✅ 프론트엔드 기능** - 플레이리스트 생성, 히스토리, 대시보드, 설정

### Backend API (Cloudflare Workers)
1. **✅ YouTube OAuth 인증** - `/api/auth/url`, `/api/auth/exchange`
2. **✅ Gemini AI 프록시** - `/api/gemini/generate`, `/api/gemini/translate`
3. **✅ 플레이리스트 CRUD** - Cloudflare D1 데이터베이스 연동
4. **✅ 채팅 API** - `/api/chat/send`, `/api/chat/messages`
5. **✅ CORS 설정** - 프론트엔드 도메인 허용
6. **✅ 보안 구성** - API 키는 Cloudflare Secrets로 보호

## 🔧 기술 스택

### Frontend
- **Framework**: React 19, TypeScript
- **Styling**: TailwindCSS
- **Animation**: Motion (Framer Motion)
- **Icons**: Lucide React
- **Build**: Vite 6
- **Deployment**: Cloudflare Pages

### Backend
- **Runtime**: Cloudflare Workers
- **Framework**: Hono
- **Database**: Cloudflare D1 (SQLite)
- **AI**: Google Gemini API
- **OAuth**: YouTube API v3

## 🚀 주요 기능

### ✅ 현재 작동하는 기능
- AI 플레이리스트 생성 (Gemini API via 백엔드)
- 트렌딩 테마 추천
- 플레이리스트 히스토리 (D1 데이터베이스)
- 다국어 자동 번역
- 반응형 UI/UX
- FAQ 섹션
- 설정 관리

### ⏳ 추가 구현 필요
- YouTube 계정 연결 (OAuth 코드 완성 필요)
- 유튜브 자동 업로드
- 실시간 채팅 (Durable Objects 필요)

## ⚙️ 환경 설정

### Frontend 환경변수
`.env.local` 파일 생성:
```bash
VITE_API_BASE_URL=https://playlist0310-api.langsb16.workers.dev
```

### Backend Secrets (필수)
다음 Secrets를 Cloudflare Workers에 설정해야 합니다:

```bash
export CLOUDFLARE_API_TOKEN="your-token"
cd /home/user/playlist0310-api

# Set secrets
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put YOUTUBE_CLIENT_ID
npx wrangler secret put YOUTUBE_CLIENT_SECRET
```

**주의**: Secrets를 설정하지 않으면 Gemini AI와 YouTube OAuth가 작동하지 않습니다!

## 📦 로컬 개발

### Frontend
```bash
cd /home/user/playlist0310
npm install
npm run dev
```

### Backend API
```bash
cd /home/user/playlist0310-api
npm install
npm run dev  # 로컬 서버: http://localhost:8787
```

## 🚀 배포

### Frontend
```bash
cd /home/user/playlist0310
npm run build
npx wrangler pages deploy dist --project-name playlist0310
```

### Backend API
```bash
cd /home/user/playlist0310-api
npm run deploy
```

## 📊 API 엔드포인트

### YouTube OAuth
- `GET /api/auth/url` - OAuth 인증 URL 생성
- `POST /api/auth/exchange` - 인증 코드를 토큰으로 교환

### Gemini AI
- `POST /api/gemini/generate` - AI 콘텐츠 생성
- `POST /api/gemini/translate` - 텍스트 번역

### Playlists
- `GET /api/playlists` - 플레이리스트 목록
- `POST /api/playlists` - 플레이리스트 생성
- `GET /api/playlists/:id` - 플레이리스트 조회
- `PUT /api/playlists/:id` - 플레이리스트 수정
- `DELETE /api/playlists/:id` - 플레이리스트 삭제

### Chat
- `POST /api/chat/send` - 메시지 전송
- `GET /api/chat/messages` - 메시지 조회

## 🔒 보안

- ✅ API 키는 Cloudflare Secrets로 보호
- ✅ CORS 설정으로 허용된 도메인만 접근
- ✅ D1 데이터베이스는 SQL injection 방지
- ✅ 환경변수는 Git에 커밋되지 않음

## 🎯 다음 단계

1. **Secrets 설정** (가장 중요!)
   ```bash
   npx wrangler secret put GEMINI_API_KEY
   npx wrangler secret put YOUTUBE_CLIENT_ID
   npx wrangler secret put YOUTUBE_CLIENT_SECRET
   ```

2. **프론트엔드 재배포** (API 연결 포함)
   ```bash
   cd /home/user/playlist0310
   npm run build
   npx wrangler pages deploy dist --project-name playlist0310
   ```

3. **puke365.net 커스텀 도메인 연결**
   - Cloudflare 대시보드에서 설정
   - DNS 레코드 자동 추가

4. **YouTube OAuth 완성**
   - 프론트엔드에서 OAuth 플로우 완성
   - 토큰 저장 및 갱신 로직 구현

5. **실시간 채팅 구현**
   - Cloudflare Durable Objects 사용
   - WebSocket 연결

## 📝 프로젝트 구조

```
playlist0310/                    # Frontend
├── src/
│   ├── App.tsx                  # 메인 애플리케이션
│   ├── api.ts                   # API 클라이언트
│   ├── constants.ts             # 다국어, FAQ
│   └── main.tsx
├── dist/                        # 빌드 출력
└── package.json

playlist0310-api/                # Backend
├── src/
│   └── index.ts                 # API 서버
├── migrations/
│   └── 0001_create_playlists.sql
├── wrangler.toml                # Cloudflare 설정
└── package.json
```

## 💡 문제 해결

### API 연결 오류
- CORS 설정 확인
- API URL이 올바른지 확인
- Secrets가 설정되었는지 확인

### 데이터베이스 오류
- D1 마이그레이션 실행 확인
- `npm run db:migrate` 실행

### 배포 오류
- Cloudflare API 토큰 확인
- `npx wrangler whoami`로 인증 확인

## 📞 지원

문제가 발생하거나 기능 요청이 있으면 GitHub Issues에 등록해주세요.

---

**Status**: ✅ 프론트엔드 + 백엔드 API 배포 완료 | ⏳ Secrets 설정 필요  
**Last Updated**: 2026-03-10
