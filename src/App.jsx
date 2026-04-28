import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import SettingsPage from './components/settings/SettingsPage'
import { useTheme } from './context/useTheme'
import { useAuth } from './hooks/useAuth'
import { useTrades } from './hooks/useTrades'
import {
  loginUser,
  logoutUser,
  registerUser,
  updateUserPreferences,
} from './services/authService'
import { DEMO_SUMMARY, DEMO_TRADES } from './utils/demoData'
import {
  buildDashboardAnalytics,
  calculateTradePnl,
  calcRR,
  CURRENCY_OPTIONS,
  formatDate,
  formatMoney,
  formatPnl,
  formatRR,
  getCurrencyMeta,
  isTradeStructureValid,
  normalizeTags,
  PAIR_EMOJI,
  PAIRS,
  SESSIONS,
  suggestSessionFromDate,
  TIMEFRAMES,
  STRATEGIES,
  EMOTIONS,
} from './utils/helpers'

const copy = {
  en: {
    nav: {
      dashboard: 'Dashboard',
      add: 'Add Trade',
      history: 'History',
      settings: 'Settings',
    },
    general: {
      appName: 'Trade Journal',
      traderFallback: 'Trader',
      liveWorkspace: 'Live workspace',
      demoWorkspace: 'Demo workspace',
      logout: 'Log out',
      leaveDemo: 'Leave demo',
      loadingWorkspace: 'Loading workspace...',
      reviewExecution: 'Ready to review your execution?',
      refresh: 'Refresh',
      mode: 'Mode',
      demo: 'Demo',
      firebase: 'Firebase',
      topPair: 'Top pair',
      latestResult: 'Latest result',
      openTradesView: 'Open trades view',
      noValue: '-',
      resetFilters: 'Reset filters',
      loadMore: 'Load more',
      endOfList: 'End of list',
      shownTrades: (count) => `${count} trade(s) shown`,
    },
    auth: {
      title: 'Trade Journal',
      subtitle: 'Log trades, review execution, and track your edge.',
      login: 'Login',
      register: 'Register',
      displayName: 'Display name',
      email: 'Email',
      password: 'Password',
      working: 'Working...',
      createAccount: 'Create account',
      signIn: 'Sign in',
      demoLink: 'Continue in demo mode',
      firebaseReady: 'Firebase is ready. You can sign in or explore the demo.',
      firebaseNotReady:
        'Firebase is not ready yet. Add config and install the firebase package to enable sign-in.',
    },
    toasts: {
      demoEnabled: 'Demo mode enabled',
      tradeSaved: 'Trade saved',
      tradeDeleted: 'Trade deleted',
      balanceUpdated: 'Account balance updated',
    },
    greeting: {
      morning: 'Good morning',
      afternoon: 'Good afternoon',
      evening: 'Good evening',
    },
    sidebar: {
      accountBalance: 'Account balance',
      currency: 'Currency',
      netLoadedTrades: 'net on loaded trades',
      demoMode: 'Demo mode',
      set: 'Set',
      add: 'Add',
      subtract: 'Subtract',
      clear: 'Clear',
      amountPlaceholder: 'Amount',
      apply: 'Apply',
      cancel: 'Cancel',
      editorTitle: 'Manage balance',
    },
    dashboard: {
      loadedTrades: (count) => `${count} trades loaded into the current view`,
      firebaseBanner:
        'Firebase is not fully connected yet. Demo mode remains available while you finish setup.',
      overview: 'Performance overview',
      overviewSubtitle: 'See the state of your edge in a few seconds.',
      totalTrades: 'Total Trades',
      winRate: 'Win Rate',
      totalProfit: 'Total Profit',
      averageRr: 'Avg RR',
      statTradesFoot: (wins, losses, bes) => `${wins} wins / ${losses} losses / ${bes} BE`,
      statWinRateStrong: 'Healthy strike rate',
      statWinRateWeak: 'Needs review',
      statWinRateMid: 'Mixed quality',
      statProfitFoot: 'Across loaded trades',
      statAvgRrStrong: 'Reward profile looks solid',
      statAvgRrWeak: 'Low reward for the risk taken',
      equityCurve: 'Equity Curve',
      equityCurveSubtitle: 'Cumulative profit across your trade timeline.',
      risingCurve: 'Curve is rising',
      unstableCurve: 'Curve is choppy',
      analyticsTitle: 'Analytics',
      analyticsSubtitle: 'Find where your edge is actually showing up.',
      bestTradingSession: 'Best Trading Session',
      timeframePerformance: 'Timeframe Performance',
      strategyPerformance: 'Strategy Performance',
      bestSessionLabel: 'Best session',
      bestTimeframeLabel: 'Best timeframe',
      noSessionData: 'No session data yet.',
      noTimeframeData: 'Add timeframe data to compare execution quality.',
      noStrategyData: 'No strategy data yet.',
      aiInsights: 'AI Insight',
      aiInsightSubtitle: 'Short, sharp reads on what your journal is saying.',
      noInsights: 'Not enough signal yet. Add a few more trades.',
      tagAnalysis: 'Tag Analysis',
      tagInsight: (tag, winRate) => `${tag} wins ${winRate.toFixed(0)}%`,
      tagLossInsight: (tag, lossRate) => `${tag} loses ${lossRate.toFixed(0)}%`,
      noTags: 'No tags yet.',
      recentTrades: 'Recent trades',
      recentTradesSubtitle: 'Latest executions worth reviewing.',
      openHistory: 'Open history',
      loadingTrades: 'Loading trades...',
      noTradesYet: 'No trades yet',
      addFirstSetup: 'Add your first setup to start building stats.',
      noRecentTrades: 'No recent trades to review.',
      sessionWinRate: 'Win rate',
      sessionProfit: 'Profit',
      timeframeAvgRr: 'Avg RR',
      strategyProfit: 'Profit',
      insightEmotionLoss: (emotion, lossRate) => `${emotion} trades lose ${lossRate.toFixed(0)}% of the time.`,
      insightOverRisk: (rate) => `You over-risk on ${rate.toFixed(0)}% of trades.`,
      insightBestSession: (session) => `${session} is your strongest session right now.`,
      insightDiscipline: (lossRate) => `Trades outside your plan lose ${lossRate.toFixed(0)}% of the time.`,
      insightAvgRrLow: (avgRR) => `Average RR is only ${avgRR.toFixed(2)}. Push for cleaner reward.`,
    },
    addTrade: {
      title: 'Add trade',
      subtitle: 'Capture the setup while the context is still fresh.',
      sectionSetup: 'Setup',
      date: 'Date',
      pair: 'Pair',
      type: 'Type',
      result: 'Result',
      entry: 'Entry',
      stopLoss: 'Stop loss',
      takeProfit: 'Take profit',
      pnl: 'PnL',
      lotSize: 'Lot size',
      riskPercent: 'Risk %',
      strategy: 'Strategy',
      session: 'Session',
      timeframe: 'Timeframe',
      emotion: 'Emotion',
      followedPlan: 'Followed plan',
      tags: 'Tags',
      notes: 'Notes',
      tagsPlaceholder: 'london, news, breakout',
      notesPlaceholder:
        'Why this setup made sense, what you saw, and what to review later.',
      calculatedRr: 'Calculated RR',
      savingTrade: 'Saving trade...',
      saveTrade: 'Save trade',
      buy: 'Buy',
      sell: 'Sell',
      win: 'Win',
      loss: 'Loss',
      be: 'BE',
      yes: 'Yes',
      no: 'No',
    },
    history: {
      title: 'Trade history',
      subtitle: 'Filter the journal and open any trade for a closer look.',
      allPairs: 'All pairs',
      allResults: 'All results',
      allStrategies: 'All strategies',
      noMatches: 'No matching trades',
      changeFilters: 'Try changing the filters or add a new entry.',
      date: 'Date',
      pair: 'Pair',
      type: 'Type',
      strategy: 'Strategy',
      result: 'Result',
      rr: 'RR',
      pnl: 'PnL',
    },
    modal: {
      date: 'Date',
      type: 'Type',
      entrySlTp: 'Entry / SL / TP',
      rrPnl: 'RR / PnL',
      strategy: 'Strategy',
      session: 'Session',
      timeframe: 'Timeframe',
      tags: 'Tags',
      emotionAndNotes: 'Emotion and notes',
      noNotes: 'No notes added.',
      deleteTrade: 'Delete trade',
    },
  },
  th: {
    nav: {
      dashboard: 'แดชบอร์ด',
      add: 'เพิ่มรายการเทรด',
      history: 'ประวัติการเทรด',
    },
    general: {
      appName: 'บันทึกการเทรด',
      traderFallback: 'เทรดเดอร์',
      liveWorkspace: 'โหมดใช้งานจริง',
      demoWorkspace: 'โหมดเดโม',
      logout: 'ออกจากระบบ',
      leaveDemo: 'ออกจากโหมดเดโม',
      loadingWorkspace: 'กำลังโหลดข้อมูล...',
      reviewExecution: 'พร้อมทบทวนการเทรดของคุณแล้ว',
      refresh: 'รีเฟรช',
      mode: 'โหมด',
      demo: 'เดโม',
      firebase: 'Firebase',
      topPair: 'คู่ที่เด่น',
      latestResult: 'ผลล่าสุด',
      openTradesView: 'รายการที่แสดง',
      noValue: '-',
      resetFilters: 'ล้างตัวกรอง',
      loadMore: 'โหลดเพิ่ม',
      endOfList: 'สิ้นสุดรายการ',
      shownTrades: (count) => `แสดง ${count} รายการ`,
    },
    auth: {
      title: 'บันทึกการเทรด',
      subtitle: 'จดบันทึกการเข้าออก พร้อมทบทวนวินัยและความได้เปรียบของคุณ',
      login: 'เข้าสู่ระบบ',
      register: 'สมัครสมาชิก',
      displayName: 'ชื่อที่แสดง',
      email: 'อีเมล',
      password: 'รหัสผ่าน',
      working: 'กำลังดำเนินการ...',
      createAccount: 'สร้างบัญชี',
      signIn: 'เข้าสู่ระบบ',
      demoLink: 'ลองใช้งานในโหมดเดโม',
      firebaseReady: 'Firebase พร้อมใช้งานแล้ว คุณสามารถเข้าสู่ระบบหรือทดลองเดโมได้',
      firebaseNotReady:
        'Firebase ยังไม่พร้อมใช้งาน โปรดเพิ่ม config และติดตั้งแพ็กเกจ firebase เพื่อเปิดระบบล็อกอิน',
    },
    toasts: {
      demoEnabled: 'เปิดโหมดเดโมแล้ว',
      tradeSaved: 'บันทึกรายการเทรดแล้ว',
      tradeDeleted: 'ลบรายการเทรดแล้ว',
      balanceUpdated: 'อัปเดตยอดเงินแล้ว',
    },
    greeting: {
      morning: 'สวัสดีตอนเช้า',
      afternoon: 'สวัสดีตอนบ่าย',
      evening: 'สวัสดีตอนเย็น',
    },
    sidebar: {
      accountBalance: 'ยอดเงินในบัญชี',
      currency: 'สกุลเงิน',
      netLoadedTrades: 'สุทธิจากรายการที่แสดง',
      demoMode: 'โหมดเดโม',
      set: 'ตั้งยอด',
      add: 'เพิ่ม',
      subtract: 'ลด',
      clear: 'ล้าง',
      amountPlaceholder: 'จำนวนเงิน',
      apply: 'ยืนยัน',
      cancel: 'ยกเลิก',
      editorTitle: 'จัดการยอดเงิน',
    },
    dashboard: {
      loadedTrades: (count) => `โหลดรายการเทรดในมุมมองนี้ ${count} รายการ`,
      firebaseBanner:
        'Firebase ยังเชื่อมต่อไม่ครบ โหมดเดโมยังพร้อมให้ใช้งานระหว่างตั้งค่าระบบ',
      overview: 'ภาพรวมผลงาน',
      overviewSubtitle: 'ดูว่าการเทรดของคุณเป็นอย่างไรได้ในไม่กี่วินาที',
      totalTrades: 'จำนวนไม้ทั้งหมด',
      winRate: 'อัตราชนะ',
      totalProfit: 'กำไรสุทธิ',
      averageRr: 'ค่า RR เฉลี่ย',
      statTradesFoot: (wins, losses, bes) => `ชนะ ${wins} / แพ้ ${losses} / BE ${bes}`,
      statWinRateStrong: 'อัตราชนะอยู่ในโซนดี',
      statWinRateWeak: 'ควรกลับไปทบทวน',
      statWinRateMid: 'คุณภาพยังแกว่งอยู่',
      statProfitFoot: 'คำนวณจากรายการที่โหลดอยู่',
      statAvgRrStrong: 'Reward ต่อความเสี่ยงดูดี',
      statAvgRrWeak: 'Reward ยังต่ำเมื่อเทียบกับความเสี่ยง',
      equityCurve: 'เส้น Equity Curve',
      equityCurveSubtitle: 'กำไรสะสมตามลำดับเวลาของการเทรด',
      risingCurve: 'กราฟกำลังไต่ขึ้น',
      unstableCurve: 'กราฟยังแกว่งและไม่เสถียร',
      analyticsTitle: 'การวิเคราะห์',
      analyticsSubtitle: 'ดูให้ชัดว่าความได้เปรียบของคุณอยู่ตรงไหน',
      bestTradingSession: 'ช่วงเวลาที่ดีที่สุด',
      timeframePerformance: 'ผลงานตาม Timeframe',
      strategyPerformance: 'ผลงานตามกลยุทธ์',
      bestSessionLabel: 'ช่วงเวลาที่เด่นที่สุด',
      bestTimeframeLabel: 'Timeframe ที่เด่นที่สุด',
      noSessionData: 'ยังไม่มีข้อมูล session',
      noTimeframeData: 'เพิ่มข้อมูล timeframe เพื่อเทียบคุณภาพการเข้าเทรด',
      noStrategyData: 'ยังไม่มีข้อมูลกลยุทธ์',
      aiInsights: 'AI Insight',
      aiInsightSubtitle: 'สรุปสั้น คม และใช้ได้จริงจากสมุดบันทึกของคุณ',
      noInsights: 'ข้อมูลยังไม่พอให้สรุป insight ชัด ๆ',
      tagAnalysis: 'การวิเคราะห์แท็ก',
      tagInsight: (tag, winRate) => `${tag} ชนะ ${winRate.toFixed(0)}%`,
      tagLossInsight: (tag, lossRate) => `${tag} แพ้ ${lossRate.toFixed(0)}%`,
      noTags: 'ยังไม่มีแท็ก',
      recentTrades: 'รายการล่าสุด',
      recentTradesSubtitle: 'ดูไม้ล่าสุดที่ควรหยิบมาทบทวน',
      openHistory: 'เปิดประวัติ',
      loadingTrades: 'กำลังโหลดรายการ...',
      noTradesYet: 'ยังไม่มีรายการเทรด',
      addFirstSetup: 'เพิ่มรายการแรกเพื่อเริ่มสร้างสถิติของคุณ',
      noRecentTrades: 'ยังไม่มีรายการล่าสุดให้ดู',
      sessionWinRate: 'อัตราชนะ',
      sessionProfit: 'กำไร',
      timeframeAvgRr: 'ค่า RR เฉลี่ย',
      strategyProfit: 'กำไร',
      insightEmotionLoss: (emotion, lossRate) => `${emotion} ทำให้คุณแพ้ ${lossRate.toFixed(0)}% ของไม้ในกลุ่มนี้`,
      insightOverRisk: (rate) => `คุณ over-risk อยู่ ${rate.toFixed(0)}% ของไม้ทั้งหมด`,
      insightBestSession: (session) => `${session} คือช่วงเวลาที่ทำกำไรดีที่สุดตอนนี้`,
      insightDiscipline: (lossRate) => `ไม้ที่ไม่ทำตามแผนแพ้ ${lossRate.toFixed(0)}%`,
      insightAvgRrLow: (avgRR) => `ค่า RR เฉลี่ยอยู่ที่ ${avgRR.toFixed(2)} ยังควรหา reward ที่คมกว่านี้`,
    },
    addTrade: {
      title: 'เพิ่มรายการเทรด',
      subtitle: 'บันทึก setup ไว้ตอนที่บริบทยังสดอยู่',
      sectionSetup: 'ข้อมูลการเข้าเทรด',
      date: 'วันที่',
      pair: 'คู่เทรด',
      type: 'ประเภท',
      result: 'ผลลัพธ์',
      entry: 'ราคาเข้า',
      stopLoss: 'จุดตัดขาดทุน',
      takeProfit: 'จุดทำกำไร',
      pnl: 'กำไร/ขาดทุน',
      lotSize: 'ขนาดล็อต',
      riskPercent: 'ความเสี่ยง %',
      strategy: 'กลยุทธ์',
      session: 'ช่วงเวลา',
      timeframe: 'Timeframe',
      emotion: 'อารมณ์',
      followedPlan: 'ทำตามแผนหรือไม่',
      tags: 'แท็ก',
      notes: 'บันทึกเพิ่มเติม',
      tagsPlaceholder: 'london, news, breakout',
      notesPlaceholder: 'เหตุผลที่เข้าเทรด สิ่งที่เห็น และสิ่งที่ควรกลับมาทบทวน',
      calculatedRr: 'ค่า RR ที่คำนวณได้',
      savingTrade: 'กำลังบันทึกรายการ...',
      saveTrade: 'บันทึกรายการ',
      buy: 'Buy',
      sell: 'Sell',
      win: 'Win',
      loss: 'Loss',
      be: 'BE',
      yes: 'ใช่',
      no: 'ไม่',
    },
    history: {
      title: 'ประวัติการเทรด',
      subtitle: 'กรองรายการในสมุดบันทึกและเปิดดูรายละเอียดได้ทันที',
      allPairs: 'ทุกคู่',
      allResults: 'ทุกผลลัพธ์',
      allStrategies: 'ทุกกลยุทธ์',
      noMatches: 'ไม่พบรายการที่ตรงเงื่อนไข',
      changeFilters: 'ลองเปลี่ยนตัวกรอง หรือเพิ่มรายการใหม่',
      date: 'วันที่',
      pair: 'คู่เทรด',
      type: 'ประเภท',
      strategy: 'กลยุทธ์',
      result: 'ผลลัพธ์',
      rr: 'RR',
      pnl: 'กำไร/ขาดทุน',
    },
    modal: {
      date: 'วันที่',
      type: 'ประเภท',
      entrySlTp: 'เข้า / SL / TP',
      rrPnl: 'RR / PnL',
      strategy: 'กลยุทธ์',
      session: 'ช่วงเวลา',
      timeframe: 'Timeframe',
      tags: 'แท็ก',
      emotionAndNotes: 'อารมณ์และบันทึก',
      noNotes: 'ยังไม่มีบันทึกเพิ่มเติม',
      deleteTrade: 'ลบรายการนี้',
    },
  },
}

copy.th.nav.settings = 'ตั้งค่า'

const PAGE_ROUTES = {
  dashboard: '/dashboard',
  add: '/add',
  history: '/history',
  settings: '/settings',
}

function getPageFromPath(pathname) {
  return (
    Object.entries(PAGE_ROUTES).find(([, routePath]) => pathname === routePath)?.[0] || 'dashboard'
  )
}

const labelMaps = {
  strategies: {
    SMC: { en: 'SMC', th: 'SMC' },
    Breakout: { en: 'Breakout', th: 'Breakout' },
    'Trend Following': { en: 'Trend Following', th: 'ตามแนวโน้ม' },
    Scalping: { en: 'Scalping', th: 'สเกลป์' },
    'Supply & Demand': { en: 'Supply & Demand', th: 'Supply & Demand' },
    'EMA Cross': { en: 'EMA Cross', th: 'EMA Cross' },
    ICT: { en: 'ICT', th: 'ICT' },
    'Price Action': { en: 'Price Action', th: 'Price Action' },
    Other: { en: 'Other', th: 'อื่น ๆ' },
  },
  sessions: {
    London: { en: 'London', th: 'ลอนดอน' },
    'New York': { en: 'New York', th: 'นิวยอร์ก' },
    Tokyo: { en: 'Tokyo', th: 'โตเกียว' },
    Sydney: { en: 'Sydney', th: 'ซิดนีย์' },
    'London/NY Overlap': { en: 'London/NY Overlap', th: 'ช่วงทับซ้อนลอนดอน/นิวยอร์ก' },
  },
  sessionBuckets: {
    Asia: { en: 'Asia', th: 'เอเชีย' },
    London: { en: 'London', th: 'ลอนดอน' },
    'New York': { en: 'New York', th: 'นิวยอร์ก' },
    Other: { en: 'Other', th: 'อื่น ๆ' },
  },
  timeframes: {
    M5: { en: 'M5', th: 'M5' },
    M15: { en: 'M15', th: 'M15' },
    H1: { en: 'H1', th: 'H1' },
    H4: { en: 'H4', th: 'H4' },
  },
  emotions: {
    Calm: { en: 'Calm', th: 'นิ่ง' },
    Excited: { en: 'Excited', th: 'ตื่นเต้น' },
    Fearful: { en: 'Fearful', th: 'กลัว' },
    Greedy: { en: 'Greedy', th: 'โลภ' },
    FOMO: { en: 'FOMO', th: 'FOMO' },
    Confident: { en: 'Confident', th: 'มั่นใจ' },
    Revenge: { en: 'Revenge', th: 'ล้างแค้น' },
    Neutral: { en: 'Neutral', th: 'ปกติ' },
  },
  results: {
    Win: { en: 'Win', th: 'ชนะ' },
    Loss: { en: 'Loss', th: 'แพ้' },
    BE: { en: 'BE', th: 'เสมอตัว' },
  },
}

function createInitialTradeForm(defaults = {}) {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  const initialDate = local.toISOString().slice(0, 16)

  return {
    date: initialDate,
    pair: defaults.defaultPair || 'XAUUSD',
    type: 'Buy',
    entry: '2650',
    sl: '2640',
    tp: '2675',
    lot: '0.50',
    result: 'Win',
    strategy: defaults.defaultStrategy || 'SMC',
    session: suggestSessionFromDate(initialDate, defaults.defaultSession || 'London'),
    timeframe: defaults.defaultTimeframe || 'M15',
    emotion: defaults.defaultEmotion || 'Calm',
    followPlan: 'Yes',
    tags: 'london, setup-a',
    note: '',
  }
}

function formatDateByLanguage(date, language, dateFormat = '', options = {}) {
  const locale = dateFormat || (language === 'th' ? 'th-TH' : 'en-US')
  return new Date(date).toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
    ...options,
  })
}

function getGreetingByLanguage(language) {
  const hour = new Date().getHours()
  const greetingCopy = copy[language].greeting
  if (hour < 12) return greetingCopy.morning
  if (hour < 17) return greetingCopy.afternoon
  return greetingCopy.evening
}

function getTranslatedLabel(group, value, language) {
  if (!value) return value
  return labelMaps[group]?.[value]?.[language] || value
}

function buildChartPath(points, width, height) {
  if (!points.length) return ''

  const max = Math.max(...points.map((point) => point.value))
  const min = Math.min(...points.map((point) => point.value))
  const range = max - min || 1

  return points
    .map((point, index) => {
      const x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * width
      const y = height - ((point.value - min) / range) * height
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')
}

function buildAreaPath(points, width, height) {
  if (!points.length) return ''

  const max = Math.max(...points.map((point) => point.value))
  const min = Math.min(...points.map((point) => point.value))
  const range = max - min || 1

  const coordinates = points.map((point, index) => {
    const x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * width
    const y = height - ((point.value - min) / range) * height
    return `${x.toFixed(2)} ${y.toFixed(2)}`
  })

  return `M 0 ${height} L ${coordinates.join(' L ')} L ${width} ${height} Z`
}

function buildBars(values = [], max = 100) {
  const safeValues = values.filter((value) => Number.isFinite(value) && value >= 0)
  const baseline = safeValues.length ? Math.max(...safeValues, 1) : 1

  return values.map((value) => {
    const scaled = ((Number(value) || 0) / baseline) * max
    return Math.max(Math.round(scaled), 8)
  })
}

function buildConicGradient(segments = []) {
  const activeSegments = segments.filter((segment) => segment.value > 0)
  if (!activeSegments.length) {
    return 'conic-gradient(from -90deg, rgba(255,255,255,0.08) 0deg 360deg)'
  }

  const total = activeSegments.reduce((sum, segment) => sum + segment.value, 0) || 1
  let startAngle = 0

  const stops = activeSegments.map((segment) => {
    const angle = (segment.value / total) * 360
    const endAngle = startAngle + angle
    const stop = `${segment.color} ${startAngle.toFixed(2)}deg ${endAngle.toFixed(2)}deg`
    startAngle = endAngle
    return stop
  })

  if (startAngle < 360) {
    stops.push(`rgba(255,255,255,0.06) ${startAngle.toFixed(2)}deg 360deg`)
  }

  return `conic-gradient(from -90deg, ${stops.join(', ')})`
}

function formatRelativeTradeAge(dateString) {
  const timestamp = new Date(dateString).getTime()
  if (Number.isNaN(timestamp)) return ''

  const diffMs = Date.now() - timestamp
  const diffMinutes = Math.max(Math.floor(diffMs / 60000), 0)

  if (diffMinutes < 60) return `${diffMinutes}m ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`

  const diffWeeks = Math.floor(diffDays / 7)
  if (diffWeeks < 5) return `${diffWeeks}w ago`

  const diffMonths = Math.floor(diffDays / 30)
  return `${Math.max(diffMonths, 1)}mo ago`
}

function getMarketBadge(pair = '') {
  const marketMap = {
    XAUUSD: 'AU',
    EURUSD: 'EU',
    GBPUSD: 'GB',
    USDJPY: 'JP',
    BTCUSD: 'BT',
    NASDAQ: 'NQ',
    SP500: 'SP',
  }

  return marketMap[pair] || pair.slice(0, 2).toUpperCase()
}

function AnimatedMetric({ value, format, className }) {
  const [displayValue, setDisplayValue] = useState(value)
  const previousValueRef = useRef(value)

  useEffect(() => {
    const duration = 650
    const start = previousValueRef.current
    const delta = value - start
    let frameId = 0
    const startAt = performance.now()

    const tick = (now) => {
      const progress = Math.min((now - startAt) / duration, 1)
      const eased = 1 - (1 - progress) ** 3
      setDisplayValue(start + delta * eased)
      if (progress < 1) frameId = window.requestAnimationFrame(tick)
    }

    frameId = window.requestAnimationFrame(tick)
    return () => {
      previousValueRef.current = value
      window.cancelAnimationFrame(frameId)
    }
  }, [value])

  return <div className={className}>{format(displayValue)}</div>
}

function App() {
  const HISTORY_PAGE_SIZE = 10
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, setTheme } = useTheme()
  const { user, profile, loading, authError, firebaseReady, refreshProfile } = useAuth()
  const [language, setLanguage] = useState('en')
  const [isDemo, setIsDemo] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({ displayName: '', email: '', password: '' })
  const [authMessage, setAuthMessage] = useState('')
  const [authSubmitting, setAuthSubmitting] = useState(false)
  const [tradeForm, setTradeForm] = useState(() => createInitialTradeForm())
  const [filters, setFilters] = useState({ pair: '', result: '', strategy: '' })
  const [toast, setToast] = useState('')
  const [selectedTrade, setSelectedTrade] = useState(null)
  const [submittingTrade, setSubmittingTrade] = useState(false)
  const [historyTrades, setHistoryTrades] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyPage, setHistoryPage] = useState(1)
  const [demoAccountBalance, setDemoAccountBalance] = useState(DEMO_SUMMARY.accountBalance)
  const [demoCurrencyCode, setDemoCurrencyCode] = useState('USD')

  const t = copy[language]
  const activePage = useMemo(() => getPageFromPath(location.pathname), [location.pathname])
  const goToPage = (page, options = {}) => navigate(PAGE_ROUTES[page] || PAGE_ROUTES.dashboard, options)
  const navItems = useMemo(
    () => [
      { id: 'dashboard', label: t.nav.dashboard, icon: 'O' },
      { id: 'add', label: t.nav.add, icon: '+' },
      { id: 'history', label: t.nav.history, icon: '=' },
      { id: 'settings', label: t.nav.settings || 'Settings', icon: '⚙' },
    ],
    [t],
  )

  const activeUid = isDemo ? 'demo-user' : user?.uid
  const { trades, loading: tradesLoading, loadTrades, loadAllTrades, addTrade, removeTrade } =
    useTrades(activeUid, isDemo)

  useEffect(() => {
    if (!activeUid) return
    loadTrades(filters, true)
  }, [activeUid, filters, loadTrades])

  useEffect(() => {
    if (!toast) return undefined
    const timeoutId = window.setTimeout(() => setToast(''), 2500)
    return () => window.clearTimeout(timeoutId)
  }, [toast])

  useEffect(() => {
    const isKnownRoute = Object.values(PAGE_ROUTES).includes(location.pathname)
    if ((isDemo || user) && !isKnownRoute) {
      navigate(PAGE_ROUTES.dashboard, { replace: true })
    }
  }, [isDemo, location.pathname, navigate, user])

  useEffect(() => {
    let isMounted = true

    async function prepareHistoryTrades() {
      if (activePage !== 'history' || !activeUid) return

      const hasFilters = Boolean(filters.pair || filters.result || filters.strategy)

      if (isDemo || hasFilters) {
        setHistoryTrades(trades)
        return
      }

      setHistoryLoading(true)
      try {
        const allTrades = await loadAllTrades()
        if (!isMounted) return

        const sortedTrades = [...allTrades].sort(
          (left, right) => new Date(right.date) - new Date(left.date),
        )
        setHistoryTrades(sortedTrades)
      } finally {
        if (isMounted) setHistoryLoading(false)
      }
    }

    prepareHistoryTrades()

    return () => {
      isMounted = false
    }
  }, [activePage, activeUid, filters.pair, filters.result, filters.strategy, isDemo, loadAllTrades, trades])

  const rr = useMemo(
    () => calcRR(Number(tradeForm.entry), Number(tradeForm.sl), Number(tradeForm.tp), tradeForm.type),
    [tradeForm.entry, tradeForm.sl, tradeForm.tp, tradeForm.type],
  )

  const openingBalance = useMemo(() => {
    if (isDemo) return demoAccountBalance
    return profile?.accountBalance ?? DEMO_SUMMARY.accountBalance
  }, [demoAccountBalance, isDemo, profile?.accountBalance])

  const loadedTradesProfit = useMemo(
    () => trades.reduce((sum, trade) => sum + (Number(trade.pnl) || 0), 0),
    [trades],
  )

  const currencyCode = useMemo(() => {
    if (isDemo) return demoCurrencyCode
    return profile?.currencyCode || 'USD'
  }, [demoCurrencyCode, isDemo, profile?.currencyCode])
  const tradingPreferences = useMemo(() => profile?.tradingPreferences || {}, [profile?.tradingPreferences])
  const journalPreferences = useMemo(() => profile?.journalPreferences || {}, [profile?.journalPreferences])
  const riskSettings = useMemo(() => profile?.riskSettings || {}, [profile?.riskSettings])
  const customLists = useMemo(() => profile?.customLists || {}, [profile?.customLists])
  const customStrategies = useMemo(() => customLists.strategies || [], [customLists.strategies])
  const customSessions = useMemo(() => customLists.sessions || [], [customLists.sessions])
  const customTimeframes = useMemo(() => customLists.timeframes || [], [customLists.timeframes])
  const customEmotions = useMemo(() => customLists.emotions || [], [customLists.emotions])
  const customTags = useMemo(() => customLists.tags || [], [customLists.tags])
  const pairOptions = useMemo(() => Array.from(new Set([...PAIRS, ...(customLists.pairs || [])])), [customLists.pairs])
  const strategyOptions = useMemo(() => Array.from(new Set([...STRATEGIES, ...customStrategies])), [customStrategies])
  const sessionOptions = useMemo(() => Array.from(new Set([...SESSIONS, ...customSessions])), [customSessions])
  const timeframeOptions = useMemo(
    () => Array.from(new Set([...TIMEFRAMES, ...customTimeframes])),
    [customTimeframes],
  )
  const emotionOptions = useMemo(() => Array.from(new Set([...EMOTIONS, ...customEmotions])), [customEmotions])
  const journalDateFormat = journalPreferences.dateFormat || ''

  const dashboardStats = useMemo(
    () => buildDashboardAnalytics(trades, openingBalance + loadedTradesProfit),
    [loadedTradesProfit, openingBalance, trades],
  )

  const accountBalance = useMemo(
    () => parseFloat((openingBalance + dashboardStats.totalProfit).toFixed(2)),
    [dashboardStats.totalProfit, openingBalance],
  )

  const tradeStructureValid = useMemo(
    () =>
      isTradeStructureValid(tradeForm.type, Number(tradeForm.entry), Number(tradeForm.sl), Number(tradeForm.tp)),
    [tradeForm.entry, tradeForm.sl, tradeForm.tp, tradeForm.type],
  )

  const calculatedSession = useMemo(
    () => tradeForm.session || suggestSessionFromDate(tradeForm.date, tradingPreferences.defaultSession || 'London'),
    [tradeForm.date, tradeForm.session, tradingPreferences.defaultSession],
  )

  const stopLossPnl = useMemo(
    () =>
      calculateTradePnl({
        pair: tradeForm.pair,
        type: tradeForm.type,
        entry: tradeForm.entry,
        sl: tradeForm.sl,
        tp: tradeForm.tp,
        lot: tradeForm.lot,
        result: 'Loss',
      }),
    [tradeForm.entry, tradeForm.lot, tradeForm.pair, tradeForm.sl, tradeForm.tp, tradeForm.type],
  )

  const calculatedRiskPercent = useMemo(() => {
    if (!tradeStructureValid || accountBalance <= 0) return 0
    return parseFloat(((Math.abs(stopLossPnl) / accountBalance) * 100).toFixed(2))
  }, [accountBalance, stopLossPnl, tradeStructureValid])

  const calculatedPnl = useMemo(() => {
    if (!tradeStructureValid) return 0
    return calculateTradePnl({
      pair: tradeForm.pair,
      type: tradeForm.type,
      entry: tradeForm.entry,
      sl: tradeForm.sl,
      tp: tradeForm.tp,
      lot: tradeForm.lot,
      result: tradeForm.result,
    })
  }, [tradeForm.entry, tradeForm.lot, tradeForm.pair, tradeForm.result, tradeForm.sl, tradeForm.tp, tradeForm.type, tradeStructureValid])

  const invalidTradeStructureMessage =
    language === 'th'
      ? 'ระดับ Entry, Stop loss และ Take profit ยังไม่สัมพันธ์กับประเภท Buy/Sell'
      : 'Entry, stop loss, and take profit do not match the selected Buy/Sell direction'

  function handleTradeDateChange(nextDate) {
    setTradeForm((current) => {
      const fallbackSession = tradingPreferences.defaultSession || 'London'
      const currentSuggested = suggestSessionFromDate(current.date, fallbackSession)
      const nextSuggested = suggestSessionFromDate(nextDate, fallbackSession)

      return {
        ...current,
        date: nextDate,
        session: current.session === currentSuggested ? nextSuggested : current.session,
      }
    })
  }

  const summary = useMemo(() => {
    const displayName =
      isDemo ? DEMO_SUMMARY.displayName : profile?.displayName || t.general.traderFallback
    const email = isDemo ? DEMO_SUMMARY.email : profile?.email || user?.email || ''

    return {
      displayName,
      email,
      totalTrades: dashboardStats.totalTrades,
      winCount: dashboardStats.wins,
      lossCount: dashboardStats.losses,
      beCount: dashboardStats.bes,
      totalProfit: dashboardStats.totalProfit,
      avgRR: dashboardStats.avgRR,
      avgRisk: dashboardStats.avgRisk,
      winRate: dashboardStats.totalTrades ? (dashboardStats.wins / dashboardStats.totalTrades) * 100 : 0,
    }
  }, [dashboardStats, isDemo, profile, t.general.traderFallback, user?.email])

  const recentTrades = dashboardStats.recentTrades
  const equityCurvePath = useMemo(
    () => buildChartPath(dashboardStats.equityCurve, 100, 100),
    [dashboardStats.equityCurve],
  )
  const equityAreaPath = useMemo(
    () => buildAreaPath(dashboardStats.equityCurve, 100, 100),
    [dashboardStats.equityCurve],
  )
  const currencySymbol = getCurrencyMeta(currencyCode).symbol
  const greeting = `${getGreetingByLanguage(language)}, ${summary.displayName}`
  const periodLabel = language === 'th' ? 'เดือนนี้' : 'This Month'
  const equityLabel = language === 'th' ? 'ทั้งหมด' : 'All Time'
  const uiText = useMemo(
    () => ({
      totalPnl: language === 'th' ? 'P&L รวม' : 'Total P&L',
      performanceBySetup: language === 'th' ? 'ผลงานตาม Setup' : 'Performance by Setup',
      winLoss: language === 'th' ? 'ชนะ / แพ้' : 'Win / Loss',
      bestSessionPnl: language === 'th' ? 'ช่วงเวลาที่ดีที่สุด (P&L)' : 'Best Session (P&L)',
      viewAllSessions: language === 'th' ? 'ดู Sessions ทั้งหมด' : 'View All Sessions',
      viewAll: language === 'th' ? 'ดูทั้งหมด' : 'View All',
      lotsSuffix: language === 'th' ? 'ล็อต' : 'Lots',
      topWinningSetup: language === 'th' ? 'Setup ที่ชนะมากที่สุด' : 'Top Winning Setup',
      riskManagement: language === 'th' ? 'การบริหารความเสี่ยง' : 'Risk Management',
      avgRiskPerTrade: language === 'th' ? 'ความเสี่ยงเฉลี่ยต่อไม้' : 'Avg Risk per Trade',
      profileSavedDemo: language === 'th' ? 'บันทึกโปรไฟล์ในโหมดเดโมแล้ว' : 'Profile settings saved in demo mode',
      profileUpdated: language === 'th' ? 'อัปเดตโปรไฟล์แล้ว' : 'Profile updated',
      tradingSavedDemo:
        language === 'th' ? 'บันทึกการตั้งค่าการเทรดในโหมดเดโมแล้ว' : 'Trading preferences saved in demo mode',
      tradingUpdated: language === 'th' ? 'อัปเดตการตั้งค่าการเทรดแล้ว' : 'Trading preferences updated',
      journalSavedDemo:
        language === 'th' ? 'บันทึกการตั้งค่าวารสารในโหมดเดโมแล้ว' : 'Journal preferences saved in demo mode',
      journalUpdated: language === 'th' ? 'อัปเดตการตั้งค่าวารสารแล้ว' : 'Journal preferences updated',
      riskSavedDemo: language === 'th' ? 'บันทึกการตั้งค่าความเสี่ยงในโหมดเดโมแล้ว' : 'Risk settings saved in demo mode',
      riskUpdated: language === 'th' ? 'อัปเดตการตั้งค่าความเสี่ยงแล้ว' : 'Risk settings updated',
      listsSavedDemo: language === 'th' ? 'บันทึกรายการกำหนดเองในโหมดเดโมแล้ว' : 'Custom lists saved in demo mode',
      listsUpdated: language === 'th' ? 'อัปเดตรายการกำหนดเองแล้ว' : 'Custom lists updated',
      importedTrades: (count) =>
        language === 'th' ? `นำเข้า ${count} รายการแล้ว` : `Imported ${count} trade(s)`,
      winRate: language === 'th' ? 'อัตราชนะ' : 'Win Rate',
      notAvailable: language === 'th' ? 'ไม่มีข้อมูล' : 'N/A',
    }),
    [language],
  )
  const topSetup = dashboardStats.strategies[0] || null
  const sessionLeaders = dashboardStats.sessions.slice(0, 3)
  const setupBreakdown = useMemo(() => {
    const palette = ['#4f7cff', '#7a5cff', '#f3b84b', '#2dd4bf']
    const rows = dashboardStats.strategies.slice(0, 4)
    const total = rows.reduce((sum, row) => sum + row.count, 0) || 1

    return rows.map((row, index) => ({
      ...row,
      share: (row.count / total) * 100,
      value: (row.count / total) * 100,
      color: palette[index] || '#8ea0c7',
    }))
  }, [dashboardStats.strategies])
  const winLossSegments = useMemo(
    () => [
      { label: t.addTrade.win, value: summary.winRate, color: '#31d0aa' },
      {
        label: t.addTrade.loss,
        value: summary.totalTrades ? (summary.lossCount / summary.totalTrades) * 100 : 0,
        color: '#ff5c5c',
      },
      {
        label: t.addTrade.be,
        value: summary.totalTrades ? (summary.beCount / summary.totalTrades) * 100 : 0,
        color: '#93a0bf',
      },
    ],
    [summary, t.addTrade.be, t.addTrade.loss, t.addTrade.win],
  )
  const statBars = useMemo(() => {
    const recentTradeWindow = recentTrades.slice(0, 8).reverse()
    if (!recentTradeWindow.length) return []

    const tradesPerDay = recentTradeWindow.reduce((acc, trade) => {
      const dateKey = (trade.date || '').slice(0, 10)
      acc[dateKey] = (acc[dateKey] || 0) + 1
      return acc
    }, {})

    return buildBars(
      recentTradeWindow.map((trade) => {
        const dateKey = (trade.date || '').slice(0, 10)
        return tradesPerDay[dateKey] || 1
      }),
      100,
    )
  }, [recentTrades])
  const totalProfitSparkline = useMemo(
    () =>
      buildChartPath(
        dashboardStats.equityCurve.slice(-12).map((point) => ({ value: point.value })),
        100,
        36,
      ),
    [dashboardStats.equityCurve],
  )
  const avgRrSparkline = useMemo(
    () =>
      buildChartPath(
        recentTrades
          .slice(0, 8)
          .reverse()
          .map((trade) => ({ value: Number(trade.rr) || 0 })),
        100,
        36,
      ),
    [recentTrades],
  )
  const topSetupSparkline = useMemo(
    () =>
      buildChartPath(
        dashboardStats.strategies
          .slice(0, 6)
          .reverse()
          .map((strategy) => ({ value: strategy.profit || 0 })),
        100,
        36,
      ),
    [dashboardStats.strategies],
  )
  const lastEquityPoint = dashboardStats.equityCurve[dashboardStats.equityCurve.length - 1] || null
  const equityAxisLabels = useMemo(() => {
    if (!dashboardStats.equityCurve.length) return []

    const values = dashboardStats.equityCurve.map((point) => point.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min || 1

    return [1, 0.66, 0.33, 0].map((ratio) => {
      const value = min + range * ratio
      return formatMoney(value, currencyCode)
    })
  }, [currencyCode, dashboardStats.equityCurve])
  const winLossGradient = useMemo(() => buildConicGradient(winLossSegments), [winLossSegments])
  const setupGradient = useMemo(() => buildConicGradient(setupBreakdown), [setupBreakdown])
  const topSessionRows = useMemo(() => dashboardStats.sessions.slice(0, 3), [dashboardStats.sessions])
  const topTimeframeRows = useMemo(() => dashboardStats.timeframes.slice(0, 3), [dashboardStats.timeframes])
  const topStrategyRows = useMemo(() => dashboardStats.strategies.slice(0, 4), [dashboardStats.strategies])
  const maxStrategyProfit = useMemo(
    () => Math.max(...dashboardStats.strategies.map((item) => Math.abs(item.profit)), 1),
    [dashboardStats.strategies],
  )
  const riskStatus = summary.avgRisk <= 1.2 ? 'Good' : summary.avgRisk <= 1.8 ? 'Watch' : 'High'
  const riskStatusClass =
    summary.avgRisk <= 1.2 ? 'risk-good' : summary.avgRisk <= 1.8 ? 'risk-watch' : 'risk-high'
  const settingsData = useMemo(
    () => ({
      profile: {
        displayName: summary.displayName,
        email: summary.email,
      },
      trading: {
        currencyCode,
        accountBalance: openingBalance,
        defaultPair: tradingPreferences.defaultPair || 'XAUUSD',
        defaultTimeframe: tradingPreferences.defaultTimeframe || 'M15',
        defaultStrategy: tradingPreferences.defaultStrategy || 'SMC',
        defaultSession: tradingPreferences.defaultSession || 'London',
        defaultEmotion: tradingPreferences.defaultEmotion || 'Calm',
      },
      journal: {
        language,
        theme,
        dateFormat: journalDateFormat || (language === 'th' ? 'th-TH' : 'en-US'),
        defaultPairFilter: journalPreferences.defaultPairFilter || '',
        defaultResultFilter: journalPreferences.defaultResultFilter || '',
        defaultStrategyFilter: journalPreferences.defaultStrategyFilter || '',
      },
      risk: {
        targetRiskPerTrade: riskSettings.targetRiskPerTrade ?? 1,
        maxDailyLoss: riskSettings.maxDailyLoss ?? 300,
        maxWeeklyLoss: riskSettings.maxWeeklyLoss ?? 1000,
        alertThreshold: riskSettings.alertThreshold ?? 80,
      },
      customLists: {
        strategies: customStrategies,
        sessions: customSessions,
        timeframes: customTimeframes,
        emotions: customEmotions,
        tags: customTags,
      },
      meta: {
        firebaseReady,
        workspace: isDemo ? 'Demo' : 'Live',
        version: '0.2.0',
      },
    }),
    [
      summary,
      currencyCode,
      openingBalance,
      tradingPreferences,
      language,
      theme,
      journalDateFormat,
      journalPreferences,
      riskSettings,
      customStrategies,
      customSessions,
      customTimeframes,
      customEmotions,
      customTags,
      firebaseReady,
      isDemo,
    ],
  )
  const optionSets = useMemo(
    () => ({
      currencies: CURRENCY_OPTIONS,
      pairs: pairOptions,
      strategies: strategyOptions,
      sessions: sessionOptions,
      timeframes: timeframeOptions,
      emotions: emotionOptions,
    }),
    [emotionOptions, pairOptions, sessionOptions, strategyOptions, timeframeOptions],
  )
  const settingsPageKey = useMemo(() => JSON.stringify(settingsData), [settingsData])
  const isInitialTradesLoading = tradesLoading && !trades.length
  const historyTotalPages = Math.max(1, Math.ceil(historyTrades.length / HISTORY_PAGE_SIZE))
  const currentHistoryPage = Math.min(historyPage, historyTotalPages)
  const historyStartIndex = historyTrades.length
    ? (currentHistoryPage - 1) * HISTORY_PAGE_SIZE + 1
    : 0
  const historyEndIndex = Math.min(currentHistoryPage * HISTORY_PAGE_SIZE, historyTrades.length)
  const visibleHistoryTrades = useMemo(() => {
    const startIndex = (currentHistoryPage - 1) * HISTORY_PAGE_SIZE
    return historyTrades.slice(startIndex, startIndex + HISTORY_PAGE_SIZE)
  }, [currentHistoryPage, historyTrades])
  const isHistoryLoading = activePage === 'history' && (historyLoading || (tradesLoading && !historyTrades.length))
  const showHistoryLoadingState = isHistoryLoading && !historyTrades.length

  async function persistProfileUpdates(updates) {
    if (isDemo || !user?.uid) return
    await updateUserPreferences(user.uid, updates)
    await refreshProfile(user.uid)
  }

  function downloadFile(filename, content, type) {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)
  }

  async function handleSaveProfileSettings(nextProfile) {
    if (isDemo) {
      setToast(uiText.profileSavedDemo)
      return
    }

    await persistProfileUpdates({
      displayName: nextProfile.displayName.trim() || t.general.traderFallback,
    })
    setToast(uiText.profileUpdated)
  }

  async function handleSaveTradingSettings(nextTrading) {
    const normalized = {
      currencyCode: nextTrading.currencyCode,
      accountBalance: Math.max(Number(nextTrading.accountBalance) || 0, 0),
      tradingPreferences: {
        defaultPair: nextTrading.defaultPair,
        defaultTimeframe: nextTrading.defaultTimeframe,
        defaultStrategy: nextTrading.defaultStrategy,
        defaultSession: nextTrading.defaultSession,
        defaultEmotion: nextTrading.defaultEmotion,
      },
    }

    if (isDemo) {
      setDemoCurrencyCode(normalized.currencyCode)
      setDemoAccountBalance(normalized.accountBalance)
      setTradeForm(createInitialTradeForm(normalized.tradingPreferences))
      setToast(uiText.tradingSavedDemo)
      return
    }

    await persistProfileUpdates(normalized)
    setTradeForm(createInitialTradeForm(normalized.tradingPreferences))
    setToast(uiText.tradingUpdated)
  }

  async function handleSaveJournalSettings(nextJournal) {
    setLanguage(nextJournal.language)
    setTheme(nextJournal.theme)

    const nextFilters = {
      pair: nextJournal.defaultPairFilter,
      result: nextJournal.defaultResultFilter,
      strategy: nextJournal.defaultStrategyFilter,
    }

    setFilters(nextFilters)

    if (isDemo) {
      setToast(uiText.journalSavedDemo)
      return
    }

    await persistProfileUpdates({
      journalPreferences: {
        language: nextJournal.language,
        theme: nextJournal.theme,
        dateFormat: nextJournal.dateFormat,
        defaultPairFilter: nextJournal.defaultPairFilter,
        defaultResultFilter: nextJournal.defaultResultFilter,
        defaultStrategyFilter: nextJournal.defaultStrategyFilter,
      },
    })
    setToast(uiText.journalUpdated)
  }

  async function handleSaveRiskSettings(nextRisk) {
    const normalized = {
      targetRiskPerTrade: Number(nextRisk.targetRiskPerTrade) || 0,
      maxDailyLoss: Number(nextRisk.maxDailyLoss) || 0,
      maxWeeklyLoss: Number(nextRisk.maxWeeklyLoss) || 0,
      alertThreshold: Number(nextRisk.alertThreshold) || 0,
    }

    if (isDemo) {
      setToast(uiText.riskSavedDemo)
      return
    }

    await persistProfileUpdates({ riskSettings: normalized })
    setToast(uiText.riskUpdated)
  }

  async function handleSaveCustomLists(nextLists) {
    if (isDemo) {
      setToast(uiText.listsSavedDemo)
      return
    }

    await persistProfileUpdates({
      customLists: nextLists,
    })
    setToast(uiText.listsUpdated)
  }

  async function handleExportJson() {
    const allTrades = isDemo ? [...DEMO_TRADES] : await loadAllTrades()
    const payload = {
      exportedAt: new Date().toISOString(),
      profile: settingsData,
      trades: allTrades,
    }
    downloadFile(
      `trading-journal-backup-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(payload, null, 2),
      'application/json',
    )
  }

  async function handleExportCsv() {
    const allTrades = isDemo ? [...DEMO_TRADES] : await loadAllTrades()
    const headers = [
      'date',
      'pair',
      'type',
      'result',
      'entry',
      'sl',
      'tp',
      'pnl',
      'lot',
      'riskPercent',
      'strategy',
      'session',
      'timeframe',
      'emotion',
      'followPlan',
      'tags',
      'note',
    ]

    const rows = allTrades.map((trade) =>
      headers
        .map((key) => `"${String(trade[key] ?? '').replaceAll('"', '""')}"`)
        .join(','),
    )

    downloadFile(
      `trading-journal-${new Date().toISOString().slice(0, 10)}.csv`,
      [headers.join(','), ...rows].join('\n'),
      'text/csv;charset=utf-8',
    )
  }

  async function handleImportJson(file) {
    const text = await file.text()
    const payload = JSON.parse(text)
    const importedTrades = Array.isArray(payload.trades) ? payload.trades : []

    for (const trade of importedTrades) {
      const tradePayload = { ...trade }
      delete tradePayload.id
      delete tradePayload.createdAt
      await addTrade(tradePayload)
    }

    setToast(uiText.importedTrades(importedTrades.length))
  }

  async function handleAuthSubmit(event) {
    event.preventDefault()
    setAuthSubmitting(true)
    setAuthMessage('')

    try {
      if (authMode === 'register') {
        await registerUser(authForm.email, authForm.password, authForm.displayName)
      } else {
        await loginUser(authForm.email, authForm.password)
      }

      setIsDemo(false)
      goToPage('dashboard', { replace: true })
      setAuthForm({ displayName: '', email: '', password: '' })
    } catch (error) {
      setAuthMessage(error.message)
    } finally {
      setAuthSubmitting(false)
    }
  }

  function handleEnterDemo() {
    setIsDemo(true)
    goToPage('dashboard', { replace: true })
    setSelectedTrade(null)
    setToast(t.toasts.demoEnabled)
  }

  async function handleLogout() {
    if (isDemo) {
      setIsDemo(false)
      setSelectedTrade(null)
      return
    }

    await logoutUser()
    setSelectedTrade(null)
  }

  async function handleTradeSubmit(event) {
    event.preventDefault()
    setSubmittingTrade(true)

    try {
      if (!tradeStructureValid) {
        throw new Error(invalidTradeStructureMessage)
      }

      const payload = {
        ...tradeForm,
        entry: Number(tradeForm.entry),
        sl: Number(tradeForm.sl),
        tp: Number(tradeForm.tp),
        lot: Number(tradeForm.lot),
        riskPercent: calculatedRiskPercent,
        rr,
        pnl: calculatedPnl,
        session: calculatedSession,
        tags: normalizeTags(tradeForm.tags),
      }

      await addTrade(payload)

      if (!isDemo && user?.uid) {
        await refreshProfile(user.uid)
      }

      setTradeForm(createInitialTradeForm(tradingPreferences))
      goToPage('dashboard')
      setToast(t.toasts.tradeSaved)
    } catch (error) {
      setToast(error.message)
    } finally {
      setSubmittingTrade(false)
    }
  }

  async function handleDeleteTrade() {
    if (!selectedTrade) return

    try {
      await removeTrade(selectedTrade.id, selectedTrade)

      if (!isDemo && user?.uid) {
        await refreshProfile(user.uid)
      }

      setSelectedTrade(null)
      setToast(t.toasts.tradeDeleted)
    } catch (error) {
      setToast(error.message)
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        {t.general.loadingWorkspace}
      </div>
    )
  }

  if (!isDemo && !user) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <div className="language-toggle auth-language-toggle">
            <button
              type="button"
              className={`lang-btn ${language === 'th' ? 'active' : ''}`}
              onClick={() => setLanguage('th')}
            >
              ไทย
            </button>
            <button
              type="button"
              className={`lang-btn ${language === 'en' ? 'active' : ''}`}
              onClick={() => setLanguage('en')}
            >
              English
            </button>
          </div>

          <div className="auth-logo">
            <div className="logo-icon">T</div>
            <h1>{t.auth.title}</h1>
            <p>{t.auth.subtitle}</p>
          </div>

          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
              onClick={() => setAuthMode('login')}
            >
              {t.auth.login}
            </button>
            <button
              type="button"
              className={`auth-tab ${authMode === 'register' ? 'active' : ''}`}
              onClick={() => setAuthMode('register')}
            >
              {t.auth.register}
            </button>
          </div>

          <form className="auth-form" onSubmit={handleAuthSubmit}>
            {authMode === 'register' ? (
              <input
                className="form-input"
                placeholder={t.auth.displayName}
                value={authForm.displayName}
                onChange={(event) =>
                  setAuthForm((current) => ({ ...current, displayName: event.target.value }))
                }
                required
              />
            ) : null}

            <input
              className="form-input"
              type="email"
              placeholder={t.auth.email}
              value={authForm.email}
              onChange={(event) =>
                setAuthForm((current) => ({ ...current, email: event.target.value }))
              }
              required
            />

            <input
              className="form-input"
              type="password"
              placeholder={t.auth.password}
              value={authForm.password}
              onChange={(event) =>
                setAuthForm((current) => ({ ...current, password: event.target.value }))
              }
              required
            />

            {authMessage ? <div className="auth-error">{authMessage}</div> : null}
            {authError ? <div className="auth-error">{authError}</div> : null}

            <button type="submit" className="auth-btn" disabled={authSubmitting || !firebaseReady}>
              {authSubmitting
                ? t.auth.working
                : authMode === 'register'
                  ? t.auth.createAccount
                  : t.auth.signIn}
            </button>
          </form>

          <button type="button" className="auth-demo" onClick={handleEnterDemo}>
            {t.auth.demoLink}
          </button>

          <p className="auth-note">{firebaseReady ? t.auth.firebaseReady : t.auth.firebaseNotReady}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="app">
        <aside className="sidebar">
          <div className="logo">
            <div className="logo-main">
              <div className="logo-icon">T</div>
              <div>
                <div className="logo-text">{t.general.appName}</div>
                <div className="logo-sub">
                  {isDemo ? t.general.demoWorkspace : t.general.liveWorkspace}
                </div>
              </div>
            </div>
            <div className="logo-mobile-actions">
              <div className="language-toggle sidebar-language-toggle">
              <button
                type="button"
                className={`lang-btn ${language === 'th' ? 'active' : ''}`}
                onClick={() => setLanguage('th')}
              >
                ไทย
              </button>
              <button
                type="button"
                className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                onClick={() => setLanguage('en')}
              >
                English
              </button>
              </div>
              <button
                type="button"
                className="user-row action-row logo-user-row"
                onClick={handleLogout}
                title={summary.displayName}
                aria-label={summary.displayName}
              >
                <div className="avatar avatar-small">
                  {summary.displayName.slice(0, 1).toUpperCase()}
                </div>
              </button>
            </div>
          </div>

          <nav className="nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                onClick={() => goToPage(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="sidebar-bottom">
            <div className="account-bal">
              <div className="acc-label">{t.sidebar.accountBalance}</div>
              <div className="acc-value">{formatMoney(accountBalance, currencyCode)}</div>
              <div className={`acc-change ${summary.totalProfit >= 0 ? 'text-profit' : 'text-loss'}`}>
                {formatPnl(summary.totalProfit, currencyCode)} {t.sidebar.netLoadedTrades}
              </div>
            </div>

            <button type="button" className="user-row action-row" onClick={handleLogout}>
              <div className="avatar avatar-small">
                {summary.displayName.slice(0, 1).toUpperCase()}
              </div>
              <div className="user-copy">
                <div>{summary.displayName}</div>
                <div className="muted-copy">{isDemo ? t.sidebar.demoMode : summary.email}</div>
              </div>
            </button>
          </div>
        </aside>

        <main className={`main ${activePage === 'history' ? 'main-history-mobile-lock' : ''}`}>
          <header className="topbar">
            <div>
              <strong>{getGreetingByLanguage(language)}</strong>
              <span className="topbar-subtitle"> {t.general.reviewExecution}</span>
            </div>
            <div className="topbar-right">
              <div className="language-toggle topbar-language-toggle">
                <button
                  type="button"
                  className={`lang-btn ${language === 'th' ? 'active' : ''}`}
                  onClick={() => setLanguage('th')}
                >
                  ไทย
                </button>
                <button
                  type="button"
                  className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                  onClick={() => setLanguage('en')}
                >
                  English
                </button>
              </div>
              <button
                type="button"
                className="topbar-user-btn"
                onClick={handleLogout}
                title={isDemo ? t.general.leaveDemo : t.general.logout}
              >
                <span className="avatar avatar-small">
                  {summary.displayName.slice(0, 1).toUpperCase()}
                </span>
                <span className="topbar-user-copy">
                  <strong>{summary.displayName}</strong>
                  <small>{isDemo ? t.general.demo : t.general.logout}</small>
                </span>
              </button>
            </div>
          </header>

          <div className="content">
            <section className={`page ${activePage === 'dashboard' ? 'active' : ''}`}>
              <div className="dashboard-shell">
                <div className="dashboard-reference-hero">
                  <div>
                    <h1>
                      {greeting}
                      <span className="dashboard-wave"> 👋</span>
                    </h1>
                    <p>{language === 'th' ? 'ภาพรวมผลการเทรดของคุณวันนี้' : "Here's your trading performance overview"}</p>
                  </div>
                  <button type="button" className="dashboard-filter-btn" onClick={() => loadTrades(filters, true)}>
                    <span className="dashboard-filter-icon">◷</span>
                    {periodLabel}
                  </button>
                </div>

                {!firebaseReady && !isDemo ? (
                  <div className="status-banner dashboard-reference-banner">{t.dashboard.firebaseBanner}</div>
                ) : null}

                <div className="dashboard-reference-grid">
                  <div className="dashboard-reference-main">
                    <div className="dashboard-kpi-grid">
                      <article className="dashboard-kpi-card dashboard-kpi-profit">
                        <div className="dashboard-kpi-top">
                          <div className="dashboard-kpi-label">{uiText.totalPnl}</div>
                          <div className="dashboard-kpi-icon">$</div>
                        </div>
                        <AnimatedMetric
                          className="dashboard-kpi-value"
                          value={summary.totalProfit}
                          format={(value) => formatMoney(value, currencyCode)}
                        />
                        <div className="dashboard-kpi-footnote">{t.dashboard.statProfitFoot}</div>
                        <svg viewBox="0 0 100 36" className="dashboard-kpi-sparkline" preserveAspectRatio="none">
                          <path d={totalProfitSparkline} />
                        </svg>
                      </article>

                      <article className="dashboard-kpi-card">
                        <div className="dashboard-kpi-top">
                          <div className="dashboard-kpi-label">{t.dashboard.winRate}</div>
                          <div className="dashboard-kpi-icon">◔</div>
                        </div>
                        <div className="dashboard-kpi-gauge">
                          <div
                            className="dashboard-ring"
                            style={{
                              background: buildConicGradient([
                                { value: summary.winRate, color: '#4f7cff' },
                                { value: 100 - summary.winRate, color: 'rgba(255,255,255,0.06)' },
                              ]),
                            }}
                          >
                            <div className="dashboard-ring-inner">
                              <AnimatedMetric
                                className="dashboard-ring-value"
                                value={summary.winRate}
                                format={(value) => `${value.toFixed(1)}%`}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="dashboard-kpi-delta text-profit">+{summary.winCount}</div>
                      </article>

                      <article className="dashboard-kpi-card">
                        <div className="dashboard-kpi-top">
                          <div className="dashboard-kpi-label">{t.dashboard.totalTrades}</div>
                          <div className="dashboard-kpi-icon">▣</div>
                        </div>
                        <AnimatedMetric
                          className="dashboard-kpi-value"
                          value={summary.totalTrades}
                          format={(value) => Math.round(value).toLocaleString('en-US')}
                        />
                        <div className="dashboard-kpi-delta text-profit">+{recentTrades.length}</div>
                        <div className="dashboard-bar-chart">
                          {statBars.map((height, index) => (
                            <span key={index} style={{ height: `${height}%` }}></span>
                          ))}
                        </div>
                      </article>

                      <article className="dashboard-kpi-card">
                        <div className="dashboard-kpi-top">
                          <div className="dashboard-kpi-label">{t.dashboard.averageRr}</div>
                          <div className="dashboard-kpi-icon">⚖</div>
                        </div>
                        <AnimatedMetric
                          className="dashboard-kpi-value"
                          value={summary.avgRR}
                          format={(value) => value.toFixed(2)}
                        />
                        <div className={`dashboard-kpi-delta ${summary.avgRR >= 1.5 ? 'text-profit' : 'text-loss'}`}>
                          {summary.avgRR >= 1.5 ? '+' : ''}
                          {summary.avgRR.toFixed(2)}
                        </div>
                        <svg
                          viewBox="0 0 100 36"
                          className="dashboard-kpi-sparkline dashboard-kpi-sparkline-purple"
                          preserveAspectRatio="none"
                        >
                          <path d={avgRrSparkline} />
                        </svg>
                      </article>
                    </div>

                    <article className="dashboard-panel dashboard-equity-card">
                      <div className="dashboard-panel-head">
                        <div>
                          <h3>{t.dashboard.equityCurve}</h3>
                        </div>
                        <button type="button" className="dashboard-filter-btn dashboard-filter-btn-small">
                          {equityLabel}
                        </button>
                      </div>

                      {dashboardStats.equityCurve.length ? (
                        <div className="dashboard-equity-body">
                          <div className="dashboard-equity-axis-y">
                            {equityAxisLabels.map((label) => (
                              <span key={label}>{label}</span>
                            ))}
                          </div>
                          <div className="dashboard-equity-chart-shell">
                            <svg viewBox="0 0 100 100" className="equity-chart dashboard-equity-chart" preserveAspectRatio="none">
                              <defs>
                                <linearGradient id="equityGlowFill" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="rgba(76, 123, 255, 0.45)" />
                                  <stop offset="100%" stopColor="rgba(76, 123, 255, 0.02)" />
                                </linearGradient>
                              </defs>
                              <path d={equityAreaPath} className="dashboard-equity-area" />
                              <path d={equityCurvePath} className="dashboard-equity-line" />
                            </svg>
                            {lastEquityPoint ? (
                              <div className="dashboard-equity-callout">
                                <strong>{formatMoney(lastEquityPoint.value, currencyCode)}</strong>
                                <span>{formatDate(lastEquityPoint.date, { year: 'numeric' })}</span>
                              </div>
                            ) : null}
                            <div className="dashboard-equity-axis-x">
                              <span>{formatDate(dashboardStats.equityCurve[0].date, { month: 'short' })}</span>
                              <span>
                                {formatDate(dashboardStats.equityCurve[dashboardStats.equityCurve.length - 1].date, {
                                  month: 'short',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="empty-state compact-empty">
                          <strong>{t.dashboard.noTradesYet}</strong>
                          <p>{t.dashboard.addFirstSetup}</p>
                        </div>
                      )}
                    </article>

                    <div className="dashboard-reference-bottom">
                      <article className="dashboard-panel dashboard-setup-card">
                        <div className="dashboard-panel-head dashboard-panel-head-tight">
                          <div>
                            <h3>{uiText.performanceBySetup}</h3>
                          </div>
                        </div>

                        {setupBreakdown.length ? (
                          <>
                            <div className="dashboard-breakdown">
                              <div className="dashboard-donut" style={{ backgroundImage: setupGradient }}>
                                <div className="dashboard-donut-inner"></div>
                              </div>
                              <div className="dashboard-breakdown-list">
                                {setupBreakdown.map((setup) => (
                                  <div className="dashboard-breakdown-row" key={setup.name}>
                                    <span className="dashboard-breakdown-key">
                                      <i style={{ backgroundColor: setup.color }}></i>
                                      {getTranslatedLabel('strategies', setup.name, language)}
                                    </span>
                                    <strong>{setup.share.toFixed(0)}%</strong>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <button type="button" className="dashboard-link-btn" onClick={() => goToPage('history')}>
                              {language === 'th' ? 'ดู Analytics' : 'View Analytics'}
                              <span>→</span>
                            </button>
                          </>
                        ) : (
                          <div className="empty-state compact-empty">{t.dashboard.noStrategyData}</div>
                        )}
                      </article>

                      <article className="dashboard-panel dashboard-winloss-card">
                        <div className="dashboard-panel-head dashboard-panel-head-tight">
                          <div>
                            <h3>{uiText.winLoss}</h3>
                          </div>
                        </div>

                        <div className="dashboard-winloss-body">
                          <div className="dashboard-donut dashboard-donut-large" style={{ backgroundImage: winLossGradient }}>
                            <div className="dashboard-donut-inner dashboard-donut-copy">
                              <strong>{summary.winRate.toFixed(0)}%</strong>
                              <span>{t.dashboard.winRate}</span>
                            </div>
                          </div>
                          <div className="dashboard-winloss-legend">
                            {winLossSegments.map((segment) => (
                              <div className="dashboard-breakdown-row" key={segment.label}>
                                <span className="dashboard-breakdown-key">
                                  <i style={{ backgroundColor: segment.color }}></i>
                                  {segment.label}
                                </span>
                                <strong>{segment.value.toFixed(0)}%</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      </article>

                      <article className="dashboard-panel dashboard-session-card">
                        <div className="dashboard-panel-head dashboard-panel-head-tight">
                          <div>
                            <h3>{uiText.bestSessionPnl}</h3>
                          </div>
                        </div>

                        {sessionLeaders.length ? (
                          <>
                            <div className="dashboard-session-list">
                              {sessionLeaders.map((session) => (
                                <div className="dashboard-session-row" key={session.name}>
                                  <span>{getTranslatedLabel('sessions', session.name, language)}</span>
                                  <strong className={session.profit >= 0 ? 'text-profit' : 'text-loss'}>
                                    {formatPnl(session.profit, currencyCode)}
                                  </strong>
                                </div>
                              ))}
                            </div>
                            <button type="button" className="dashboard-link-btn" onClick={() => goToPage('history')}>
                              {uiText.viewAllSessions}
                              <span>→</span>
                            </button>
                          </>
                        ) : (
                          <div className="empty-state compact-empty">{t.dashboard.noSessionData}</div>
                        )}
                      </article>
                    </div>
                  </div>

                  <aside className="dashboard-side-rail">
                    <article className="dashboard-panel dashboard-recent-panel">
                      <div className="dashboard-panel-head dashboard-panel-head-tight">
                        <div>
                          <h3>{t.dashboard.recentTrades}</h3>
                        </div>
                        <button type="button" className="dashboard-text-link" onClick={() => goToPage('history')}>
                          {uiText.viewAll}
                        </button>
                      </div>

                      {isInitialTradesLoading ? (
                        <div className="loading small-loading">
                          <div className="spinner"></div>
                          {t.dashboard.loadingTrades}
                        </div>
                      ) : recentTrades.length ? (
                        <div className="dashboard-recent-list">
                          {recentTrades.slice(0, 5).map((trade) => (
                            <button
                              type="button"
                              key={trade.id}
                              className="dashboard-recent-item plain-button"
                              onClick={() => setSelectedTrade(trade)}
                            >
                              <div className="dashboard-market-badge">{getMarketBadge(trade.pair)}</div>
                              <div className="dashboard-recent-copy">
                                <div className="dashboard-recent-row">
                                  <strong>{trade.pair}</strong>
                                  <span className={`dashboard-order-chip ${trade.type === 'Buy' ? 'buy-chip' : 'sell-chip'}`}>
                                    {trade.type === 'Buy' ? t.addTrade.buy : t.addTrade.sell}
                                  </span>
                                </div>
                                <div className="dashboard-recent-meta">
                                  {(trade.lot || 0).toFixed(2)} {uiText.lotsSuffix} • {formatRelativeTradeAge(trade.date)}
                                </div>
                              </div>
                              <div className="dashboard-recent-values">
                                <strong className={trade.pnl >= 0 ? 'text-profit' : 'text-loss'}>
                                  {formatPnl(trade.pnl, currencyCode)}
                                </strong>
                                <span>{formatRR(trade.rr || 0)}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="empty-state compact-empty">{t.dashboard.noRecentTrades}</div>
                      )}
                    </article>

                    <article className="dashboard-panel dashboard-side-highlight">
                      <div className="dashboard-side-icon">🏆</div>
                      <div className="dashboard-side-label">
                        {uiText.topWinningSetup}
                      </div>
                      <strong className="dashboard-side-title">
                        {topSetup ? getTranslatedLabel('strategies', topSetup.name, language) : uiText.notAvailable}
                      </strong>
                      <div className="dashboard-side-profit text-profit">
                        {topSetup ? formatPnl(topSetup.profit, currencyCode) : t.general.noValue}
                      </div>
                      <div className="dashboard-side-meta">
                        {uiText.winRate}: {topSetup ? topSetup.winRate.toFixed(0) : 0}%
                      </div>
                      <svg viewBox="0 0 100 36" className="dashboard-side-sparkline" preserveAspectRatio="none">
                        <path d={topSetupSparkline} />
                      </svg>
                    </article>

                    <article className="dashboard-panel dashboard-side-risk">
                      <div className="dashboard-side-icon">🛡</div>
                      <div className="dashboard-side-label">
                        {uiText.riskManagement}
                      </div>
                      <div className="dashboard-risk-row">
                        <span>{uiText.avgRiskPerTrade}</span>
                      </div>
                      <strong className="dashboard-risk-value">{summary.avgRisk.toFixed(2)}%</strong>
                      <div className="dashboard-risk-bar">
                        <span
                          className={`dashboard-risk-fill ${riskStatusClass}`}
                          style={{ width: `${Math.min((summary.avgRisk / 2.5) * 100, 100)}%` }}
                        ></span>
                      </div>
                      <div className={`dashboard-risk-status ${riskStatusClass}`}>{riskStatus}</div>
                    </article>
                  </aside>
                </div>

                <div className="greeting dashboard-hero">
                  <div>
                    <h1>{summary.displayName}</h1>
                    <p>{t.dashboard.loadedTrades(summary.totalTrades || 0)}</p>
                    <small className="hero-subcopy">{t.dashboard.overviewSubtitle}</small>
                  </div>
                  <button type="button" className="period-btn" onClick={() => loadTrades(filters, true)}>
                    {t.general.refresh}
                  </button>
                </div>

                {!firebaseReady && !isDemo ? (
                  <div className="status-banner">{t.dashboard.firebaseBanner}</div>
                ) : null}

                <div className="stats-grid dashboard-stats-grid">
                  <article className="stat-card stat-card-strong">
                    <div className="stat-top">
                      <div className="stat-label">{t.dashboard.totalTrades}</div>
                      <div className="stat-icon">#</div>
                    </div>
                    <AnimatedMetric
                      className="stat-value"
                      value={summary.totalTrades}
                      format={(value) => Math.round(value).toLocaleString('en-US')}
                    />
                    <div className="stat-change muted-copy">
                      {t.dashboard.statTradesFoot(summary.winCount, summary.lossCount, summary.beCount)}
                    </div>
                  </article>

                  <article
                    className={`stat-card ${
                      summary.winRate >= 60 ? 'stat-card-positive' : summary.winRate < 50 ? 'stat-card-negative' : ''
                    }`}
                  >
                    <div className="stat-top">
                      <div className="stat-label">{t.dashboard.winRate}</div>
                      <div className="stat-icon">%</div>
                    </div>
                    <AnimatedMetric
                      className="stat-value"
                      value={summary.winRate}
                      format={(value) => `${value.toFixed(1)}%`}
                    />
                    <div className="stat-change muted-copy">
                      {summary.winRate >= 60
                        ? t.dashboard.statWinRateStrong
                        : summary.winRate < 50
                          ? t.dashboard.statWinRateWeak
                          : t.dashboard.statWinRateMid}
                    </div>
                  </article>

                  <article
                    className={`stat-card ${summary.totalProfit >= 0 ? 'stat-card-positive' : 'stat-card-negative'}`}
                  >
                    <div className="stat-top">
                      <div className="stat-label">{t.dashboard.totalProfit}</div>
                      <div className="stat-icon">{currencySymbol}</div>
                    </div>
                    <AnimatedMetric
                      className={`stat-value ${summary.totalProfit >= 0 ? 'text-profit' : 'text-loss'}`}
                      value={summary.totalProfit}
                      format={(value) => formatPnl(value, currencyCode)}
                    />
                    <div className="stat-change muted-copy">{t.dashboard.statProfitFoot}</div>
                  </article>

                  <article
                    className={`stat-card ${summary.avgRR < 1.5 ? 'stat-card-warning' : 'stat-card-positive-soft'}`}
                  >
                    <div className="stat-top">
                      <div className="stat-label">{t.dashboard.averageRr}</div>
                      <div className="stat-icon">R</div>
                    </div>
                    <AnimatedMetric
                      className="stat-value"
                      value={summary.avgRR}
                      format={(value) => value.toFixed(2)}
                    />
                    <div className="stat-change muted-copy">
                      {summary.avgRR < 1.5 ? t.dashboard.statAvgRrWeak : t.dashboard.statAvgRrStrong}
                    </div>
                  </article>
                </div>

                <article className="dashboard-panel equity-panel">
                  <div className="panel-header">
                    <div>
                      <div className="panel-eyebrow">{t.dashboard.equityCurve}</div>
                      <h3>{t.dashboard.equityCurve}</h3>
                      <p>{t.dashboard.equityCurveSubtitle}</p>
                    </div>
                    <div className="equity-summary">
                      <span
                        className={`equity-chip ${
                          summary.totalProfit >= 0 ? 'equity-chip-positive' : 'equity-chip-negative'
                        }`}
                      >
                        {summary.totalProfit >= 0 ? t.dashboard.risingCurve : t.dashboard.unstableCurve}
                      </span>
                      <strong className={summary.totalProfit >= 0 ? 'text-profit' : 'text-loss'}>
                        {formatPnl(summary.totalProfit, currencyCode)}
                      </strong>
                    </div>
                  </div>

                  {dashboardStats.equityCurve.length ? (
                    <div className="equity-chart-wrap">
                      <svg viewBox="0 0 100 100" className="equity-chart" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgba(73, 191, 131, 0.35)" />
                            <stop offset="100%" stopColor="rgba(73, 191, 131, 0.03)" />
                          </linearGradient>
                        </defs>
                        <path d={equityAreaPath} className="equity-area" />
                        <path d={equityCurvePath} className="equity-line" />
                      </svg>
                      <div className="equity-axis">
                        <span>{formatDate(dashboardStats.equityCurve[0].date)}</span>
                        <span>{formatDate(dashboardStats.equityCurve[dashboardStats.equityCurve.length - 1].date)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="empty-state compact-empty">
                      <strong>{t.dashboard.noTradesYet}</strong>
                      <p>{t.dashboard.addFirstSetup}</p>
                    </div>
                  )}
                </article>

                <div className="dashboard-section-heading">
                  <div>
                    <h2>{t.dashboard.analyticsTitle}</h2>
                    <p>{t.dashboard.analyticsSubtitle}</p>
                  </div>
                </div>

                <div className="analytics-grid">
                  <article className="dashboard-panel analytics-card">
                    <div className="panel-header">
                      <div>
                        <div className="panel-eyebrow">{t.dashboard.bestSessionLabel}</div>
                        <h3>{t.dashboard.bestTradingSession}</h3>
                      </div>
                      {dashboardStats.bestSession ? (
                        <span className="panel-badge badge-positive">
                          {getTranslatedLabel('sessions', dashboardStats.bestSession.name, language)}
                        </span>
                      ) : null}
                    </div>

                    <div className="analytics-list">
                      {topSessionRows.length ? (
                        topSessionRows.map((session) => (
                          <div
                            key={session.name}
                            className={`analytics-row ${
                              dashboardStats.bestSession?.name === session.name ? 'analytics-row-active' : ''
                            }`}
                          >
                            <div className="analytics-copy">
                                <strong>{getTranslatedLabel('sessions', session.name, language)}</strong>
                              <span>
                                {t.dashboard.sessionWinRate}: {session.winRate.toFixed(1)}%
                              </span>
                            </div>
                            <div className="analytics-value-group">
                              <strong className={session.profit >= 0 ? 'text-profit' : 'text-loss'}>
                                {formatPnl(session.profit, currencyCode)}
                              </strong>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="empty-state compact-empty">{t.dashboard.noSessionData}</div>
                      )}
                    </div>
                  </article>

                  <article className="dashboard-panel analytics-card">
                    <div className="panel-header">
                      <div>
                        <div className="panel-eyebrow">{t.dashboard.bestTimeframeLabel}</div>
                        <h3>{t.dashboard.timeframePerformance}</h3>
                      </div>
                      {dashboardStats.bestTimeframe ? (
                        <span className="panel-badge badge-accent">
                          {getTranslatedLabel('timeframes', dashboardStats.bestTimeframe.name, language)}
                        </span>
                      ) : null}
                    </div>

                    <div className="analytics-list">
                      {topTimeframeRows.length ? (
                        topTimeframeRows.map((timeframe) => (
                          <div
                            key={timeframe.name}
                            className={`analytics-row ${
                              dashboardStats.bestTimeframe?.name === timeframe.name ? 'analytics-row-active' : ''
                            }`}
                          >
                            <div className="analytics-copy">
                              <strong>{getTranslatedLabel('timeframes', timeframe.name, language)}</strong>
                              <span>
                                {t.dashboard.winRate}: {timeframe.winRate.toFixed(1)}%
                              </span>
                            </div>
                            <div className="analytics-value-group">
                              <strong>{timeframe.avgRR.toFixed(2)}R</strong>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="empty-state compact-empty">{t.dashboard.noTimeframeData}</div>
                      )}
                    </div>
                  </article>

                  <article className="dashboard-panel analytics-card">
                    <div className="panel-header">
                      <div>
                        <div className="panel-eyebrow">{t.dashboard.strategyPerformance}</div>
                        <h3>{t.dashboard.strategyPerformance}</h3>
                      </div>
                    </div>

                    {topStrategyRows.length ? (
                      <div className="strategy-bars">
                        {topStrategyRows.map((strategy) => {
                          const width = (Math.abs(strategy.profit) / maxStrategyProfit) * 100

                          return (
                            <div className="strategy-bar-row" key={strategy.name}>
                              <div className="strategy-bar-copy">
                                <strong>{getTranslatedLabel('strategies', strategy.name, language)}</strong>
                                <span>
                                  {strategy.winRate.toFixed(0)}% • {strategy.avgRR.toFixed(2)}R
                                </span>
                              </div>
                              <div className="strategy-bar-track">
                                <div
                                  className={`strategy-bar-fill ${strategy.profit >= 0 ? 'profit-fill' : 'loss-fill'}`}
                                  style={{ width: `${Math.max(width, 8)}%` }}
                                ></div>
                              </div>
                              <strong className={strategy.profit >= 0 ? 'text-profit' : 'text-loss'}>
                                {formatPnl(strategy.profit, currencyCode)}
                              </strong>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="empty-state compact-empty">{t.dashboard.noStrategyData}</div>
                    )}
                  </article>
                </div>

                <div className="dashboard-lower-grid">
                  <article className="dashboard-panel insights-card">
                    <div className="panel-header">
                      <div>
                        <div className="panel-eyebrow">{t.dashboard.aiInsights}</div>
                        <h3>{t.dashboard.aiInsights}</h3>
                        <p>{t.dashboard.aiInsightSubtitle}</p>
                      </div>
                    </div>

                    <div className="insights-list">
                      {dashboardStats.insights.length ? (
                        dashboardStats.insights.map((insight, index) => {
                          const insightClass =
                            insight.tone === 'positive'
                              ? 'insight-positive'
                              : insight.tone === 'negative'
                                ? 'insight-negative'
                                : 'insight-warning'

                          let message = ''
                          if (insight.type === 'emotionLoss') {
                            message = t.dashboard.insightEmotionLoss(
                              getTranslatedLabel('emotions', insight.emotion, language),
                              insight.lossRate,
                            )
                          }
                          if (insight.type === 'overRisk') message = t.dashboard.insightOverRisk(insight.rate)
                          if (insight.type === 'bestSession') {
                            message = t.dashboard.insightBestSession(
                                getTranslatedLabel('sessions', insight.session, language),
                            )
                          }
                          if (insight.type === 'discipline') {
                            message = t.dashboard.insightDiscipline(insight.lossRate)
                          }
                          if (insight.type === 'avgRrLow') message = t.dashboard.insightAvgRrLow(insight.avgRR)

                          return (
                            <div className={`insight-row ${insightClass}`} key={`${insight.type}-${index}`}>
                              <span className="insight-icon">
                                {insight.tone === 'positive' ? '✓' : insight.tone === 'negative' ? '×' : '!'}
                              </span>
                              <span>{message}</span>
                            </div>
                          )
                        })
                      ) : (
                        <div className="empty-state compact-empty">{t.dashboard.noInsights}</div>
                      )}
                    </div>
                  </article>

                  <article className="dashboard-panel tag-card">
                    <div className="panel-header">
                      <div>
                        <div className="panel-eyebrow">{t.dashboard.tagAnalysis}</div>
                        <h3>{t.dashboard.tagAnalysis}</h3>
                      </div>
                    </div>

                    <div className="tag-list">
                      {dashboardStats.tagAnalysis.length ? (
                        dashboardStats.tagAnalysis.map((tag) => (
                          <div className="tag-row" key={tag.name}>
                            <div>
                              <strong>{tag.name}</strong>
                              <span>
                                {tag.bias === 'loss'
                                  ? t.dashboard.tagLossInsight(tag.name, tag.lossRate)
                                  : t.dashboard.tagInsight(tag.name, tag.winRate)}
                              </span>
                            </div>
                            <span className={`tag-badge tag-${tag.bias}`}>
                              {tag.count} {tag.count === 1 ? 'trade' : 'trades'}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="empty-state compact-empty">{t.dashboard.noTags}</div>
                      )}
                    </div>
                  </article>

                  <article className="dashboard-panel recent-card">
                    <div className="panel-title">
                      <div>
                        <span>{t.dashboard.recentTrades}</span>
                        <small className="muted-copy">{t.dashboard.recentTradesSubtitle}</small>
                      </div>
                      <button type="button" className="view-all plain-button" onClick={() => goToPage('history')}>
                        {t.dashboard.openHistory}
                      </button>
                    </div>

                    {isInitialTradesLoading ? (
                      <div className="loading small-loading">
                        <div className="spinner"></div>
                        {t.dashboard.loadingTrades}
                      </div>
                    ) : recentTrades.length ? (
                      <div className="recent-trades-list">
                        {recentTrades.map((trade) => (
                          <button
                            type="button"
                            key={trade.id}
                            className="trade-item plain-button"
                            onClick={() => setSelectedTrade(trade)}
                          >
                            <div className="pair-icon">{PAIR_EMOJI[trade.pair] || trade.pair.slice(0, 2)}</div>
                            <div className="trade-info">
                              <div className="trade-pair">
                                <span>{trade.pair}</span>
                                <span className={`type-badge ${trade.type === 'Buy' ? 'badge-buy' : 'badge-sell'}`}>
                                  {trade.type === 'Buy' ? t.addTrade.buy : t.addTrade.sell}
                                </span>
                              </div>
                              <div className="trade-meta">
                                {getTranslatedLabel('results', trade.result, language)} • {formatRR(trade.rr || 0)} •{' '}
                                {trade.timeframe ? getTranslatedLabel('timeframes', trade.timeframe, language) : t.general.noValue}
                              </div>
                            </div>
                            <div>
                              <div className={`trade-pnl ${trade.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                                {formatPnl(trade.pnl, currencyCode)}
                              </div>
                              <div className="trade-rr">{formatDateByLanguage(trade.date, language, journalDateFormat)}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state">
                        <strong>{t.dashboard.noRecentTrades}</strong>
                        <p>{t.dashboard.addFirstSetup}</p>
                      </div>
                    )}
                  </article>
                </div>
              </div>
            </section>

            <section className={`page ${activePage === 'add' ? 'active' : ''}`}>
              <div className="add-trade-page">
                <div className="page-header">
                  <h2>{t.addTrade.title}</h2>
                  <p>{t.addTrade.subtitle}</p>
                </div>

                <div className="add-trade-layout">
                  <form className="add-trade-form" onSubmit={handleTradeSubmit}>
                    <div className="section-divider">{t.addTrade.sectionSetup}</div>
                    <div className="form-grid">
                      <label className="form-group">
                        <span className="form-label">{t.addTrade.date}</span>
                        <input
                          className="form-input"
                          type="datetime-local"
                          value={tradeForm.date}
                          onChange={(event) => handleTradeDateChange(event.target.value)}
                          required
                        />
                      </label>

                      <label className="form-group">
                        <span className="form-label">{t.addTrade.pair}</span>
                        <select
                          className="form-input"
                          value={tradeForm.pair}
                          onChange={(event) =>
                            setTradeForm((current) => ({ ...current, pair: event.target.value }))
                          }
                        >
                          {pairOptions.map((pair) => (
                            <option key={pair} value={pair}>
                              {pair}
                            </option>
                          ))}
                        </select>
                      </label>

                      <div className="form-group">
                        <span className="form-label">{t.addTrade.type}</span>
                        <div className="toggle-group">
                          {[
                            { value: 'Buy', label: t.addTrade.buy },
                            { value: 'Sell', label: t.addTrade.sell },
                          ].map((item) => (
                            <button
                              key={item.value}
                              type="button"
                              className={`toggle-btn ${
                                tradeForm.type === item.value
                                  ? item.value === 'Buy'
                                    ? 'buy-active'
                                    : 'sell-active'
                                  : ''
                              }`}
                              onClick={() =>
                                setTradeForm((current) => ({ ...current, type: item.value }))
                              }
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="form-group">
                        <span className="form-label">{t.addTrade.result}</span>
                        <div className="toggle-group">
                          {[
                            { value: 'Win', label: t.addTrade.win },
                            { value: 'Loss', label: t.addTrade.loss },
                            { value: 'BE', label: t.addTrade.be },
                          ].map((item) => (
                            <button
                              key={item.value}
                              type="button"
                              className={`toggle-btn ${
                                tradeForm.result === item.value
                                  ? item.value === 'Win'
                                    ? 'win-active'
                                    : item.value === 'Loss'
                                      ? 'loss-active'
                                      : 'be-active'
                                  : ''
                              }`}
                              onClick={() =>
                                setTradeForm((current) => ({ ...current, result: item.value }))
                              }
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <label className="form-group">
                        <span className="form-label">{t.addTrade.entry}</span>
                        <input
                          className="form-input"
                          type="number"
                          step="0.01"
                          value={tradeForm.entry}
                          onChange={(event) =>
                            setTradeForm((current) => ({ ...current, entry: event.target.value }))
                          }
                          required
                        />
                      </label>

                      <label className="form-group">
                        <span className="form-label">{t.addTrade.stopLoss}</span>
                        <input
                          className="form-input"
                          type="number"
                          step="0.01"
                          value={tradeForm.sl}
                          onChange={(event) =>
                            setTradeForm((current) => ({ ...current, sl: event.target.value }))
                          }
                          required
                        />
                      </label>

                      <label className="form-group">
                        <span className="form-label">{t.addTrade.takeProfit}</span>
                        <input
                          className="form-input"
                          type="number"
                          step="0.01"
                          value={tradeForm.tp}
                          onChange={(event) =>
                            setTradeForm((current) => ({ ...current, tp: event.target.value }))
                          }
                          required
                        />
                      </label>

                      <label className="form-group">
                        <span className="form-label">{t.addTrade.pnl}</span>
                        <input
                          className="form-input auto-calculated-input"
                          type="number"
                          step="0.01"
                          value={calculatedPnl.toFixed(2)}
                          readOnly
                        />
                      </label>

                      <label className="form-group">
                        <span className="form-label">{t.addTrade.lotSize}</span>
                        <input
                          className="form-input"
                          type="number"
                          step="0.01"
                          value={tradeForm.lot}
                          onChange={(event) =>
                            setTradeForm((current) => ({ ...current, lot: event.target.value }))
                          }
                        />
                      </label>

                      <label className="form-group">
                        <span className="form-label">{t.addTrade.riskPercent}</span>
                        <input
                          className="form-input auto-calculated-input"
                          type="number"
                          step="0.01"
                          value={calculatedRiskPercent.toFixed(2)}
                          readOnly
                        />
                      </label>

                      <label className="form-group">
                        <span className="form-label">{t.addTrade.strategy}</span>
                        <select
                          className="form-input"
                          value={tradeForm.strategy}
                          onChange={(event) =>
                            setTradeForm((current) => ({ ...current, strategy: event.target.value }))
                          }
                        >
                          {strategyOptions.map((strategy) => (
                            <option key={strategy} value={strategy}>
                              {getTranslatedLabel('strategies', strategy, language)}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="form-group">
                        <span className="form-label">{t.addTrade.session}</span>
                        <select
                          className="form-input auto-calculated-input"
                          value={tradeForm.session}
                          onChange={(event) =>
                            setTradeForm((current) => ({ ...current, session: event.target.value }))
                          }
                        >
                          {sessionOptions.map((session) => (
                            <option key={session} value={session}>
                              {getTranslatedLabel('sessions', session, language)}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="form-group">
                        <span className="form-label">{t.addTrade.timeframe}</span>
                        <select
                          className="form-input"
                          value={tradeForm.timeframe}
                          onChange={(event) =>
                            setTradeForm((current) => ({ ...current, timeframe: event.target.value }))
                          }
                        >
                          {timeframeOptions.map((timeframe) => (
                            <option key={timeframe} value={timeframe}>
                              {getTranslatedLabel('timeframes', timeframe, language)}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="form-group">
                        <span className="form-label">{t.addTrade.emotion}</span>
                        <select
                          className="form-input"
                          value={tradeForm.emotion}
                          onChange={(event) =>
                            setTradeForm((current) => ({ ...current, emotion: event.target.value }))
                          }
                        >
                          {emotionOptions.map((emotion) => (
                            <option key={emotion} value={emotion}>
                              {getTranslatedLabel('emotions', emotion, language)}
                            </option>
                          ))}
                        </select>
                      </label>

                      <div className="form-group">
                        <span className="form-label">{t.addTrade.followedPlan}</span>
                        <div className="toggle-group">
                          {[
                            { value: 'Yes', label: t.addTrade.yes },
                            { value: 'No', label: t.addTrade.no },
                          ].map((item) => (
                            <button
                              key={item.value}
                              type="button"
                              className={`toggle-btn ${
                                tradeForm.followPlan === item.value
                                  ? item.value === 'Yes'
                                    ? 'yes-active'
                                    : 'no-active'
                                  : ''
                              }`}
                              onClick={() =>
                                setTradeForm((current) => ({ ...current, followPlan: item.value }))
                              }
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <label className="form-group full">
                        <span className="form-label">{t.addTrade.tags}</span>
                        <input
                          className="form-input"
                          type="text"
                          value={tradeForm.tags}
                          onChange={(event) =>
                            setTradeForm((current) => ({ ...current, tags: event.target.value }))
                          }
                          placeholder={t.addTrade.tagsPlaceholder}
                        />
                      </label>

                      <label className="form-group full">
                        <span className="form-label">{t.addTrade.notes}</span>
                        <textarea
                          className="form-input textarea-input"
                          rows="4"
                          value={tradeForm.note}
                          onChange={(event) =>
                            setTradeForm((current) => ({ ...current, note: event.target.value }))
                          }
                          placeholder={t.addTrade.notesPlaceholder}
                        ></textarea>
                      </label>
                    </div>

                      <div className="rr-display">
                        <div>
                          <div className="form-label">{t.addTrade.calculatedRr}</div>
                          <div
                            className={`rr-value ${
                            rr >= 2 ? 'rr-good' : rr >= 1 ? 'rr-ok' : 'rr-bad'
                          }`}
                          >
                            {formatRR(rr)}
                          </div>
                          {!tradeStructureValid ? (
                            <div className="rr-helper-text text-loss">{invalidTradeStructureMessage}</div>
                          ) : null}
                        </div>
                        <div className="rr-bar-wrap">
                        <div
                          className="rr-bar-fill"
                          style={{
                            width: `${Math.min(rr * 30, 100)}%`,
                            background:
                              rr >= 2 ? 'var(--green)' : rr >= 1 ? 'var(--gold)' : 'var(--red)',
                          }}
                        ></div>
                      </div>
                    </div>

                    <button type="submit" className="submit-btn" disabled={submittingTrade || !tradeStructureValid}>
                      {submittingTrade ? t.addTrade.savingTrade : t.addTrade.saveTrade}
                    </button>
                  </form>

                  <aside className="add-trade-side">
                    <div className="dashboard-panel add-trade-summary-card">
                      <div className="dashboard-panel-head dashboard-panel-head-tight">
                        <div>
                          <div className="panel-eyebrow">
                            {language === 'th' ? 'ภาพรวมรายการ' : 'Trade Snapshot'}
                          </div>
                          <h3>{tradeForm.pair || t.general.noValue}</h3>
                        </div>
                        <span className={`panel-badge ${tradeForm.type === 'Buy' ? 'badge-positive' : 'badge-accent'}`}>
                          {tradeForm.type === 'Buy' ? t.addTrade.buy : t.addTrade.sell}
                        </span>
                      </div>

                      <div className="add-trade-side-grid">
                        <div className="add-trade-side-metric">
                          <span>{t.addTrade.result}</span>
                          <strong>{getTranslatedLabel('results', tradeForm.result, language)}</strong>
                        </div>
                        <div className="add-trade-side-metric">
                          <span>{t.addTrade.strategy}</span>
                          <strong>{getTranslatedLabel('strategies', tradeForm.strategy, language)}</strong>
                        </div>
                        <div className="add-trade-side-metric">
                          <span>{t.addTrade.timeframe}</span>
                          <strong>{getTranslatedLabel('timeframes', tradeForm.timeframe, language)}</strong>
                        </div>
                          <div className="add-trade-side-metric">
                            <span>{t.addTrade.session}</span>
                            <strong>{getTranslatedLabel('sessions', tradeForm.session, language)}</strong>
                          </div>
                      </div>
                    </div>

                    <div className="dashboard-panel add-trade-summary-card">
                      <div className="dashboard-panel-head">
                        <div>
                          <div className="panel-eyebrow">
                            {language === 'th' ? 'ความเสี่ยงและผลตอบแทน' : 'Risk & Reward'}
                          </div>
                          <h3>{formatRR(rr)}</h3>
                        </div>
                        <span className={`panel-badge ${rr >= 2 ? 'badge-positive' : 'badge-accent'}`}>
                          {rr >= 2 ? 'Strong' : rr >= 1 ? 'Balanced' : 'Tight'}
                        </span>
                      </div>

                      <div className="add-trade-side-list">
                        <div className="add-trade-side-row">
                          <span>{t.addTrade.entry}</span>
                          <strong>{tradeForm.entry || t.general.noValue}</strong>
                        </div>
                        <div className="add-trade-side-row">
                          <span>{t.addTrade.stopLoss}</span>
                          <strong>{tradeForm.sl || t.general.noValue}</strong>
                        </div>
                        <div className="add-trade-side-row">
                          <span>{t.addTrade.takeProfit}</span>
                          <strong>{tradeForm.tp || t.general.noValue}</strong>
                        </div>
                            <div className="add-trade-side-row">
                              <span>{t.addTrade.riskPercent}</span>
                              <strong>{`${calculatedRiskPercent.toFixed(2)}%`}</strong>
                            </div>
                          <div className="add-trade-side-row">
                            <span>{t.addTrade.pnl}</span>
                            <strong>{formatPnl(calculatedPnl, currencyCode)}</strong>
                          </div>
                      </div>
                    </div>

                    <div className="dashboard-panel add-trade-summary-card">
                      <div className="dashboard-panel-head">
                        <div>
                          <div className="panel-eyebrow">
                            {language === 'th' ? 'เช็คลิสต์ก่อนบันทึก' : 'Pre-save Check'}
                          </div>
                          <h3>{language === 'th' ? 'ทบทวนสั้นๆ' : 'Quick Review'}</h3>
                        </div>
                      </div>

                      <div className="add-trade-side-list">
                        <div className="add-trade-side-row">
                          <span>{language === 'th' ? 'ทำตามแผน' : 'Plan Status'}</span>
                          <strong>{tradeForm.followPlan === 'Yes' ? t.addTrade.yes : t.addTrade.no}</strong>
                        </div>
                        <div className="add-trade-side-row">
                          <span>{t.addTrade.emotion}</span>
                          <strong>{getTranslatedLabel('emotions', tradeForm.emotion, language)}</strong>
                        </div>
                        <div className="add-trade-side-row">
                          <span>{language === 'th' ? 'แท็ก' : 'Tags'}</span>
                          <strong>{tradeForm.tags || t.general.noValue}</strong>
                        </div>
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            </section>

            <section className={`page history-page-shell ${activePage === 'history' ? 'active' : ''}`}>
              <div className="history-page">
                <div className="page-header">
                  <h2>{t.history.title}</h2>
                  <p>{t.history.subtitle}</p>
                </div>

                <div className="filters-bar history-filters-mobile">
                  <select
                    className="filter-select"
                    value={filters.pair}
                    onChange={(event) => {
                      setHistoryPage(1)
                      setFilters((current) => ({ ...current, pair: event.target.value }))
                    }}
                  >
                    <option value="">{t.history.allPairs}</option>
                    {pairOptions.map((pair) => (
                      <option key={pair} value={pair}>
                        {pair}
                      </option>
                    ))}
                  </select>

                  <select
                    className="filter-select"
                    value={filters.result}
                    onChange={(event) => {
                      setHistoryPage(1)
                      setFilters((current) => ({ ...current, result: event.target.value }))
                    }}
                  >
                    <option value="">{t.history.allResults}</option>
                    <option value="Win">{t.addTrade.win}</option>
                    <option value="Loss">{t.addTrade.loss}</option>
                    <option value="BE">{t.addTrade.be}</option>
                  </select>

                  <select
                    className="filter-select"
                    value={filters.strategy}
                    onChange={(event) => {
                      setHistoryPage(1)
                      setFilters((current) => ({ ...current, strategy: event.target.value }))
                    }}
                  >
                    <option value="">{t.history.allStrategies}</option>
                    {strategyOptions.map((strategy) => (
                      <option key={strategy} value={strategy}>
                        {getTranslatedLabel('strategies', strategy, language)}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="period-btn filter-reset-btn"
                    onClick={() => {
                      setHistoryPage(1)
                      setFilters({ pair: '', result: '', strategy: '' })
                    }}
                    aria-label={t.general.resetFilters}
                    title={t.general.resetFilters}
                  >
                    ↺
                  </button>
                </div>

                <div className="history-results-shell">
                  <div className="table-card">
                      <table className="trades-table">
                        <thead>
                          <tr>
                          <th>{t.history.date}</th>
                          <th>{t.history.pair}</th>
                          <th>{t.history.type}</th>
                          <th>{t.history.strategy}</th>
                          <th>{t.history.result}</th>
                          <th>{t.history.rr}</th>
                          <th>{t.history.pnl}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleHistoryTrades.map((trade) => (
                          <tr key={trade.id} onClick={() => setSelectedTrade(trade)}>
                            <td>{formatDateByLanguage(trade.date, language, journalDateFormat)}</td>
                            <td className="td-pair">{trade.pair}</td>
                            <td>{trade.type === 'Buy' ? t.addTrade.buy : t.addTrade.sell}</td>
                            <td>{getTranslatedLabel('strategies', trade.strategy, language)}</td>
                            <td>
                              <span
                                className={`result-badge ${
                                  trade.result === 'Win'
                                    ? 'result-win'
                                    : trade.result === 'Loss'
                                      ? 'result-loss'
                                      : 'result-be'
                                }`}
                              >
                                {getTranslatedLabel('results', trade.result, language)}
                              </span>
                            </td>
                            <td className={trade.rr >= 2 ? 'td-rr-good' : 'td-rr-bad'}>
                              {formatRR(trade.rr || 0)}
                            </td>
                            <td className={trade.pnl >= 0 ? 'td-pnl-pos' : 'td-pnl-neg'}>
                              {formatPnl(trade.pnl, currencyCode)}
                            </td>
                          </tr>
                          ))}
                        </tbody>
                      </table>

                      {!isHistoryLoading && historyTrades.length ? (
                        <div className="history-mobile-list">
                          {visibleHistoryTrades.map((trade) => (
                            <div
                              key={`mobile-${trade.id}`}
                              className="history-mobile-card"
                              role="button"
                              tabIndex={0}
                              onClick={() => setSelectedTrade(trade)}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                  event.preventDefault()
                                  setSelectedTrade(trade)
                                }
                              }}
                            >
                              <div className="history-mobile-top">
                                <div className="history-mobile-copy">
                                  <strong>{trade.pair}</strong>
                                  <span>
                                    {formatDateByLanguage(trade.date, language, journalDateFormat)} ·{' '}
                                    {getTranslatedLabel('strategies', trade.strategy, language)}
                                  </span>
                                </div>
                                <div
                                  className={`history-mobile-pnl ${
                                    trade.pnl >= 0 ? 'text-profit' : 'text-loss'
                                  }`}
                                >
                                  {formatPnl(trade.pnl, currencyCode)}
                                </div>
                              </div>

                              <div className="history-mobile-meta">
                                <span
                                  className={`history-mobile-badge ${
                                    trade.result === 'Win'
                                      ? 'history-mobile-badge-win'
                                      : trade.result === 'Loss'
                                        ? 'history-mobile-badge-loss'
                                        : 'history-mobile-badge-be'
                                  }`}
                                >
                                  {getTranslatedLabel('results', trade.result, language)}
                                </span>
                                <span>{trade.type === 'Buy' ? t.addTrade.buy : t.addTrade.sell}</span>
                                <span>{formatRR(trade.rr || 0)}</span>
                                <span>{getTranslatedLabel('sessions', trade.session, language)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {showHistoryLoadingState ? (
                        <div className="empty-state">
                        <strong>{t.dashboard.loadingTrades}</strong>
                      </div>
                    ) : null}

                    {!showHistoryLoadingState && !historyTrades.length ? (
                      <div className="empty-state">
                        <strong>{t.history.noMatches}</strong>
                        <p>{t.history.changeFilters}</p>
                      </div>
                    ) : null}
                  </div>

                  {historyTrades.length ? (
                    <div className="pagination history-pagination">
                      <button
                        type="button"
                        className="period-btn history-page-btn"
                        onClick={() => setHistoryPage((current) => Math.max(1, current - 1))}
                        disabled={currentHistoryPage === 1}
                        aria-label={language === 'th' ? 'หน้าก่อนหน้า' : 'Previous page'}
                      >
                        {language === 'th' ? 'ก่อนหน้า' : 'Prev'}
                      </button>
                      <div className="history-pagination-meta">
                        <span className="history-pagination-label">
                          {language === 'th'
                            ? `แสดง ${historyStartIndex}-${historyEndIndex} จาก ${historyTrades.length} รายการ`
                            : `Showing ${historyStartIndex}-${historyEndIndex} of ${historyTrades.length}`}
                        </span>
                        <span className="history-page-indicator">
                          {language === 'th'
                            ? `หน้า ${currentHistoryPage} / ${historyTotalPages}`
                            : `Page ${currentHistoryPage} / ${historyTotalPages}`}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="period-btn history-page-btn"
                        onClick={() => setHistoryPage((current) => Math.min(historyTotalPages, current + 1))}
                        disabled={currentHistoryPage === historyTotalPages}
                        aria-label={language === 'th' ? 'หน้าถัดไป' : 'Next page'}
                      >
                        {language === 'th' ? 'ถัดไป' : 'Next'}
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </section>

            <section className={`page ${activePage === 'settings' ? 'active' : ''}`}>
              <SettingsPage
                key={settingsPageKey}
                language={language}
                settingsData={settingsData}
                optionSets={optionSets}
                onSaveProfile={handleSaveProfileSettings}
                onSaveTrading={handleSaveTradingSettings}
                onSaveJournal={handleSaveJournalSettings}
                onSaveRisk={handleSaveRiskSettings}
                onSaveLists={handleSaveCustomLists}
                onExportJson={handleExportJson}
                onExportCsv={handleExportCsv}
                onImportJson={handleImportJson}
                onLogout={handleLogout}
              />
            </section>
          </div>
        </main>
      </div>

      <div className={`modal-overlay ${selectedTrade ? 'open' : ''}`}>
        {selectedTrade ? (
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">
                <span>{selectedTrade.pair}</span>
                <span
                  className={`result-badge ${
                    selectedTrade.result === 'Win'
                      ? 'result-win'
                      : selectedTrade.result === 'Loss'
                        ? 'result-loss'
                        : 'result-be'
                  }`}
                >
                  {getTranslatedLabel('results', selectedTrade.result, language)}
                </span>
              </div>
              <button type="button" className="modal-close" onClick={() => setSelectedTrade(null)}>
                x
              </button>
            </div>

            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-key">{t.modal.date}</div>
                <div className="detail-val">
                  {formatDateByLanguage(selectedTrade.date, language, journalDateFormat, { year: 'numeric' })}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-key">{t.modal.type}</div>
                <div className="detail-val">
                  {selectedTrade.type === 'Buy' ? t.addTrade.buy : t.addTrade.sell}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-key">{t.modal.entrySlTp}</div>
                <div className="detail-val">
                  {selectedTrade.entry} / {selectedTrade.sl} / {selectedTrade.tp}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-key">{t.modal.rrPnl}</div>
                <div className="detail-val">
                  {formatRR(selectedTrade.rr || 0)} / {formatPnl(selectedTrade.pnl, currencyCode)}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-key">{t.modal.strategy}</div>
                <div className="detail-val">
                  {getTranslatedLabel('strategies', selectedTrade.strategy, language)}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-key">{t.modal.session}</div>
                <div className="detail-val">
                  {getTranslatedLabel('sessions', selectedTrade.session, language)}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-key">{t.modal.timeframe}</div>
                <div className="detail-val">
                  {selectedTrade.timeframe
                    ? getTranslatedLabel('timeframes', selectedTrade.timeframe, language)
                    : t.general.noValue}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-key">{t.modal.tags}</div>
                <div className="detail-val">
                  {normalizeTags(selectedTrade.tags).join(', ') || t.general.noValue}
                </div>
              </div>
            </div>

            <div className="note-box">
              <div className="note-label">{t.modal.emotionAndNotes}</div>
              <div className="note-text">
                <strong>{getTranslatedLabel('emotions', selectedTrade.emotion, language)}</strong>
                {selectedTrade.note ? ` - ${selectedTrade.note}` : ` - ${t.modal.noNotes}`}
              </div>
            </div>

            <button type="button" className="delete-btn" onClick={handleDeleteTrade}>
              {t.modal.deleteTrade}
            </button>
          </div>
        ) : null}
      </div>

      <div className={`toast ${toast ? 'show' : ''}`}>{toast}</div>
    </>
  )
}

export default App
