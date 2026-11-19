
import {
  AlertCircle,
  Activity,
  CheckCircle2,
  Users,
  Wallet,
  FileText,
  TrendingUp,
} from 'lucide-react'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

import { useNGO } from '../../hooks/useNGO'
import {
  SectionTitle,
  StatusBadge,
  ProgressBar,
  LoadingScreen,
  EmptyState,
} from '../shared/UI'
import { fmtINR, pct } from '../../lib/utils'

const COLORS = {
  active: 'var(--chart-1)',
  completed: 'var(--chart-3)',
  defaulted: 'var(--ll-error)',
  pending: 'var(--chart-2)',
}

const TOOLTIP_STYLE = {
  contentStyle: {
    background: 'var(--md-surface)',
    color: 'var(--md-on-surface)',
    border: '1px solid var(--md-outline-variant)',
    borderRadius: 10,
    padding: '9px 12px',
    fontSize: 12,
    boxShadow: 'var(--ll-shadow-card)',
  },
  labelStyle: {
    color: 'var(--md-on-surface)',
    fontWeight: 650,
    marginBottom: 4,
  },
  itemStyle: {
    color: 'var(--md-on-surface-variant)',
  },
}

const cardStyle = {
  minWidth: 0,
  padding: 20,
  background: 'var(--md-surface)',
  border: '1px solid var(--md-outline-variant)',
  borderRadius: 14,
  boxShadow: 'var(--ll-shadow-card)',
}

function OverviewCard({ label, value, detail, icon: Icon, accent, soft }) {
  return (
    <article
      style={{
        ...cardStyle,
        minHeight: 146,
        padding: '19px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 17,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <span
          style={{
            color: 'var(--md-on-surface-variant)',
            fontSize: 11,
            lineHeight: 1.4,
            fontWeight: 700,
            letterSpacing: '0.055em',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </span>

        <span
          style={{
            width: 38,
            height: 38,
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 11,
            color: accent,
            background: soft,
            border: '1px solid var(--md-outline-variant)',
          }}
        >
          <Icon size={18} strokeWidth={1.9} />
        </span>
      </div>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            color: 'var(--md-on-surface)',
            fontSize: 'clamp(21px, 2vw, 27px)',
            fontWeight: 750,
            lineHeight: 1.2,
            letterSpacing: '-0.045em',
            overflowWrap: 'anywhere',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}
        </div>

        <div
          style={{
            color: 'var(--md-on-surface-variant)',
            fontSize: 12,
            lineHeight: 1.5,
            marginTop: 7,
          }}
        >
          {detail}
        </div>
      </div>
    </article>
  )
}

function SummaryRow({ label, value, color, last = false }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '14px 0',
        borderBottom: last
          ? 'none'
          : '1px solid var(--md-outline-variant)',
      }}
    >
      <div
        style={{
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          color: 'var(--md-on-surface-variant)',
          fontSize: 13,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 8,
            height: 8,
            flexShrink: 0,
            borderRadius: 3,
            background: color,
          }}
        />
        {label}
      </div>

      <span
        style={{
          color: 'var(--md-on-surface)',
          fontSize: 16,
          fontWeight: 750,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
    </div>
  )
}

function DetailMetric({ label, value, color }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div
        style={{
          color: 'var(--md-on-surface-variant)',
          fontSize: 10,
          lineHeight: 1.4,
          fontWeight: 700,
          letterSpacing: '0.045em',
          textTransform: 'uppercase',
          marginBottom: 7,
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: color || 'var(--md-on-surface)',
          fontSize: 16,
          fontWeight: 750,
          lineHeight: 1.35,
          overflowWrap: 'anywhere',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </div>
    </div>
  )
}

export default function NGODashboard() {
  const { beneficiaries, ngoLoans, loading } = useNGO()

  if (loading) return <LoadingScreen />

  const loans = ngoLoans || []
  const members = beneficiaries || []

  const totalPrincipal = loans.reduce(
    (sum, loan) => sum + Number(loan.amount || 0),
    0
  )

  const totalPaid = loans.reduce(
    (sum, loan) => sum + Number(loan.paid_amount || 0),
    0
  )

  const totalOutstanding = Math.max(
    0,
    totalPrincipal - totalPaid
  )

  const activeLoans = loans.filter(
    loan => loan.status === 'active'
  )

  const completedLoans = loans.filter(
    loan => loan.status === 'completed'
  )

  const defaultedLoans = loans.filter(
    loan => loan.status === 'defaulted'
  )

  const pendingLoans = loans.filter(
    loan => loan.status === 'pending'
  )

  const defaultRate = loans.length
    ? Math.round((defaultedLoans.length / loans.length) * 100)
    : 0

  const recoveryRate = pct(totalPaid, totalPrincipal)

  const activeBeneficiaries = new Set(
    activeLoans.map(loan => loan.beneficiary_id)
  ).size

  const statusData = [
    {
      name: 'Active',
      value: activeLoans.length,
      color: COLORS.active,
    },
    {
      name: 'Completed',
      value: completedLoans.length,
      color: COLORS.completed,
    },
    {
      name: 'Defaulted',
      value: defaultedLoans.length,
      color: COLORS.defaulted,
    },
    {
      name: 'Pending',
      value: pendingLoans.length,
      color: COLORS.pending,
    },
  ].filter(item => item.value > 0)

  const recentLoans = loans.slice(0, 8)

  return (
    <div
      className="anim-fade-up"
      style={{
        width: '100%',
        minWidth: 0,
        paddingBottom: 28,
      }}
    >
      {/* Page introduction */}
      <header
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              color: 'var(--md-primary)',
              fontSize: 11,
              fontWeight: 750,
              letterSpacing: '0.075em',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            Organization overview
          </div>

          <h2
            style={{
              margin: 0,
              color: 'var(--md-on-surface)',
              fontSize: 'clamp(23px, 2.4vw, 29px)',
              fontWeight: 750,
              lineHeight: 1.2,
              letterSpacing: '-0.045em',
            }}
          >
            NGO Dashboard
          </h2>

          <p
            style={{
              margin: '8px 0 0',
              maxWidth: 540,
              color: 'var(--md-on-surface-variant)',
              fontSize: 13,
              lineHeight: 1.65,
            }}
          >
            Monitor beneficiaries, loan accounts and recorded repayment activity.
          </p>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            minHeight: 35,
            padding: '7px 12px',
            borderRadius: 9,
            background: 'var(--md-surface-container)',
            border: '1px solid var(--md-outline-variant)',
            color: 'var(--md-on-surface-variant)',
            fontSize: 11,
            fontWeight: 650,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--ll-success)',
            }}
          />
          Organization summary
        </div>
      </header>

      {/* Overview metrics */}
      <section
        aria-label="Organization metrics"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 215px), 1fr))',
          gap: 14,
          marginBottom: 18,
        }}
      >
        <OverviewCard
          label="Principal tracked"
          value={fmtINR(totalPrincipal)}
          detail={`${loans.length} loan accounts`}
          icon={Wallet}
          accent="var(--md-primary)"
          soft="var(--md-primary-container)"
        />

        <OverviewCard
          label="Payments recorded"
          value={fmtINR(totalPaid)}
          detail={`${recoveryRate}% of tracked principal`}
          icon={CheckCircle2}
          accent="var(--ll-success)"
          soft="var(--ll-success-container)"
        />

        <OverviewCard
          label="Active beneficiaries"
          value={activeBeneficiaries}
          detail={`${members.length} registered beneficiaries`}
          icon={Users}
          accent="var(--chart-2)"
          soft="var(--md-tertiary-container)"
        />

        <OverviewCard
          label="Default rate"
          value={`${defaultRate}%`}
          detail={`${defaultedLoans.length} defaulted accounts`}
          icon={AlertCircle}
          accent="var(--ll-error)"
          soft="var(--ll-error-container)"
        />
      </section>

      {/* Repayment overview */}
      <section
        style={{
          ...cardStyle,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 14,
            marginBottom: 19,
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                color: 'var(--md-on-surface)',
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: '-0.02em',
              }}
            >
              Repayment overview
            </h3>

            <p
              style={{
                margin: '5px 0 0',
                color: 'var(--md-on-surface-variant)',
                fontSize: 12,
                lineHeight: 1.6,
              }}
            >
              Payments recorded against the total principal being tracked.
            </p>
          </div>

          <div
            style={{
              color: 'var(--ll-success)',
              fontSize: 23,
              fontWeight: 750,
              letterSpacing: '-0.04em',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {recoveryRate}%
          </div>
        </div>

        <div
          style={{
            height: 10,
            width: '100%',
            overflow: 'hidden',
            borderRadius: 999,
            background: 'var(--md-surface-container-high)',
            marginBottom: 21,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.min(100, Math.max(0, recoveryRate))}%`,
              borderRadius: 999,
              background: 'var(--ll-success)',
              transition: 'width 400ms ease',
            }}
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 170px), 1fr))',
            gap: 18,
          }}
        >
          <DetailMetric
            label="Payments recorded"
            value={fmtINR(totalPaid)}
            color="var(--ll-success)"
          />

          <DetailMetric
            label="Outstanding principal"
            value={fmtINR(totalOutstanding)}
          />

          <DetailMetric
            label="Total loan accounts"
            value={loans.length}
          />
        </div>
      </section>

      {/* Portfolio status and account summary */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: 16,
          marginBottom: 18,
        }}
      >
        {/* Status chart */}
        <div style={cardStyle}>
          <div style={{ marginBottom: 14 }}>
            <SectionTitle>Loan portfolio status</SectionTitle>
            <p
              style={{
                margin: '-10px 0 0',
                color: 'var(--md-on-surface-variant)',
                fontSize: 12,
                lineHeight: 1.5,
              }}
            >
              Distribution of loan accounts by current status.
            </p>
          </div>

          {statusData.length > 0 ? (
            <>
              <div
                style={{
                  width: '100%',
                  height: 235,
                  minWidth: 0,
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="48%"
                      innerRadius={57}
                      outerRadius={86}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                      stroke="none"
                    >
                      {statusData.map(item => (
                        <Cell
                          key={item.name}
                          fill={item.color}
                        />
                      ))}
                    </Pie>

                    <Tooltip {...TOOLTIP_STYLE} />

                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{
                        fontSize: 11,
                        color: 'var(--md-on-surface-variant)',
                        paddingTop: 8,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: 9,
                  marginTop: 9,
                }}
              >
                {[
                  ['Active', activeLoans.length, COLORS.active],
                  ['Completed', completedLoans.length, COLORS.completed],
                  ['Defaulted', defaultedLoans.length, COLORS.defaulted],
                  ['Pending', pendingLoans.length, COLORS.pending],
                ].map(([label, count, color]) => (
                  <div
                    key={label}
                    style={{
                      minWidth: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      padding: '10px 11px',
                      borderRadius: 9,
                      background: 'var(--md-surface-container-low)',
                      border: '1px solid var(--md-outline-variant)',
                    }}
                  >
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 7,
                        minWidth: 0,
                        color: 'var(--md-on-surface-variant)',
                        fontSize: 11,
                      }}
                    >
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          flexShrink: 0,
                          borderRadius: '50%',
                          background: color,
                        }}
                      />
                      {label}
                    </span>

                    <strong
                      style={{
                        color: 'var(--md-on-surface)',
                        fontSize: 12,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {count}
                    </strong>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ paddingTop: 15 }}>
              <EmptyState message="No loan activity yet" />
            </div>
          )}
        </div>

        {/* Account summary */}
        <div style={cardStyle}>
          <SectionTitle>Account summary</SectionTitle>

          <div>
            <SummaryRow
              label="Active accounts"
              value={activeLoans.length}
              color={COLORS.active}
            />

            <SummaryRow
              label="Completed accounts"
              value={completedLoans.length}
              color={COLORS.completed}
            />

            <SummaryRow
              label="Pending accounts"
              value={pendingLoans.length}
              color={COLORS.pending}
            />

            <SummaryRow
              label="Defaulted accounts"
              value={defaultedLoans.length}
              color={COLORS.defaulted}
              last
            />
          </div>

          <div
            style={{
              marginTop: 18,
              padding: 15,
              borderRadius: 11,
              background: 'var(--md-surface-container-low)',
              border: '1px solid var(--md-outline-variant)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 7,
                color: 'var(--md-on-surface)',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              <Activity
                size={15}
                color="var(--md-primary)"
              />
              Monitoring summary
            </div>

            <p
              style={{
                margin: 0,
                color: 'var(--md-on-surface-variant)',
                fontSize: 12,
                lineHeight: 1.65,
              }}
            >
              {loans.length
                ? `${loans.length} loan accounts are registered for monitoring across ${members.length} beneficiaries.`
                : 'Loan accounts will appear here once they are assigned to beneficiaries.'}
            </p>
          </div>
        </div>
      </section>

      {/* Recent loan accounts */}
      <section style={cardStyle}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 17,
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <FileText
                size={17}
                color="var(--md-primary)"
              />

              <h3
                style={{
                  margin: 0,
                  color: 'var(--md-on-surface)',
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                }}
              >
                Recent loan accounts
              </h3>
            </div>

            <p
              style={{
                margin: '6px 0 0',
                color: 'var(--md-on-surface-variant)',
                fontSize: 12,
                lineHeight: 1.5,
              }}
            >
              Latest records available in the NGO loan list.
            </p>
          </div>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              minHeight: 30,
              padding: '6px 10px',
              borderRadius: 8,
              background: 'var(--md-surface-container)',
              border: '1px solid var(--md-outline-variant)',
              color: 'var(--md-on-surface-variant)',
              fontSize: 11,
              fontWeight: 650,
            }}
          >
            <TrendingUp size={13} />
            {loans.length} records
          </span>
        </div>

        {recentLoans.length === 0 ? (
          <EmptyState message="No loans assigned yet" />
        ) : (
          <div
            style={{
              width: '100%',
              overflowX: 'auto',
              border: '1px solid var(--md-outline-variant)',
              borderRadius: 10,
            }}
          >
            <table
              className="data-table"
              style={{
                width: '100%',
                minWidth: 850,
              }}
            >
              <thead>
                <tr>
                  <th>Beneficiary</th>
                  <th>Principal</th>
                  <th>EMI</th>
                  <th>Payments recorded</th>
                  <th>Outstanding</th>
                  <th>Progress</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {recentLoans.map(loan => {
                  const progress = pct(
                    loan.paid_amount,
                    loan.amount
                  )

                  const remaining =
                    loan.remaining_amount != null
                      ? loan.remaining_amount
                      : Math.max(
                          0,
                          Number(loan.amount || 0) -
                            Number(loan.paid_amount || 0)
                        )

                  return (
                    <tr key={loan.id}>
                      <td
                        style={{
                          color: 'var(--md-on-surface)',
                          fontWeight: 650,
                        }}
                      >
                        {loan.ben_name || 'Unknown beneficiary'}
                      </td>

                      <td
                        className="mono"
                        style={{ color: 'var(--md-on-surface)' }}
                      >
                        {fmtINR(loan.amount)}
                      </td>

                      <td
                        className="mono"
                        style={{ color: 'var(--md-on-surface)' }}
                      >
                        {fmtINR(loan.emi)}
                      </td>

                      <td
                        className="mono"
                        style={{ color: 'var(--ll-success)' }}
                      >
                        {fmtINR(loan.paid_amount)}
                      </td>

                      <td
                        className="mono"
                        style={{ color: 'var(--md-on-surface)' }}
                      >
                        {fmtINR(remaining)}
                      </td>

                      <td style={{ minWidth: 125 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 8,
                            marginBottom: 7,
                            color: 'var(--md-on-surface-variant)',
                            fontSize: 10,
                            fontWeight: 650,
                          }}
                        >
                          <span>Repaid</span>
                          <span>{progress}%</span>
                        </div>

                        <ProgressBar
                          value={progress}
                          color="purple"
                          height={6}
                        />
                      </td>

                      <td>
                        <StatusBadge status={loan.status} />
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
