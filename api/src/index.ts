import { Hono } from 'hono'
import { cors } from 'hono/cors'

// Bindings type for Cloudflare environment
type Bindings = {
  DB: D1Database
  GEMINI_API_KEY: string
  YOUTUBE_CLIENT_ID: string
  YOUTUBE_CLIENT_SECRET: string
  APP_URL: string
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS configuration
app.use('/*', cors({
  origin: ['https://playlist0310.pages.dev', 'https://848e6208.playlist0310.pages.dev', 'https://puke365.net', 'http://localhost:5173'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}))

// Health check
app.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: Date.now(),
    service: 'playlist0310-api'
  })
})

// ==================== YouTube OAuth API ====================

app.get('/api/auth/url', (c) => {
  const YOUTUBE_CLIENT_ID = c.env.YOUTUBE_CLIENT_ID
  const APP_URL = c.env.APP_URL || 'https://playlist0310.pages.dev'
  
  if (!YOUTUBE_CLIENT_ID) {
    return c.json({ error: 'YouTube Client ID not configured' }, 500)
  }
  
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  authUrl.searchParams.set('client_id', YOUTUBE_CLIENT_ID)
  authUrl.searchParams.set('redirect_uri', `${APP_URL}/auth/callback`)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly')
  authUrl.searchParams.set('access_type', 'offline')
  authUrl.searchParams.set('prompt', 'consent')
  
  return c.json({ url: authUrl.toString() })
})

app.post('/api/auth/exchange', async (c) => {
  const { code } = await c.req.json()
  const YOUTUBE_CLIENT_ID = c.env.YOUTUBE_CLIENT_ID
  const YOUTUBE_CLIENT_SECRET = c.env.YOUTUBE_CLIENT_SECRET
  const APP_URL = c.env.APP_URL || 'https://playlist0310.pages.dev'
  
  if (!code) {
    return c.json({ error: 'Authorization code is required' }, 400)
  }

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: YOUTUBE_CLIENT_ID,
        client_secret: YOUTUBE_CLIENT_SECRET,
        redirect_uri: `${APP_URL}/auth/callback`,
        grant_type: 'authorization_code',
      }).toString(),
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      return c.json({ error: 'Failed to exchange token', details: error }, 400)
    }

    const tokens = await tokenResponse.json()
    return c.json(tokens)
  } catch (error) {
    console.error('Error exchanging code for tokens:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// ==================== Gemini AI Proxy API ====================

app.post('/api/gemini/generate', async (c) => {
  const GEMINI_API_KEY = c.env.GEMINI_API_KEY
  
  if (!GEMINI_API_KEY) {
    return c.json({ error: 'Gemini API key not configured' }, 500)
  }

  try {
    const body = await c.req.json()
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    )
    
    if (!response.ok) {
      const error = await response.text()
      return c.json({ error: 'Gemini API error', details: error }, response.status)
    }

    const data = await response.json()
    return c.json(data)
  } catch (error) {
    console.error('Gemini API error:', error)
    return c.json({ error: 'Failed to generate content' }, 500)
  }
})

app.post('/api/gemini/translate', async (c) => {
  const GEMINI_API_KEY = c.env.GEMINI_API_KEY
  
  if (!GEMINI_API_KEY) {
    return c.json({ error: 'Gemini API key not configured' }, 500)
  }

  try {
    const { text, targetLang } = await c.req.json()
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Translate the following text to ${targetLang}. Only return the translated text, nothing else: "${text}"`
            }]
          }]
        }),
      }
    )
    
    if (!response.ok) {
      return c.json({ error: 'Translation failed' }, response.status)
    }

    const data = await response.json()
    const translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || text
    
    return c.json({ translatedText })
  } catch (error) {
    console.error('Translation error:', error)
    return c.json({ error: 'Failed to translate' }, 500)
  }
})

// ==================== Chat API ====================

app.post('/api/chat/send', async (c) => {
  const message = await c.req.json()
  
  // Simple echo implementation
  // In production, use Durable Objects for real-time chat
  return c.json({
    success: true,
    message: {
      ...message,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    }
  })
})

app.get('/api/chat/messages', async (c) => {
  // In production, fetch from Durable Objects or KV
  return c.json({ messages: [] })
})

// ==================== Playlist API (with D1) ====================

app.post('/api/playlists', async (c) => {
  const playlist = await c.req.json()
  const db = c.env.DB
  
  if (!db) {
    return c.json({ error: 'Database not configured' }, 500)
  }

  try {
    const id = crypto.randomUUID()
    const createdAt = new Date().toISOString()

    await db.prepare(`
      INSERT INTO playlists (id, title, theme, songs, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      playlist.title || playlist.theme,
      playlist.theme,
      JSON.stringify(playlist.songs || []),
      playlist.status || 'draft',
      createdAt
    ).run()

    return c.json({
      success: true,
      playlist: {
        id,
        ...playlist,
        createdAt
      }
    })
  } catch (error) {
    console.error('Error creating playlist:', error)
    return c.json({ error: 'Failed to create playlist' }, 500)
  }
})

app.get('/api/playlists', async (c) => {
  const db = c.env.DB
  
  if (!db) {
    return c.json({ error: 'Database not configured' }, 500)
  }

  try {
    const result = await db.prepare(`
      SELECT id, title, theme, songs, status, created_at
      FROM playlists
      ORDER BY created_at DESC
      LIMIT 100
    `).all()

    const playlists = result.results.map((row: any) => ({
      id: row.id,
      title: row.title,
      theme: row.theme,
      songs: JSON.parse(row.songs),
      status: row.status,
      createdAt: row.created_at
    }))

    return c.json({ playlists })
  } catch (error) {
    console.error('Error fetching playlists:', error)
    return c.json({ error: 'Failed to fetch playlists' }, 500)
  }
})

app.get('/api/playlists/:id', async (c) => {
  const id = c.req.param('id')
  const db = c.env.DB
  
  if (!db) {
    return c.json({ error: 'Database not configured' }, 500)
  }

  try {
    const result = await db.prepare(`
      SELECT id, title, theme, songs, status, created_at
      FROM playlists
      WHERE id = ?
    `).bind(id).first()

    if (!result) {
      return c.json({ error: 'Playlist not found' }, 404)
    }

    return c.json({
      id: result.id,
      title: result.title,
      theme: result.theme,
      songs: JSON.parse(result.songs as string),
      status: result.status,
      createdAt: result.created_at
    })
  } catch (error) {
    console.error('Error fetching playlist:', error)
    return c.json({ error: 'Failed to fetch playlist' }, 500)
  }
})

app.put('/api/playlists/:id', async (c) => {
  const id = c.req.param('id')
  const updates = await c.req.json()
  const db = c.env.DB
  
  if (!db) {
    return c.json({ error: 'Database not configured' }, 500)
  }

  try {
    await db.prepare(`
      UPDATE playlists
      SET title = ?, theme = ?, songs = ?, status = ?
      WHERE id = ?
    `).bind(
      updates.title,
      updates.theme,
      JSON.stringify(updates.songs),
      updates.status,
      id
    ).run()

    return c.json({ success: true, id })
  } catch (error) {
    console.error('Error updating playlist:', error)
    return c.json({ error: 'Failed to update playlist' }, 500)
  }
})

app.delete('/api/playlists/:id', async (c) => {
  const id = c.req.param('id')
  const db = c.env.DB
  
  if (!db) {
    return c.json({ error: 'Database not configured' }, 500)
  }

  try {
    await db.prepare(`
      DELETE FROM playlists WHERE id = ?
    `).bind(id).run()

    return c.json({ success: true, id })
  } catch (error) {
    console.error('Error deleting playlist:', error)
    return c.json({ error: 'Failed to delete playlist' }, 500)
  }
})

// Root endpoint
app.get('/', (c) => {
  return c.json({
    name: 'Playlist0310 API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth/url',
      gemini: '/api/gemini/generate',
      playlists: '/api/playlists',
      chat: '/api/chat/send'
    }
  })
})

export default app
