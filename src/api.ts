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
    try {
      console.log('API GET:', url);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      })
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      return data;
    } catch (error) {
      console.error('API GET Error:', error);
      throw error;
    }
  },

  async post(url: string, data: any) {
    try {
      console.log('API POST:', url, data);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API Error ${response.status}: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log('API Response:', responseData);
      return responseData;
    } catch (error) {
      console.error('API POST Error:', error);
      throw error;
    }
  },

  async put(url: string, data: any) {
    try {
      console.log('API PUT:', url, data);
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API Error ${response.status}: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log('API Response:', responseData);
      return responseData;
    } catch (error) {
      console.error('API PUT Error:', error);
      throw error;
    }
  },

  async delete(url: string) {
    try {
      console.log('API DELETE:', url);
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      })
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      return data;
    } catch (error) {
      console.error('API DELETE Error:', error);
      throw error;
    }
  },
}
