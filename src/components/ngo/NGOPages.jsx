
import { useMemo, useState } from 'react'
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Phone,
  Users,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  Download,
  UserRound,
  Building2,
  X,
  Check,
  TrendingUp,
  Activity,
} from 'lucide-react'

import { useNGO } from '../../hooks/useNGO'
import { useBanks } from '../../hooks/useBanks'

import {
  SectionTitle,
  Modal,
  Field,
  StatusBadge,
  ProgressBar,
  LoadingScreen,
  EmptyState,
  ConfirmDialog,
  Toast,
  MetricCard,
} from '../shared/UI'

import { fmtINR, pct, calcEMI } from '../../lib/utils'

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

/* -------------------------------------------------------------------------- */
/* SHARED DESIGN HELPERS                                                      */
/* -------------------------------------------------------------------------- */

const COLORS = {
  active: 'var(--chart-1)',
  completed: 'var(--chart-3)',
  defaulted: 'var(--ll-error)',
  pending: 'var(--chart-2)',
  paid: 'var(--ll-success)',
  outstanding: 'var(--ll-warning)',
}

const panelStyle = {
  minWidth: 0,
  padding: 21,
  background: 'var(--md-surface)',
  border: '1px solid var(--md-outline-variant)',
  borderRadius: 14,
  boxShadow: 'var(--ll-shadow-card)',
}

const tooltipStyle = {
  contentStyle: {
    background: 'var(--md-surface)',
    color: 'var(--md-on-surface)',
    border: '1px solid var(--md-outline-variant)',
    borderRadius: 10,
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

function PageIntro({ eyebrow, title, description, action }) {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 23,
      }}
    >
      <div style={{ minWidth: 0 }}>
        {eyebrow && (
          <div
            style={{
              marginBottom: 7,
              color: 'var(--md-primary)',
              fontSize: 10,
              fontWeight: 750,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {eyebrow}
          </div>
        )}

        <h2
          style={{
            margin: 0,
            color: 'var(--md-on-surface)',
            fontSize: 'clamp(22px, 2.4vw, 28px)',
            fontWeight: 750,
            letterSpacing: '-0.045em',
            lineHeight: 1.25,
          }}
        >
          {title}
        </h2>

        {description && (
          <p
            style={{
              margin: '7px 0 0',
              maxWidth: 580,
              color: 'var(--md-on-surface-variant)',
              fontSize: 13,
              lineHeight: 1.65,
            }}
          >
            {description}
          </p>
        )}
      </div>

      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </header>
  )
}

function ActionButton({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  type = 'button',
  style = {},
}) {
  const isPrimary = variant === 'primary'
  const isDanger = variant === 'danger'

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        minHeight: 39,
        padding: '9px 14px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: 9,
        border: isPrimary
          ? '1px solid var(--md-primary)'
          : isDanger
            ? '1px solid var(--ll-error)'
            : '1px solid var(--md-outline-variant)',
        background: isPrimary
          ? 'var(--md-primary)'
          : isDanger
            ? 'var(--ll-error-container)'
            : 'var(--md-surface-container)',
        color: isPrimary
          ? 'var(--md-on-primary)'
          : isDanger
            ? 'var(--ll-error)'
            : 'var(--md-on-surface)',
        fontSize: 12,
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        transition: 'background 160ms ease, border-color 160ms ease',
        ...style,
      }}
    >
      {children}
    </button>
  )
}

function IconButton({ icon: Icon, label, onClick, danger = false }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      style={{
        width: 34,
        height: 34,
        flexShrink: 0,
        display: 'grid',
        placeItems: 'center',
        borderRadius: 9,
        border: '1px solid var(--md-outline-variant)',
        background: 'var(--md-surface-container)',
        color: danger ? 'var(--ll-error)' : 'var(--md-on-surface-variant)',
        cursor: 'pointer',
      }}
    >
      <Icon size={15} />
    </button>
  )
}

function SearchInput({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div
      style={{
        minWidth: 0,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '0 12px',
        minHeight: 41,
        border: '1px solid var(--md-outline-variant)',
        borderRadius: 9,
        background: 'var(--md-surface-container-low)',
      }}
    >
      <Search
        size={16}
        color="var(--md-on-surface-variant)"
        style={{ flexShrink: 0 }}
      />

      <input
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        style={{
          width: '100%',
          minWidth: 0,
          padding: 0,
          border: 0,
          outline: 0,
          boxShadow: 'none',
          background: 'transparent',
          color: 'var(--md-on-surface)',
          fontSize: 13,
        }}
      />
    </div>
  )
}

function FormActions({ onCancel, onSave, saving, saveLabel }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        flexWrap: 'wrap',
        gap: 9,
        paddingTop: 15,
        marginTop: 8,
        borderTop: '1px solid var(--md-outline-variant)',
      }}
    >
      <ActionButton variant="secondary" onClick={onCancel} disabled={saving}>
        Cancel
      </ActionButton>

      <ActionButton onClick={onSave} disabled={saving}>
        {saving ? 'Saving...' : saveLabel}
      </ActionButton>
    </div>
  )
}

function TableShell({ children, minWidth = 760 }) {
  return (
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
          minWidth,
        }}
      >
        {children}
      </table>
    </div>
  )
}

function usePageToast() {
  const [toast, setToast] = useState(null)

  function showToast(message, type = 'success') {
    setToast({ message, type })
    window.setTimeout(() => setToast(null), 3000)
  }

  return { toast, setToast, showToast }
}

/* -------------------------------------------------------------------------- */
/* BENEFICIARIES                                                              */
/* -------------------------------------------------------------------------- */

export function Beneficiaries() {
  const {
    beneficiaries,
    ngoLoans,
    loading,
    addBeneficiary,
    updateBeneficiary,
    deleteBeneficiary,
  } = useNGO()

  const [modal, setModal] = useState(null)
  const [delId, setDelId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const { toast, setToast, showToast } = usePageToast()

  const blank = {
    name: '',
    contact: '',
    address: '',
    income: '',
    notes: '',
  }

  const [form, setForm] = useState(blank)

  const updateField = (key, value) => {
    setForm(previous => ({ ...previous, [key]: value }))
  }

  function openAdd() {
    setForm(blank)
    setModal('add')
  }

  function openEdit(beneficiary) {
    setForm({
      name: beneficiary.name || '',
      contact: beneficiary.contact || '',
      address: beneficiary.address || '',
      income: beneficiary.income ?? '',
      notes: beneficiary.notes || '',
    })

    setModal(beneficiary)
  }

  async function handleSave(event) {
    event?.preventDefault()

    if (!form.name.trim()) {
      showToast('Please enter the beneficiary name.', 'error')
      return
    }

    setSaving(true)

    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        income: Number(form.income) || 0,
      }

      const result =
        modal === 'add'
          ? await addBeneficiary(payload)
          : await updateBeneficiary(modal.id, payload)

      if (result?.error) {
        showToast(result.error.message || 'Unable to save beneficiary.', 'error')
        return
      }

      showToast(
        modal === 'add'
          ? 'Beneficiary added successfully.'
          : 'Beneficiary updated successfully.'
      )

      setModal(null)
      setForm(blank)
    } catch (error) {
      showToast(error.message || 'Something went wrong.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    try {
      const { error } = await deleteBeneficiary(delId)

      if (error) {
        showToast(error.message || 'Unable to remove beneficiary.', 'error')
      } else {
        showToast('Beneficiary removed successfully.')
      }
    } catch (error) {
      showToast(error.message || 'Unable to remove beneficiary.', 'error')
    } finally {
      setDelId(null)
    }
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()

    return (beneficiaries || []).filter(beneficiary => {
      const name = String(beneficiary.name || '').toLowerCase()
      const contact = String(beneficiary.contact || '').toLowerCase()
      const address = String(beneficiary.address || '').toLowerCase()

      return (
        !query ||
        name.includes(query) ||
        contact.includes(query) ||
        address.includes(query)
      )
    })
  }, [beneficiaries, search])

  if (loading) return <LoadingScreen />

  return (
    <div className="anim-fade-up" style={{ minWidth: 0, paddingBottom: 25 }}>
      <PageIntro
        eyebrow="People and records"
        title="Beneficiaries"
        description="Maintain beneficiary details and keep track of the loan accounts associated with each person."
        action={
          <ActionButton onClick={openAdd}>
            <Plus size={16} />
            Add beneficiary
          </ActionButton>
        }
      />

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
        <div
          style={{
            color: 'var(--md-on-surface-variant)',
            fontSize: 12,
          }}
        >
          <strong style={{ color: 'var(--md-on-surface)', fontSize: 15 }}>
            {(beneficiaries || []).length}
          </strong>{' '}
          registered beneficiaries
        </div>

        <div style={{ width: 'min(100%, 310px)' }}>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name, contact or address"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          message={
            search
              ? 'No beneficiaries match your search.'
              : 'No beneficiaries have been added yet.'
          }
          action={
            !search ? (
              <ActionButton onClick={openAdd}>
                <Plus size={15} />
                Add your first beneficiary
              </ActionButton>
            ) : null
          }
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
            gap: 14,
          }}
        >
          {filtered.map(beneficiary => {
            const loans = (ngoLoans || []).filter(
              loan => loan.beneficiary_id === beneficiary.id
            )

            const active = loans.filter(
              loan => loan.status === 'active'
            ).length

            const totalPrincipal = loans.reduce(
              (sum, loan) => sum + Number(loan.amount || 0),
              0
            )

            return (
              <article
                key={beneficiary.id}
                style={{
                  ...panelStyle,
                  padding: 18,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  transition: 'border-color 160ms ease, transform 160ms ease',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      flexShrink: 0,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: 12,
                      background: 'var(--md-primary-container)',
                      color: 'var(--md-on-primary-container)',
                      fontSize: 16,
                      fontWeight: 750,
                    }}
                  >
                    {(beneficiary.name || '?').trim().charAt(0).toUpperCase()}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3
                      style={{
                        margin: '1px 0 5px',
                        color: 'var(--md-on-surface)',
                        fontSize: 15,
                        fontWeight: 700,
                        lineHeight: 1.4,
                      }}
                    >
                      {beneficiary.name}
                    </h3>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        color: 'var(--md-on-surface-variant)',
                        fontSize: 11,
                      }}
                    >
                      <Phone size={12} />
                      {beneficiary.contact || 'No contact information'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <IconButton
                      icon={Pencil}
                      label="Edit beneficiary"
                      onClick={() => openEdit(beneficiary)}
                    />

                    <IconButton
                      icon={Trash2}
                      label="Delete beneficiary"
                      danger
                      onClick={() => setDelId(beneficiary.id)}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 7,
                    color: 'var(--md-on-surface-variant)',
                    fontSize: 12,
                    lineHeight: 1.5,
                  }}
                >
                  <MapPin size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{beneficiary.address || 'Address not provided'}</span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                    gap: 9,
                    paddingTop: 13,
                    borderTop: '1px solid var(--md-outline-variant)',
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: 'var(--md-on-surface-variant)',
                        fontSize: 10,
                        fontWeight: 650,
                        marginBottom: 5,
                      }}
                    >
                      MONTHLY INCOME
                    </div>
                    <div
                      style={{
                        color: 'var(--md-on-surface)',
                        fontSize: 12,
                        fontWeight: 700,
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {fmtINR(beneficiary.income)}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        color: 'var(--md-on-surface-variant)',
                        fontSize: 10,
                        fontWeight: 650,
                        marginBottom: 5,
                      }}
                    >
                      ACTIVE LOANS
                    </div>
                    <div
                      style={{
                        color: 'var(--ll-success)',
                        fontSize: 13,
                        fontWeight: 750,
                      }}
                    >
                      {active}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        color: 'var(--md-on-surface-variant)',
                        fontSize: 10,
                        fontWeight: 650,
                        marginBottom: 5,
                      }}
                    >
                      TOTAL PRINCIPAL
                    </div>
                    <div
                      style={{
                        color: 'var(--md-on-surface)',
                        fontSize: 12,
                        fontWeight: 700,
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {fmtINR(totalPrincipal)}
                    </div>
                  </div>
                </div>

                {beneficiary.notes && (
                  <div
                    style={{
                      padding: '10px 11px',
                      borderRadius: 8,
                      background: 'var(--md-surface-container-low)',
                      color: 'var(--md-on-surface-variant)',
                      fontSize: 11,
                      lineHeight: 1.55,
                    }}
                  >
                    {beneficiary.notes}
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}

      <Modal
        open={!!modal}
        onClose={() => !saving && setModal(null)}
        title={modal === 'add' ? 'Add beneficiary' : 'Edit beneficiary'}
        width={560}
      >
        <form onSubmit={handleSave}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 205px), 1fr))',
              gap: '0 15px',
            }}
          >
            <Field label="Full name">
              <input
                className="input-field"
                value={form.name}
                onChange={event => updateField('name', event.target.value)}
                placeholder="Enter full name"
                required
                autoFocus
              />
            </Field>

            <Field label="Contact number">
              <input
                className="input-field"
                value={form.contact}
                onChange={event => updateField('contact', event.target.value)}
                placeholder="Enter phone number"
                type="tel"
              />
            </Field>

            <Field label="Address">
              <input
                className="input-field"
                value={form.address}
                onChange={event => updateField('address', event.target.value)}
                placeholder="Village, town or city"
              />
            </Field>

            <Field label="Monthly income (₹)">
              <input
                className="input-field"
                type="number"
                min="0"
                value={form.income}
                onChange={event => updateField('income', event.target.value)}
                placeholder="e.g. 15000"
              />
            </Field>
          </div>

          <Field label="Notes">
            <textarea
              className="input-field"
              value={form.notes}
              onChange={event => updateField('notes', event.target.value)}
              placeholder="Additional information (optional)"
              rows={3}
              style={{ resize: 'vertical', minHeight: 85 }}
            />
          </Field>

          <FormActions
            onCancel={() => setModal(null)}
            onSave={handleSave}
            saving={saving}
            saveLabel={modal === 'add' ? 'Add beneficiary' : 'Save changes'}
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={!!delId}
        title="Remove beneficiary"
        message="This will remove the beneficiary. Any assigned loans will also be deleted."
        onConfirm={handleDelete}
        onCancel={() => setDelId(null)}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* ASSIGN LOAN                                                                */
/* -------------------------------------------------------------------------- */

export function AssignLoan() {
  const { beneficiaries, ngoLoans, assignLoan } = useNGO()
  const { banks } = useBanks()

  const [form, setForm] = useState({
    beneficiary_id: '',
    bank_name: '',
    amount: '',
    interest_rate: '',
    tenure: '',
    notes: '',
  })

  const [saving, setSaving] = useState(false)
  const { toast, setToast, showToast } = usePageToast()

  const updateField = (key, value) => {
    setForm(previous => ({ ...previous, [key]: value }))
  }

  const amount = Number(form.amount) || 0
  const interest = Number(form.interest_rate) || 0
  const tenure = Number(form.tenure) || 0

  const emi = calcEMI(amount, interest, tenure)
  const totalPayment = emi * tenure
  const totalInterest = Math.max(0, totalPayment - amount)

  async function handleAssign(event) {
    event?.preventDefault()

    if (!form.beneficiary_id) {
      showToast('Please select a beneficiary.', 'error')
      return
    }

    if (!form.bank_name) {
      showToast('Please select a bank or lender.', 'error')
      return
    }

    if (amount <= 0 || interest <= 0 || tenure <= 0) {
      showToast('Enter a valid amount, interest rate and tenure.', 'error')
      return
    }

    setSaving(true)

    try {
      const { error } = await assignLoan(form)

      if (error) {
        showToast(error.message || 'Unable to assign loan.', 'error')
        return
      }

      showToast('Loan assigned successfully.')

      setForm({
        beneficiary_id: '',
        bank_name: '',
        amount: '',
        interest_rate: '',
        tenure: '',
        notes: '',
      })
    } catch (error) {
      showToast(error.message || 'Something went wrong.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const recentLoans = (ngoLoans || []).slice(0, 5)

  return (
    <div className="anim-fade-up" style={{ minWidth: 0, paddingBottom: 25 }}>
      <PageIntro
        eyebrow="Loan administration"
        title="Assign a loan"
        description="Create a loan record for a beneficiary and review the estimated repayment details before saving."
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: 17,
          alignItems: 'start',
        }}
      >
        {/* Assignment form */}
        <section style={panelStyle}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              paddingBottom: 16,
              marginBottom: 17,
              borderBottom: '1px solid var(--md-outline-variant)',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 10,
                color: 'var(--md-primary)',
                background: 'var(--md-primary-container)',
              }}
            >
              <FileText size={17} />
            </div>

            <div>
              <h3
                style={{
                  margin: 0,
                  color: 'var(--md-on-surface)',
                  fontSize: 15,
                  fontWeight: 700,
                }}
              >
                Loan details
              </h3>

              <p
                style={{
                  margin: '3px 0 0',
                  color: 'var(--md-on-surface-variant)',
                  fontSize: 11,
                }}
              >
                Enter the loan information below.
              </p>
            </div>
          </div>

          <form onSubmit={handleAssign}>
            <Field label="Beneficiary">
              <select
                className="input-field"
                value={form.beneficiary_id}
                onChange={event => updateField('beneficiary_id', event.target.value)}
                required
              >
                <option value="">Select beneficiary</option>
                {(beneficiaries || []).map(beneficiary => (
                  <option key={beneficiary.id} value={beneficiary.id}>
                    {beneficiary.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Bank / lender">
              <select
                className="input-field"
                value={form.bank_name}
                onChange={event => {
                  const selectedName = event.target.value
                  const bank = (banks || []).find(
                    item => item.name === selectedName
                  )

                  updateField('bank_name', selectedName)

                  if (bank && !form.interest_rate) {
                    updateField('interest_rate', bank.interest_rate)
                  }
                }}
                required
              >
                <option value="">Select bank or lender</option>

                {(banks || []).map(bank => (
                  <option key={bank.id} value={bank.name}>
                    {bank.name} ({bank.interest_rate}%)
                  </option>
                ))}

                <option value="NGO Internal Fund">NGO Internal Fund</option>
              </select>
            </Field>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '0 12px',
              }}
            >
              <Field label="Loan amount (₹)">
                <input
                  className="input-field"
                  type="number"
                  min="1"
                  value={form.amount}
                  onChange={event => updateField('amount', event.target.value)}
                  placeholder="50000"
                  required
                />
              </Field>

              <Field label="Interest rate (%)">
                <input
                  className="input-field"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.interest_rate}
                  onChange={event => updateField('interest_rate', event.target.value)}
                  placeholder="8.5"
                  required
                />
              </Field>

              <Field label="Tenure (months)">
                <input
                  className="input-field"
                  type="number"
                  min="1"
                  step="1"
                  value={form.tenure}
                  onChange={event => updateField('tenure', event.target.value)}
                  placeholder="24"
                  required
                />
              </Field>
            </div>

            <Field label="Notes">
              <textarea
                className="input-field"
                value={form.notes}
                onChange={event => updateField('notes', event.target.value)}
                placeholder="Purpose or additional details"
                rows={3}
                style={{ minHeight: 80, resize: 'vertical' }}
              />
            </Field>

            <ActionButton
              type="submit"
              disabled={saving}
              style={{ width: '100%', marginTop: 5 }}
            >
              {saving ? 'Assigning...' : 'Assign loan'}
              <Check size={15} />
            </ActionButton>
          </form>
        </section>

        {/* EMI preview and recent assignments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          <section
            style={{
              ...panelStyle,
              background: 'var(--md-surface-container-low)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 19,
              }}
            >
              <Activity size={16} color="var(--md-primary)" />

              <h3
                style={{
                  margin: 0,
                  color: 'var(--md-on-surface)',
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                Repayment estimate
              </h3>
            </div>

            <div
              style={{
                padding: 17,
                borderRadius: 11,
                background: 'var(--md-primary-container)',
                border: '1px solid var(--md-outline-variant)',
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  color: 'var(--md-on-primary-container)',
                  fontSize: 10,
                  fontWeight: 750,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                }}
              >
                Estimated monthly EMI
              </div>

              <div
                style={{
                  marginTop: 8,
                  color: 'var(--md-on-primary-container)',
                  fontSize: 'clamp(27px, 4vw, 36px)',
                  fontWeight: 800,
                  letterSpacing: '-0.05em',
                  lineHeight: 1.2,
                  overflowWrap: 'anywhere',
                }}
              >
                {fmtINR(emi)}
              </div>

              <div
                style={{
                  marginTop: 6,
                  color: 'var(--md-on-primary-container)',
                  fontSize: 11,
                  opacity: 0.85,
                }}
              >
                {tenure > 0 ? `For ${tenure} months` : 'Enter loan details to calculate'}
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 10,
              }}
            >
              <div
                style={{
                  padding: 12,
                  borderRadius: 9,
                  background: 'var(--md-surface)',
                  border: '1px solid var(--md-outline-variant)',
                }}
              >
                <div
                  style={{
                    color: 'var(--md-on-surface-variant)',
                    fontSize: 10,
                    fontWeight: 650,
                    marginBottom: 6,
                  }}
                >
                  TOTAL PAYMENT
                </div>

                <div
                  style={{
                    color: 'var(--md-on-surface)',
                    fontSize: 14,
                    fontWeight: 750,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {fmtINR(totalPayment)}
                </div>
              </div>

              <div
                style={{
                  padding: 12,
                  borderRadius: 9,
                  background: 'var(--md-surface)',
                  border: '1px solid var(--md-outline-variant)',
                }}
              >
                <div
                  style={{
                    color: 'var(--md-on-surface-variant)',
                    fontSize: 10,
                    fontWeight: 650,
                    marginBottom: 6,
                  }}
                >
                  TOTAL INTEREST
                </div>

                <div
                  style={{
                    color: 'var(--ll-warning)',
                    fontSize: 14,
                    fontWeight: 750,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {fmtINR(totalInterest)}
                </div>
              </div>
            </div>

            <p
              style={{
                margin: '13px 0 0',
                color: 'var(--md-on-surface-variant)',
                fontSize: 10,
                lineHeight: 1.55,
              }}
            >
              Estimate based on the entered principal, annual interest rate and tenure.
            </p>
          </section>

          <section style={panelStyle}>
            <SectionTitle>Recent assignments</SectionTitle>

            {recentLoans.length === 0 ? (
              <EmptyState message="No loan assignments yet." />
            ) : (
              <div>
                {recentLoans.map((loan, index) => (
                  <div
                    key={loan.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      padding: '12px 0',
                      borderBottom:
                        index === recentLoans.length - 1
                          ? 'none'
                          : '1px solid var(--md-outline-variant)',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          color: 'var(--md-on-surface)',
                          fontSize: 12,
                          fontWeight: 700,
                          overflowWrap: 'anywhere',
                        }}
                      >
                        {loan.ben_name || 'Unknown beneficiary'}
                      </div>

                      <div
                        style={{
                          marginTop: 4,
                          color: 'var(--md-on-surface-variant)',
                          fontSize: 10,
                        }}
                      >
                        {loan.bank_name || 'Lender not specified'}
                      </div>
                    </div>

                    <div
                      style={{
                        flexShrink: 0,
                        textAlign: 'right',
                      }}
                    >
                      <div
                        style={{
                          marginBottom: 5,
                          color: 'var(--md-on-surface)',
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {fmtINR(loan.amount)}
                      </div>

                      <StatusBadge status={loan.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* NGO LOAN MANAGER                                                            */
/* -------------------------------------------------------------------------- */

export function NGOLoanManager() {
  const {
    ngoLoans,
    loading,
    recordNgoPayment,
    markDefaulted,
  } = useNGO()

  const [paying, setPaying] = useState(null)
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [confirmDefault, setConfirmDefault] = useState(null)

  const { toast, setToast, showToast } = usePageToast()

  async function handlePayment(loan) {
    const paymentAmount = Number(amount)

    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      showToast('Enter a valid payment amount.', 'error')
      return
    }

    const remaining =
      loan.remaining_amount != null
        ? Number(loan.remaining_amount)
        : Math.max(
            0,
            Number(loan.amount || 0) - Number(loan.paid_amount || 0)
          )

    if (paymentAmount > remaining) {
      showToast(
        `Payment cannot exceed the remaining balance of ${fmtINR(remaining)}.`,
        'error'
      )
      return
    }

    setSaving(true)

    try {
      const { error } = await recordNgoPayment(loan.id, paymentAmount)

      if (error) {
        showToast(error.message || 'Unable to record payment.', 'error')
        return
      }

      showToast(`Payment of ${fmtINR(paymentAmount)} recorded successfully.`)
      setPaying(null)
      setAmount('')
    } catch (error) {
      showToast(error.message || 'Unable to record payment.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDefault() {
    if (!confirmDefault) return

    try {
      const { error } = await markDefaulted(confirmDefault.id)

      if (error) {
        showToast(error.message || 'Unable to update loan status.', 'error')
      } else {
        showToast('Loan status updated.')
      }
    } catch (error) {
      showToast(error.message || 'Unable to update loan status.', 'error')
    } finally {
      setConfirmDefault(null)
    }
  }

  const loans = ngoLoans || []

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()

    return loans.filter(loan => {
      const matchesStatus =
        filter === 'all' || loan.status === filter

      const beneficiary = String(loan.ben_name || '').toLowerCase()
      const bank = String(loan.bank_name || '').toLowerCase()

      const matchesSearch =
        !query ||
        beneficiary.includes(query) ||
        bank.includes(query)

      return matchesStatus && matchesSearch
    })
  }, [loans, filter, search])

  if (loading) return <LoadingScreen />

  const filters = [
    { id: 'all', label: 'All loans' },
    { id: 'active', label: 'Active' },
    { id: 'pending', label: 'Pending' },
    { id: 'completed', label: 'Completed' },
    { id: 'defaulted', label: 'Defaulted' },
  ]

  return (
    <div className="anim-fade-up" style={{ minWidth: 0, paddingBottom: 25 }}>
      <PageIntro
        eyebrow="Payment monitoring"
        title="NGO Loan Manager"
        description="Review loan accounts, record repayments made by beneficiaries and monitor outstanding balances."
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))',
          gap: 12,
          marginBottom: 18,
        }}
      >
        <MetricCard
          label="Total accounts"
          value={loans.length}
          color="cyan"
          icon={<FileText size={17} />}
        />

        <MetricCard
          label="Active accounts"
          value={loans.filter(loan => loan.status === 'active').length}
          color="green"
          icon={<Activity size={17} />}
        />

        <MetricCard
          label="Payments recorded"
          value={fmtINR(
            loans.reduce(
              (sum, loan) => sum + Number(loan.paid_amount || 0),
              0
            )
          )}
          color="purple"
          icon={<CheckCircle2 size={17} />}
        />

        <MetricCard
          label="Defaulted accounts"
          value={loans.filter(loan => loan.status === 'defaulted').length}
          color="amber"
          icon={<AlertCircle size={17} />}
        />
      </div>

      <section style={panelStyle}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 13,
            marginBottom: 17,
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                color: 'var(--md-on-surface)',
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              Loan accounts
            </h3>

            <p
              style={{
                margin: '5px 0 0',
                color: 'var(--md-on-surface-variant)',
                fontSize: 11,
              }}
            >
              {filtered.length} matching records
            </p>
          </div>

          <div style={{ width: 'min(100%, 280px)' }}>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search beneficiary or bank"
            />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 7,
            flexWrap: 'wrap',
            marginBottom: 17,
          }}
        >
          {filters.map(item => {
            const selected = filter === item.id

            return (
              <button
                type="button"
                key={item.id}
                onClick={() => setFilter(item.id)}
                style={{
                  minHeight: 34,
                  padding: '7px 12px',
                  borderRadius: 8,
                  border: selected
                    ? '1px solid var(--md-primary)'
                    : '1px solid var(--md-outline-variant)',
                  background: selected
                    ? 'var(--md-primary-container)'
                    : 'var(--md-surface-container-low)',
                  color: selected
                    ? 'var(--md-on-primary-container)'
                    : 'var(--md-on-surface-variant)',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {item.label}
              </button>
            )
          })}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            message={
              search
                ? 'No loan accounts match your search.'
                : 'No loan accounts match this filter.'
            }
          />
        ) : (
          <TableShell minWidth={1050}>
            <thead>
              <tr>
                <th>Beneficiary</th>
                <th>Principal</th>
                <th>EMI</th>
                <th>Recorded</th>
                <th>Remaining</th>
                <th>Missed EMIs</th>
                <th>Progress</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map(loan => {
                const progress = pct(loan.paid_amount, loan.amount)

                const remaining =
                  loan.remaining_amount != null
                    ? Number(loan.remaining_amount)
                    : Math.max(
                        0,
                        Number(loan.amount || 0) -
                          Number(loan.paid_amount || 0)
                      )

                const isPaying = paying === loan.id

                return (
                  <tr key={loan.id}>
                    <td>
                      <div
                        style={{
                          color: 'var(--md-on-surface)',
                          fontWeight: 700,
                        }}
                      >
                        {loan.ben_name || 'Unknown'}
                      </div>

                      <div
                        style={{
                          color: 'var(--md-on-surface-variant)',
                          fontSize: 10,
                          marginTop: 3,
                        }}
                      >
                        {loan.bank_name || 'Lender not specified'}
                      </div>
                    </td>

                    <td className="mono">{fmtINR(loan.amount)}</td>
                    <td className="mono">{fmtINR(loan.emi)}</td>

                    <td
                      className="mono"
                      style={{ color: 'var(--ll-success)' }}
                    >
                      {fmtINR(loan.paid_amount)}
                    </td>

                    <td
                      className="mono"
                      style={{ color: 'var(--ll-warning)' }}
                    >
                      {fmtINR(remaining)}
                    </td>

                    <td>
                      <span
                        style={{
                          color:
                            Number(loan.missed_emis || 0) > 0
                              ? 'var(--ll-error)'
                              : 'var(--md-on-surface-variant)',
                          fontWeight: 700,
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {loan.missed_emis || 0}
                      </span>
                    </td>

                    <td style={{ minWidth: 110 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 8,
                          marginBottom: 6,
                          color: 'var(--md-on-surface-variant)',
                          fontSize: 10,
                        }}
                      >
                        <span>Recorded</span>
                        <strong>{progress}%</strong>
                      </div>

                      <ProgressBar value={progress} color="green" height={6} />
                    </td>

                    <td>
                      <StatusBadge status={loan.status} />
                    </td>

                    <td>
                      {isPaying ? (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                          }}
                        >
                          <input
                            type="number"
                            min="0.01"
                            max={remaining}
                            step="0.01"
                            value={amount}
                            onChange={event => setAmount(event.target.value)}
                            placeholder="Amount"
                            aria-label="Payment amount"
                            className="input-field"
                            style={{
                              width: 105,
                              minHeight: 34,
                              padding: '5px 8px',
                              fontSize: 11,
                            }}
                          />

                          <IconButton
                            icon={Check}
                            label="Confirm payment"
                            onClick={() => handlePayment(loan)}
                          />

                          <IconButton
                            icon={X}
                            label="Cancel payment"
                            onClick={() => {
                              setPaying(null)
                              setAmount('')
                            }}
                          />
                        </div>
                      ) : (
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 6,
                          }}
                        >
                          <button
                            type="button"
                            disabled={
                              loan.status === 'completed' ||
                              loan.status === 'defaulted' ||
                              remaining <= 0
                            }
                            onClick={() => {
                              setPaying(loan.id)
                              setAmount('')
                            }}
                            style={{
                              minHeight: 31,
                              padding: '6px 9px',
                              border: '1px solid var(--md-primary-border, var(--md-outline-variant))',
                              borderRadius: 7,
                              background: 'var(--md-primary-container)',
                              color: 'var(--md-on-primary-container)',
                              fontSize: 10,
                              fontWeight: 750,
                              cursor: 'pointer',
                              opacity:
                                loan.status === 'completed' ||
                                loan.status === 'defaulted' ||
                                remaining <= 0
                                  ? 0.45
                                  : 1,
                            }}
                          >
                            Record payment
                          </button>

                          {loan.status === 'active' && (
                            <button
                              type="button"
                              onClick={() => setConfirmDefault(loan)}
                              style={{
                                minHeight: 31,
                                padding: '6px 9px',
                                border: '1px solid var(--ll-error)',
                                borderRadius: 7,
                                background: 'var(--ll-error-container)',
                                color: 'var(--ll-error)',
                                fontSize: 10,
                                fontWeight: 750,
                                cursor: 'pointer',
                              }}
                            >
                              Default
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </TableShell>
        )}
      </section>

      <ConfirmDialog
        open={!!confirmDefault}
        title="Mark loan as defaulted?"
        message="This will change the loan status to defaulted. Continue only after verifying the account details."
        confirmLabel="Mark defaulted"
        onConfirm={handleDefault}
        onCancel={() => setConfirmDefault(null)}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* REPORTS AND ANALYTICS                                                      */
/* -------------------------------------------------------------------------- */

export function Reports() {
  const { ngoLoans, beneficiaries, loading } = useNGO()
  const { toast, setToast, showToast } = usePageToast()

  const loans = ngoLoans || []
  const people = beneficiaries || []

  const totalPrincipal = loans.reduce(
    (sum, loan) => sum + Number(loan.amount || 0),
    0
  )

  const totalRecovered = loans.reduce(
    (sum, loan) => sum + Number(loan.paid_amount || 0),
    0
  )

  const totalOutstanding = Math.max(
    0,
    totalPrincipal - totalRecovered
  )

  const recoveryRate = pct(totalRecovered, totalPrincipal)

  const averageLoan = loans.length
    ? totalPrincipal / loans.length
    : 0

  const statusData = [
    {
      name: 'Active',
      value: loans.filter(loan => loan.status === 'active').length,
      color: COLORS.active,
    },
    {
      name: 'Completed',
      value: loans.filter(loan => loan.status === 'completed').length,
      color: COLORS.completed,
    },
    {
      name: 'Defaulted',
      value: loans.filter(loan => loan.status === 'defaulted').length,
      color: COLORS.defaulted,
    },
    {
      name: 'Pending',
      value: loans.filter(loan => loan.status === 'pending').length,
      color: COLORS.pending,
    },
  ].filter(item => item.value > 0)

  const beneficiaryData = useMemo(() => {
    return people.map(beneficiary => {
      const assigned = loans.filter(
        loan => loan.beneficiary_id === beneficiary.id
      )

      const principal = assigned.reduce(
        (sum, loan) => sum + Number(loan.amount || 0),
        0
      )

      const paid = assigned.reduce(
        (sum, loan) => sum + Number(loan.paid_amount || 0),
        0
      )

      return {
        id: beneficiary.id,
        name: beneficiary.name || 'Unknown',
        loans: assigned.length,
        principal,
        paid,
        outstanding: Math.max(0, principal - paid),
        recovery: pct(paid, principal),
      }
    })
  }, [people, loans])

  const monthlyData = useMemo(() => {
    const monthly = new Map()

    loans.forEach(loan => {
      const dateValue = loan.created_at || loan.start_date

      if (!dateValue) return

      const date = new Date(dateValue)

      if (Number.isNaN(date.getTime())) return

      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      const label = date.toLocaleDateString('en-IN', {
        month: 'short',
        year: '2-digit',
      })

      if (!monthly.has(key)) {
        monthly.set(key, {
          key,
          month: label,
          principal: 0,
          recorded: 0,
          accounts: 0,
        })
      }

      const entry = monthly.get(key)

      entry.principal += Number(loan.amount || 0)
      entry.recorded += Number(loan.paid_amount || 0)
      entry.accounts += 1
    })

    return Array.from(monthly.values())
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-8)
  }, [loans])

  function exportReport() {
    if (loans.length === 0) {
      showToast('There are no loan records to export.', 'error')
      return
    }

    const headers = [
      'Beneficiary',
      'Bank',
      'Principal',
      'EMI',
      'Payments Recorded',
      'Outstanding',
      'Status',
    ]

    const rows = loans.map(loan => {
      const remaining =
        loan.remaining_amount != null
          ? Number(loan.remaining_amount)
          : Math.max(
              0,
              Number(loan.amount || 0) - Number(loan.paid_amount || 0)
            )

      return [
        loan.ben_name || '',
        loan.bank_name || '',
        Number(loan.amount || 0),
        Number(loan.emi || 0),
        Number(loan.paid_amount || 0),
        remaining,
        loan.status || '',
      ]
    })

    const csvCell = value =>
      `"${String(value ?? '').replace(/"/g, '""')}"`

    const csv = [headers, ...rows]
      .map(row => row.map(csvCell).join(','))
      .join('\r\n')

    const blob = new Blob(['\uFEFF' + csv], {
      type: 'text/csv;charset=utf-8;',
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'loanledger-ngo-report.csv'

    document.body.appendChild(link)
    link.click()
    link.remove()

    URL.revokeObjectURL(url)

    showToast('Report exported successfully.')
  }

  if (loading) return <LoadingScreen />

  return (
    <div className="anim-fade-up" style={{ minWidth: 0, paddingBottom: 25 }}>
      <PageIntro
        eyebrow="Performance and insights"
        title="Reports & analytics"
        description="Review loan records, payment activity, portfolio status and beneficiary-level summaries."
        action={
          <ActionButton onClick={exportReport}>
            <Download size={15} />
            Export CSV
          </ActionButton>
        }
      />

      {/* Summary metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 205px), 1fr))',
          gap: 13,
          marginBottom: 17,
        }}
      >
        <MetricCard
          label="Recovery rate"
          value={`${recoveryRate}%`}
          color="green"
          sub="Recorded payments against principal"
        />

        <MetricCard
          label="Average loan"
          value={fmtINR(averageLoan)}
          color="cyan"
          sub={`Across ${loans.length} loan accounts`}
        />

        <MetricCard
          label="Principal tracked"
          value={fmtINR(totalPrincipal)}
          color="purple"
          sub="Total loan principal"
        />

        <MetricCard
          label="Outstanding"
          value={fmtINR(totalOutstanding)}
          color="amber"
          sub="Principal not yet recorded as paid"
        />
      </div>

      {/* Recovery overview */}
      <section
        style={{
          ...panelStyle,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 17,
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                color: 'var(--md-on-surface)',
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              Principal recovery overview
            </h3>

            <p
              style={{
                margin: '5px 0 0',
                color: 'var(--md-on-surface-variant)',
                fontSize: 11,
              }}
            >
              Comparison of total principal and payments recorded.
            </p>
          </div>

          <span
            style={{
              color: 'var(--ll-success)',
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: '-0.04em',
            }}
          >
            {recoveryRate}%
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            width: '100%',
            height: 10,
            overflow: 'hidden',
            borderRadius: 999,
            background: 'var(--md-surface-container-high)',
            marginBottom: 18,
          }}
        >
          <div
            style={{
              width: `${Math.min(100, Math.max(0, recoveryRate))}%`,
              borderRadius: 999,
              background: 'var(--ll-success)',
              transition: 'width 300ms ease',
            }}
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
            gap: 15,
          }}
        >
          <div>
            <div
              style={{
                color: 'var(--md-on-surface-variant)',
                fontSize: 10,
                fontWeight: 700,
                marginBottom: 5,
              }}
            >
              PRINCIPAL
            </div>
            <div
              style={{
                color: 'var(--md-on-surface)',
                fontSize: 17,
                fontWeight: 750,
              }}
            >
              {fmtINR(totalPrincipal)}
            </div>
          </div>

          <div>
            <div
              style={{
                color: 'var(--md-on-surface-variant)',
                fontSize: 10,
                fontWeight: 700,
                marginBottom: 5,
              }}
            >
              PAYMENTS RECORDED
            </div>
            <div
              style={{
                color: 'var(--ll-success)',
                fontSize: 17,
                fontWeight: 750,
              }}
            >
              {fmtINR(totalRecovered)}
            </div>
          </div>

          <div>
            <div
              style={{
                color: 'var(--md-on-surface-variant)',
                fontSize: 10,
                fontWeight: 700,
                marginBottom: 5,
              }}
            >
              OUTSTANDING PRINCIPAL
            </div>
            <div
              style={{
                color: 'var(--ll-warning)',
                fontSize: 17,
                fontWeight: 750,
              }}
            >
              {fmtINR(totalOutstanding)}
            </div>
          </div>
        </div>
      </section>

      {/* Charts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 330px), 1fr))',
          gap: 15,
          marginBottom: 16,
        }}
      >
        <section style={panelStyle}>
          <SectionTitle>Loan activity over time</SectionTitle>

          <p
            style={{
              margin: '-10px 0 14px',
              color: 'var(--md-on-surface-variant)',
              fontSize: 11,
              lineHeight: 1.5,
            }}
          >
            Based on the available loan creation or start dates.
          </p>

          {monthlyData.length === 0 ? (
            <EmptyState message="Date-based loan activity will appear here." />
          ) : (
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyData}
                  margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="ngoPrincipalGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>

                    <linearGradient id="ngoRecordedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 4"
                    stroke="var(--md-outline-variant)"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: 'var(--md-on-surface-variant)' }}
                    axisLine={{ stroke: 'var(--md-outline-variant)' }}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{ fontSize: 10, fill: 'var(--md-on-surface-variant)' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={value => `${Math.round(value / 1000)}k`}
                  />

                  <Tooltip
                    {...tooltipStyle}
                    formatter={value => [fmtINR(value)]}
                  />

                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{
                      fontSize: 10,
                      color: 'var(--md-on-surface-variant)',
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="principal"
                    name="Principal"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    fill="url(#ngoPrincipalGradient)"
                  />

                  <Area
                    type="monotone"
                    dataKey="recorded"
                    name="Payments recorded"
                    stroke="var(--chart-3)"
                    strokeWidth={2}
                    fill="url(#ngoRecordedGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section style={panelStyle}>
          <SectionTitle>Portfolio status</SectionTitle>

          <p
            style={{
              margin: '-10px 0 10px',
              color: 'var(--md-on-surface-variant)',
              fontSize: 11,
            }}
          >
            Current distribution of loan accounts.
          </p>

          {statusData.length === 0 ? (
            <EmptyState message="No loan status data available." />
          ) : (
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="46%"
                    innerRadius={55}
                    outerRadius={83}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {statusData.map(item => (
                      <Cell
                        key={item.name}
                        fill={item.color}
                      />
                    ))}
                  </Pie>

                  <Tooltip {...tooltipStyle} />

                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{
                      fontSize: 10,
                      color: 'var(--md-on-surface-variant)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>

      {/* Beneficiary comparison */}
      <section style={{ ...panelStyle, marginBottom: 16 }}>
        <SectionTitle>Beneficiary loan comparison</SectionTitle>

        <p
          style={{
            margin: '-10px 0 15px',
            color: 'var(--md-on-surface-variant)',
            fontSize: 11,
          }}
        >
          Compare principal amounts and recorded payments by beneficiary.
        </p>

        {beneficiaryData.filter(item => item.loans > 0).length === 0 ? (
          <EmptyState message="No beneficiary loan records available." />
        ) : (
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={beneficiaryData.filter(item => item.loans > 0).slice(0, 12)}
                margin={{ top: 8, right: 10, left: -10, bottom: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 4"
                  stroke="var(--md-outline-variant)"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: 'var(--md-on-surface-variant)' }}
                  axisLine={{ stroke: 'var(--md-outline-variant)' }}
                  tickLine={false}
                />

                <YAxis
                  tick={{ fontSize: 10, fill: 'var(--md-on-surface-variant)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={value => `${Math.round(value / 1000)}k`}
                />

                <Tooltip
                  {...tooltipStyle}
                  formatter={value => [fmtINR(value)]}
                />

                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{
                    fontSize: 10,
                    color: 'var(--md-on-surface-variant)',
                  }}
                />

                <Bar
                  dataKey="principal"
                  name="Principal"
                  fill="var(--chart-1)"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={35}
                />

                <Bar
                  dataKey="paid"
                  name="Recorded"
                  fill="var(--chart-3)"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={35}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Beneficiary summary */}
      <section style={panelStyle}>
        <SectionTitle>Beneficiary-wise summary</SectionTitle>

        {beneficiaryData.length === 0 ? (
          <EmptyState message="No beneficiaries have been registered yet." />
        ) : (
          <TableShell minWidth={850}>
            <thead>
              <tr>
                <th>Beneficiary</th>
                <th>Accounts</th>
                <th>Principal</th>
                <th>Recorded</th>
                <th>Outstanding</th>
                <th>Recovery</th>
              </tr>
            </thead>

            <tbody>
              {beneficiaryData.map(beneficiary => (
                <tr key={beneficiary.id}>
                  <td
                    style={{
                      color: 'var(--md-on-surface)',
                      fontWeight: 700,
                    }}
                  >
                    {beneficiary.name}
                  </td>

                  <td>{beneficiary.loans}</td>

                  <td className="mono">
                    {fmtINR(beneficiary.principal)}
                  </td>

                  <td
                    className="mono"
                    style={{ color: 'var(--ll-success)' }}
                  >
                    {fmtINR(beneficiary.paid)}
                  </td>

                  <td
                    className="mono"
                    style={{ color: 'var(--ll-warning)' }}
                  >
                    {fmtINR(beneficiary.outstanding)}
                  </td>

                  <td style={{ minWidth: 145 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 9,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 55 }}>
                        <ProgressBar
                          value={beneficiary.recovery}
                          color="green"
                          height={6}
                        />
                      </div>

                      <span
                        style={{
                          minWidth: 35,
                          color: 'var(--md-on-surface-variant)',
                          fontSize: 11,
                          fontWeight: 700,
                          textAlign: 'right',
                        }}
                      >
                        {beneficiary.recovery}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        )}
      </section>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
