// src/utils/demoData.js
export const DEMO_TRADES = [
  { id: 't1', date: '2026-04-25T09:30', pair: 'XAUUSD', type: 'Buy', entry: 2650, sl: 2640, tp: 2680, lot: 0.5, riskPercent: 1.2, rr: 3.0, result: 'Win', pnl: 320.50, strategy: 'SMC', session: 'London', emotion: 'Calm', followPlan: 'Yes', note: 'Clean BOS, took TP1' },
  { id: 't2', date: '2026-04-24T14:15', pair: 'EURUSD', type: 'Sell', entry: 1.085, sl: 1.088, tp: 1.079, lot: 0.3, riskPercent: 0.9, rr: 2.0, result: 'Loss', pnl: -150.20, strategy: 'Breakout', session: 'New York', emotion: 'FOMO', followPlan: 'No', note: 'Entered late, SL hit' },
  { id: 't3', date: '2026-04-23T10:00', pair: 'GBPUSD', type: 'Buy', entry: 1.265, sl: 1.260, tp: 1.278, lot: 0.4, riskPercent: 1.5, rr: 2.6, result: 'Win', pnl: 210.00, strategy: 'SMC', session: 'London', emotion: 'Confident', followPlan: 'Yes', note: 'Perfect setup' },
  { id: 't4', date: '2026-04-22T09:00', pair: 'XAUUSD', type: 'Buy', entry: 2620, sl: 2608, tp: 2660, lot: 0.6, riskPercent: 1.8, rr: 3.3, result: 'Win', pnl: 450.30, strategy: 'Supply & Demand', session: 'London', emotion: 'Calm', followPlan: 'Yes', note: 'HTF demand zone respected' },
  { id: 't5', date: '2026-04-21T16:30', pair: 'USDJPY', type: 'Sell', entry: 154.5, sl: 155.2, tp: 153.1, lot: 0.3, riskPercent: 0.7, rr: 2.0, result: 'Loss', pnl: -95.60, strategy: 'Trend Following', session: 'Tokyo', emotion: 'Fearful', followPlan: 'Yes', note: 'BoJ surprise move' },
  { id: 't6', date: '2026-04-20T11:00', pair: 'BTCUSD', type: 'Buy', entry: 64000, sl: 62500, tp: 68000, lot: 0.05, riskPercent: 2.0, rr: 2.67, result: 'Win', pnl: 280.00, strategy: 'Breakout', session: 'New York', emotion: 'Excited', followPlan: 'Yes', note: 'BTC breakout confirmed' },
  { id: 't7', date: '2026-04-18T08:30', pair: 'XAUUSD', type: 'Sell', entry: 2680, sl: 2690, tp: 2655, lot: 0.4, riskPercent: 1.1, rr: 2.5, result: 'Win', pnl: 195.00, strategy: 'SMC', session: 'London', emotion: 'Calm', followPlan: 'Yes', note: 'OB rejection at HTF level' },
  { id: 't8', date: '2026-04-17T13:45', pair: 'GBPJPY', type: 'Buy', entry: 196.5, sl: 195.8, tp: 198.2, lot: 0.2, riskPercent: 0.8, rr: 2.43, result: 'BE', pnl: 0, strategy: 'Trend Following', session: 'London', emotion: 'Calm', followPlan: 'Yes', note: 'Moved to BE, no continuation' },
  { id: 't9', date: '2026-04-16T09:15', pair: 'EURUSD', type: 'Buy', entry: 1.079, sl: 1.075, tp: 1.092, lot: 0.5, riskPercent: 1.3, rr: 3.25, result: 'Win', pnl: 380.00, strategy: 'SMC', session: 'London', emotion: 'Confident', followPlan: 'Yes', note: 'Perfect RR trade' },
  { id: 't10', date: '2026-04-15T10:30', pair: 'XAUUSD', type: 'Buy', entry: 2640, sl: 2630, tp: 2665, lot: 0.35, riskPercent: 1.0, rr: 2.5, result: 'Loss', pnl: -120.00, strategy: 'Breakout', session: 'New York', emotion: 'Greedy', followPlan: 'No', note: 'Overextended, should have waited' },
  { id: 't11', date: '2026-04-14T07:45', pair: 'GBPUSD', type: 'Sell', entry: 1.275, sl: 1.280, tp: 1.260, lot: 0.3, riskPercent: 1.1, rr: 3.0, result: 'Win', pnl: 225.00, strategy: 'Supply & Demand', session: 'London', emotion: 'Calm', followPlan: 'Yes', note: 'Perfect supply zone' },
  { id: 't12', date: '2026-04-12T14:00', pair: 'NASDAQ', type: 'Buy', entry: 18200, sl: 18050, tp: 18650, lot: 0.1, riskPercent: 1.5, rr: 3.0, result: 'Win', pnl: 410.00, strategy: 'Breakout', session: 'New York', emotion: 'Confident', followPlan: 'Yes', note: 'ATH breakout confirmed' },
]

export const DEMO_SUMMARY = {
  displayName: 'Alex Trader',
  email: 'demo@tradetrack.pro',
  totalTrades: 12,
  winCount: 8,
  lossCount: 3,
  beCount: 1,
  totalProfit: 2125.00,
  avgRR: 2.69,
  avgRisk: 1.24,
  accountBalance: 10000,
}