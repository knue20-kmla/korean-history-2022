// builds the 2-1 "냉전 체제와 대한민국 정부 수립" pages (slides s8..s17), their popups and the extra css
const fs = require('fs');
const COL = { g: '#d8ad62', t: '#73b8ae', n: '#a9b4c1', r: '#ff8f7a', b: '#7fb2ff', v: '#be96ff' };

// ---------- diagram helper (same classes as the 19-2 page: dg / dg-n / dg-p / dg-group / dg-note) ----------
function dg(id, w, h, items, style) {
  const used = new Set();
  const lines = [];
  const dom = [];
  items.forEach(it => {
    if (it.k === 'l' || it.k === 'path') used.add(it.c);
    if (it.k === 'l') {
      lines.push(`<line x1="${it.x1}" y1="${it.y1}" x2="${it.x2}" y2="${it.y2}" stroke="${COL[it.c]}" stroke-width="2.6"${it.dash ? ' stroke-dasharray="7 6"' : ''}${it.nohead ? '' : ` marker-end="url(#${id}-${it.c})"`}${it.both ? ` marker-start="url(#${id}-${it.c})"` : ''}/>`);
    } else if (it.k === 'path') {
      lines.push(`<path d="${it.d}" fill="none" stroke="${COL[it.c]}" stroke-width="2.6"${it.dash ? ' stroke-dasharray="7 6"' : ''} stroke-linejoin="round"${it.nohead ? '' : ` marker-end="url(#${id}-${it.c})"`}/>`);
    } else if (it.k === 'group') {
      dom.push(`<div class="dg-group ${it.c || ''}" style="left:${it.x}px;top:${it.y}px;width:${it.w}px;height:${it.h}px"></div>`);
    } else if (it.k === 'n') {
      dom.push(`<div class="dg-n ${it.c || 'n'}" style="left:${it.x}px;top:${it.y}px;width:${it.w}px;height:${it.h}px">${it.t}</div>`);
    } else if (it.k === 'p') {
      dom.push(`<span class="dg-p ${it.c || 'n'}" style="left:${it.x}px;top:${it.y}px">${it.t}</span>`);
    } else if (it.k === 'note') {
      dom.push(`<div class="dg-note" style="left:${it.x}px;top:${it.y}px;width:${it.w}px">${it.t}</div>`);
    }
  });
  const defs = [...used].map(c => `<marker id="${id}-${c}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${COL[c]}"/></marker>`).join('');
  // groups first (they sit behind everything), then the arrows, then boxes
  const groups = dom.filter(s => s.startsWith('<div class="dg-group')), rest = dom.filter(s => !s.startsWith('<div class="dg-group'));
  return `<div class="dg" style="width:${w}px;height:${h}px;${style || ''}">${groups.join('')}<svg class="dg-lines" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true"><defs>${defs}</defs>${lines.join('')}</svg>${rest.join('')}</div>`;
}
const N = (c, x, y, w, h, t) => ({ k: 'n', c, x, y, w, h, t });
const P = (c, x, y, t) => ({ k: 'p', c, x, y, t });
const G = (c, x, y, w, h) => ({ k: 'group', c, x, y, w, h });
const L = (x1, y1, x2, y2, c, o) => Object.assign({ k: 'l', x1, y1, x2, y2, c }, o || {});
const PA = (d, c, o) => Object.assign({ k: 'path', d, c }, o || {});
const NOTE = (x, y, w, t) => ({ k: 'note', x, y, w, t });
const lnk = (key, t) => `<span class="lnk" data-popup="${key}">${t}</span>`;
const links = arr => arr.map(([k, t]) => lnk(k, t)).join('<span class="dg-sep"> · </span>');
const head = (sid, title, tagNo, tagTxt, lead) => `<section class="slide" hidden data-sid="${sid}" data-title="${title}">
  <div class="stage">
    <p class="eyebrow">01</p>
    <h2 class="heading">8·15 광복과 냉전의 시대를 맞이하다</h2>
    <div class="section-tag"><b>${tagNo}</b> ${tagTxt}</div>${lead ? `\n    <p class="lead">${lead}</p>` : ''}`;
const fig = (key, src, alt, cap, sm) => `<div class="fig${sm ? ' sm' : ''}" role="button" tabindex="0" data-popup="${key}"><img src="assets/${src}" alt="${alt}"><figcaption><b>${cap}</b></figcaption></div>`;
const tail = `
  </div>
</section>
`;

const slides = [];

// ---------- s8 : unit page ----------
slides.push(`<section class="slide unit" hidden data-sid="s8" data-title="2-1 냉전 체제와 대한민국 정부 수립">
  <div class="stage">
    <p class="eyebrow">2-1</p>
    <h2 class="heading">냉전 체제와 대한민국 정부 수립</h2>
    <p class="lead">제2차 세계 대전 이후 <em>미국과 소련을 중심으로 냉전 체제가 형성</em>되는 가운데, 광복을 맞은 한반도는 38도선을 경계로 분할 점령되어 <em>건국 준비와 좌우 대립</em> 전개.</p>
    <ol class="points">
      <li class="point"><span class="num">01</span><div><h3>8·15 광복과 냉전의 시대를 맞이하다</h3><p>냉전 체제의 형성, 8·15 광복과 한반도 분할 점령, 조선 건국 준비 위원회 결성, 미소 군정의 실시, 모스크바 3국 외상 회의와 좌우 대립</p></div></li>
      <li class="point soon"><span class="num">02</span><div><h3>통일 정부를 수립하려고 노력하다</h3><p>수업 자료 준비 중</p></div></li>
      <li class="point soon"><span class="num">03</span><div><h3>대한민국 정부를 수립하다</h3><p>수업 자료 준비 중</p></div></li>
      <li class="point soon"><span class="num">04</span><div><h3>친일파 청산과 농지 개혁을 추진하다</h3><p>수업 자료 준비 중</p></div></li>
    </ol>
  </div>
</section>
`);

// ---------- s9 : 국제 연합 창설 ----------
slides.push(head('s9', '01-1 냉전 체제의 형성 ① 국제 연합 창설', 1, '냉전 체제의 형성', '제2차 세계 대전이 끝난 뒤 <em>전범 처리와 전쟁 방지 노력</em>이 이어지며 국제 연합 창설.') + `
    <div class="split"><div class="cat-wrap">
      <div class="cat">
        <div class="cat-label"><b>제2차 세계 대전<br>전후 처리</b></div>
        <div class="cat-rows">
          <div class="cat-row">
            <button class="cat-name" type="button" data-popup="tokyo-trial">전범 처리</button>
            <div class="cat-body">
              <p class="desc">뉘른베르크 전범 재판, 도쿄 전범 재판(극동 국제 전범 재판).</p>
              <div class="chips"><button class="chip" type="button" data-popup="tokyo-trial">극동 국제 군사 재판</button></div>
            </div>
          </div>
          <div class="cat-row">
            <div class="cat-name">전쟁 방지 노력</div>
            <div class="cat-body">
              <p class="desc">대서양 헌장(1941)에서 국제 평화 기구 설립 구상. 샌프란시스코 회의에서 국제 연합 헌장 제정.</p>
            </div>
          </div>
        </div>
      </div>
      <ol class="points">
        <li class="point"><span class="num">→</span><div>
          <h3>국제 연합 창설(1945)</h3>
          <p>총회 및 여러 이사회, 산하 기구 설치. 안전 보장 이사회 5개 상임 이사국의 거부권 행사. 국제 분쟁 해결을 위한 무력 사용 가능(유엔군).</p>
          <div class="chips"><button class="chip" type="button" data-popup="un-charter">국제 연합 헌장</button></div>
        </div></li>
      </ol></div>
      <aside class="aside">
        ${fig('un-charter', 'c21-un-charter.png', '국제 연합(UN) 헌장', '국제 연합(UN) 헌장', true)}
        ${fig('tokyo-trial', 'c21-tokyo-photo.png', '극동 국제 군사 재판', '극동 국제 군사 재판', true)}
      </aside></div>` + tail);

// ---------- s10 : 냉전의 시작 (diagram) ----------
{
  const items = [
    N('t', 0, 0, 190, 44, '냉전 체제 형성'),
    N('g strong', 230, 0, 680, 44, '미국 중심의 자본주의 진영 vs 소련 중심의 사회주의 진영'),
    L(190, 22, 230, 22, 'g'),
    N('n', 230, 70, 680, 40, '동유럽 지역에서 소련의 지원을 받는 사회주의 정권 수립'),
    L(570, 44, 570, 70, 'g'),
    G('b', 0, 140, 540, 270), P('b', 270, 140, '미국 : 공산주의 팽창 저지'),
    G('r', 600, 140, 540, 270), P('r', 870, 140, '소련'),
    L(270, 110, 270, 127, 'n'), L(870, 110, 870, 127, 'n'),
    N('b', 30, 184, 480, 46, '트루먼 독트린(1947)'),
    N('b', 30, 262, 480, 46, '유럽 부흥 계획(마셜 플랜, 1947)'),
    L(270, 230, 270, 262, 'b'),
    N('r', 630, 184, 480, 46, '코민포름(1947, 공산당 정보국)'),
    N('r', 630, 262, 480, 46, '소련의 베를린 봉쇄 정책(1948)'),
    N('r', 630, 340, 480, 46, 'COMECON(1949, 공산권 경제 상호 원조 회의)'),
    L(870, 230, 870, 262, 'r'), L(870, 308, 870, 340, 'r'),
    L(548, 260, 592, 260, 'n', { both: true }),
    N('g strong', 470, 438, 200, 44, '냉전 심화'),
    L(270, 410, 480, 456, 'n'), L(870, 410, 660, 456, 'n'),
    N('b', 0, 512, 540, 46, '미국 : 북대서양 조약 기구(NATO, 1949)'),
    N('r', 600, 512, 540, 46, '소련 : 바르샤바 조약 기구(WTO, 1955)'),
    L(548, 535, 592, 535, 'g', { both: true }),
    L(570, 482, 570, 527, 'g'),
    NOTE(0, 590, 1140, '자료 : ' + links([['truman', '트루먼 대통령의 의회 연설(1947)'], ['cartoon-sam', '냉전 체제의 형성 만평'], ['cartoon-ice', '냉전 풍자 만평(1947)']])),
  ];
  slides.push(head('s10', '01-1 냉전 체제의 형성 ② 냉전의 시작과 심화', 1, '냉전 체제의 형성', '<em>미국 중심의 자본주의 진영과 소련 중심의 사회주의 진영</em>의 대립으로 냉전 체제 형성.') + '\n    ' + dg('d10', 1140, 618, items) + tail);
}

// ---------- s11 : 동아시아의 열전 ----------
slides.push(head('s11', '01-1 냉전 체제의 형성 ③ 동아시아의 열전', 1, '냉전 체제의 형성', '유럽에서 냉전 체제가 심화되자 동아시아에서는 군사적 충돌인 <em>‘열전’</em> 발생.') + `
    <div class="split"><div class="cat-wrap">
      <div class="cat">
        <div class="cat-label"><b>동아시아에서<br>‘열전’</b></div>
        <div class="cat-rows">
          <div class="cat-row">
            <div class="cat-name">중국</div>
            <div class="cat-body"><p class="desc">국공 내전(4년) 발생 → 중화 인민 공화국 탄생, 중화민국의 타이완 이동.</p></div>
          </div>
          <div class="cat-row">
            <div class="cat-name">베트남</div>
            <div class="cat-body"><p class="desc">1차 인도차이나 전쟁(1948) → 남, 북 베트남 분단.</p></div>
          </div>
          <div class="cat-row">
            <div class="cat-name">한국</div>
            <div class="cat-body"><p class="desc"><em>6·25 전쟁(한국 전쟁, 1950)</em>.</p></div>
          </div>
        </div>
      </div>
      <ol class="points">
        <li class="point"><span class="num">→</span><div>
          <h3>동아시아의 공산주의 팽창 저지 필요</h3>
          <p>일본의 반공 거점 기지화. 샌프란시스코 강화 조약(1951) : 연합군의 일본 점령 종료와 일본의 국제 사회 복귀. 6·25 전쟁의 <em>전쟁 특수</em>로 일본의 경제적 성장.</p>
          <div class="chips"><button class="chip" type="button" data-popup="eastasia-map">동아시아의 냉전 지도</button><button class="chip" type="button" data-popup="coldwar-map">냉전 체제의 전개 지도</button></div>
        </div></li>
      </ol></div>
      <aside class="aside">
        ${fig('sanfrancisco', 'c21-sanfrancisco.png', '샌프란시스코 강화 조약 서명', '샌프란시스코 강화 조약 서명')}
        ${fig('eastasia-map', 'c21-eastasia-map.png', '동아시아의 냉전', '동아시아의 냉전(1946~1950)')}
      </aside></div>` + tail);

// ---------- s12 : 광복의 역사적 의미 ----------
{
  const items = [
    N('g', 190, 0, 400, 44, '카이로, 얄타, 포츠담 회담에서 독립 약속'),
    N('n', 0, 120, 150, 48, '일본의 항복'),
    N('g', 220, 84, 360, 48, '우리 민족의 독립 운동의 결실'),
    N('t', 220, 170, 360, 48, '연합군 승리의 결과'),
    L(150, 144, 220, 108, 'n'), L(150, 144, 220, 194, 'n'),
    L(400, 84, 400, 44, 'g'),
    N('r', 190, 262, 400, 44, '미국, 소련 등 연합국의 한국 문제 결정'),
    L(400, 218, 400, 262, 'r'),
    N('g strong', 690, 120, 150, 48, '광복'),
    L(580, 108, 690, 140, 'g'), L(580, 194, 690, 148, 'g'),
  ];
  slides.push(head('s12', '01-2 8·15 광복과 한반도 분할 점령 ① 광복의 역사적 의미', 2, '8·15 광복과 한반도 분할 점령', '<em>(1) 광복의 역사적 의미</em> — 일본의 항복으로 맞이한 광복은 우리 민족 독립 운동의 결실이자 연합군 승리의 결과.') + `
    <div class="split"><div>${dg('d12', 860, 330, items, 'margin-left:0')}</div>
      <aside class="aside">
        ${fig('liberation-joy', 'c21-liberation-joy.png', '광복의 기쁨', '광복의 기쁨')}
      </aside></div>` + tail);
}

// ---------- s13 : 38도선 획정과 분할 점령 ----------
{
  const items = [
    N('g', 0, 0, 600, 48, '얄타 회담(1945. 2.) : 소련의 태평양 전쟁 참전 약속(3개월 이내)'),
    N('r', 0, 84, 600, 48, '소련군의 대일 선전 포고(1945. 8. 9.)'),
    NOTE(630, 90, 240, '만주와 한반도 북부에서 일본군 무장 해체 후 빠른 진격'),
    N('b', 0, 168, 600, 48, '미국의 38도선 경계 분할 점령 제안'),
    P('r', 710, 192, '소련의 수락'),
    N('g strong', 0, 252, 600, 48, '미소의 군사적 편의에 따른 한반도 분할 결정'),
    N('n', 0, 336, 600, 48, '미소의 남북한 분할 점령 및 통치'),
    L(300, 48, 300, 84, 'g'), L(300, 132, 300, 168, 'r'),
    L(600, 192, 650, 192, 'b'),
    PA('M710,206 V276 H600', 'r'),
    L(300, 300, 300, 336, 'g'),
    NOTE(0, 410, 880, '자료 : ' + links([['rusk', '미국과 소련의 38도선 분할 점령(사료)'], ['welcome', '미·소 양군을 환영하는 한국인'], ['line38-village', '38도선이 그어진 마을'], ['line38-crossing', '38도선을 넘는 주민들'], ['line38-story', '38도선, 민족의 분단선이 되기까지']])),
  ];
  slides.push(head('s13', '01-2 8·15 광복과 한반도 분할 점령 ② 38도선 획정과 분할 점령', 2, '8·15 광복과 한반도 분할 점령', '<em>(2) 38도선 획정과 분할 점령</em> — 미소의 군사적 편의에 따라 한반도 분할 결정.') + `
    <div class="split"><div>${dg('d13', 880, 450, items, 'margin-left:0')}</div>
      <aside class="aside">
        ${fig('rusk', 'c21-rusk.png', '미국과 소련의 38도선 분할 점령', '사료 읽기 — 미국과 소련의 38도선 분할 점령', true)}
        ${fig('line38-crossing', 'c21-line38-crossing.png', '38도선을 넘는 주민들', '38도선을 넘는 주민들(1947)', true)}
      </aside></div>` + tail);
}

// ---------- s14 : 조선 건국 준비 위원회 ----------
{
  const items = [
    G('g', 0, 0, 790, 560), P('g', 60, 0, '좌익 + 중도파'),
    G('b', 820, 0, 320, 560), P('b', 880, 0, '우익 계열'),
    N('t', 30, 30, 190, 46, '조선 건국 동맹'),
    N('n', 260, 30, 150, 46, '일본의 항복'),
    N('n', 450, 30, 310, 46, '총독부로부터 행정권과 치안권 인수'),
    L(220, 53, 260, 53, 'n', { nohead: true }), L(410, 53, 450, 53, 'n'),
    N('g', 500, 108, 240, 44, '안재홍 등 우익 합류'),
    L(605, 76, 605, 108, 'g', { nohead: true }),
    N('b strong', 30, 190, 270, 50, '조선 건국 준비 위원회'),
    PA('M500,130 H165 V190', 'g'),
    N('n', 340, 176, 420, 36, '좌우 연합체적 성격'),
    N('n', 340, 220, 420, 36, '각 지방에 지부(145) 설치, 치안대 조직 → 사회 질서 유지'),
    N('r', 60, 292, 210, 44, '조선 공산당 합류'),
    N('n', 340, 292, 420, 44, '좌익 세력이 건준 장악(건준의 좌경화)'),
    L(165, 240, 165, 292, 'b'),
    N('b', 60, 372, 270, 44, '안재홍 등 우익 세력 이탈'),
    N('n', 360, 372, 400, 44, '→ 안재홍 조선 국민당(1945. 9.) 창당'),
    L(165, 336, 165, 372, 'r'),
    N('g strong', 30, 456, 310, 48, '조선 인민 공화국(1945. 9.) 수립'),
    N('n', 370, 456, 390, 48, '→ 미군 상륙 대비 정치적 대표성 확보 목적'),
    L(185, 416, 185, 456, 'b'),
    N('n', 850, 48, 260, 54, '미군정에 협조적'),
    N('n', 850, 160, 260, 54, '건준과 인공에 비판적'),
    N('n', 850, 272, 260, 54, '임정 봉대론 주장'),
    N('b strong', 850, 388, 260, 50, '한민당(1945. 9.)'),
    L(980, 102, 980, 160, 'b', { nohead: true }), L(980, 214, 980, 272, 'b', { nohead: true }), L(980, 326, 980, 388, 'b'),
    L(762, 480, 852, 196, 'r', { dash: true }),
    NOTE(0, 586, 1140, '자료 : ' + links([['geonjun-org', '건준의 조직과 활동'], ['geonjun-decl', '건준 선언(1945)'], ['geonjun-leaders', '여운형과 안재홍']])),
  ];
  slides.push(head('s14', '01-3 조선 건국 준비 위원회 결성', 3, '조선 건국 준비 위원회 결성', '조선 건국 동맹에 안재홍 등 우익이 합류하여 <em>조선 건국 준비 위원회(건준)</em> 결성.') + '\n    ' + dg('d14', 1140, 610, items) + tail);
}

// ---------- s15 : 미소 군정의 실시 ----------
{
  const items = [
    G('r', 0, 0, 1140, 232), P('r', 70, 0, '북한 · 소련군'),
    G('b', 0, 262, 1140, 262), P('b', 70, 262, '남한 · 미군'),
    N('r strong', 20, 78, 180, 56, '소련의 북한 통치'),
    P('r', 110, 160, '간접 통치 방식'),
    N('n', 250, 66, 330, 80, '민중의 지지를 위해 지방 인민 위원회에 통치권 이양'),
    N('r', 640, 66, 220, 80, '사회주의 세력의 정권 장악 지원'),
    N('r', 910, 66, 210, 80, '북조선 임시 인민위원회 수립(1946. 2.)'),
    N('g', 910, 168, 210, 54, '토지 개혁, 친일 청산 등 북한 지방 개혁 주도'),
    L(580, 106, 640, 106, 'r'), L(860, 106, 910, 106, 'r'), L(1015, 146, 1015, 168, 'r'),
    N('b strong', 20, 338, 180, 56, '미국의 남한 통치'),
    P('b', 110, 420, '직접 통치 방식'),
    N('n', 250, 298, 330, 54, '조선 인민 공화국, 인민위원회, 임시정부 불인정'),
    N('n', 250, 366, 330, 54, '기존 총독부의 통치 체제와 방식 활용'),
    P('n', 415, 450, '현상 유지 목적'),
    L(200, 366, 250, 325, 'b'), L(200, 366, 250, 393, 'b'),
    L(200, 106, 250, 106, 'r'),
    L(415, 420, 415, 437, 'n', { nohead: true }),
    N('b', 250, 476, 330, 36, '우익 인사(한민당)와 친일 세력 등용'),
    L(415, 463, 415, 476, 'n'),
    N('b', 640, 466, 220, 56, '미군정의 직접 통치 지속'),
    N('g', 910, 466, 210, 56, '토지 개혁, 친일 청산 등 지연'),
    L(580, 494, 640, 494, 'b'), L(860, 494, 910, 494, 'b'),
    NOTE(0, 548, 1140, '자료 : ' + links([['benninghoff', '재한국 정치 고문 베닝호프의 서한(1945. 9. 15.)'], ['usamgj-policy', '미군정청의 기본 정책'], ['flag-change', '일장기에서 성조기로']])),
  ];
  slides.push(head('s15', '01-4 미소 군정의 실시', 4, '미소 군정의 실시', '<em>소련은 간접 통치, 미국은 직접 통치</em> 방식으로 남북한에서 군정 실시.') + '\n    ' + dg('d15', 1140, 580, items) + tail);
}

// ---------- s16 : 모스크바 3국 외상 회의 ----------
slides.push(head('s16', '01-5 모스크바 3국 외상 회의와 신탁 통치', 5, '모스크바 3국 외상 회의와 좌우 대립', '모스크바 3국 외상 회의(1945. 12.)에서 미·영·소 3국 외상이 참여하여 <em>한반도 문제</em> 논의.') + `
    <div class="split"><ol class="points">
      <li class="point"><span class="num">1</span><div>
        <h3>한반도에 임시 민주 정부 수립</h3>
        <p>민주적 정당·사회단체와 협의하여 조선 임시 정부 수립.</p>
      </div></li>
      <li class="point"><span class="num">2</span><div>
        <h3>미소 공동 위원회 설치</h3>
        <p>임시 민주 정부 수립을 지원할 미소 공동 위원회 설치.</p>
      </div></li>
      <li class="point"><span class="num">3</span><div>
        <h3>최대 5년간 신탁(후견) 통치 실시</h3>
        <p>미·영·중·소 4대국에 의한 신탁 통치 실시(최장 5년). 이후 독립 국가 수립.</p>
        <div class="chips"><button class="chip" type="button" data-popup="moscow-decision">결정서(자료 1)</button><button class="chip" type="button" data-popup="moscow-report">동아일보 보도(자료 2)</button><button class="chip" type="button" data-popup="trusteeship-flow">한국 문제 해결 방안</button></div>
      </div></li>
    </ol><aside class="aside">
      ${fig('moscow-newspaper', 'c21-moscow-news.png', '모스크바 3국 외상 회의 결과를 보도한 신문 기사', '모스크바 3국 외상 회의 결과를 보도한 신문 기사', true)}
      ${fig('trusteeship-flow', 'c21-trusteeship-flow.png', '모스크바 3국 외상 회의 결정에 따른 한국 문제 해결 방안', '한국 문제 해결 방안', true)}
    </aside></div>` + tail);

// ---------- s17 : 좌우 대립 ----------
{
  const items = [
    N('r strong', 420, 0, 300, 40, '모스크바 3국 외상 회의 결정'),
    G('b', 0, 66, 500, 246), P('b', 70, 66, '우익 계열'),
    G('r', 640, 66, 500, 246), P('r', 710, 66, '좌익 계열'),
    L(470, 40, 250, 66, 'n'), L(670, 40, 890, 66, 'n'),
    N('n', 40, 98, 420, 34, '반탁 운동 전개'),
    N('n', 40, 154, 420, 34, '반소반공, 즉시 독립 주장'),
    N('b', 40, 210, 420, 34, '비상 국민 회의 (김구, 이승만 등)'),
    N('b', 40, 266, 420, 34, '민주의원 (미군정 자문 기관)'),
    L(250, 132, 250, 154, 'b'), L(250, 188, 250, 210, 'b'), L(250, 244, 250, 266, 'b'),
    N('n', 680, 98, 420, 34, '반탁 운동 전개'),
    N('n', 680, 154, 420, 34, '3상 회의의 총체적 지지 주장'),
    N('r', 680, 210, 420, 34, '민주주의 민족 전선 (조선 공산당 중심)'),
    L(890, 132, 890, 154, 'r'), L(890, 188, 890, 210, 'r'),
    P('g', 250, 336, '신탁 통치에 초점'), P('g', 890, 336, '민주적 임시정부 수립에 초점'),
    L(508, 190, 632, 190, 'r', { both: true }), P('r', 570, 222, '좌우 대립 격화'),
    G('g', 300, 374, 540, 122), P('g', 570, 374, '중도 계열'),
    N('n', 340, 400, 460, 36, '신탁 통치 반대'),
    N('n', 340, 444, 460, 40, '임시 민주 정부 수립 위해 미소 공동 위원회 협조'),
    N('g strong', 300, 522, 540, 44, '미군정의 반탁 운동 지지'),
    L(570, 496, 570, 522, 'g'),
    N('g', 900, 508, 240, 38, '우익의 정치적 주도권 장악'),
    N('g', 900, 554, 240, 38, '친일파의 애국 세력 부활'),
    L(840, 538, 900, 527, 'g'), L(840, 550, 900, 573, 'g'),
    NOTE(0, 606, 1140, '자료 : ' + links([['antitrust', '신탁 통치 반대 운동(자료 ①·②)'], ['pro-moscow', '모스크바 3국 외상 회의 결정 지지(자료 ③·④)'], ['lr-cartoon', '좌우익의 대립 만화']])),
  ];
  slides.push(head('s17', '01-5 모스크바 3국 외상 회의와 좌우 대립', 5, '모스크바 3국 외상 회의와 좌우 대립', '모스크바 3국 외상 회의 결정을 둘러싸고 <em>좌우 대립 격화</em>.') + '\n    ' + dg('d17', 1140, 636, items) + tail);
}

fs.writeFileSync(__dirname + '/new_slides.html', slides.join('\n'));

// ---------- popups ----------
const IMGP = (src, alt) => "IMG('assets/" + src + "','" + alt + "')";
const pop = (key, title, src, alt, cap) => "  '" + key + "': { title: '" + title + "', html: " + IMGP(src, alt) + (cap ? ' + `<p class="modal-caption">' + cap + '</p>`' : '') + ' },';
const popups = [
  pop('un-charter', '국제 연합(UN) 헌장', 'c21-un-charter.png', '국제 연합 헌장'),
  pop('tokyo-trial', '극동 국제 군사 재판(도쿄 재판)', 'c21-tokyo-trial.png', '극동 국제 군사 재판'),
  pop('truman', '미국 트루먼 대통령의 의회 연설(1947)', 'c21-truman.png', '트루먼 대통령의 의회 연설', '트루먼 독트린 : 미국의 공산주의 팽창 저지 정책.'),
  pop('cartoon-sam', '냉전 체제의 형성 만평', 'c21-cartoon-sam.png', '샘 아저씨와 곰 만평'),
  pop('cartoon-ice', '냉전 풍자 만평(『만화행진』, 1947. 9.)', 'c21-cartoon-ice.png', '냉전 풍자 만평'),
  pop('sanfrancisco', '샌프란시스코 강화 조약 서명(1951)', 'c21-sanfrancisco.png', '샌프란시스코 강화 조약에 서명하는 일본 총리'),
  pop('eastasia-map', '동아시아의 냉전(1946~1950)', 'c21-eastasia-map.png', '동아시아의 냉전'),
  pop('coldwar-map', '냉전 체제의 전개', 'c21-coldwar-map.png', '냉전 체제의 전개'),
  pop('liberation-joy', '광복의 기쁨', 'c21-liberation-joy.png', '광복의 기쁨'),
  pop('rusk', '사료 읽기 — 미국과 소련의 38도선 분할 점령', 'c21-rusk.png', '딘 러스크의 회고 진술'),
  pop('welcome', '미·소 양군을 환영하는 한국인', 'c21-welcome.png', '평양에 진주한 소련군과 부산에 진주한 미군을 환영하는 주민들'),
  pop('line38-village', '38도선이 그어진 마을', 'c21-line38-village.png', '38도선이 그어진 마을'),
  pop('line38-crossing', '38도선을 넘는 주민들(1947)', 'c21-line38-crossing.png', '38도선을 넘는 주민들'),
  pop('line38-story', '38도선, 민족의 분단선이 되기까지', 'c21-line38-story.png', '38도선, 민족의 분단선이 되기까지'),
  pop('geonjun-org', '조선 건국 준비 위원회(건준)의 조직과 활동', 'c21-geonjun-org.png', '건준의 조직과 활동'),
  pop('geonjun-decl', '조선 건국 준비 위원회 선언(1945)', 'c21-geonjun-declaration.png', '조선 건국 준비 위원회 선언'),
  pop('geonjun-leaders', '여운형과 안재홍', 'c21-geonjun-leaders.png', '여운형(왼쪽)과 안재홍(오른쪽)', '여운형(왼쪽)과 안재홍(오른쪽).'),
  pop('benninghoff', '재한국 정치 고문 베닝호프가 미국 국무 장관에게(1945. 9. 15.)', 'c21-benninghoff.png', '베닝호프의 서한'),
  pop('usamgj-policy', '미군정청의 기본 정책', 'c21-usamgj-policy.png', '미군정청의 기본 정책'),
  pop('flag-change', '일장기에서 성조기로', 'c21-flag-change.png', '조선 총독부 청사의 일장기가 내려가고 성조기가 올라가는 모습'),
  pop('moscow-decision', '자료 1 — 모스크바 3국 외상 회의 결정서(1945. 12.)', 'c21-moscow-docs-left.png', '모스크바 3국 외상 회의 결정서'),
  pop('moscow-report', '자료 2 — 모스크바 3국 외상 회의 결정에 대한 보도', 'c21-moscow-docs-right.png', '모스크바 3국 외상 회의 결정에 대한 보도'),
  pop('moscow-newspaper', '모스크바 3국 외상 회의 결과를 보도한 신문 기사', 'c21-moscow-news.png', '동아일보 기사'),
  pop('trusteeship-flow', '모스크바 3국 외상 회의 결정에 따른 한국 문제 해결 방안', 'c21-trusteeship-flow.png', '한국 문제 해결 방안'),
  pop('antitrust', '신탁 통치 반대 운동(자료 ①·②)', 'c21-antitrust-docs.png', '신탁 통치 반대 국민 총동원 시위 대회 선언문과 전국 대회'),
  pop('pro-moscow', '모스크바 3국 외상 회의 결정 지지(자료 ③·④)', 'c21-pro-docs.png', '모스크바 3국 외상 회의 지지 담화문과 지지 대회'),
  pop('lr-cartoon', '좌우익의 대립', 'c21-left-right-cartoon.png', '3상 결정 총체적 지지(좌익)와 신탁 통치 절대 반대(우익)'),
];
fs.writeFileSync(__dirname + '/new_popups.js', popups.join('\n'));
console.log('slides:', slides.length, 'popups:', popups.length);
