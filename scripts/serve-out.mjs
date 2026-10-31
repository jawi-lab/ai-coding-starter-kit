// Liefert den Static Export (out/) für E2E-Läufe auf Port 3000 aus. Playwright
// verwendet einen laufenden Server weiter. Pythons http.server setzt unter Last
// Verbindungen zurück; dann fehlen Chunks und die Seiten bleiben leer.
import { createReadStream, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'

const ROOT = join(process.cwd(), 'out')
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}

function isFile(path) {
  try {
    return statSync(path).isFile()
  } catch {
    return false
  }
}

createServer((req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost')
  const path = join(ROOT, normalize(decodeURIComponent(pathname)))
  const file = [path, join(path, 'index.html'), `${path}.html`].find(
    (candidate) => candidate.startsWith(ROOT) && isFile(candidate)
  )
  if (!file) {
    res.writeHead(404).end('Not found')
    return
  }
  res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' })
  createReadStream(file).pipe(res)
}).listen(Number(process.env.PORT ?? 3000))
