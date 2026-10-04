const fs = require('fs'), path = require('path');
const base = path.join(__dirname, 'x', 'ppt');
const dec = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
const slideFiles = fs.readdirSync(path.join(base, 'slides')).filter(f => /^slide\d+\.xml$/.test(f)).sort((a, b) => parseInt(a.slice(5)) - parseInt(b.slice(5)));
// presentation order
const pres = fs.readFileSync(path.join(base, 'presentation.xml'), 'utf8');
const presRels = fs.readFileSync(path.join(base, '_rels', 'presentation.xml.rels'), 'utf8');
const relMap = {}; [...presRels.matchAll(/<Relationship [^>]*?Id="([^"]+)"[^>]*?Target="([^"]+)"/g)].forEach(m => relMap[m[1]] = m[2]);
const order = [...pres.matchAll(/<p:sldId [^>]*?r:id="([^"]+)"/g)].map(m => relMap[m[1]]);
let out = '';
order.forEach((target, idx) => {
  const f = path.basename(target);
  const xml = fs.readFileSync(path.join(base, 'slides', f), 'utf8');
  const relsPath = path.join(base, 'slides', '_rels', f + '.rels');
  const rels = {};
  if (fs.existsSync(relsPath)) [...fs.readFileSync(relsPath, 'utf8').matchAll(/<Relationship ([^>]*?)\/?>/g)].forEach(m => {
    const id = /Id="([^"]+)"/.exec(m[1]), t = /Target="([^"]+)"/.exec(m[1]), mode = /TargetMode="([^"]+)"/.exec(m[1]);
    if (id && t) rels[id[1]] = t[1] + (mode ? ' [' + mode[1] + ']' : '');
  });
  out += `\n===== SLIDE ${idx + 1} (${f}) =====\n`;
  // walk shapes in doc order
  const re = /<p:(sp|pic|graphicFrame|cxnSp)\b[\s\S]*?<\/p:\1>/g;
  let m;
  while ((m = re.exec(xml))) {
    const kind = m[1], s = m[0];
    const off = /<a:off x="(-?\d+)" y="(-?\d+)"\/>/.exec(s), ext = /<a:ext cx="(\d+)" cy="(\d+)"\/>/.exec(s);
    const pos = off && ext ? `@${Math.round(off[1] / 12700)},${Math.round(off[2] / 12700)} ${Math.round(ext[1] / 12700)}x${Math.round(ext[2] / 12700)}` : '';
    const name = (/<p:cNvPr [^>]*?name="([^"]*)"/.exec(s) || [])[1] || '';
    if (kind === 'pic') {
      const e = /r:embed="([^"]+)"/.exec(s);
      out += `[PIC ${name}] ${pos} -> ${e ? rels[e[1]] : '?'}\n`;
      continue;
    }
    if (kind === 'cxnSp') { out += `[LINE ${name}] ${pos}\n`; continue; }
    if (kind === 'graphicFrame') {
      const rows = [...s.matchAll(/<a:tr\b[\s\S]*?<\/a:tr>/g)].map(r => [...r[0].matchAll(/<a:tc\b[\s\S]*?<\/a:tc>/g)].map(c => dec([...c[0].matchAll(/<a:t>([^<]*)<\/a:t>/g)].map(x => x[1]).join(''))));
      if (rows.length) { out += `[TABLE ${name}] ${pos}\n` + rows.map(r => '  | ' + r.join(' | ')).join('\n') + '\n'; }
      else out += `[FRAME ${name}] ${pos}\n`;
      continue;
    }
    const paras = [...s.matchAll(/<a:p>[\s\S]*?<\/a:p>|<a:p [\s\S]*?<\/a:p>/g)].map(p => {
      const lvl = (/<a:pPr[^>]*?lvl="(\d+)"/.exec(p[0]) || [])[1];
      const link = /<a:hlinkClick [^>]*?r:id="([^"]+)"/.exec(p[0]);
      const txt = dec([...p[0].matchAll(/<a:t>([^<]*)<\/a:t>/g)].map(x => x[1]).join(''));
      return txt ? `${lvl ? '  '.repeat(+lvl) : ''}${txt}${link ? '  <<LINK ' + rels[link[1]] + '>>' : ''}` : '';
    }).filter(Boolean);
    const blip = /<a:blip r:embed="([^"]+)"/.exec(s);
    if (paras.length || blip) out += `[${name}] ${pos}${blip ? ' (fill-img ' + rels[blip[1]] + ')' : ''}\n` + paras.map(p => '   ' + p).join('\n') + (paras.length ? '\n' : '');
  }
  // notes
  const nrel = Object.values(rels).find(t => /notesSlide/.test(t));
  if (nrel) {
    const np = path.join(base, 'slides', nrel);
    if (fs.existsSync(np)) {
      const nx = fs.readFileSync(np, 'utf8');
      const nt = dec([...nx.matchAll(/<a:t>([^<]*)<\/a:t>/g)].map(x => x[1]).join(' ')).trim();
      if (nt) out += `[NOTES] ${nt}\n`;
    }
  }
  Object.entries(rels).filter(([k, v]) => /\[External\]/.test(v)).forEach(([k, v]) => out += `[EXT-REL ${k}] ${v}\n`);
});
fs.writeFileSync(path.join(__dirname, 'dump.txt'), out);
console.log('slides:', order.length, 'chars:', out.length);
