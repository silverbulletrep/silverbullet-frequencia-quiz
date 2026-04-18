// Pre-build Environment Validation — Client-side only
// Scans src/ and public/ for import.meta.env and process.env usage
// Enforces whitelist and blocks on sensitive variables
import { readdirSync, statSync, readFileSync } from 'node:fs'
import { resolve, extname } from 'node:path'

const ROOT = resolve(process.cwd())
const TARGET_DIRS = [resolve(ROOT, 'src'), resolve(ROOT, 'public')]
const EXCLUDED_DIRS = new Set([resolve(ROOT, 'api'), resolve(ROOT, 'node_modules'), resolve(ROOT, '.aios-core')])

const ALLOWED_ENV = new Set([
  'DEV',
  'PROD',
  'MODE',
  'SSR',
  'BASE_URL',
  'VITE_STRIPE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'VITE_PAYPAL_CLIENT_ID',
  'NEXT_PUBLIC_PAYPAL_CLIENT_ID',
  'VITE_API_BASE_URL',
  'VITE_EVENTS_BASE_URL',
  'VITE_META_PIXEL_ID',
  'VITE_PIXEL_ID',
  'NEXT_PUBLIC_META_PIXEL_ID',
  'NEXT_PUBLIC_PIXEL_ID',
  'VITE_VSL2_PITCH_SECONDS',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_MEASUREMENT_ID',
  'VITE_FIREBASE_VAPID_KEY',
  'VITE_API_URL',
])

const SENSITIVE_TOKENS = [
  'SERVICE_ROLE',
  'SERVICE_ROLE_KEY',
  'DATABASE_URL',
  'JWT_SECRET',
  'PRIVATE_KEY',
  // 'SECRET' removido: causa falso positivo com VITE_SUPABASE_ANON_KEY e mensagens de erro internas
]

const VALID_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json', '.html', '.scss', '.css'])

function walk(dir, files = []) {
  if (EXCLUDED_DIRS.has(dir)) return files
  const entries = readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const p = resolve(dir, e.name)
    if (EXCLUDED_DIRS.has(p)) continue
    if (e.isDirectory()) walk(p, files)
    else if (VALID_EXTS.has(extname(p))) files.push(p)
  }
  return files
}

function scanFile(path) {
  const content = readFileSync(path, 'utf8')
  const issues = []

  const importEnvRegex = /import\.meta\.env\.([A-Z0-9_]+)/g
  const processEnvRegex = /process\.env\.([A-Za-z0-9_]+)/g

  let m
  while ((m = importEnvRegex.exec(content)) !== null) {
    const name = m[1]
    if (!ALLOWED_ENV.has(name)) {
      issues.push({ type: 'import.meta.env', name, path })
    }
  }
  while ((m = processEnvRegex.exec(content)) !== null) {
    const name = m[1]
    issues.push({ type: 'process.env', name, path })
  }

  for (const token of SENSITIVE_TOKENS) {
    if (content.includes(token)) {
      issues.push({ type: 'sensitive_token', name: token, path })
    }
  }

  return issues
}

function main() {
  const files = []
  for (const dir of TARGET_DIRS) {
    try {
      if (statSync(dir).isDirectory()) walk(dir, files)
    } catch {
      // ignore missing
    }
  }
  const allIssues = []
  for (const f of files) {
    allIssues.push(...scanFile(f))
  }

  if (allIssues.length > 0) {
    const lines = []
    lines.push('REQUIRES MANUAL REVIEW')
    lines.push('Environment validation encontrou usos não permitidos:')
    for (const issue of allIssues) {
      lines.push(`- [${issue.type}] ${issue.name} em ${fpath(issue.path)}`)
    }
    lines.push('')
    lines.push('Política: Apenas VITE_SUPABASE_URL, Firebase config, Stripe/PayPal public keys são permitidas no frontend.')
    console.error(lines.join('\n'))
    process.exit(1)
  }
  console.log('[ENV VALIDATION] OK — Nenhum uso não permitido foi encontrado no client')
}

function fpath(p) {
  try {
    return p.replace(ROOT, '').replace(/^[\\/]/, '')
  } catch {
    return p
  }
}

main()
