// Minimal static file server + image/video upload endpoint for the teacher-mode "파일에서 선택" feature.
// No external dependencies — plain Node http/fs.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const ROOT = __dirname;
const ASSETS_DIR = path.join(ROOT, 'assets');
const PORT = process.env.PORT || 8793;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.pdf': 'application/pdf'
};

function safeFileName(name) {
  const base = path.basename(name || 'file').replace(/[^\w.\-가-힣 ]/g, '_').trim() || 'file';
  return base;
}

function uniquePath(dir, fileName) {
  const ext = path.extname(fileName);
  const stem = path.basename(fileName, ext);
  let candidate = fileName;
  let i = 1;
  while (fs.existsSync(path.join(dir, candidate))) {
    candidate = `${stem}-${i}${ext}`;
    i++;
  }
  return candidate;
}

function serveStatic(req, res, pathname) {
  let filePath = path.join(ROOT, decodeURIComponent(pathname));
  if (pathname === '/' || pathname === '') filePath = path.join(ROOT, 'index.html');
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); res.end('forbidden'); return; }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('not found'); return; }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  });
}

function handleUpload(req, res, url) {
  const rawName = url.searchParams.get('name') || 'upload.bin';
  const chunks = [];
  let total = 0;
  const MAX = 60 * 1024 * 1024; // 60MB safety cap
  req.on('data', chunk => {
    total += chunk.length;
    if (total > MAX) { res.writeHead(413); res.end(JSON.stringify({ error: 'file too large' })); req.destroy(); return; }
    chunks.push(chunk);
  });
  req.on('end', () => {
    if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true });
    const fileName = uniquePath(ASSETS_DIR, safeFileName(rawName));
    fs.writeFile(path.join(ASSETS_DIR, fileName), Buffer.concat(chunks), err => {
      if (err) { res.writeHead(500); res.end(JSON.stringify({ error: String(err) })); return; }
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ path: 'assets/' + fileName }));
    });
  });
}

// Teacher-mode layout is kept in a real file next to the pages (saved-layout.json), so it survives browsers/computers and can be read when the page is edited.
const STATE_FILE = path.join(ROOT, 'saved-layout.json');
function handleState(req, res) {
  const json = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };
  if (req.method === 'GET') {
    fs.readFile(STATE_FILE, (err, data) => {
      if (err) { res.writeHead(404, json); res.end('{}'); return; }
      res.writeHead(200, json); res.end(data);
    });
    return;
  }
  if (req.method === 'POST') {
    const chunks = []; let total = 0;
    req.on('data', c => { total += c.length; if (total > 5 * 1024 * 1024) { res.writeHead(413); res.end(); req.destroy(); return; } chunks.push(c); });
    req.on('end', () => {
      let body;
      try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch (e) { res.writeHead(400, json); res.end('{"error":"bad json"}'); return; }
      if (body && body.reset) {
        fs.rm(STATE_FILE, { force: true }, () => { res.writeHead(200, json); res.end('{"ok":true,"reset":true}'); });
        return;
      }
      const write = () => fs.writeFile(STATE_FILE, JSON.stringify(body, null, 2), err => {
        if (err) { res.writeHead(500, json); res.end(JSON.stringify({ error: String(err) })); return; }
        res.writeHead(200, json); res.end('{"ok":true}');
      });
      fs.copyFile(STATE_FILE, path.join(ROOT, 'saved-layout.prev.json'), () => write());
    });
    return;
  }
  res.writeHead(405); res.end();
}

// "반영하기": bakes the current edit state straight into lesson17_v2.html (as the BAKED_STATE
// constant near the top of its <script>), so that single file shows the same result anywhere —
// file://, another computer, GitHub Pages — with no server or saved-layout.json needed.
const DECK_FILE = path.join(ROOT, 'lesson17_v2.html');
const BAKE_RE = /const BAKED_STATE = .*?;(\r?\n)/;
function handleBake(req, res) {
  const json = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };
  if (req.method !== 'POST') { res.writeHead(405); res.end(); return; }
  const chunks = []; let total = 0;
  req.on('data', c => { total += c.length; if (total > 5 * 1024 * 1024) { res.writeHead(413); res.end(); req.destroy(); return; } chunks.push(c); });
  req.on('end', () => {
    let body;
    try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch (e) { res.writeHead(400, json); res.end('{"error":"bad json"}'); return; }
    fs.readFile(DECK_FILE, 'utf8', (err, html) => {
      if (err) { res.writeHead(500, json); res.end(JSON.stringify({ error: String(err) })); return; }
      if (!BAKE_RE.test(html)) { res.writeHead(500, json); res.end('{"error":"BAKED_STATE marker not found in lesson17_v2.html"}'); return; }
      const next = html.replace(BAKE_RE, (m, nl) => 'const BAKED_STATE = ' + JSON.stringify(body) + ';' + nl);
      fs.copyFile(DECK_FILE, path.join(ROOT, 'lesson17_v2.prev.html'), () => {
        fs.writeFile(DECK_FILE, next, err2 => {
          if (err2) { res.writeHead(500, json); res.end(JSON.stringify({ error: String(err2) })); return; }
          res.writeHead(200, json); res.end('{"ok":true}');
        });
      });
    });
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === '/state') { handleState(req, res); return; }
  if (url.pathname === '/bake') { handleBake(req, res); return; }
  if (req.method === 'POST' && url.pathname === '/upload') {
    handleUpload(req, res, url);
    return;
  }
  serveStatic(req, res, url.pathname);
});

server.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`));
