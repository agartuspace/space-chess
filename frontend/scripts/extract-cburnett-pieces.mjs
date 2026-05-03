/**
 * Reads embedded cburnett SVG data URLs from chessground (same pieces as Lichess).
 * Regenerate: node scripts/extract-cburnett-pieces.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const cssPath = path.join(__dirname, '../node_modules/chessground/assets/chessground.cburnett.css')
const outPath = path.join(__dirname, '../app/space-chess/lib/cburnett-piece-data-urls.ts')

const css = fs.readFileSync(cssPath, 'utf8')
const names = { pawn: 'P', knight: 'N', bishop: 'B', rook: 'R', queen: 'Q', king: 'K' }
const map = {}
const lines = css.split('\n')
for (let i = 0; i < lines.length; i++) {
  const sel = lines[i].match(/^\.cg-wrap piece\.([a-z]+)\.(white|black) \{/)
  if (!sel) continue
  const um = (lines[i + 1] || '').match(/url\('([^']+)'\)/)
  if (!um) continue
  const color = sel[2] === 'white' ? 'w' : 'b'
  map[color + names[sel[1]]] = um[1]
}

const body = `/** Embedded SVG data URLs — cburnett set shipped with chessground (npm). */\nexport const CBURNETT_PIECE_DATA_URLS: Record<string, string> = ${JSON.stringify(map, null, 2)}\n`
fs.writeFileSync(outPath, body, 'utf8')
console.log('Wrote', outPath, Object.keys(map).length, 'pieces')
