import { useCallback, useState } from 'react'
import { saveTrade, deleteTrade, getTrades, getAllTrades } from '../services/tradeService'
import { DEMO_TRADES } from '../utils/demoData'

export function useTrades(uid, isDemo = false) {
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(false)
  const [lastDoc, setLastDoc] = useState(null)
  const [hasMore, setHasMore] = useState(false)

  const loadTrades = useCallback(
    async (filters = {}, reset = true) => {
      if (!uid) return

      setLoading(true)
      try {
        const hasFilters = Boolean(filters.pair || filters.result || filters.strategy)

        if (isDemo) {
          let filtered = [...DEMO_TRADES]

          if (filters.pair) filtered = filtered.filter((trade) => trade.pair === filters.pair)
          if (filters.result) {
            filtered = filtered.filter((trade) => trade.result === filters.result)
          }
          if (filters.strategy) {
            filtered = filtered.filter((trade) => trade.strategy === filters.strategy)
          }

          setTrades(filtered)
          setLastDoc(null)
          setHasMore(false)
          return
        }

        if (hasFilters) {
          const allTrades = await getAllTrades(uid)
          let filtered = [...allTrades].sort((left, right) => new Date(right.date) - new Date(left.date))

          if (filters.pair) filtered = filtered.filter((trade) => trade.pair === filters.pair)
          if (filters.result) {
            filtered = filtered.filter((trade) => trade.result === filters.result)
          }
          if (filters.strategy) {
            filtered = filtered.filter((trade) => trade.strategy === filters.strategy)
          }

          setTrades(filtered)
          setLastDoc(null)
          setHasMore(false)
          return
        }

        const cursor = reset ? null : lastDoc
        const result = await getTrades(uid, {}, cursor)
        setTrades((previous) => (reset ? result.trades : [...previous, ...result.trades]))
        setLastDoc(result.lastDoc)
        setHasMore(result.hasMore)
      } finally {
        setLoading(false)
      }
    },
    [uid, isDemo, lastDoc],
  )

  const loadAllTrades = useCallback(async () => {
    if (!uid || isDemo) return trades
    return getAllTrades(uid)
  }, [uid, isDemo, trades])

  const addTrade = useCallback(
    async (tradeData) => {
      if (isDemo) {
        const newTrade = { ...tradeData, id: `t${Date.now()}` }
        setTrades((previous) => [newTrade, ...previous])
        return newTrade.id
      }

      const id = await saveTrade(uid, tradeData)
      setTrades((previous) => [{ ...tradeData, id }, ...previous])
      return id
    },
    [uid, isDemo],
  )

  const removeTrade = useCallback(
    async (tradeId, tradeData) => {
      if (!isDemo) {
        await deleteTrade(uid, tradeId, tradeData)
      }

      setTrades((previous) => previous.filter((trade) => trade.id !== tradeId))
    },
    [uid, isDemo],
  )

  return {
    trades,
    loading,
    hasMore,
    loadTrades,
    loadAllTrades,
    addTrade,
    removeTrade,
    setTrades,
  }
}
