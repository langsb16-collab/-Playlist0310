import ko from '../messages/ko.json';
import en from '../messages/en.json';
import zh from '../messages/zh.json';
import ja from '../messages/ja.json';
import ru from '../messages/ru.json';
import hi from '../messages/hi.json';
import pt from '../messages/pt.json';
import id from '../messages/id.json';

export const translations = {
  ko, en, zh, ja, ru, hi, pt, id
};

export const faqs = [
  { q: "AI 플레이리스트는 어떻게 생성되나요?", a: "주제와 곡 수를 입력하면 AI가 감정 분석을 통해 적절한 음악을 추천합니다." },
  { q: "How is the AI playlist generated?", a: "Enter a theme and song count, and AI recommends music through sentiment analysis." },
  { q: "유튜브 업로드는 자동인가요?", a: "영상 생성 후 유튜브 API를 통해 자동 업로드됩니다." },
  { q: "Is YouTube upload automatic?", a: "After video generation, it is automatically uploaded via the YouTube API." },
  { q: "저작권 문제는 없나요?", a: "Content ID 검사를 통해 저작권 위험을 분석합니다. Royalty Free 음악을 우선적으로 사용합니다." },
  { q: "Are there copyright issues?", a: "Copyright risks are analyzed through Content ID checks. We prioritize Royalty Free music." },
  { q: "수동으로 음악 입력 가능한가요?", a: "사용자가 직접 노래 제목을 입력하면 AI가 플레이리스트를 확장합니다." },
  { q: "Can I input music manually?", a: "If you enter a song title, AI expands the playlist based on it." },
  { q: "영상은 자동 생성되나요?", a: "AI가 음악과 이미지로 플레이리스트 영상을 제작합니다." },
  { q: "Is the video generated automatically?", a: "AI creates a playlist video using music and images." },
  { q: "수익 창출이 가능한가요?", a: "Royalty Free 음악을 사용하면 유튜브 수익 창출이 가능합니다." },
  { q: "Can I monetize the videos?", a: "Yes, using Royalty Free music allows for YouTube monetization." }
];

export const recommendationCategories = [
  { id: 'emotion', label: { ko: '감정', en: 'Emotion' }, items: ['슬픔', '외로움', '힐링', '추억', '사랑'] },
  { id: 'time', label: { ko: '시간', en: 'Time' }, items: ['새벽', '아침', '점심', '저녁', '밤'] },
  { id: 'activity', label: { ko: '활동', en: 'Activity' }, items: ['공부', '운동', '운전', '카페', '산책'] },
  { id: 'genre', label: { ko: '장르', en: 'Genre' }, items: ['발라드', '재즈', 'EDM', '클래식', '힙합'] }
];

export const trendingThemes = [
  "새벽 감성 노래", "이별 후 듣는 노래", "공부할 때 듣는 LoFi", "비오는 밤 음악", "추억의 8090 발라드",
  "잠 잘 오는 명상 음악", "카페에서 듣는 재즈", "드라이브 신나는 팝송", "헬스장에서 듣는 EDM", "집중력 향상 클래식"
];
