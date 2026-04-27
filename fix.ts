import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');
const searchStr = "クレジットカードは使え";
const idx = content.indexOf(searchStr);
if (idx !== -1) {
  const exportIdx = content.indexOf("export default function App() {", idx);
  if (exportIdx !== -1) {
    const before = content.slice(0, idx);
    const after = content.slice(exportIdx + "export default function App() {".length);
    const replacement = `クレジットカードは使えますか', ko: '쿠레짓토카-도와 츠카에마스카', mean: '신용카드 되나요?' }
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

export default function App() {`;
    fs.writeFileSync('src/App.tsx', before + replacement + after);
    console.log("Fixed!");
  } else {
    console.log("export loop not found");
  }
} else {
  console.log("search str not found");
}
