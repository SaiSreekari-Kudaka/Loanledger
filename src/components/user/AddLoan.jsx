
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  IndianRupee,
  Percent,
  Wallet,
  X,
} from 'lucide-react'

import { useLoans } from '../../hooks/useLoans'
import { useBanks } from '../../hooks/useBanks'
import { SectionTitle, Field, Toast } from '../shared/UI'
import { loanCost, fmtINR } from '../../lib/utils'

const C = {
  surface: 'var(--md-surface-container)',
  elevated: 'var(--md-surface-container-high)',
  border: 'var(--md-outline-variant)',
  text: 'var(--md-on-surface)',
  muted: 'var(--md-on-surface-variant)',
  primary: 'var(--md-primary)',
}

const inputStyle = {
  width: '100%',
  minWidth: 0,
  minHeight: 44,
  boxSizing: 'border-box',
  padding: '11px 13px',
  borderRadius: 11,
  border: `1px solid ${C.border}`,
  background: 'var(--md-surface-container-low)',
  color: C.text,
  fontSize: 13,
  outline: 'none',
}

function SummaryMetric({ label, value, icon: Icon }) {
  return (
    <div
      style={{
        minWidth: 0,
        padding: 14,
        borderRadius: 13,
        background: C.elevated,
        border: `1px solid ${C.border}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          color: C.muted,
          fontSize: 10,
          marginBottom: 8,
        }}
      >
        <Icon size={13} />
        {label}
      </div>

      <div
        style={{
          color: C.text,
          fontSize: 15,
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

export default function AddLoan({ setPage, seed, clearSeed }) {
  const { addLoan } = useLoans()
  const { banks = [] } = useBanks()

  const [f, setF] = useState({
    loan_name: '',
    bank_name: '',
    amount: '',
    interest_rate: '',
    tenure: '',
    notes: '',
    status: 'active',
    start_date: new Date().toISOString().slice(0, 10),
  })

  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const submittingRef = useRef(false)

  const up = (key, value) => {
    setF(previous => ({ ...previous, [key]: value }))
  }

  useEffect(() => {
    if (!seed) return

    setF(previous => ({
      ...previous,
      loan_name: seed.loan_type || previous.loan_name,
      bank_name: seed.name || previous.bank_name,
      interest_rate: String(
        seed.interest_rate ?? previous.interest_rate
      ),
    }))
  }, [seed])

  const cost = useMemo(
    () => loanCost(f.amount, f.interest_rate, f.tenure),
    [f.amount, f.interest_rate, f.tenure]
  )

  const emi = Number(cost?.emi) || 0

  const validAmount =
    f.amount !== '' &&
    Number.isFinite(Number(f.amount)) &&
    Number(f.amount) > 0

  const validRate =
    f.interest_rate !== '' &&
    Number.isFinite(Number(f.interest_rate)) &&
    Number(f.interest_rate) >= 0

  const validTenure =
    f.tenure !== '' &&
    Number.isFinite(Number(f.tenure)) &&
    Number(f.tenure) > 0

  const canSubmit =
    f.loan_name.trim() &&
    validAmount &&
    validRate &&
    validTenure &&
    f.start_date &&
    !loading

  async function handleAdd(event) {
    event?.preventDefault()

    if (submittingRef.current || loading) return

    if (!f.loan_name.trim()) {
      setToast({ msg: 'Loan name is required.', type: 'error' })
      return
    }

    if (!validAmount) {
      setToast({ msg: 'Enter a valid loan amount.', type: 'error' })
      return
    }

    if (!validRate) {
      setToast({ msg: 'Enter a valid interest rate.', type: 'error' })
      return
    }

    if (!validTenure) {
      setToast({ msg: 'Enter a valid tenure in months.', type: 'error' })
      return
    }

    if (!f.start_date) {
      setToast({ msg: 'Select the loan start date.', type: 'error' })
      return
    }

    submittingRef.current = true
    setLoading(true)

    try {
      const payload = {
        ...f,
        loan_name: f.loan_name.trim(),
        bank_name: f.bank_name.trim(),
        amount: Number(f.amount),
        interest_rate: Number(f.interest_rate),
        tenure: Number(f.tenure),
        emi,
      }

      const result = await addLoan(payload)

      if (result?.error) {
        setToast({
          msg:
            typeof result.error === 'string'
              ? result.error
              : result.error.message || 'Could not add this loan.',
          type: 'error',
        })
        return
      }

      if (clearSeed) clearSeed()

      setToast({
        msg: 'Loan added successfully!',
        type: 'success',
      })

      setTimeout(() => {
        setPage('logbook')
      }, 1000)
    } catch (error) {
      console.error('Add loan error:', error)
      setToast({
        msg: error?.message || 'Something went wrong while adding the loan.',
        type: 'error',
      })
    } finally {
      submittingRef.current = false
      setLoading(false)
    }
  }

  function handleBankChange(event) {
    const selectedName = event.target.value
    const selectedBank = banks.find(
      bank => bank.name === selectedName
    )

    setF(previous => ({
      ...previous,
      bank_name: selectedName,
      ...(selectedBank
        ? { interest_rate: String(selectedBank.interest_rate) }
        : {}),
    }))
  }

  return (
    <div
      className="anim-fade-up"
      style={{
        width: '100%',
        maxWidth: 850,
        margin: '0 auto',
        display: 'grid',
        gap: 19,
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 13,
        }}
      >
        <div>
          <SectionTitle>Add a new loan</SectionTitle>
          <p
            style={{
              color: C.muted,
              fontSize: 13,
              lineHeight: 1.6,
              margin: '5px 0 0',
            }}
          >
            Add your loan details to keep track of repayments and outstanding balances.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setPage('logbook')}
          disabled={loading}
        >
          <ArrowLeft size={14} />
          Back to logbook
        </button>
      </div>

      {/* CATALOGUE PREFILL */}
      {seed && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            padding: 16,
            borderRadius: 17,
            background: 'var(--md-primary-container)',
            border: '1px solid var(--md-primary)',
            color: 'var(--md-on-primary-container)',
          }}
        >
          <div
            style={{
              width: 39,
              height: 39,
              flexShrink: 0,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 12,
              background: 'rgba(127,127,127,0.15)',
            }}
          >
            <Building2 size={19} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>
              Loan selected from bank catalogue
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.6, marginTop: 4 }}>
              {seed.name || 'Selected bank'} · {seed.loan_type || 'Loan'} ·
              {' '}{seed.interest_rate}% interest rate prefilled.
              Review the details before saving.
            </div>
          </div>

          {clearSeed && (
            <button
              type="button"
              onClick={clearSeed}
              aria-label="Clear selected bank product"
              title="Clear selected bank product"
              style={{
                width: 30,
                height: 30,
                flexShrink: 0,
                display: 'grid',
                placeItems: 'center',
                border: 0,
                borderRadius: 9,
                background: 'rgba(127,127,127,0.15)',
                color: 'inherit',
                cursor: 'pointer',
              }}
            >
              <X size={15} />
            </button>
          )}
        </div>
      )}

      {/* FORM */}
      <form
        onSubmit={handleAdd}
        style={{
          padding: 'clamp(17px, 3vw, 26px)',
          borderRadius: 21,
          background: C.surface,
          border: `1px solid ${C.border}`,
          display: 'grid',
          gap: 20,
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              marginBottom: 5,
            }}
          >
            <ClipboardList size={17} color={C.primary} />
            <h3
              style={{
                color: C.text,
                fontSize: 15,
                fontWeight: 700,
                margin: 0,
              }}
            >
              Loan information
            </h3>
          </div>

          <p
            style={{
              color: C.muted,
              fontSize: 11,
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Enter the details exactly as provided by your lender.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 230px), 1fr))',
            columnGap: 17,
            rowGap: 2,
          }}
        >
          <Field label="LOAN NAME">
            <input
              style={inputStyle}
              value={f.loan_name}
              onChange={event => up('loan_name', event.target.value)}
              placeholder="e.g. Home renovation"
              maxLength={100}
              required
            />
          </Field>

          <Field label="BANK OR LENDER">
            <select
              style={inputStyle}
              value={f.bank_name}
              onChange={handleBankChange}
            >
              <option value="">Select a bank</option>
              {banks.map(bank => (
                <option key={bank.id} value={bank.name}>
                  {bank.name} ({bank.interest_rate}%)
                </option>
              ))}
              <option value="Other">Other lender</option>
            </select>
          </Field>

          <Field label="LOAN AMOUNT (₹)">
            <input
              style={inputStyle}
              type="number"
              min="1"
              step="1"
              value={f.amount}
              onChange={event => up('amount', event.target.value)}
              placeholder="500000"
              required
            />
          </Field>

          <Field label="ANNUAL INTEREST RATE (%)">
            <input
              style={inputStyle}
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={f.interest_rate}
              onChange={event => up('interest_rate', event.target.value)}
              placeholder="9.5"
              required
            />
          </Field>

          <Field label="TENURE (MONTHS)">
            <input
              style={inputStyle}
              type="number"
              min="1"
              max="600"
              step="1"
              value={f.tenure}
              onChange={event => up('tenure', event.target.value)}
              placeholder="36"
              required
            />
          </Field>

          <Field label="LOAN STATUS">
            <select
              style={inputStyle}
              value={f.status}
              onChange={event => up('status', event.target.value)}
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
            </select>
          </Field>

          <Field label="LOAN START DATE">
            <div style={{ position: 'relative' }}>
              <CalendarDays
                size={15}
                style={{
                  position: 'absolute',
                  left: 13,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: C.muted,
                  pointerEvents: 'none',
                }}
              />
              <input
                style={{ ...inputStyle, paddingLeft: 38 }}
                type="date"
                value={f.start_date}
                onChange={event => up('start_date', event.target.value)}
                required
              />
            </div>
          </Field>

          <Field label="NOTES (OPTIONAL)">
            <input
              style={inputStyle}
              value={f.notes}
              onChange={event => up('notes', event.target.value)}
              placeholder="Additional details..."
              maxLength={500}
            />
          </Field>
        </div>

        {/* EMI PREVIEW */}
        <div
          style={{
            padding: 18,
            borderRadius: 17,
            background: C.elevated,
            border: `1px solid ${C.border}`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: C.muted,
              fontSize: 11,
              fontWeight: 650,
              marginBottom: 12,
            }}
          >
            <CalculatorIcon />
            LIVE REPAYMENT ESTIMATE
          </div>

          {emi > 0 ? (
            <>
              <div
                style={{
                  color: C.primary,
                  fontSize: 'clamp(27px, 5vw, 36px)',
                  fontWeight: 750,
                  letterSpacing: '-0.04em',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {fmtINR(emi)}
                <span
                  style={{
                    color: C.muted,
                    fontSize: 13,
                    fontWeight: 500,
                    letterSpacing: 0,
                    marginLeft: 7,
                  }}
                >
                  / month
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
                  gap: 9,
                  marginTop: 17,
                }}
              >
                <SummaryMetric
                  label="Principal"
                  value={fmtINR(cost.principal)}
                  icon={Wallet}
                />
                <SummaryMetric
                  label="Total interest"
                  value={fmtINR(cost.interest)}
                  icon={Percent}
                />
                <SummaryMetric
                  label="Total repayment"
                  value={fmtINR(cost.totalPaid)}
                  icon={IndianRupee}
                />
              </div>

              <p
                style={{
                  color: C.muted,
                  fontSize: 10,
                  lineHeight: 1.6,
                  margin: '13px 0 0',
                }}
              >
                This is an estimate based on the entered amount, annual rate
                and tenure. Actual repayment may differ due to lender terms,
                fees or rate changes.
              </p>
            </>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                color: C.muted,
                fontSize: 12,
                lineHeight: 1.6,
              }}
            >
              <IndianRupee size={18} />
              Enter a valid amount, interest rate and tenure to see your estimated EMI.
            </div>
          )}
        </div>

        {/* SUBMIT */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            flexWrap: 'wrap',
            gap: 10,
            paddingTop: 3,
          }}
        >
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setPage('logbook')}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn btn-cyan"
            disabled={!canSubmit}
            style={{
              minWidth: 165,
              justifyContent: 'center',
              opacity: canSubmit ? 1 : 0.55,
            }}
          >
            {loading ? (
              'Saving loan...'
            ) : (
              <>
                Add loan to ledger
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>
      </form>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 9,
          padding: '13px 15px',
          borderRadius: 14,
          background: C.surface,
          border: `1px solid ${C.border}`,
          color: C.muted,
          fontSize: 11,
          lineHeight: 1.6,
        }}
      >
        <CheckCircle2
          size={15}
          color={C.primary}
          style={{ flexShrink: 0, marginTop: 1 }}
        />
        Your loan details are added to your personal ledger. You can update
        repayment information later from the Logbook.
      </div>

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

function CalculatorIcon() {
  return <IndianRupee size={15} />
}
