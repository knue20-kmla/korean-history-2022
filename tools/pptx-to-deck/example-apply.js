// inserts the generated slides / popups / css into the deck and wires the left sidebar to them
const fs = require('fs');
const f = 'E:/OneDrive/OneDrive - 민족사관고등학교/kmla-korean history study/lesson17_v2.html';
let s = fs.readFileSync(f, 'utf8');
if (s.includes('data-sid="s8"')) throw new Error('already applied');
const slides = fs.readFileSync(__dirname + '/new_slides.html', 'utf8');
const popups = fs.readFileSync(__dirname + '/new_popups.js', 'utf8');
const r = (a, b) => { if (s.split(a).length !== 2) throw new Error('anchor not unique/missing: ' + a.slice(0, 70)); s = s.replace(a, () => b); };

// 1) slides after the last existing one (right before </main>)
r('\n</main>', '\n' + slides + '\n</main>');

// 2) popups
r("  potsdam: { title: '포츠담 회담 (1945. 7.)', html: IMG('assets/tb-potsdam.png','포츠담 회담') + `<p class=\"modal-caption\">카이로 선언의 이행을 강조, 한국의 독립 재확인.</p>` }\n};",
  "  potsdam: { title: '포츠담 회담 (1945. 7.)', html: IMG('assets/tb-potsdam.png','포츠담 회담') + `<p class=\"modal-caption\">카이로 선언의 이행을 강조, 한국의 독립 재확인.</p>` },\n  // ---- 2-1 냉전 체제와 대한민국 정부 수립 ----\n" + popups + "\n};");

// 3) css
r('/* header: full-width bar fixed at the very top; the sidebar starts below it */',
`/* 2-1 냉전 체제와 대한민국 정부 수립 pages */
.dg-n.r{border-color:rgba(255,143,122,.7);background:linear-gradient(145deg,rgba(255,143,122,.26),rgba(255,143,122,.08))}
.dg-n.r.strong{background:linear-gradient(145deg,rgba(255,143,122,.46),rgba(255,143,122,.16));border-color:#ff8f7a;box-shadow:0 8px 22px rgba(3,11,23,.35)}
.dg-n.b.strong{background:linear-gradient(145deg,rgba(127,178,255,.46),rgba(127,178,255,.16));border-color:#7fb2ff;box-shadow:0 8px 22px rgba(3,11,23,.35)}
.dg-n.t.strong{background:linear-gradient(145deg,rgba(115,184,174,.46),rgba(115,184,174,.16));border-color:#73b8ae}
.dg-group.b{border-color:rgba(127,178,255,.6);background:rgba(127,178,255,.06)}
.dg-group.r{border-color:rgba(255,143,122,.6);background:rgba(255,143,122,.06)}
.dg-group.t{border-color:rgba(115,184,174,.6);background:rgba(115,184,174,.06)}
.dg-p.b{border-color:rgba(127,178,255,.75);color:#bcd6ff}
.dg-sep{color:var(--dim);font-weight:400}
.dg-n{word-break:keep-all}
.cat-body .desc em,.point p em{font-style:normal;font-weight:800;color:#f3ddad}
.point.soon{opacity:.45}

/* header: full-width bar fixed at the very top; the sidebar starts below it */`);

// 4) sidebar: the unit pages / which pages belong to each topic
r("const BUILT_SIDS={'한국사2|I|5':['s1','s3','s5']}; // 주제17→17-1, 주제18→18-1, 주제19→19-1 (각 소단원의 첫 페이지로 이동)",
  "// 만들어 둔 단원 : title = 단원 첫 장, topics = 주제별 페이지들 (주제를 누르면 그 첫 페이지로 이동, 해당 페이지들을 보는 동안 그 주제가 강조됨)\n" +
  "const BUILT_UNITS={\n" +
  "  '한국사2|I|5':{title:'s0',topics:[['s1','s2'],['s3','s4'],['s5','s5b','s6','s7']]},\n" +
  "  '한국사2|II|1':{title:'s8',topics:[['s9','s10','s11','s12','s13','s14','s15','s16','s17']]}\n" +
  "};");
r("[4,'사회·문화의 변화와 대중운동',48,['도시와 농촌이 변화하다','다양한 사회 운동이 일어나다','민족문화 수호운동을 전개하다','대중문화가 유행하고 문예 활동을 전개하다']],\n      [5,'독립 국가 건설 노력',62,['만주에서 항일 연합 전선을 만들어 투쟁하다','중국 관내에서 독립운동을 전개하다','건국을 준비하다'],'BUILT']",
  "[4,'사회·문화의 변화와 대중운동',48,['도시와 농촌이 변화하다','다양한 사회 운동이 일어나다','민족문화 수호운동을 전개하다','대중문화가 유행하고 문예 활동을 전개하다']],\n      [5,'독립 국가 건설 노력',62,['만주에서 항일 연합 전선을 만들어 투쟁하다','중국 관내에서 독립운동을 전개하다','건국을 준비하다'],'BUILT']");
r("[1,'냉전 체제와 대한민국 정부 수립',76,['8·15 광복과 냉전의 시대를 맞이하다','통일 정부를 수립하려고 노력하다','대한민국 정부를 수립하다','친일파 청산과 농지 개혁을 추진하다']]",
  "[1,'냉전 체제와 대한민국 정부 수립',76,['8·15 광복과 냉전의 시대를 맞이하다','통일 정부를 수립하려고 노력하다','대한민국 정부를 수립하다','친일파 청산과 농지 개혁을 추진하다'],'BUILT']");

// renderNav: topic idx / highlight from BUILT_UNITS, unit title row clickable
r("      const sids=built?BUILT_SIDS[ukey]:null;\n      const topicsHtml=topics.map((t,ti)=>{\n        topicNo++;\n        const sid=sids&&sids[ti];\n        const idx=sid!=null?navSidIndex(sid):-1;\n        const cur=idx>=0&&idx===currentIndex;\n        return `<button type=\"button\" class=\"nav-topic${cur?' current':''}\"${idx>=0?` data-idx=\"${idx}\"`:''}>주제${String(topicNo).padStart(2,'0')} ${t}</button>`;\n      }).join('');",
  "      const bu=built?BUILT_UNITS[ukey]:null;\n      const topicsHtml=topics.map((t,ti)=>{\n        topicNo++;\n        const pages=bu&&bu.topics[ti]||null;\n        const idx=pages?navSidIndex(pages[0]):-1;\n        const cur=!!pages&&pages.some(sid=>navSidIndex(sid)===currentIndex);\n        return `<button type=\"button\" class=\"nav-topic${idx>=0?' live':''}${cur?' current':''}\"${idx>=0?` data-idx=\"${idx}\"`:''}>주제${String(topicNo).padStart(2,'0')} ${t}</button>`;\n      }).join('');");
r("return `<div class=\"nav-unit${built?' built':''}${uopen?' open':''}\" data-ukey=\"${ukey}\"><button type=\"button\" class=\"nav-unit-head\"><b>${no}</b>",
  "const onUnit=!!bu&&[bu.title].concat(...bu.topics).some(sid=>navSidIndex(sid)===currentIndex);\n      return `<div class=\"nav-unit${built?' built':''}${uopen?' open':''}${onUnit?' here':''}\" data-ukey=\"${ukey}\"><button type=\"button\" class=\"nav-unit-head\"><b>${no}</b>");
// topics only look clickable when they really link somewhere
r(".nav-unit.built .nav-topic{color:#ccd6e3;cursor:pointer}\n.nav-unit.built .nav-topic:hover{background:rgba(216,173,98,.14);color:#fff}",
  ".nav-topic.live{color:#ccd6e3;cursor:pointer}\n.nav-topic.live:hover{background:rgba(216,173,98,.14);color:#fff}\n.nav-unit.here .nav-unit-head{background:rgba(216,173,98,.12)}");
// unit head click while it is closed also jumps to the unit title page? keep: only toggles. But open the unit that holds the current page automatically
r("function renderNav(){",
  "function navRevealCurrent(){\n  Object.keys(BUILT_UNITS).forEach(ukey=>{\n    const bu=BUILT_UNITS[ukey];\n    if([bu.title].concat(...bu.topics).some(sid=>navSidIndex(sid)===currentIndex)){\n      const [book,roman]=ukey.split('|');\n      navBook=book; navOpenRomans.add(book+'|'+roman); navOpenUnits.add(ukey);\n    }\n  });\n}\nfunction renderNav(){\n  navRevealCurrent();");

fs.writeFileSync(f, s);
console.log('applied');
