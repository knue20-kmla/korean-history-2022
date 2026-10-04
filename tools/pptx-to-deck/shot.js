// full-resolution screenshots of chosen slides through headless Edge (the in-app pane is too small to judge layout)
// usage: node cdp_shot.js <url> <outDir> <sid,sid,...> [width height] [teacher]
const { spawn } = require('child_process');
const fs = require('fs');
const [url, outDir, sidList, W = '1920', H = '1080', mode] = process.argv.slice(2);
const edge = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(p => fs.existsSync(p));
if (!edge) throw new Error('Edge not found');
fs.mkdirSync(outDir, { recursive: true });
const port = 9333 + Math.floor(Math.random() * 300);
const prof = require('os').tmpdir() + '/kh-edge-' + port;
const proc = spawn(edge, ['--headless=new', '--disable-gpu', '--remote-debugging-port=' + port, '--user-data-dir=' + prof, '--hide-scrollbars', '--window-size=' + W + ',' + H, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  let targets;
  for (let i = 0; i < 40; i++) { try { targets = await (await fetch('http://127.0.0.1:' + port + '/json')).json(); if (targets.find(t => t.type === 'page')) break; } catch (e) {} await sleep(250); }
  const page = targets.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r));
  let id = 0; const pending = {};
  ws.addEventListener('message', ev => { const m = JSON.parse(ev.data); if (m.id && pending[m.id]) { pending[m.id](m); delete pending[m.id]; } });
  const send = (method, params = {}) => new Promise(res => { const i = ++id; pending[i] = res; ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async expr => (await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })).result.result.value;
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: +W, height: +H, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url });
  await sleep(2500);
  await ev("localStorage.setItem('kmla-nav-open','" + (mode === 'nav' ? '1' : '0') + "'); 1");
  if (mode === 'nav') { await ev("document.body.classList.add('nav-open'); fitSlide(); 1"); }
  else { await ev("document.body.classList.remove('nav-open'); fitSlide(); 1"); }
  for (const sid of sidList.split(',')) {
    if (mode === 'popup') { await ev("closePopup(); openPopup('" + sid + "'); 1"); await sleep(900); const shot = await send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(outDir + '/popup-' + sid + '.png', Buffer.from(shot.result.data, 'base64')); console.log('popup', sid); continue; }
    await ev("show(slides.findIndex(s=>s.dataset.sid==='" + sid + "')); 1");
    if (mode === 'teacher') await ev("document.body.classList.add('teacher-mode'); 1");
    await sleep(700);
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(outDir + '/' + sid + '.png', Buffer.from(shot.result.data, 'base64'));
    console.log('shot', sid);
  }
  ws.close(); proc.kill();
  setTimeout(() => process.exit(0), 500);
})().catch(e => { console.error(e); proc.kill(); process.exit(1); });
