export function asset(path: string): string {
  const base = import.meta.env.BASE_URL || '/'
  const cleaned = String(path).replace(/^\//, '')
  return base + cleaned
}
