
import { useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Calculator,
  IndianRupee,
  Percent,
  CalendarDays,
  TrendingUp,
  RotateCcw,
} from 'lucide-react'

import { SectionTitle } from '../shared/UI'
import { loanCost, fmtINR, buildSchedule } from '../../lib/utils'

const C = {
  surface: 'var(--md-surface-container)',
  elevated: 'var(--md-surface-container-high)',
  border: 'var(--md-outline-variant)',
  text: 'var(--md-on-surface)',
  muted: 'var(--md-on-surface-variant)',
  primary: 'var(--md-primary)',
  principal: 'var(--chart-1)',
  interest: 'var(--chart-4)',
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

function Metric({ icon: Icon, label, value, detail, accent }) {
  return (
    <div
      style={{
        minWidth: 0,
        padding: '15px 16px',
        border: `1px solid ${C.border}`,
        borderRadius: 15,
        background: C.surface,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: 31,
            height: 31,
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 10,
            background: C.elevated,
            color: accent || C.primary,
          }}
        >
          <Icon size={15} />
        </div>

        <span style={{ color: C.muted, fontSize: 11 }}>
          {label}
        </span>
      </div>

      <div
        style={{
          color: accent || C.text,
          fontFamily: 'var(--font-d)',
          fontSize: 19,
          fontWeight: 650,
          overflowWrap: 'anywhere',
        }}
      >
        {value}
      </div>

      {detail && (
        <div style={{ color: C.muted, fontSize: 10, marginTop: 5 }}>
          {detail}
        </div>
      )}
    </div>
  )
}

function InputControl({
  label,
  display,
  value,
  min,
  max,
  step,
  onChange,
  suffix,
}) {
  return (
    <div style={{ marginBottom: 23 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 10,
        }}
      >
        <label
          style={{
            color: C.muted,
            fontSize: 11,
            fontWeight: 650,
            letterSpacing: '0.045em',
          }}
        >
          {label}
        </label>

        <span
          style={{
            color: C.primary,
            fontSize: 13,
            fontWeight: 700,
            textAlign: 'right',
          }}
        >
          {display}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={Math.min(max, Math.max(min, value))}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={label}
        style={{
          width: '100%',
          display: 'block',
          accentColor: C.primary,
          cursor: 'pointer',
          marginBottom: 11,
        }}
      />

      <input
        className="input-field"
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => {
          const next = event.target.value
          onChange(next === '' ? 0 : Number(next))
        }}
        aria-label={`${label} numeric value`}
      />

      {suffix && (
        <div style={{ color: C.muted, fontSize: 10, marginTop: 5 }}>
          {suffix}
        </div>
      )}
    </div>
  )
}

function buildSafeSchedule(principal, rate, months) {
  if (principal <= 0 || months <= 0) return []

  // Handle 0% interest separately because the shared schedule
  // helper assumes a positive EMI.
  if (rate === 0) {
    const regularPayment = Math.round(principal / months)
    let balance = principal

    return Array.from({ length: months }, (_, index) => {
      const payment = index === months - 1
        ? balance
        : Math.min(regularPayment, balance)

      balance = Math.max(0, balance - payment)

      return {
        month: index + 1,
        emi: payment,
        principal: payment,
        interest: 0,
        balance,
      }
    })
  }

  return buildSchedule(principal, rate, months)
}

export default function EMICalculator() {
  const [principal, setPrincipal] = useState(500000)
  const [rate, setRate] = useState(9.5)
  const [tenure, setTenure] = useState(36)

  const safePrincipal = Math.min(
    10000000,
    Math.max(0, Number(principal) || 0)
  )

  const safeRate = Math.min(
    30,
    Math.max(0, Number(rate) || 0)
  )

  const safeTenure = Math.min(
    360,
    Math.max(1, Math.round(Number(tenure) || 1))
  )

  const cost = useMemo(() => {
    if (safeRate === 0) {
      const emi = safePrincipal > 0
        ? Math.round(safePrincipal / safeTenure)
        : 0

      const totalPaid = emi * safeTenure

      return {
        principal: safePrincipal,
        months: safeTenure,
        rate: 0,
        emi,
        totalPaid,
        interest: 0,
        totalCost: totalPaid,
      }
    }

    return loanCost(safePrincipal, safeRate, safeTenure)
  }, [safePrincipal, safeRate, safeTenure])

  const schedule = useMemo(
    () =>
      buildSafeSchedule(
        safePrincipal,
        safeRate,
        Math.min(safeTenure, 12)
      ),
    [safePrincipal, safeRate, safeTenure]
  )

  const fullSchedule = useMemo(
    () =>
      buildSafeSchedule(
        safePrincipal,
        safeRate,
        safeTenure
      ),
    [safePrincipal, safeRate, safeTenure]
  )

  const principalPercent =
    cost.totalPaid > 0
      ? Math.min(100, (safePrincipal / cost.totalPaid) * 100)
      : 0

  const interestPercent =
    cost.totalPaid > 0
      ? Math.max(0, 100 - principalPercent)
      : 0

  const resetCalculator = () => {
    setPrincipal(500000)
    setRate(9.5)
    setTenure(36)
  }

  return (
    <div
      className="anim-fade-up"
      style={{ width: '100%', minWidth: 0 }}
    >
      <SectionTitle>EMI Calculator</SectionTitle>

      <p
        style={{
          maxWidth: 690,
          marginTop: -7,
          marginBottom: 22,
          color: C.muted,
          fontSize: 13,
          lineHeight: 1.65,
        }}
      >
        Estimate your monthly instalment, understand the total interest
        payable, and explore how your loan balance changes with every payment.
      </p>

      {/* MAIN CALCULATOR */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 290px), 1fr))',
          gap: 15,
          marginBottom: 17,
          alignItems: 'stretch',
        }}
      >
        {/* INPUTS */}
        <section
          style={{
            minWidth: 0,
            padding: 21,
            border: `1px solid ${C.border}`,
            borderRadius: 18,
            background: C.surface,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 23,
            }}
          >
            <div
              style={{
                width: 37,
                height: 37,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 12,
                background: 'var(--md-primary-container)',
                color: C.primary,
              }}
            >
              <Calculator size={18} />
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{ color: C.text, fontSize: 15, fontWeight: 700 }}>
                Loan details
              </div>
              <div style={{ color: C.muted, fontSize: 11, marginTop: 3 }}>
                Change values to recalculate
              </div>
            </div>

            <button
              type="button"
              className="icon-btn"
              onClick={resetCalculator}
              title="Reset calculator"
              aria-label="Reset calculator"
              style={{ marginLeft: 'auto' }}
            >
              <RotateCcw size={15} />
            </button>
          </div>

          <InputControl
            label="LOAN AMOUNT"
            display={fmtINR(safePrincipal)}
            value={principal}
            min={10000}
            max={10000000}
            step={10000}
            onChange={setPrincipal}
          />

          <InputControl
            label="ANNUAL INTEREST RATE"
            display={`${safeRate}%`}
            value={rate}
            min={0}
            max={30}
            step={0.1}
            onChange={setRate}
            suffix="Enter the annual interest rate offered by the lender."
          />

          <InputControl
            label="LOAN TENURE"
            display={`${safeTenure} months`}
            value={tenure}
            min={1}
            max={360}
            step={1}
            onChange={setTenure}
            suffix={`${(safeTenure / 12).toFixed(1)} years`}
          />
        </section>

        {/* RESULTS */}
        <div
          style={{
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 13,
          }}
        >
          <section
            style={{
              padding: 23,
              border: `1px solid ${C.border}`,
              borderRadius: 18,
              background: 'var(--md-primary-container)',
            }}
          >
            <div
              style={{
                color: 'var(--md-on-primary-container)',
                fontSize: 11,
                fontWeight: 650,
                letterSpacing: '0.06em',
                marginBottom: 10,
              }}
            >
              ESTIMATED MONTHLY EMI
            </div>

            <div
              style={{
                color: 'var(--md-on-primary-container)',
                fontFamily: 'var(--font-d)',
                fontSize: 'clamp(30px, 4vw, 43px)',
                fontWeight: 750,
                lineHeight: 1.2,
                overflowWrap: 'anywhere',
              }}
            >
              {fmtINR(cost.emi)}
            </div>

            <div
              style={{
                color: 'var(--md-on-primary-container)',
                fontSize: 12,
                opacity: 0.82,
                marginTop: 8,
              }}
            >
              Every month for {safeTenure} months
            </div>
          </section>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 10,
            }}
          >
            <Metric
              icon={IndianRupee}
              label="Principal"
              value={fmtINR(safePrincipal)}
              accent={C.principal}
            />

            <Metric
              icon={Percent}
              label="Total interest"
              value={fmtINR(cost.interest)}
              accent={C.interest}
            />

            <Metric
              icon={WalletIcon}
              label="Total repayment"
              value={fmtINR(cost.totalPaid)}
              accent={C.primary}
            />

            <Metric
              icon={TrendingUp}
              label="Interest share"
              value={`${Math.round(interestPercent)}%`}
              accent={C.interest}
            />
          </div>

          {/* REPAYMENT SPLIT */}
          <section
            style={{
              padding: 17,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              background: C.surface,
            }}
          >
            <div
              style={{
                color: C.text,
                fontSize: 13,
                fontWeight: 650,
                marginBottom: 13,
              }}
            >
              Principal vs interest
            </div>

            <div
              style={{
                display: 'flex',
                width: '100%',
                height: 12,
                overflow: 'hidden',
                borderRadius: 99,
                background: C.elevated,
              }}
            >
              <div
                style={{
                  width: `${principalPercent}%`,
                  background: C.principal,
                  transition: 'width 180ms ease',
                }}
              />
              <div
                style={{
                  width: `${interestPercent}%`,
                  background: C.interest,
                  transition: 'width 180ms ease',
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 10,
                marginTop: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: 3,
                    background: C.principal,
                  }}
                />
                <span style={{ color: C.muted, fontSize: 11 }}>
                  Principal {Math.round(principalPercent)}%
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: 3,
                    background: C.interest,
                  }}
                />
                <span style={{ color: C.muted, fontSize: 11 }}>
                  Interest {Math.round(interestPercent)}%
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* FIRST 12 MONTHS CHART */}
      <section
        style={{
          padding: 21,
          marginBottom: 16,
          border: `1px solid ${C.border}`,
          borderRadius: 18,
          background: C.surface,
        }}
      >
        <div
          style={{
            color: C.text,
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          First 12 months
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
          See how each monthly instalment is split between principal
          repayment and interest.
        </p>

        {schedule.length > 0 ? (
          <div style={{ height: 260, minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={schedule}
                margin={{ top: 8, right: 8, left: 0, bottom: 2 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--md-outline-variant)"
                />

                <XAxis
                  dataKey="month"
                  tickFormatter={(value) => `M${value}`}
                  tick={{ fontSize: 10, fill: C.muted }}
                  stroke="var(--md-outline-variant)"
                />

                <YAxis
                  tick={{
                    fontSize: 10,
                    fill: C.muted,
                  }}
                  stroke="var(--md-outline-variant)"
                  width={55}
                  tickFormatter={(value) => {
                    if (value >= 100000) return `${(value / 100000).toFixed(1)}L`
                    if (value >= 1000) return `${Math.round(value / 1000)}K`
                    return value
                  }}
                />

                <Tooltip
                  {...tooltipStyle}
                  labelFormatter={(value) => `Month ${value}`}
                  formatter={(value) => fmtINR(value)}
                />

                <Bar
                  dataKey="principal"
                  name="Principal"
                  stackId="emi"
                  fill={C.principal}
                />

                <Bar
                  dataKey="interest"
                  name="Interest"
                  stackId="emi"
                  fill={C.interest}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ padding: 35, color: C.muted, textAlign: 'center' }}>
            Enter a loan amount to view the repayment chart.
          </div>
        )}
      </section>

      {/* FULL REPAYMENT SCHEDULE */}
      <section
        style={{
          padding: 21,
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
            marginBottom: 5,
          }}
        >
          <div>
            <div style={{ color: C.text, fontSize: 16, fontWeight: 700 }}>
              Repayment schedule
            </div>
            <p style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>
              Estimated month-by-month repayment breakdown.
            </p>
          </div>

          <span
            style={{
              padding: '6px 10px',
              borderRadius: 999,
              background: C.elevated,
              color: C.muted,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {fullSchedule.length} instalments
          </span>
        </div>

        {fullSchedule.length > 0 ? (
          <div
            className="table-scroll"
            style={{
              maxHeight: 390,
              overflow: 'auto',
              marginTop: 17,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
            }}
          >
            <table className="data-table">
              <thead>
                <tr>
                  <th>MONTH</th>
                  <th>EMI</th>
                  <th>PRINCIPAL</th>
                  <th>INTEREST</th>
                  <th>REMAINING BALANCE</th>
                </tr>
              </thead>

              <tbody>
                {fullSchedule.map((row) => (
                  <tr key={row.month}>
                    <td className="mono">{row.month}</td>

                    <td
                      className="mono"
                      style={{ color: C.primary }}
                    >
                      {fmtINR(row.emi)}
                    </td>

                    <td
                      className="mono"
                      style={{ color: C.principal }}
                    >
                      {fmtINR(row.principal)}
                    </td>

                    <td
                      className="mono"
                      style={{ color: C.interest }}
                    >
                      {fmtINR(row.interest)}
                    </td>

                    <td className="mono" style={{ color: C.muted }}>
                      {fmtINR(row.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            style={{
              padding: 35,
              marginTop: 15,
              borderRadius: 12,
              background: C.elevated,
              color: C.muted,
              fontSize: 13,
              textAlign: 'center',
            }}
          >
            Enter a loan amount greater than zero to generate a repayment schedule.
          </div>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 9,
            padding: '12px 14px',
            marginTop: 15,
            borderRadius: 12,
            background: C.elevated,
            color: C.muted,
            fontSize: 11,
            lineHeight: 1.6,
          }}
        >
          <CalendarDays size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          This schedule is an estimate using a fixed annual interest rate
          and monthly repayments. Actual lender figures may differ due to
          processing fees, insurance, rate changes, or other charges.
        </div>
      </section>
    </div>
  )
}

function WalletIcon(props) {
  return <IndianRupee {...props} />
}
