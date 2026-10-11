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
const H5 = ['05', '북한이 전쟁을 일으키다'], H6 = ['06', '분단이 고착화되고 독재 체제가 강화되다'], H7 = ['07', '전후 복구 사업을 전개하다'];
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

// ================= unit page =================
slides.push(`<section class="slide unit" hidden data-sid="s31" data-title="2-2 6·25 전쟁과 남북 분단의 고착화">
  <div class="stage">
    <p class="eyebrow">2-2</p>
    <h2 class="heading">6·25 전쟁과 남북 분단의 고착화</h2>
    <p class="lead">남북 정부 수립 이후 <em>북한의 남침으로 6·25 전쟁</em>이 일어나 인적·물적 피해와 함께 <em>분단이 고착화</em>되었고, 남북 모두 <em>독재 체제가 강화</em>된 가운데 전후 복구 사업 전개.</p>
    <ol class="points">
      <li class="point"><span class="num">05</span><div><h3>북한이 전쟁을 일으키다</h3><p>전쟁 직전 국내외 정세, 6·25 전쟁의 원인과 전개 과정, 정전 협정 체결, 6·25 전쟁의 피해와 국제적 영향</p></div></li>
      <li class="point"><span class="num">06</span><div><h3>분단이 고착화되고 독재 체제가 강화되다</h3><p>장기 집권을 위한 개헌, 반공주의와 독재 체제 강화, 전후 북한의 정치와 경제</p></div></li>
      <li class="point"><span class="num">07</span><div><h3>전후 복구 사업을 전개하다</h3><p>전후 복구 노력과 미국의 원조, 전후 사회의 변화</p></div></li>
    </ol>
  </div>
</section>
`);

// ================= 05 =================
// s32 전쟁 직전 국내외 정세
page('s32', 'f32', H5, 1, '전쟁 직전 국내외 정세', '05-1 전쟁 직전 국내외 정세',
  '남북한 단독 정부 수립 이후 <em>군사적 대립이 심화</em>되어 38선 부근의 충돌이 빈번해지고 북한은 전쟁 준비를 본격화.',
  [
    { c: 'g', btn: '남북한 단독 정부 수립', texts: [
      '남한 : 국군(←국방경비대) 창설, ' + lnk('u2-partisan-map', '빨치산 토벌 작전') + ' 전개',
      '북한 : 인민군 창설, 남한에서 <em>빨치산 투쟁</em> 전개',
      '<em>1949년 미소 양군 철수</em>',
      '한미 상호 방위 원조 협정 체결(1950)'] },
    { c: 'r', btn: '남북 군사적 대립 심화', texts: ['남북의 체제 비난 강화와 38선 부근 충돌 빈번'] },
    { c: 'r', strong: true, h: 56, btn: '1949년부터 김일성의 전쟁 준비 본격화', texts: [] },
  ], { figs: [fig('u2-partisan-map', 'partisan-map', '38도선 이남 빨치산 활동 영역', '38도선 이남 지역의 빨치산 활동 영역(1949. 12. 15.)')] });
P('u2-partisan-map', '북위 38도선 이남 지역의 빨치산 활동 영역(1949. 12. 15.)', 'partisan-map', '『사진과 그림으로 보는 북한 현대사』(2018)');

// s33 6·25 전쟁의 원인
page('s33', 'f33', H5, 1, '6·25 전쟁의 원인', '05-2 6·25 전쟁의 원인',
  '북한이 <em>소련·중국의 지원 약속</em>을 받아 전쟁을 준비하는 가운데 미국의 대한 정책 변화로 <em>북한이 기습 남침(1950. 6. 25.)</em>.',
  [
    { c: 'r', btn: '북한의 전쟁 준비', texts: [
      lnk('u2-kim-stalin', '소련의 남침 승인') + '과 소련, 중국의 지원 약속',
      '소련의 군사적 지원 : 무기 + 군사 고문단',
      '중국의 군사적 지원 : 조선 의용군(3만 명) + 중공군'] },
    { c: 'b', btn: '미국의 대한 정책', texts: [
      '남한에서 <em>주한 미군 철수</em> 완료(소수 군사 고문단 주둔)',
      lnk('u2-acheson', '애치슨 선언') + '(1950. 1.) 발표'] },
    { c: 'r', strong: true, btn: '북한의 기습 남침(1950. 6. 25.)', texts: [] },
  ], { figs: [fig('u2-kim-stalin', 'kim-stalin', '김일성과 스탈린의 회담', '김일성과 스탈린의 회담(1950. 4.)'), fig('u2-acheson', 'acheson', '애치슨 선언', '애치슨 선언(1950. 1.)')],
    notes: ['영상 : ' + lnk('u2-v-war5', '한국전쟁(5분)')] });
P('u2-kim-stalin', '김일성과 스탈린의 회담(1950. 4.)', 'kim-stalin', '');
P('u2-acheson', '애치슨 선언(1950. 1.)', 'acheson', '『광복 30년사』, 1977.');

// s34 개전과 서울 점령
page('s34', 'f34', H5, 2, '전쟁의 전개 과정', '05-3 전쟁의 전개 ① 개전과 서울 점령',
  '북한의 기습 남침으로 <em>3일 만에 서울이 함락</em>되고 정부는 대전·대구·부산으로 이동.',
  [
    { c: 'r', btn: '북한의 기습 남침(1950. 6. 25.)', texts: [
      '<em>UN 안전 보장 이사회 소집</em> : 미국의 요청 → 북한 규탄 및 전투 행위 중지 요구(9 : 0)',
      '이승만의 대전 피난(6. 27. 새벽), 이승만의 라디오 방송(6. 27. 새벽)',
      lnk('u2-hangang-bridge', '한강 인도교 폭파') + '(6. 28. 새벽) → ' + lnk('u2-hangang-refugees', '한강 철교를 건너는 피난민')] },
    { c: 'r', strong: true, btn: '북한의 서울 점령(1950. 6. 28.)', texts: [
      lnk('u2-seoul-nk-army', '서울에 들어온 북한군') + ' → 100만여 명의 서울 시민 서울 고립 및 잔류(잔류파, 100만/145만)'] },
    { c: 'n', btn: '수도 이동', texts: ['서울 → 대전 → 대구 → 부산'] },
  ], { figs: [fig('u2-hangang-bridge', 'hangang-bridge', '폭파된 한강 인도교', '폭파된 한강 인도교'), fig('u2-seoul-nk-army', 'seoul-nk-army', '서울에 들어온 북한군', '서울에 들어온 북한군(1950. 6. 28.)')],
    notes: ['영상 : ' + lnk('u2-v-rhee-exile', '이승만 정부, 한국전쟁 발발 직후 일본 망명 타진')] });
P('u2-hangang-bridge', '폭파된 한강 인도교(1950. 6. 28.)', 'hangang-bridge', '');
P('u2-hangang-refugees', '한강 철교를 건너는 피난민', 'hangang-refugees', '');
P('u2-seoul-nk-army', '서울에 들어온 북한군(1950. 6. 28.)', 'seoul-nk-army', '');

// s35 UN군 참전과 인천 상륙 작전
page('s35', 'f35', H5, 2, '전쟁의 전개 과정', '05-3 전쟁의 전개 ② UN군 참전과 인천 상륙 작전',
  'UN군의 참전으로 전쟁이 <em>국제전으로 확대</em>되고 <em>인천 상륙 작전(1950. 9. 15.)</em>으로 전세 역전.',
  [
    { c: 'b', btn: 'UN군 참전 본격화', texts: [
      '6·25 전쟁의 <em>국제전적 확대</em> : ' + lnk('u2-16nations', '6·25 전쟁에 참전한 16개국'),
      '<em>군사 작전권 이양</em> : UN 사령관(미군 사령관)'] },
    { c: 'g', btn: '낙동강 전선 구축(~7월 말)', texts: [lnk('u2-nakdong', '낙동강 유역을 방어하는 국군') + '(1950. 8.)'] },
    { c: 'g', strong: true, btn: '인천 상륙 작전(1950. 9. 15.)', texts: [lnk('u2-incheon', '인천에 상륙하는 UN군') + ' → 전세 역전'] },
  ], { figs: [fig('u2-16nations', '16nations', '6·25 전쟁에 참전한 16개국', '6·25 전쟁에 참전한 16개국'), fig('u2-incheon', 'incheon', '인천 상륙 작전', '인천 상륙 작전(1950. 9. 15.)')] });
P('u2-16nations', '6·25 전쟁에 참전한 16개국', '16nations', '');
P('u2-nakdong', '낙동강 유역을 방어하는 국군(1950. 8.)', 'nakdong', '');
P('u2-incheon', '인천 상륙 작전(1950. 9. 15.)', 'incheon', '');

// s36 북진과 중공군 참전, 1·4 후퇴
page('s36', 'f36', H5, 2, '전쟁의 전개 과정', '05-3 전쟁의 전개 ③ 북진과 중공군 참전',
  '국군과 UN군이 압록강까지 북진했으나 <em>중공군의 참전(1950. 10. 19.)</em>으로 후퇴하여 서울을 다시 내줌(1·4 후퇴).',
  [
    { c: 'g', btn: '서울 탈환(1950. 9. 28.)', texts: [lnk('u2-seoul-recapture', '수도 탈환식에서 연설하는 이승만') + '(1950. 9. 29.)'] },
    { c: 'b', btn: '38선 → 평양 → 압록강 유역', texts: ['국군과 UN군의 북진'] },
    { c: 'r', btn: '중공군 참전(1950. 10. 19.)', texts: [
      '국군과 UN군의 북진 우려',
      lnk('u2-yalu-chinese', '압록강을 건너는 중국군') + '(1950. 10.)'] },
    { c: 'r', strong: true, h: 56, btn: '장진호 전투(미·중 전쟁) → 흥남 철수(12. 15.~24.)', texts: [
      lnk('u2-jangjin-route', '장진호 전투 철수 경로') + ' · ' + lnk('u2-heungnam-ship', '흥남 철수') + ' · ' + lnk('u2-heungnam-crowd', '흥남 부두의 피난민')] },
    { c: 'n', btn: '1·4 후퇴(1951. 1. 4.)', texts: [
      lnk('u2-retreat-14', '1·4 후퇴 피난 행렬') + '(1951. 1. 5.)',
      lnk('u2-chinese-bugle', '진군 나팔 소리에 돌진하는 중공군') + ' · ' + lnk('u2-chinese-seoul', '서울을 점령하고 승리를 자축하는 중공군')] },
  ], { figs: [fig('u2-seoul-recapture', 'seoul-recapture', '수도 탈환식', '수도 탈환식(1950. 9. 29.)'), fig('u2-heungnam-ship', 'heungnam-ship', '흥남 철수', '흥남 철수(1950. 12.)')],
    notes: ['자료 : ' + links([['u2-jangjin-1', '장진호 전투 ①'], ['u2-jangjin-2', '장진호 전투 ②'], ['u2-jangjin-3', '장진호 전투 ③'], ['u2-jangjin-4', '장진호 전투 ④'], ['u2-jangjin-snow', '눈 덮인 장진호'], ['u2-veteran-statues', '한국 전쟁 참전 용사 기념 조각상']]),
      '영상 : ' + lnk('u2-v-jangjin', '[스토리박스K] 성공한 후퇴 ‘장진호 전투’')] });
P('u2-seoul-recapture', '수도 탈환식에서 연설하는 대통령 이승만(1950. 9. 29.)', 'seoul-recapture', '');
P('u2-yalu-chinese', '압록강을 건너는 중국군(1950. 10.)', 'yalu-chinese', '');
P('u2-jangjin-route', '장진호 전투 철수 경로', 'jangjin-route', '');
P('u2-heungnam-ship', '흥남 철수(1950. 12.)', 'heungnam-ship', '');
P('u2-heungnam-crowd', '흥남 부두의 피난민', 'heungnam-crowd', '');
P('u2-retreat-14', '1·4 후퇴 피난 행렬(1951. 1. 5.)', 'retreat-14', '');
P('u2-chinese-bugle', '진군 나팔 소리에 돌진하는 중공군 병사들(1951년 초, 강원도 횡성 지역)', 'chinese-bugle', '');
P('u2-chinese-seoul', '서울을 점령하고 승리를 자축하는 중공군', 'chinese-seoul', '');
P('u2-jangjin-1', '장진호 전투 ①', 'jangjin-1', '');
P('u2-jangjin-2', '장진호 전투 ②', 'jangjin-2', '');
P('u2-jangjin-3', '장진호 전투 ③', 'jangjin-3', '');
P('u2-jangjin-4', '장진호 전투 ④', 'jangjin-4', '');
P('u2-jangjin-snow', '눈 덮인 장진호 전투', 'jangjin-snow', '');
P('u2-veteran-statues', '한국 전쟁 참전 용사 기념 조각상', 'veteran-statues', '');

// s37 정전 협상
page('s37', 'f37', H5, 2, '전쟁의 전개 과정', '05-3 전쟁의 전개 ④ 정전 협상',
  '서울 재탈환 후 전선이 38선 부근에서 교착되자 <em>정전 협상</em>이 시작되었으나 2년간 난항.',
  [
    { c: 'g', btn: '서울 재탈환(1951. 3. 14.)', texts: ['38선 부근에서 교착 상태'] },
    { c: 'b', btn: '정전 협상 시작(1951. 6.)', texts: [
      '소련의 제의로 정전 협상 시작 : 미군 vs 중국군, 북한군',
      '38선 부근에서 치열한 전투(' + lnk('u2-bangmagoji', '고지전') + ') 전개'] },
    { c: 'r', btn: '2년간 정전 협상 난항', texts: [
      '<em>포로 송환</em> : 자유 송환(UN) vs 전원 본국 송환(북)',
      '<em>군사 분계선</em> : 정전 회담 시 접촉선(UN) vs 38선(북)',
      '이승만 정부의 북진 통일 주장 → 휴전 협정 반대',
      '<em>반공 포로 전격 석방</em>(2만 7천여 명) → <em>정전 협정 위기</em>'] },
    { c: 'g', strong: true, h: 56, btn: '자유 송환 원칙 + 중립국 포로 송환 위원회 설치 합의', texts: [] },
  ], { figs: [fig('u2-bangmagoji', 'bangmagoji', '정전 회담 동안의 전쟁 양상', '정전 회담 동안의 전쟁 양상(백마고지 전투)')],
    notes: ['영상 : ' + lnk('u2-v-pow', '[희귀영상] 한국전쟁 직후 포로교환 영상')] });
P('u2-bangmagoji', '정전 회담 동안의 전쟁 양상 — 백마고지 전투', 'bangmagoji', '');

// s38 정전 협정 체결
page('s38', 'f38', H5, 2, '전쟁의 전개 과정', '05-3 전쟁의 전개 ⑤ 정전 협정 체결',
  '<em>정전 협정 체결(1953. 7. 27.)</em>로 3년 1개월 만에 전투가 멈추고 군사 분계선과 비무장 지대(DMZ) 설정.',
  [
    { c: 'g', strong: true, btn: '정전 협정 체결(1953. 7. 27.)', texts: [
      '하나의 군사 분계선을 긋고 그로부터 쌍방이 2km씩 후퇴하여 <em>비무장 지대</em> 설정',
      '한반도의 외부로부터 어떠한 무기도 추가로 반입할 수 없음',
      '정전 상태의 감시와 유지를 위해 <em>군사 정전 위원회</em>와 <em>중립국 감독 위원회</em> 운영'] },
    { c: 'n', h: 56, btn: '6·25 전쟁의 전개 과정', texts: [
      lnk('u2-war-map', '북한 인민군의 남침 → UN군의 참전과 북진 → 중국군의 참전 → 전선의 교착과 정전') + '(지도)',
      lnk('u2-war-summary', '단계별 요약')] },
  ], { figs: [fig('u2-armistice-photo', 'armistice-photo', '정전 협정 조인식', '정전 협정 조인식'), fig('u2-war-map', 'war-map', '6·25 전쟁의 전개 과정', '6·25 전쟁의 전개 과정')],
    notes: ['자료 : ' + links([['u2-armistice-text', '정전 협정(1953. 7. 27.) 내용'], ['u2-armistice-sign', '정전 협정 서명']])] });
P('u2-armistice-photo', '정전 협정 조인식', 'armistice-photo', '');
P('u2-armistice-text', '정전 협정(1953. 7. 27.)', 'armistice-text', '');
P('u2-armistice-sign', '정전 협정 서명', 'armistice-sign', '');
P('u2-war-map', '6·25 전쟁의 전개 과정', 'war-map', '');
P('u2-war-summary', '6·25 전쟁의 전개 과정 — 단계별 요약', 'war-summary', '');

// s39 피해 ① 인적·물적
page('s39', 'f39', H5, 3, '6·25 전쟁의 피해', '05-4 6·25 전쟁의 피해 ① 인적·물적 손실',
  '6·25 전쟁으로 <em>막대한 인적·물적 피해</em>가 발생하고 이산 가족과 전쟁고아가 생겨남.',
  [
    { c: 'r', btn: '인적 손실', texts: [
      '군인, 민간인 사망 및 부상(' + lnk('u2-casualty-graph', '인명 피해 통계') + ' · ' + lnk('u2-casualty-info', '인명 피해(국방부)') + ')',
      '→ <em>이산 가족, 고아, 전쟁 미망인</em> 발생(' + lnk('u2-orphan', '전쟁고아') + ')'] },
    { c: 'r', btn: '물적 손실', texts: [
      '<em>사회 시설 대부분 파괴</em>(' + lnk('u2-industry-damage', '남북한의 산업 시설 피해') + ')',
      lnk('u2-ruins', '폐허가 된 도시')] },
  ], { figs: [fig('u2-casualty-info', 'casualty-info', '6·25 전쟁의 인명 피해', '6·25 전쟁의 인명 피해(국방부)'), fig('u2-industry-damage', 'industry-damage', '남북한의 산업 시설 피해', '6·25 전쟁으로 파괴된 남북한의 산업 시설 비율')] });
P('u2-casualty-graph', '6·25 전쟁의 인명 피해', 'casualty-graph', '군사 편찬 연구소, 『통계로 본 6·25 전쟁』, 2014.');
P('u2-casualty-info', '6·25 전쟁의 인명 피해(국방부)', 'casualty-info', '');
P('u2-orphan', '전쟁고아', 'orphan', '');
P('u2-industry-damage', '6·25 전쟁으로 파괴된 남북한의 산업 시설 비율', 'industry-damage', '백종천·윤정원, 『6·25 전쟁에 관한 연구』, 1991.');
P('u2-ruins', '폐허가 된 도시', 'ruins', '');

// s40 피해 ② 민간인 학살
page('s40', 'f40', H5, 3, '6·25 전쟁의 피해', '05-4 6·25 전쟁의 피해 ② 민간인 학살',
  '전선이 이동하는 가운데 <em>수많은 민간인이 학살</em>되어 남북 상호 적대감이 심화되고 분단 체제가 고착화.',
  [
    { c: 'r', btn: '민간인 학살', texts: [
      '전선의 이동 → <em>수많은 민간인 학살</em>',
      '북한 : 점령지 인민 재판 통해 우익 인사 학살',
      '남한 : 군인, 경찰의 민간인 학살'] },
    { c: 'n', btn: '양민 학살', texts: ['노근리, 거창 등'] },
    { c: 'r', btn: '좌익 학살', texts: [
      lnk('u2-bodo-textbook', '국민 보도 연맹 사건') + '(10~20만/30만)',
      '국민 방위군 사건(5~10만/68만)'] },
    { c: 'r', strong: true, h: 56, btn: '남북 상호 적대감 심화 → 분단 체제 고착화', texts: [] },
  ], { figs: [fig('u2-picasso', 'picasso', '한국에서의 학살', '「한국에서의 학살」(1951, 피카소)'), fig('u2-massacre-photo', 'massacre-photo', '민간인 학살 현장', '민간인 학살 현장 사진')],
    notes: ['자료 : ' + links([['u2-bodo-truth', '진실화해위원회 결론'], ['u2-bodo-history', '『대한민국사』'], ['u2-bodo-scene', '학살 현장 묘사'], ['u2-bodo-card', '보도 연맹증'], ['u2-bodo-testimony', '가입 증언'], ['u2-bodo-betray', '‘배신’ 행위를 말하는 자료'], ['u2-bodo-loyal', '충성했다는 자료'], ['u2-golryeonggol', '대전 산내 골령골']]),
      '국민 방위군 : ' + links([['u2-nds-recruit', '소집된 국민 방위군'], ['u2-nds-march1', '남하하는 국민 방위군 ①'], ['u2-nds-march2', '남하하는 국민 방위군 ②']]),
      '영상 : ' + links([['u2-v-bodo', '국민보도연맹, ‘10만 학살’ 누가 명령했나'], ['u2-v-geochang', '거창양민학살사건'], ['u2-v-nds', '국민방위군 사건(선을 넘는 녀석들)']])] });
P('u2-picasso', '「한국에서의 학살」(1951, 프랑스 파리 피카소 박물관)', 'picasso', '6·25 전쟁 기간에 민간인들이 희생되는 비극을 묘사한 피카소의 작품이다.');
P('u2-massacre-photo', '민간인 학살 현장 사진', 'massacre-photo', '');
P('u2-bodo-textbook', '국가 권력에 의한 전쟁 범죄, 국민 보도 연맹 사건', 'bodo-textbook', '');
P('u2-bodo-truth', '진실화해위원회의 국민 보도 연맹 사건 결론', 'bodo-truth', '');
P('u2-bodo-history', '『대한민국사』 — 민간인 학살', 'bodo-history', '');
P('u2-bodo-scene', '당시 보도 연맹원 학살의 한 현장 묘사', 'bodo-scene', '');
P('u2-bodo-card', '보도 연맹증', 'bodo-card', '');
P('u2-bodo-testimony', '보도 연맹 가입에 대한 증언', 'bodo-testimony', '');
P('u2-bodo-betray', '보도 연맹원들의 ‘배신’ 행위를 말하는 자료', 'bodo-betray', '');
P('u2-bodo-loyal', '보도 연맹원들이 대한민국에 충성했다는 자료', 'bodo-loyal', '');
P('u2-golryeonggol', '대전 산내 골령골 학살 현장 사진', 'golryeonggol', '');
P('u2-nds-recruit', '소집된 국민 방위군의 모습', 'nds-recruit', '');
P('u2-nds-march1', '남하하는 국민 방위군', 'nds-march1', '');
P('u2-nds-march2', '남하하는 국민 방위군 대원들', 'nds-march2', '');

// s41 국제적 영향
page('s41', 'f41', H5, 3, '6·25 전쟁의 국제적 영향', '05-5 6·25 전쟁의 국제적 영향',
  '6·25 전쟁은 <em>미소의 냉전 체제를 심화</em>시키고 남한·북한·일본의 정치·경제에 큰 영향.',
  [
    { c: 'n', btn: '미소의 냉전 체제 심화', texts: [] },
    { c: 'b', btn: '남한', h: 44, texts: [
      lnk('u2-usa-treaty', '한-미 상호 방위 조약') + ' 체결(1953) → 주한 미군 주둔과 동북 아시아에서 미국의 영향력 강화',
      '분단 고착화 → 반공을 내세운 <em>이승만 독재 체제 강화</em> 계기'] },
    { c: 'r', btn: '북한', texts: [
      '<em>중국의 영향력</em> 강화',
      '분단 고착화 → <em>김일성 독재 체제 강화</em> 계기(반대파 숙청)'] },
    { c: 't', btn: '일본', texts: [
      '샌프란시스코 강화 조약 : <em>주권 국가 회복</em>',
      '6·25 전쟁 특수로 경제 성장의 계기, 치안 유지 명목으로 자위대 창설'] },
  ], { figs: [fig('u2-usa-treaty', 'usa-treaty', '한-미 상호 방위 조약', '한-미 상호 방위 조약(1953)')] });
P('u2-usa-treaty', '한-미 상호 방위 조약(1953)', 'usa-treaty', '외무부 방교국, 『조약집』');

// ================= 06 =================
// s42 선거와 정치 파동
page('s42', 'f42', H6, 1, '장기 집권을 위한 개헌', '06-1 장기 집권을 위한 개헌 ① 부산 정치 파동',
  '이승만 정권은 국회에서 재선이 어려워지자 <em>직선제 개헌을 추진</em>하며 공안 정국을 조성.',
  [
    { c: 'b', btn: '제2대 국회 의원 선거(1950. 5. 30.)', texts: ['이승만 반대파(무소속 소장파) 대거 당선(' + lnk('u2-assembly2', '선거 결과') + ')'] },
    { c: 'r', btn: '6·25 전쟁 발발', texts: ['이승만의 서울 탈출, 국민 방위군 사건, 거창 양민 학살 사건 등 발생'] },
    { c: 'g', btn: '자유당 창당(1951. 12.)', texts: ['국회에서 이승만 대통령 선출 가능성 불가능 → <em>지지 세력 결집</em>'] },
    { c: 'b', btn: '직선제 개헌 추진', texts: ['정부가 직선제 개헌안 제출 → 국회에서 부결(1952. 1.)'] },
    { c: 'r', strong: true, btn: '공포, 공안 정국 조성', texts: ['관제 데모, 부산에 계엄령 선포, ' + lnk('u2-busan-bus', '부산 정치 파동') + '(1952. 5. 26.) 등'] },
  ], { figs: [fig('u2-assembly2', 'assembly2', '제2대 국회 의원 선거 결과', '제2대 국회 의원 선거 결과'), fig('u2-busan-bus', 'busan-bus', '부산 정치 파동', '부산 정치 파동(1952. 5. 26.)')],
    notes: ['영상 : ' + lnk('u2-v-busan', '한국현대사 부산정치파동')] });
P('u2-assembly2', '제2대 국회 의원 선거 결과', 'assembly2', '중앙선거관리위원회, 『선거통계시스템』, 2018.');
P('u2-busan-bus', '부산 정치 파동(1952. 5. 26.)', 'busan-bus', '6·25 전쟁 중 임시 수도였던 부산 일원에 계엄령을 선포한 후, 폭력 조직을 동원하여 국회 의원들을 위협하면서 야당 의원 50여 명을 국제 공산당의 정치 자금을 받았다는 혐의로 헌병대로 연행하여 그중 10명을 구속하였다.');

// s43 발췌 개헌
page('s43', 'f43', H6, 1, '장기 집권을 위한 개헌', '06-1 장기 집권을 위한 개헌 ② 발췌 개헌',
  '정부안과 국회안을 절충한 <em>발췌 개헌(1952. 7.)</em>이 경찰과 군대가 국회를 포위한 가운데 통과되어 이승만이 재선.',
  [
    { c: 'g', btn: '국무총리 장택상의 중재', texts: ['정부의 안(직선제 개헌안) + 국회의 안(내각제 개헌안) 제출 → <em>발췌 개헌안</em>'] },
    { c: 'r', strong: true, btn: '국회 표결(1952. 7. 4.)', texts: [
      '경찰과 군대의 국회 포위 → 토론 없이 공개 기립 표결 → 통과(' + lnk('u2-balchwae-vote', '표결 장면') + ')'] },
    { c: 'g', btn: '제2대 대통령 선거(1952. 8. 15.)', texts: ['<em>이승만 당선</em>(74.6%)'] },
  ], { figs: [fig('u2-balchwae-vote', 'balchwae-vote', '발췌 개헌안 표결', '발췌 개헌안 표결(재적 166명, 찬성 163표, 기권 3표)')] });
P('u2-balchwae-vote', '발췌 개헌안 표결(1952. 7.) — 재적 166명, 발췌 개헌안 표결 찬성 163표, 기권 3표', 'balchwae-vote', '');

// s44 사사오입 개헌
page('s44', 'f44', H6, 1, '장기 집권을 위한 개헌', '06-1 장기 집권을 위한 개헌 ③ 사사오입 개헌',
  '자유당이 <em>사사오입(반올림)의 논리</em>로 부결된 개헌안을 통과시켜 <em>대통령의 중임 제한을 철폐</em>.',
  [
    { c: 'b', btn: '제3대 국회 의원 선거(1954. 5. 20.)', texts: ['대규모 관권 선거 → <em>자유당 압승</em>(' + lnk('u2-assembly54', '정당별 당선자 수') + ')'] },
    { c: 'r', btn: '자유당의 개헌안 발의', texts: ['초대 대통령에 한하여 ‘3선 금지’ 조항 적용 ×'] },
    { c: 'n', btn: '부결(1954. 12. 27.)', texts: ['135명 찬성 / 재적 203명 → 2/3(135.333…명) 미달'] },
    { c: 'g', strong: true, btn: '사사오입 개헌(1954. 12. 29.)', texts: [
      '부결 번복 : 2/3 = 135.333…명 = 135명 주장(← 통계 수학의 반올림 적용 = ' + lnk('u2-liberal-statement', '사사오입') + ')',
      '<em>대통령의 중임 제한 철폐</em>(' + lnk('u2-constitution55', '헌법 제55조와 부칙') + ') → 이승만의 영구 독재 토대 구축'] },
  ], { figs: [fig('u2-protest-1954', 'protest-1954', '사사오입 개헌에 항의하는 야당 의원들', '사사오입의 논리로 개헌안이 통과되자 항의하는 야당 국회 의원들(1954. 11. 29.)')] });
P('u2-assembly54', '제3대 국회 의원 선거 결과(1954. 5. 20.)', 'assembly54', '');
P('u2-liberal-statement', '자유당 원내 총무 담화', 'liberal-statement', '');
P('u2-constitution55', '헌법 제55조와 부칙', 'constitution55', '대한민국 관보 제1228호');
P('u2-protest-1954', '사사오입의 논리로 개헌안이 통과되자 항의하는 야당 국회 의원들(1954. 11. 29.)', 'protest-1954', '');

// s45 반공주의와 독재 체제 강화 ① 정부통령 선거
page('s45', 'f45', H6, 2, '반공주의와 독재 체제 강화', '06-2 반공주의와 독재 체제 강화 ① 제3대 정부통령 선거',
  '사사오입 개헌으로 이승만의 영구 집권 기반이 마련되자 야당은 통합을 시도했으나 실패, 제3대 정부통령 선거에서 <em>조봉암이 약진</em>.',
  [
    { c: 'g', btn: '사사오입 개헌(1954. 12.)', texts: ['이승만의 영구 독재 체제 구축 토대 마련'] },
    { c: 'b', btn: '야당의 통합 시도', texts: ['실패 → <em>민주당</em> 결성 / <em>진보당 추진 위원회</em> → 진보당 창당(1956. 11.)'] },
    { c: 'g', strong: true, btn: '제3대 정부통령 선거(1956. 5. 15.)', texts: [
      '대통령 : 자유당 이승만(<em>북진 통일론</em>) vs 민주당 신익희 vs 진보당 추진 위원회 조봉암(<em>평화 통일론</em>)',
      '민주당 신익희 한강 백사장 유세(' + lnk('u2-shin-rally', '25만~30만') + '/서울 인구 150만) → 신익희 사망(5. 5.), 투표율 95%',
      '이승만 당선, 조봉암 30% 득표 / 부통령 : 자유당 이기붕 vs 민주당 장면 → <em>장면 당선</em>(' + lnk('u2-election-poster', '선거 포스터') + ')'] },
  ], { figs: [fig('u2-shin-rally', 'shin-rally', '신익희 한강 백사장 유세', '신익희 한강 백사장 유세(25만~30만/서울 인구 150만)'), fig('u2-election-poster', 'election-poster', '제3대 정부통령 선거 포스터', '제3대 정부통령 선거 포스터와 ‘갈아봤자 더 못산다’')] });
P('u2-shin-rally', '신익희 한강 백사장 유세(25만~30만/서울 인구 150만)', 'shin-rally', '');
P('u2-election-poster', '제3대 정부통령 선거 포스터(왼쪽 : 민주당, 오른쪽 : ‘갈아봤자 더 못산다’)', 'election-poster', '');

// s46 진보당 사건
page('s46', 'f46', H6, 2, '반공주의와 독재 체제 강화', '06-2 반공주의와 독재 체제 강화 ② 진보당 사건',
  '조봉암의 약진에 위기를 느낀 이승만 정부가 <em>진보당 사건(1958)</em>과 국가 보안법 개정으로 반대 세력을 탄압.',
  [
    { c: 'g', btn: '조봉암의 약진(30% 득표) · 진보당 창당', texts: ['<em>이승만 정부의 위기 의식 심화</em>'], h: 56 },
    { c: 'r', strong: true, btn: '진보당 사건(1958)', texts: ['<em>조봉암 간첩죄 사형</em>(' + lnk('u2-trial-cho', '재판을 받고 있는 조봉암') + ')'] },
    { c: 'r', btn: '국가 보안법 개정(3차, 1958. 12. 24.)', h: 56, texts: ['2·4 파동, 신국가 보안법(' + lnk('u2-nsl-1959', '국가 보안법의 주요 내용') + ')'] },
    { c: 'r', btn: '경향 신문 폐간(1959)', texts: ['언론 탄압'] },
  ], { figs: [fig('u2-trial-cho', 'trial-cho', '재판을 받고 있는 조봉암', '재판을 받고 있는 조봉암'), fig('u2-nsl-1959', 'nsl-1959', '국가 보안법의 주요 내용', '국가 보안법의 주요 내용(1959. 1. 개정)')],
    notes: ['영상 : ' + lnk('u2-v-cho', '[기억록]박원상, 조봉암을 기억하여 기록하다.')] });
P('u2-trial-cho', '재판을 받고 있는 조봉암', 'trial-cho', '');
P('u2-nsl-1959', '국가 보안법의 주요 내용(1959. 1. 개정)', 'nsl-1959', '국가 보안법, 법률 제500호');

// s47 전후 북한의 정치
page('s47', 'f47', H6, 3, '전후 북한의 정치와 경제', '06-3 전후 북한의 정치와 경제 ① 김일성의 독재 체제 구축',
  '김일성이 6·25 전쟁 도중부터 <em>연안파·소련파·남로당파를 숙청</em>하고 8월 종파 사건을 거쳐 <em>1인 독재 체제를 완성</em>.',
  [
    { c: 'b', h: 56, btn: '김일성의 독재 체제 구축 과정', texts: ['<em>1950년~1956년 8월까지</em> 연안파, 소련파, 남로당파 숙청'] },
    { c: 'r', btn: '6·25 전쟁 도중', texts: ['<em>연안파</em>(김무정 등) 숙청', '<em>소련파</em>(허가이 등) 숙청', '→ 김일성 우상화 작업 시작'] },
    { c: 'r', btn: '정전 협정 직후', texts: ['<em>남로당파</em> 박헌영 숙청(간첩 혐의)'] },
    { c: 'n', btn: '스탈린 사망', texts: ['소련에서 스탈린 개인 숭배 비판 시작'] },
    { c: 'r', strong: true, btn: '8월 종파 사건(1956. 6.~8.)', texts: ['<em>연안파(+소련파)</em>의 김일성 개인 숭배와 중공업 우선 정책 비판 → 연안파와 소련파 숙청'] },
    { c: 'g', strong: true, h: 56, btn: '김일성 1인 독재 체제 완성', texts: ['중소 이념 분쟁 → <em>독자 노선 시작(주체 사상)</em>'] },
  ], { figs: [fig('u2-kim-statue', 'kim-statue', '평양 만경대 구역에 세워진 김일성 동상', '평양 만경대 구역에 세워진 김일성 동상')],
    notes: ['영상 : ' + lnk('u2-v-kimil', '한국전쟁 이후 김일성의 북한 권력 장악 과정')] });
P('u2-kim-statue', '평양 만경대 구역에 세워진 김일성 동상', 'kim-statue', '');

// s48 전후 북한의 경제
page('s48', 'f48', H6, 3, '전후 북한의 정치와 경제', '06-3 전후 북한의 정치와 경제 ② 전후 경제 복구',
  '전후 북한은 <em>사회주의 경제 체제를 수립</em>하며 경제 복구를 추진했으나 한계가 드러남.',
  [
    { c: 'b', btn: '전후 경제 복구', texts: ['농업 생산 기반 완전 파괴 → <em>개인의 힘으로 복구 불가능</em>'] },
    { c: 'g', btn: '전후 복구 사업(1954~1956)', texts: [
      '<em>중공업 우선, 경공업·농업 동시 발전</em> 경제(1954~1956)',
      '사회주의권의 원조, 인민 경제 발전 3개년 계획 ⇒ 전쟁 이전 수준으로 경제 회복'] },
    { c: 'g', btn: '사회주의 경제 체제 수립', texts: [
      '사업 : 농촌의 농업 협동화(협동 농장 체제) 추진, 천리마 운동(노동력 경쟁) 전개',
      '한계 : 기술 혁신 없는 대중 동원, 북한 주민의 적극적인 희생 요구 ⇒ 실패'] },
    { c: 'r', btn: '경제 개발 5개년 계획(1957)', texts: [lnk('u2-nk-plan-table', '전후 복구 사업과 사회주의 경제 체제 수립 요약')] },
  ], {});
P('u2-nk-plan-table', '전후 복구 사업과 사회주의 경제 체제 수립', 'nk-plan-table', '');

// ================= 07 =================
// s49 전후 복구 노력
page('s49', 'f49', H7, 1, '전후 복구 노력', '07-1 전후 복구 노력',
  '이승만 정부는 <em>미국의 원조와 귀속 재산 매각</em>으로 재원을 마련하여 전후 복구 사업을 추진.',
  [
    { c: 'g', btn: '미국의 원조 · 귀속 재산 매각', texts: ['<em>재원 마련</em>(' + lnk('u2-us-aid-graph', '미국의 한국 원조 현황') + ')'] },
    { c: 'b', strong: true, btn: '전후 복구 사업 추진', texts: [
      '<em>농지 개혁</em> 재추진',
      '국내 산업 발달 ← 미국의 잉여 농산물 제공(' + lnk('u2-rice-graph', '국내 쌀 부족량과 외국 도입량') + ')'] },
    { c: 'n', btn: '미국의 경제 원조', texts: [
      '<em>내용</em> : 생활 필수품과 소비재 산업의 원료 중심으로 원조 → 삼백 산업(제분업, 제당업, 면방직 공업) 발달(' + lnk('u2-us-aid-table', '미국의 경제 원조') + ')',
      '<em>영향</em> : 미국에서 대량의 농산물 유입 → 식량 문제 해결, 국내 농산물 가격 폭락 → 농가 소득 감소, 농업 기반 약화',
      '<em>변화</em> : 1960년대 말 원조 감소, 유상 차관으로 변화 → 경제 불안 현상 심화 (' + lnk('u2-counterpart', '원조 물자의 흐름과 대충 자금') + ')'] },
    { c: 'r', btn: '미국 원조에 지나친 의존', texts: ['원조 감소 대비 → <em>경제 개발 3개년 계획 준비</em>(자립 경제 목표) → 4·19 혁명으로 폐기'] },
  ], { figs: [fig('u2-us-aid-graph', 'us-aid-graph', '미국의 한국 원조 현황', '1950~1960년 미국의 한국 원조 현황'), fig('u2-counterpart', 'counterpart', '원조 물자와 대충 자금', '미국의 원조 물자와 대충 자금')] });
P('u2-us-aid-graph', '1950~1960년 미국의 한국 원조 현황', 'us-aid-graph', '「해방 후 1950년대의 경제 공업화의 사적 배경 연구」, 2002.');
P('u2-us-aid-table', '미국의 경제 원조 — 내용·영향·변화', 'us-aid-table', '');
P('u2-rice-graph', '국내 쌀 부족량과 외국 도입량', 'rice-graph', '「1950년대의 인식」, 1981.');
P('u2-counterpart', '미국의 원조 물자와 대충 자금', 'counterpart', '');

// s50 전후 사회의 변화
page('s50', 'f50', H7, 2, '전후 사회의 변화', '07-2 전후 사회의 변화',
  '전쟁 이후 <em>인구의 대규모 이동과 도시 문제</em>, 여성의 사회 활동과 교육열 증가, 미국식 대중 문화의 유입 등 사회가 변화.',
  [
    { c: 'g', btn: '6·25 전쟁 이후', texts: [
      '<em>인구의 대규모 이동</em> : 도시 문제와 빈곤 문제 발생(' + lnk('u2-cheonggye', '서울 청계천의 판잣집') + ' · ' + lnk('u2-market', '시장 풍경') + ')',
      '<em>여성의 역할 변화</em> : 여성의 사회 활동 증가',
      '<em>교육열 증가</em> : 초등학교 의무 교육 실시, 공립 학교 신설 → 문맹률 하락(' + lnk('u2-school-graph', '초등학교 학생 수의 변화') + ' · ' + lnk('u2-school-text', '2부제·3부제 수업') + ' · ' + lnk('u2-outdoor-class', '운동장에서 수업받는 아이들') + ')',
      '미국식 대중 문화 유입(← 미국의 원조) → 기존 가치관과 충돌(' + lnk('u2-freedom-novel', '『자유 부인』 소설') + ' · ' + lnk('u2-freedom-poster', '영화 포스터') + ')'] },
  ], { figs: [fig('u2-cheonggye', 'cheonggye', '서울 청계천의 판잣집', '서울 청계천의 판잣집(1959)'), fig('u2-outdoor-class', 'outdoor-class', '운동장에서 수업받는 아이들', '교실이 파괴되어 운동장에서 수업받는 아이들(1953)')] });
P('u2-cheonggye', '서울 청계천의 판잣집(1959)', 'cheonggye', '');
P('u2-market', '6·25 전쟁 이후 시장 풍경', 'market', '');
P('u2-school-graph', '1945~1960년 초등학교 학생 수의 변화', 'school-graph', '『한국 사회 변혁 운동과 4월 혁명』, 1990.');
P('u2-school-text', '2부제·3부제 수업', 'school-text', '');
P('u2-outdoor-class', '교실이 파괴되어 운동장에서 수업받는 아이들(1953)', 'outdoor-class', '');
P('u2-freedom-novel', '『자유 부인』 소설', 'freedom-novel', '');
P('u2-freedom-poster', '『자유 부인』 영화 포스터', 'freedom-poster', '');

// ================= videos =================
const VID = [
  ['u2-v-war5', '한국전쟁(5분)', null],
  ['u2-v-rhee-exile', '이승만 정부, 한국전쟁 발발 직후 일본 망명 타진', 'hssWxSCNBAg'],
  ['u2-v-jangjin', '[스토리박스K] 성공한 후퇴 ‘장진호 전투’', 'fEcSj0ARIAY'],
  ['u2-v-pow', '[희귀영상] 한국전쟁 직후 포로교환 영상', null],
  ['u2-v-bodo', '국민보도연맹, ‘10만 학살’ 누가 명령했나', 'StrVNpwsia4'],
  ['u2-v-geochang', '거창양민학살사건', 'ABKXh5OzGP4'],
  ['u2-v-nds', '국민방위군 사건(선을 넘는 녀석들)', null],
  ['u2-v-busan', '한국현대사 부산정치파동', null],
  ['u2-v-cho', '[기억록]박원상, 조봉암을 기억하여 기록하다.', 'rpxYcnjNECI'],
  ['u2-v-kimil', '한국전쟁 이후 김일성의 북한 권력 장악 과정', null],
];
const popupJs = [];
const WIDE = new Set(["u2-war-map","u2-war-summary","u2-assembly54","u2-constitution55","u2-us-aid-table","u2-nk-plan-table","u2-bodo-textbook","u2-bodo-truth","u2-bodo-history","u2-bodo-scene","u2-bodo-testimony","u2-bodo-betray","u2-bodo-loyal","u2-school-text","u2-armistice-text"]);
pops.forEach(([key, title, file, cap]) => { const im = "IMG('assets/" + file + "'," + JSON.stringify(title) + ")"; const inner = WIDE.has(key) ? "'<div class=\"wide2\">' + " + im + " + '</div>'" : im; popupJs.push("  '" + key + "': { title: " + JSON.stringify(title) + ", html: " + inner + (cap ? " + `<p class=\"modal-caption\">" + cap + "</p>`" : "") + " },"); });
VID.forEach(([key, title, id]) => {
  if (id) popupJs.push(`  '${key}': { title: ${JSON.stringify(/영상$/.test(title) ? title : title + ' (영상)')}, html: () => ytHtml('${id}', ${JSON.stringify(title + ' 영상')}) },`);
  else popupJs.push(`  '${key}': { title: ${JSON.stringify(/영상$/.test(title) ? title : title + ' (영상)')}, html: \`<p class="modal-caption" style="margin-top:0">아직 영상 주소가 연결되지 않았습니다.<br>교사 모드의 [영상 주소] 버튼에서 유튜브 주소를 입력하면 이 자리에 영상이 나옵니다.<br>수업 PPT의 영상 : ${title}</p>\` },`);
});
fs.writeFileSync(__dirname + '/new_slides5.html', slides.join('\n'));
fs.writeFileSync(__dirname + '/new_popups5.js', popupJs.join('\n'));
fs.writeFileSync(__dirname + '/vid5.json', JSON.stringify(VID));
console.log('slides', slides.length, 'popups', popupJs.length);
