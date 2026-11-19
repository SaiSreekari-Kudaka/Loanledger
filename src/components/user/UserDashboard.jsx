
import { useMemo, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

import { useLoans } from '../../hooks/useLoans'

import {
  MetricCard,
  SectionTitle,
  StatusBadge,
  ProgressBar,
  LoadingScreen,
  EmptyState,
} from '../shared/UI'

import {
  fmtINR,
  pct,
  fmtDate,
  effectiveStatus,
  statusCounts,
  loanTotals,
  buildTrendData,
  axisINR,
} from '../../lib/utils'

const TT = {
  contentStyle: {
    background: 'var(--ll-surface-container-high)',
    border: '1px solid var(--ll-outline-variant)',
    borderRadius: 10,
    fontSize: 12,
    color: 'var(--ll-on-surface)',
  },
  labelStyle: {
    color: 'var(--ll-on-surface-variant)',
  },
  itemStyle: {
    color: 'var(--ll-on-surface)',
  },
}

const STATUS_META = {
  active: {
    label: 'Active',
    color: 'var(--chart-1)',
  },
  completed: {
    label: 'Completed',
    color: 'var(--chart-3)',
  },
  defaulted: {
    label: 'Defaulted',
    color: 'var(--chart-err)',
  },
  pending: {
    label: 'Pending',
    color: 'var(--chart-4)',
  },
}

const STATUS_ORDER = [
  'active',
  'completed',
  'defaulted',
  'pending',
]

const TREND_MODES = [
  {
    v: 'monthly',
    label: 'Monthly',
  },
  {
    v: 'cumulative',
    label: 'Cumulative',
  },
  {
    v: 'outstanding',
    label: 'Outstanding',
  },
]

const WINDOWS = [
  {
    v: 6,
    label: '6M',
  },
  {
    v: 12,
    label: '12M',
  },
  {
    v: 'all',
    label: 'All',
  },
]

function Segmented({ options, value, onChange }) {
  return (
    <div className="ll-segmented">
      {options.map(option => {
        const active = option.v === value

        return (
          <button
            key={String(option.v)}
            type="button"
            className={active ? 'active' : ''}
            onClick={() => onChange(option.v)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

function TrendChart({
  loans,
  payments,
  trend,
  trendMode,
  trendWindow,
  setTrendMode,
  setTrendWindow,
}) {
  const trendDescription =
    trendMode === 'monthly'
      ? 'Your recorded repayments each month'
      : trendMode === 'cumulative'
        ? 'Total repayments accumulated over time'
        : 'Estimated outstanding principal over time'

  const chartName =
    trendMode === 'monthly'
      ? 'Paid this month'
      : trendMode === 'cumulative'
        ? 'Cumulative paid'
        : 'Outstanding'

  return (
    <section className="card ll-dashboard-chart-card ll-trend-card">
      <div className="ll-card-header">
        <div>
          <div className="ll-card-kicker">
            REPAYMENT ACTIVITY
          </div>

          <h2>Repayment Trend</h2>

          <p>{trendDescription}</p>
        </div>

        <div className="ll-chart-controls">
          <Segmented
            options={TREND_MODES}
            value={trendMode}
            onChange={setTrendMode}
          />

          <Segmented
            options={WINDOWS}
            value={trendWindow}
            onChange={setTrendWindow}
          />
        </div>
      </div>

      {loans.length === 0 ? (
        <div className="ll-chart-empty">
          <EmptyState message="Add your first loan to start tracking repayment activity" />
        </div>
      ) : (
        <>
          <div className="ll-trend-chart">
            <ResponsiveContainer>
              <AreaChart
                data={trend}
                margin={{
                  top: 10,
                  right: 8,
                  left: 4,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient
                    id="loanLedgerTrend"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--chart-1)"
                      stopOpacity={0.3}
                    />

                    <stop
                      offset="95%"
                      stopColor="var(--chart-1)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 5"
                  stroke="var(--ll-outline-variant)"
                  vertical={false}
                />

                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 10,
                    fill: 'var(--ll-on-surface-variant)',
                  }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 10,
                    fill: 'var(--ll-on-surface-variant)',
                  }}
                  tickFormatter={axisINR}
                  width={58}
                />

                <Tooltip
                  {...TT}
                  formatter={value =>
                    value == null ? '—' : fmtINR(value)
                  }
                />

                <Area
                  type="linear"
                  dataKey="value"
                  name={chartName}
                  stroke="var(--chart-1)"
                  strokeWidth={2.2}
                  fill="url(#loanLedgerTrend)"
                  connectNulls={false}
                  dot={false}
                  activeDot={{
                    r: 4,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {payments.length === 0 && (
            <div className="ll-chart-note">
              No repayments have been recorded yet. Your trend will appear
              after the first payment.
            </div>
          )}
        </>
      )}
    </section>
  )
}

function StatusChart({
  loans,
  counts,
  statusData,
  statusFilter,
  setStatusFilter,
}) {
  return (
    <section className="card ll-dashboard-chart-card ll-status-card">
      <div className="ll-card-header">
        <div>
          <div className="ll-card-kicker">
            PORTFOLIO STATUS
          </div>

          <h2>Loan Status</h2>

          <p>Current distribution of your loan records</p>
        </div>
      </div>

      <div className="ll-status-chart">
        {loans.length === 0 ? (
          <div className="ll-empty-donut" />
        ) : (
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={54}
                outerRadius={76}
                paddingAngle={3}
                dataKey="value"
                stroke="transparent"
                isAnimationActive={false}
              >
                {statusData.map((entry, index) => (
                  <Cell
                    key={`${entry.key}-${index}`}
                    fill={entry.color}
                  />
                ))}
              </Pie>

              <Tooltip
                {...TT}
                formatter={(value, _name, props) => [
                  `${value} loan${value === 1 ? '' : 's'}`,
                  props?.payload?.name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        )}

        <div className="ll-donut-center">
          <strong>{loans.length}</strong>

          <span>
            loan{loans.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      <div className="ll-status-legend">
        {loans.length === 0 ? (
          <span className="ll-muted">No loan records yet</span>
        ) : (
          STATUS_ORDER
            .filter(status => counts[status] > 0)
            .map(status => {
              const active = statusFilter === status
              const meta = STATUS_META[status]

              return (
                <button
                  key={status}
                  type="button"
                  className={`ll-status-filter ${
                    active ? 'active' : ''
                  }`}
                  onClick={() =>
                    setStatusFilter(
                      active ? null : status
                    )
                  }
                  style={{
                    '--status-color': meta.color,
                  }}
                >
                  <span className="ll-status-color" />

                  <span>{meta.label}</span>

                  <strong>{counts[status]}</strong>
                </button>
              )
            })
        )}
      </div>
    </section>
  )
}

export default function UserDashboard() {
  const {
    loans,
    payments,
    loading,
    error,
    refresh,
  } = useLoans()

  const [trendWindow, setTrendWindow] = useState(6)
  const [trendMode, setTrendMode] = useState('monthly')
  const [statusFilter, setStatusFilter] = useState(null)

  const totals = useMemo(
    () => loanTotals(loans),
    [loans]
  )

  const counts = useMemo(
    () => statusCounts(loans),
    [loans]
  )

  const earliest = useMemo(() => {
    let best = null

    for (const loan of loans) {
      if (
        loan.start_date &&
        (!best || loan.start_date < best)
      ) {
        best = loan.start_date
      }
    }

    for (const payment of payments) {
      const date =
        payment.paid_on ||
        payment.created_at

      if (
        date &&
        (!best || date < best)
      ) {
        best = date
      }
    }

    return best
  }, [loans, payments])

  const trend = useMemo(
    () =>
      buildTrendData({
        payments,
        window: trendWindow,
        mode: trendMode,
        totalPrincipal: totals.borrowed,
        earliest,
      }),
    [
      payments,
      trendWindow,
      trendMode,
      totals.borrowed,
      earliest,
    ]
  )

  const repaidPct = pct(
    totals.paid,
    totals.borrowed
  )

  const statusData = STATUS_ORDER
    .map(status => ({
      key: status,
      name: STATUS_META[status].label,
      value: counts[status] || 0,
      color: STATUS_META[status].color,
    }))
    .filter(item => item.value > 0)

  const recentLoans = statusFilter
    ? loans.filter(
        loan =>
          effectiveStatus(loan) === statusFilter
      )
    : loans

  if (loading) {
    return <LoadingScreen />
  }

  if (error) {
    return (
      <div className="ll-dashboard-error">
        <div className="card ll-error-card">
          <div className="ll-error-icon">
            <AlertCircle size={28} />
          </div>

          <h2>Couldn't load your dashboard</h2>

          <p>{error}</p>

          <button
            type="button"
            className="btn btn-cyan"
            onClick={refresh}
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="ll-dashboard anim-fade-up">
      {/* Overview metrics */}
      <section className="ll-metrics-grid">
        <MetricCard
          className="anim-1"
          label="TOTAL BORROWED"
          value={fmtINR(totals.borrowed)}
          sub={`${loans.length} loan${
            loans.length === 1 ? '' : 's'
          } total`}
          color="cyan"
          icon="₹"
        />

        <MetricCard
          className="anim-2"
          label="TOTAL PAID"
          value={fmtINR(totals.paid)}
          sub={`${repaidPct}% of principal repaid`}
          color="green"
          icon="✓"
        />

        <MetricCard
          className="anim-3"
          label="REMAINING"
          value={fmtINR(totals.remaining)}
          sub="Balance outstanding"
          color="amber"
          icon="↓"
        />

        <MetricCard
          className="anim-4"
          label="ACTIVE LOANS"
          value={totals.active}
          sub="Currently running"
          color="purple"
          icon="↗"
        />
      </section>

      {/* Analytics */}
      <section className="ll-dashboard-analytics">
        <TrendChart
          loans={loans}
          payments={payments}
          trend={trend}
          trendMode={trendMode}
          trendWindow={trendWindow}
          setTrendMode={setTrendMode}
          setTrendWindow={setTrendWindow}
        />

        <StatusChart
          loans={loans}
          counts={counts}
          statusData={statusData}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
      </section>

      {/* Recent loans */}
      <section className="card ll-recent-loans anim-4">
        <SectionTitle
          action={
            statusFilter ? (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() =>
                  setStatusFilter(null)
                }
              >
                Clear {STATUS_META[statusFilter]?.label}
              </button>
            ) : null
          }
        >
          {statusFilter
            ? `${STATUS_META[statusFilter]?.label} Loans`
            : 'Recent Loans'}

          <span className="ll-section-count">
            {statusFilter
              ? recentLoans.length
              : loans.length}
          </span>
        </SectionTitle>

        {loans.length === 0 ? (
          <EmptyState message="NO LOANS YET — ADD YOUR FIRST LOAN" />
        ) : recentLoans.length === 0 ? (
          <EmptyState
            message={`NO ${
              STATUS_META[
                statusFilter
              ]?.label?.toUpperCase() || ''
            } LOANS`}
          />
        ) : (
          <div className="ll-table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>LOAN NAME</th>
                  <th>BANK</th>
                  <th>AMOUNT</th>
                  <th>EMI</th>
                  <th>PROGRESS</th>
                  <th>STATUS</th>
                  <th>SINCE</th>
                </tr>
              </thead>

              <tbody>
                {recentLoans
                  .slice(0, 8)
                  .map(loan => {
                    const progress = pct(
                      loan.paid_amount,
                      loan.amount
                    )

                    return (
                      <tr key={loan.id}>
                        <td className="ll-loan-name">
                          {loan.loan_name}
                        </td>

                        <td className="ll-bank-name">
                          {loan.bank_name || '—'}
                        </td>

                        <td className="mono">
                          {fmtINR(loan.amount)}
                        </td>

                        <td className="mono ll-emi-value">
                          {fmtINR(loan.emi)}
                        </td>

                        <td className="ll-progress-cell">
                          <div className="ll-progress-value">
                            {progress}%
                          </div>

                          <ProgressBar
                            value={progress}
                          />
                        </td>

                        <td>
                          <StatusBadge
                            status={effectiveStatus(
                              loan
                            )}
                          />
                        </td>

                        <td className="ll-date-cell">
                          {fmtDate(
                            loan.start_date
                          )}
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
