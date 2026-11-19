
import { useMemo, useState } from 'react'
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Wallet,
  CheckCircle2,
  Clock3,
  AlertCircle,
  SlidersHorizontal,
  X,
  CalendarDays,
  Building2,
  Percent,
  ArrowUpRight,
} from 'lucide-react'

import { useLoans } from '../../hooks/useLoans'
import { useBanks } from '../../hooks/useBanks'

import {
  Modal,
  Field,
  StatusBadge,
  ProgressBar,
  LoadingScreen,
  EmptyState,
  ConfirmDialog,
  Toast,
} from '../shared/UI'

import {
  fmtINR,
  pct,
  calcEMI,
  effectiveStatus,
} from '../../lib/utils'

const FILTERS = [
  { key: 'all', label: 'All loans', icon: Wallet },
  { key: 'active', label: 'Active', icon: Clock3 },
  { key: 'completed', label: 'Completed', icon: CheckCircle2 },
  { key: 'defaulted', label: 'Overdue', icon: AlertCircle },
  { key: 'pending', label: 'Pending', icon: CalendarDays },
]

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

function MetricCard({ label, value, detail, icon: Icon, tone }) {
  const tones = {
    primary: ['var(--md-primary)', 'var(--md-primary-container)'],
    success: ['var(--ll-success)', 'var(--ll-success-container)'],
    warning: ['var(--ll-warning)', 'var(--ll-warning-container)'],
    danger: ['var(--ll-error)', 'var(--ll-error-container)'],
  }

  const [color, background] = tones[tone]

  return (
    <div
      style={{
        minWidth: 0,
        padding: 19,
        borderRadius: 15,
        border: '1px solid var(--md-outline-variant)',
        background: 'var(--md-surface-container)',
        display: 'flex',
        flexDirection: 'column',
        gap: 17,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
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

      <div>
        <div
          style={{
            color: 'var(--md-on-surface)',
            fontSize: 24,
            lineHeight: 1.2,
            letterSpacing: '-0.04em',
            fontWeight: 750,
            overflowWrap: 'anywhere',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}
        </div>
        <div style={{ color: 'var(--md-on-surface-variant)', fontSize: 11, marginTop: 6 }}>
          {detail}
        </div>
      </div>
    </div>
  )
}

function LoanForm({ initial = {}, banks, onSave, onCancel, loading }) {
  const [f, setF] = useState({
    loan_name: '',
    bank_name: '',
    amount: '',
    interest_rate: '',
    tenure: '',
    emi: '',
    paid_amount: '',
    notes: '',
    status: 'active',
    start_date: new Date().toISOString().slice(0, 10),
    ...initial,
  })

  const up = (key, value) => {
    setF(previous => ({ ...previous, [key]: value }))
  }

  const autoEMI = () => {
    const value = calcEMI(
      Number(f.amount),
      Number(f.interest_rate),
      Number(f.tenure)
    )
    up('emi', value)
  }

  const remaining = Math.max(
    0,
    Number(f.amount || 0) - Number(f.paid_amount || 0)
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div
        style={{
          padding: 14,
          borderRadius: 11,
          background: 'var(--md-surface-container-low)',
          border: '1px solid var(--md-outline-variant)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
        }}
      >
        <Wallet size={17} color="var(--md-primary)" style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ color: 'var(--md-on-surface-variant)', fontSize: 12, lineHeight: 1.6 }}>
          Keep your loan details accurate so your repayment progress and outstanding balance remain useful.
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 15,
        }}
      >
        <Field label="LOAN NAME">
          <input
            style={inputStyle}
            value={f.loan_name}
            onChange={e => up('loan_name', e.target.value)}
            placeholder="e.g. Home Loan"
          />
        </Field>

        <Field label="BANK / LENDER">
          <select
            style={inputStyle}
            value={f.bank_name}
            onChange={e => up('bank_name', e.target.value)}
          >
            <option value="">Select lender</option>
            {banks.map(bank => (
              <option key={bank.id} value={bank.name}>{bank.name}</option>
            ))}
            <option value="Other">Other</option>
          </select>
        </Field>

        <Field label="LOAN AMOUNT (₹)">
          <input
            style={inputStyle}
            type="number"
            min="0"
            value={f.amount}
            onChange={e => up('amount', e.target.value)}
            placeholder="500000"
          />
        </Field>

        <Field label="INTEREST RATE (%)">
          <input
            style={inputStyle}
            type="number"
            min="0"
            step="0.1"
            value={f.interest_rate}
            onChange={e => up('interest_rate', e.target.value)}
            placeholder="9.5"
          />
        </Field>

        <Field label="TENURE (MONTHS)">
          <input
            style={inputStyle}
            type="number"
            min="1"
            value={f.tenure}
            onChange={e => up('tenure', e.target.value)}
            placeholder="36"
          />
        </Field>

        <Field label="MONTHLY EMI (₹)">
          <div style={{ display: 'flex', gap: 7 }}>
            <input
              style={inputStyle}
              type="number"
              min="0"
              value={f.emi}
              onChange={e => up('emi', e.target.value)}
              placeholder="Enter EMI"
            />
            <button
              type="button"
              onClick={autoEMI}
              style={{
                flexShrink: 0,
                padding: '0 12px',
                borderRadius: 10,
                border: '1px solid var(--md-outline-variant)',
                background: 'var(--md-surface-container-high)',
                color: 'var(--md-primary)',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Auto
            </button>
          </div>
        </Field>

        <Field label="AMOUNT ALREADY PAID (₹)">
          <input
            style={inputStyle}
            type="number"
            min="0"
            value={f.paid_amount}
            onChange={e => up('paid_amount', e.target.value)}
            placeholder="0"
          />
        </Field>

        <Field label="LOAN STATUS">
          <select
            style={inputStyle}
            value={f.status}
            onChange={e => up('status', e.target.value)}
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="defaulted">Defaulted</option>
            <option value="pending">Pending</option>
          </select>
        </Field>

        <Field label="START DATE">
          <input
            style={inputStyle}
            type="date"
            value={f.start_date}
            onChange={e => up('start_date', e.target.value)}
          />
        </Field>

        <Field label="NOTES">
          <input
            style={inputStyle}
            value={f.notes}
            onChange={e => up('notes', e.target.value)}
            placeholder="Optional notes"
          />
        </Field>
      </div>

      <div
        style={{
          padding: 15,
          borderRadius: 11,
          background: 'var(--md-primary-container)',
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: 'var(--md-on-primary-container)' }}>
            Estimated outstanding amount
          </div>
          <div style={{ fontSize: 19, fontWeight: 750, color: 'var(--md-on-primary-container)', marginTop: 4 }}>
            {fmtINR(remaining)}
          </div>
        </div>
        <div style={{ alignSelf: 'center', fontSize: 11, color: 'var(--md-on-primary-container)' }}>
          Amount − amount paid
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 9, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          style={{
            minHeight: 40,
            padding: '0 16px',
            borderRadius: 10,
            border: '1px solid var(--md-outline-variant)',
            background: 'transparent',
            color: 'var(--md-on-surface)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onSave(f)}
          disabled={loading}
          style={{
            minHeight: 40,
            padding: '0 18px',
            borderRadius: 10,
            border: 'none',
            background: 'var(--md-primary)',
            color: 'var(--md-on-primary)',
            fontWeight: 650,
            cursor: loading ? 'wait' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Saving…' : 'Save loan'}
        </button>
      </div>
    </div>
  )
}

export default function LoanLogbook() {
  const { loans, loading, addLoan, updateLoan, deleteLoan } = useLoans()
  const { banks } = useBanks()

  const [modal, setModal] = useState(null)
  const [delId, setDelId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleSave(form) {
    if (!form.loan_name.trim()) {
      showToast('Please enter a loan name', 'error')
      return
    }

    if (!Number(form.amount) || Number(form.amount) <= 0) {
      showToast('Enter a valid loan amount', 'error')
      return
    }

    setSaving(true)

    try {
      const remaining = Math.max(
        0,
        Number(form.amount) - Number(form.paid_amount || 0)
      )

      const payload = {
        ...form,
        remaining_amount: remaining,
      }

      let err

      if (modal === 'add') {
        const result = await addLoan(payload)
        err = result?.error
      } else {
        const result = await updateLoan(modal.id, payload)
        err = result?.error
      }

      if (err) {
        showToast(err, 'error')
        return
      }

      showToast(modal === 'add' ? 'Loan added successfully' : 'Loan updated successfully')
      setModal(null)
    } catch (error) {
      showToast(error?.message || 'Unable to save loan', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    try {
      const { error } = await deleteLoan(delId)
      setDelId(null)

      if (error) {
        showToast(error, 'error')
        return
      }

      showToast('Loan deleted successfully')
    } catch (error) {
      showToast(error?.message || 'Unable to delete loan', 'error')
    }
  }

  const safeLoans = loans || []

  const statusCounts = useMemo(() => {
    const counts = { all: safeLoans.length }

    FILTERS.slice(1).forEach(filter => {
      counts[filter.key] = safeLoans.filter(
        loan => effectiveStatus(loan) === filter.key
      ).length
    })

    return counts
  }, [safeLoans])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()

    return safeLoans.filter(loan => {
      const matchesSearch =
        (loan.loan_name || '').toLowerCase().includes(query) ||
        (loan.bank_name || '').toLowerCase().includes(query)

      const matchesStatus =
        status === 'all' || effectiveStatus(loan) === status

      return matchesSearch && matchesStatus
    })
  }, [safeLoans, search, status])

  const totalPrincipal = safeLoans.reduce(
    (sum, loan) => sum + Number(loan.amount || 0), 0
  )

  const totalPaid = safeLoans.reduce(
    (sum, loan) => sum + Number(loan.paid_amount || 0), 0
  )

  const totalOutstanding = Math.max(0, totalPrincipal - totalPaid)

  if (loading) return <LoadingScreen />

  return (
    <div className="anim-fade-up" style={{ width: '100%', minWidth: 0, paddingBottom: 28 }}>
      {/* Heading */}
      <header
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 22,
        }}
      >
        <div>
          <div style={{ color: 'var(--md-primary)', fontSize: 11, fontWeight: 750, letterSpacing: '0.08em', marginBottom: 8 }}>
            PERSONAL FINANCE
          </div>
          <h2 style={{ margin: 0, color: 'var(--md-on-surface)', fontSize: 'clamp(23px, 2.5vw, 29px)', fontWeight: 750, letterSpacing: '-0.045em' }}>
            Loan Logbook
          </h2>
          <p style={{ margin: '7px 0 0', color: 'var(--md-on-surface-variant)', fontSize: 13, lineHeight: 1.6 }}>
            Keep your loan details, repayment progress and outstanding balances organized.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModal('add')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            minHeight: 42,
            padding: '0 16px',
            borderRadius: 10,
            border: 'none',
            background: 'var(--md-primary)',
            color: 'var(--md-on-primary)',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: 'var(--ll-shadow-card)',
          }}
        >
          <Plus size={16} />
          Add loan
        </button>
      </header>

      {/* Summary metrics */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 205px), 1fr))',
          gap: 13,
          marginBottom: 19,
        }}
      >
        <MetricCard
          label="Total loan principal"
          value={fmtINR(totalPrincipal)}
          detail={`${safeLoans.length} loan accounts`}
          icon={Wallet}
          tone="primary"
        />
        <MetricCard
          label="Total amount paid"
          value={fmtINR(totalPaid)}
          detail={`${pct(totalPaid, totalPrincipal)}% of principal`}
          icon={CheckCircle2}
          tone="success"
        />
        <MetricCard
          label="Outstanding amount"
          value={fmtINR(totalOutstanding)}
          detail="Remaining principal balance"
          icon={ArrowUpRight}
          tone="warning"
        />
        <MetricCard
          label="Active loans"
          value={statusCounts.active || 0}
          detail={`${statusCounts.completed || 0} completed loans`}
          icon={Clock3}
          tone="primary"
        />
      </section>

      {/* Main logbook */}
      <section
        style={{
          minWidth: 0,
          borderRadius: 16,
          border: '1px solid var(--md-outline-variant)',
          background: 'var(--md-surface-container)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: 21, borderBottom: '1px solid var(--md-outline-variant)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ margin: 0, color: 'var(--md-on-surface)', fontSize: 16, fontWeight: 700 }}>
                Your loan records
              </h3>
              <p style={{ margin: '5px 0 0', color: 'var(--md-on-surface-variant)', fontSize: 12 }}>
                Search, filter, edit or remove your loan entries.
              </p>
            </div>
            <span style={{ padding: '6px 10px', borderRadius: 8, background: 'var(--md-surface-container-high)', color: 'var(--md-on-surface-variant)', fontSize: 11, fontWeight: 650 }}>
              {filtered.length} of {safeLoans.length} records
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginTop: 19,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 0 }}>
              <Search
                size={16}
                color="var(--md-on-surface-variant)"
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
              <input
                style={{ ...inputStyle, paddingLeft: 38, paddingRight: search ? 36 : 12 }}
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by loan name or bank..."
                aria-label="Search loans"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                  style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', border: 0, background: 'transparent', color: 'var(--md-on-surface-variant)', cursor: 'pointer', padding: 4 }}
                >
                  <X size={15} />
                </button>
              )}
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: 'var(--md-on-surface-variant)', fontSize: 11 }}>
              <SlidersHorizontal size={15} />
              Filter by status
            </div>
          </div>

          {/* Status filters */}
          <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingTop: 14, paddingBottom: 2 }}>
            {FILTERS.map(filter => {
              const active = status === filter.key
              const Icon = filter.icon

              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setStatus(filter.key)}
                  aria-pressed={active}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    flexShrink: 0,
                    minHeight: 35,
                    padding: '0 11px',
                    borderRadius: 9,
                    border: `1px solid ${active ? 'var(--md-primary)' : 'var(--md-outline-variant)'}`,
                    background: active ? 'var(--md-primary-container)' : 'var(--md-surface-container-low)',
                    color: active ? 'var(--md-on-primary-container)' : 'var(--md-on-surface-variant)',
                    fontSize: 11,
                    fontWeight: active ? 700 : 550,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Icon size={13} />
                  {filter.label}
                  <span style={{ fontVariantNumeric: 'tabular-nums', opacity: 0.8 }}>
                    {statusCounts[filter.key] || 0}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Loan table */}
        {filtered.length === 0 ? (
          <div style={{ padding: '38px 20px', textAlign: 'center' }}>
            <EmptyState
              message={
                search
                  ? 'No loans match your search.'
                  : status !== 'all'
                    ? `No ${status} loans found.`
                    : 'You have not added any loans yet.'
              }
            />
            {safeLoans.length === 0 && (
              <button
                type="button"
                onClick={() => setModal('add')}
                style={{
                  marginTop: 12,
                  padding: '10px 15px',
                  borderRadius: 9,
                  border: 0,
                  background: 'var(--md-primary)',
                  color: 'var(--md-on-primary)',
                  fontSize: 12,
                  fontWeight: 650,
                  cursor: 'pointer',
                }}
              >
                <Plus size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                Add your first loan
              </button>
            )}
          </div>
        ) : (
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', minWidth: 950 }}>
              <thead>
                <tr>
                  <th>LOAN DETAILS</th>
                  <th>PRINCIPAL</th>
                  <th>INTEREST</th>
                  <th>TENURE</th>
                  <th>MONTHLY EMI</th>
                  <th>REPAYMENT</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(loan => {
                  const progress = Math.min(
                    100,
                    Math.max(0, pct(loan.paid_amount, loan.amount))
                  )

                  return (
                    <tr key={loan.id}>
                      <td style={{ minWidth: 165 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span
                            style={{
                              width: 34,
                              height: 34,
                              display: 'grid',
                              placeItems: 'center',
                              flexShrink: 0,
                              borderRadius: 10,
                              background: 'var(--md-surface-container-high)',
                              color: 'var(--md-primary)',
                            }}
                          >
                            <Building2 size={16} />
                          </span>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ color: 'var(--md-on-surface)', fontSize: 12, fontWeight: 650 }}>
                              {loan.loan_name || 'Unnamed loan'}
                            </div>
                            <div style={{ color: 'var(--md-on-surface-variant)', fontSize: 11, marginTop: 4 }}>
                              {loan.bank_name || 'Lender not specified'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="mono">{fmtINR(loan.amount)}</td>

                      <td className="mono">
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                          {loan.interest_rate}
                          <Percent size={11} />
                        </span>
                      </td>

                      <td className="mono">{loan.tenure} mo</td>

                      <td className="mono">{fmtINR(loan.emi)}</td>

                      <td style={{ minWidth: 145 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 7, fontSize: 10 }}>
                          <span style={{ color: 'var(--md-on-surface-variant)' }}>
                            {fmtINR(loan.paid_amount || 0)} paid
                          </span>
                          <strong style={{ color: 'var(--md-on-surface)' }}>{progress}%</strong>
                        </div>
                        <ProgressBar value={progress} />
                      </td>

                      <td>
                        <StatusBadge status={effectiveStatus(loan)} />
                      </td>

                      <td>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => setModal(loan)}
                            title="Edit loan"
                            aria-label={`Edit ${loan.loan_name || 'loan'}`}
                            style={{
                              width: 32,
                              height: 32,
                              display: 'grid',
                              placeItems: 'center',
                              borderRadius: 8,
                              border: '1px solid var(--md-outline-variant)',
                              background: 'var(--md-surface-container-low)',
                              color: 'var(--md-on-surface-variant)',
                              cursor: 'pointer',
                            }}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDelId(loan.id)}
                            title="Delete loan"
                            aria-label={`Delete ${loan.loan_name || 'loan'}`}
                            style={{
                              width: 32,
                              height: 32,
                              display: 'grid',
                              placeItems: 'center',
                              borderRadius: 8,
                              border: '1px solid var(--md-outline-variant)',
                              background: 'var(--md-surface-container-low)',
                              color: 'var(--ll-error)',
                              cursor: 'pointer',
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Add / edit */}
      <Modal
        open={!!modal}
        onClose={() => !saving && setModal(null)}
        title={modal === 'add' ? 'Add a loan' : 'Edit loan details'}
      >
        <LoanForm
          initial={modal !== 'add' ? modal : {}}
          banks={banks || []}
          onSave={handleSave}
          onCancel={() => setModal(null)}
          loading={saving}
        />
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!delId}
        title="Delete loan"
        message="This will permanently delete this loan and its related payment history. This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDelId(null)}
      />

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
