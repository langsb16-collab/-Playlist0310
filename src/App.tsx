import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { 
  Music, 
  Youtube, 
  MessageSquare, 
  HelpCircle, 
  Globe, 
  Send, 
  Plus, 
  Play, 
  CheckCircle2, 
  AlertCircle,
  X,
  Mic,
  Video,
  Image as ImageIcon,
  LayoutDashboard,
  History,
  Settings as SettingsIcon,
  TrendingUp,
  BarChart3,
  Search,
  ChevronRight,
  Download,
  Share2,
  Trash2,
  Edit3
} from "lucide-react";
import { translations, faqs, recommendationCategories, trendingThemes } from './constants';
import { API_ENDPOINTS, apiClient } from './api';

// All AI processing is done through backend API - no client-side Gemini initialization needed

type Language = keyof typeof translations;
type View = 'home' | 'generator' | 'dashboard' | 'history' | 'settings';

interface Song {
  title: string;
  artist: string;
  id?: string;
}

interface Playlist {
  id: string;
  title: string;
  theme: string;
  songs: Song[];
  createdAt: string;
  status: 'draft' | 'rendered' | 'uploaded';
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'other';
  lang: Language;
  translatedText?: string;
}

export default function App() {
  const [lang, setLang] = useState<Language>('ko');
  const [activeView, setActiveView] = useState<View>('home');
  const [showDemo, setShowDemo] = useState(false);
  const [theme, setTheme] = useState('');
  const [count, setCount] = useState(10);
  const [currentPlaylist, setCurrentPlaylist] = useState<Song[]>([]);
  const [history, setHistory] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFAQOpen, setIsFAQOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [youtubeConnected, setYoutubeConnected] = useState(false);
  const [tokens, setTokens] = useState<any>(null);

  // Socket.IO removed - using REST API instead
  const t = translations[lang];

  useEffect(() => {
    const handleOAuth = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        setYoutubeConnected(true);
        setTokens(event.data.tokens);
      }
    };
    window.addEventListener('message', handleOAuth);

    // Load playlists from backend
    loadPlaylistHistory();

    return () => {
      window.removeEventListener('message', handleOAuth);
    };
  }, []);

  const loadPlaylistHistory = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.playlists);
      if (response.playlists && Array.isArray(response.playlists)) {
        setHistory(response.playlists);
      }
    } catch (error) {
      console.error('Failed to load playlist history:', error);
    }
  };

  const handleIncomingMessage = async (msg: ChatMessage) => {
    if (msg.lang !== lang) {
      const translated = await translateText(msg.text, lang);
      setMessages(prev => [...prev, { ...msg, translatedText: translated }]);
    } else {
      setMessages(prev => [...prev, msg]);
    }
  };

  const translateText = async (text: string, targetLang: string) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.geminiTranslate, {
        text,
        targetLang
      });
      return response.translatedText || text;
    } catch (error) {
      console.error("Translation error", error);
      return text;
    }
  };

  const generatePlaylist = async (customTheme?: string) => {
    const targetTheme = customTheme || theme;
    if (!targetTheme) {
      alert('테마를 입력해주세요!');
      return;
    }
    setLoading(true);
    setActiveView('generator');
    try {
      // Use backend API instead of direct Gemini call
      const response = await apiClient.post(API_ENDPOINTS.geminiGenerate, {
        contents: [{
          parts: [{
            text: `Recommend ${count} songs for the theme: "${targetTheme}". Return ONLY a JSON array of objects with "title" and "artist" properties, nothing else. Format: [{"title": "song name", "artist": "artist name"}]`
          }]
        }]
      });
      
      // Parse the response
      let data = [];
      if (response.candidates && response.candidates[0]?.content?.parts[0]?.text) {
        let textContent = response.candidates[0].content.parts[0].text;
        
        // Remove markdown code blocks if present
        textContent = textContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        try {
          data = JSON.parse(textContent);
        } catch (parseError) {
          console.error('JSON parse error:', parseError, 'Content:', textContent);
          throw new Error('응답 파싱 실패');
        }
      }
      
      if (!data || data.length === 0) {
        throw new Error('No songs generated');
      }
      
      setCurrentPlaylist(data);
      
      // Save to backend database
      const newPlaylist: Playlist = {
        id: Date.now().toString(),
        title: targetTheme,
        theme: targetTheme,
        songs: data,
        createdAt: new Date().toISOString(),
        status: 'draft'
      };
      
      // Save to backend
      await apiClient.post(API_ENDPOINTS.playlists, newPlaylist);
      
      // Add to local history
      setHistory(prev => [newPlaylist, ...prev]);
      
      alert(`${data.length}개의 노래로 플레이리스트가 생성되었습니다!`);
    } catch (error: any) {
      console.error("Playlist generation error", error);
      let errorMessage = '플레이리스트 생성 중 오류가 발생했습니다.';
      
      if (error.message && error.message.includes('API Error 500')) {
        errorMessage += '\n\n⚠️ Gemini API 키가 설정되지 않았거나 잘못되었습니다.\n관리자에게 문의하세요.';
      } else if (error.message && error.message.includes('Failed to fetch')) {
        errorMessage += '\n\n⚠️ 백엔드 API 서버에 연결할 수 없습니다.\n네트워크 연결을 확인해주세요.';
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleManualAdd = () => {
    const song = prompt("Enter song (Artist - Title)");
    if (song) {
      const [artist, title] = song.split('-').map(s => s.trim());
      setCurrentPlaylist(prev => [...prev, { title: title || artist, artist: title ? artist : 'Unknown' }]);
    }
  };

  const handlePlaySong = (song: Song) => {
    // YouTube search URL
    const searchQuery = encodeURIComponent(`${song.artist} ${song.title}`);
    window.open(`https://www.youtube.com/results?search_query=${searchQuery}`, '_blank');
  };

  const handleSharePlaylist = () => {
    const playlistText = currentPlaylist.map((s, i) => `${i + 1}. ${s.title} - ${s.artist}`).join('\n');
    const text = `🎵 My Playlist:\n\n${playlistText}`;
    
    if (navigator.share) {
      navigator.share({
        title: theme || 'My Playlist',
        text: text,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert('플레이리스트가 클립보드에 복사되었습니다!');
    }
  };

  const handleDownloadPlaylist = () => {
    const playlistText = currentPlaylist.map((s, i) => `${i + 1}. ${s.title} - ${s.artist}`).join('\n');
    const blob = new Blob([playlistText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${theme || 'playlist'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteSong = (index: number) => {
    setCurrentPlaylist(prev => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      lang: lang
    };
    setMessages(prev => [...prev, msg]);
    
    // Send to backend API
    try {
      await apiClient.post(API_ENDPOINTS.chatSend, msg);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
    
    setInputText('');
  };

  const connectYoutube = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.authUrl);
      if (response.configured === false) {
        alert('YouTube 연결 기능이 아직 구성되지 않았습니다.\n\n관리자가 YouTube OAuth 자격증명을 설정해야 합니다.\n\n현재는 플레이리스트 생성 기능만 사용 가능합니다.');
        return;
      }
      if (response.url) {
        window.open(response.url, 'youtube_auth', 'width=600,height=700');
      } else {
        alert('YouTube 인증 URL을 가져올 수 없습니다.');
      }
    } catch (error: any) {
      console.error('YouTube connection error:', error);
      if (error.message && error.message.includes('500')) {
        alert('YouTube 연결 기능이 아직 구성되지 않았습니다.\n\n관리자가 YouTube OAuth 자격증명을 설정해야 합니다.\n\n현재는 플레이리스트 생성 기능만 사용 가능합니다.');
      } else {
        alert('YouTube 연결 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col">
      {/* Desktop Sidebar Navigation */}
      <nav className="hidden md:flex w-20 lg:w-64 bg-[#1428A0] text-white flex-col h-screen fixed left-0 top-0 z-50">
        <div className="p-6 flex items-center gap-3">
          <Music className="w-8 h-8" />
          <h1 className="text-xl font-bold tracking-tight hidden lg:block">AI Playlist</h1>
        </div>
        
        <div className="flex-1 px-4 space-y-2">
          {[
            { id: 'home', icon: Globe, label: t.nav.home },
            { id: 'generator', icon: Music, label: t.nav.playlist },
            { id: 'dashboard', icon: LayoutDashboard, label: t.nav.dashboard },
            { id: 'history', icon: History, label: t.nav.history },
            { id: 'settings', icon: SettingsIcon, label: t.nav.settings }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as View)}
              className={`w-full flex items-center gap-4 p-3 rounded-2xl transition ${
                activeView === item.id ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="hidden lg:block font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6 border-t border-white/10">
          <div className="flex items-center gap-3 text-white/40 text-xs font-bold uppercase tracking-widest">
            <Globe className="w-4 h-4" />
            <span className="hidden lg:block">Global Support</span>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-inset-bottom">
        <div className="flex justify-around items-center px-2 py-3">
          {[
            { id: 'home', icon: Globe, label: t.nav.home },
            { id: 'generator', icon: Music, label: t.nav.playlist },
            { id: 'dashboard', icon: LayoutDashboard, label: t.nav.dashboard },
            { id: 'history', icon: History, label: t.nav.history },
            { id: 'settings', icon: SettingsIcon, label: t.nav.settings }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as View)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition ${
                activeView === item.id ? 'text-[#1428A0]' : 'text-gray-400'
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-1 p-4 md:p-10 md:ml-20 lg:ml-64 pb-20 md:pb-10 overflow-y-auto relative">
        {/* Top Right Language Switcher */}
        <div className="absolute top-6 right-6 md:top-10 md:right-10 z-40">
          <div className="relative group">
            <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm hover:border-[#1428A0] transition min-w-[120px] justify-between">
              <span className="text-sm font-bold text-gray-700">
                {lang === 'ko' ? '한국어' : lang === 'en' ? 'English' : lang === 'zh' ? '中文' : lang === 'ja' ? '日本語' : lang === 'ru' ? 'Русский' : lang === 'hi' ? 'हिन्दी' : lang === 'pt' ? 'Português' : 'Indonesia'}
              </span>
              <Globe className="w-4 h-4 text-gray-400" />
            </button>
            <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none group-hover:pointer-events-auto border border-gray-100 overflow-hidden z-50">
              {(Object.keys(translations) as Language[]).map(l => (
                <button 
                  key={l}
                  onClick={() => setLang(l)}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 text-sm transition ${lang === l ? 'text-[#1428A0] font-bold bg-blue-50' : 'text-gray-600'}`}
                >
                  {l === 'ko' ? '한국어' : l === 'en' ? 'English' : l === 'zh' ? '中文' : l === 'ja' ? '日本語' : l === 'ru' ? 'Русский' : l === 'hi' ? 'हिन्दी' : l === 'pt' ? 'Português' : 'Indonesia'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeView === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <section className="text-center md:text-left">
                <h2 className="text-4xl md:text-6xl font-black mb-4 text-[#1428A0] leading-tight">
                  {t.hero.title}
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mb-8">
                  {t.hero.desc}
                </p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <button 
                    onClick={() => setActiveView('generator')}
                    className="bg-[#1428A0] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-[#0F1E7A] transition shadow-xl shadow-blue-200"
                  >
                    {t.button.getStarted}
                  </button>
                  <button 
                    onClick={() => setShowDemo(true)}
                    className="bg-white text-[#1428A0] px-8 py-4 rounded-2xl font-bold text-lg border-2 border-[#1428A0] hover:bg-blue-50 transition"
                  >
                    {t.button.watchDemo}
                  </button>
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    <TrendingUp className="text-orange-500" /> Trending Themes
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {trendingThemes.map((theme, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => generatePlaylist(theme)}
                      className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100 text-left hover:border-[#1428A0] transition group"
                    >
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#1428A0] transition">
                        <Music className="w-5 h-5 text-[#1428A0] group-hover:text-white transition" />
                      </div>
                      <p className="font-bold text-gray-800 line-clamp-2">{theme}</p>
                    </motion.button>
                  ))}
                </div>
              </section>

              <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
                  <BarChart3 className="w-10 h-10 text-blue-500 mb-6" />
                  <h4 className="text-xl font-bold mb-2">AI Analytics</h4>
                  <p className="text-gray-500 text-sm">Analyze trending keywords and optimize your channel growth automatically.</p>
                </div>
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
                  <Youtube className="w-10 h-10 text-red-500 mb-6" />
                  <h4 className="text-xl font-bold mb-2">Auto Upload</h4>
                  <p className="text-gray-500 text-sm">Schedule and upload videos to 100+ channels simultaneously with one click.</p>
                </div>
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
                  <Globe className="w-10 h-10 text-emerald-500 mb-6" />
                  <h4 className="text-xl font-bold mb-2">Global Reach</h4>
                  <p className="text-gray-500 text-sm">Automatically translate titles and descriptions into 8+ languages.</p>
                </div>
              </section>
            </motion.div>
          )}

          {activeView === 'generator' && (
            <motion.div 
              key="generator"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-10"
            >
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
                  <h3 className="text-2xl font-bold mb-6">{t.generator.theme}</h3>
                  <div className="space-y-6">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input 
                        type="text" 
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        placeholder="e.g. Rainy day jazz for studying"
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#1428A0] outline-none transition"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {recommendationCategories.map((cat) => (
                        <div key={cat.id}>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">{cat.label[lang]}</label>
                          <div className="flex flex-wrap gap-2">
                            {cat.items.map((item) => (
                              <button 
                                key={item}
                                onClick={() => setTheme(prev => prev ? `${prev} ${item}` : item)}
                                className="px-3 py-1.5 bg-gray-50 rounded-lg text-sm font-medium hover:bg-blue-50 hover:text-[#1428A0] transition"
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-4 pt-4">
                      <div className="flex-1">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">{t.generator.count}</label>
                        <input 
                          type="number" 
                          value={count}
                          onChange={(e) => setCount(parseInt(e.target.value))}
                          className="w-full p-4 rounded-2xl bg-gray-50 border-none outline-none"
                        />
                      </div>
                      <div className="flex items-end">
                        <button 
                          onClick={() => generatePlaylist()}
                          disabled={loading}
                          className="bg-[#1428A0] text-white px-10 py-4 rounded-2xl font-bold hover:bg-[#0F1E7A] transition disabled:opacity-50"
                        >
                          {loading ? "Generating..." : t.button.generate}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {currentPlaylist.length > 0 && (
                  <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold">Generated Playlist</h3>
                      <div className="flex gap-2">
                        <button 
                          onClick={handleDownloadPlaylist}
                          className="p-2 hover:bg-gray-100 rounded-lg transition"
                          title="Download playlist"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={handleSharePlaylist}
                          className="p-2 hover:bg-gray-100 rounded-lg transition"
                          title="Share playlist"
                        >
                          <Share2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {currentPlaylist.map((song, i) => (
                        <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition group">
                          <div className="flex items-center gap-4">
                            <span className="text-gray-300 font-mono text-sm">{i + 1}</span>
                            <div>
                              <p className="font-bold">{song.title}</p>
                              <p className="text-sm text-gray-400">{song.artist}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                            <button 
                              onClick={() => handlePlaySong(song)}
                              className="p-2 text-gray-400 hover:text-[#1428A0]"
                              title="Play on YouTube"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteSong(i)}
                              className="p-2 text-gray-400 hover:text-red-500"
                              title="Delete song"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-8">
                <div className="bg-[#0F172A] rounded-[40px] p-8 text-white aspect-square flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1428A0]/40 to-transparent" />
                  <ImageIcon className="w-20 h-20 mb-6 text-white/20" />
                  <p className="text-white/60 font-medium text-center px-10">Video Preview will appear here after rendering</p>
                  {currentPlaylist.length > 0 && (
                    <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/10">
                      <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Selected Template</p>
                      <p className="font-bold text-lg">Cinematic Emotional</p>
                    </div>
                  )}
                </div>

                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
                  <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                    <Youtube className="text-red-600" /> YouTube Upload
                  </h3>
                  {!youtubeConnected ? (
                    <button 
                      onClick={connectYoutube}
                      className="w-full py-6 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 font-bold hover:border-[#1428A0] hover:text-[#1428A0] transition"
                    >
                      {t.button.connectChannel}
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 text-green-700 rounded-2xl border border-green-100 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-bold">Account Connected</span>
                      </div>
                      <button className="w-full bg-[#1428A0] text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200">
                        {t.button.upload}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeView === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: 'Total Views', value: '1.2M', change: '+12%', color: 'blue' },
                  { label: 'Subscribers', value: '45.2K', change: '+5%', color: 'red' },
                  { label: 'Playlists', value: '128', change: '+24', color: 'orange' },
                  { label: 'Revenue', value: '$4,250', change: '+18%', color: 'emerald' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                    <div className="flex items-end justify-between">
                      <h4 className="text-3xl font-black text-[#0F172A]">{stat.value}</h4>
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                        stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                        stat.color === 'red' ? 'bg-red-50 text-red-600' :
                        stat.color === 'orange' ? 'bg-orange-50 text-orange-600' :
                        'bg-emerald-50 text-emerald-600'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 h-[400px] flex flex-col items-center justify-center text-gray-400">
                  <BarChart3 className="w-12 h-12 mb-4 opacity-20" />
                  <p className="font-bold">Growth Analytics Chart</p>
                </div>
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold mb-6">Top Performing Channels</h3>
                  <div className="space-y-4">
                    {[
                      { name: 'Midnight Vibes', views: '450K', sub: '12K' },
                      { name: 'Study LoFi', views: '320K', sub: '8K' },
                      { name: 'Morning Coffee', views: '210K', sub: '5K' }
                    ].map((channel, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-[#1428A0] rounded-xl flex items-center justify-center text-white font-bold">
                            {channel.name[0]}
                          </div>
                          <div>
                            <p className="font-bold">{channel.name}</p>
                            <p className="text-xs text-gray-400">{channel.sub} subscribers</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-[#1428A0]">{channel.views}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Views</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeView === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold mb-8">Playlist History</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {history.map((item) => (
                  <div key={item.id} className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 hover:shadow-xl transition group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#1428A0]">
                        <Music className="w-6 h-6" />
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg ${
                        item.status === 'draft' ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-600'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-lg mb-1 line-clamp-1">{item.title}</h4>
                    <p className="text-xs text-gray-400 mb-4">{item.createdAt}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <p className="text-sm font-bold text-gray-500">{item.songs.length} Songs</p>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-[#1428A0]"><Edit3 className="w-4 h-4" /></button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-[#1428A0]"><ChevronRight className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
                {history.length === 0 && (
                  <div className="col-span-full py-20 text-center text-gray-400">
                    <History className="w-16 h-16 mx-auto mb-4 opacity-10" />
                    <p className="font-bold">No history found.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeView === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl space-y-8"
            >
              <h2 className="text-3xl font-bold mb-8">Settings</h2>
              
              <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold">Language</p>
                      <p className="text-sm text-gray-400">Select your preferred interface language.</p>
                    </div>
                    <select 
                      value={lang} 
                      onChange={(e) => setLang(e.target.value as Language)}
                      className="bg-gray-50 border-none rounded-xl px-4 py-2 outline-none font-bold"
                    >
                      <option value="ko">한국어</option>
                      <option value="en">English</option>
                      <option value="zh">中文</option>
                      <option value="ja">日本語</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold">Auto-Translation</p>
                      <p className="text-sm text-gray-400">Automatically translate chat messages.</p>
                    </div>
                    <div className="w-12 h-6 bg-[#1428A0] rounded-full relative cursor-pointer">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold">Default Video Quality</p>
                      <p className="text-sm text-gray-400">Set the resolution for rendered videos.</p>
                    </div>
                    <select className="bg-gray-50 border-none rounded-xl px-4 py-2 outline-none font-bold">
                      <option>1080p (Full HD)</option>
                      <option>4K (Ultra HD)</option>
                      <option>720p (HD)</option>
                    </select>
                  </div>
                </div>
                <div className="p-8 bg-gray-50 flex justify-end">
                  <button className="bg-[#1428A0] text-white px-8 py-3 rounded-2xl font-bold">{t.button.saveChanges}</button>
                </div>
              </div>

              <div className="bg-red-50 p-8 rounded-[40px] border border-red-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-red-800">Danger Zone</p>
                  <p className="text-sm text-red-600">Permanently delete all data and history.</p>
                </div>
                <button className="bg-red-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-red-700 transition">{t.button.deleteAll}</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Chat & FAQ */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-[350px] md:w-[400px] h-[500px] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
            >
              <div className="bg-[#1428A0] p-4 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  <span className="font-bold">{t.chat.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Video className="w-4 h-4 cursor-pointer hover:text-gray-300" />
                  <Mic className="w-4 h-4 cursor-pointer hover:text-gray-300" />
                  <X className="w-5 h-5 cursor-pointer" onClick={() => setIsChatOpen(false)} />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      msg.sender === 'user' 
                        ? 'bg-[#1428A0] text-white rounded-tr-none' 
                        : 'bg-white text-gray-800 shadow-sm rounded-tl-none border border-gray-100'
                    }`}>
                      <p>{msg.text}</p>
                      {msg.translatedText && (
                        <p className="mt-1 pt-1 border-t border-white/20 text-[10px] opacity-80 italic">
                          {msg.translatedText}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={t.chat.placeholder}
                  className="flex-1 bg-gray-100 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1428A0]/20"
                />
                <button 
                  onClick={sendMessage}
                  className="bg-[#1428A0] text-white p-2 rounded-xl hover:bg-[#0F1E7A] transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3">
          <button 
            onClick={() => setIsFAQOpen(!isFAQOpen)}
            className="w-14 h-14 bg-[#FF7A00] text-white rounded-2xl shadow-lg flex items-center justify-center hover:scale-110 transition active:scale-95"
          >
            <HelpCircle className="w-7 h-7" />
          </button>
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="w-14 h-14 bg-[#1428A0] text-white rounded-2xl shadow-lg flex items-center justify-center hover:scale-110 transition active:scale-95"
          >
            <MessageSquare className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* FAQ Modal */}
      <AnimatePresence>
        {isFAQOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFAQOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
            >
              <div className="p-8 bg-[#FF7A00] text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <HelpCircle className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{t.faq.title}</h3>
                    <p className="text-sm opacity-80">{t.faq.bot}</p>
                  </div>
                </div>
                <X className="w-6 h-6 cursor-pointer" onClick={() => setIsFAQOpen(false)} />
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-4">
                {faqs.map((faq, i) => (
                  <details key={i} className="group bg-gray-50 rounded-3xl overflow-hidden border border-gray-100">
                    <summary className="p-6 cursor-pointer font-bold text-gray-800 list-none flex justify-between items-center hover:bg-gray-100 transition">
                      {faq.q}
                      <Plus className="w-4 h-4 group-open:rotate-45 transition" />
                    </summary>
                    <div className="px-6 pb-6 text-gray-600 text-sm leading-relaxed">
                      {faq.a}
                    </div>
                  </details>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Demo Modal */}
      <AnimatePresence>
        {showDemo && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDemo(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-6xl aspect-video bg-black rounded-[40px] shadow-2xl overflow-hidden border border-white/10"
            >
              <button 
                onClick={() => setShowDemo(false)}
                className="absolute top-6 right-6 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-md transition"
              >
                <X className="w-6 h-6" />
              </button>
              <iframe 
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" 
                title="Demo Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
