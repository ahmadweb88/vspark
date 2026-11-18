/** "Fri 20 Nov 2026, 10:00 (Asia/Karachi)", falling back to UTC for unknown zones. */
export function formatInTimeZone(iso: string, timeZone = 'UTC') {
  const format = (zone: string) =>
    new Intl.DateTimeFormat('en-GB', {
      timeZone: zone,
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso)) + ` (${zone})`
  try {
    return format(timeZone)
  } catch {
    return format('UTC')
  }
}
