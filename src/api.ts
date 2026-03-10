// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://playlist0310-api.langsb16.workers.dev'

// API Endpoints
export const API_ENDPOINTS = {
  // Health
  health: `${API_BASE_URL}/health`,
  
  // YouTube OAuth
  authUrl: `${API_BASE_URL}/api/auth/url`,
  authExchange: `${API_BASE_URL}/api/auth/exchange`,
  
  // Gemini AI
  geminiGenerate: `${API_BASE_URL}/api/gemini/generate`,
  geminiTranslate: `${API_BASE_URL}/api/gemini/translate`,
  
  // Playlists
  playlists: `${API_BASE_URL}/api/playlists`,
  playlistById: (id: string) => `${API_BASE_URL}/api/playlists/${id}`,
  
  // Chat
  chatSend: `${API_BASE_URL}/api/chat/send`,
  chatMessages: `${API_BASE_URL}/api/chat/messages`,
}

// API Helper Functions
export const apiClient = {
  async get(url: string) {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }
    return response.json()
  },

  async post(url: string, data: any) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }
    return response.json()
  },

  async put(url: string, data: any) {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }
    return response.json()
  },

  async delete(url: string) {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }
    return response.json()
  },
}
