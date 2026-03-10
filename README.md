<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI 플레이리스트 자동 생성 플랫폼

주제를 입력하면 AI가 음악과 영상을 생성합니다

View your app in AI Studio: https://ai.studio/apps/5167425a-9cca-4cb7-876f-9cf312db495c

## 🌐 배포된 URLs

- **Production**: https://848e6208.playlist0310.pages.dev/
- **GitHub**: https://github.com/langsb16-collab/-Playlist0310
- **커스텀 도메인**: puke365.net (Cloudflare 대시보드에서 수동 설정 필요)

## ✅ 현재 상태

### 완료된 작업
1. **✅ React 프론트엔드** - 완전히 작동하는 UI/UX
2. **✅ Cloudflare Pages 배포** - 프로덕션 환경 활성화
3. **✅ 반응형 디자인** - 모바일/데스크톱 최적화
4. **✅ 다국어 지원** - 8개 언어 (한국어, 영어, 중국어, 일본어, 러시아어, 힌디어, 포르투갈어, 인도네시아어)
5. **✅ 프론트엔드 기능** - 플레이리스트 생성, 히스토리, 대시보드, 설정

### 백엔드 API 구현 필요

현재 프론트엔드는 클라이언트사이드 Gemini API를 사용하고 있습니다. 다음 기능들을 위해 백엔드 API가 필요합니다:

1. **YouTube OAuth 인증**
   - `/api/auth/url` - OAuth URL 생성
   - `/auth/callback` - OAuth 콜백 처리
   
2. **Gemini AI API 프록시**
   - `/api/gemini/generate` - AI 플레이리스트 생성
   - API 키 보안 처리

3. **실시간 채팅** (Socket.IO 대체)
   - `/api/chat/send` - 메시지 전송
   - `/api/chat/messages` - 메시지 조회
   - Cloudflare Durable Objects 사용 권장

4. **플레이리스트 저장**
   - `/api/playlists` - CRUD 작업
   - Cloudflare D1 데이터베이스 필요

## 🔧 기술 스택

- **Frontend**: React 19, TypeScript, TailwindCSS, Motion (Framer Motion)
- **AI**: Google Gemini API
- **Deployment**: Cloudflare Pages
- **Icons**: Lucide React
- **Build Tool**: Vite 6
- **Package Manager**: npm

## 🎯 권장 다음 단계

### 1. Cloudflare Workers로 백엔드 API 구현

별도의 Worker로 API를 구현하고 Cloudflare Pages와 연결:

```bash
# 새 Workers 프로젝트 생성
npm create cloudflare@latest playlist0310-api -- --type hello-world

# Hono 프레임워크로 API 라우트 구현
# - YouTube OAuth
# - Gemini AI Proxy  
# - Chat API (Durable Objects)
# - Playlist CRUD (D1 Database)
```

### 2. Cloudflare D1 데이터베이스 설정

플레이리스트 저장을 위한 SQLite 데이터베이스:

```bash
wrangler d1 create playlist0310-db
wrangler d1 migrations create playlist0310-db create_tables
```

### 3. 환경변수 설정

Cloudflare Pages 대시보드에서 설정:
- `GEMINI_API_KEY` - Gemini AI API 키
- `YOUTUBE_CLIENT_ID` - YouTube OAuth 클라이언트 ID
- `YOUTUBE_CLIENT_SECRET` - YouTube OAuth 시크릿
- `APP_URL` - 앱 URL (https://playlist0310.pages.dev)

### 4. 커스텀 도메인 연결

Cloudflare 대시보드에서 `puke365.net` 도메인 연결:
1. https://dash.cloudflare.com 로그인
2. Pages > playlist0310 선택
3. Custom domains > Add domain
4. DNS 레코드 자동 설정

## 📦 로컬 개발

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set environment variables in `.env.local`:
   ```
   GEMINI_API_KEY=your_key_here
   YOUTUBE_CLIENT_ID=your_id_here
   YOUTUBE_CLIENT_SECRET=your_secret_here
   APP_URL=http://localhost:5173
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

5. Deploy to Cloudflare Pages:
   ```bash
   npx wrangler pages deploy dist --project-name playlist0310
   ```

## 🌟 주요 기능

### 현재 작동하는 기능
- ✅ AI 플레이리스트 생성 (테마 기반)
- ✅ 트렌딩 테마 추천
- ✅ 플레이리스트 히스토리
- ✅ 다국어 자동 번역
- ✅ 반응형 UI/UX
- ✅ FAQ 섹션
- ✅ 설정 관리

### 백엔드 구현 필요 기능
- ⏳ YouTube 계정 연결
- ⏳ 유튜브 자동 업로드
- ⏳ 실시간 채팅
- ⏳ 플레이리스트 영구 저장
- ⏳ 사용자 인증

## 📊 프로젝트 구조

```
playlist0310/
├── src/
│   ├── App.tsx           # 메인 애플리케이션
│   ├── constants.ts      # 다국어 번역, FAQ, 추천 테마
│   ├── main.tsx          # 엔트리 포인트
│   └── index.css         # 글로벌 스타일
├── messages/             # 다국어 JSON 파일
│   ├── ko.json
│   ├── en.json
│   └── ...
├── dist/                 # 빌드 출력
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🔒 보안 고려사항

**중요**: 현재 프론트엔드에서 직접 Gemini API를 호출하고 있어 API 키가 노출됩니다.  
프로덕션 환경에서는 반드시 백엔드 프록시를 통해 API를 호출해야 합니다.

## 📝 업데이트 내역

- **2026-03-10**: Cloudflare Pages 배포 완료, React 프론트엔드 구현
- **2026-03-10**: 다국어 지원 추가 (8개 언어)
- **2026-03-10**: 백엔드 API 설계 완료 (구현 대기)

## 💡 도움말

문제가 발생하거나 기능 요청이 있으면 GitHub Issues에 등록해주세요.

---

**Status**: ✅ 프론트엔드 활성화 | ⏳ 백엔드 API 구현 필요  
**Last Updated**: 2026-03-10
