const fs = require('fs');
const f = 'E:/OneDrive/OneDrive - 민족사관고등학교/kmla-korean history study/lesson17_v2.html';
let s = fs.readFileSync(f, 'utf8');
if (s.includes('data-sid="s31"')) throw new Error('already applied');
const slides = fs.readFileSync(__dirname + '/new_slides5.html', 'utf8');
const popups = fs.readFileSync(__dirname + '/new_popups5.js', 'utf8');
const r = (a, b) => { if (s.split(a).length !== 2) throw new Error('anchor not unique/missing: ' + a.slice(0, 70)); s = s.replace(a, () => b); };
r('\n</main>', '\n' + slides + '\n</main>');
// popups: before the end of the popups object
const k = s.indexOf('const popups = {');
const end = s.indexOf('\n};', k);
if (k < 0 || end < 0) throw new Error('popups object');
s = s.slice(0, end) + '\n  // ---- 2-2 · 주제05~07 ----\n' + popups + s.slice(end);
// sidebar
r(`'한국사2|II|1':{title:'s8',`, `'한국사2|II|2':{title:'s31',topics:[['s32','s33','s34','s35','s36','s37','s38','s39','s40','s41'],['s42','s43','s44','s45','s46','s47','s48'],['s49','s50']]},\n  '한국사2|II|1':{title:'s8',`);
r(`'전후 복구 사업을 전개하다']],`, `'전후 복구 사업을 전개하다'],'BUILT'],`);
// video popups the teacher can re-address
r(`'z2-v-landreform':'KHgaB_dFlAg'};`, `'z2-v-landreform':'KHgaB_dFlAg','u2-v-rhee-exile':'hssWxSCNBAg','u2-v-jangjin':'fEcSj0ARIAY','u2-v-bodo':'StrVNpwsia4','u2-v-geochang':'ABKXh5OzGP4','u2-v-cho':'rpxYcnjNECI'};`);
r(`'z2-v-yeosu2','z2-v-banmin']);`, `'z2-v-yeosu2','z2-v-banmin','u2-v-war5','u2-v-pow','u2-v-nds','u2-v-busan','u2-v-kimil']);`);
fs.writeFileSync(f, s);
console.log('applied');
