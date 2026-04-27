// src/utils/helpers.js

// ── Number Formatters ─────────────────────────────────────────
export const formatPnl = (v) => {
  const abs = Math.abs(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return (v >= 0 ? '+$' : '-$') + abs
}

export const formatUSD = (v) =>
  '$' + (v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const formatPct = (v, decimals = 1) => (v || 0).toFixed(decimals) + '%'

export const formatRR = (v) => (v || 0).toFixed(2) + ':1'

// ── Date Helpers ──────────────────────────────────────────────
export const timeAgo = (date) => {
  const ms = Date.now() - new Date(date).getTime()
  const h = Math.floor(ms / 3600000)
  if (h < 1) return 'Just now'
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export const formatDate = (date, opts = {}) =>
  new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
    ...opts,
  })

export const getMonthId = (date) => (date || new Date().toISOString()).slice(0, 7)

export const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// ── RR Calculator ─────────────────────────────────────────────
export const calcRR = (entry, sl, tp) => {
  const slDist = Math.abs(entry - sl)
  const tpDist = Math.abs(tp - entry)
  if (!slDist) return 0
  return parseFloat((tpDist / slDist).toFixed(2))
}

// ── Stats Calculator ──────────────────────────────────────────
export const computeStats = (trades) => {
  const wins = trades.filter((t) => t.result === 'Win')
  const losses = trades.filter((t) => t.result === 'Loss')
  const bes = trades.filter((t) => t.result === 'BE')
  const totalPnl = trades.reduce((s, t) => s + (t.pnl || 0), 0)
  const winRate = trades.length ? (wins.length / trades.length) * 100 : 0
  const avgRR = trades.length ? trades.reduce((s, t) => s + (t.rr || 0), 0) / trades.length : 0
  const avgRisk = trades.length ? trades.reduce((s, t) => s + (t.riskPercent || 0), 0) / trades.length : 0

  // Strategy breakdown
  const stratMap = {}
  trades.forEach((t) => {
    if (!stratMap[t.strategy]) stratMap[t.strategy] = { count: 0, pnl: 0, wins: 0 }
    stratMap[t.strategy].count++
    stratMap[t.strategy].pnl += t.pnl || 0
    if (t.result === 'Win') stratMap[t.strategy].wins++
  })

  // Session breakdown
  const sessMap = {}
  trades.forEach((t) => {
    if (!sessMap[t.session]) sessMap[t.session] = 0
    sessMap[t.session] += t.pnl || 0
  })

  return {
    totalPnl,
    winRate,
    avgRR,
    avgRisk,
    wins: wins.length,
    losses: losses.length,
    bes: bes.length,
    total: trades.length,
    stratMap,
    sessMap,
  }
}

// ── Equity Curve Builder ──────────────────────────────────────
export const buildEquityCurve = (trades, startBalance = 10000) => {
  const sorted = [...trades].sort((a, b) => new Date(a.date) - new Date(b.date))
  let balance = startBalance
  const labels = ['Start']
  const data = [balance]
  sorted.forEach((t) => {
    balance += t.pnl || 0
    labels.push(formatDate(t.date))
    data.push(parseFloat(balance.toFixed(2)))
  })
  return { labels, data }
}

// ── Pair Emoji Map ────────────────────────────────────────────
export const PAIR_EMOJI = {
  XAUUSD: '🥇',
  EURUSD: '🇪🇺',
  GBPUSD: '🇬🇧',
  USDJPY: '🇯🇵',
  BTCUSD: '₿',
  NASDAQ: '📊',
  SP500: '📈',
  GBPJPY: '🇬🇧',
  AUDUSD: '🇦🇺',
  USDCAD: '🇨🇦',
  ETHUSD: 'Ξ',
}

export const PAIRS = ['XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'BTCUSD', 'GBPJPY', 'AUDUSD', 'USDCAD', 'NASDAQ', 'SP500', 'ETHUSD']
export const STRATEGIES = ['SMC', 'Breakout', 'Trend Following', 'Scalping', 'Supply & Demand', 'EMA Cross', 'ICT', 'Price Action', 'Other']
export const SESSIONS = ['London', 'New York', 'Tokyo', 'Sydney', 'London/NY Overlap']
export const EMOTIONS = ['Calm', 'Excited', 'Fearful', 'Greedy', 'FOMO', 'Confident', 'Revenge', 'Neutral']