// copies the PPT pictures of 2-3 (주제08~12) into assets (prefix d3-)
const fs = require('fs'), path = require('path');
const media = path.join(__dirname, 'x', 'ppt', 'media');
const out = 'E:/OneDrive/OneDrive - 민족사관고등학교/kmla-korean history study/assets';
const M = {
  7: 'fraud-cases', 9: 'choi-order', 10: 'ballot-burn', 12: 'masan-students', 13: 'masan-flowers', 14: 'kimjuyeol',
  17: 'april19-statement', 18: 'prof-march', 19: 'prof-declare', 20: 'revolution-flow', 21: 'election-1960', 22: 'yun-jang',
  23: 'jang-policy', 24: 'unification', 25: 'teachers-union', 26: 'crutch-assembly', 28: 'pledge-516', 31: 'gangster',
  32: 'hanil-protest', 33: 'funeral-text', 34: 'funeral-scan', 36: 'funeral-photo', 37: 'hanil-issue', 39: 'brown-memo',
  40: 'vietnam-pieta', 41: 'vietnam-war', 42: 'protest-3seon', 43: 'donbaengnim', 46: 'statement-74', 47: 'yushin-leaflet',
  48: 'yushin-promulgation', 49: 'yushin-vote', 50: 'yushin-em9', 52: 'jang-junha', 53: 'inhyeokdang', 58: 'em9-chart',
  59: 'hair-police', 60: 'declare-31', 62: 'seats-1978', 63: 'yh-sitin', 66: 'seoul-station', 69: 'cbs-report',
  70: 'helicopter', 71: 'martial-demand', 72: 'community', 73: 'gwangju-appeal', 74: 'sources-518', 75: 'bereaved',
  76: 'witnesses', 81: 'diary', 82: 'usc-fire', 83: 'samcheong', 84: 'press-memo', 89: 'declare-610', 90: 'lee-fall',
  91: 'declare-629', 92: 'timeline-87', 93: 'parkjc-news', 94: 'parkjc-silent', 95: 'buchon-guideline', 96: 'rally-610',
  97: 'usc-seoul', 98: 'news-413', 99: 'lee-carried', 100: 'flag-man'
};
const map = {};
Object.keys(M).forEach(id => {
  const f = fs.readdirSync(media).find(n => new RegExp('^image' + id + '\\.').test(n));
  if (!f) { console.log('MISSING', id); return; }
  const name = 'd3-' + M[id] + path.extname(f);
  fs.copyFileSync(path.join(media, f), path.join(out, name));
  map[M[id]] = name;
});
fs.writeFileSync(path.join(__dirname, 'imgmap.json'), JSON.stringify(map));
console.log('copied', Object.keys(map).length);
