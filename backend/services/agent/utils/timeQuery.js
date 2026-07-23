const TIME_QUERY_PATTERNS = [
  /\b(current|present|right now)\b.*\b(time|clock|date|day|today|now)\b/i,
  /\bwhat time\b/i,
  /\bwhat is the time\b/i,
  /\bwhat date\b/i,
  /\bwhat is the date\b/i,
  /\bwhat day\b/i,
  /\bwhat day is it\b/i,
  /\bwhat is today's date\b/i,
  /\bwhat is today\b/i,
  /\bwhat is the current date\b/i,
]

export const isTimeQuery = (text = '') => {
  const normalized = text.trim().toLowerCase()
  return TIME_QUERY_PATTERNS.some((pattern) => pattern.test(normalized))
}

export const getCurrentTimeMessage = () => {
  const now = new Date()
  const time = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(now)

  const date = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(now)

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'your local timezone'

  return `The current time is ${time} on ${date} (${timeZone}).`
}
