
import { useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  AlertCircle,
  X,
  Search,
  Check,
  Scale,
  TrendingDown,
  Calculator,
  RotateCcw,
  ArrowUpRight,
} from 'lucide-react'

import { useBanks } from '../../hooks/useBanks'
import {
  SectionTitle,
  LoadingScreen,
  EmptyState,
} from '../shared/UI'
import {
  loanCost,
  fmtINR,
  axisINR,
  normalizeType,
  typeLabel,
} from '../../lib/utils'

const MAX_COMPARE = 3

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
]

const C = {
  surface: 'var(--md-surface-container)',
  elevated: 'var(--md-surface-container-high)',
  border: 'var(--md-outline-variant)',
  text: 'var(--md-on-surface)',
  muted: 'var(--md-on-surface-variant)',
  primary: 'var(--md-primary)',
}

const tooltipStyle = {
  contentStyle: {
    background: 'var(--md-surface-container-high)',
    border: '1px solid var(--md-outline-variant)',
    borderRadius: 12,
    fontSize: 12,
    color: 'var(--md-on-surface)',
  },
  labelStyle: {
    color: 'var(--md-on-surface-variant)',
  },
  itemStyle: {
    color: 'var(--md-on-surface)',
  },
}

function SummaryMetric({ label, value, accent, detail }) {
  return (
    <div
      style={{
        minWidth: 0,
        padding: '15px 16px',
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        background: C.elevated,
      }}
    >
      <div
        style={{
          color: C.muted,
          fontSize: 10,
          fontWeight: 650,
          letterSpacing: '0.055em',
          marginBottom: 8,
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: accent || C.text,
          fontFamily: 'var(--font-d)',
          fontSize: 21,
          fontWeight: 650,
          overflowWrap: 'anywhere',
        }}
      >
        {value}
      </div>

      {detail && (
        <div style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>
          {detail}
        </div>
      )}
    </div>
  )
}

function ComparisonCard({ option, index, isBest, onRemove, onRecordLoan }) {
  const color = COLORS[index % COLORS.length]

  return (
    <article
      style={{
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: 19,
        border: `1px solid ${isBest ? 'var(--md-primary)' : C.border}`,
        borderRadius: 17,
        background: C.surface,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 10,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              color: C.text,
              fontFamily: 'var(--font-d)',
              fontSize: 17,
              fontWeight: 650,
              overflowWrap: 'anywhere',
            }}
          >
            {option.bank}
          </div>

          <div style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>
            {typeLabel(option.type)} loan
          </div>
        </div>

        <button
          type="button"
          className="icon-btn"
          onClick={() => onRemove(option.id)}
          aria-label={`Remove ${option.bank} from comparison`}
          title="Remove from comparison"
        >
          <X size={16} />
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginTop: 15,
          marginBottom: 16,
        }}
      >
        <span
          style={{
            width: 9,
            height: 9,
            flexShrink: 0,
            borderRadius: 99,
            background: color,
          }}
        />
        <span style={{ color: C.muted, fontSize: 11 }}>
          Product {index + 1}
        </span>

        {isBest && (
          <span
            style={{
              marginLeft: 'auto',
              padding: '4px 8px',
              borderRadius: 999,
              background: 'var(--md-primary-container)',
              color: 'var(--md-on-primary-container)',
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            LOWEST COST
          </span>
        )}
      </div>

      <div
        style={{
          padding: '15px',
          borderRadius: 13,
          background: C.elevated,
          marginBottom: 15,
        }}
      >
        <div style={{ color: C.muted, fontSize: 10, fontWeight: 650 }}>
          MONTHLY EMI
        </div>
        <div
          style={{
            color: C.text,
            fontFamily: 'var(--font-d)',
            fontSize: 25,
            fontWeight: 700,
            marginTop: 5,
            overflowWrap: 'anywhere',
          }}
        >
          {fmtINR(option.emi)}
        </div>
      </div>

      <div style={{ display: 'grid', gap: 13 }}>
        <Detail label="Interest rate" value={`${option.rate}% p.a.`} />
        <Detail label="Principal amount" value={fmtINR(option.principal)} />
        <Detail label="Total interest" value={fmtINR(option.interest)} />
        <Detail label="Total repayment" value={fmtINR(option.totalPaid)} strong />
      </div>

      <div style={{ flex: 1 }} />

      {onRecordLoan && (
        <button
          type="button"
          className="btn btn-cyan"
          onClick={() => onRecordLoan(option)}
          style={{
            width: '100%',
            justifyContent: 'center',
            gap: 8,
            marginTop: 19,
          }}
        >
          Record this loan
          <ArrowUpRight size={15} />
        </button>
      )}
    </article>
  )
}

function Detail({ label, value, strong = false }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      <span style={{ color: C.muted, fontSize: 12 }}>{label}</span>
      <span
        style={{
          color: C.text,
          fontSize: 13,
          fontWeight: strong ? 700 : 550,
          textAlign: 'right',
          overflowWrap: 'anywhere',
        }}
      >
        {value}
      </span>
    </div>
  )
}

export default function CompareLoans({ onRecordLoan }) {
  const { banks = [], loading, error, refresh } = useBanks()

  const [selectedIds, setSelectedIds] = useState([])
  const [amount, setAmount] = useState(500000)
  const [tenure, setTenure] = useState(36)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  const safeAmount = Math.max(0, Number(amount) || 0)
  const safeTenure = Math.max(1, Number(tenure) || 1)

  const categories = useMemo(() => {
    const values = new Map()

    banks.forEach((bank) => {
      const key = normalizeType(bank.loan_type)
      if (!values.has(key)) {
        values.set(key, typeLabel(bank.loan_type))
      }
    })

    return [...values.entries()].sort((a, b) => a[1].localeCompare(b[1]))
  }, [banks])

  const availableBanks = useMemo(() => {
    const query = search.trim().toLowerCase()

    return banks.filter((bank) => {
      const matchesCategory =
        category === 'all' || normalizeType(bank.loan_type) === category

      const matchesSearch =
        !query ||
        `${bank.name || ''} ${bank.loan_type || ''}`
          .toLowerCase()
          .includes(query)

      return matchesCategory && matchesSearch
    })
  }, [banks, search, category])

  const selected = useMemo(
    () =>
      selectedIds
        .map((id) => banks.find((bank) => bank.id === id))
        .filter(Boolean),
    [selectedIds, banks]
  )

  const results = useMemo(
    () =>
      selected.map((bank, index) => {
        const cost = loanCost(
          safeAmount,
          bank.interest_rate,
          safeTenure
        )

        return {
          id: bank.id,
          name: bank.name,
          bank: bank.name,
          type: bank.loan_type,
          rate: Number(bank.interest_rate) || 0,
          color: COLORS[index % COLORS.length],
          ...cost,
        }
      }),
    [selected, safeAmount, safeTenure]
  )

  const bestOption = useMemo(() => {
    if (!results.length) return null

    return [...results].sort(
      (a, b) => a.totalPaid - b.totalPaid
    )[0]
  }, [results])

  const tenureData = useMemo(() => {
    const points = [12, 24, 36, 48, 60, 84, 120]

    return points.map((months) => {
      const row = { tenure: months }

      selected.forEach((bank) => {
        row[`loan_${bank.id}`] = loanCost(
          safeAmount,
          bank.interest_rate,
          months
        ).emi
      })

      return row
    })
  }, [selected, safeAmount])

  function toggle(id) {
    setSelectedIds((previous) => {
      if (previous.includes(id)) {
        return previous.filter((item) => item !== id)
      }

      if (previous.length >= MAX_COMPARE) return previous

      return [...previous, id]
    })
  }

  function clearSelection() {
    setSelectedIds([])
  }

  if (loading) return <LoadingScreen />

  if (error) {
    return (
      <div
        className="anim-fade-up"
        style={{ maxWidth: 520, margin: '40px auto' }}
      >
        <div className="card" style={{ padding: 28, textAlign: 'center' }}>
          <AlertCircle
            size={36}
            color="var(--md-error)"
            style={{ marginBottom: 10 }}
          />

          <div
            style={{
              color: C.text,
              fontFamily: 'var(--font-d)',
              fontSize: 19,
              fontWeight: 650,
              marginBottom: 7,
            }}
          >
            Couldn't load loan products
          </div>

          <p style={{ color: C.muted, fontSize: 13, marginBottom: 18 }}>
            {error}
          </p>

          <button type="button" className="btn btn-cyan" onClick={refresh}>
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="anim-fade-up" style={{ width: '100%', minWidth: 0 }}>
      <SectionTitle>Compare Loans</SectionTitle>

      <p
        style={{
          maxWidth: 680,
          marginTop: -7,
          marginBottom: 21,
          color: C.muted,
          fontSize: 13,
          lineHeight: 1.65,
        }}
      >
        Compare loan products side by side using the same amount and repayment
        period. Understand the EMI, interest cost, and estimated total repayment
        before choosing a loan.
      </p>

      {/* COMPARISON SETTINGS */}
      <section
        style={{
          padding: 20,
          marginBottom: 17,
          border: `1px solid ${C.border}`,
          borderRadius: 18,
          background: C.surface,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 19,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 37,
                height: 37,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 12,
                color: C.primary,
                background: 'var(--md-primary-container)',
              }}
            >
              <Calculator size={18} />
            </div>

            <div>
              <div style={{ color: C.text, fontSize: 15, fontWeight: 650 }}>
                Comparison settings
              </div>
              <div style={{ color: C.muted, fontSize: 11, marginTop: 3 }}>
                These values apply to every selected product
              </div>
            </div>
          </div>

          <span
            style={{
              padding: '6px 11px',
              borderRadius: 999,
              background: 'var(--md-primary-container)',
              color: 'var(--md-on-primary-container)',
              fontSize: 11,
              fontWeight: 650,
            }}
          >
            {selectedIds.length} / {MAX_COMPARE} selected
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 230px), 1fr))',
            gap: 22,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 10,
                marginBottom: 10,
              }}
            >
              <label className="input-label" style={{ marginBottom: 0 }}>
                LOAN AMOUNT
              </label>
              <span style={{ color: C.primary, fontSize: 13, fontWeight: 700 }}>
                {fmtINR(safeAmount)}
              </span>
            </div>

            <input
              type="range"
              min={50000}
              max={5000000}
              step={50000}
              value={Math.min(5000000, Math.max(50000, safeAmount))}
              onChange={(event) => setAmount(Number(event.target.value))}
              aria-label="Loan amount slider"
              style={{ width: '100%', accentColor: C.primary }}
            />

            <input
              className="input-field"
              type="number"
              min="0"
              step="50000"
              value={amount}
              onChange={(event) => setAmount(Number(event.target.value))}
              aria-label="Loan amount"
              style={{ marginTop: 10 }}
            />
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 10,
                marginBottom: 10,
              }}
            >
              <label className="input-label" style={{ marginBottom: 0 }}>
                REPAYMENT TENURE
              </label>
              <span style={{ color: C.primary, fontSize: 13, fontWeight: 700 }}>
                {safeTenure} months
              </span>
            </div>

            <input
              type="range"
              min={6}
              max={120}
              step={6}
              value={Math.min(120, Math.max(6, safeTenure))}
              onChange={(event) => setTenure(Number(event.target.value))}
              aria-label="Repayment tenure slider"
              style={{ width: '100%', accentColor: C.primary }}
            />

            <input
              className="input-field"
              type="number"
              min="1"
              step="1"
              value={tenure}
              onChange={(event) => setTenure(Number(event.target.value))}
              aria-label="Repayment tenure in months"
              style={{ marginTop: 10 }}
            />
          </div>
        </div>
      </section>

      {/* PRODUCT SELECTOR */}
      <section
        style={{
          padding: 20,
          marginBottom: 20,
          border: `1px solid ${C.border}`,
          borderRadius: 18,
          background: C.surface,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 15,
          }}
        >
          <div>
            <div style={{ color: C.text, fontSize: 15, fontWeight: 650 }}>
              Choose loan products
            </div>
            <div style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>
              Select up to three products to compare
            </div>
          </div>

          {selectedIds.length > 0 && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={clearSelection}
              style={{ gap: 6 }}
            >
              <RotateCcw size={13} />
              Clear selection
            </button>
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 210px), 1fr))',
            gap: 12,
            marginBottom: 15,
          }}
        >
          <div style={{ position: 'relative', minWidth: 0 }}>
            <Search
              size={15}
              color={C.muted}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            />
            <input
              className="input-field"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search banks or loan types..."
              aria-label="Search loan products"
              style={{ paddingLeft: 37 }}
            />
          </div>

          <select
            className="input-field"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filter loan category"
          >
            <option value="all">All categories</option>
            {categories.map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {banks.length === 0 ? (
          <EmptyState message="No bank loan products are available yet." />
        ) : availableBanks.length === 0 ? (
          <EmptyState message="No products match your search or category." />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 225px), 1fr))',
              gap: 10,
            }}
          >
            {availableBanks.map((bank) => {
              const isSelected = selectedIds.includes(bank.id)
              const isDisabled =
                !isSelected && selectedIds.length >= MAX_COMPARE

              return (
                <button
                  key={bank.id}
                  type="button"
                  onClick={() => toggle(bank.id)}
                  disabled={isDisabled}
                  aria-pressed={isSelected}
                  style={{
                    minWidth: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 11,
                    padding: '13px 14px',
                    borderRadius: 13,
                    border: `1px solid ${isSelected ? 'var(--md-primary)' : C.border}`,
                    background: isSelected
                      ? 'var(--md-primary-container)'
                      : C.elevated,
                    color: isSelected
                      ? 'var(--md-on-primary-container)'
                      : C.text,
                    textAlign: 'left',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    opacity: isDisabled ? 0.48 : 1,
                    transition: 'background 160ms ease, border-color 160ms ease',
                  }}
                >
                  <span
                    style={{
                      width: 30,
                      height: 30,
                      flexShrink: 0,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: 9,
                      background: isSelected
                        ? 'rgba(127,127,127,0.14)'
                        : C.surface,
                      color: isSelected ? 'inherit' : C.primary,
                    }}
                  >
                    {isSelected ? <Check size={16} /> : <Scale size={15} />}
                  </span>

                  <span style={{ minWidth: 0, flex: 1 }}>
                    <span
                      style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 650,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {bank.name}
                    </span>
                    <span
                      style={{
                        display: 'block',
                        marginTop: 4,
                        fontSize: 11,
                        opacity: 0.78,
                      }}
                    >
                      {typeLabel(bank.loan_type)} · {Number(bank.interest_rate) || 0}% p.a.
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {selectedIds.length >= MAX_COMPARE && (
          <div
            style={{
              color: C.muted,
              fontSize: 11,
              marginTop: 12,
            }}
          >
            Maximum of three products reached. Remove one to select another.
          </div>
        )}
      </section>

      {/* RESULTS */}
      {results.length === 0 ? (
        <div
          style={{
            padding: '35px 20px',
            border: `1px dashed ${C.border}`,
            borderRadius: 18,
            textAlign: 'center',
            background: C.surface,
          }}
        >
          <div
            style={{
              width: 46,
              height: 46,
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 13px',
              borderRadius: 14,
              background: 'var(--md-primary-container)',
              color: C.primary,
            }}
          >
            <Scale size={21} />
          </div>

          <div style={{ color: C.text, fontSize: 15, fontWeight: 650 }}>
            Your comparison starts here
          </div>
          <p
            style={{
              maxWidth: 370,
              margin: '7px auto 0',
              color: C.muted,
              fontSize: 12,
              lineHeight: 1.6,
            }}
          >
            Select at least one loan product above. Its estimated EMI,
            interest, and total repayment will appear here.
          </p>
        </div>
      ) : (
        <>
          {bestOption && results.length > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: 16,
                marginBottom: 16,
                border: `1px solid var(--md-primary)`,
                borderRadius: 15,
                background: 'var(--md-primary-container)',
                color: 'var(--md-on-primary-container)',
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  flexShrink: 0,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: 11,
                  background: 'rgba(127,127,127,0.15)',
                }}
              >
                <TrendingDown size={18} />
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 750 }}>
                  Lowest estimated total repayment
                </div>
                <div style={{ fontSize: 12, marginTop: 4, lineHeight: 1.55 }}>
                  {bestOption.bank} has the lowest estimated repayment at{' '}
                  <strong>{fmtINR(bestOption.totalPaid)}</strong> for the
                  selected amount and tenure.
                </div>
              </div>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
              marginBottom: 13,
            }}
          >
            <div>
              <div style={{ color: C.text, fontSize: 16, fontWeight: 700 }}>
                Comparison results
              </div>
              <div style={{ color: C.muted, fontSize: 11, marginTop: 3 }}>
                Based on {fmtINR(safeAmount)} over {safeTenure} months
              </div>
            </div>

            <span style={{ color: C.muted, fontSize: 11 }}>
              {results.length} product{results.length === 1 ? '' : 's'} selected
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
              gap: 13,
              marginBottom: 19,
            }}
          >
            {results.map((option, index) => (
              <ComparisonCard
                key={option.id}
                option={option}
                index={index}
                isBest={bestOption?.id === option.id && results.length > 1}
                onRemove={toggle}
                onRecordLoan={onRecordLoan}
              />
            ))}
          </div>

          {/* EMI COMPARISON CHART */}
          {results.length >= 2 && (
            <section
              style={{
                padding: 20,
                border: `1px solid ${C.border}`,
                borderRadius: 18,
                background: C.surface,
              }}
            >
              <div style={{ color: C.text, fontSize: 16, fontWeight: 700 }}>
                EMI across different tenures
              </div>
              <p
                style={{
                  color: C.muted,
                  fontSize: 12,
                  lineHeight: 1.6,
                  marginTop: 5,
                  marginBottom: 17,
                }}
              >
                Compare how the estimated monthly instalment changes when
                you extend or shorten the repayment period. The loan amount
                remains {fmtINR(safeAmount)}.
              </p>

              <div style={{ height: 275, minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={tenureData}
                    margin={{ top: 8, right: 12, left: 4, bottom: 4 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--md-outline-variant)"
                    />

                    <XAxis
                      dataKey="tenure"
                      tickFormatter={(value) => `${value} mo`}
                      tick={{ fontSize: 10, fill: C.muted }}
                      stroke="var(--md-outline-variant)"
                    />

                    <YAxis
                      tickFormatter={axisINR}
                      tick={{ fontSize: 10, fill: C.muted }}
                      stroke="var(--md-outline-variant)"
                      width={58}
                    />

                    <Tooltip
                      {...tooltipStyle}
                      labelFormatter={(value) => `${value} months`}
                      formatter={(value) => fmtINR(value)}
                    />

                    <Legend
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{
                        fontSize: 11,
                        color: C.muted,
                        paddingTop: 10,
                      }}
                    />

                    {selected.map((bank, index) => (
                      <Line
                        key={bank.id}
                        type="monotone"
                        dataKey={`loan_${bank.id}`}
                        name={bank.name}
                        stroke={COLORS[index % COLORS.length]}
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}
        </>
      )}

      <p
        style={{
          color: C.muted,
          fontSize: 11,
          lineHeight: 1.6,
          marginTop: 17,
        }}
      >
        Estimates use the listed annual interest rates and the app's EMI
        calculation. Actual offers may differ due to lender eligibility,
        processing fees, rate changes, and other loan conditions.
      </p>
    </div>
  )
}
