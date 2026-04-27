import { useMemo, useRef, useState } from 'react'

function parseList(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function SectionCard({ title, description, children, actions }) {
  return (
    <section className="settings-card">
      <div className="settings-card-head">
        <div>
          <h3>{title}</h3>
          {description ? <p>{description}</p> : null}
        </div>
        {actions ? <div className="settings-card-actions">{actions}</div> : null}
      </div>
      {children}
    </section>
  )
}

const SETTINGS_COPY = {
  en: {
    title: 'Settings',
    subtitle: 'Control profile, journal preferences, risk rules, data tools, and appearance.',
    theme: 'Theme',
    language: 'Language',
    workspace: 'Workspace',
    connected: 'Connected',
    fallbackDemoReady: 'Fallback/Demo-ready',
    version: 'Version',
    profile: {
      title: 'Profile',
      description:
        'Update your visible trader identity and the core account details shown across the app.',
      save: 'Save Profile',
      displayName: 'Display name',
      email: 'Email',
    },
    trading: {
      title: 'Trading Preferences',
      description: 'Choose defaults used when you log trades and review performance.',
      save: 'Save Trading',
      currency: 'Currency',
      openingBalance: 'Opening balance',
      defaultPair: 'Default pair',
      defaultTimeframe: 'Default timeframe',
      defaultStrategy: 'Default strategy',
      defaultSession: 'Default session',
      defaultEmotion: 'Default emotion',
    },
    journal: {
      title: 'Journal Preferences',
      description:
        'Tune the language, theme, date format, and the filters you want selected by default.',
      save: 'Save Journal',
      language: 'Language',
      english: 'English',
      thai: 'Thai',
      themeMode: 'Theme mode',
      dark: 'Dark',
      light: 'Light',
      dateFormat: 'Date format',
      thaiLocale: 'Thai locale',
      historyPair: 'Default history pair filter',
      resultFilter: 'Default result filter',
      strategyFilter: 'Default strategy filter',
      allPairs: 'All Pairs',
      allResults: 'All Results',
      win: 'Win',
      loss: 'Loss',
      allStrategies: 'All Strategies',
    },
    risk: {
      title: 'Risk Settings',
      description: 'Store the rules you want this journal to treat as your risk guardrails.',
      save: 'Save Risk',
      targetRiskPerTrade: 'Target risk per trade (%)',
      maxDailyLoss: 'Max daily loss',
      maxWeeklyLoss: 'Max weekly loss',
      alertThreshold: 'Alert threshold (%)',
    },
    lists: {
      title: 'Tags / Setup Management',
      description:
        'Maintain custom strategies, sessions, timeframes, emotions, and tags used throughout the journal.',
      save: 'Save Lists',
      strategies: 'Custom strategies',
      sessions: 'Custom sessions',
      timeframes: 'Custom timeframes',
      emotions: 'Custom emotions',
      tags: 'Suggested tags',
      placeholder: 'Comma-separated values',
    },
    data: {
      title: 'Data Management',
      description: 'Move journal data in and out of the app with export and import tools.',
      exportJson: 'Export JSON Backup',
      exportCsv: 'Export CSV',
      importJson: 'Import JSON',
    },
    account: {
      title: 'Account',
      description: 'Quick account actions for the current workspace.',
      logout: 'Log out',
    },
    appInfo: {
      title: 'App Info',
      description: 'A quick technical snapshot of the current environment.',
    },
  },
  th: {
    title: 'ตั้งค่า',
    subtitle: 'จัดการโปรไฟล์ การตั้งค่าวารสาร กฎความเสี่ยง เครื่องมือข้อมูล และรูปแบบการแสดงผล',
    theme: 'ธีม',
    language: 'ภาษา',
    workspace: 'โหมดการใช้งาน',
    connected: 'เชื่อมต่อแล้ว',
    fallbackDemoReady: 'สำรอง / พร้อมเดโม',
    version: 'เวอร์ชัน',
    profile: {
      title: 'โปรไฟล์',
      description: 'อัปเดตชื่อที่แสดงและรายละเอียดบัญชีหลักที่ใช้แสดงทั่วทั้งแอป',
      save: 'บันทึกโปรไฟล์',
      displayName: 'ชื่อที่แสดง',
      email: 'อีเมล',
    },
    trading: {
      title: 'การตั้งค่าการเทรด',
      description: 'เลือกค่าเริ่มต้นที่จะใช้ตอนบันทึกการเทรดและตอนดูผลการเทรด',
      save: 'บันทึกการเทรด',
      currency: 'สกุลเงิน',
      openingBalance: 'ยอดเริ่มต้น',
      defaultPair: 'คู่เทรดเริ่มต้น',
      defaultTimeframe: 'ไทม์เฟรมเริ่มต้น',
      defaultStrategy: 'กลยุทธ์เริ่มต้น',
      defaultSession: 'ช่วงเวลาเริ่มต้น',
      defaultEmotion: 'อารมณ์เริ่มต้น',
    },
    journal: {
      title: 'การตั้งค่าวารสาร',
      description: 'กำหนดภาษา ธีม รูปแบบวันที่ และตัวกรองเริ่มต้นที่ต้องการ',
      save: 'บันทึกวารสาร',
      language: 'ภาษา',
      english: 'อังกฤษ',
      thai: 'ไทย',
      themeMode: 'โหมดธีม',
      dark: 'กลางคืน',
      light: 'กลางวัน',
      dateFormat: 'รูปแบบวันที่',
      thaiLocale: 'รูปแบบไทย',
      historyPair: 'ตัวกรองคู่เทรดเริ่มต้น',
      resultFilter: 'ตัวกรองผลลัพธ์เริ่มต้น',
      strategyFilter: 'ตัวกรองกลยุทธ์เริ่มต้น',
      allPairs: 'ทุกคู่',
      allResults: 'ทุกผลลัพธ์',
      win: 'ชนะ',
      loss: 'แพ้',
      allStrategies: 'ทุกกลยุทธ์',
    },
    risk: {
      title: 'การตั้งค่าความเสี่ยง',
      description: 'กำหนดกฎความเสี่ยงที่อยากใช้เป็นขอบเขตในการบันทึกและทบทวน',
      save: 'บันทึกความเสี่ยง',
      targetRiskPerTrade: 'ความเสี่ยงเป้าหมายต่อไม้ (%)',
      maxDailyLoss: 'ขาดทุนสูงสุดต่อวัน',
      maxWeeklyLoss: 'ขาดทุนสูงสุดต่อสัปดาห์',
      alertThreshold: 'ระดับแจ้งเตือน (%)',
    },
    lists: {
      title: 'จัดการแท็ก / Setup',
      description: 'จัดการกลยุทธ์ ช่วงเวลา ไทม์เฟรม อารมณ์ และแท็กแบบกำหนดเอง',
      save: 'บันทึกรายการ',
      strategies: 'กลยุทธ์เพิ่มเติม',
      sessions: 'ช่วงเวลาเพิ่มเติม',
      timeframes: 'ไทม์เฟรมเพิ่มเติม',
      emotions: 'อารมณ์เพิ่มเติม',
      tags: 'แท็กแนะนำ',
      placeholder: 'คั่นด้วยเครื่องหมายจุลภาค',
    },
    data: {
      title: 'จัดการข้อมูล',
      description: 'นำข้อมูลเข้าและออกจากแอปด้วยเครื่องมือ export และ import',
      exportJson: 'ส่งออก JSON สำรอง',
      exportCsv: 'ส่งออก CSV',
      importJson: 'นำเข้า JSON',
    },
    account: {
      title: 'บัญชี',
      description: 'คำสั่งด่วนสำหรับบัญชีที่กำลังใช้งานอยู่',
      logout: 'ออกจากระบบ',
    },
    appInfo: {
      title: 'ข้อมูลแอป',
      description: 'สรุปสถานะทางเทคนิคของสภาพแวดล้อมปัจจุบันแบบย่อ',
    },
  },
}

export default function SettingsPage({
  language,
  settingsData,
  optionSets,
  onSaveProfile,
  onSaveTrading,
  onSaveJournal,
  onSaveRisk,
  onSaveLists,
  onExportJson,
  onExportCsv,
  onImportJson,
  onLogout,
}) {
  const [profileDraft, setProfileDraft] = useState(() => settingsData.profile)
  const [tradingDraft, setTradingDraft] = useState(() => settingsData.trading)
  const [journalDraft, setJournalDraft] = useState(() => settingsData.journal)
  const [riskDraft, setRiskDraft] = useState(() => settingsData.risk)
  const [listsDraft, setListsDraft] = useState(() => ({
    strategies: settingsData.customLists.strategies.join(', '),
    sessions: settingsData.customLists.sessions.join(', '),
    timeframes: settingsData.customLists.timeframes.join(', '),
    emotions: settingsData.customLists.emotions.join(', '),
    tags: settingsData.customLists.tags.join(', '),
  }))
  const importRef = useRef(null)

  const text = SETTINGS_COPY[language] || SETTINGS_COPY.en

  const metaRows = useMemo(
    () => [
      { label: text.theme, value: settingsData.journal.theme },
      { label: text.language, value: settingsData.journal.language.toUpperCase() },
      { label: text.workspace, value: settingsData.meta.workspace },
      {
        label: 'Firebase',
        value: settingsData.meta.firebaseReady ? text.connected : text.fallbackDemoReady,
      },
      { label: text.version, value: settingsData.meta.version },
    ],
    [settingsData.journal.language, settingsData.journal.theme, settingsData.meta, text],
  )

  const listFields = [
    ['strategies', text.lists.strategies],
    ['sessions', text.lists.sessions],
    ['timeframes', text.lists.timeframes],
    ['emotions', text.lists.emotions],
    ['tags', text.lists.tags],
  ]

  return (
    <div className="settings-page">
      <div className="page-header settings-header">
        <div>
          <h2>{text.title}</h2>
          <p>{text.subtitle}</p>
        </div>
      </div>

      <div className="settings-grid">
        <SectionCard
          title={text.profile.title}
          description={text.profile.description}
          actions={
            <button type="button" className="settings-save-btn" onClick={() => onSaveProfile(profileDraft)}>
              {text.profile.save}
            </button>
          }
        >
          <div className="settings-form-grid">
            <label className="settings-field">
              <span>{text.profile.displayName}</span>
              <input
                className="form-input"
                value={profileDraft.displayName}
                onChange={(event) =>
                  setProfileDraft((current) => ({ ...current, displayName: event.target.value }))
                }
              />
            </label>
            <label className="settings-field">
              <span>{text.profile.email}</span>
              <input className="form-input" value={profileDraft.email} disabled />
            </label>
          </div>
        </SectionCard>

        <SectionCard
          title={text.trading.title}
          description={text.trading.description}
          actions={
            <button type="button" className="settings-save-btn" onClick={() => onSaveTrading(tradingDraft)}>
              {text.trading.save}
            </button>
          }
        >
          <div className="settings-form-grid">
            <label className="settings-field">
              <span>{text.trading.currency}</span>
              <select
                className="form-input"
                value={tradingDraft.currencyCode}
                onChange={(event) =>
                  setTradingDraft((current) => ({ ...current, currencyCode: event.target.value }))
                }
              >
                {optionSets.currencies.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="settings-field">
              <span>{text.trading.openingBalance}</span>
              <input
                className="form-input"
                type="number"
                step="0.01"
                value={tradingDraft.accountBalance}
                onChange={(event) =>
                  setTradingDraft((current) => ({ ...current, accountBalance: event.target.value }))
                }
              />
            </label>
            <label className="settings-field">
              <span>{text.trading.defaultPair}</span>
              <select
                className="form-input"
                value={tradingDraft.defaultPair}
                onChange={(event) =>
                  setTradingDraft((current) => ({ ...current, defaultPair: event.target.value }))
                }
              >
                {optionSets.pairs.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="settings-field">
              <span>{text.trading.defaultTimeframe}</span>
              <select
                className="form-input"
                value={tradingDraft.defaultTimeframe}
                onChange={(event) =>
                  setTradingDraft((current) => ({ ...current, defaultTimeframe: event.target.value }))
                }
              >
                {optionSets.timeframes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="settings-field">
              <span>{text.trading.defaultStrategy}</span>
              <select
                className="form-input"
                value={tradingDraft.defaultStrategy}
                onChange={(event) =>
                  setTradingDraft((current) => ({ ...current, defaultStrategy: event.target.value }))
                }
              >
                {optionSets.strategies.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="settings-field">
              <span>{text.trading.defaultSession}</span>
              <select
                className="form-input"
                value={tradingDraft.defaultSession}
                onChange={(event) =>
                  setTradingDraft((current) => ({ ...current, defaultSession: event.target.value }))
                }
              >
                {optionSets.sessions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="settings-field">
              <span>{text.trading.defaultEmotion}</span>
              <select
                className="form-input"
                value={tradingDraft.defaultEmotion}
                onChange={(event) =>
                  setTradingDraft((current) => ({ ...current, defaultEmotion: event.target.value }))
                }
              >
                {optionSets.emotions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </SectionCard>

        <SectionCard
          title={text.journal.title}
          description={text.journal.description}
          actions={
            <button type="button" className="settings-save-btn" onClick={() => onSaveJournal(journalDraft)}>
              {text.journal.save}
            </button>
          }
        >
          <div className="settings-form-grid">
            <label className="settings-field">
              <span>{text.journal.language}</span>
              <select
                className="form-input"
                value={journalDraft.language}
                onChange={(event) =>
                  setJournalDraft((current) => ({ ...current, language: event.target.value }))
                }
              >
                <option value="en">{text.journal.english}</option>
                <option value="th">{text.journal.thai}</option>
              </select>
            </label>
            <label className="settings-field">
              <span>{text.journal.themeMode}</span>
              <select
                className="form-input"
                value={journalDraft.theme}
                onChange={(event) =>
                  setJournalDraft((current) => ({ ...current, theme: event.target.value }))
                }
              >
                <option value="dark">{text.journal.dark}</option>
                <option value="light">{text.journal.light}</option>
              </select>
            </label>
            <label className="settings-field">
              <span>{text.journal.dateFormat}</span>
              <select
                className="form-input"
                value={journalDraft.dateFormat}
                onChange={(event) =>
                  setJournalDraft((current) => ({ ...current, dateFormat: event.target.value }))
                }
              >
                <option value="en-US">MM/DD/YYYY</option>
                <option value="en-GB">DD/MM/YYYY</option>
                <option value="th-TH">{text.journal.thaiLocale}</option>
              </select>
            </label>
            <label className="settings-field">
              <span>{text.journal.historyPair}</span>
              <select
                className="form-input"
                value={journalDraft.defaultPairFilter}
                onChange={(event) =>
                  setJournalDraft((current) => ({ ...current, defaultPairFilter: event.target.value }))
                }
              >
                <option value="">{text.journal.allPairs}</option>
                {optionSets.pairs.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="settings-field">
              <span>{text.journal.resultFilter}</span>
              <select
                className="form-input"
                value={journalDraft.defaultResultFilter}
                onChange={(event) =>
                  setJournalDraft((current) => ({ ...current, defaultResultFilter: event.target.value }))
                }
              >
                <option value="">{text.journal.allResults}</option>
                <option value="Win">{text.journal.win}</option>
                <option value="Loss">{text.journal.loss}</option>
                <option value="BE">BE</option>
              </select>
            </label>
            <label className="settings-field">
              <span>{text.journal.strategyFilter}</span>
              <select
                className="form-input"
                value={journalDraft.defaultStrategyFilter}
                onChange={(event) =>
                  setJournalDraft((current) => ({ ...current, defaultStrategyFilter: event.target.value }))
                }
              >
                <option value="">{text.journal.allStrategies}</option>
                {optionSets.strategies.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </SectionCard>

        <SectionCard
          title={text.risk.title}
          description={text.risk.description}
          actions={
            <button type="button" className="settings-save-btn" onClick={() => onSaveRisk(riskDraft)}>
              {text.risk.save}
            </button>
          }
        >
          <div className="settings-form-grid">
            <label className="settings-field">
              <span>{text.risk.targetRiskPerTrade}</span>
              <input
                className="form-input"
                type="number"
                step="0.01"
                value={riskDraft.targetRiskPerTrade}
                onChange={(event) =>
                  setRiskDraft((current) => ({ ...current, targetRiskPerTrade: event.target.value }))
                }
              />
            </label>
            <label className="settings-field">
              <span>{text.risk.maxDailyLoss}</span>
              <input
                className="form-input"
                type="number"
                step="0.01"
                value={riskDraft.maxDailyLoss}
                onChange={(event) =>
                  setRiskDraft((current) => ({ ...current, maxDailyLoss: event.target.value }))
                }
              />
            </label>
            <label className="settings-field">
              <span>{text.risk.maxWeeklyLoss}</span>
              <input
                className="form-input"
                type="number"
                step="0.01"
                value={riskDraft.maxWeeklyLoss}
                onChange={(event) =>
                  setRiskDraft((current) => ({ ...current, maxWeeklyLoss: event.target.value }))
                }
              />
            </label>
            <label className="settings-field">
              <span>{text.risk.alertThreshold}</span>
              <input
                className="form-input"
                type="number"
                step="0.01"
                value={riskDraft.alertThreshold}
                onChange={(event) =>
                  setRiskDraft((current) => ({ ...current, alertThreshold: event.target.value }))
                }
              />
            </label>
          </div>
        </SectionCard>

        <SectionCard
          title={text.lists.title}
          description={text.lists.description}
          actions={
            <button
              type="button"
              className="settings-save-btn"
              onClick={() =>
                onSaveLists({
                  strategies: parseList(listsDraft.strategies),
                  sessions: parseList(listsDraft.sessions),
                  timeframes: parseList(listsDraft.timeframes),
                  emotions: parseList(listsDraft.emotions),
                  tags: parseList(listsDraft.tags),
                })
              }
            >
              {text.lists.save}
            </button>
          }
        >
          <div className="settings-form-grid settings-form-grid-wide">
            {listFields.map(([key, label]) => (
              <label className="settings-field" key={key}>
                <span>{label}</span>
                <textarea
                  className="form-input settings-textarea"
                  rows="3"
                  value={listsDraft[key]}
                  onChange={(event) =>
                    setListsDraft((current) => ({ ...current, [key]: event.target.value }))
                  }
                  placeholder={text.lists.placeholder}
                ></textarea>
              </label>
            ))}
          </div>
        </SectionCard>

        <SectionCard title={text.data.title} description={text.data.description}>
          <div className="settings-action-grid">
            <button type="button" className="settings-utility-btn" onClick={onExportJson}>
              {text.data.exportJson}
            </button>
            <button type="button" className="settings-utility-btn" onClick={onExportCsv}>
              {text.data.exportCsv}
            </button>
            <button type="button" className="settings-utility-btn" onClick={() => importRef.current?.click()}>
              {text.data.importJson}
            </button>
            <input
              ref={importRef}
              type="file"
              accept="application/json"
              className="settings-file-input"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) onImportJson(file)
                event.target.value = ''
              }}
            />
          </div>
        </SectionCard>

        <SectionCard title={text.account.title} description={text.account.description}>
          <div className="settings-action-grid">
            <button type="button" className="settings-utility-btn" onClick={onLogout}>
              {text.account.logout}
            </button>
          </div>
        </SectionCard>

        <SectionCard title={text.appInfo.title} description={text.appInfo.description}>
          <div className="settings-meta-list">
            {metaRows.map((row) => (
              <div className="settings-meta-row" key={row.label}>
                <span>{row.label}</span>
                <strong>{row.value}</strong>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
