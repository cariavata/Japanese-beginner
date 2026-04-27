/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef, FC } from 'react';
import { Volume2, Plane, Home, MessageSquare, Info, Music, Music2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Data Section ---

interface CharItem {
  jp: string;
  ko: string;
}

type CharData = (CharItem | null)[];

const hiraganaData: CharData = [
  { jp: 'あ', ko: '아' }, { jp: 'い', ko: '이' }, { jp: 'う', ko: '우' }, { jp: 'え', ko: '에' }, { jp: 'お', ko: '오' },
  { jp: 'か', ko: '카' }, { jp: 'き', ko: '키' }, { jp: 'く', ko: '쿠' }, { jp: 'け', ko: '케' }, { jp: 'こ', ko: '코' },
  { jp: 'さ', ko: '사' }, { jp: 'し', ko: '시' }, { jp: 'す', ko: '스' }, { jp: 'せ', ko: '세' }, { jp: 'そ', ko: '소' },
  { jp: 'た', ko: '타' }, { jp: 'ち', ko: '치' }, { jp: 'つ', ko: '츠' }, { jp: 'て', ko: '테' }, { jp: 'と', ko: '토' },
  { jp: 'な', ko: '나' }, { jp: 'に', ko: '니' }, { jp: 'ぬ', ko: '누' }, { jp: 'ね', ko: '네' }, { jp: 'の', ko: '노' },
  { jp: 'は', ko: '하' }, { jp: 'ひ', ko: '히' }, { jp: 'ふ', ko: '후' }, { jp: 'へ', ko: '헤' }, { jp: 'ほ', ko: '호' },
  { jp: 'ま', ko: '마' }, { jp: 'み', ko: '미' }, { jp: 'む', ko: '무' }, { jp: '메', ko: '메' }, { jp: 'も', ko: '모' },
  { jp: 'や', ko: '야' }, null, { jp: 'ゆ', ko: '유' }, null, { jp: 'よ', ko: '요' },
  { jp: 'ら', ko: '라' }, { jp: 'り', ko: '리' }, { jp: 'る', ko: '루' }, { jp: 'れ', ko: '레' }, { jp: 'ろ', ko: '로' },
  { jp: 'わ', ko: '와' }, null, null, null, { jp: 'を', ko: '오(조사)' },
  { jp: 'ん', ko: '응' }, null, null, null, null
];

const katakanaData: CharData = [
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

const greetingsData: SentenceItem[] = [
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

const travelData: SentenceItem[] = [
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

const dailyData: SentenceItem[] = [
  { jp: 'おはようございます', ko: '오하요- 고자이마스', mean: '좋은 아침입니다' },
  { jp: 'いただきます', ko: '이타다키마스', mean: '잘 먹겠습니다' },
  { jp: 'ごちそうさまでした', ko: '고치소-사마데시타', mean: '잘 먹었습니다' },
  { jp: 'いってきます', ko: '잇테키마스', mean: '다녀오겠습니다' },
  { jp: 'いってらっしゃい', ko: '잇테랏샤이', mean: '다녀오세요' },
  { jp: 'ただいま', ko: '타다이마', mean: '다녀왔습니다' },
  { jp: 'おかえりなさい', ko: '오카에리나사이', mean: '다녀오셨어요' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('letters');
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
          audioRef.current.volume = 0.02;
        }
      };
      
      const restoreVolume = () => {
        if (audioRef.current) {
          audioRef.current.volume = 0.05;
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
          audioRef.current.volume = 0.02;
        }
      };

      const restoreVolume = () => {
        if (audioRef.current) {
          audioRef.current.volume = 0.05;
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
        audioRef.current.volume = 0.05;
      }
    }
  }, []);

  const toggleBgm = () => {
    if (!audioRef.current) return;
    
    if (isBgmPlaying) {
      audioRef.current.pause();
      userManuallyPaused.current = true;
      setIsBgmPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        userManuallyPaused.current = false;
        setIsBgmPlaying(true);
      }).catch(err => {
        console.error("BGM Autoplay blocked:", err);
        alert("브라우저 설정에 의해 음악 재생이 막혔습니다. 화면을 클릭한 후 다시 버튼을 눌러주세요.");
      });
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
        src="https://archive.org/download/beautiful-japanese-music-koto-music-shakuhachi-music/beautiful-japanese-music-koto-music-shakuhachi-music.mp3" 
        loop 
        preload="auto"
      />
      {/* TTS Audio Fallback */}
      <audio ref={ttsAudioRef} className="hidden" preload="none" />

      {/* Header */}
      <header className="bg-[#FF9B9B] text-white p-6 shadow-md border-b-4 border-[#FF6B6B]/10 relative overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight m-0">처음 만나는 일본어 🌸</h1>
            <p className="text-pink-100 mt-2 text-base md:text-lg">왕초보를 위한 가장 쉽고 재미있는 일본어 놀이터</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* BGM Toggle Button */}
            <button 
              onClick={toggleBgm}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border-2 ${isBgmPlaying ? 'bg-white text-rose-400 border-white font-bold' : 'bg-rose-400/30 text-white border-white/30 hover:bg-white/10'}`}
              title="배경음악 토글"
            >
              {isBgmPlaying ? <Music size={18} /> : <Music2 size={18} />}
              <span className="text-sm font-bold uppercase tracking-wider">{isBgmPlaying ? 'BGM ON' : 'BGM OFF'}</span>
            </button>

            <div className="hidden md:flex bg-white/20 p-3 rounded-2xl border border-white/30 text-center backdrop-blur-sm">
              <span className="block text-xs uppercase font-bold tracking-widest text-white/80">오늘의 학습</span>
              <span className="text-2xl font-black">20 / 120</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-[#FFB3B3] p-2 md:p-3 flex justify-center gap-2 md:gap-4 border-b border-[#FF9B9B] sticky top-0 z-50 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <TabButton active={activeTab === 'letters'} onClick={() => setActiveTab('letters')} label="문자 마스터" />
        <TabButton active={activeTab === 'greetings'} onClick={() => setActiveTab('greetings')} label="🙏 필수 인사말" />
        <TabButton active={activeTab === 'travel'} onClick={() => setActiveTab('travel')} label="✈️ 여행 회화" />
        <TabButton active={activeTab === 'daily'} onClick={() => setActiveTab('daily')} label="🏠 생활 표현" />
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto my-6 p-4 md:p-8 bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border-4 border-[#FFE4E1] mx-4 md:mx-auto">
        <div className="bg-[#FFF8E1] border border-[#FFECB3] p-4 rounded-2xl text-xs md:text-sm text-[#795548] mb-6 flex items-start md:items-center gap-3">
          <span className="text-xl md:text-2xl flex-shrink-0">💡</span>
          <p className="leading-snug">
            <strong>Tip:</strong> 글자 칸을 클릭하면 발음을 들을 수 있습니다! 소리가 나지 않는다면 <b>볼륨</b>과 <b>무음 모드</b>를 확인해 주세요.
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
                      className="bg-[#FFF0F5] border-2 border-[#FFE4E1] rounded-xl md:rounded-2xl p-3 md:p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center relative overflow-hidden"
                    >
                      <span className="text-2xl md:text-5xl font-black text-[#FF6B6B] mb-1 md:mb-2">{item.jp}</span>
                      <span className="text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-tight leading-none">{item.ko}</span>
                      <div className="mt-2 text-base md:text-xl opacity-30">🔊</div>
                    </motion.div>
                  ) : (
                    <div key={`empty-${idx}`} className="h-16 md:h-28 border border-dashed border-gray-100 rounded-xl md:rounded-2xl opacity-50" />
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
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">
                  {activeTab === 'greetings' ? '💬' : activeTab === 'travel' ? '✈️' : '🏠'}
                </span>
                <SectionHeader 
                  title={activeTab === 'greetings' ? "필수 인사말" : activeTab === 'travel' ? "여행 필수 회화" : "실생활 표현"} 
                  description={activeTab === 'greetings' ? "기초 인사 20선입니다." : activeTab === 'travel' ? "여행 50문장입니다." : "생활 50문장입니다."} 
                  color={activeTab === 'greetings' ? "#FF6B6B" : "#4ECDC4"}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(activeTab === 'greetings' ? greetingsData : activeTab === 'travel' ? travelData : dailyData).map((item, i) => (
                  <SentenceCard key={`${activeTab}-${i}`} index={i} item={item} onPlay={speakText} />
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <footer className="text-center py-8 text-gray-300 text-[10px] md:text-xs font-medium tracking-wider uppercase">
        © 2026 처음 만나는 일본어. 실전 일본어 학습기
      </footer>
    </div>
  );
}

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

function SectionHeader({ title, description, color }: { title: string, description: string, color: string }) {
  return (
    <div className="pb-1">
      <h2 className="text-xl md:text-3xl font-black mb-1" style={{ color }}>{title}</h2>
      <p className="text-gray-400 text-xs md:text-sm font-medium">{description}</p>
    </div>
  );
}

interface SentenceCardProps {
  item: SentenceItem;
  index: number;
  onPlay: (t: string) => void;
}

const SentenceCard: FC<SentenceCardProps> = ({ item, index, onPlay }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.01 }}
      className="flex items-center justify-between p-3 md:p-5 bg-[#F8F9FA] border-l-[6px] md:border-l-[10px] border-[#FF9B9B] rounded-xl md:rounded-2xl hover:bg-white hover:shadow-lg transition-all group"
    >
      <div className="flex-1 pr-3 md:pr-6 min-w-0">
        <div className="flex flex-col">
          <span className="text-sm md:text-xl font-bold text-gray-800 leading-tight mb-0.5 truncate">{item.jp}</span>
          <span className="text-[10px] md:text-xs text-gray-400 font-medium italic tracking-wide lowercase mb-1 leading-none">{item.ko}</span>
          <span className="text-xs md:text-base font-black text-[#FF6B6B] leading-tight truncate">{item.mean}</span>
        </div>
      </div>
      <button 
        onClick={() => onPlay(item.jp)}
        className="size-8 md:size-12 rounded-lg md:rounded-full bg-[#4ECDC4] text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all flex-shrink-0"
      >
        <Volume2 size={16} />
      </button>
    </motion.div>
  );
}
