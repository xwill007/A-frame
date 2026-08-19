/**
 * English VR - Servidor HTTPS de desarrollo
 *
 * - Sirve archivos estáticos desde la raíz del repo (para que /A-frame/... resuelva)
 * - Hace de proxy de las peticiones .php hacia Apache (XAMPP), que es quien ejecuta PHP
 * - Soporta peticiones Range (necesario para reproducir/adelantar los videos .mp4)
 *
 * Configuración por variables de entorno (las define start_dev.bat):
 *   ENV_SERVE_ROOT  -> carpeta raíz que se sirve
 *   ENV_HTTPS_PORT  -> puerto HTTPS
 *   ENV_CERT/ENV_KEY-> rutas del certificado TLS
 *   ENV_PHP_HOST/PORT -> dónde vive Apache para el proxy PHP
 *   ENV_INDEX       -> a dónde redirigir "/"
 */
'use strict';

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const url = require('url');

const ROOT = path.resolve(process.env.ENV_SERVE_ROOT || 'D:\\APPS\\GITHUB');
const PORT = parseInt(process.env.ENV_HTTPS_PORT || '8443', 10);
const CERT = process.env.ENV_CERT || path.join(__dirname, 'certs', 'cert.pem');
const KEY = process.env.ENV_KEY || path.join(__dirname, 'certs', 'key.pem');
const PHP_HOST = process.env.ENV_PHP_HOST || '127.0.0.1';
const PHP_PORT = parseInt(process.env.ENV_PHP_PORT || '80', 10);
const INDEX_REDIRECT = process.env.ENV_INDEX || '/A-frame/english-vr/VR/index.html';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogv': 'video/ogg',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.bin': 'application/octet-stream',
  '.wasm': 'application/wasm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.xml': 'application/xml'
};

function sendText(res, code, text) {
  res.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(text);
}

function proxyToPHP(req, res) {
  const headers = Object.assign({}, req.headers, {
    host: PHP_HOST + ':' + PHP_PORT
  });
  delete headers['connection'];

  const proxyReq = http.request({
    host: PHP_HOST,
    port: PHP_PORT,
    method: req.method,
    path: req.url,
    headers: headers
  }, (proxyRes) => {
    const respHeaders = Object.assign({}, proxyRes.headers);
    delete respHeaders['connection'];
    delete respHeaders['transfer-encoding'];
    delete respHeaders['keep-alive'];
    res.writeHead(proxyRes.statusCode || 500, respHeaders);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (e) => {
    sendText(res, 502,
      'Error conectando con PHP (Apache). ¿Está Apache iniciado?\n' + e.message);
  });

  req.pipe(proxyReq);
}

function serveFile(req, res, filePath, stat) {
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME[ext] || 'application/octet-stream';
  const range = req.headers.range;

  if (range) {
    const m = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (m) {
      let start = m[1] === '' ? 0 : parseInt(m[1], 10);
      let end = m[2] === '' ? stat.size - 1 : parseInt(m[2], 10);
      if (isNaN(start) || start < 0) start = 0;
      if (isNaN(end) || end >= stat.size) end = stat.size - 1;
      if (start <= end && start < stat.size) {
        res.writeHead(206, {
          'Content-Type': mime,
          'Content-Range': 'bytes ' + start + '-' + end + '/' + stat.size,
          'Accept-Ranges': 'bytes',
          'Content-Length': end - start + 1
        });
        fs.createReadStream(filePath, { start, end }).pipe(res);
        return;
      }
    }
  }

  res.writeHead(200, {
    'Content-Type': mime,
    'Content-Length': stat.size,
    'Accept-Ranges': 'bytes'
  });
  fs.createReadStream(filePath).pipe(res);
}

function handle(req, res) {
  const parsed = url.parse(req.url);
  let pathname;
  try {
    pathname = decodeURIComponent(parsed.pathname || '/');
  } catch (e) {
    return sendText(res, 400, 'Bad Request');
  }

  if (pathname === '/') {
    res.writeHead(302, { Location: INDEX_REDIRECT });
    return res.end();
  }

  if (pathname.toLowerCase().endsWith('.php')) {
    return proxyToPHP(req, res);
  }

  const resolved = path.normalize(path.join(ROOT, pathname));
  if (resolved !== ROOT && !resolved.startsWith(ROOT + path.sep)) {
    return sendText(res, 403, 'Forbidden');
  }

  fs.stat(resolved, (err, stat) => {
    if (err) return sendText(res, 404, 'Not Found: ' + pathname);
    if (stat.isDirectory()) {
      const idx = path.join(resolved, 'index.html');
      fs.stat(idx, (e2, s2) => {
        if (!e2 && s2.isFile()) return serveFile(req, res, idx, s2);
        return sendText(res, 404, 'Not Found: ' + pathname);
      });
      return;
    }
    if (!stat.isFile()) return sendText(res, 404, 'Not Found: ' + pathname);
    serveFile(req, res, resolved, stat);
  });
}

function lanIPs() {
  const out = [];
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const info of ifaces[name]) {
      if (info.family === 'IPv4' && !info.internal) out.push(info.address);
    }
  }
  return out;
}

if (!fs.existsSync(CERT) || !fs.existsSync(KEY)) {
  console.error('[ERROR] Falta el certificado TLS. Ejecuta start_dev.bat para generarlo.');
  process.exit(1);
}

const server = https.createServer(
  { cert: fs.readFileSync(CERT), key: fs.readFileSync(KEY) },
  handle
);

server.listen(PORT, '0.0.0.0', () => {
  console.log('==========================================================');
  console.log(' English VR - Servidor HTTPS en ejecucion');
  console.log('==========================================================');
  console.log(' Raiz servida : ' + ROOT);
  console.log(' PHP proxy    : http://' + PHP_HOST + ':' + PHP_PORT + ' (Apache)');
  console.log('');
  console.log(' En este PC (puede pedir confirmar el certificado):');
  console.log('   https://localhost:' + PORT + INDEX_REDIRECT);
  const ips = lanIPs();
  if (ips.length) {
    console.log('');
    console.log(' Desde el movil (misma red Wi-Fi):');
    ips.forEach((ip) => {
      console.log('   https://' + ip + ':' + PORT + INDEX_REDIRECT);
    });
  }
  console.log('');
  console.log(' Acepta el certificado autofirmado en el movil para habilitar los sensores (WebXR).');
  console.log(' Pulsa Ctrl+C para detener solo el servidor HTTPS.');
  console.log('==========================================================');
});
