// builds the 2-2 (6·25 전쟁과 남북 분단의 고착화) pages s31..s50 and their popups
const fs = require('fs');
const IMG = JSON.parse(fs.readFileSync(__dirname + '/imgmap.json', 'utf8'));
const COL = { g: '#d8ad62', t: '#73b8ae', n: '#a9b4c1', r: '#ff8f7a', b: '#7fb2ff', v: '#be96ff' };

// ---------- diagram helpers ----------
function dg(id, w, h, items, style) {
  const used = new Set(), lines = [], dom = [];
  items.forEach(it => {
    if (it.k === 'l' || it.k === 'path') used.add(it.c);
    if (it.k === 'l') lines.push(`<line x1="${it.x1}" y1="${it.y1}" x2="${it.x2}" y2="${it.y2}" stroke="${COL[it.c]}" stroke-width="2.6"${it.dash ? ' stroke-dasharray="7 6"' : ''}${it.nohead ? '' : ` marker-end="url(#${id}-${it.c})"`}/>`);
    else if (it.k === 'path') lines.push(`<path d="${it.d}" fill="none" stroke="${COL[it.c]}" stroke-width="2.6" stroke-linejoin="round"${it.nohead ? '' : ` marker-end="url(#${id}-${it.c})"`}/>`);
    else if (it.k === 'n') dom.push(`<div class="dg-n ${it.c || 'n'}" style="left:${it.x}px;top:${it.y}px;width:${it.w}px;height:${it.h}px">${it.t}</div>`);
    else if (it.k === 'tx') dom.push(`<div class="dg-tx" style="left:${it.x}px;top:${it.y}px;width:${it.w}px">${it.t}</div>`);
    else if (it.k === 'note') dom.push(`<div class="dg-note" style="left:${it.x}px;top:${it.y}px;width:${it.w}px">${it.t}</div>`);
  });
  const defs = [...used].map(c => `<marker id="${id}-${c}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${COL[c]}"/></marker>`).join('');
  return `<div class="dg" style="width:${w}px;height:${h}px;${style || ''}"><svg class="dg-lines" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true"><defs>${defs}</defs>${lines.join('')}</svg>${dom.join('')}</div>`;
}
const lnk = (key, t) => `<span class="lnk" data-popup="${key}">${t}</span>`;
const links = arr => arr.map(([k, t]) => lnk(k, t)).join('<span class="dg-sep"> · </span>');
const head = (sid, title, eyebrow, heading, tagNo, tagTxt, lead) => `<section class="slide" hidden data-sid="${sid}" data-title="${title}">
  <div class="stage">
    <p class="eyebrow">${eyebrow}</p>
    <h2 class="heading">${heading}</h2>
    <div class="section-tag"><b>${tagNo}</b> ${tagTxt}</div>${lead ? `\n    <p class="lead">${lead}</p>` : ''}`;
const fig = (key, imgKey, alt, cap) => `<div class="fig sm" role="button" tabindex="0" data-popup="${key}"><img src="assets/${IMG[imgKey]}" alt="${alt}"><figcaption><b>${cap}</b></figcaption></div>`;
const tail = `
  </div>
</section>
`;

// estimated number of text lines of a ▸ line (font 15.5px)
function nlines(t, w) {
  const s = t.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ');
  let len = 0;
  for (const ch of s) len += /[가-힣ㄱ-ㅎ·→←⇒]/.test(ch) ? 15.4 : /\s/.test(ch) ? 5 : /[A-Za-z0-9]/.test(ch) ? 8.8 : 7.2;
  return Math.max(1, Math.ceil(len / (w - 30)));
}

// left buttons + right ▸ text lines, with the connecting lines; returns {items,H}
function layout(blocks, W, opt) {
  opt = opt || {};
  const bx = 0, bw = opt.bw || 300, tx = opt.tx || 340, tw = W - tx, items = [], rects = [];
  let y = 0;
  blocks.forEach(b => {
    const bh = b.h || 44, texts = b.texts || [];
    const ns = texts.map(t => nlines(t, tw)), hs = ns.map(n => n * 24);
    const gap = b.tgap || 12, tot = hs.reduce((a, v) => a + v, 0) + gap * Math.max(0, texts.length - 1);
    const bl = Math.max(bh, tot), by = Math.round(y + (bl - bh) / 2);
    let ty = Math.round(y + (bl - tot) / 2);
    const cy = by + bh / 2, lc = b.lc || (b.c || 'n').split(' ')[0];
    items.push({ k: 'n', c: (b.c || 'n') + (b.strong ? ' strong' : ''), x: bx, y: by, w: bw, h: bh, t: b.btn });
    const cys = [];
    texts.forEach((t, i) => { items.push({ k: 'tx', x: tx, y: ty, w: tw, t }); cys.push(ty + hs[i] / 2); ty += hs[i] + gap; });
    if (texts.length === 1) {
      const c1 = cys[0];
      if (Math.abs(c1 - cy) < 2) items.push({ k: 'l', x1: bx + bw, y1: cy, x2: tx - 4, y2: cy, c: lc });
      else items.push({ k: 'path', d: `M${bx + bw},${cy} H${bx + bw + 20} V${c1} H${tx - 4}`, c: lc });
    } else if (texts.length > 1) {
      const xv = bx + bw + 20, top = Math.min(cy, cys[0]), bot = Math.max(cy, cys[cys.length - 1]);
      items.push({ k: 'path', d: `M${xv},${top} V${bot}`, c: lc, nohead: true });
      items.push({ k: 'l', x1: bx + bw, y1: cy, x2: xv, y2: cy, c: lc, nohead: true });
      cys.forEach(c => items.push({ k: 'l', x1: xv, y1: c, x2: tx - 4, y2: c, c: lc, nohead: true }));
    }
    rects.push({ by, bh, ac: b.ac || lc });
    y += bl + (b.after == null ? 40 : b.after);
  });
  for (let i = 1; i < rects.length; i++) {
    const a = rects[i - 1], b = rects[i];
    items.push({ k: 'l', x1: bx + bw / 2, y1: a.by + a.bh, x2: bx + bw / 2, y2: b.by, c: b.ac });
  }
  return { items, H: y - (blocks.length ? (blocks[blocks.length - 1].after == null ? 40 : blocks[blocks.length - 1].after) : 0) };
}

const slides = [], pops = [];
const P = (key, title, imgKey, cap) => pops.push([key, title, IMG[imgKey], cap]);
const gpops = [];
const GP = (key, title, items) => gpops.push([key, title, items.map(([k, c]) => [IMG[k], c])]);
const H8 = ['08', '4·19 혁명이 일어나다'], H9 = ['09', '군사 정변으로 새로운 정부가 수립되다'], H10 = ['10', '유신 체제가 성립하다'], H11 = ['11', '5·18 민주화 운동이 일어나다'], H12 = ['12', '6월 민주 항쟁이 일어나다'];
const aside = figs => `\n      <aside class="aside">\n        ${figs.join('\n        ')}\n      </aside>`;
// page = header + diagram (+ optional aside)
function page(sid, id, eyebrowHead, tagNo, tagTxt, title, lead, blocks, o) {
  o = o || {};
  const W = o.W || (o.figs ? 880 : 1140);
  const L = layout(blocks, W, o);
  let items = L.items, H = L.H;
  let ny = H + 34;
  (o.notes || []).forEach(n => { items.push({ k: 'note', x: 0, y: ny, w: W, t: n }); ny += nlines(n, W + 70) * 22 + 10; });
  H = (o.notes && o.notes.length) ? ny : H;
  const d = dg(id, W, Math.ceil(H), items, o.figs ? 'margin-left:0' : '');
  const body = o.figs ? `\n    <div class="split"><div>${d}</div>${aside(o.figs)}</div>` : `\n    ${d}`;
  slides.push(head(sid, title, ...eyebrowHead, tagNo, tagTxt, lead) + body + tail);
}

// galleries: item i of gallery g also gets the key g-i (a figure or a keyword can open the gallery at that photo)
const G = (key, title, items) => { GP(key, title, items); };
const F = (key, imgKey, alt, cap) => fig(key, imgKey, alt, cap);

// ================= unit page =================
slides.push(`<section class="slide unit" hidden data-sid="s52" data-title="2-3 민주화를 위한 노력">
  <div class="stage">
    <p class="eyebrow">2-3</p>
    <h2 class="heading">민주화를 위한 노력</h2>
    <p class="lead">이승만 독재를 무너뜨린 <em>4·19 혁명</em> 이후 군사 정변과 <em>유신 체제</em>로 민주주의가 후퇴했으나, <em>5·18 민주화 운동</em>과 <em>6월 민주 항쟁</em>을 거쳐 민주화를 이룩.</p>
    <ol class="points">
      <li class="point"><span class="num">08</span><div><h3>4·19 혁명이 일어나다</h3><p>3·15 부정 선거와 4·19 혁명, 장면 정부의 출범과 한계</p></div></li>
      <li class="point"><span class="num">09</span><div><h3>군사 정변으로 새로운 정부가 수립되다</h3><p>5·16 군사 정변, 한일 국교 정상화, 베트남 파병, 3선 개헌</p></div></li>
      <li class="point"><span class="num">10</span><div><h3>유신 체제가 성립하다</h3><p>국제 정세와 남북 관계의 변화, 유신 체제의 성립, 유신 반대 운동의 확산, 부마 민주 항쟁과 유신 체제의 붕괴</p></div></li>
      <li class="point"><span class="num">11</span><div><h3>5·18 민주화 운동이 일어나다</h3><p>신군부의 권력 장악과 서울의 봄, 5·18 광주 민주화 운동, 전두환 정부의 출범과 강압 정치</p></div></li>
      <li class="point"><span class="num">12</span><div><h3>6월 민주 항쟁이 일어나다</h3><p>직선제 개헌 요구, 6월 민주 항쟁, 6·29 선언</p></div></li>
    </ol>
  </div>
</section>
`);

// ================= 08 =================
page('s53', 'f53', H8, 1, '3·15 부정 선거와 4·19 혁명', '08-1 3·15 부정 선거와 4·19 혁명 ① 3·15 부정 선거',
  '이승만 정부의 부정 부패와 경제 악화 속에서 자유당이 <em>3·15 부정 선거</em>를 준비하여 4·19 혁명의 도화선이 됨.',
  [
    { c: 'b', btn: '제4대 정부통령 선거(1960. 3. 15.)', texts: [
      '이승만 정부의 부정 부패와 미국의 원조 감소에 따른 <em>경제 상황 악화</em>',
      '<em>대통령 선거</em> : 이승만(자유당) – 조병옥(민주당) → 조병옥 사망으로 이승만 당선 확정',
      '<em>부통령 선거</em> : 이기붕(자유당) – 장면(민주당) → 자유당 총력 → ' + lnk('d3-g-fraud-0', '부정 선거 준비'),
      '헌법 “대통령 유고 시 부통령 승계” 조항'] },
    { c: 'r', btn: '2·28 대구 학생 의거(1960. 2. 28.)', texts: [] },
    { c: 'r', strong: true, btn: '3·15 부정 선거 지령 폭로', texts: [
      lnk('d3-g-fraud-1', '이승만 정부의 부정 선거 준비') + '(내무부 장관의 지시, 1959. 11.)',
      lnk('d3-g-fraud-2', '투표용지를 불태우는 공무원')] },
  ], { figs: [F('d3-g-fraud-0', 'fraud-cases', '3·15 부정 선거 사례', '3·15 부정 선거 사례'), F('d3-g-fraud-2', 'ballot-burn', '투표용지를 불태우는 공무원', '투표용지를 불태우는 공무원')],
    notes: ['영상 : ' + lnk('d3-v-315', '3.15 부정선거')] });
G('d3-g-fraud', '3·15 부정 선거', [['fraud-cases', '3·15 부정 선거 사례(4할 사전 투표 · 3인조 또는 5인조 공개 투표 · 야당 참관인 축출)'], ['choi-order', '이승만 정부의 부정 선거 준비 — 내무부 장관 최인규의 지시 사항(1959. 11.)'], ['ballot-burn', '투표용지를 불태우는 공무원']]);

page('s54', 'f54', H8, 1, '3·15 부정 선거와 4·19 혁명', '08-1 3·15 부정 선거와 4·19 혁명 ② 마산 의거',
  '부정 선거에 항의하는 <em>3·15 마산 의거</em>에서 희생자가 발생하고, 김주열 학생의 시신이 발견되면서 시위가 전국으로 확산.',
  [
    { c: 'r', btn: '3·15 마산 의거(1960. 3. 15.)', texts: [
      '<em>부정 선거 규탄</em> → 시위대에 발포 → <em>희생자 발생</em>'] },
    { c: 'r', strong: true, btn: '김주열 학생 시신 발견(4. 11.)', texts: [
      lnk('d3-g-masan-2', '김주열 학생의 시신') + ' → <em>시위 확산</em>',
      lnk('d3-g-masan-1', '김주열에게 헌화하는 것을 거부당한 고등학생들') + '의 시위'] },
    { c: 'g', btn: '마산 시위(4. 12.)', texts: [lnk('d3-g-masan-0', '부정 선거에 항의하는 마산 학생들') + ' → <em>시위 확산</em>'] },
  ], { figs: [F('d3-g-masan-0', 'masan-students', '부정 선거에 항의하는 마산 학생들', '부정 선거에 항의하는 마산 학생들(1960. 4. 12.)'), F('d3-g-masan-2', 'kimjuyeol', '김주열 학생의 시신', '김주열 학생의 시신')],
    notes: ['영상 : ' + lnk('d3-v-masan', '3월 15일 의거')] });
G('d3-g-masan', '3·15 마산 의거와 시위 확산', [['masan-students', '부정 선거에 항의하는 마산 학생들(1960. 4. 12.)'], ['masan-flowers', '김주열에게 헌화하는 것을 거부당한 고등학생들의 시위'], ['kimjuyeol', '김주열 학생의 시신']]);

page('s55', 'f55', H8, 1, '3·15 부정 선거와 4·19 혁명', '08-1 3·15 부정 선거와 4·19 혁명 ③ 4·19 혁명의 전개',
  '4·18 고대생 의거로 시작된 시위가 4·19에 전국으로 확산되고, 대학 교수단의 시위를 거쳐 <em>이승만이 하야(1960. 4. 26.)</em>.',
  [
    { c: 'b', btn: '4·18 고대생 의거(1960. 4. 18.)', texts: ['시위대 습격 사건 발생(by 정치 깡패)', '<em>시위 전국 확산</em>'] },
    { c: 'r', strong: true, btn: '4·19 시위(1960. 4. 19.)', texts: [
      '경찰의 무차별 발포와 계엄령 선포 → <em>‘피의 일요일’</em>',
      lnk('d3-april19', '4·19 시위에 참여한 학생들의 선언문과 시위 모습')] },
    { c: 'g', btn: '대학 교수단 시위(1960. 4. 25.)', texts: [lnk('d3-g-prof-1', '시국 선언문') + ' 발표 → ' + lnk('d3-g-prof-0', '대학 교수단의 시위')] },
    { c: 'g', strong: true, btn: '이승만 하야 발표(1960. 4. 26.)', texts: [] },
    { c: 't', btn: '4·19 혁명의 의의', texts: ['<em>학생과 시민 중심의 반독재 민주주의 혁명</em>, 우리나라 민주주의 발전의 중요한 토대가 됨(' + lnk('d3-flow', '전개 과정과 의의') + ')'] },
  ], { figs: [F('d3-april19', 'april19-statement', '4·19 시위', '4·19 시위에 참여한 학생들의 선언문'), F('d3-g-prof-0', 'prof-march', '대학 교수단의 시위', '대학 교수단의 시위(1960. 4. 25.)')],
    notes: ['영상 : ' + lnk('d3-v-418', '4.18 고대생 습격사건')] });
G('d3-g-prof', '대학 교수단의 시위와 시국 선언', [['prof-march', '대학 교수단의 시위(1960. 4. 25.)'], ['prof-declare', '대학 교수단 시국 선언문(1960)']]);
P('d3-april19', '4·19 시위 — 서울 문리대 학생들의 선언문과 시위 모습(1960. 4. 19.)', 'april19-statement', '');
P('d3-flow', '4·19 혁명의 전개 과정과 의의', 'revolution-flow', '');

page('s56', 'f56', H8, 2, '장면 정부의 출범', '08-2 장면 정부의 출범',
  '4·19 혁명 후 허정 과도 내각이 헌법을 개정하여 <em>내각 책임제와 양원제</em>를 채택하고, 총선거에서 압승한 민주당의 <em>장면 내각</em>이 출범.',
  [
    { c: 'g', btn: '4·19 혁명', texts: [
      '<em>허정 과도 내각</em> 수립 → 3·15 부정 선거 무효화',
      '<em>개헌 실시</em> : 내각 책임제와 양원제 국회(민의원 + 참의원)',
      '언론, 출판, 집회, 결사의 사전 허가제와 검열제 폐지'] },
    { c: 'b', btn: '양원 동시 총선거 실시', texts: [
      '<em>민주당 압승</em>(' + lnk('d3-g-election-0', '1960년 총선 결과') + ') : <em>윤보선 대통령</em> 선출'] },
    { c: 'b', strong: true, btn: '장면 내각(1960. 10. 1.)', texts: [
      '<em>헌법상 국무총리가 실권</em>',
      '장면 국무총리 지명 → 국회 동의 → 장면 국무총리 취임(' + lnk('d3-g-election-1', '윤보선 대통령과 장면 국무총리') + ')'] },
  ], { figs: [F('d3-g-election-0', 'election-1960', '1960년 총선 결과', '1960년 총선 결과'), F('d3-g-election-1', 'yun-jang', '윤보선 대통령과 장면 국무총리', '윤보선 대통령과 장면 국무총리')] });
G('d3-g-election', '장면 정부의 출범', [['election-1960', '1960년 총선 결과'], ['yun-jang', '윤보선 대통령과 장면 국무총리']]);

page('s57', 'f57', H8, 2, '장면 정부의 출범', '08-2 장면 정부의 정책과 민주화 요구',
  '장면 내각은 <em>혁명 정신 계승</em>의 요구 속에서 경제 제일주의와 지방 자치 제도를 시행했고, 사회적 민주화와 민간 통일 운동이 활발해짐.',
  [
    { c: 'g', btn: '4·19 혁명 정신 계승', texts: ['정치, 사회적 개혁을 통한 혁명 정신 계승 필요성(' + lnk('d3-jang-policy', '장면 내각의 시정 방침') + ')'] },
    { c: 'r', btn: '사회적 민주화', texts: [
      '학도 호국단 폐지와 학원 민주화 운동',
      '교원 노조 결성 운동 → 교육의 정치적 중립 주장(' + lnk('d3-teachers', '대한 교원 노동조합 연합회 결성') + ')',
      '노동자(노동 조건 개선), 농민(농산물 값 유지) 운동'] },
    { c: 'b', btn: '민간 통일 운동', texts: [
      '<em>학생 운동</em> → 남북 학생 회담 제의(' + lnk('d3-unification', '4·19 혁명과 통일 운동의 활성화') + ')',
      '한반도 영세 중립화론, <em>남북 협상론</em> 제기',
      '6·25 전쟁 중 민간인 학살 진상 조사 주장'] },
    { c: 't', btn: '경제 제일주의 표방', texts: [
      '자립 경제 달성 → <em>제1차 경제 개발 5개년 계획</em> 추진',
      '실업난 해소 → 국토 건설 사업 추진'] },
    { c: 'n', btn: '지방 자치 제도 시행', texts: ['면의원 ~ 도지사까지 지방민이 직접 선출'] },
  ], { figs: [F('d3-teachers', 'teachers-union', '대한 교원 노동조합 연합회 결성', '대한 교원 노동조합 연합회 결성(1960. 5. 22.)'), F('d3-unification', 'unification', '4·19 혁명과 통일 운동의 활성화', '남북 학생 회담 개최 요구를 지지하는 집회(1961)')] });
P('d3-jang-policy', '장면 내각의 시정 방침(1960. 8.)', 'jang-policy', '');
P('d3-teachers', '대한 교원 노동조합 연합회 결성(1960. 5. 22.)', 'teachers-union', '');
P('d3-unification', '4·19 혁명과 통일 운동의 활성화', 'unification', '');

page('s58', 'f58', H8, 2, '장면 정부의 출범', '08-2 장면 정부의 한계',
  '장면 정부는 민주화 요구를 제대로 수용하지 못하고 민주당의 분열 속에서 한계를 드러냄.',
  [
    { c: 'r', btn: '한계', texts: [
      '국민들의 민주화 요구 수용 ×, <em>민주당 신구파의 갈등</em>',
      '<em>부정 선거 및 부정 축재자 처벌</em>에 소극적 대처(' + lnk('d3-crutch', '국회 의장 단상을 점령한 4·19 부상자들') + ')'] },
    { c: 'r', strong: true, btn: '국민들의 반발', texts: [
      '<em>반공 임시 특별법과 데모 규제법</em> 제정 시도',
      '민주화 요구 시위나 사회운동 탄압'] },
  ], { figs: [F('d3-crutch', 'crutch-assembly', '국회 의장 단상을 점령한 4·19 부상자들', '국회 의장 단상을 점령한 4·19 부상자들(1960. 10.)')] });
P('d3-crutch', '국회 의장 단상을 점령한 4·19 부상자들(1960. 10.)', 'crutch-assembly', '이들은 부정 선거 및 부정 축재자 처벌에 소극적인 정부에 항의하였다.');

// ================= 09 =================
page('s59', 'f59', H9, 1, '5·16 군사 정변', '09-1 5·16 군사 정변',
  '군부의 불만이 커진 가운데 박정희와 육사 8기 중심의 군인들이 <em>5·16 군사 정변(1961)</em>을 일으켜 군정을 실시.',
  [
    { c: 'n', btn: '장면 정부', texts: ['민간 차원의 통일 운동', '군비 축소 계획(← 경제 제일주의)'] },
    { c: 'g', btn: '군부의 불만 증가', texts: [] },
    { c: 'r', strong: true, btn: '5·16 군사 정변(1961. 5. 16.)', texts: [
      '<em>박정희와 육사 8기</em> 중심 : 장면 정부의 무능과 사회 혼란 구실',
      '<em>군사 혁명 위원회</em> 구성 : ' + lnk('d3-pledge', '혁명 공약') + ' 발표 → 계엄 선포 → 민정 이양 약속',
      '<em>국가 재건 최고 회의</em> 구성 : 군사 정부 설치(군정 실시)'] },
  ], { figs: [F('d3-pledge', 'pledge-516', '5·16 혁명 공약', '5·16 군사 정변 주도 세력이 내세운 ‘혁명 공약’(1961)')],
    notes: ['영상 : ' + lnk('d3-v-516', '대한뉴스 제 314호-5.16')] });
P('d3-pledge', '5·16 군사 정변 주도 세력이 내세운 ‘혁명 공약’(1961)', 'pledge-516', '');

page('s60', 'f60', H9, 1, '5·16 군사 정변', '09-1 군사 정부와 제3공화국의 출범',
  '군사 정부는 반공 체제를 강화하고 안정을 도모하며 <em>민정 이양</em>을 약속했으나, 박정희가 대통령에 당선되어 <em>제3공화국</em>이 탄생.',
  [
    { c: 'r', btn: '정치 안정', texts: [
      '<em>모든 정당 사회단체 해산</em> → 정치 활동 금지(← 정치 활동 정화법)',
      '<em>국가 비상 조치법</em> 공포 : 국가 재건 최고 회의의 최고 통치 기관 승인',
      '지방 자치제 중지'] },
    { c: 'b', btn: '사회 안정', texts: [
      '부정 축재자와 폭력배 처벌(← 사회 정화 작업)(' + lnk('d3-gangster', '깡패 단속') + ')',
      '농가 부채 탕감과 농산물 가격 안정화 정책'] },
    { c: 't', btn: '중앙 정보부 조직', texts: [
      '정치인, 국민과 언론 감시 및 통제',
      '비밀리에 <em>민주 공화당 창당</em> → 민정 이양 대비'] },
    { c: 'g', btn: '헌법 개정 및 공포(1962. 12.)', texts: ['<em>대통령제, 단원제 국회</em> 중심'] },
    { c: 'g', strong: true, btn: '박정희 대통령 당선(5대, 1963. 10. 15.)', texts: ['<em>제3공화국</em> 탄생(‘민족적 민주주의’ vs 자유민주주의)'] },
  ], { figs: [F('d3-gangster', 'gangster', '깡패 단속', '‘나는 깡패입니다’ — 사회 정화 작업으로 단속된 폭력배(1961)')] });
P('d3-gangster', '사회 정화 작업 — ‘나는 깡패입니다. 국민의 심판을 받겠읍니다’(1961)', 'gangster', '');

page('s61', 'f61', H9, 2, '한일 국교 정상화', '09-2 한일 국교 정상화',
  '박정희 정부는 미국의 지지와 경제 개발 자금 확보를 위해 <em>한일 국교 정상화</em>를 추진, 굴욕 외교 반대 운동을 억누르고 한일 협정을 체결(1965).',
  [
    { c: 'g', btn: '박정희 정부', texts: [
      '미국의 지지, 경제 개발 자금 필요',
      '미국의 요구 : <em>한-미-일 집단 안보 체제</em> 구축'] },
    { c: 'b', btn: '한일 국교 정상화 회담 추진', h: 56, texts: ['<em>일본의 사과, 반성, 배상 ×</em>'] },
    { c: 'r', btn: '굴욕 외교 반대 운동 확산', texts: [
      '1964년 <em>6·3 시위</em>(' + lnk('d3-g-63-0', '한·일 회담 반대 시위') + ' · ' + lnk('d3-g-63-1', '5·20 민족적 민주주의 장례식') + ')',
      '휴교령과 계엄령 선포',
      '<em>인혁당 사건</em>(1964) 조작'] },
    { c: 'g', strong: true, btn: '한일 협정 체결(1965)', texts: [
      '<em>경제 개발 자금</em> 확보',
      '일본의 침략과 식민 지배에 대한 <em>사과와 배상 미흡</em>(' + lnk('d3-hanil-issue', '한·일 기본 조약을 둘러싼 쟁점') + ')'] },
  ], { figs: [F('d3-g-63-0', 'hanil-protest', '한·일 회담 반대 시위', '한·일 회담 반대 시위(1964. 3. 26.)'), F('d3-g-63-1', 'funeral-photo', '5·20 민족적 민주주의 장례식', '5·20 민족적 민주주의 장례식(1964)')],
    notes: ['영상 : ' + lnk('d3-v-hanil', '부당한 약속, 1965 한일협정')] });
G('d3-g-63', '굴욕 외교 반대 운동', [['hanil-protest', '한·일 회담 반대 시위(1964. 3. 26.)'], ['funeral-photo', '5·20 민족적 민주주의 장례식(1964)'], ['funeral-text', '5·20 민족적 민주주의 장례식 — 선언문(‘시체여!’)'], ['funeral-scan', '5·20 민족적 민주주의 장례식 — 선언문 원문']]);
P('d3-hanil-issue', '한·일 기본 조약을 둘러싼 쟁점 — 한·일 기본 조약과 청구권·경제 협력에 관한 협정', 'hanil-issue', '');

page('s62', 'f62', H9, 3, '베트남 파병(1964~1973)', '09-3 베트남 파병',
  '한일 협정으로 한-미-일 집단 안보 체제가 구축되자 미국의 요청으로 <em>베트남 파병(1964~1973)</em>, 경제적 성과를 얻었으나 한계도 남김.',
  [
    { c: 'g', btn: '한일 협정', texts: ['<em>한-미-일 집단 안보 체제</em> 구축 → 한국군의 베트남 파병 요청'] },
    { c: 'b', btn: '베트남 파병(1964~1973)', texts: [
      '미국의 요청과 주한 미군 축소 우려, <em>자유민주주의 수호</em> 명분',
      '한국군의 현대화와 경제 개발 자금(기술, 차관) 제공 약속(' + lnk('d3-brown', '브라운 각서') + ', 1966)'] },
    { c: 't', btn: '성과', texts: [
      '한국군의 현대화와 기술 및 차관 제공',
      '미국 시장 관세 인하 혜택',
      '베트남 등 해외 건설 사업 참여 혜택'] },
    { c: 'r', btn: '한계', texts: [
      '한국군의 인적 피해(사망, 부상 및 고엽제 피해 등)',
      '베트남 민간인 학살, 라이 따이한 문제 등(' + lnk('d3-g-vietnam-0', '베트남 피에타') + ' · ' + lnk('d3-g-vietnam-1', '베트남 전쟁의 피해') + ')'] },
  ], { figs: [F('d3-g-vietnam-0', 'vietnam-pieta', '베트남 피에타', '베트남 피에타(제주 서귀포)'), F('d3-brown', 'brown-memo', '브라운 각서', '브라운 각서(1966)')] });
G('d3-g-vietnam', '베트남 전쟁의 한계', [['vietnam-pieta', '베트남 피에타(제주 서귀포)'], ['vietnam-war', '베트남 전쟁의 피해']]);
P('d3-brown', '브라운 각서(1966)', 'brown-memo', '');

page('s63', 'f63', H9, 4, '3선 개헌', '09-4 3선 개헌',
  '박정희 정부는 경제 성장과 안보 위기를 명분으로 <em>3선 개헌(1969)</em>을 강행하여 장기 집권의 기반을 마련.',
  [
    { c: 'g', btn: '제6대 대통령 선거(1967)', texts: [
      '<em>박정희 연임(재선) 성공</em>(vs 윤보선) ← 경제 발전 성과',
      '선거법 개정 : 대통령 및 장·차관 등 고위 공무원 선거 운동 가능(1967)',
      '제7대 국회 의원 선거(1967) : <em>개헌선 확보</em>'] },
    { c: 'r', btn: '남북 관계 대립 고조', texts: [
      '북한 특수 부대 청와대 습격(1·21 사건, 1968)',
      '푸에블로호 나포 사건(1968)'] },
    { c: 'b', btn: '국가 안보 강화 · 경제 개발 지속', texts: ['향토 예비군 창설과 국민 교육 헌장 제정'] },
    { c: 'g', strong: true, btn: '3선 개헌 추진(1969)', texts: [
      '<em>대통령 3회 연임 가능</em> : 여당 단독 개헌 통과',
      '야당, 시민, 학생 개헌 반대 투쟁 전개(' + lnk('d3-protest-3seon', '3선 개헌 반대 시위') + ')'] },
    { c: 'n', btn: '장기 집권 기반 마련', texts: ['제7대 대선과 제8대 총선에서 여당 견제'] },
  ], { figs: [F('d3-protest-3seon', 'protest-3seon', '3선 개헌 반대 시위', '3선 개헌 반대 시위(1969)'), F('d3-donbaengnim', 'donbaengnim', '동백림 간첩단 사건', '동백림 간첩단 사건')],
    notes: ['영상 : ' + lnk('d3-v-3seon', '3선 개헌 반대운동')] });
P('d3-protest-3seon', '3선 개헌 반대 시위(1969)', 'protest-3seon', '');
P('d3-donbaengnim', '동백림 간첩단 사건', 'donbaengnim', '');

// ================= 10 =================
page('s64', 'f64', H10, 1, '국제 정세와 남북 관계의 변화', '10-1 국제 정세와 남북 관계의 변화',
  '3선 개헌에 대한 비판과 <em>냉전 체제의 완화</em>로 정권 기반이 약해지자 박정희 정부는 대북 정책을 바꾸어 <em>7·4 남북 공동 성명(1972)</em>을 발표.',
  [
    { c: 'b', btn: '대내적 변화', texts: [
      '3선 개헌과 경제 성장률 하락에 대한 비판 증가 → <em>민주화 요구 분출</em>',
      '<em>제7대 대통령 선거</em>(1971) 100만여 표 차 당선 : 53.2%(박정희) vs 45.2%(김대중)',
      '<em>제8대 국회 의원 선거</em>(1971) : 야당(신민당) 개헌 저지선 확보'] },
    { c: 't', btn: '대외적 변화', texts: [
      '<em>닉슨 독트린</em>(1969) → 미-중 관계 개선 → 냉전 체제 완화',
      '미국의 남북 대화 요구와 주한 미군 감축'] },
    { c: 'r', btn: '반공 중심의 정권 기반 약화', texts: [
      '장기 집권에 대한 불만 억압 / 안보 불안 해소',
      '<em>대북 정책 변화</em>'] },
    { c: 'g', strong: true, btn: '7·4 남북 공동 성명(1972)', texts: ['<em>통일 3대 원칙</em> 합의(자주, 평화, 민족 대단결)(' + lnk('d3-statement-74', '7·4 남북 공동 성명') + ')'] },
  ], { figs: [F('d3-statement-74', 'statement-74', '7·4 남북 공동 성명', '남북의 첫 번째 합의, 7·4 남북 공동 성명')],
    notes: ['영상 : ' + lnk('d3-v-71', '7대 대통령선거 박정희 김대중 연설')] });
P('d3-statement-74', '남북의 첫 번째 합의, 7·4 남북 공동 성명', 'statement-74', '');

page('s65', 'f65', H10, 2, '유신 체제의 성립', '10-2 유신 체제의 성립',
  '7·4 남북 공동 성명 이후 <em>비상 계엄과 국회 해산(1972. 10.)</em>으로 유신 헌법을 만들어 대통령의 영구 집권과 강력한 권한을 보장.',
  [
    { c: 'b', btn: '7·4 남북 공동 성명 발표', texts: [
      '반공 명분 상실, 경기 침체 불만 폭발',
      '<em>남북 통일 위한 사회 질서 안정</em> 명분'] },
    { c: 'r', btn: '비상 계엄 선포와 국회 해산(1972. 10.)', h: 56, texts: ['<em>비상 국무 회의</em> : 헌법 개정안 의결'] },
    { c: 'g', btn: '국민 투표', texts: ['91.9% 투표, 91.5% 찬성(' + lnk('d3-g-yushin-2', '유신 헌법 국민 투표') + ' · ' + lnk('d3-g-yushin-0', '찬반 홍보 용지') + ')'] },
    { c: 'g', strong: true, h: 56, btn: '<span>' + lnk('d3-g-yushin-1', '유신 헌법') + '(10월 유신)</span>', texts: [
      '대통령 임기 6년, 중임 제한 철폐 → <em>영구 집권 가능</em>',
      '<em>간선제 변경</em> : 통일 주체 국민 회의에서 선출',
      '국회 해산권과 국회 의원 1/3 임명권, 대법원장과 법관 임명권 → <em>대통령 권한 강화</em>(행정, 입법, 사법권 장악)',
      '<em>긴급 조치 선포권</em> : 각종 법률 효력 정지 → 국민 기본권 제한(' + lnk('d3-g-yushin-3', '유신 헌법과 긴급 조치 제9호') + ')'] },
  ], { figs: [F('d3-g-yushin-1', 'yushin-promulgation', '유신 헌법 공포식', '유신 헌법 공포식(1972. 12. 27.)'), F('d3-g-yushin-2', 'yushin-vote', '유신 헌법 국민 투표', '유신 헌법 국민 투표(1972. 11.)')],
    notes: ['영상 : ' + lnk('d3-v-yushin', '유신체제의 성립1972')] });
G('d3-g-yushin', '유신 헌법', [['yushin-leaflet', '「유신 헌법」 찬반에 관한 국민 투표 홍보 용지(대한민국역사박물관)'], ['yushin-promulgation', '유신 헌법 공포식(1972. 12. 27.)'], ['yushin-vote', '유신 헌법 국민 투표'], ['yushin-em9', '유신 헌법(1972)과 긴급 조치 제9호(1975)']]);

page('s66', 'f66', H10, 3, '유신 반대 운동의 확산', '10-3 유신 반대 운동의 확산',
  '유신 체제에 맞서 <em>김대중 납치 사건</em> 이후 반대 운동이 본격화되자 정부는 긴급 조치로 탄압하고 인혁당 사건 등을 조작.',
  [
    { c: 'b', btn: '유신 반대 운동 전개', texts: ['<em>김대중 납치 사건</em> 발생(1973. 8.)'] },
    { c: 'g', btn: '유신 반대 투쟁 본격화', texts: [
      '대학 : 사건 해명과 민주화 시위(<em>민청학련</em> 조직)',
      '지식인, 시민 단체 : <em>개헌 청원 100만인 서명 운동</em>(' + lnk('d3-g-anti-0', '장준하의 서명 운동 발표') + ')'] },
    { c: 'r', btn: '긴급 조치 발표(1호, 2호……)', texts: [
      '<em>개헌 논의 금지</em>',
      '민청학련 사건, <em>제2차 인혁당 사건</em> 발표(' + lnk('d3-g-anti-1', '2차 인혁당 사건 재판') + ')'] },
    { c: 'r', strong: true, btn: '긴급 조치 9호(1975~1979) 발표', texts: [] },
  ], { figs: [F('d3-g-anti-0', 'jang-junha', '개헌 청원 100만인 서명 운동', '개헌 청원 100만인 서명 운동을 발표하는 장준하(1973)'), F('d3-g-anti-1', 'inhyeokdang', '2차 인혁당 사건', '2차 인혁당 사건(1975)')],
    notes: ['영상 : ' + links([['d3-v-inhyuk1', '제2차 인혁당은 북괴 앞잡이'], ['d3-v-inhyuk2', '지식채널e 인혁당 사건'], ['d3-v-inhyuk3', '2차 인혁당 사건 무죄'], ['d3-v-kimsj', '김상진 열사 연설(긴급조치9호 원인)']])] });
G('d3-g-anti', '유신 반대 운동', [['jang-junha', '개헌 청원 100만인 서명 운동을 발표하는 장준하(1973)'], ['inhyeokdang', '2차 인혁당 사건(1975)']]);

page('s67', 'f67', H10, 3, '유신 반대 운동의 확산', '10-3 긴급 조치 9호와 민주화 요구',
  '<em>긴급 조치 9호(1975~1979)</em>로 유신 체제에 대한 비판을 금지했으나 종교계, 해직 언론인, 재야 인사의 민주화 요구가 계속.',
  [
    { c: 'r', strong: true, btn: '긴급 조치 9호(1975~1979) 발표', texts: [
      '유언비어를 날조, 유포하거나 사실을 왜곡하여 전파하는 행위 등을 금지(' + lnk('d3-g-em9-0', '긴급 조치 9호의 주요 내용과 위반 유형별 분포') + ')',
      lnk('d3-g-em9-1', '장발 단속 중인 경찰') + ' 등 일상에 대한 통제'] },
    { c: 'b', btn: '민주화 요구 계속', texts: [
      '<em>천주교</em> : 천주교 정의구현 사제단 출범',
      '<em>해직 언론인</em> : 자유 언론 수호 투쟁 전개',
      '함석헌, 김대중 등 : <em>3·1 구국 선언</em>(1976, 명동 성당)(' + lnk('d3-declare-31', '3·1 민주 구국 선언') + ')'] },
  ], { figs: [F('d3-g-em9-0', 'em9-chart', '긴급 조치 9호의 주요 내용', '긴급 조치 9호(1975~1979)의 주요 내용'), F('d3-declare-31', 'declare-31', '3·1 민주 구국 선언', '3·1 민주 구국 선언(1976)')],
    notes: ['영상 : ' + lnk('d3-v-060', '영상한국사 060 유신체제 강화를 위한 탄압이 계속되다')] });
G('d3-g-em9', '긴급 조치 9호', [['em9-chart', '긴급 조치 9호(1975~1979)의 주요 내용과 위반 유형별 분포'], ['hair-police', '장발 단속 중인 경찰']]);
P('d3-declare-31', '3·1 민주 구국 선언(1976)', 'declare-31', '');

page('s68', 'f68', H10, 4, '부마 민주 항쟁과 유신 체제의 붕괴', '10-4 부마 민주 항쟁과 유신 체제의 붕괴',
  '정권 위기가 깊어진 가운데 <em>YH 무역 사건</em>과 <em>부마 항쟁(1979)</em>이 일어나고, 정권 내부의 분열 끝에 <em>10·26 사건</em>으로 유신 체제가 붕괴.',
  [
    { c: 'r', btn: '정권 위기 심화', texts: [
      '<em>제10대 국회 의원 선거</em>(1978) : 야당 신민당 득표율(32.8%) 〉 여당 공화당(31.9%)(' + lnk('d3-seats78', '정당별 의석수') + ')',
      '제2차 석유 파동'] },
    { c: 'b', btn: 'YH 무역 사건(1979)', texts: [
      'YH 무역 여성 노동자 신민당사에서 농성(' + lnk('d3-yh', '농성 중인 YH 무역 노동자들') + ')',
      '경찰의 강제 진압으로 노동자 사망',
      '신민당 총재 김영삼의 항의 → 제명 → <em>국민 불만 폭발</em>'] },
    { c: 'r', btn: '부마 항쟁(1979)', texts: [
      '부산, 마산 반정부 시위 전개',
      '<em>비상 계엄과 위수령 선포</em> : 군대 동원 진압 → 시위 주변 지역으로 급속히 확산'] },
    { c: 'r', strong: true, btn: '10·26 사건(1979)', texts: ['부마 항쟁 해결 두고 지도부 분열'] },
    { c: 'g', strong: true, btn: '유신 체제 붕괴', texts: [] },
  ], { figs: [F('d3-yh', 'yh-sitin', '농성 중인 YH 무역 노동자들', '농성 중인 YH 무역 노동자들'), F('d3-seats78', 'seats-1978', '제10대 국회 의원 선거 정당별 의석수', '제10대 국회 의원 선거 정당별 의석수(1978)')],
    notes: ['영상 : ' + links([['d3-v-buma', '부마항쟁 시작되다'], ['d3-v-1026', '10·26 나흘 전 김재규, 박정희에 ‘부마항쟁 원인’ 보고']])] });
P('d3-seats78', '제10대 국회 의원 선거 정당별 의석수(1978)', 'seats-1978', '중앙선거관리위원회, 1978.');
P('d3-yh', '농성 중인 YH 무역 노동자들(1979)', 'yh-sitin', '');

// ================= 11 =================
page('s69', 'f69', H11, 1, '신군부의 권력 장악과 서울의 봄', '11-1 신군부의 권력 장악과 서울의 봄',
  '10·26 사태 이후 <em>12·12 쿠데타</em>로 신군부가 권력을 잡자 <em>서울의 봄</em> 민주화 운동이 전개되었으나 5·17 비상 계엄 확대로 좌절.',
  [
    { c: 'n', btn: '10·26 사태', texts: [
      '비상 계엄 선포',
      '최규하 제10대 대통령 선출(통일 주체 국민회의)',
      '국민들의 <em>민주화 요구 확산</em>'] },
    { c: 'r', btn: '12·12 쿠데타(1979)', texts: [
      '신군부의 군사권 장악 → 계엄 유지, 헌법 개정 지연',
      '<em>신군부의 정치 개입</em> 본격화'] },
    { c: 'g', btn: '서울의 봄 : 민주화 운동 전개', texts: [
      '<em>신군부 퇴진</em>, 계엄령 철폐, 유신 헌법 폐지 요구',
      '<em>서울역 회군</em>(5. 15.)(' + lnk('d3-seoul-station', '서울역 앞 시위') + ')'] },
    { c: 'r', strong: true, btn: '계엄령 전국 확대(5. 17.)', texts: ['모든 정치 행위 금지(국회 해산), 대학 휴교령 선포'] },
  ], { figs: [F('d3-seoul-station', 'seoul-station', '서울역 앞 시위', '서울역 앞 시위(1980. 5. 15.)')],
    notes: ['영상 : ' + lnk('d3-v-seoulstn', '서울역 회군')] });
P('d3-seoul-station', '서울역 앞 시위(1980. 5. 15.)', 'seoul-station', '');

page('s70', 'f70', H11, 2, '5·18 광주 민주화 운동', '11-2 5·18 광주 민주화 운동',
  '신군부의 비상 계엄 확대에 맞선 광주 시민의 시위가 공수 부대의 무자비한 진압으로 <em>시민군의 항쟁</em>으로 발전했으나 5월 27일 진압됨.',
  [
    { c: 'r', btn: '5월 18일', texts: [
      '광주 : 신군부의 비상 계엄과 휴교령 반대 시위 → <em>공수 부대의 무차별 진압</em>(' + lnk('d3-g-518-0', '계엄군 헬기') + ')',
      '<em>시민까지 합세</em>하여 시위 확대(' + lnk('d3-g-518-1', '계엄 해제를 요구하는 광주 시민') + ')'] },
    { c: 'r', strong: true, btn: '5월 21일', texts: [
      '시위대에 발포 → 시민들의 <em>‘시민군’</em> 조직 후 저항 → 광주 주변으로 확산',
      '<em>언론 통제</em>, 광주 지역 봉쇄(' + lnk('d3-g-518-7', '해외 언론 보도') + ')'] },
    { c: 'g', btn: '5월 21일', texts: [
      '<em>‘시민 수습 대책 위원회’</em> 조직 → 무기 회수 후 정부에 협상 요구(' + lnk('d3-g-518-2', '시민 공동체의 모습') + ' · ' + lnk('d3-g-518-3', '광주 시민의 궐기문') + ')',
      '구속자 석방과 비상 계엄 해제 등 요구'] },
    { c: 'r', strong: true, btn: '5월 27일', texts: ['계엄군의 광주 도청 시민군 <em>무자비한 진압</em>(' + lnk('d3-g-518-5', '유족') + ' · ' + lnk('d3-g-518-6', '5·18 묘역 관리인과 계엄군 양심선언') + ')'] },
  ], { figs: [F('d3-g-518-1', 'martial-demand', '계엄 해제를 요구하는 광주 시민', '계엄 해제를 요구하는 광주 시민'), F('d3-g-518-0', 'helicopter', '광주 상공을 날고 있는 계엄군 헬기', '광주 상공을 날고 있는 계엄군 헬기')],
    notes: ['영상 : ' + links([['d3-v-518a', '[5월 계기교육] 5월 18일 5.18광주민주화 운동'], ['d3-v-518b', '지식채널 5.18 광주민주화운동'], ['d3-v-518c', '40년 전 ‘TBC 카메라’가 기록한 5월 광주'], ['d3-v-518d', '38년 만에 첫 공개된 5.18민주화운동 영상 — 진압 후 웃는 계엄군']])] });
G('d3-g-518', '5·18 광주 민주화 운동', [['helicopter', '광주 상공을 날고 있는 계엄군 헬기'], ['martial-demand', '계엄 해제를 요구하는 광주 시민'], ['community', '시민 공동체의 모습을 보여 준 5월의 광주'], ['gwangju-appeal', '광주 시민의 궐기문(1980. 5. 25.)'], ['sources-518', '5·18 민주화 운동 — 광주 시민 궐기문과 전두환·노태우에 대한 대법원 판결 요지'], ['bereaved', '자식의 묘지 앞에서 흐느끼는 유족(상)과 부모의 죽음을 슬퍼하는 아이(하)'], ['witnesses', '5·18 묘역 관리인(2000)과 5·18 민주화 운동에 대해 양심선언 중인 최○○(1989)'], ['cbs-report', '해외 언론 보도 — 미국 CBS 뉴스(1980. 5. 28.)']]);

page('s71', 'f71', H11, 2, '5·18 광주 민주화 운동', '11-2 5·18 민주화 운동의 의의',
  '5·18 민주화 운동은 <em>1980년대 민주화 운동의 토대</em>가 되었고 아시아의 민주화 운동에도 영향.',
  [
    { c: 'g', strong: true, btn: '5·18 민주화 운동', h: 56, texts: [
      '<em>6월 민주 항쟁 등 1980년대 민주화 운동의 토대</em>',
      '필리핀 등 아시아 국가의 민주화 운동에 영향',
      '대학생 중심 <em>반미 운동의 시초</em> : 부산 미문화원 방화 사건, 서울 미문화원 점거 사건 등(' + lnk('d3-g-usc-0', '불타는 부산 미국 문화원') + ' · ' + lnk('d3-g-usc-1', '서울 미국 문화원 점거') + ')',
      '5·18 민주화 운동 관련 기록물 : <em>유네스코 기록 문화 유산</em> 지정(2011)(' + lnk('d3-diary', '광주 여고생이 쓴 일기') + ')'] },
  ], { figs: [F('d3-diary', 'diary', '광주 여고생이 쓴 일기', '5·18 민주화 운동 당시 광주 여고생이 쓴 일기'), F('d3-g-usc-0', 'usc-fire', '불타는 부산 미국 문화원', '불타는 부산 미국 문화원(1982)')] });
G('d3-g-usc', '반미 운동의 시초', [['usc-fire', '불타는 부산 미국 문화원(1982)'], ['usc-seoul', '서울 미국 문화원을 점거한 학생이 현수막을 내걸고 있는 모습(1985)']]);
P('d3-diary', '5·18 민주화 운동 당시 광주 여고생이 쓴 일기(유네스코 세계 기록 유산)', 'diary', '');

page('s72', 'f72', H11, 3, '전두환 정부의 출범과 강압 정치', '11-3 전두환 정부의 출범과 강압 정치 ① 강압 통치',
  '신군부는 5·18 민주화 운동을 진압한 뒤 <em>국가 보위 비상 대책 위원회</em>를 설치하고 언론 통제와 삼청 교육대 등으로 강압 통치.',
  [
    { c: 'r', btn: '신군부의 실권 장악', texts: [
      '5·18 광주 민주화 운동 진압 → 국회 해산, <em>국가 보위 비상 대책 위원회</em> 설치(1980. 5. 20.)'] },
    { c: 'r', strong: true, btn: '강압 통치', texts: [
      '<em>언론 통제</em> : 언론 통폐합과 ‘보도 지침’(' + lnk('d3-press', '언론 방송 통폐합 자필 각서') + ')',
      '<em>삼청 교육대</em> 설치(1980)(' + lnk('d3-samcheong', '삼청 교육대') + ')'] },
  ], { figs: [F('d3-press', 'press-memo', '언론 방송 통폐합 자필 각서', '언론 방송 통폐합 자필 각서(1980. 11.)'), F('d3-samcheong', 'samcheong', '삼청 교육대', '삼청 교육대')],
    notes: ['영상 : ' + lnk('d3-v-bodo', '검찰 발표만 써라… 전두환 정권 ‘보도지침’ 원본 첫 공개')] });
P('d3-press', '언론 방송 통폐합 자필 각서(1980. 11.)', 'press-memo', '');
P('d3-samcheong', '삼청 교육대', 'samcheong', '');

page('s73', 'f73', H11, 3, '전두환 정부의 출범과 강압 정치', '11-3 전두환 정부의 출범과 강압 정치 ② 전두환 정부의 출범',
  '전두환은 유신 헌법의 통일 주체 국민 회의에서 대통령에 선출된 뒤 <em>7년 단임제</em> 헌법으로 다시 대통령이 되고, 유화 정책과 탄압을 병행.',
  [
    { c: 'b', btn: '제11대 대통령 ‘전두환’', texts: ['최규하(10대 대통령) 하야 → <em>통일 주체 국민 회의</em>(유신 헌법) → 전두환 제11대 대통령 선출(1980)'] },
    { c: 'b', btn: '개헌(국민 투표)', texts: ['<em>7년 단임제</em>, ‘대통령 선거인단’ 간접 선거', '계엄령 해제(10·26 사건~)'] },
    { c: 'b', strong: true, btn: '제12대 대통령 ‘전두환’', texts: ['대통령 선거인단(5000명) → 전두환 대통령 선출(1981)'] },
    { c: 't', btn: '유화 정책', texts: ['야간 통행 금지 해제, 학생 두발과 교복 자율화', '해외 여행 자유화, 프로 스포츠 도입', '이산 가족 상봉 및 남북 예술단 교환'] },
    { c: 'r', btn: '학생, 시민 단체의 민주화 운동', h: 56, texts: ['국가 보안법 등으로 탄압'] },
  ], {});

// ================= 12 =================
page('s74', 'f74', H12, 1, '직선제 개헌 요구', '12-1 직선제 개헌 요구',
  '전두환 정부의 폭압 정치에 맞선 학생 운동과 야당의 <em>직선제 개헌 운동</em>이 부천서 성 고문 사건과 박종철 고문 치사 사건으로 크게 확산.',
  [
    { c: 'r', btn: '전두환 정부의 폭압 정치', texts: [
      '<em>학생 운동</em> : 5·18 진상 규명과 반미 운동 + 민중 운동 세력과의 연대 모색(' + lnk('d3-g-usc-1', '서울 미국 문화원 점거') + ')',
      '<em>일부 정치 세력</em> : 민주화 추진 협의회 결성'] },
    { c: 'b', btn: '신한 민주당 결성(1985)', texts: [
      '김영삼 + 김대중 중심 → <em>제1 야당</em>(12대 국회 의원 선거)',
      '<em>직선제 개헌 1천만 명 서명 운동</em>, ‘5·3 인천 민주 항쟁’ 전개'] },
    { c: 'r', btn: '부천서 성 고문 사건(1986)', texts: ['정부의 조작, 은폐(' + lnk('d3-buchon', '부천 경찰서 성 고문 사건 보도 지침') + ')'] },
    { c: 'r', strong: true, btn: '박종철 고문 치사 사건(1987)', texts: [
      '정부의 조작, 은폐 → 박종철 추모제(' + lnk('d3-g-parkjc-0', '박종철 고문 치사 보도') + ' · ' + lnk('d3-g-parkjc-1', '추도 침묵시위') + ')',
      '<em>민주화, 직선제 요구 분출</em>'] },
    { c: 'r', strong: true, btn: '4·13 호헌 조치 발표(1987)', texts: [lnk('d3-news413', '4·13 호헌 조치 발표를 보도한 신문')] },
  ], { figs: [F('d3-g-parkjc-0', 'parkjc-news', '박종철 고문 치사 보도', '박종철 고문 치사 사건 보도'), F('d3-g-parkjc-1', 'parkjc-silent', '박종철 추모 침묵시위', '고 박종철 추도 및 고문 근절을 위한 침묵시위')],
    notes: ['영상 : ' + lnk('d3-v-parkjc', '박종철 고문치사 사건의 진상을 폭로하는 정의구현 사제단')] });
G('d3-g-parkjc', '박종철 고문 치사 사건', [['parkjc-news', '박종철 고문 치사 사건 보도'], ['parkjc-silent', '고 박종철 추도 및 고문 근절을 위한 침묵시위']]);
P('d3-buchon', '부천 경찰서 성 고문 사건 보도 지침(1986. 7. 17.)', 'buchon-guideline', '');
P('d3-news413', '4·13 호헌 조치 발표를 보도한 신문', 'news-413', '');

page('s75', 'f75', H12, 2, '6월 민주 항쟁', '12-2 6월 민주 항쟁',
  '4·13 호헌 조치와 박종철 사건 폭로로 조직된 <em>민주 헌법 쟁취 국민운동 본부</em>가 이한열 피격을 계기로 전국적 <em>6월 민주 항쟁</em>을 이끎.',
  [
    { c: 'r', btn: '4·13 호헌 조치', texts: ['박종철 고문 치사 사건 진상 폭로(5. 18.) → <em>민주 헌법 쟁취 국민운동 본부</em> 조직(5. 28.)'] },
    { c: 'r', strong: true, btn: '시위 도중 ‘이한열’ 최루탄 피격(6. 9.)', h: 56, texts: ['<em>국민적 분노 폭발</em>(' + lnk('d3-g-hanyeol-0', '쓰러지는 이한열') + ' · ' + lnk('d3-g-hanyeol-1', '이한열을 부축하는 학생') + ')'] },
    { c: 'n', btn: '민정당 대통령 후보 노태우 선출(6. 10.)', h: 56, texts: [] },
    { c: 'g', btn: '6·10 국민 대회 개최', texts: ['<em>명동 성당 농성 투쟁</em>(' + lnk('d3-g-610-0', '6·10 국민 대회 선언문') + ' · ' + lnk('d3-g-610-1', '6월 민주 항쟁의 시위 행렬') + ')'] },
    { c: 'g', btn: '민주 헌법 쟁취 국민 대행진(6. 26.)', h: 56, texts: [lnk('d3-flagman', '6월 민주 항쟁을 대표하는 사진')] },
    { c: 'g', strong: true, btn: '6·29 선언', texts: [] },
  ], { figs: [F('d3-g-hanyeol-0', 'lee-fall', '쓰러지는 이한열', '시위 도중 경찰이 쏜 최루탄에 맞아 쓰러지는 이한열(1987. 6.)'), F('d3-flagman', 'flag-man', '6월 민주 항쟁을 대표하는 사진', '6월 민주 항쟁을 대표하는 사진')],
    notes: ['영상 : ' + lnk('d3-v-hanyeol', '01 1987년 이한열에게')] });
G('d3-g-hanyeol', '이한열 최루탄 피격', [['lee-fall', '시위 도중 경찰이 쏜 최루탄에 맞아 쓰러지는 이한열(1987. 6.)'], ['lee-carried', '최루탄에 맞은 이한열을 부축하는 학생']]);
G('d3-g-610', '6·10 국민 대회와 6월 민주 항쟁', [['declare-610', '6·10 국민 대회 선언문'], ['rally-610', '6월 민주 항쟁의 시위 행렬']]);
P('d3-flagman', '6월 민주 항쟁을 대표하는 사진', 'flag-man', 'AP 통신이 1999년 20세기 100대 보도 사진으로 선정한 ‘아! 대한민국’. 우리나라 6월 민주 항쟁을 대표하는 사진이다.');

page('s76', 'f76', H12, 2, '6·29 선언', '12-3 6·29 선언과 6월 민주 항쟁의 의의',
  '<em>6·29 선언(1987)</em>으로 대통령 직선제 개헌이 수용되어 6월 민주 항쟁은 민주화의 큰 성과를 거둠.',
  [
    { c: 'g', strong: true, btn: '6·29 선언 발표', texts: [
      '<em>대통령 직선제</em>로 개헌하고 1988년 2월 평화적으로 정부 이양',
      '대통령 선거법을 개정하여 <em>자유로운 출마와 경쟁</em> 보장',
      '개헌안에 <em>기본권 강화</em> 조항 보완',
      '언론 관련 제도와 관행을 개선하고 <em>언론의 자율성</em> 최대한 보장',
      '지방 자치, 대학의 자율화와 교육 자치 실현(' + lnk('d3-629', '6·29 민주화 선언의 주요 내용') + ')'] },
    { c: 't', btn: '1987년 6월 민주 항쟁 일지', texts: [
      '1월 14일 박종철 사망 → 4월 13일 호헌 조치 발표 → 6월 9일 이한열 피격',
      '6월 10일 고문·살인 은폐 규탄 및 호헌 철폐 국민 대회 → 6월 26일 민주 헌법 쟁취 국민 평화 대행진 → <em>6월 29일 노태우 6·29 선언 발표</em>(' + lnk('d3-timeline', '일지') + ')'] },
  ], { figs: [F('d3-629', 'declare-629', '6·29 민주화 선언의 주요 내용', '6·29 민주화 선언의 주요 내용')] });
P('d3-629', '6·29 민주화 선언의 주요 내용', 'declare-629', '「동아일보」, 1987. 6. 29.');
P('d3-timeline', '1987년 6월 민주 항쟁 일지', 'timeline-87', '');

// ================= videos =================
const VID = [
  ['d3-v-315', '3.15 부정선거', '03J8WTvlR74'], ['d3-v-masan', '3월 15일 의거', null], ['d3-v-418', '4.18 고대생 습격사건', null],
  ['d3-v-516', '대한뉴스 제 314호-5.16', 'XSFgb1mUAVI'], ['d3-v-hanil', '부당한 약속, 1965 한일협정', 'UBIlkzwv_9g'], ['d3-v-3seon', '3선 개헌 반대운동', 'FomNscPvmNY'],
  ['d3-v-71', '7대 대통령선거 박정희 김대중 연설', null], ['d3-v-yushin', '유신체제의 성립1972', null], ['d3-v-inhyuk1', '제2차 인혁당은 북괴 앞잡이', null],
  ['d3-v-inhyuk2', '지식채널e 인혁당 사건', null], ['d3-v-inhyuk3', '2차 인혁당 사건 무죄', '4v6th0sViDA'], ['d3-v-kimsj', '김상진 열사 연설(긴급조치9호 원인)', null],
  ['d3-v-060', '영상한국사 060 유신체제 강화를 위한 탄압이 계속되다', 'AuNjqN-iyYs'], ['d3-v-buma', '부마항쟁 시작되다', null], ['d3-v-1026', '10·26 나흘 전 김재규, 박정희에 ‘부마항쟁 원인’ 보고', 'AsM5NEPCijc'],
  ['d3-v-seoulstn', '서울역 회군', null], ['d3-v-518a', '[5월 계기교육] 5월 18일 5.18광주민주화 운동', 'AG8YXMJmG2w'], ['d3-v-518b', '지식채널 5.18 광주민주화운동', 'tDl2oQue9A0'],
  ['d3-v-518c', '40년 전 ‘TBC 카메라’가 기록한 5월 광주', null], ['d3-v-518d', '38년 만에 첫 공개된 5.18민주화운동 영상 — 진압 후 웃는 계엄군', '6dnc18T8qDE'],
  ['d3-v-bodo', '검찰 발표만 써라… 전두환 정권 ‘보도지침’ 원본 첫 공개', null], ['d3-v-parkjc', '박종철 고문치사 사건의 진상을 폭로하는 정의구현 사제단', null], ['d3-v-hanyeol', '01 1987년 이한열에게', 'iI7zI0_GLuU'],
];
const WIDE = new Set(['d3-flow', 'd3-pledge', 'd3-hanil-issue', 'd3-brown', 'd3-statement-74', 'd3-jang-policy', 'd3-unification', 'd3-declare-31', 'd3-buchon', 'd3-629', 'd3-timeline', 'd3-seats78', 'd3-news413']);
const popupJs = [];
pops.forEach(([key, title, file, cap]) => { const im = "IMG('assets/" + file + "'," + JSON.stringify(title) + ")"; const inner = WIDE.has(key) ? "'<div class=\"wide2\">' + " + im + " + '</div>'" : im; popupJs.push("  '" + key + "': { title: " + JSON.stringify(title) + ", html: " + inner + (cap ? " + `<p class=\"modal-caption\">" + cap + "</p>`" : "") + " },"); });
gpops.forEach(([key, title, items]) => { const js = JSON.stringify(items.map(([f, c]) => ['assets/' + f, c])); popupJs.push("  '" + key + "': { title: " + JSON.stringify(title) + ", html: GAL(" + js + ") },"); items.forEach((it, i) => popupJs.push("  '" + key + '-' + i + "': { title: " + JSON.stringify(title) + ", html: GAL(" + js + ", " + i + ") },")); });
VID.forEach(([key, title, id]) => {
  const t = /영상$/.test(title) ? title : title + ' (영상)';
  if (id) popupJs.push("  '" + key + "': { title: " + JSON.stringify(t) + ", html: () => ytHtml('" + id + "', " + JSON.stringify(title + ' 영상') + ") },");
  else popupJs.push("  '" + key + "': { title: " + JSON.stringify(t) + ", html: `<p class=\"modal-caption\" style=\"margin-top:0\">아직 영상 주소가 연결되지 않았습니다.<br>교사 모드의 [영상 주소] 버튼에서 유튜브 주소를 입력하면 이 자리에 영상이 나옵니다.<br>수업 PPT의 영상 : " + title + "</p>` },");
});
fs.writeFileSync(__dirname + '/new_slides6.html', slides.join('\n'));
fs.writeFileSync(__dirname + '/new_popups6.js', popupJs.join('\n'));
fs.writeFileSync(__dirname + '/vid6.json', JSON.stringify(VID));
console.log('slides', slides.length, 'popups', popupJs.length);
