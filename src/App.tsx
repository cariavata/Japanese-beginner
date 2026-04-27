/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef, FC } from 'react';
import { Volume2, Plane, Home, MessageSquare, Info } from 'lucide-react';
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
  { jp: 'クレジットカードは使えますか', ko: '쿠레짓토카-도와 츠카에마스카', mean: '신용카드 되나요?' },
  { jp: '免税できますか', ko: '멘제- 데키마스카', mean: '면세 되나요?' },
  { jp: '袋はいりません', ko: '후쿠로와 이리마센', mean: '봉투는 필요 없습니다' },
  { jp: 'トイレはどこですか', ko: '토이레와 도코데스카', mean: '화장실은 어디인가요?' },
  { jp: 'コンビニはどこですか', ko: '콤비니와 도코데스카', mean: '편의점은 어디인가요?' },
  { jp: '駅はどちらですか', ko: '에키와 도치라데스카', mean: '역은 어느 쪽인가요?' },
  { jp: '迷子になりました', ko: '마이고니 나리마시타', mean: '길을 잃었습니다' },
  { jp: '助けてください', ko: '타스케테 쿠다사이', mean: '도와주세요!' },
  { jp: '警察を呼んでください', ko: '케이사츠오 욘데 쿠다사이', mean: '경찰을 불러주세요!' },
  { jp: '救急車を呼んでください', ko: '큐-큐-샤오 욘데 쿠다사이', mean: '구급차를 불러주세요!' },
  { jp: 'パスポートをなくしました', ko: '파스포-토오 나쿠시마시타', mean: '여권을 잃어버렸습니다' },
  { jp: '財布を盗まれました', ko: '사이후오 누수마레마시타', mean: '지갑을 도둑맞았습니다' },
  { jp: '韓国の領事館はどこですか', ko: '칸코쿠노 료-지칸와 도코데스카', mean: '한국 영사관은 어디인가요?' }
];

const dailyData: SentenceItem[] = [
  { jp: 'はい', ko: '하이', mean: '네' },
  { jp: 'いいえ', ko: '이-에', mean: '아니오' },
  { jp: 'わかりました', ko: '와카리마시타', mean: '알겠습니다' },
  { jp: 'わかりません', ko: '와카리마센', mean: '모르겠습니다' },
  { jp: '大丈夫です', ko: '다이죠-부데스', mean: '괜찮습니다' },
  { jp: 'そうです', ko: '소-데스', mean: '그렇습니다' },
  { jp: '違います', ko: '치가이마스', mean: '아닙니다 (틀립니다)' },
  { jp: '本当ですか', ko: '혼토-데스카', mean: '정말인가요?' },
  { jp: 'なるほど', ko: '나루호도', mean: '그렇군요 / 과연' },
  { jp: 'もちろん', ko: '모치론', mean: '물론이죠' },
  { jp: '嬉しいです', ko: '우레시-데스', mean: '기쁩니다' },
  { jp: '悲しいです', ko: '카나시-데스', mean: '슬픕니다' },
  { jp: '疲れています', ko: '츠카레테이마스', mean: '피곤합니다' },
  { jp: '眠いです', ko: '네무이데스', mean: '졸립니다' },
  { jp: 'お腹が空きました', ko: '오나카가 수키마시타', mean: '배가 고픕니다' },
  { jp: 'お腹がいっぱいです', ko: '오나카가 잇파이데스', mean: '배가 부릅니다' },
  { jp: '暑いです', ko: '아츠이데스', mean: '덥습니다' },
  { jp: '寒いです', ko: '사무이데스', mean: '춥습니다' },
  { jp: '痛いです', ko: '이타이데스', mean: '아픕니다' },
  { jp: '気分が悪いです', ko: '키분가 와루이데스', mean: '기분(컨디션)이 안 좋습니다' },
  { jp: 'いってきます', ko: '잇테키마스', mean: '다녀오겠습니다' },
  { jp: 'いってらっしゃい', ko: '잇테랏샤이', mean: '다녀오세요' },
  { jp: 'ただいま', ko: '타다이마', mean: '다녀왔습니다' },
  { jp: 'おかえりなさい', ko: '오카에리나사이', mean: '다녀오셨어요' },
  { jp: 'いただきます', ko: '이타다키마스', mean: '잘 먹겠습니다' },
  { jp: 'ごちそうさまでした', ko: '고치소-사마데시타', mean: '잘 먹었습니다' },
  { jp: 'また明日', ko: '마타 아시타', mean: '내일 봐요' },
  { jp: '気をつけて', ko: '키오 츠케테', mean: '조심해요' },
  { jp: 'お願いします', ko: '오네가이시마스', mean: '부탁드립니다' },
  { jp: 'ちょっと待ってください', ko: '춋토 맛테 쿠다사이', mean: '조금 기다려 주세요' },
  { jp: 'もう一度言ってください', ko: '모- 이치도 잇테 쿠다사이', mean: '다시 한 번 말해주세요' },
  { jp: 'ゆっくり話してください', ko: '윳쿠리 하나시테 쿠다사이', mean: '천천히 말해주세요' },
  { jp: '手伝ってください', ko: '테츠닷테 쿠다사이', mean: '도와주세요' },
  { jp: 'ここに書いてください', ko: '코코니 카이테 쿠다사이', mean: '여기에 적어주세요' },
  { jp: '写真をとってください', ko: '샤신오 톳테 쿠다사이', mean: '사진 좀 찍어주세요' },
  { jp: 'これを使ってもいいですか', ko: '코레오 츠캇테모 이-데스카', mean: '이것을 사용해도 될까요?' },
  { jp: '好きです', ko: '스키데스', mean: '좋아합니다' },
  { jp: '嫌いです', ko: '키라이데스', mean: '싫어합니다' },
  { jp: '韓国から来ました', ko: '칸코쿠카라 키마시타', mean: '한국에서 왔습니다' },
  { jp: '日本語が少しわかります', ko: '니홍고가 스코시 와카리마스', mean: '일본어를 조금 압니다' },
  { jp: '日本語ができません', ko: '니홍고가 데키마센', mean: '일본어를 못합니다' },
  { jp: '英語は話せますか', ko: '에-고와 하나세마스카', mean: '영어 할 줄 아시나요?' },
  { jp: 'どういう意味ですか', ko: '도-유- 이미데스카', mean: '무슨 뜻인가요?' },
  { jp: '気にしないでください', ko: '키니 시나이데 쿠다사이', mean: '신경 쓰지 마세요' },
  { jp: '頑張ってください', ko: '간밧테 쿠다사이', mean: '힘내세요! 화이팅!' },
  { jp: '今何時ですか', ko: '이마 난지데스카', mean: '지금 몇 시인가요?' },
  { jp: '今日', ko: '쿄-', mean: '오늘' },
  { jp: '明日', ko: '아시타', mean: '내일' },
  { jp: '昨日', ko: '키노-', mean: '어제' },
  { jp: '週末', ko: '슈-마츠', mean: '주말' }
];

// --- Component Section ---

export default function App() {
  const [activeTab, setActiveTab] = useState('letters');
  const [letterType, setLetterType] = useState<'hiragana' | 'katakana'>('hiragana');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const updateVoices = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
      voicesRef.current = v;
    };
    
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
    
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speakText = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      alert("현재 브라우저는 음성 듣기 기능을 지원하지 않습니다. (크롬 브라우저를 추천합니다)");
      return;
    }

    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    
    const jaVoice = voicesRef.current.find(voice => 
      voice.lang === 'ja-JP' || voice.lang === 'ja_JP' || voice.lang.startsWith('ja')
    );
    
    if (jaVoice) {
      utterance.voice = jaVoice;
    }

    utterance.rate = 0.85;
    utterance.pitch = 1.0;
    
    utterance.onerror = (event) => {
      console.error("음성 재생 오류: ", event.error);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF5F7] text-[#333] font-sans selection:bg-rose-200">
      {/* Header */}
      <header className="bg-[#FF9B9B] text-white p-6 shadow-md border-b-4 border-[#FF6B6B]/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight m-0">처음 만나는 일본어 🌸</h1>
            <p className="text-pink-100 mt-2 text-lg">왕초보를 위한 가장 쉽고 재미있는 일본어 놀이터</p>
          </div>
          <div className="hidden md:flex gap-3">
            <div className="bg-white/20 p-3 rounded-2xl border border-white/30 text-center backdrop-blur-sm">
              <span className="block text-xs uppercase font-bold tracking-widest text-white/80">오늘의 학습</span>
              <span className="text-2xl font-black">20 / 120</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-[#FFB3B3] p-3 flex justify-center gap-4 border-b border-[#FF9B9B] sticky top-0 z-50 overflow-x-auto whitespace-nowrap">
        <TabButton 
          active={activeTab === 'letters'} 
          onClick={() => setActiveTab('letters')}
          label="문자 마스터" 
        />
        <TabButton 
          active={activeTab === 'greetings'} 
          onClick={() => setActiveTab('greetings')}
          label="🙏 필수 인사말" 
        />
        <TabButton 
          active={activeTab === 'travel'} 
          onClick={() => setActiveTab('travel')}
          label="✈️ 여행 회화" 
        />
        <TabButton 
          active={activeTab === 'daily'} 
          onClick={() => setActiveTab('daily')}
          label="🏠 생활 표현" 
        />
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto my-8 p-6 md:p-8 bg-white rounded-[2.5rem] shadow-2xl border-4 border-[#FFE4E1] mx-4 md:mx-auto">
        <div className="bg-[#FFF8E1] border border-[#FFECB3] p-4 rounded-2xl text-sm text-[#795548] mb-8 flex items-start md:items-center gap-3">
          <span className="text-2xl flex-shrink-0">💡</span>
          <p className="leading-snug">
            <strong>Tip:</strong> 글자 칸 전체를 클릭하면 일본어 발음을 들을 수 있습니다! 소리가 나지 않는다면 <b>무음 모드</b>를 해제해 주세요.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'letters' && (
            <motion.section
              key="letters"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-black text-[#FF6B6B] flex items-center gap-3">
                  <span className="bg-[#FF6B6B] text-white w-10 h-10 rounded-xl flex items-center justify-center text-lg">あ</span>
                  기본 문자 익히기
                </h2>
                <div className="flex bg-gray-100 rounded-full p-1 overflow-hidden">
                  <button 
                    className={`px-5 py-1.5 rounded-full text-sm font-bold transition-all ${letterType === 'hiragana' ? 'bg-white shadow-sm text-[#FF6B6B]' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setLetterType('hiragana')}
                  >
                    히라가나
                  </button>
                  <button 
                    className={`px-5 py-1.5 rounded-full text-sm font-bold transition-all ${letterType === 'katakana' ? 'bg-white shadow-sm text-[#FF6B6B]' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setLetterType('katakana')}
                  >
                    가타카나
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-3 md:gap-5">
                {(letterType === 'hiragana' ? hiraganaData : katakanaData).map((item, idx) => (
                  item ? (
                    <motion.div
                      key={`${letterType}-${idx}`}
                      whileHover={{ y: -5, backgroundColor: '#FFE4E1' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => speakText(item.jp)}
                      className="bg-[#FFF0F5] border-2 border-[#FFE4E1] rounded-2xl p-4 md:p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center relative overflow-hidden"
                    >
                      <span className="text-4xl md:text-5xl font-black text-[#FF6B6B] mb-2">{item.jp}</span>
                      <span className="text-sm font-bold text-gray-400 uppercase tracking-tight">{item.ko}</span>
                      <div className="mt-3 text-xl opacity-40 group-hover:opacity-100 transition-opacity">
                        🔊
                      </div>
                    </motion.div>
                  ) : (
                    <div key={`empty-${idx}`} className="h-28 border border-dashed border-gray-100 rounded-2xl" />
                  )
                ))}
              </div>
            </motion.section>
          )}

          {(activeTab === 'greetings' || activeTab === 'travel' || activeTab === 'daily') && (
            <motion.section
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">
                  {activeTab === 'greetings' ? '💬' : activeTab === 'travel' ? '✈️' : '🏠'}
                </span>
                <SectionHeader 
                  title={activeTab === 'greetings' ? "필수 인사말" : activeTab === 'travel' ? "여행 필수 회화" : "실생활 표현"} 
                  description={activeTab === 'greetings' ? "가장 많이 쓰는 일본어 기초 인사 20선입니다." : activeTab === 'travel' ? "현지 여행 시 즉각 활용 가능한 50문장입니다." : "현지인처럼 자연스럽게 대화하는 50문장입니다."} 
                  color={activeTab === 'greetings' ? "#FF6B6B" : "#4ECDC4"}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(activeTab === 'greetings' ? greetingsData : activeTab === 'travel' ? travelData : dailyData).map((item, i) => (
                  <SentenceCard key={i} index={i} item={item} onPlay={speakText} />
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <footer className="text-center py-12 text-gray-300 text-xs font-medium tracking-wider">
        © 2026 처음 만나는 일본어. 학습용 웹 브라우저 최적화 버전
      </footer>
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 rounded-full font-bold transition-all text-base ${
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
    <div className="pb-2">
      <h2 className="text-3xl font-black mb-1" style={{ color }}>{title}</h2>
      <p className="text-gray-500 font-medium">{description}</p>
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
      className="flex items-center justify-between p-5 bg-[#F8F9FA] border-l-[10px] border-[#FF9B9B] rounded-2xl hover:bg-white hover:shadow-lg transition-all group"
    >
      <div className="flex-1 pr-6">
        <div className="flex flex-col">
          <span className="text-lg md:text-xl font-bold text-gray-800 leading-tight mb-1">{item.jp}</span>
          <span className="text-xs text-gray-400 font-medium italic tracking-wide lowercase mb-1 leading-none">{item.ko}</span>
          <span className="text-base font-black text-[#FF6B6B] mt-1">{item.mean}</span>
        </div>
      </div>
      <button 
        onClick={() => onPlay(item.jp)}
        className="size-12 rounded-full bg-[#4ECDC4] text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all flex-shrink-0"
      >
        <Volume2 size={24} />
      </button>
    </motion.div>
  );
}
