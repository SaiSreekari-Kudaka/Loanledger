
import { useMemo, useState } from 'react'
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  Landmark,
  ArrowUpRight,
  Calculator,
  Wallet,
  Percent,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
} from 'lucide-react'
import { useBanks } from '../../hooks/useBanks'
import { SectionTitle, LoadingScreen, EmptyState } from '../shared/UI'
import { fmtINR, normalizeType, typeLabel } from '../../lib/utils'

const LOAN_ICONS = {
  home: '🏠',
  personal: '👤',
  education: '🎓',
  vehicle: '🚗',
  car: '🚗',
  gold: '🥇',
  agriculture: '🌾',
  business: '💼',
  medical: '🩺',
  property: '🏘️',
  default: '🏦',
}

function getLoanIcon(type) {
  const key = normalizeType(type)
  return LOAN_ICONS[key] || LOAN_ICONS.default
}

function estimateEMI(principal, annualRate, months) {
  const amount = Number(principal) || 0
  const rate = Number(annualRate) || 0
  const tenure = Number(months) || 0

  if (amount <= 0 || tenure <= 0) return 0
  if (rate <= 0) return Math.round(amount / tenure)

  const monthlyRate = rate / 1200
  const factor = Math.pow(1 + monthlyRate, tenure)

  return Math.round(
    (amount * monthlyRate * factor) / (factor - 1)
  )
}

function formatRate(rate) {
  const value = Number(rate)
  return Number.isFinite(value)
    ? `${value.toFixed(2).replace(/\.?0+$/, '')}%`
    : '—'
}

export default function BanksPage({ onRecordLoan }) {
  const { banks = [], loading, error, refresh } = useBanks()

  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [maxRate, setMaxRate] = useState(null)
  const [previewAmt, setPreviewAmt] = useState(500000)
  const [previewTen, setPreviewTen] = useState(36)

  const categories = useMemo(() => {
    const values = new Map()

    banks.forEach(bank => {
      const key = normalizeType(bank.loan_type)
      if (key && !values.has(key)) {
        values.set(key, typeLabel(bank.loan_type))
      }
    })

    return [...values.entries()].sort((a, b) =>
      a[1].localeCompare(b[1])
    )
  }, [banks])

  const rateCeiling = useMemo(() => {
    const rates = banks
      .map(bank => Number(bank.interest_rate))
      .filter(rate => Number.isFinite(rate) && rate > 0)

    return rates.length ? Math.max(...rates) : 15
  }, [banks])

  const lowestRate = useMemo(() => {
    if (!banks.length) return null

    return Math.min(
      ...banks.map(bank => Number(bank.interest_rate) || Infinity)
    )
  }, [banks])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()

    return banks.filter(bank => {
      const bankName = String(bank.name || '').toLowerCase()
      const loanType = String(bank.loan_type || '').toLowerCase()
      const normalizedType = normalizeType(bank.loan_type)
      const rate = Number(bank.interest_rate) || 0

      if (category !== 'all' && normalizedType !== category) {
        return false
      }

      if (maxRate !== null && rate > maxRate) {
        return false
      }

      if (query && !`${bankName} ${loanType}`.includes(query)) {
        return false
      }

      return true
    })
  }, [banks, category, maxRate, search])

  const filtersActive =
    category !== 'all' ||
    search.trim() !== '' ||
    maxRate !== null

  function resetFilters() {
    setCategory('all')
    setSearch('')
    setMaxRate(null)
  }

  const previewProducts = useMemo(() => {
    return [...filtered]
      .sort(
        (a, b) =>
          estimateEMI(previewAmt, a.interest_rate, previewTen) -
          estimateEMI(previewAmt, b.interest_rate, previewTen)
      )
      .slice(0, 4)
  }, [filtered, previewAmt, previewTen])

  if (loading) return <LoadingScreen />

  if (error) {
    return (
      <div
        style={{
          maxWidth: 560,
          margin: '48px auto',
          padding: 24,
          textAlign: 'center',
          background: 'var(--md-surface-container)',
          border: '1px solid var(--md-outline-variant)',
          borderRadius: 24,
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 17,
            display: 'grid',
            placeItems: 'center',
            margin: '0 auto 16px',
            background: 'var(--md-error-container)',
            color: 'var(--md-on-error-container)',
          }}
        >
          <Landmark size={24} />
        </div>

        <h3
          style={{
            color: 'var(--md-on-surface)',
            fontSize: 18,
            fontWeight: 650,
            margin: '0 0 8px',
          }}
        >
          Bank products couldn't be loaded
        </h3>

        <p
          style={{
            color: 'var(--md-on-surface-variant)',
            fontSize: 13,
            lineHeight: 1.6,
            margin: '0 0 20px',
          }}
        >
          {error}
        </p>

        <button className="btn btn-cyan" onClick={refresh}>
          <RefreshCw size={15} />
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="anim-fade-up" style={{ display: 'grid', gap: 22 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 14,
        }}
      >
        <div>
          <SectionTitle>Explore bank loans</SectionTitle>
          <p
            style={{
              color: 'var(--md-on-surface-variant)',
              fontSize: 13,
              margin: '5px 0 0',
              lineHeight: 1.6,
            }}
          >
            Browse available loan products and compare their interest rates.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 13px',
            borderRadius: 13,
            background: 'var(--md-surface-container)',
            border: '1px solid var(--md-outline-variant)',
            color: 'var(--md-on-surface-variant)',
            fontSize: 12,
          }}
        >
          <Landmark size={15} />
          <strong style={{ color: 'var(--md-on-surface)' }}>
            {filtered.length}
          </strong>
          {filtersActive ? ` of ${banks.length}` : ''} products
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 11,
        }}
      >
        {[
          {
            label: 'Available products',
            value: banks.length,
            icon: <Landmark size={15} />,
          },
          {
            label: 'Loan categories',
            value: categories.length,
            icon: <SlidersHorizontal size={15} />,
          },
          {
            label: 'Lowest listed rate',
            value:
              lowestRate === null || !Number.isFinite(lowestRate)
                ? '—'
                : formatRate(lowestRate),
            icon: <Percent size={15} />,
            primary: true,
          },
        ].map(item => (
          <div
            key={item.label}
            style={{
              padding: '16px 17px',
              borderRadius: 18,
              background: 'var(--md-surface-container)',
              border: '1px solid var(--md-outline-variant)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: 'var(--md-on-surface-variant)',
                fontSize: 12,
                marginBottom: 9,
              }}
            >
              {item.icon}
              {item.label}
            </div>
            <div
              style={{
                fontSize: 25,
                fontWeight: 700,
                color: item.primary
                  ? 'var(--md-primary)'
                  : 'var(--md-on-surface)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <section>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 11,
          }}
        >
          <h3
            style={{
              color: 'var(--md-on-surface)',
              fontSize: 14,
              fontWeight: 650,
              margin: 0,
            }}
          >
            Browse by category
          </h3>

          {filtersActive && (
            <button
              type="button"
              onClick={resetFilters}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                border: 0,
                background: 'transparent',
                color: 'var(--md-primary)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={13} />
              Clear filters
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button
            type="button"
            onClick={() => setCategory('all')}
            aria-pressed={category === 'all'}
            className={`btn btn-sm ${category === 'all' ? 'btn-cyan' : 'btn-ghost'}`}
          >
            All loans
          </button>

          {categories.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setCategory(key)}
              aria-pressed={category === key}
              className={`btn btn-sm ${category === key ? 'btn-cyan' : 'btn-ghost'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
          gap: 14,
          padding: 16,
          borderRadius: 20,
          background: 'var(--md-surface-container)',
          border: '1px solid var(--md-outline-variant)',
        }}
      >
        <div>
          <label
            htmlFor="bank-search"
            style={{
              display: 'block',
              color: 'var(--md-on-surface-variant)',
              fontSize: 11,
              fontWeight: 650,
              marginBottom: 8,
            }}
          >
            SEARCH PRODUCTS
          </label>

          <div style={{ position: 'relative' }}>
            <Search
              size={17}
              style={{
                position: 'absolute',
                left: 13,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--md-on-surface-variant)',
                pointerEvents: 'none',
              }}
            />

            <input
              id="bank-search"
              className="input-field"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search bank or loan type..."
              aria-label="Search bank loans"
              style={{ paddingLeft: 40, width: '100%' }}
            />
          </div>
        </div>

        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 10,
              marginBottom: 8,
            }}
          >
            <label
              htmlFor="bank-rate-filter"
              style={{
                color: 'var(--md-on-surface-variant)',
                fontSize: 11,
                fontWeight: 650,
              }}
            >
              MAXIMUM INTEREST RATE
            </label>

            <span
              style={{
                color: 'var(--md-primary)',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {maxRate === null ? 'Any rate' : `Up to ${formatRate(maxRate)}`}
            </span>
          </div>

          <input
            id="bank-rate-filter"
            type="range"
            min={0}
            max={Math.max(5, Math.ceil(rateCeiling))}
            step={0.25}
            value={
              maxRate === null
                ? Math.max(5, Math.ceil(rateCeiling))
                : maxRate
            }
            onChange={event => {
              const value = Number(event.target.value)
              const maximum = Math.max(5, Math.ceil(rateCeiling))
              setMaxRate(value >= maximum ? null : value)
            }}
            style={{
              width: '100%',
              accentColor: 'var(--md-primary)',
              cursor: 'pointer',
            }}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              color: 'var(--md-on-surface-variant)',
              fontSize: 10,
            }}
          >
            <span>0%</span>
            <span>{Math.max(5, Math.ceil(rateCeiling))}%</span>
          </div>
        </div>
      </div>

      <section>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 10,
            marginBottom: 13,
          }}
        >
          <h3
            style={{
              color: 'var(--md-on-surface)',
              fontSize: 15,
              fontWeight: 650,
              margin: 0,
            }}
          >
            Available loan products
          </h3>

          <span
            style={{
              color: 'var(--md-on-surface-variant)',
              fontSize: 11,
            }}
          >
            Sorted by listed rate
          </span>
        </div>

        {banks.length === 0 ? (
          <EmptyState message="No bank products are available yet." />
        ) : filtered.length === 0 ? (
          <EmptyState message="No products match your current filters." />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 245px), 1fr))',
              gap: 13,
            }}
          >
            {filtered.map(bank => {
              const rate = Number(bank.interest_rate) || 0
              const emi = estimateEMI(previewAmt, rate, previewTen)
              const isLowest = lowestRate !== null && rate === lowestRate

              return (
                <article
                  key={bank.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                    padding: 18,
                    borderRadius: 20,
                    background: 'var(--md-surface-container)',
                    border: '1px solid var(--md-outline-variant)',
                    transition: 'transform 180ms ease, border-color 180ms ease',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 10,
                      marginBottom: 17,
                    }}
                  >
                    <div
                      style={{
                        width: 43,
                        height: 43,
                        display: 'grid',
                        placeItems: 'center',
                        borderRadius: 14,
                        background: 'var(--md-surface-container-high)',
                        fontSize: 21,
                      }}
                    >
                      {getLoanIcon(bank.loan_type)}
                    </div>

                    {isLowest && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          padding: '5px 8px',
                          borderRadius: 999,
                          background: 'var(--md-secondary-container)',
                          color: 'var(--md-on-secondary-container)',
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      >
                        <CheckCircle2 size={12} />
                        Lowest rate
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      color: 'var(--md-on-surface)',
                      fontSize: 15,
                      fontWeight: 700,
                      lineHeight: 1.4,
                      marginBottom: 5,
                    }}
                  >
                    {bank.name || 'Bank'}
                  </div>

                  <div
                    style={{
                      color: 'var(--md-on-surface-variant)',
                      fontSize: 11,
                      marginBottom: 17,
                    }}
                  >
                    {typeLabel(bank.loan_type)} loan
                  </div>

                  <div
                    style={{
                      padding: '13px 14px',
                      borderRadius: 15,
                      background: 'var(--md-surface-container-high)',
                      marginBottom: 13,
                    }}
                  >
                    <div
                      style={{
                        color: 'var(--md-on-surface-variant)',
                        fontSize: 10,
                        fontWeight: 650,
                        letterSpacing: 0.5,
                        marginBottom: 5,
                      }}
                    >
                      INTEREST RATE
                    </div>

                    <div
                      style={{
                        color: 'var(--md-primary)',
                        fontSize: 26,
                        fontWeight: 750,
                        letterSpacing: -0.7,
                        lineHeight: 1.2,
                      }}
                    >
                      {formatRate(rate)}
                      <span
                        style={{
                          color: 'var(--md-on-surface-variant)',
                          fontSize: 11,
                          fontWeight: 500,
                          letterSpacing: 0,
                          marginLeft: 5,
                        }}
                      >
                        p.a.
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      marginTop: 'auto',
                      marginBottom: 13,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          color: 'var(--md-on-surface-variant)',
                          fontSize: 10,
                          marginBottom: 4,
                        }}
                      >
                        ESTIMATED MONTHLY EMI
                      </div>
                      <div
                        style={{
                          color: 'var(--md-on-surface)',
                          fontSize: 16,
                          fontWeight: 700,
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {fmtINR(emi)}
                      </div>
                    </div>

                    <div
                      style={{
                        color: 'var(--md-on-surface-variant)',
                        fontSize: 10,
                        textAlign: 'right',
                        lineHeight: 1.5,
                      }}
                    >
                      {fmtINR(previewAmt)}
                      <br />
                      {previewTen} months
                    </div>
                  </div>

                  {onRecordLoan && (
                    <button
                      type="button"
                      className="btn btn-cyan btn-sm"
                      onClick={() => onRecordLoan(bank)}
                      style={{
                        width: '100%',
                        justifyContent: 'center',
                        gap: 7,
                      }}
                    >
                      Record this loan
                      <ArrowUpRight size={14} />
                    </button>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </section>

      <section
        style={{
          padding: 20,
          borderRadius: 22,
          background: 'var(--md-surface-container)',
          border: '1px solid var(--md-outline-variant)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            marginBottom: 18,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              flexShrink: 0,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 14,
              background: 'var(--md-primary-container)',
              color: 'var(--md-on-primary-container)',
            }}
          >
            <Calculator size={20} />
          </div>

          <div>
            <h3
              style={{
                color: 'var(--md-on-surface)',
                fontSize: 16,
                fontWeight: 700,
                margin: '1px 0 4px',
              }}
            >
              Compare estimated EMIs
            </h3>
            <p
              style={{
                color: 'var(--md-on-surface-variant)',
                fontSize: 12,
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Change the loan amount and repayment period to compare the
              estimated monthly instalments of matching products.
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
            gap: 20,
            marginBottom: 20,
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                marginBottom: 9,
              }}
            >
              <label
                htmlFor="preview-amount"
                style={{
                  color: 'var(--md-on-surface-variant)',
                  fontSize: 11,
                  fontWeight: 650,
                }}
              >
                LOAN AMOUNT
              </label>
              <strong
                style={{
                  color: 'var(--md-on-surface)',
                  fontSize: 13,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {fmtINR(previewAmt)}
              </strong>
            </div>

            <input
              id="preview-amount"
              type="range"
              min={10000}
              max={5000000}
              step={10000}
              value={previewAmt}
              onChange={event => setPreviewAmt(Number(event.target.value))}
              style={{
                width: '100%',
                accentColor: 'var(--md-primary)',
                cursor: 'pointer',
              }}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                color: 'var(--md-on-surface-variant)',
                fontSize: 10,
              }}
            >
              <span>₹10,000</span>
              <span>₹50 lakh</span>
            </div>
          </div>

          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                marginBottom: 9,
              }}
            >
              <label
                htmlFor="preview-tenure"
                style={{
                  color: 'var(--md-on-surface-variant)',
                  fontSize: 11,
                  fontWeight: 650,
                }}
              >
                REPAYMENT PERIOD
              </label>
              <strong
                style={{
                  color: 'var(--md-on-surface)',
                  fontSize: 13,
                }}
              >
                {previewTen} months
              </strong>
            </div>

            <input
              id="preview-tenure"
              type="range"
              min={6}
              max={120}
              step={6}
              value={previewTen}
              onChange={event => setPreviewTen(Number(event.target.value))}
              style={{
                width: '100%',
                accentColor: 'var(--md-primary)',
                cursor: 'pointer',
              }}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                color: 'var(--md-on-surface-variant)',
                fontSize: 10,
              }}
            >
              <span>6 months</span>
              <span>10 years</span>
            </div>
          </div>
        </div>

        {previewProducts.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))',
              gap: 10,
            }}
          >
            {previewProducts.map((bank, index) => (
              <div
                key={bank.id}
                style={{
                  minWidth: 0,
                  padding: 14,
                  borderRadius: 16,
                  background: 'var(--md-surface-container-high)',
                  border: index === 0
                    ? '1px solid var(--md-primary)'
                    : '1px solid var(--md-outline-variant)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      color: 'var(--md-on-surface)',
                      fontSize: 12,
                      fontWeight: 650,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {bank.name}
                  </span>
                  {index === 0 && (
                    <CheckCircle2
                      size={14}
                      color="var(--md-primary)"
                      style={{ flexShrink: 0 }}
                    />
                  )}
                </div>

                <div
                  style={{
                    color: 'var(--md-primary)',
                    fontSize: 18,
                    fontWeight: 750,
                    fontVariantNumeric: 'tabular-nums',
                    marginBottom: 4,
                  }}
                >
                  {fmtINR(
                    estimateEMI(previewAmt, bank.interest_rate, previewTen)
                  )}
                </div>

                <div
                  style={{
                    color: 'var(--md-on-surface-variant)',
                    fontSize: 10,
                  }}
                >
                  {formatRate(bank.interest_rate)} annual interest
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              color: 'var(--md-on-surface-variant)',
              fontSize: 12,
              padding: 12,
              borderRadius: 13,
              background: 'var(--md-surface-container-high)',
            }}
          >
            <Wallet size={16} />
            Apply filters to see EMI estimates for matching products.
          </div>
        )}

        <p
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 7,
            color: 'var(--md-on-surface-variant)',
            fontSize: 10,
            lineHeight: 1.6,
            margin: '15px 0 0',
          }}
        >
          <ChevronRight size={13} style={{ flexShrink: 0, marginTop: 1 }} />
          These are indicative estimates based on the listed interest rate.
          Actual EMI may vary depending on lender terms, fees and eligibility.
        </p>
      </section>
    </div>
  )
}
