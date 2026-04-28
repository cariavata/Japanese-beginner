/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef, FC } from 'react';
import { Volume2, Plane, Home, MessageSquare, Info, Music, Music2, Pencil, Trash2, Plus, X, Lock, Settings, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { saveAsset, getAsset, deleteAsset } from './lib/db';

// --- Data Section ---

interface CharItem {
  jp: string;
  ko: string;
}

type CharData = (CharItem | null)[];

const INITIAL_HIRAGANA_DATA: CharData = [
  { jp: 'あ', ko: '아' }, { jp: 'い', ko: '이' }, { jp: 'う', ko: '우' }, { jp: 'え', ko: '에' }, { jp: 'お', ko: '오' },
  { jp: 'か', ko: '카' }, { jp: 'き', ko: '키' }, { jp: 'く', ko: '쿠' }, { jp: 'け', ko: '케' }, { jp: 'こ', ko: '코' },
  { jp: 'さ', ko: '사' }, { jp: 'し', ko: '시' }, { jp: 'す', ko: '스' }, { jp: 'せ', ko: '세' }, { jp: 'そ', ko: '소' },
  { jp: 'た', ko: '타' }, { jp: 'ち', ko: '치' }, { jp: 'つ', ko: '츠' }, { jp: 'て', ko: '테' }, { jp: 'と', ko: '토' },
  { jp: 'な', ko: '나' }, { jp: 'に', ko: '니' }, { jp: 'ぬ', ko: '누' }, { jp: 'ね', ko: '네' }, { jp: 'の', ko: '노' },
  { jp: 'は', ko: '하' }, { jp: 'ひ', ko: '히' }, { jp: 'ふ', ko: '후' }, { jp: 'へ', ko: '헤' }, { jp: 'ほ', ko: '호' },
  { jp: 'ま', ko: '마' }, { jp: 'み', ko: '미' }, { jp: 'む', ko: '무' }, { jp: 'め', ko: '메' }, { jp: 'も', ko: '모' },
  { jp: 'や', ko: '야' }, null, { jp: 'ゆ', ko: '유' }, null, { jp: 'よ', ko: '요' },
  { jp: 'ら', ko: '라' }, { jp: 'り', ko: '리' }, { jp: 'る', ko: '루' }, { jp: 'れ', ko: '레' }, { jp: 'ろ', ko: '로' },
  { jp: 'わ', ko: '와' }, null, null, null, { jp: 'を', ko: '오(조사)' },
  { jp: 'ん', ko: '응' }, null, null, null, null
];

const INITIAL_KATAKANA_DATA: CharData = [
  { jp: 'ア', ko: '아' }, { jp: 'イ', ko: '이' }, { jp: 'ウ', ko: '우' }, { jp: 'エ', ko: '에' }, { jp: 'オ', ko: '오' },
  { jp: 'カ', ko: '카' }, { jp: 'キ', ko: '키' }, { jp: 'ク', ko: '쿠' }, { jp: 'ケ', ko: '케' }, { jp: 'コ', ko: '코' },
  { jp: 'サ', ko: '사' }, { jp: 'シ', ko: '시' }, { jp: 'ス', ko: '스' }, { jp: 'セ', ko: '세' }, { jp: 'ソ', ko: '소' },
  { jp: 'タ', ko: '타' }, { jp: 'チ', ko: '치' }, { jp: 'ツ', ko: '츠' }, { jp: 'テ', ko: '테' }, { jp: 'ト', ko: '토' },
  { jp: 'ナ', ko: '나' }, { jp: 'ニ', ko: '니' }, { jp: 'ヌ', ko: '누' }, { jp: 'ネ', ko: '네' }, { jp: 'ノ', ko: '노' },
  { jp: 'ハ', ko: '하' }, { jp: 'ヒ', ko: '히' }, { jp: 'フ', ko: '후' }, { jp: 'ヘ', ko: '헤' }, { jp: 'ホ', ko: '호' },
  { jp: 'マ', ko: '마' }, { jp: 'ミ', ko: '미' }, { jp: 'ム', ko: '무' }, { jp: 'メ', ko: '메' }, { jp: 'モ', ko: '모' },
  { jp: 'ヤ', ko: '야' }, null, { jp: 'ユ', ko: '유' }, null, { jp: 'ヨ', ko: '요' },
  { jp: 'ラ', ko: '라' }, { jp: 'リ', ko: '리' }, { jp: 'ル', ko: '루' }, { jp: 'レ', ko: '레' }, { jp: 'ロ', ko: '로' },
  { jp: 'ワ', ko: '와' }, null, null, null, { jp: 'ヲ', ko: '오(조사)' },
  { jp: 'ン', ko: '응' }, null, null, null, null
];

interface SentenceItem {
  jp: string;
  ko: string;
  mean: string;
}

const INITIAL_GREETINGS_DATA: SentenceItem[] = [
  { jp: 'おはようございます', ko: '오하요- 고자이마스', mean: '좋은 아침입니다 (아침 인사)' },
  { jp: 'こんにちは', ko: '콘니치와', mean: '안녕하세요 (낮 인사)' },
  { jp: 'こんばんは', ko: '콤방와', mean: '안녕하세요 (저녁 인사)' },
  { jp: 'はじめまして', ko: '하지메마시테', mean: '처음 뵙겠습니다' },
  { jp: 'よろしくお願いします', ko: '요로시쿠 오네가이시마스', mean: '잘 부탁드립니다' },
  { jp: 'ありがとうございます', ko: '아리가토- 고자이마스', mean: '감사합니다' },
  { jp: 'どういたしまして', ko: '도-이타시마시테', mean: '천만에요' },
  { jp: 'すみません', ko: '스미마센', mean: '죄송합니다 / 실례합니다' },
  { jp: 'ごめんなさい', ko: '고멘나사이', mean: '미안합니다 (친근한 사과)' },
  { jp: '申し訳ありません', ko: '모-시와케 아리마센', mean: '정말 죄송합니다 (정중한 사과)' },
  { jp: 'さようなら', ko: '사요-나라', mean: '안녕히 가세요 (헤어질 때)' },
  { jp: 'おやすみなさい', ko: '오야스미나사이', mean: '안녕히 주무세요' },
  { jp: 'お久しぶりです', ko: '오히사시부리데스', mean: '오랜만입니다' },
  { jp: 'お元気ですか', ko: '오겡키데스카', mean: '어떻게 지내세요? / 건강하신가요?' },
  { jp: 'お疲れ様でした', ko: '오츠카레사마데시타', mean: '수고하셨습니다' },
  { jp: 'お先に失礼します', ko: '오사키니 시츠레-시마스', mean: '먼저 실례하겠습니다 (먼저 퇴근할 때)' },
  { jp: 'いらっしゃいませ', ko: '이랏샤이마세', mean: '어서 오세요 (가게 등에서 환영)' },
  { jp: 'お待たせしました', ko: '오마타세시마시타', mean: '오래 기다리셨습니다' },
  { jp: '気をつけてください', ko: '키오츠케테 쿠다사이', mean: '조심해서 가세요 / 조심하세요' },
  { jp: 'おめでとうございます', ko: '오메데토- 고자이마스', mean: '축하합니다' }
];

const INITIAL_TRAVEL_DATA: SentenceItem[] = [
  { jp: '荷物はどこですか', ko: '니모츠와 도코데스카', mean: '수하물은 어디있나요?' },
  { jp: 'タクシー乗り場はどこですか', ko: '타쿠시- 노리바와 도코데스카', mean: '택시 승강장은 어디인가요?' },
  { jp: '東京駅まで行きますか', ko: '토-쿄-에키마데 이키마스카', mean: '도쿄역까지 가나요?' },
  { jp: '切符売り場はどこですか', ko: '킵푸 우리바와 도코데스카', mean: '매표소는 어디인가요?' },
  { jp: 'ここへ行ってください', ko: '코코에 잇테 쿠다사이', mean: '여기로 가주세요' },
  { jp: '次の駅はどこですか', ko: '츠기노 에키와 도코데스카', mean: '다음 역은 어디인가요?' },
  { jp: '降りる駅を教えてください', ko: '오리루 에키오 오시에테 쿠다사이', mean: '내릴 역을 알려주세요' },
  { jp: 'いくらですか', ko: '이쿠라데스카', mean: '얼마인가요?' },
  { jp: 'バス停はどこですか', ko: '바스테-와 도코데스카', mean: '버스 정류장은 어디인가요?' },
  { jp: '地下鉄はどこですか', ko: '치카테츠와 도코데스카', mean: '지하철은 어디인가요?' },
  { jp: 'チェックインをお願いします', ko: '쳇쿠인오 오네가이시마스', mean: '체크인 부탁드립니다' },
  { jp: 'チェックアウトをお願いします', ko: '쳇쿠아우토오 오네가이시마스', mean: '체크아웃 부탁드립니다' },
  { jp: '予約したOOです', ko: '요야쿠시타 OO데스', mean: '예약한 OO입니다' },
  { jp: '荷物を預かってもらえますか', ko: '니모츠오 아즈캇테 모라에마스카', mean: '짐을 맡겨주실 수 있나요?' },
  { jp: 'Wi-Fiのパスワードは何ですか', ko: '와이파이노 파스와-도와 난데스카', mean: '와이파이 비밀번호가 무엇인가요?' },
  { jp: '朝食は何時からですか', ko: '초-쇼쿠와 난지카라데스카', mean: '조식은 몇시부터인가요?' },
  { jp: '部屋を掃除してください', ko: '헤야오 소-지시테 쿠다사이', mean: '방을 청소해 주세요' },
  { jp: 'タオルをもう一枚ください', ko: '타오루오 모- 이치마이 쿠다사이', mean: '수건 한 장 더 주세요' },
  { jp: 'お湯が出ません', ko: '오유가 데마센', mean: '따뜻한 물이 안 나옵니다' },
  { jp: '部屋を変えてもらえますか', ko: '헤야오 카에테 모라에마스카', mean: '방을 바꿔주실 수 있나요?' },
  { jp: '何名様ですか', ko: '난메-사마데스카', mean: '몇 분이신가요? (점원)' },
  { jp: '2人です', ko: '후타리데스', mean: '두 명입니다' },
  { jp: 'メニューをください', ko: '메뉴-오 쿠다사이', mean: '메뉴판 주세요' },
  { jp: '日本語のメニューはありますか', ko: '니홍고노 메뉴-와 아리마스카', mean: '일본어 메뉴판 있나요?' },
  { jp: 'おすすめは何ですか', ko: '오스스메와 난데스카', mean: '추천 메뉴는 무엇인가요?' },
  { jp: 'これをお願いします', ko: '코레오 오네가이시마스', mean: '이걸로 부탁합니다' },
  { jp: 'お水をもらえますか', ko: '오미즈오 모라에마스카', mean: '물 좀 주시겠어요?' },
  { jp: '辛くしないでください', ko: '카라쿠 시나이데 쿠다사이', mean: '맵지 않게 해주세요' },
  { jp: 'お会計をお願いします', ko: '오카이케-오 오네가이시마스', mean: '계산 부탁드립니다' },
  { jp: '別々に払えますか', ko: '베츠베츠니 하라에마스카', mean: '따로따로 계산되나요?' },
  { jp: '美味しかったです', ko: '오이시캇타데스', mean: '맛있었습니다' },
  { jp: 'これを見せてください', ko: '코레오 미세테 쿠다사이', mean: '이것 좀 보여주세요' },
  { jp: '試着してもいいですか', ko: '시챠쿠시테모 이-데스카', mean: '입어봐도 되나요?' },
  { jp: 'もう少し大きいサイズはありますか', ko: '모- 스코시 오-키- 사이즈와 아리마스카', mean: '조금 더 큰 사이즈 있나요?' },
  { jp: 'もう少し小さいサイズはありますか', ko: '모- 스코시 치-사이 사이즈와 아리마스카', mean: '조금 더 작은 사이즈 있나요?' },
  { jp: '別の色はありますか', ko: '베츠노 이로와 아리마스카', mean: '다른 색상 있나요?' },
  { jp: 'これをください', ko: '코레오 쿠다사이', mean: '이걸로 주세요' },
  { jp: 'クレジットカードは使えますか', ko: '쿠레짓토카-도와 츠카에마스카', mean: '신용카드 되나요?' }
];

const INITIAL_DAILY_DATA: SentenceItem[] = [
  { jp: 'おはようございます', ko: '오하요- 고자이마스', mean: '좋은 아침입니다' },
  { jp: 'いただきます', ko: '이타다키마스', mean: '잘 먹겠습니다' },
  { jp: 'ごちそうさまでした', ko: '고치소-사마데시타', mean: '잘 먹었습니다' },
  { jp: 'いってきます', ko: '잇테키마스', mean: '다녀오겠습니다' },
  { jp: 'いってらっしゃい', ko: '잇테랏샤이', mean: '다녀오세요' },
  { jp: 'ただいま', ko: '타다이마', mean: '다녀왔습니다' },
  { jp: 'おかえりなさい', ko: '오카에리나사이', mean: '다녀오셨어요' }
];

const fadeAudio = (audio: HTMLAudioElement, targetVolume: number, duration: number = 300) => {
  let startVolume = audio.volume;
  // If target is the same, do nothing
  if (startVolume === targetVolume) return;
  // Ensure we do not start fading if it is paused or 0 (unless we are fading in)
  
  const change = targetVolume - startVolume;
  const startTime = performance.now();

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    audio.volume = Math.max(0, Math.min(1, startVolume + change * progress));
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };
  requestAnimationFrame(animate);
};

export default function App() {
  const [activeTab, setActiveTab] = useState('letters');

  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [adminPwd, setAdminPwd] = useState('');
  
  const [greetingsData, setGreetingsData] = useState<SentenceItem[]>(() => {
    const saved = localStorage.getItem('greetingsData');
    return saved ? JSON.parse(saved) : INITIAL_GREETINGS_DATA;
  });
  const [travelData, setTravelData] = useState<SentenceItem[]>(() => {
    const saved = localStorage.getItem('travelData');
    return saved ? JSON.parse(saved) : INITIAL_TRAVEL_DATA;
  });
  const [dailyData, setDailyData] = useState<SentenceItem[]>(() => {
    const saved = localStorage.getItem('dailyData');
    return saved ? JSON.parse(saved) : INITIAL_DAILY_DATA;
  });
  
  const [hiraganaData, setHiraganaData] = useState<CharData>(() => {
    const saved = localStorage.getItem('hiraganaData');
    return saved ? JSON.parse(saved) : INITIAL_HIRAGANA_DATA;
  });
  
  const [katakanaData, setKatakanaData] = useState<CharData>(() => {
    const saved = localStorage.getItem('katakanaData');
    return saved ? JSON.parse(saved) : INITIAL_KATAKANA_DATA;
  });

  const [editingItem, setEditingItem] = useState<{tab: string, index: number, item: SentenceItem} | null>(null);
  const [editingLetter, setEditingLetter] = useState<{type: 'hiragana' | 'katakana', index: number, item: CharItem} | null>(null);
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [isAddingBoard, setIsAddingBoard] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  
  const [siteTitle, setSiteTitle] = useState(() => localStorage.getItem('siteTitle') || '처음 만나는 일본어 🌸');
  const [siteSubtitle, setSiteSubtitle] = useState(() => localStorage.getItem('siteSubtitle') || '왕초보를 위한 가장 쉽고 재미있는 일본어 놀이터');
  const [tabLetterLabel, setTabLetterLabel] = useState(() => localStorage.getItem('tabLetterLabel') || '문자 마스터');
  const [tabGreetingLabel, setTabGreetingLabel] = useState(() => localStorage.getItem('tabGreetingLabel') || '🙏 필수 인사말');
  const [tabTravelLabel, setTabTravelLabel] = useState(() => localStorage.getItem('tabTravelLabel') || '✈️ 여행 회화');
  const [tabDailyLabel, setTabDailyLabel] = useState(() => localStorage.getItem('tabDailyLabel') || '🏠 생활 표현');
  const [footerText, setFooterText] = useState(() => localStorage.getItem('footerText') || '© 2026 처음 만나는 일본어. 실전 일본어 학습기');
  const [naverMeta, setNaverMeta] = useState(() => localStorage.getItem('naverMeta') || '');
  const [seoData, setSeoData] = useState({ robotsTxt: '', sitemapXml: '', rssXml: '' });

  useEffect(() => {
    fetch('/api/seo').then(res => res.json()).then(data => {
      setSeoData({
        robotsTxt: data.robotsTxt || 'User-agent: *\nAllow: /',
        sitemapXml: data.sitemapXml || '',
        rssXml: data.rssXml || ''
      });
    }).catch(console.error);
  }, []);

  const handleSeoSave = async () => {
    try {
      await fetch('/api/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seoData)
      });
      alert('SEO 설정이 반영되었습니다.');
    } catch(err) {
      alert('저장에 실패했습니다.');
    }
  };
  const [popupInfo, setPopupInfo] = useState(() => {
    const saved = localStorage.getItem('popupInfo');
    return saved ? JSON.parse(saved) : { active: false, content: '새로운 공지사항입니다.', image: '' };
  });

  const [bgmPlaylist, setBgmPlaylist] = useState<string[]>([]);
  const [currentBgmIndex, setCurrentBgmIndex] = useState(0);

  const [tabBoardLabel, setTabBoardLabel] = useState(() => localStorage.getItem('tabBoardLabel') || '📌 게시판');
  
  interface BoardPost { id: string; title: string; content: string; image?: string; createdAt: number; }
  const [boardData, setBoardData] = useState<BoardPost[]>(() => {
    const saved = localStorage.getItem('boardData');
    return saved ? JSON.parse(saved) : [];
  });

  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/data').then(res => res.json()).then(data => {
      if (data && Object.keys(data).length > 0) {
        if (data.siteTitle) setSiteTitle(data.siteTitle);
        if (data.siteSubtitle) setSiteSubtitle(data.siteSubtitle);
        if (data.tabLetterLabel) setTabLetterLabel(data.tabLetterLabel);
        if (data.tabGreetingLabel) setTabGreetingLabel(data.tabGreetingLabel);
        if (data.tabTravelLabel) setTabTravelLabel(data.tabTravelLabel);
        if (data.tabDailyLabel) setTabDailyLabel(data.tabDailyLabel);
        if (data.footerText) setFooterText(data.footerText);
        if (data.naverMeta !== undefined) setNaverMeta(data.naverMeta);
        if (data.popupInfo) setPopupInfo(data.popupInfo);
        
        if (data.greetingsData) setGreetingsData(data.greetingsData);
        if (data.travelData) setTravelData(data.travelData);
        if (data.dailyData) setDailyData(data.dailyData);
        
        if (data.hiraganaData) setHiraganaData(data.hiraganaData);
        if (data.katakanaData) setKatakanaData(data.katakanaData);
        
        if (data.tabBoardLabel) setTabBoardLabel(data.tabBoardLabel);
        if (data.boardData) setBoardData(data.boardData);
      }
      setDataLoaded(true);
    }).catch(e => {
       console.error("Failed to load app data", e);
       setDataLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!dataLoaded) return;
    const timer = setTimeout(() => {
      const data = {
         siteTitle, siteSubtitle, tabLetterLabel, tabGreetingLabel, tabTravelLabel, tabDailyLabel,
         footerText, popupInfo, greetingsData, travelData, dailyData, hiraganaData, katakanaData,
         tabBoardLabel, boardData, naverMeta
      };
      fetch('/api/data', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(data)
      }).catch(console.error);
    }, 1500);
    return () => clearTimeout(timer);
  }, [siteTitle, siteSubtitle, tabLetterLabel, tabGreetingLabel, tabTravelLabel, tabDailyLabel, footerText, popupInfo, greetingsData, travelData, dailyData, hiraganaData, katakanaData, tabBoardLabel, boardData, naverMeta, dataLoaded]);

  // Load BGMs from DB
  useEffect(() => {
     const loadBgms = async () => {
         const list = [];
         for(let i=0; i<5; i++){
             try {
                const data = await getAsset(`bgm_${i}`);
                if (data) list.push(data);
             } catch(e){}
         }
         if (list.length > 0) {
            setBgmPlaylist(list);
         } else {
            setBgmPlaylist(['https://archive.org/download/beautiful-japanese-music-koto-music-shakuhachi-music/beautiful-japanese-music-koto-music-shakuhachi-music.mp3']);
         }
     };
     loadBgms();
  }, []);

  // Analytics Stats State
  const [statsPeriod, setStatsPeriod] = useState<'day'|'week'|'month'|'year'>('day');
  const [siteStats, setSiteStats] = useState<any>({});

  // Fetch / Init Stats
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const stats = JSON.parse(localStorage.getItem('site_stats') || '{}');
    if (!sessionStorage.getItem('visited_today')) {
      sessionStorage.setItem('visited_today', 'true');
      const todayStat = stats[today] || { visitors: 0, referrers: {}, keywords: {} };
      todayStat.visitors += 1;
      
      const ref = document.referrer;
      let refKey = '기타/직접입력';
      if (ref.includes('naver.com')) refKey = '네이버';
      else if (ref.includes('google.com') || ref.includes('google.co.kr')) refKey = '구글';
      else if (ref.includes('daum.net') || ref.includes('kakao.com')) refKey = '다음/카카오';
      
      todayStat.referrers[refKey] = (todayStat.referrers[refKey] || 0) + 1;
      
      const urlParams = new URLSearchParams(window.location.search);
      const query = urlParams.get('q') || urlParams.get('query') || urlParams.get('keyword');
      if (query) {
         todayStat.keywords[query] = (todayStat.keywords[query] || 0) + 1;
      }

      stats[today] = todayStat;
      localStorage.setItem('site_stats', JSON.stringify(stats));
    }
    setSiteStats(stats);
  }, []);

  // Naver Meta Hook
  useEffect(() => {
    localStorage.setItem('naverMeta', naverMeta);
    let meta = document.querySelector('meta[name="naver-site-verification"]');
    if (naverMeta) {
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'naver-site-verification');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', naverMeta);
    } else if (meta) {
      meta.remove();
    }
  }, [naverMeta]);

  useEffect(() => { localStorage.setItem('tabBoardLabel', tabBoardLabel); }, [tabBoardLabel]);
  useEffect(() => { localStorage.setItem('boardData', JSON.stringify(boardData)); }, [boardData]);

  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [closedPopup, setClosedPopup] = useState(false);

  useEffect(() => { localStorage.setItem('siteTitle', siteTitle); }, [siteTitle]);
  useEffect(() => { localStorage.setItem('siteSubtitle', siteSubtitle); }, [siteSubtitle]);
  useEffect(() => { localStorage.setItem('tabLetterLabel', tabLetterLabel); }, [tabLetterLabel]);
  useEffect(() => { localStorage.setItem('tabGreetingLabel', tabGreetingLabel); }, [tabGreetingLabel]);
  useEffect(() => { localStorage.setItem('tabTravelLabel', tabTravelLabel); }, [tabTravelLabel]);
  useEffect(() => { localStorage.setItem('tabDailyLabel', tabDailyLabel); }, [tabDailyLabel]);
  useEffect(() => { localStorage.setItem('footerText', footerText); }, [footerText]);
  useEffect(() => { localStorage.setItem('popupInfo', JSON.stringify(popupInfo)); }, [popupInfo]);

  useEffect(() => { localStorage.setItem('greetingsData', JSON.stringify(greetingsData)); }, [greetingsData]);
  useEffect(() => { localStorage.setItem('travelData', JSON.stringify(travelData)); }, [travelData]);
  useEffect(() => { localStorage.setItem('dailyData', JSON.stringify(dailyData)); }, [dailyData]);
  useEffect(() => { localStorage.setItem('hiraganaData', JSON.stringify(hiraganaData)); }, [hiraganaData]);
  useEffect(() => { localStorage.setItem('katakanaData', JSON.stringify(katakanaData)); }, [katakanaData]);
  useEffect(() => { setSelectedItems([]); }, [activeTab]);

  const [letterType, setLetterType] = useState<'hiragana' | 'katakana'>('hiragana');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isBgmPlaying, setIsBgmPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const userManuallyPaused = useRef(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.05;
      
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsBgmPlaying(true);
        }).catch(() => {
          // Autoplay was prevented. Wait for user interaction
          const startAudioOnInteraction = () => {
            if (audioRef.current && !userManuallyPaused.current) {
               audioRef.current.play().then(() => {
                 setIsBgmPlaying(true);
               }).catch(console.error);
            }
            document.removeEventListener('click', startAudioOnInteraction);
            document.removeEventListener('keydown', startAudioOnInteraction);
            document.removeEventListener('touchstart', startAudioOnInteraction);
          };
          document.addEventListener('click', startAudioOnInteraction);
          document.addEventListener('keydown', startAudioOnInteraction);
          document.addEventListener('touchstart', startAudioOnInteraction);
        });
      }
    }
    setIsReady(true);
    
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const updateVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) {
        setVoices(v);
        voicesRef.current = v;
      }
    };
    
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
    
    // Some mobile browsers need a retry
    const interval = setInterval(() => {
      if (voicesRef.current.length === 0) {
        updateVoices();
      } else {
        clearInterval(interval);
      }
    }, 1000);

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      clearInterval(interval);
    };
  }, []);

  const speakText = useCallback((text: string) => {
    const playAudioFallback = (text: string) => {
      if (!ttsAudioRef.current) return;
      
      const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=ja&client=tw-ob`;
      
      // Cancel previous playback
      ttsAudioRef.current.pause();
      ttsAudioRef.current.currentTime = 0;
      
      ttsAudioRef.current.src = url;
      
      ttsAudioRef.current.onplay = () => {
        if (audioRef.current) {
          fadeAudio(audioRef.current, 0.02, 400);
        }
      };
      
      const restoreVolume = () => {
        if (audioRef.current) {
          fadeAudio(audioRef.current, 0.05, 600);
        }
      };
      
      ttsAudioRef.current.onended = restoreVolume;
      ttsAudioRef.current.onerror = (e) => {
        console.error("Fallback TTS Error:", e);
        restoreVolume();
      };
      
      ttsAudioRef.current.play().catch(err => {
        console.error("Fallback audio blocked", err);
        restoreVolume();
      });
    };

    const isMobileInAppOrNoTTS = !('speechSynthesis' in window) || /KAKAOTALK|NAVER|Line|Instagram|FBAN|FBAV/i.test(navigator.userAgent);

    if (isMobileInAppOrNoTTS) {
      playAudioFallback(text);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      
      const jaVoice = voicesRef.current.find(voice => 
        voice.lang === 'ja-JP' || voice.lang === 'ja_JP' || voice.lang.includes('ja')
      );
      
      if (jaVoice) {
        utterance.voice = jaVoice;
      }

      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      
      utterance.onstart = () => {
        if (audioRef.current) {
          fadeAudio(audioRef.current, 0.02, 400);
        }
      };

      const restoreVolume = () => {
        if (audioRef.current) {
          fadeAudio(audioRef.current, 0.05, 600);
        }
      };
      
      utterance.onend = restoreVolume;
      utterance.onerror = (e) => {
        console.error("TTS Error:", e);
        restoreVolume();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("TTS Error:", err);
      if (audioRef.current) {
        fadeAudio(audioRef.current, 0.05, 600);
      }
    }
  }, []);

  const performBgmChange = useCallback((nextIndex: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    // fade out
    let vol = audio.volume;
    const fadeOutInterval = setInterval(() => {
      vol -= 0.01;
      if (vol <= 0) {
        clearInterval(fadeOutInterval);
        audio.pause();
        audio.volume = 0;
        setCurrentBgmIndex(nextIndex);
        setTimeout(() => {
          if (bgmPlaylist[nextIndex]) {
            audio.src = bgmPlaylist[nextIndex];
            if (isBgmPlaying) {
              audio.play().then(() => {
                // fade in
                let volIn = 0;
                const fadeInInterval = setInterval(() => {
                  volIn += 0.01;
                  if (volIn >= 0.05) {
                    volIn = 0.05;
                    clearInterval(fadeInInterval);
                  }
                  audio.volume = volIn;
                }, 100);
              }).catch(err => console.error("BGM Autoplay/Fadein blocked:", err));
            }
          }
        }, 100);
      } else {
        audio.volume = Math.max(0, vol);
      }
    }, 100);
  }, [bgmPlaylist, isBgmPlaying]);

  const handleNextBgm = useCallback(() => {
    if (bgmPlaylist.length === 0) return;
    performBgmChange(Math.floor(Math.random() * bgmPlaylist.length));
  }, [bgmPlaylist, performBgmChange]);

  const toggleBgm = () => {
    if (!audioRef.current) return;
    
    if (isBgmPlaying) {
      audioRef.current.pause();
      userManuallyPaused.current = true;
      setIsBgmPlaying(false);
    } else {
      // Ensure source is loaded
      if (!audioRef.current.src && bgmPlaylist.length > 0) {
         audioRef.current.src = bgmPlaylist[currentBgmIndex];
      }
      audioRef.current.play().then(() => {
        if (audioRef.current) audioRef.current.volume = 0.05;
        userManuallyPaused.current = false;
        setIsBgmPlaying(true);
      }).catch(err => {
        console.error("BGM Autoplay blocked:", err);
        alert("브라우저 설정에 의해 음악 재생이 막혔습니다. 화면을 클릭한 후 다시 버튼을 눌러주세요.");
      });
    }
  };

  const handleAdminLogin = () => {
    if (adminId === 'cariavata' && adminPwd === 'dudwls3098!!') {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminId('');
      setAdminPwd('');
    } else {
      alert('아이디 또는 비밀번호가 틀렸습니다.');
    }
  };

  if (!isReady) {
    return <div className="min-h-screen bg-[#FFF5F7] flex items-center justify-center font-bold text-rose-400">학습장 준비 중...</div>;
  }

  return (
    <div className="min-h-screen bg-[#FFF5F7] text-[#333] font-sans selection:bg-rose-200">
      {/* Background Music Element */}
      <audio 
        ref={audioRef} 
        src={bgmPlaylist[currentBgmIndex] || undefined} 
        onEnded={handleNextBgm}
        preload="auto"
      />
      {/* TTS Audio Fallback */}
      <audio ref={ttsAudioRef} className="hidden" preload="none" />

      {/* Global Layer Popup */}
      {popupInfo.active && !closedPopup && (
        <div className="fixed top-20 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white shadow-2xl rounded-2xl p-6 z-[200] border-2 border-[#FF9B9B] transform transition-all animate-bounce-slight">
          <button onClick={() => setClosedPopup(true)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-800"><X size={20}/></button>
          <div className="flex items-center gap-2 mb-3 text-[#FF6B6B] font-black text-lg">
            <Info size={20}/>
            <span>Notice</span>
          </div>
          {popupInfo.image && <img src={popupInfo.image} className="w-full mb-3 rounded-lg object-contain border border-gray-100" />}
          <p className="text-gray-700 font-medium leading-relaxed whitespace-pre-wrap text-sm">{popupInfo.content}</p>
        </div>
      )}

      {/* Header */}
      <header className="bg-[#FF9B9B] text-white p-6 shadow-md border-b-4 border-[#FF6B6B]/10 relative overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight m-0">{siteTitle}</h1>
            <p className="text-pink-100 mt-2 text-base md:text-lg">{siteSubtitle}</p>
          </div>
          
          
            <div className="flex items-center gap-3">
              {isAdmin ? (
                 <div className="flex items-center gap-2">
                   <button 
                     onClick={() => setShowAdminDashboard(true)}
                     className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-xl transition-all border-2 bg-indigo-500 text-white border-indigo-600 font-bold hover:bg-indigo-400 shadow-sm"
                   >
                     <Settings size={16} />
                     <span className="text-xs md:text-sm font-bold tracking-wider hidden md:inline">설정 및 통계</span>
                   </button>
                   <button 
                     onClick={() => setIsAdmin(false)}
                     className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-xl transition-all border-2 bg-yellow-400 text-yellow-900 border-yellow-500 font-bold hover:bg-yellow-300 shadow-sm"
                   >
                     <span className="text-xs md:text-sm font-bold tracking-wider">관리자 종료</span>
                   </button>
                 </div>
              ) : (
                 <button 
                   onClick={() => setShowAdminLogin(true)}
                   className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all border-2 bg-white/20 text-white border-white/30 hover:bg-white/30"
                 >
                   <Lock size={16} />
                   <span className="text-sm font-bold tracking-wider hidden md:inline">관리자</span>
                 </button>
              )}

            {/* BGM Toggle Button */}
            <button 
              onClick={toggleBgm}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border-2 ${isBgmPlaying ? 'bg-white text-rose-400 border-white font-bold' : 'bg-rose-400/30 text-white border-white/30 hover:bg-white/10'}`}
              title="배경음악 토글"
            >
              {isBgmPlaying ? <Music size={18} /> : <Music2 size={18} />}
              <span className="text-sm font-bold uppercase tracking-wider">{isBgmPlaying ? 'BGM ON' : 'BGM OFF'}</span>
            </button>

            
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-[#FFB3B3] p-2 md:p-3 flex justify-center gap-2 md:gap-4 border-b border-[#FF9B9B] sticky top-0 z-50 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <TabButton active={activeTab === 'letters'} onClick={() => setActiveTab('letters')} label={tabLetterLabel} />
        <TabButton active={activeTab === 'greetings'} onClick={() => setActiveTab('greetings')} label={tabGreetingLabel} />
        <TabButton active={activeTab === 'travel'} onClick={() => setActiveTab('travel')} label={tabTravelLabel} />
        <TabButton active={activeTab === 'daily'} onClick={() => setActiveTab('daily')} label={tabDailyLabel} />
        <TabButton active={activeTab === 'board'} onClick={() => setActiveTab('board')} label={tabBoardLabel} />
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto my-6 p-4 md:p-8 bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border-4 border-[#FFE4E1] mx-4 md:mx-auto">
        <div className="bg-[#FFF8E1] border border-[#FFECB3] p-4 rounded-2xl text-xs md:text-sm text-[#795548] mb-6 flex items-start md:items-center gap-3">
          <span className="text-xl md:text-2xl flex-shrink-0">💡</span>
          <p className="leading-snug">
            <strong>Tip:</strong> 글자 칸을 클릭하면 발음을 들을 수 있습니다! 소리가 나지 않는다면 <b>볼륨</b>과 <b>무음 모드</b>를 확인해 주세요.<br/>(모바일 네이버, 카카오톡 인앱 브라우저에서는 음성이 나오지 않을 수 있으니 크롬 및 엣지 브라우저에서 실행해 주시기 바랍니다.)
          </p>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'letters' && (
            <motion.section
              key="letters"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl md:text-3xl font-black text-[#FF6B6B] flex items-center gap-2 md:gap-3">
                  <span className="bg-[#FF6B6B] text-white w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center text-sm md:text-lg">あ</span>
                  기본 문자 익히기
                </h2>
                <div className="flex bg-gray-100 rounded-full p-1 overflow-hidden shrink-0">
                  <button 
                    className={`px-3 py-1 md:px-5 md:py-1.5 rounded-full text-xs md:text-sm font-bold transition-all ${letterType === 'hiragana' ? 'bg-white shadow-sm text-[#FF6B6B]' : 'text-gray-500'}`}
                    onClick={() => setLetterType('hiragana')}
                  >
                    히라가나
                  </button>
                  <button 
                    className={`px-3 py-1 md:px-5 md:py-1.5 rounded-full text-xs md:text-sm font-bold transition-all ${letterType === 'katakana' ? 'bg-white shadow-sm text-[#FF6B6B]' : 'text-gray-500'}`}
                    onClick={() => setLetterType('katakana')}
                  >
                    가타카나
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2 md:gap-5">
                {(letterType === 'hiragana' ? hiraganaData : katakanaData).map((item, idx) => (
                  item ? (
                    <motion.div
                      key={`char-${letterType}-${idx}`}
                      whileHover={{ y: -5, backgroundColor: '#FFE4E1' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => speakText(item.jp)}
                      className="bg-[#FFF0F5] border-2 border-[#FFE4E1] rounded-xl md:rounded-2xl p-3 md:p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center relative overflow-hidden group"
                    >
                      {isAdmin && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingLetter({type: letterType, index: idx, item});
                          }} 
                          className="absolute top-1 right-1 p-1.5 md:p-2 rounded-lg bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition-colors z-10 shadow-sm"
                        >
                          <Pencil size={14} />
                        </button>
                      )}
                      <span className="text-2xl md:text-5xl font-black text-[#FF6B6B] mb-1 md:mb-2">{item.jp}</span>
                      <span className="text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-tight leading-none">{item.ko}</span>
                      <div className="mt-2 text-base md:text-xl opacity-30">🔊</div>
                    </motion.div>
                  ) : (
                    <div key={`empty-${idx}`} className="h-16 md:h-28 border border-dashed border-gray-100 rounded-xl md:rounded-2xl opacity-50 relative group">
                      {isAdmin && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingLetter({type: letterType, index: idx, item: { jp: '', ko: '' }});
                          }} 
                          className="absolute inset-0 m-auto w-8 h-8 flex items-center justify-center rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors z-10 shadow-sm"
                        >
                          <Plus size={16} />
                        </button>
                      )}
                    </div>
                  )
                ))}
              </div>
            </motion.section>
          )}

          {(activeTab === 'greetings' || activeTab === 'travel' || activeTab === 'daily') && (
            <motion.section
              key={`section-${activeTab}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">
                    {activeTab === 'greetings' ? '💬' : activeTab === 'travel' ? '✈️' : '🏠'}
                  </span>
                  <SectionHeader 
                    title={activeTab === 'greetings' ? "필수 인사말" : activeTab === 'travel' ? "여행 필수 회화" : "실생활 표현"} 
                    color={activeTab === 'greetings' ? "#FF6B6B" : "#4ECDC4"}
                  />
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    {selectedItems.length > 0 && (
                      <button 
                        onClick={() => {
                          if(window.confirm(`선택한 ${selectedItems.length}개의 문장을 삭제하시겠습니까?`)) {
                            const remover = (prev: any[]) => prev.filter((_, idx) => !selectedItems.includes(idx));
                            if(activeTab === 'greetings') setGreetingsData(remover);
                            if(activeTab === 'travel') setTravelData(remover);
                            if(activeTab === 'daily') setDailyData(remover);
                            setSelectedItems([]);
                          }
                        }} 
                        className="flex items-center gap-1 bg-red-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl hover:bg-red-400 transition-all font-bold shadow-md"
                      >
                        <Trash2 size={16} />
                        <span className="text-sm">선택 삭제</span>
                      </button>
                    )}
                    <button onClick={() => setIsAddingMode(true)} className="flex items-center gap-1 bg-[#4ECDC4] text-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl hover:bg-[#45B7AF] transition-all font-bold shadow-md">
                      <Plus size={16} />
                      <span className="text-sm">추가</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(activeTab === 'greetings' ? greetingsData : activeTab === 'travel' ? travelData : dailyData).map((item, i) => (
                  <SentenceCard 
                    key={`${activeTab}-${i}`} 
                    index={i} 
                    item={item} 
                    onPlay={speakText}
                    isAdmin={isAdmin} 
                    isSelected={selectedItems.includes(i)}
                    onToggleSelect={() => {
                      setSelectedItems(prev => 
                        prev.includes(i) ? prev.filter(idx => idx !== i) : [...prev, i]
                      )
                    }}
                    onEdit={() => setEditingItem({tab: activeTab, index: i, item})}
                    onDelete={() => {
                      if(window.confirm('정말 삭제하시겠습니까?')) {
                        const remover = (prev: any[]) => prev.filter((_, idx) => idx !== i);
                        if(activeTab === 'greetings') setGreetingsData(remover);
                        if(activeTab === 'travel') setTravelData(remover);
                        if(activeTab === 'daily') setDailyData(remover);
                        setSelectedItems(prev => prev.filter(idx => idx !== i));
                      }
                    }}
                  />
                ))}
              </div>
            </motion.section>
          )}
          {activeTab === 'board' && (
            <motion.section
              key="board"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">📌</span>
                  <SectionHeader title={tabBoardLabel} color="#FFA07A" />
                </div>
                {isAdmin && (
                  <button onClick={() => setIsAddingBoard(true)} className="flex items-center gap-1 bg-[#4ECDC4] text-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl hover:bg-[#45B7AF] transition-all font-bold shadow-md">
                    <Plus size={16} />
                    <span className="text-sm">글쓰기</span>
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {boardData.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 font-medium bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">등록된 게시물이 없습니다.</div>
                ) : (
                   boardData.map((post) => (
                      <div key={post.id} className="bg-white border-2 border-[#FFDAB9] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-3">
                           <h3 className="text-lg md:text-xl font-bold text-gray-800">{post.title}</h3>
                           {isAdmin && (
                              <button onClick={() => {
                                 if(window.confirm('정말 삭제하시겠습니까?')) {
                                     setBoardData(prev => prev.filter(p => p.id !== post.id));
                                 }
                              }} className="text-red-400 hover:text-red-600 p-1 bg-red-50 rounded-md">
                                <Trash2 size={16} />
                              </button>
                           )}
                        </div>
                        <p className="text-gray-600 text-sm md:text-base whitespace-pre-wrap leading-relaxed">{post.content}</p>
                        {post.image && (
                          <div className="mt-4 rounded-xl overflow-hidden border border-gray-100">
                            <img src={post.image} alt={post.title} className="max-w-full h-auto object-contain max-h-96" />
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-4 text-right">
                           {new Date(post.createdAt).toLocaleString()}
                        </div>
                      </div>
                   ))
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <footer className="text-center py-8 text-gray-400 text-[10px] md:text-xs font-medium tracking-wider">
        {footerText}
      </footer>

      {/* Admin Dashboard Modal */}
      {showAdminDashboard && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto w-full h-full">
          <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} className="bg-gray-50 rounded-3xl w-full max-w-4xl shadow-2xl relative my-4 flex flex-col max-h-[90vh] md:max-h-[85vh]">
            <div className="p-5 md:p-8 border-b border-gray-200 flex justify-between items-center bg-white rounded-t-3xl shrink-0">
              <h2 className="text-xl md:text-2xl font-black text-gray-800 flex items-center gap-2"><Settings size={24} className="text-[#FF6B6B]"/> 관리자 대시보드</h2>
              <button onClick={() => setShowAdminDashboard(false)} className="text-gray-400 hover:text-gray-800 transition-colors"><X size={28}/></button>
            </div>
            
            <div className="p-5 md:p-8 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                
                {/* Left Col: Settings */}
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Home size={18} className="text-indigo-400"/> 홈페이지 기본 설정</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">홈페이지명 (타이틀)</label>
                        <input type="text" value={siteTitle} onChange={e=>setSiteTitle(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:border-indigo-400 focus:outline-none"/>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">서브타이틀 (설명)</label>
                        <input type="text" value={siteSubtitle} onChange={e=>setSiteSubtitle(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:border-indigo-400 focus:outline-none"/>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">하단 카피라이트 (Footer)</label>
                        <input type="text" value={footerText} onChange={e=>setFooterText(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:border-indigo-400 focus:outline-none"/>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">네이버 사이트 소유확인 (Meta Tag Content)</label>
                        <input type="text" value={naverMeta} onChange={e=>setNaverMeta(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:border-indigo-400 focus:outline-none" placeholder="예: 7a9e...................44"/>
                        <p className="text-[10px] text-gray-400 mt-1">네이버 웹마스터도구에서 제공하는 content 값을 입력하세요.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                       <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Settings size={18} className="text-purple-500"/> SEO (검색엔진 최적화) 등록</h3>
                       <button onClick={handleSeoSave} className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">저장하기/반영</button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">robots.txt (검색 로봇 제어)</label>
                        <textarea value={seoData.robotsTxt} onChange={e=>setSeoData({...seoData, robotsTxt: e.target.value})} className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:border-purple-400 focus:outline-none h-24 font-mono text-xs" placeholder="User-agent: *&#10;Allow: /"/>
                        <p className="flex justify-between items-center text-[10px] text-gray-400 mt-1"><span>네이버 서치어드바이저 &gt; 검증 &gt; robots.txt 에서 확인 가능</span><a href="/robots.txt" target="_blank" className="text-purple-500 hover:underline">/robots.txt 열기</a></p>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">사이트맵 (sitemap.xml)</label>
                        <textarea value={seoData.sitemapXml} onChange={e=>setSeoData({...seoData, sitemapXml: e.target.value})} className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:border-purple-400 focus:outline-none h-24 font-mono text-xs" placeholder="<?xml version='1.0' encoding='UTF-8'?>..."/>
                        <p className="flex justify-between items-center text-[10px] text-gray-400 mt-1"><span>sitemap.xml 내용을 복사하여 붙여넣으세요.</span><a href="/sitemap.xml" target="_blank" className="text-purple-500 hover:underline">/sitemap.xml 열기</a></p>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">RSS 피드 (rss.xml)</label>
                        <textarea value={seoData.rssXml} onChange={e=>setSeoData({...seoData, rssXml: e.target.value})} className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:border-purple-400 focus:outline-none h-24 font-mono text-xs" placeholder="<?xml version='1.0' encoding='UTF-8'?>..."/>
                        <p className="flex justify-between items-center text-[10px] text-gray-400 mt-1"><span>rss.xml 내용을 복사하여 붙여넣으세요.</span><a href="/rss.xml" target="_blank" className="text-purple-500 hover:underline">/rss.xml 열기</a></p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><MessageSquare size={18} className="text-green-400"/> 레이어 팝업 (공지)</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <input type="checkbox" id="popupToggle" checked={popupInfo.active} onChange={e=>setPopupInfo({...popupInfo, active: e.target.checked})} className="w-4 h-4 rounded text-green-500 focus:ring-green-500"/>
                        <label htmlFor="popupToggle" className="text-sm font-bold text-gray-700 cursor-pointer">팝업 활성화</label>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">팝업 이미지 (선택)</label>
                        <input type="file" accept="image/*" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                             if (file.size > 2 * 1024 * 1024) { alert('이미지는 2MB 이내로 첨부 가능합니다.'); return; }
                             const reader = new FileReader();
                             reader.onload = (ev) => setPopupInfo({...popupInfo, image: ev.target?.result as string});
                             reader.readAsDataURL(file);
                          }
                        }} className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-2 text-sm font-medium"/>
                        {popupInfo.image && (
                          <div className="mt-2 relative inline-block">
                             <img src={popupInfo.image} className="h-16 object-contain rounded border" />
                             <button onClick={() => setPopupInfo({...popupInfo, image: ''})} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full text-[10px] leading-none">X</button>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">팝업 내용</label>
                        <textarea value={popupInfo.content} onChange={e=>setPopupInfo({...popupInfo, content: e.target.value})} className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:border-green-400 focus:outline-none min-h-[80px]"/>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Plane size={18} className="text-blue-400"/> 카테고리 (메뉴명) 변경</h3>
                    <div className="space-y-3 grid grid-cols-2 gap-x-3 gap-y-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">메뉴 1</label>
                        <input type="text" value={tabLetterLabel} onChange={e=>setTabLetterLabel(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:border-blue-400 focus:outline-none"/>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">메뉴 2</label>
                        <input type="text" value={tabGreetingLabel} onChange={e=>setTabGreetingLabel(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:border-blue-400 focus:outline-none"/>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">메뉴 3</label>
                        <input type="text" value={tabTravelLabel} onChange={e=>setTabTravelLabel(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:border-blue-400 focus:outline-none"/>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">메뉴 4</label>
                        <input type="text" value={tabDailyLabel} onChange={e=>setTabDailyLabel(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:border-blue-400 focus:outline-none"/>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-1">게시판 메뉴</label>
                        <input type="text" value={tabBoardLabel} onChange={e=>setTabBoardLabel(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:border-blue-400 focus:outline-none"/>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Music size={18} className="text-purple-400"/> 배경음악 (BGM) 설정 (5개까지)</h3>
                    <div className="space-y-4">
                      {[0, 1, 2, 3, 4].map((idx) => (
                        <div key={idx}>
                          <label className="block text-xs font-bold text-gray-500 mb-1">BGM {idx + 1}</label>
                          <input type="file" accept="audio/*" onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 5 * 1024 * 1024) { alert('BGM 오디오 파일은 5MB 이내로 첨부 가능합니다.'); return; }
                              const reader = new FileReader();
                              reader.onload = async (ev) => {
                                const dataUrl = ev.target?.result as string;
                                await saveAsset(`bgm_${idx}`, dataUrl);
                                const newPlaylist = [...bgmPlaylist];
                                newPlaylist[idx] = dataUrl;
                                setBgmPlaylist(newPlaylist.filter(v => typeof v === 'string' && v !== ''));
                              };
                              reader.readAsDataURL(file);
                            }
                          }} className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:border-purple-400 focus:outline-none"/>
                          {bgmPlaylist[idx] && (
                            <div className="mt-1 flex items-center justify-between bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                               <p className="text-[11px] text-green-600 font-bold">오디오 등록됨</p>
                               <button onClick={async () => {
                                  await deleteAsset(`bgm_${idx}`);
                                  const newPlaylist = [...bgmPlaylist];
                                  newPlaylist.splice(idx, 1);
                                  setBgmPlaylist(newPlaylist.filter(v => typeof v === 'string' && v !== ''));
                               }} className="text-red-500 hover:text-red-700 text-xs font-bold px-2 py-0.5 rounded-full hover:bg-red-50">삭제</button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Col: Stats */}
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 h-full">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b">
                      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><BarChart2 size={18} className="text-orange-400"/> 접속 통계</h3>
                      <select value={statsPeriod} onChange={e => setStatsPeriod(e.target.value as any)} className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-2 py-1 font-medium text-gray-600 focus:outline-none focus:border-orange-400">
                        <option value="day">오늘 (일간)</option>
                        <option value="week">최근 7일 (주간)</option>
                        <option value="month">최근 30일 (월간)</option>
                        <option value="year">올해 (연간)</option>
                      </select>
                    </div>
                    
                    {(() => {
                        const today = new Date();
                        const startDate = new Date();
                        if (statsPeriod === 'week') startDate.setDate(today.getDate() - 7);
                        else if (statsPeriod === 'month') startDate.setDate(today.getDate() - 30);
                        else if (statsPeriod === 'year') startDate.setFullYear(today.getFullYear(), 0, 1);
                        else startDate.setHours(0,0,0,0); // day
                        
                        let totalVisitors = 0;
                        let periodVisitors = 0;
                        let referrers: Record<string, number> = {};
                        let keywords: Record<string, number> = {};

                        Object.keys(siteStats).forEach(dateStr => {
                           const d = new Date(dateStr);
                           const stat = siteStats[dateStr];
                           totalVisitors += stat.visitors;
                           
                           if (d >= startDate) {
                              periodVisitors += stat.visitors;
                              Object.keys(stat.referrers || {}).forEach(k => referrers[k] = (referrers[k] || 0) + stat.referrers[k]);
                              Object.keys(stat.keywords || {}).forEach(k => keywords[k] = (keywords[k] || 0) + stat.keywords[k]);
                           }
                        });

                        const sortedReferrers = Object.entries(referrers).sort((a,b) => b[1]-a[1]);
                        const totalReferrers = sortedReferrers.reduce((s, c) => s + c[1], 0) || 1; 

                        const sortedKeywords = Object.entries(keywords).sort((a,b) => b[1]-a[1]).slice(0, 20);

                        const colorMap: Record<string, string> = { '네이버': '#03C75A', '구글': '#4285F4', '다음/카카오': '#FAE100', '기초/기타': '#9CA3AF' };

                        return (
                          <div className="space-y-6">
                             <div className="grid grid-cols-2 gap-4">
                               <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100 flex flex-col items-center justify-center text-center">
                                 <span className="text-xs font-bold text-orange-600 mb-1">{statsPeriod === 'day' ? '오늘' : statsPeriod === 'week' ? '주간' : statsPeriod === 'month' ? '월간' : '연간'} 방문자</span>
                                 <span className="text-2xl md:text-3xl font-black text-orange-500">{periodVisitors.toLocaleString()}</span>
                               </div>
                               <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex flex-col items-center justify-center text-center">
                                 <span className="text-xs font-bold text-blue-600 mb-1">총 누적 방문자</span>
                                 <span className="text-2xl md:text-3xl font-black text-blue-500">{totalVisitors.toLocaleString()}</span>
                               </div>
                             </div>

                             <div>
                               <h4 className="text-sm font-bold text-gray-700 mb-3 border-b pb-2">포털별 유입 현황 (해당 기간)</h4>
                               <div className="space-y-2">
                                 {sortedReferrers.length === 0 ? <p className="text-xs text-gray-400">데이터가 없습니다.</p> : sortedReferrers.map(([key, count]) => {
                                     const percent = Math.round((count / totalReferrers) * 100);
                                     const color = colorMap[key] || '#9CA3AF';
                                     return (
                                        <div key={key} className="flex items-center justify-between text-xs md:text-sm">
                                          <div className="flex items-center gap-2 w-24">
                                             <div className="w-3 h-3 rounded-full shrink-0" style={{backgroundColor: color}}></div>
                                             <span className="font-medium text-gray-600 truncate">{key}</span>
                                          </div>
                                          <div className="flex items-center gap-3 flex-1 px-4">
                                             <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full" style={{backgroundColor: color, width: `${percent}%`}}></div>
                                             </div>
                                             <span className="font-bold text-gray-700 w-8 text-right">{percent}%</span>
                                          </div>
                                        </div>
                                     );
                                 })}
                               </div>
                             </div>

                             <div>
                               <h4 className="text-sm font-bold text-gray-700 mb-3 border-b pb-2">인기 유입 키워드 TOP 20 (해당 기간)</h4>
                               <ul className="space-y-2 text-xs md:text-sm">
                                  {sortedKeywords.length === 0 ? <p className="text-xs text-gray-400">데이터가 없습니다.</p> : sortedKeywords.map(([key, count], i) => (
                                     <li key={key} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg font-medium">
                                        <span className="text-gray-700 flex items-center">
                                           <span className={`font-bold mr-3 w-4 text-center ${i===0?'text-red-500':i===1?'text-orange-500':i===2?'text-yellow-500':'text-gray-400'}`}>{i+1}</span>
                                           <span className="truncate max-w-[150px] md:max-w-[200px]" title={key}>{key}</span>
                                        </span>
                                        <span className="text-gray-400 text-xs">{count.toLocaleString()}회</span>
                                     </li>
                                  ))}
                               </ul>
                             </div>
                          </div>
                        );
                    })()}
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Board Post Modal */}
      {isAddingBoard && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative my-8">
            <button onClick={() => setIsAddingBoard(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-800 transition-colors"><X size={24}/></button>
            <h2 className="text-2xl font-black text-gray-800 mb-6">새 게시물 작성</h2>
            <BoardFormContent 
               close={() => setIsAddingBoard(false)}
               onAdd={(post: any) => setBoardData([post, ...boardData])}
            />
          </motion.div>
        </div>
      )}

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative">
            <button onClick={() => setShowAdminLogin(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-800 transition-colors"><X size={24}/></button>
            <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2"><Lock size={20}/> 관리자 로그인</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">아이디</label>
                <input type="text" value={adminId} onChange={e=>setAdminId(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 font-medium focus:border-[#FF9B9B] focus:outline-none transition-colors" placeholder="아이디 입력"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">비밀번호</label>
                <input type="password" value={adminPwd} onChange={e=>setAdminPwd(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 font-medium focus:border-[#FF9B9B] focus:outline-none transition-colors" placeholder="비밀번호 입력" onKeyDown={e => {if(e.key === 'Enter') handleAdminLogin()}}/>
              </div>
              <button onClick={handleAdminLogin} className="w-full bg-[#FF9B9B] text-white font-bold text-lg rounded-xl py-3 hover:bg-[#FF8080] transition-colors mt-2 shadow-md">로그인</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Letter Edit Modal */}
      {editingLetter && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative my-8">
            <button onClick={() => setEditingLetter(null)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-800 transition-colors"><X size={24}/></button>
            <h2 className="text-2xl font-black text-gray-800 mb-6">글자 수정</h2>
            <div className="space-y-4">
              <LetterFormContent 
                editingLetter={editingLetter} 
                close={() => setEditingLetter(null)} 
                setHiraganaData={setHiraganaData} 
                setKatakanaData={setKatakanaData}
              />
            </div>
          </motion.div>
        </div>
      )}

      {/* Sentence Edit Modal */}
      {(editingItem || isAddingMode) && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative my-8">
            <button onClick={() => {setEditingItem(null); setIsAddingMode(false);}} className="absolute right-4 top-4 text-gray-400 hover:text-gray-800 transition-colors"><X size={24}/></button>
            <h2 className="text-2xl font-black text-gray-800 mb-6">{isAddingMode ? '새 문장 추가' : '문장 수정'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">분류</label>
                {isAddingMode ? (
                  <select disabled className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-2 font-medium">
                    <option value="">{activeTab === 'greetings' ? '인사말' : activeTab === 'travel' ? '여행' : '생활'}</option>
                  </select>
                ) : (
                  <input type="text" value={editingItem?.tab === 'greetings' ? '인사말' : editingItem?.tab === 'travel' ? '여행' : '생활'} disabled className="w-full bg-gray-100 border-2 border-gray-200 rounded-xl px-4 py-2 font-medium text-gray-500"/>
                )}
              </div>
              
              <FormContent editingItem={editingItem} isAddingMode={isAddingMode} close={() => {setEditingItem(null); setIsAddingMode(false);}} activeTab={activeTab} setGreetingsData={setGreetingsData} setTravelData={setTravelData} setDailyData={setDailyData}/>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function FormContent({editingItem, isAddingMode, close, activeTab, setGreetingsData, setTravelData, setDailyData}: any) {
  const [jp, setJp] = useState(editingItem ? editingItem?.item?.jp : '');
  const [ko, setKo] = useState(editingItem ? editingItem?.item?.ko : '');
  const [mean, setMean] = useState(editingItem ? editingItem?.item?.mean : '');

  const handleSave = () => {
    if(!jp || !ko || !mean) return alert('모든 칸을 입력해주세요.');
    const newItem = { jp, ko, mean };
    
    const updateTarget = (prev: any[]) => {
      if(isAddingMode) return [...prev, newItem];
      const next = [...prev];
      next[editingItem.index] = newItem;
      return next;
    };

    const targetTab = isAddingMode ? activeTab : editingItem.tab;
    if(targetTab === 'greetings') setGreetingsData(updateTarget);
    if(targetTab === 'travel') setTravelData(updateTarget);
    if(targetTab === 'daily') setDailyData(updateTarget);
    close();
  };

  return (
    <>
      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1">일본어 (漢字/ひらがな)</label>
        <input type="text" value={jp} onChange={e=>setJp(e.target.value)} className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 font-medium focus:border-[#FF9B9B] focus:outline-none transition-colors" placeholder="예: こんにちは"/>
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1">한국어 발음</label>
        <input type="text" value={ko} onChange={e=>setKo(e.target.value)} className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 font-medium focus:border-[#FF9B9B] focus:outline-none transition-colors" placeholder="예: 콘니치와"/>
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1">뜻</label>
        <input type="text" value={mean} onChange={e=>setMean(e.target.value)} className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 font-medium focus:border-[#FF9B9B] focus:outline-none transition-colors" placeholder="예: 안녕하세요"/>
      </div>
      <button onClick={handleSave} className="w-full bg-[#4ECDC4] text-white font-bold text-lg rounded-xl py-3 hover:bg-[#45B7AF] transition-colors mt-6 shadow-md">{isAddingMode ? '추가하기' : '수정하기'}</button>
    </>
  );
}

// Ensure the handleAdminLogin is defined inside App component
function TabButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 md:px-6 md:py-2 rounded-full font-bold transition-all text-xs md:text-base ${
        active 
          ? 'bg-white text-[#FF9B9B] shadow-sm' 
          : 'bg-transparent text-white hover:bg-white/10'
      }`}
    >
      {label}
    </button>
  );
}

function SectionHeader({ title, color }: { title: string, color: string }) {
  return (
    <div className="pb-1 group">
      <h2 className="text-xl md:text-3xl font-black mb-1" style={{ color }}>{title}</h2>
    </div>
  );
}


function LetterFormContent({editingLetter, close, setHiraganaData, setKatakanaData}: any) {
  const [jp, setJp] = useState(editingLetter.item?.jp || '');
  const [ko, setKo] = useState(editingLetter.item?.ko || '');

  const handleSave = () => {
    const newItem = (jp && ko) ? { jp, ko } : null;
    
    const updateTarget = (prev: any[]) => {
      const next = [...prev];
      next[editingLetter.index] = newItem;
      return next;
    };

    if(editingLetter.type === 'hiragana') setHiraganaData(updateTarget);
    if(editingLetter.type === 'katakana') setKatakanaData(updateTarget);
    close();
  };

  const handleRemove = () => {
    const updateTarget = (prev: any[]) => {
      const next = [...prev];
      next[editingLetter.index] = null;
      return next;
    };
    if(editingLetter.type === 'hiragana') setHiraganaData(updateTarget);
    if(editingLetter.type === 'katakana') setKatakanaData(updateTarget);
    close();
  };

  return (
    <>
      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1">일본어 글자</label>
        <input type="text" value={jp} onChange={e=>setJp(e.target.value)} className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 font-medium focus:border-[#FF9B9B] focus:outline-none transition-colors" placeholder="예: あ"/>
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1">한국어 발음</label>
        <input type="text" value={ko} onChange={e=>setKo(e.target.value)} className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 font-medium focus:border-[#FF9B9B] focus:outline-none transition-colors" placeholder="예: 아"/>
      </div>
      <div className="flex gap-2 mt-6">
        <button onClick={handleRemove} className="flex-1 bg-red-100 text-red-600 font-bold text-sm md:text-base rounded-xl py-3 hover:bg-red-200 transition-colors shadow-md">빈칸으로 만들기</button>
        <button onClick={handleSave} className="flex-1 bg-[#4ECDC4] text-white font-bold text-sm md:text-base rounded-xl py-3 hover:bg-[#45B7AF] transition-colors shadow-md">저장하기</button>
      </div>
    </>
  );
}

interface SentenceCardProps {
  item: SentenceItem;
  index: number;
  onPlay: (t: string) => void;
  isAdmin?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const SentenceCard: FC<SentenceCardProps> = ({ item, index, onPlay, isAdmin, isSelected, onToggleSelect, onEdit, onDelete }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.01 }}
      className={`flex items-center justify-between p-3 md:p-5 bg-[#F8F9FA] border-l-[6px] md:border-l-[10px] ${isSelected ? 'border-red-500 bg-red-50' : 'border-[#FF9B9B]'} rounded-xl md:rounded-2xl hover:bg-white hover:shadow-lg transition-all group relative`}
    >
      {isAdmin && (
        <div className="mr-3 flex items-center justify-center">
          <input 
            type="checkbox" 
            checked={isSelected}
            onChange={onToggleSelect}
            className="w-5 h-5 rounded border-gray-300 text-red-500 focus:ring-red-500 shrink-0 cursor-pointer"
          />
        </div>
      )}
      <div className="flex-1 pr-3 md:pr-6 min-w-0">
        <div className="flex flex-col">
          <span className="text-sm md:text-xl font-bold text-gray-800 leading-tight mb-0.5 truncate">{item.jp}</span>
          <span className="text-[10px] md:text-xs text-gray-400 font-medium italic tracking-wide lowercase mb-1 leading-none">{item.ko}</span>
          <span className="text-xs md:text-base font-black text-[#FF6B6B] leading-tight truncate">{item.mean}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isAdmin && (
          <div className="flex flex-col gap-1 mr-1">
            <button onClick={onEdit} className="p-1.5 md:p-2 rounded-lg bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition-colors"><Pencil size={14}/></button>
            <button onClick={onDelete} className="p-1.5 md:p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"><Trash2 size={14}/></button>
          </div>
        )}
        <button 
          onClick={() => onPlay(item.jp)}
          className="size-8 md:size-12 rounded-lg md:rounded-full bg-[#4ECDC4] text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all flex-shrink-0"
        >
          <Volume2 size={16} />
        </button>
      </div>
    </motion.div>
  );
}

function BoardFormContent({ close, onAdd }: any) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');

  const handleImage = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
         alert('이미지는 2MB 이내로 첨부 가능합니다.');
         return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => setImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }
    onAdd({
      id: Date.now().toString(),
      title,
      content,
      image,
      createdAt: Date.now()
    });
    close();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1">제목</label>
        <input type="text" value={title} onChange={e=>setTitle(e.target.value)} className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 font-medium focus:border-orange-400 focus:outline-none" placeholder="게시물 제목"/>
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1">내용</label>
        <textarea value={content} onChange={e=>setContent(e.target.value)} className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 font-medium focus:border-orange-400 focus:outline-none min-h-[150px]" placeholder="글을 작성해주세요..."/>
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1">이미지 첨부 (선택, 최대 2MB)</label>
        <input type="file" accept="image/*" onChange={handleImage} className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-2 font-medium text-sm"/>
        {image && <img src={image} className="mt-3 h-32 object-contain rounded-lg border" />}
      </div>
      <div className="pt-2">
        <button onClick={handleSave} className="w-full bg-orange-400 text-white font-bold text-lg rounded-xl py-3 hover:bg-orange-500 transition-colors shadow-md">작성하기</button>
      </div>
    </div>
  );
}


