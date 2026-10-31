// Startet `next dev` und beendet den Server samt allen Kindprozessen, bevor er
// den Rechner lahmlegt: bei zu vielen Prozessen, zu viel Speicher oder wenn der
// aufrufende Prozess weg ist. Grenzen per Umgebungsvariable änderbar.
// Der Server bleibt bewusst in unserer Prozessgruppe, damit Strg+C und Playwright
// auch ihn treffen, selbst wenn der Wächter selbst hart beendet wird.
import { execFileSync, spawn } from 'node:child_process'

const MAX_PROCS = Number(process.env.DEV_GUARD_MAX_PROCS ?? 25)
const MAX_GB = Number(process.env.DEV_GUARD_MAX_GB ?? 6)
const POLL_MS = 2000
const KILL_GRACE_MS = 2000

const server = spawn('node_modules/.bin/next', ['dev', ...process.argv.slice(2)], { stdio: 'inherit' })
const startedBy = process.ppid
let stopping = false

function descendants() {
  const rows = execFileSync('ps', ['-eo', 'pid=,ppid=,rss='], { encoding: 'utf8' }).trim().split('\n')
  const procs = rows.map((row) => row.trim().split(/\s+/).map(Number))
  const found = new Map()
  let grew = true
  while (grew) {
    grew = false
    for (const [pid, ppid, rss] of procs) {
      if (!found.has(pid) && (ppid === process.pid || found.has(ppid))) {
        found.set(pid, rss)
        grew = true
      }
    }
  }
  return found
}

function signalAll(pids, signal) {
  for (const pid of pids) {
    try {
      process.kill(pid, signal)
    } catch {
      // Prozess ist bereits beendet.
    }
  }
}

function stop(reason, exitCode) {
  if (stopping) return
  stopping = true
  if (reason) console.error(`\n[dev-guard] ${reason} Dev-Server wird beendet.`)
  const pids = [...descendants().keys()]
  signalAll(pids, 'SIGTERM')
  setTimeout(() => {
    signalAll(pids, 'SIGKILL')
    process.exit(exitCode)
  }, KILL_GRACE_MS)
}

const timer = setInterval(() => {
  if (process.ppid !== startedBy) return stop('Aufrufender Prozess ist weg.', 1)
  const found = descendants()
  const gb = [...found.values()].reduce((sum, rss) => sum + rss, 0) / 1048576
  if (found.size > MAX_PROCS || gb > MAX_GB) {
    stop(
      `Grenze überschritten: ${found.size} Prozesse, ${gb.toFixed(1)} GB ` +
        `(erlaubt: ${MAX_PROCS} Prozesse, ${MAX_GB} GB). Falls es wieder auftritt: rm -rf .next/dev.`,
      1,
    )
  }
}, POLL_MS)

server.on('exit', (code) => {
  clearInterval(timer)
  if (!stopping) process.exit(code ?? 0)
})
process.on('SIGINT', () => stop(null, 0))
process.on('SIGTERM', () => stop(null, 0))
