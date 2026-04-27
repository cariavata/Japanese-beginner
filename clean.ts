import fs from 'fs';
const lines = fs.readFileSync('src/App.tsx', 'utf8').split('\n');
const before = lines.slice(0, 351);
const after = lines.slice(483);
const finalLines = [...before, "}", "", ...after];
fs.writeFileSync('src/App.tsx', finalLines.join('\n'));
console.log("Cleaned up App.tsx lines!");
