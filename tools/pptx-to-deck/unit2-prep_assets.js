// copies the PPT pictures of 2-5~7 into assets (prefix u2-)
const fs = require('fs'), path = require('path');
const media = path.join(__dirname, 'x', 'ppt', 'media');
const out = 'E:/OneDrive/OneDrive - 민족사관고등학교/kmla-korean history study/assets';
const M = {
  7: 'partisan-map', 8: 'kim-stalin', 9: 'acheson', 11: 'hangang-bridge', 12: 'seoul-nk-army', 13: 'hangang-refugees',
  15: '16nations', 16: 'nakdong', 17: 'incheon', 18: 'seoul-recapture', 19: 'yalu-chinese', 21: 'heungnam-ship',
  23: 'jangjin-route', 25: 'jangjin-1', 26: 'jangjin-2', 27: 'jangjin-3', 28: 'jangjin-4', 29: 'veteran-statues', 30: 'jangjin-snow',
  31: 'heungnam-crowd', 32: 'chinese-bugle', 33: 'chinese-seoul', 34: 'retreat-14', 35: 'bangmagoji',
  37: 'armistice-photo', 38: 'armistice-text', 39: 'armistice-sign', 40: 'war-map', 41: 'war-summary',
  42: 'casualty-graph', 43: 'casualty-info', 44: 'orphan', 45: 'industry-damage', 46: 'ruins',
  47: 'picasso', 48: 'massacre-photo', 49: 'bodo-textbook', 50: 'bodo-truth', 51: 'bodo-history', 52: 'bodo-scene', 53: 'bodo-card',
  54: 'bodo-testimony', 55: 'bodo-betray', 57: 'bodo-loyal', 58: 'golryeonggol',
  61: 'nds-recruit', 62: 'nds-march2', 63: 'nds-march1', 65: 'usa-treaty',
  67: 'assembly2', 68: 'busan-bus', 70: 'balchwae-vote', 71: 'assembly54', 72: 'constitution55', 73: 'liberal-statement', 74: 'protest-1954',
  75: 'election-poster', 76: 'shin-rally', 77: 'trial-cho', 78: 'nsl-1959', 80: 'kim-statue',
  82: 'nk-plan-table', 83: 'us-aid-graph', 84: 'us-aid-table', 85: 'rice-graph', 86: 'counterpart', 87: 'cheonggye', 88: 'market',
  89: 'freedom-poster', 90: 'freedom-novel', 92: 'school-graph', 93: 'school-text', 94: 'outdoor-class'
};
Object.keys(M).forEach(id => {
  const f = fs.readdirSync(media).find(n => new RegExp('^image' + id + '\\.').test(n));
  if (!f) { console.log('MISSING', id); return; }
  const ext = path.extname(f);
  fs.copyFileSync(path.join(media, f), path.join(out, 'u2-' + M[id] + ext));
});
fs.writeFileSync(path.join(__dirname, 'imgmap.json'), JSON.stringify(Object.fromEntries(Object.keys(M).map(id => { const f = fs.readdirSync(media).find(n => new RegExp('^image' + id + '\\.').test(n)); return [M[id], 'u2-' + M[id] + path.extname(f)]; }))));
console.log('copied', Object.keys(M).length);
