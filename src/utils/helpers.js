export const CURRENCY_OPTIONS = [
  { code: 'USD', label: 'USD ($)', symbol: '$', decimals: 2, placement: 'prefix' },
  { code: 'THB', label: 'THB (฿)', symbol: '฿', decimals: 2, placement: 'prefix' },
  { code: 'EUR', label: 'EUR (€)', symbol: '€', decimals: 2, placement: 'prefix' },
  { code: 'CENT', label: 'CENT (¢)', symbol: '¢', decimals: 0, placement: 'suffix' },
]

export const PAIR_EMOJI = {
  XAUUSD: 'AU',
  EURUSD: 'EU',
  GBPUSD: 'GU',
  USDJPY: 'UJ',
  BTCUSD: 'BTC',
  NASDAQ: 'NQ',
  SP500: 'SP',
  GBPJPY: 'GJ',
  AUDUSD: 'AU',
  USDCAD: 'UC',
  ETHUSD: 'ETH',
}

export const PAIRS = [
  'XAUUSD',
  'EURUSD',
  'GBPUSD',
  'USDJPY',
  'BTCUSD',
  'GBPJPY',
  'AUDUSD',
  'USDCAD',
  'NASDAQ',
  'SP500',
  'ETHUSD',
]

export const STRATEGIES = [
  'SMC',
  'Breakout',
  'Trend Following',
  'Scalping',
  'Supply & Demand',
  'EMA Cross',
  'ICT',
  'Price Action',
  'Other',
]

export const SESSIONS = ['London', 'New York', 'Tokyo', 'Sydney', 'London/NY Overlap']
export const TIMEFRAMES = ['M5', 'M15', 'H1', 'H4']
export const EMOTIONS = ['Calm', 'Excited', 'Fearful', 'Greedy', 'FOMO', 'Confident', 'Revenge', 'Neutral']

export const getCurrencyMeta = (code = 'USD') =>
  CURRENCY_OPTIONS.find((item) => item.code === code) || CURRENCY_OPTIONS[0]

export const formatMoney = (value, currencyCode = 'USD') => {
  const currency = getCurrencyMeta(currencyCode)
  const amount = (value || 0).toLocaleString('en-US', {
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
  })

  return currency.placement === 'suffix'
    ? `${amount}${currency.symbol}`
    : `${currency.symbol}${amount}`
}

export const formatPnl = (value, currencyCode = 'USD') => {
  const currency = getCurrencyMeta(currencyCode)
  const amount = Math.abs(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
  })
  const sign = value >= 0 ? '+' : '-'

  return currency.placement === 'suffix'
    ? `${sign}${amount}${currency.symbol}`
    : `${sign}${currency.symbol}${amount}`
}

export const formatUSD = (value, currencyCode = 'USD') => formatMoney(value, currencyCode)
export const formatPct = (value, decimals = 1) => `${(value || 0).toFixed(decimals)}%`
export const formatRR = (value) => `${(value || 0).toFixed(2)}:1`

export const timeAgo = (date) => {
  const ms = Date.now() - new Date(date).getTime()
  const hours = Math.floor(ms / 3600000)

  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`

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
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export const isTradeStructureValid = (type, entry, sl, tp) => {
  const values = [entry, sl, tp].map(Number)
  if (values.some((value) => !Number.isFinite(value))) return false

  if (type === 'Buy') return sl < entry && entry < tp
  if (type === 'Sell') return tp < entry && entry < sl
  return false
}

export const calcRR = (entry, sl, tp, type = 'Buy') => {
  if (!isTradeStructureValid(type, entry, sl, tp)) return 0
  const slDist = Math.abs(entry - sl)
  const tpDist = Math.abs(tp - entry)
  if (!slDist) return 0
  return parseFloat((tpDist / slDist).toFixed(2))
}

export const suggestSessionFromDate = (date, fallback = 'London') => {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return fallback

  const hour = parsed.getHours()

  if (hour >= 7 && hour < 12) return 'London'
  if (hour >= 12 && hour < 16) return 'London/NY Overlap'
  if (hour >= 16 && hour < 21) return 'New York'
  if (hour >= 0 && hour < 7) return 'Tokyo'
  return 'Sydney'
}

export const normalizeTags = (tags) => {
  if (Array.isArray(tags)) {
    return tags
      .map((item) => `${item}`.trim())
      .filter(Boolean)
      .map((item) => (item.startsWith('#') ? item : `#${item}`))
  }

  if (typeof tags !== 'string') return []

  return tags
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => (item.startsWith('#') ? item : `#${item}`))
}

const toNumeric = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0)

const createGroupMetric = () => ({
  count: 0,
  wins: 0,
  losses: 0,
  bes: 0,
  profit: 0,
  rrTotal: 0,
})

const finalizeGroupMetric = (name, metric) => {
  const winRate = metric.count ? (metric.wins / metric.count) * 100 : 0
  const avgRR = metric.count ? metric.rrTotal / metric.count : 0

  return {
    name,
    count: metric.count,
    wins: metric.wins,
    losses: metric.losses,
    bes: metric.bes,
    profit: metric.profit,
    winRate,
    avgRR,
  }
}

export const computeStats = (trades = []) => {
  const wins = trades.filter((trade) => trade.result === 'Win')
  const losses = trades.filter((trade) => trade.result === 'Loss')
  const bes = trades.filter((trade) => trade.result === 'BE')
  const totalPnl = trades.reduce((sum, trade) => sum + toNumeric(trade.pnl), 0)
  const winRate = trades.length ? (wins.length / trades.length) * 100 : 0
  const avgRR = trades.length
    ? trades.reduce((sum, trade) => sum + toNumeric(trade.rr), 0) / trades.length
    : 0
  const avgRisk = trades.length
    ? trades.reduce((sum, trade) => sum + toNumeric(trade.riskPercent), 0) / trades.length
    : 0

  const stratMap = {}
  const sessMap = {}

  trades.forEach((trade) => {
    if (!stratMap[trade.strategy]) stratMap[trade.strategy] = { count: 0, pnl: 0, wins: 0 }
    stratMap[trade.strategy].count += 1
    stratMap[trade.strategy].pnl += toNumeric(trade.pnl)
    if (trade.result === 'Win') stratMap[trade.strategy].wins += 1

    if (!sessMap[trade.session]) sessMap[trade.session] = 0
    sessMap[trade.session] += toNumeric(trade.pnl)
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

export const buildEquityCurve = (trades = [], openingBalance = 0) => {
  const sorted = [...trades].sort((a, b) => new Date(a.date) - new Date(b.date))
  let cumulativeProfit = openingBalance

  return sorted.map((trade, index) => {
    cumulativeProfit += toNumeric(trade.pnl)

    return {
      index,
      date: trade.date,
      label: formatDate(trade.date, { month: 'short', day: 'numeric' }),
      value: parseFloat(cumulativeProfit.toFixed(2)),
      pair: trade.pair,
    }
  })
}

export const buildDashboardAnalytics = (trades = [], currentBalance = 0) => {
  const safeTrades = [...trades]
  const stats = computeStats(safeTrades)
  const sortedDesc = [...safeTrades].sort((a, b) => new Date(b.date) - new Date(a.date))
  const openingBalance = Number.isFinite(Number(currentBalance))
    ? Number(currentBalance) - stats.totalPnl
    : 0
  const equityCurve = buildEquityCurve(safeTrades, openingBalance)

  const sessionMap = new Map()
  const timeframeMap = new Map()
  const strategyMap = new Map()
  const tagMap = new Map()
  const emotionMap = new Map()

  let disciplineTrades = 0
  let disciplineLosses = 0
  let overRiskTrades = 0

  safeTrades.forEach((trade) => {
    const sessionKey = trade.session || 'Other'
    const timeframeKey = trade.timeframe || ''
    const strategyKey = trade.strategy || 'Other'
    const emotionKey = trade.emotion || ''
    const risk = toNumeric(trade.riskPercent)

    if (!sessionMap.has(sessionKey)) sessionMap.set(sessionKey, createGroupMetric())
    if (timeframeKey && !timeframeMap.has(timeframeKey)) timeframeMap.set(timeframeKey, createGroupMetric())
    if (!strategyMap.has(strategyKey)) strategyMap.set(strategyKey, createGroupMetric())
    if (emotionKey && !emotionMap.has(emotionKey)) emotionMap.set(emotionKey, createGroupMetric())

    const groupTargets = [sessionMap.get(sessionKey), strategyMap.get(strategyKey)]
    if (timeframeKey) groupTargets.push(timeframeMap.get(timeframeKey))
    if (emotionKey) groupTargets.push(emotionMap.get(emotionKey))

    groupTargets.forEach((metric) => {
      metric.count += 1
      metric.profit += toNumeric(trade.pnl)
      metric.rrTotal += toNumeric(trade.rr)
      if (trade.result === 'Win') metric.wins += 1
      if (trade.result === 'Loss') metric.losses += 1
      if (trade.result === 'BE') metric.bes += 1
    })

    normalizeTags(trade.tags).forEach((tag) => {
      if (!tagMap.has(tag)) tagMap.set(tag, createGroupMetric())
      const metric = tagMap.get(tag)
      metric.count += 1
      metric.profit += toNumeric(trade.pnl)
      metric.rrTotal += toNumeric(trade.rr)
      if (trade.result === 'Win') metric.wins += 1
      if (trade.result === 'Loss') metric.losses += 1
      if (trade.result === 'BE') metric.bes += 1
    })

    if (trade.followPlan === 'No') {
      disciplineTrades += 1
      if (trade.result === 'Loss') disciplineLosses += 1
    }

    if (risk > 1.5) overRiskTrades += 1
  })

  const sessions = Array.from(sessionMap.entries())
    .map(([name, metric]) => finalizeGroupMetric(name, metric))
    .sort((left, right) => right.profit - left.profit)

  const timeframes = Array.from(timeframeMap.entries())
    .map(([name, metric]) => finalizeGroupMetric(name, metric))
    .sort((left, right) => right.winRate - left.winRate || right.avgRR - left.avgRR)

  const strategies = Array.from(strategyMap.entries())
    .map(([name, metric]) => finalizeGroupMetric(name, metric))
    .sort((left, right) => right.profit - left.profit)

  const tagAnalysis = Array.from(tagMap.entries())
    .map(([name, metric]) => {
      const row = finalizeGroupMetric(name, metric)
      const lossRate = row.count ? (row.losses / row.count) * 100 : 0

      return {
        ...row,
        lossRate,
        bias: row.winRate >= 60 ? 'win' : lossRate >= 55 ? 'loss' : 'mixed',
      }
    })
    .sort((left, right) => right.count - left.count || right.winRate - left.winRate)
    .slice(0, 6)

  const emotionRows = Array.from(emotionMap.entries()).map(([name, metric]) =>
    finalizeGroupMetric(name, metric),
  )
  const fomoRow = emotionRows.find((item) => item.name === 'FOMO')
  const bestSession = sessions[0] || null
  const bestTimeframe = timeframes[0] || null

  const insights = []

  if (fomoRow && fomoRow.count >= 2) {
    const fomoLossRate = fomoRow.count ? (fomoRow.losses / fomoRow.count) * 100 : 0
    if (fomoLossRate >= 60) {
      insights.push({
        type: 'emotionLoss',
        tone: 'negative',
        emotion: fomoRow.name,
        lossRate: fomoLossRate,
      })
    }
  }

  if (safeTrades.length) {
    const overRiskRate = (overRiskTrades / safeTrades.length) * 100
    if (overRiskRate >= 25) {
      insights.push({
        type: 'overRisk',
        tone: 'warning',
        rate: overRiskRate,
      })
    }
  }

  if (bestSession && bestSession.count > 0) {
    insights.push({
      type: 'bestSession',
      tone: bestSession.profit >= 0 ? 'positive' : 'warning',
      session: bestSession.name,
      profit: bestSession.profit,
      winRate: bestSession.winRate,
    })
  }

  if (disciplineTrades >= 2) {
    const disciplineLossRate = (disciplineLosses / disciplineTrades) * 100
    if (disciplineLossRate >= 60) {
      insights.push({
        type: 'discipline',
        tone: 'warning',
        lossRate: disciplineLossRate,
      })
    }
  }

  if (stats.avgRR < 1.5 && stats.total > 0) {
    insights.push({
      type: 'avgRrLow',
      tone: 'warning',
      avgRR: stats.avgRR,
    })
  }

  return {
    ...stats,
    totalTrades: stats.total,
    totalProfit: stats.totalPnl,
    recentTrades: sortedDesc.slice(0, 6),
    equityCurve,
    sessions,
    bestSession,
    timeframes,
    bestTimeframe,
    strategies,
    tagAnalysis,
    insights: insights.slice(0, 3),
  }
}
