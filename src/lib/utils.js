/* ── FINANCE ── */
export function calcEMI(principal, annualRate, months) {
  if (!principal || !annualRate || !months) return 0
  const r = annualRate / (12 * 100)
  return Math.round(principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1))
}

export function fmtINR(n) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n || 0)
}

export function fmtNum(n) {
  return new Intl.NumberFormat('en-IN').format(n || 0)
}

export function pct(part, total) {
  if (!total) return 0
  return Math.min(100, Math.round((part / total) * 100))
}

/* ── DATE ── */
export function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

/* ── STATUS ── */
export function statusClass(s) {
  const map = { active: 's-active', completed: 's-completed', defaulted: 's-defaulted', pending: 's-pending' }
  return `status-pill ${map[s] || 's-pending'}`
}

/* ── AMORTISATION SCHEDULE ── */
export function buildSchedule(principal, annualRate, months) {
  const r = annualRate / (12 * 100)
  const emi = calcEMI(principal, annualRate, months)
  let bal = principal
  const rows = []
  for (let i = 1; i <= months && bal > 0; i++) {
    const int = Math.round(bal * r)
    const prin = Math.min(emi - int, bal)
    bal = Math.round(bal - prin)
    rows.push({ month: i, emi, principal: prin, interest: int, balance: bal })
  }
  return rows
}

/* ── GENERATE MONTHLY CHART DATA ── */
export function monthlyChartData(payments = []) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const now = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i)
    const label = months[d.getMonth()]
    const mo = d.getMonth() + 1, yr = d.getFullYear()
    const total = payments
      .filter(p => {
        const pd = new Date(p.paid_on || p.created_at)
        return pd.getMonth() + 1 === mo && pd.getFullYear() === yr
      })
      .reduce((s, p) => s + Number(p.amount), 0)
    return { m: label, amount: total }
  })
}

/* ═══════════════════════════════════════════════════════════════════
   DASHBOARD — accurate, data-driven calculations
   ═══════════════════════════════════════════════════════════════════ */

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

/* Parse a 'YYYY-MM-DD' (or ISO) date into { year, month } using LOCAL string
   slicing, so the month never shifts across timezones. Returns null if invalid. */
export function parseYM(d) {
  if (!d) return null
  const m = String(d).slice(0, 10).match(/^(\d{4})-(\d{2})/)
  if (!m) return null
  const year = Number(m[1]), month = Number(m[2])
  if (!year || month < 1 || month > 12) return null
  return { year, month }
}

export function ymKey(year, month) {
  return `${year}-${String(month).padStart(2, '0')}`
}

/* Effective (derived) status using the app's repayment rules.
   A loan whose outstanding obligation is fully settled is Completed — regardless
   of the stored flag — so cards, progress, status chart and table never
   contradict each other. Each loan maps to exactly one status. */
export function effectiveStatus(loan) {
  const amt  = Number(loan?.amount) || 0
  const paid = Number(loan?.paid_amount) || 0
  const rem  = Number(loan?.remaining_amount)
  if (amt > 0 && (paid >= amt || (!Number.isNaN(rem) && rem <= 0))) return 'completed'
  return loan?.status || 'pending'
}

/* Count loans by effective status. total = loans.length (counted once each). */
export function statusCounts(loans = []) {
  const counts = { active: 0, completed: 0, defaulted: 0, pending: 0, total: loans.length }
  for (const l of loans) {
    const s = effectiveStatus(l)
    counts[s] = (counts[s] || 0) + 1
  }
  return counts
}

/* Summary totals from the loan ledger (single source of truth for the cards,
   progress bars and Recent Loans table). */
export function loanTotals(loans = []) {
  let borrowed = 0, paid = 0, remaining = 0, active = 0
  for (const l of loans) {
    const amt = Number(l.amount) || 0
    borrowed += amt
    paid     += Number(l.paid_amount) || 0
    remaining += Math.max(0, Number(l.remaining_amount) || (amt - (Number(l.paid_amount) || 0)))
    if (effectiveStatus(l) === 'active') active++
  }
  return { borrowed, paid, remaining, active }
}

/* Build the repayment-trend series from ACTUAL payment records.
   mode:    'monthly' | 'cumulative' | 'outstanding'
   window:  6 | 12 | 'all'
   Returns [{ key, label, value, cumulative, paid, hasHistory }].
   - Months before the user's first activity are marked hasHistory:false and
     yield null values (rendered as gaps), distinguishing "no history yet" from
     a genuine ₹0 repayment month.
   - 'outstanding' reconstructs balance as totalPrincipal − cumulativePaid(t),
     using the app's principal-repayment model, clamped at >= 0. */
export function buildTrendData({ payments = [], window = 6, mode = 'monthly', totalPrincipal = 0, earliest = null, now = new Date() }) {
  const perMonth = new Map()
  let earliestPay = null
  for (const p of payments) {
    const ym = parseYM(p.paid_on || p.created_at)
    if (!ym) continue
    const key = ymKey(ym.year, ym.month)
    perMonth.set(key, (perMonth.get(key) || 0) + (Number(p.amount) || 0))
    const t = ym.year * 12 + (ym.month - 1)
    if (earliestPay === null || t < earliestPay) earliestPay = t
  }

  let earliestTick = earliestPay
  const ey = parseYM(earliest)
  if (ey) {
    const t = ey.year * 12 + (ey.month - 1)
    if (earliestTick === null || t < earliestTick) earliestTick = t
  }

  const nowTick = now.getFullYear() * 12 + now.getMonth()
  const startTick = window === 'all'
    ? (earliestTick !== null ? Math.min(earliestTick, nowTick) : nowTick - 5)
    : nowTick - (Number(window) - 1)

  // Cumulative base = everything paid before the visible window.
  let basePaid = 0
  if (earliestTick !== null) {
    for (let t = earliestTick; t < startTick; t++) {
      basePaid += perMonth.get(ymKey(Math.floor(t / 12), (t % 12) + 1)) || 0
    }
  }

  const includeYear = window === 12 || window === 'all'
  const rows = []
  let cumulative = basePaid
  for (let t = startTick; t <= nowTick; t++) {
    const year = Math.floor(t / 12), month = (t % 12) + 1, key = ymKey(year, month)
    const paid = perMonth.get(key) || 0
    const hasHistory = earliestTick === null ? true : t >= earliestTick
    let value, cum
    if (!hasHistory) { value = null; cum = null }
    else {
      cumulative += paid; cum = cumulative
      value = mode === 'monthly' ? paid
            : mode === 'cumulative' ? cumulative
            : Math.max(0, totalPrincipal - cumulative)
    }
    const label = includeYear ? `${MONTHS[month - 1]} ${String(year).slice(2)}` : MONTHS[month - 1]
    rows.push({ key, label, value, cumulative: cum, paid: hasHistory ? paid : null, hasHistory })
  }
  return rows
}

/* Compact Indian axis formatter (₹45k / ₹4.5L / ₹1.2Cr). */
export function axisINR(v) {
  const n = Number(v) || 0
  const sign = n < 0 ? '-' : ''
  const a = Math.abs(n)
  if (a >= 10000000) return `${sign}₹${+(a / 10000000).toFixed(a % 10000000 ? 1 : 0)}Cr`
  if (a >= 100000)   return `${sign}₹${+(a / 100000).toFixed(a % 100000 ? 1 : 0)}L`
  if (a >= 1000)     return `${sign}₹${Math.round(a / 1000)}k`
  return `${sign}₹${Math.round(a)}`
}

/* ── SHARED LOAN COST MODEL ───────────────────────────────────────────
   Single source of truth for EMI + full cost breakdown, used by the EMI
   Calculator, Compare Loans and Add Loan so identical inputs always produce
   identical numbers. Assumptions:
   - Interest is the standard reducing-balance EMI formula (fixed rate).
   - `feePct` is an OPTIONAL one-time processing fee as a % of principal.
     Default 0 (fees are NOT assumed — the schema has no fee field).
   - Zero / missing rate is handled safely (0% interest → principal/months). */
export function loanCost(principal, annualRate, months, feePct = 0) {
  const P = Number(principal) || 0
  const n = Math.round(Number(months) || 0)
  const r = Number(annualRate) || 0
  const emi = calcEMI(P, r, n)
  const totalPaid   = emi * n
  const interest    = Math.max(0, totalPaid - P)
  const fee         = Math.round((P * (Number(feePct) || 0)) / 100)
  const totalCost   = totalPaid + fee
  return { principal: P, months: n, rate: r, emi, totalPaid, interest, fee, totalCost }
}

/* ── LOAN-TYPE NORMALISER ─────────────────────────────────────────────
   Category names are stored as e.g. "Home Loan". We normalise for robust,
   case- and whitespace-insensitive matching (fixes category filtering when
   DB casing/spacing drifts from the UI). */
export function normalizeType(t) {
  return String(t || '').trim().toLowerCase().replace(/\s+loan$/, '').replace(/\s+/g, ' ')
}

/* Short display label for a category ("Home Loan" → "Home"). */
export function typeLabel(t) {
  return String(t || '').trim().replace(/\s+loan$/i, '') || 'Other'
}
