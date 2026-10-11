const fs = require('fs');
const f = 'E:/OneDrive/OneDrive - 민족사관고등학교/kmla-korean history study/lesson17_v2.html';
let s = fs.readFileSync(f, 'utf8');
if (s.includes('data-sid="s52"')) throw new Error('already applied');
const slides = fs.readFileSync(__dirname + '/new_slides6.html', 'utf8');
const popups = fs.readFileSync(__dirname + '/new_popups6.js', 'utf8');
const VID = JSON.parse(fs.readFileSync(__dirname + '/vid6.json', 'utf8'));
const r = (a, b) => { if (s.split(a).length !== 2) throw new Error('anchor not unique/missing: ' + a.slice(0, 70)); s = s.replace(a, () => b); };
r('\n</main>', '\n' + slides + '\n</main>');
const k = s.indexOf('const popups = {');
const end = s.indexOf('\n};', k);
if (k < 0 || end < 0) throw new Error('popups object');
s = s.slice(0, end) + '\n  // ---- 2-3 · 주제08~12 ----\n' + popups + s.slice(end);
// sidebar
r(`'한국사2|II|2':{title:'s31',`, `'한국사2|II|3':{title:'s52',topics:[['s53','s54','s55','s56','s57','s58'],['s59','s60','s61','s62','s63'],['s64','s65','s66','s67','s68'],['s69','s70','s71','s72','s73'],['s74','s75','s76']]},\n  '한국사2|II|2':{title:'s31',`);
r(`'6월 민주 항쟁이 일어나다']],`, `'6월 민주 항쟁이 일어나다'],'BUILT'],`);
// video popups the teacher can re-address
const have = VID.filter(v => v[2]).map(v => `'${v[0]}':'${v[2]}'`).join(',');
r(`'u2-v-cho':'rpxYcnjNECI'};`, `'u2-v-cho':'rpxYcnjNECI',${have}};`);
r(`'u2-v-busan','u2-v-kimil']);`, `'u2-v-busan','u2-v-kimil',${VID.filter(v => !v[2]).map(v => `'${v[0]}'`).join(',')}]);`);
fs.writeFileSync(f, s);
console.log('applied');
