
import { useState } from 'react'
import {
  Wallet,
  CreditCard,
  CheckCircle2,
  Clock3,
  ArrowUpRight,
  Receipt,
  X,
  IndianRupee,
  TrendingUp,
} from 'lucide-react'

import { useLoans } from '../../hooks/useLoans'
import {
  StatusBadge,
  ProgressBar,
  LoadingScreen,
  EmptyState,
  Toast,
} from '../shared/UI'
import { fmtINR, pct, effectiveStatus } from '../../lib/utils'

const inputStyle = {
  width: '100%',
  minWidth: 0,
  minHeight: 43,
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid var(--md-outline-variant)',
  background: 'var(--md-surface-container-low)',
  color: 'var(--md-on-surface)',
  fontSize: 13,
  outline: 'none',
  boxSizing: 'border-box',
}

function Metric({ label, value, detail, icon: Icon, tone }) {
  const styles = {
    primary: ['var(--md-primary)', 'var(--md-primary-container)'],
    success: ['var(--ll-success)', 'var(--ll-success-container)'],
    warning: ['var(--ll-warning)', 'var(--ll-warning-container)'],
  }

  const [color, background] = styles[tone]

  return (
    <div
      style={{
        minWidth: 0,
        padding: 19,
        borderRadius: 15,
        border: '1px solid var(--md-outline-variant)',
        background: 'var(--md-surface-container)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          marginBottom: 17,
        }}
      >
        <span style={{ color: 'var(--md-on-surface-variant)', fontSize: 12, fontWeight: 600 }}>
          {label}
        </span>
        <span
          style={{
            width: 36,
            height: 36,
            borderRadius: 11,
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            color,
            background,
          }}
        >
          <Icon size={17} />
        </span>
      </div>

      <div
        style={{
          color: 'var(--md-on-surface)',
          fontSize: 24,
          fontWeight: 750,
          letterSpacing: '-0.04em',
          lineHeight: 1.2,
          overflowWrap: 'anywhere',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </div>

      <div style={{ color: 'var(--md-on-surface-variant)', fontSize: 11, marginTop: 7 }}>
        {detail}
      </div>
    </div>
  )
}

function Detail({ label, value, highlight }) {
  return (
    <div
      style={{
        minWidth: 0,
        padding: '13px 14px',
        borderRadius: 11,
        border: '1px solid var(--md-outline-variant)',
        background: 'var(--md-surface-container-low)',
      }}
    >
      <div
        style={{
          color: 'var(--md-on-surface-variant)',
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.045em',
          marginBottom: 7,
        }}
      >
        {label}
      </div>
      <div
        style={{
          color: highlight || 'var(--md-on-surface)',
          fontSize: 16,
          fontWeight: 700,
          overflowWrap: 'anywhere',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </div>
    </div>
  )
}

function LoanCard({ loan, paying, amount, setAmount, saving, onPay, onOpen, onClose }) {
  const progress = Math.min(100, Math.max(0, pct(loan.paid_amount, loan.amount)))
  const remaining = Number(loan.remaining_amount ?? 0)
  const status = effectiveStatus(loan)

  return (
    <article
      style={{
        minWidth: 0,
        padding: 21,
        borderRadius: 16,
        border: '1px solid var(--md-outline-variant)',
        background: 'var(--md-surface-container)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 15,
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, minWidth: 0 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              flexShrink: 0,
              display: 'grid',
              placeItems: 'center',
              background: 'var(--md-primary-container)',
              color: 'var(--md-on-primary-container)',
            }}
          >
            <CreditCard size={19} />
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 9,
                marginBottom: 6,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: 'var(--md-on-surface)',
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: '-0.025em',
                  overflowWrap: 'anywhere',
                }}
              >
                {loan.loan_name || 'Unnamed loan'}
              </h3>
              <StatusBadge status={status} />
            </div>

            <div style={{ color: 'var(--md-on-surface-variant)', fontSize: 12, lineHeight: 1.6 }}>
              {loan.bank_name || 'Unknown lender'}
              {' · '}
              {loan.interest_rate}% interest
              {' · '}
              {loan.tenure} months
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'var(--md-on-surface-variant)', fontSize: 10, fontWeight: 650, marginBottom: 5 }}>
            MONTHLY EMI
          </div>
          <div style={{ color: 'var(--md-primary)', fontSize: 19, fontWeight: 750, fontVariantNumeric: 'tabular-nums' }}>
            {fmtINR(loan.emi)}
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 145px), 1fr))',
          gap: 10,
          marginBottom: 20,
        }}
      >
        <Detail label="ORIGINAL PRINCIPAL" value={fmtINR(loan.amount)} />
        <Detail label="TOTAL PAID" value={fmtINR(loan.paid_amount || 0)} highlight="var(--ll-success)" />
        <Detail label="REMAINING BALANCE" value={fmtINR(remaining)} highlight="var(--md-primary)" />
      </div>

      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 10,
            marginBottom: 9,
            fontSize: 12,
          }}
        >
          <span style={{ color: 'var(--md-on-surface-variant)', fontWeight: 550 }}>
            Repayment progress
          </span>
          <strong style={{ color: 'var(--md-on-surface)', fontVariantNumeric: 'tabular-nums' }}>
            {progress}%
          </strong>
        </div>

        <ProgressBar value={progress} height={8} />
      </div>

      {paying ? (
        <div
          style={{
            padding: 16,
            borderRadius: 12,
            border: '1px solid var(--md-primary)',
            background: 'var(--md-surface-container-low)',
          }}
        >
          <div style={{ color: 'var(--md-on-surface)', fontSize: 13, fontWeight: 650, marginBottom: 5 }}>
            Record a repayment
          </div>
          <p style={{ color: 'var(--md-on-surface-variant)', fontSize: 11, margin: '0 0 13px', lineHeight: 1.5 }}>
            Enter the amount you have paid towards this loan.
          </p>

          <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 180px', minWidth: 0 }}>
              <IndianRupee
                size={15}
                color="var(--md-on-surface-variant)"
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                autoFocus
                type="number"
                min="0.01"
                max={remaining}
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !saving) onPay(loan)
                  if (e.key === 'Escape') onClose()
                }}
                placeholder="Enter payment amount"
                aria-label="Payment amount"
                style={{ ...inputStyle, paddingLeft: 35 }}
              />
            </div>

            <button
              type="button"
              onClick={() => onPay(loan)}
              disabled={saving}
              style={{
                minHeight: 43,
                padding: '0 16px',
                border: 0,
                borderRadius: 10,
                background: 'var(--md-primary)',
                color: 'var(--md-on-primary)',
                fontSize: 12,
                fontWeight: 700,
                cursor: saving ? 'wait' : 'pointer',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Recording…' : 'Confirm payment'}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              aria-label="Cancel payment"
              style={{
                width: 43,
                height: 43,
                display: 'grid',
                placeItems: 'center',
                border: '1px solid var(--md-outline-variant)',
                borderRadius: 10,
                background: 'var(--md-surface-container)',
                color: 'var(--md-on-surface-variant)',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ color: 'var(--md-on-surface-variant)', fontSize: 11, marginTop: 10 }}>
            Maximum payable amount: {fmtINR(remaining)}
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
            paddingTop: 15,
            borderTop: '1px solid var(--md-outline-variant)',
          }}
        >
          <div style={{ color: 'var(--md-on-surface-variant)', fontSize: 11 }}>
            {remaining > 0 ? 'Keep your repayment records up to date.' : 'This loan has been fully repaid.'}
          </div>

          <button
            type="button"
            onClick={() => onOpen(loan.id)}
            disabled={remaining <= 0}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              minHeight: 39,
              padding: '0 14px',
              border: 0,
              borderRadius: 9,
              background: 'var(--md-primary)',
              color: 'var(--md-on-primary)',
              fontSize: 11,
              fontWeight: 700,
              cursor: remaining <= 0 ? 'not-allowed' : 'pointer',
              opacity: remaining <= 0 ? 0.5 : 1,
            }}
          >
            <Receipt size={14} />
            Record repayment
          </button>
        </div>
      )}
    </article>
  )
}

export default function LoanManager() {
  const { loans = [], loading, recordPayment } = useLoans()

  const [paying, setPaying] = useState(null)
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  function openPayment(loanId) {
    setPaying(loanId)
    setAmount('')
  }

  function closePayment() {
    if (saving) return
    setPaying(null)
    setAmount('')
  }

  async function handlePay(loan) {
    const paymentAmount = Number(amount)
    const remaining = Number(loan.remaining_amount ?? 0)

    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      showToast('Enter a valid payment amount', 'error')
      return
    }

    if (paymentAmount > remaining) {
      showToast(`Maximum payable amount is ${fmtINR(remaining)}`, 'error')
      return
    }

    setSaving(true)

    try {
      const { error } = await recordPayment(loan.id, paymentAmount)

      if (error) {
        showToast(error, 'error')
        return
      }

      showToast(`Payment of ${fmtINR(paymentAmount)} recorded successfully`)
      setPaying(null)
      setAmount('')
    } catch (error) {
      showToast(error?.message || 'Unable to record payment', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingScreen />

  const activeLoans = loans.filter(
    loan => effectiveStatus(loan) !== 'completed'
  )

  const completedLoans = loans.filter(
    loan => effectiveStatus(loan) === 'completed'
  )

  const totalRemaining = activeLoans.reduce(
    (sum, loan) => sum + Number(loan.remaining_amount || 0),
    0
  )

  const totalPaid = loans.reduce(
    (sum, loan) => sum + Number(loan.paid_amount || 0),
    0
  )

  const totalPrincipal = loans.reduce(
    (sum, loan) => sum + Number(loan.amount || 0),
    0
  )

  return (
    <div className="anim-fade-up" style={{ width: '100%', minWidth: 0, paddingBottom: 28 }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: 15,
          marginBottom: 22,
        }}
      >
        <div>
          <div style={{ color: 'var(--md-primary)', fontSize: 11, fontWeight: 750, letterSpacing: '0.08em', marginBottom: 8 }}>
            REPAYMENT TRACKING
          </div>
          <h2 style={{ color: 'var(--md-on-surface)', fontSize: 'clamp(23px, 2.5vw, 29px)', fontWeight: 750, letterSpacing: '-0.045em', margin: 0 }}>
            Loan Manager
          </h2>
          <p style={{ color: 'var(--md-on-surface-variant)', fontSize: 13, lineHeight: 1.6, margin: '7px 0 0' }}>
            Record repayments and keep track of what you still owe.
          </p>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 11px',
            borderRadius: 9,
            border: '1px solid var(--md-outline-variant)',
            background: 'var(--md-surface-container)',
            color: 'var(--md-on-surface-variant)',
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          <TrendingUp size={14} color="var(--ll-success)" />
          {activeLoans.length} active account{activeLoans.length === 1 ? '' : 's'}
        </div>
      </header>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 205px), 1fr))',
          gap: 13,
          marginBottom: 22,
        }}
      >
        <Metric
          label="Active loans"
          value={activeLoans.length}
          detail={`${completedLoans.length} completed`}
          icon={Wallet}
          tone="primary"
        />
        <Metric
          label="Outstanding balance"
          value={fmtINR(totalRemaining)}
          detail="Remaining across active loans"
          icon={CreditCard}
          tone="warning"
        />
        <Metric
          label="Total repayments"
          value={fmtINR(totalPaid)}
          detail={`${pct(totalPaid, totalPrincipal)}% of principal`}
          icon={CheckCircle2}
          tone="success"
        />
      </section>

      {loans.length === 0 ? (
        <section
          style={{
            padding: 25,
            borderRadius: 16,
            border: '1px solid var(--md-outline-variant)',
            background: 'var(--md-surface-container)',
          }}
        >
          <EmptyState message="No loans to manage yet. Add a loan to start tracking repayments." />
        </section>
      ) : (
        <>
          {activeLoans.length > 0 && (
            <section style={{ marginBottom: 25 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  marginBottom: 13,
                }}
              >
                <div>
                  <h3 style={{ margin: 0, color: 'var(--md-on-surface)', fontSize: 16, fontWeight: 700 }}>
                    Ongoing loans
                  </h3>
                  <p style={{ margin: '5px 0 0', color: 'var(--md-on-surface-variant)', fontSize: 11 }}>
                    Select a loan to record a repayment.
                  </p>
                </div>
                <span style={{ color: 'var(--md-on-surface-variant)', fontSize: 11, fontWeight: 650 }}>
                  {activeLoans.length} account{activeLoans.length === 1 ? '' : 's'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 13 }}>
                {activeLoans.map(loan => (
                  <LoanCard
                    key={loan.id}
                    loan={loan}
                    paying={paying === loan.id}
                    amount={amount}
                    setAmount={setAmount}
                    saving={saving}
                    onPay={handlePay}
                    onOpen={openPayment}
                    onClose={closePayment}
                  />
                ))}
              </div>
            </section>
          )}

          {completedLoans.length > 0 && (
            <section
              style={{
                borderRadius: 16,
                border: '1px solid var(--md-outline-variant)',
                background: 'var(--md-surface-container)',
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: 19, borderBottom: '1px solid var(--md-outline-variant)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <CheckCircle2 size={17} color="var(--ll-success)" />
                  <h3 style={{ margin: 0, color: 'var(--md-on-surface)', fontSize: 15, fontWeight: 700 }}>
                    Completed loans
                  </h3>
                  <span style={{ color: 'var(--md-on-surface-variant)', fontSize: 11 }}>
                    ({completedLoans.length})
                  </span>
                </div>
                <p style={{ color: 'var(--md-on-surface-variant)', fontSize: 11, margin: '6px 0 0' }}>
                  Loans whose outstanding balance has been cleared.
                </p>
              </div>

              <div style={{ padding: '0 19px' }}>
                {completedLoans.map((loan, index) => (
                  <div
                    key={loan.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 12,
                      padding: '15px 0',
                      borderBottom: index !== completedLoans.length - 1
                        ? '1px solid var(--md-outline-variant)'
                        : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                      <div
                        style={{
                          width: 35,
                          height: 35,
                          borderRadius: 10,
                          display: 'grid',
                          placeItems: 'center',
                          background: 'var(--ll-success-container)',
                          color: 'var(--ll-success)',
                          flexShrink: 0,
                        }}
                      >
                        <CheckCircle2 size={16} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ color: 'var(--md-on-surface)', fontSize: 12, fontWeight: 650 }}>
                          {loan.loan_name || 'Unnamed loan'}
                        </div>
                        <div style={{ color: 'var(--md-on-surface-variant)', fontSize: 11, marginTop: 4 }}>
                          {loan.bank_name || 'Unknown lender'}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: 'var(--ll-success)', fontSize: 12, fontWeight: 700 }}>
                        Fully repaid
                      </div>
                      <div style={{ color: 'var(--md-on-surface-variant)', fontSize: 11, marginTop: 4 }}>
                        {fmtINR(loan.amount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeLoans.length === 0 && completedLoans.length === 0 && (
            <EmptyState message="There are no loans currently available to manage." />
          )}
        </>
      )}

      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
