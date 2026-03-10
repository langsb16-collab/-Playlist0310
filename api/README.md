# Playlist0310 API

Backend API for Playlist0310 AI Playlist Generator

## 🌐 Deployed API

**Production URL**: https://playlist0310-api.langsb16.workers.dev

## 🚀 Endpoints

### Health Check
```
GET /health
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

### Playlists (with D1 Database)
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

## ⚙️ Environment Variables

The following secrets must be set using `wrangler secret put`:

```bash
# Set Gemini API Key
wrangler secret put GEMINI_API_KEY

# Set YouTube OAuth credentials
wrangler secret put YOUTUBE_CLIENT_ID
wrangler secret put YOUTUBE_CLIENT_SECRET
```

APP_URL is already configured in `wrangler.toml`.

## 🗄️ Database

Uses Cloudflare D1 (SQLite):
- **Database**: webapp-production
- **ID**: 785b47fb-de85-4a9f-a6a3-faa674d676e8

### Database Schema

```sql
CREATE TABLE playlists (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  theme TEXT NOT NULL,
  songs TEXT NOT NULL,  -- JSON string
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Development

### Install Dependencies
```bash
npm install
```

### Run Locally
```bash
npm run dev
```

### Apply Database Migrations
```bash
# Local
npm run db:migrate:local

# Production
npm run db:migrate
```

### Deploy to Cloudflare Workers
```bash
npm run deploy
```

## 🔒 Security

- CORS configured for specific origins
- API keys stored as Cloudflare Secrets
- D1 database with SQL injection protection

## 📊 Tech Stack

- **Runtime**: Cloudflare Workers
- **Framework**: Hono
- **Database**: Cloudflare D1 (SQLite)
- **Language**: TypeScript
- **Deployment**: Wrangler CLI

## ✅ Status

All endpoints are deployed and functional. Secrets need to be configured for full functionality:

- ✅ Health check
- ✅ CORS configuration
- ✅ D1 Database connected
- ⏳ YouTube OAuth (needs secrets)
- ⏳ Gemini AI (needs secret)
- ✅ Playlist CRUD
- ✅ Chat API

## 📝 Next Steps

1. Set environment secrets:
   ```bash
   export CLOUDFLARE_API_TOKEN="your-token"
   cd /home/user/playlist0310-api
   
   # Set secrets interactively
   npx wrangler secret put GEMINI_API_KEY
   npx wrangler secret put YOUTUBE_CLIENT_ID
   npx wrangler secret put YOUTUBE_CLIENT_SECRET
   ```

2. Update frontend to use this API:
   - Change API base URL to `https://playlist0310-api.langsb16.workers.dev`
   - Update all fetch calls to use the new endpoints

## 🔗 Related Projects

- **Frontend**: https://github.com/langsb16-collab/-Playlist0310
- **Deployed**: https://playlist0310.pages.dev

---

**Last Updated**: 2026-03-10
