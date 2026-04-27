import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { useAuth } from './hooks/useAuth'
import { useTrades } from './hooks/useTrades'
import { loginUser, logoutUser, registerUser } from './services/authService'
import { DEMO_SUMMARY } from './utils/demoData'
import {
  calcRR,
  computeStats,
  formatPnl,
  formatRR,
  formatUSD,
  PAIR_EMOJI,
  PAIRS,
  SESSIONS,
  STRATEGIES,
  EMOTIONS,
} from './utils/helpers'

const copy = {
  en: {
    nav: {
      dashboard: 'Dashboard',
      add: 'Add Trade',
      history: 'History',
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
    },
    greeting: {
      morning: 'Good morning',
      afternoon: 'Good afternoon',
      evening: 'Good evening',
    },
    sidebar: {
      accountBalance: 'Account balance',
      netLoadedTrades: 'net on loaded trades',
      demoMode: 'Demo mode',
    },
    dashboard: {
      loadedTrades: (count) => `${count} trades loaded into the current view`,
      firebaseBanner:
        'Firebase is not fully connected yet. Demo mode remains available while you finish setup.',
      netPnl: 'Net PnL',
      loadedTradesOnly: 'Loaded trades only',
      winRate: 'Win Rate',
      winsLosses: (wins, losses) => `${wins} wins / ${losses} losses`,
      averageRr: 'Average RR',
      breakEvenTrades: (count) => `Break-even trades: ${count}`,
      averageRisk: 'Average Risk',
      perRecordedPosition: 'Per recorded position',
      strategyMix: 'Strategy mix',
      sessionPnl: 'Session PnL',
      executionNotes: 'Execution notes',
      recentTrades: 'Recent trades',
      openHistory: 'Open history',
      loadingTrades: 'Loading trades...',
      noTradesYet: 'No trades yet',
      addFirstSetup: 'Add your first setup to start building stats.',
      noSessions: 'No sessions to compare yet.',
      noStrategy: 'No trades yet.',
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
      emotion: 'Emotion',
      followedPlan: 'Followed plan',
      notes: 'Notes',
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
    },
    greeting: {
      morning: 'สวัสดีตอนเช้า',
      afternoon: 'สวัสดีตอนบ่าย',
      evening: 'สวัสดีตอนเย็น',
    },
    sidebar: {
      accountBalance: 'ยอดเงินในบัญชี',
      netLoadedTrades: 'สุทธิจากรายการที่แสดง',
      demoMode: 'โหมดเดโม',
    },
    dashboard: {
      loadedTrades: (count) => `โหลดรายการเทรดในมุมมองนี้ ${count} รายการ`,
      firebaseBanner:
        'Firebase ยังเชื่อมต่อไม่ครบ โหมดเดโมยังพร้อมให้ใช้งานระหว่างตั้งค่าระบบ',
      netPnl: 'กำไร/ขาดทุนสุทธิ',
      loadedTradesOnly: 'คำนวณจากรายการที่โหลดอยู่',
      winRate: 'อัตราชนะ',
      winsLosses: (wins, losses) => `ชนะ ${wins} / แพ้ ${losses}`,
      averageRr: 'ค่า RR เฉลี่ย',
      breakEvenTrades: (count) => `จำนวน BE: ${count}`,
      averageRisk: 'ความเสี่ยงเฉลี่ย',
      perRecordedPosition: 'ต่อหนึ่งออเดอร์ที่บันทึก',
      strategyMix: 'สัดส่วนกลยุทธ์',
      sessionPnl: 'กำไร/ขาดทุนตามช่วงเวลา',
      executionNotes: 'ภาพรวมการเทรด',
      recentTrades: 'รายการล่าสุด',
      openHistory: 'เปิดประวัติ',
      loadingTrades: 'กำลังโหลดรายการ...',
      noTradesYet: 'ยังไม่มีรายการเทรด',
      addFirstSetup: 'เพิ่มรายการแรกเพื่อเริ่มสร้างสถิติของคุณ',
      noSessions: 'ยังไม่มีข้อมูลให้เทียบตามช่วงเวลา',
      noStrategy: 'ยังไม่มีรายการเทรด',
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
      emotion: 'อารมณ์',
      followedPlan: 'ทำตามแผนหรือไม่',
      notes: 'บันทึกเพิ่มเติม',
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
      emotionAndNotes: 'อารมณ์และบันทึก',
      noNotes: 'ยังไม่มีบันทึกเพิ่มเติม',
      deleteTrade: 'ลบรายการนี้',
    },
  },
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

function createInitialTradeForm() {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)

  return {
    date: local.toISOString().slice(0, 16),
    pair: 'XAUUSD',
    type: 'Buy',
    entry: '2650',
    sl: '2640',
    tp: '2675',
    lot: '0.50',
    riskPercent: '1.00',
    result: 'Win',
    pnl: '250.00',
    strategy: 'SMC',
    session: 'London',
    emotion: 'Calm',
    followPlan: 'Yes',
    note: '',
  }
}

function formatDateByLanguage(date, language, options = {}) {
  const locale = language === 'th' ? 'th-TH' : 'en-US'
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

function App() {
  const { user, profile, loading, authError, firebaseReady, refreshProfile } = useAuth()
  const [language, setLanguage] = useState('en')
  const [isDemo, setIsDemo] = useState(false)
  const [activePage, setActivePage] = useState('dashboard')
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({ displayName: '', email: '', password: '' })
  const [authMessage, setAuthMessage] = useState('')
  const [authSubmitting, setAuthSubmitting] = useState(false)
  const [tradeForm, setTradeForm] = useState(createInitialTradeForm)
  const [filters, setFilters] = useState({ pair: '', result: '', strategy: '' })
  const [toast, setToast] = useState('')
  const [selectedTrade, setSelectedTrade] = useState(null)
  const [submittingTrade, setSubmittingTrade] = useState(false)

  const t = copy[language]
  const navItems = useMemo(
    () => [
      { id: 'dashboard', label: t.nav.dashboard, icon: 'O' },
      { id: 'add', label: t.nav.add, icon: '+' },
      { id: 'history', label: t.nav.history, icon: '=' },
    ],
    [t],
  )

  const activeUid = isDemo ? 'demo-user' : user?.uid
  const { trades, loading: tradesLoading, hasMore, loadTrades, addTrade, removeTrade } =
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

  const rr = useMemo(
    () => calcRR(Number(tradeForm.entry), Number(tradeForm.sl), Number(tradeForm.tp)),
    [tradeForm.entry, tradeForm.sl, tradeForm.tp],
  )

  const stats = useMemo(() => computeStats(trades), [trades])

  const accountBalance = useMemo(() => {
    const baseBalance = isDemo
      ? DEMO_SUMMARY.accountBalance
      : profile?.accountBalance || DEMO_SUMMARY.accountBalance
    return baseBalance + stats.totalPnl
  }, [isDemo, profile?.accountBalance, stats.totalPnl])

  const summary = useMemo(() => {
    const displayName =
      isDemo ? DEMO_SUMMARY.displayName : profile?.displayName || t.general.traderFallback
    const email = isDemo ? DEMO_SUMMARY.email : profile?.email || user?.email || ''

    return {
      displayName,
      email,
      totalTrades: stats.total,
      winCount: stats.wins,
      lossCount: stats.losses,
      beCount: stats.bes,
      totalProfit: stats.totalPnl,
      avgRR: stats.avgRR,
      avgRisk: stats.avgRisk,
      winRate: stats.total ? (stats.wins / stats.total) * 100 : 0,
    }
  }, [isDemo, profile, stats, t.general.traderFallback, user?.email])

  const recentTrades = useMemo(() => trades.slice(0, 5), [trades])

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
      setAuthForm({ displayName: '', email: '', password: '' })
    } catch (error) {
      setAuthMessage(error.message)
    } finally {
      setAuthSubmitting(false)
    }
  }

  function handleEnterDemo() {
    setIsDemo(true)
    setActivePage('dashboard')
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
      const payload = {
        ...tradeForm,
        entry: Number(tradeForm.entry),
        sl: Number(tradeForm.sl),
        tp: Number(tradeForm.tp),
        lot: Number(tradeForm.lot),
        riskPercent: Number(tradeForm.riskPercent),
        rr,
        pnl: Number(tradeForm.pnl),
      }

      await addTrade(payload)

      if (!isDemo && user?.uid) {
        await refreshProfile(user.uid)
      }

      setTradeForm(createInitialTradeForm())
      setActivePage('dashboard')
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
            <div className="logo-icon">T</div>
            <div>
              <div className="logo-text">{t.general.appName}</div>
              <div className="logo-sub">
                {isDemo ? t.general.demoWorkspace : t.general.liveWorkspace}
              </div>
            </div>
          </div>

          <nav className="nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                onClick={() => setActivePage(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="sidebar-bottom">
            <div className="account-bal">
              <div className="acc-label">{t.sidebar.accountBalance}</div>
              <div className="acc-value">{formatUSD(accountBalance)}</div>
              <div className={`acc-change ${summary.totalProfit >= 0 ? 'text-profit' : 'text-loss'}`}>
                {formatPnl(summary.totalProfit)} {t.sidebar.netLoadedTrades}
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

        <main className="main">
          <header className="topbar">
            <div>
              <strong>{getGreetingByLanguage(language)}</strong>
              <span className="topbar-subtitle"> {t.general.reviewExecution}</span>
            </div>
            <div className="topbar-right">
              <div className="language-toggle">
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
              <button
                type="button"
                className="icon-btn quick-add-btn"
                onClick={() => setActivePage('add')}
                title={t.addTrade.title}
              >
                +
              </button>
            </div>
          </header>

          <div className="content">
            <section className={`page ${activePage === 'dashboard' ? 'active' : ''}`}>
              <div className="dash-main">
                <div className="greeting">
                  <div>
                    <h1>{summary.displayName}</h1>
                    <p>{t.dashboard.loadedTrades(summary.totalTrades || 0)}</p>
                  </div>
                  <button type="button" className="period-btn" onClick={() => loadTrades(filters, true)}>
                    {t.general.refresh}
                  </button>
                </div>

                {!firebaseReady && !isDemo ? (
                  <div className="status-banner">{t.dashboard.firebaseBanner}</div>
                ) : null}

                <div className="stats-grid">
                  <article className="stat-card">
                    <div className="stat-top">
                      <div className="stat-label">{t.dashboard.netPnl}</div>
                      <div className="stat-icon">$</div>
                    </div>
                    <div className="stat-value">{formatPnl(summary.totalProfit)}</div>
                    <div className="stat-change muted-copy">{t.dashboard.loadedTradesOnly}</div>
                  </article>

                  <article className="stat-card">
                    <div className="stat-top">
                      <div className="stat-label">{t.dashboard.winRate}</div>
                      <div className="stat-icon">%</div>
                    </div>
                    <div className="stat-value">{summary.winRate.toFixed(1)}%</div>
                    <div className="stat-change muted-copy">
                      {t.dashboard.winsLosses(summary.winCount, summary.lossCount)}
                    </div>
                  </article>

                  <article className="stat-card">
                    <div className="stat-top">
                      <div className="stat-label">{t.dashboard.averageRr}</div>
                      <div className="stat-icon">R</div>
                    </div>
                    <div className="stat-value">{formatRR(summary.avgRR || 0)}</div>
                    <div className="stat-change muted-copy">
                      {t.dashboard.breakEvenTrades(summary.beCount)}
                    </div>
                  </article>

                  <article className="stat-card">
                    <div className="stat-top">
                      <div className="stat-label">{t.dashboard.averageRisk}</div>
                      <div className="stat-icon">!</div>
                    </div>
                    <div className="stat-value">{summary.avgRisk.toFixed(2)}%</div>
                    <div className="stat-change muted-copy">{t.dashboard.perRecordedPosition}</div>
                  </article>
                </div>

                <div className="bottom-charts">
                  <article className="small-chart-card">
                    <div className="chart-title">{t.dashboard.strategyMix}</div>
                    <div className="panel-stack">
                      {Object.keys(stats.stratMap).length ? (
                        Object.entries(stats.stratMap).map(([name, value]) => (
                          <div className="strat-row" key={name}>
                            <div className="strat-name">
                              {getTranslatedLabel('strategies', name, language)}
                            </div>
                            <div className="strat-bar-bg">
                              <div
                                className="strat-bar-fill"
                                style={{
                                  width: `${(value.count / summary.totalTrades) * 100 || 0}%`,
                                  background: 'var(--accent)',
                                }}
                              ></div>
                            </div>
                            <div className="strat-pct">{value.count}</div>
                          </div>
                        ))
                      ) : (
                        <div className="empty-state compact-empty">{t.dashboard.noStrategy}</div>
                      )}
                    </div>
                  </article>

                  <article className="small-chart-card">
                    <div className="chart-title">{t.dashboard.sessionPnl}</div>
                    <div className="panel-stack">
                      {Object.keys(stats.sessMap).length ? (
                        Object.entries(stats.sessMap).map(([session, pnl]) => (
                          <div className="session-row" key={session}>
                            <span>{getTranslatedLabel('sessions', session, language)}</span>
                            <span className={pnl >= 0 ? 'text-profit' : 'text-loss'}>
                              {formatPnl(pnl)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="empty-state compact-empty">{t.dashboard.noSessions}</div>
                      )}
                    </div>
                  </article>

                  <article className="small-chart-card">
                    <div className="chart-title">{t.dashboard.executionNotes}</div>
                    <div className="summary-grid">
                      <div className="detail-item">
                        <div className="detail-key">{t.general.mode}</div>
                        <div className="detail-val">{isDemo ? t.general.demo : t.general.firebase}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-key">{t.general.openTradesView}</div>
                        <div className="detail-val">{trades.length}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-key">{t.general.topPair}</div>
                        <div className="detail-val">{recentTrades[0]?.pair || t.general.noValue}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-key">{t.general.latestResult}</div>
                        <div className="detail-val">
                          {selectedTrade
                            ? getTranslatedLabel('results', selectedTrade.result, language)
                            : recentTrades[0]?.result
                              ? getTranslatedLabel('results', recentTrades[0].result, language)
                              : t.general.noValue}
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              </div>

              <aside className="dash-right">
                <div className="panel-title">
                  <span>{t.dashboard.recentTrades}</span>
                  <button type="button" className="view-all plain-button" onClick={() => setActivePage('history')}>
                    {t.dashboard.openHistory}
                  </button>
                </div>

                {tradesLoading ? (
                  <div className="loading small-loading">
                    <div className="spinner"></div>
                    {t.dashboard.loadingTrades}
                  </div>
                ) : recentTrades.length ? (
                  recentTrades.map((trade) => (
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
                          {getTranslatedLabel('strategies', trade.strategy, language)} •{' '}
                          {formatDateByLanguage(trade.date, language)}
                        </div>
                      </div>
                      <div>
                        <div className={`trade-pnl ${trade.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                          {formatPnl(trade.pnl)}
                        </div>
                        <div className="trade-rr">{formatRR(trade.rr || 0)}</div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="empty-state">
                    <strong>{t.dashboard.noTradesYet}</strong>
                    <p>{t.dashboard.addFirstSetup}</p>
                  </div>
                )}
              </aside>
            </section>

            <section className={`page ${activePage === 'add' ? 'active' : ''}`}>
              <div className="add-trade-page">
                <div className="page-header">
                  <h2>{t.addTrade.title}</h2>
                  <p>{t.addTrade.subtitle}</p>
                </div>

                <form onSubmit={handleTradeSubmit}>
                  <div className="section-divider">{t.addTrade.sectionSetup}</div>
                  <div className="form-grid">
                    <label className="form-group">
                      <span className="form-label">{t.addTrade.date}</span>
                      <input
                        className="form-input"
                        type="datetime-local"
                        value={tradeForm.date}
                        onChange={(event) =>
                          setTradeForm((current) => ({ ...current, date: event.target.value }))
                        }
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
                        {PAIRS.map((pair) => (
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
                        className="form-input"
                        type="number"
                        step="0.01"
                        value={tradeForm.pnl}
                        onChange={(event) =>
                          setTradeForm((current) => ({ ...current, pnl: event.target.value }))
                        }
                        required
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
                        className="form-input"
                        type="number"
                        step="0.01"
                        value={tradeForm.riskPercent}
                        onChange={(event) =>
                          setTradeForm((current) => ({
                            ...current,
                            riskPercent: event.target.value,
                          }))
                        }
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
                        {STRATEGIES.map((strategy) => (
                          <option key={strategy} value={strategy}>
                            {getTranslatedLabel('strategies', strategy, language)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="form-group">
                      <span className="form-label">{t.addTrade.session}</span>
                      <select
                        className="form-input"
                        value={tradeForm.session}
                        onChange={(event) =>
                          setTradeForm((current) => ({ ...current, session: event.target.value }))
                        }
                      >
                        {SESSIONS.map((session) => (
                          <option key={session} value={session}>
                            {getTranslatedLabel('sessions', session, language)}
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
                        {EMOTIONS.map((emotion) => (
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

                  <button type="submit" className="submit-btn" disabled={submittingTrade}>
                    {submittingTrade ? t.addTrade.savingTrade : t.addTrade.saveTrade}
                  </button>
                </form>
              </div>
            </section>

            <section className={`page ${activePage === 'history' ? 'active' : ''}`}>
              <div className="history-page">
                <div className="page-header">
                  <h2>{t.history.title}</h2>
                  <p>{t.history.subtitle}</p>
                </div>

                <div className="filters-bar">
                  <select
                    className="filter-select"
                    value={filters.pair}
                    onChange={(event) =>
                      setFilters((current) => ({ ...current, pair: event.target.value }))
                    }
                  >
                    <option value="">{t.history.allPairs}</option>
                    {PAIRS.map((pair) => (
                      <option key={pair} value={pair}>
                        {pair}
                      </option>
                    ))}
                  </select>

                  <select
                    className="filter-select"
                    value={filters.result}
                    onChange={(event) =>
                      setFilters((current) => ({ ...current, result: event.target.value }))
                    }
                  >
                    <option value="">{t.history.allResults}</option>
                    <option value="Win">{t.addTrade.win}</option>
                    <option value="Loss">{t.addTrade.loss}</option>
                    <option value="BE">{t.addTrade.be}</option>
                  </select>

                  <select
                    className="filter-select"
                    value={filters.strategy}
                    onChange={(event) =>
                      setFilters((current) => ({ ...current, strategy: event.target.value }))
                    }
                  >
                    <option value="">{t.history.allStrategies}</option>
                    {STRATEGIES.map((strategy) => (
                      <option key={strategy} value={strategy}>
                        {getTranslatedLabel('strategies', strategy, language)}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="period-btn"
                    onClick={() => setFilters({ pair: '', result: '', strategy: '' })}
                  >
                    {t.general.resetFilters}
                  </button>
                </div>

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
                      {trades.map((trade) => (
                        <tr key={trade.id} onClick={() => setSelectedTrade(trade)}>
                          <td>{formatDateByLanguage(trade.date, language)}</td>
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
                            {formatPnl(trade.pnl)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {!trades.length ? (
                    <div className="empty-state">
                      <strong>{t.history.noMatches}</strong>
                      <p>{t.history.changeFilters}</p>
                    </div>
                  ) : null}

                  <div className="pagination">
                    <span>{t.general.shownTrades(trades.length)}</span>
                    {hasMore && !isDemo ? (
                      <button type="button" className="period-btn" onClick={() => loadTrades(filters, false)}>
                        {t.general.loadMore}
                      </button>
                    ) : (
                      <span>{t.general.endOfList}</span>
                    )}
                  </div>
                </div>
              </div>
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
                  {formatDateByLanguage(selectedTrade.date, language, { year: 'numeric' })}
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
                  {formatRR(selectedTrade.rr || 0)} / {formatPnl(selectedTrade.pnl)}
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
