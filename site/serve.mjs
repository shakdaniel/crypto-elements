#!/usr/bin/env node
/** Zero-dependency static server for site/dist. */
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { join, extname, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = join(dirname(fileURLToPath(import.meta.url)), 'dist')
const port = Number(process.env.PORT) || 4321
const types = { '.html': 'text/html', '.svg': 'image/svg+xml', '.json': 'application/json', '.css': 'text/css', '.js': 'text/javascript' }

createServer(async (req, res) => {
  let path = join(dir, decodeURIComponent(req.url.split('?')[0]))
  try {
    if ((await stat(path)).isDirectory()) path = join(path, 'index.html')
  } catch {
    path = join(dir, 'index.html')
  }
  try {
    const body = await readFile(path)
    res.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream' })
    res.end(body)
  } catch {
    res.writeHead(404).end('Not found')
  }
}).listen(port, () => console.log(`→ http://localhost:${port}`))
