export function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ""
  return (first + last).toUpperCase()
}

export function formatDate(iso: string, locale: string, opts?: Intl.DateTimeFormatOptions) {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(locale, opts ?? { day: "2-digit", month: "2-digit", year: "numeric" })
}

export function daysUntil(iso: string, from = new Date()) {
  const [y, m, d] = iso.split("-").map(Number)
  const target = new Date(y, m - 1, d).getTime()
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime()
  return Math.round((target - start) / 86_400_000)
}
