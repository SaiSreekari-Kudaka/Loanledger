
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { statusClass } from '../../lib/utils'

const COLORS = {
  cyan: {
    main: 'var(--ll-primary)',
    soft: 'var(--ll-primary-soft)',
    border: 'var(--ll-primary-border)',
  },
  purple: {
    main: 'var(--md-tertiary)',
    soft: 'var(--md-tertiary-container)',
    border: 'var(--border-p)',
  },
  green: {
    main: 'var(--ll-success)',
    soft: 'var(--ll-success-container)',
    border: 'rgba(66, 185, 148, 0.28)',
  },
  amber: {
    main: 'var(--ll-warning)',
    soft: 'var(--ll-warning-container)',
    border: 'rgba(229, 168, 78, 0.28)',
  },
  red: {
    main: 'var(--ll-error)',
    soft: 'var(--ll-error-container)',
    border: 'rgba(228, 119, 119, 0.28)',
  },
}

const surfaceStyle = {
  background: 'var(--md-surface)',
  color: 'var(--md-on-surface)',
  border: '1px solid var(--md-outline-variant)',
  borderRadius: 14,
}

/* -------------------------------------------------------------------------- */
/* LOADING SCREEN                                                             */
/* -------------------------------------------------------------------------- */

export function LoadingScreen() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        minHeight: 220,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        color: 'var(--md-on-surface-variant)',
      }}
    >
      <div className="spinner" />
      <span
        style={{
          fontSize: 13,
          fontWeight: 550,
          letterSpacing: '0.01em',
        }}
      >
        Loading your information…
      </span>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* METRIC CARD                                                                */
/* -------------------------------------------------------------------------- */

export function MetricCard({
  label,
  value,
  sub,
  color = 'cyan',
  icon,
  className = '',
}) {
  const accent = COLORS[color] || COLORS.cyan

  return (
    <div
      className={`metric-card ${className}`.trim()}
      style={{
        ...surfaceStyle,
        position: 'relative',
        minWidth: 0,
        minHeight: 142,
        padding: '20px 21px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 17,
        overflow: 'hidden',
        borderColor: 'var(--md-outline-variant)',
        boxShadow: 'var(--ll-shadow-card)',
        transition: 'border-color 180ms ease, transform 180ms ease',
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
            fontSize: 12,
            lineHeight: 1.4,
            fontWeight: 650,
            letterSpacing: '0.025em',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </span>

        {icon && (
          <span
            aria-hidden="true"
            style={{
              width: 36,
              height: 36,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 10,
              color: accent.main,
              background: accent.soft,
              border: `1px solid ${accent.border}`,
              fontSize: 17,
            }}
          >
            {icon}
          </span>
        )}
      </div>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            color: 'var(--md-on-surface)',
            fontSize: 'clamp(21px, 2vw, 29px)',
            lineHeight: 1.2,
            fontWeight: 700,
            letterSpacing: '-0.045em',
            overflowWrap: 'anywhere',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value ?? '—'}
        </div>

        {sub && (
          <div
            style={{
              color: 'var(--md-on-surface-variant)',
              fontSize: 12,
              lineHeight: 1.5,
              marginTop: 7,
            }}
          >
            {sub}
          </div>
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* SECTION TITLE                                                              */
/* -------------------------------------------------------------------------- */

export function SectionTitle({ children, action }) {
  return (
    <div
      style={{
        width: '100%',
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 18,
      }}
    >
      <div
        className="section-title"
        style={{
          minWidth: 0,
          margin: 0,
          color: 'var(--md-on-surface)',
          fontSize: 17,
          fontWeight: 700,
          lineHeight: 1.35,
          letterSpacing: '-0.025em',
        }}
      >
        {children}
      </div>

      {action && (
        <div style={{ flexShrink: 0 }}>
          {action}
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* MODAL                                                                      */
/* -------------------------------------------------------------------------- */

export function Modal({
  open,
  onClose,
  title,
  children,
  width = 520,
}) {
  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.()
        }
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        overflowY: 'auto',
        background: 'rgba(5, 12, 20, 0.66)',
        backdropFilter: 'blur(7px)',
        WebkitBackdropFilter: 'blur(7px)',
      }}
    >
      <div
        className="modal-box"
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Dialog'}
        style={{
          width: '100%',
          maxWidth: width,
          maxHeight: 'min(88vh, 820px)',
          overflowY: 'auto',
          padding: '26px',
          background: 'var(--md-surface)',
          color: 'var(--md-on-surface)',
          border: '1px solid var(--md-outline-variant)',
          borderRadius: 16,
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.28)',
          animation: 'fadeUp 180ms ease both',
        }}
      >
        {title && (
          <div
            style={{
              marginBottom: 22,
              paddingBottom: 17,
              borderBottom: '1px solid var(--md-outline-variant)',
            }}
          >
            <h2
              style={{
                margin: 0,
                color: 'var(--md-on-surface)',
                fontSize: 20,
                fontWeight: 700,
                lineHeight: 1.35,
                letterSpacing: '-0.035em',
              }}
            >
              {title}
            </h2>
          </div>
        )}

        {children}
      </div>
    </div>,
    document.body
  )
}

/* -------------------------------------------------------------------------- */
/* FORM FIELD                                                                 */
/* -------------------------------------------------------------------------- */

export function Field({ label, children }) {
  return (
    <div
      style={{
        minWidth: 0,
        width: '100%',
        marginBottom: 17,
      }}
    >
      <label
        className="input-label"
        style={{
          display: 'block',
          marginBottom: 7,
          color: 'var(--md-on-surface-variant)',
          fontSize: 12,
          fontWeight: 650,
          lineHeight: 1.45,
          letterSpacing: '0.01em',
        }}
      >
        {label}
      </label>

      {children}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* STATUS BADGE                                                               */
/* -------------------------------------------------------------------------- */

export function StatusBadge({ status }) {
  const normalized = String(status || 'unknown').toLowerCase()

  const semanticColor =
    normalized.includes('paid') ||
    normalized.includes('active') ||
    normalized.includes('approved') ||
    normalized.includes('completed')
      ? COLORS.green
      : normalized.includes('pending') ||
        normalized.includes('progress')
        ? COLORS.amber
        : normalized.includes('default') ||
          normalized.includes('overdue') ||
          normalized.includes('rejected')
          ? COLORS.red
          : COLORS.cyan

  return (
    <span
      className={statusClass(status)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 'fit-content',
        maxWidth: '100%',
        minHeight: 25,
        padding: '4px 10px',
        borderRadius: 999,
        background: semanticColor.soft,
        border: `1px solid ${semanticColor.border}`,
        color: semanticColor.main,
        fontSize: 11,
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: '0.015em',
        whiteSpace: 'nowrap',
      }}
    >
      {status || 'Unknown'}
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/* PROGRESS BAR                                                               */
/* -------------------------------------------------------------------------- */

export function ProgressBar({
  value,
  color = 'cyan',
  height = 8,
}) {
  const accent = COLORS[color] || COLORS.cyan

  const numericValue = Number(value)
  const safeValue = Number.isFinite(numericValue)
    ? Math.min(100, Math.max(0, numericValue))
    : 0

  return (
    <div
      className="progress-track"
      role="progressbar"
      aria-valuenow={Math.round(safeValue)}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{
        width: '100%',
        height,
        overflow: 'hidden',
        borderRadius: 999,
        background: 'var(--md-surface-container-high)',
      }}
    >
      <div
        className="progress-fill"
        style={{
          width: `${safeValue}%`,
          height: '100%',
          borderRadius: 999,
          background: accent.main,
          transition: 'width 300ms ease',
        }}
      />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* EMPTY STATE                                                                */
/* -------------------------------------------------------------------------- */

export function EmptyState({
  message = 'No data yet',
  action,
}) {
  return (
    <div
      style={{
        width: '100%',
        minHeight: 190,
        padding: '34px 22px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        border: '1px dashed var(--md-outline-variant)',
        borderRadius: 14,
        background: 'var(--md-surface-container-low)',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 48,
          height: 48,
          marginBottom: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 14,
          color: 'var(--md-on-surface-variant)',
          background: 'var(--md-surface-container-high)',
          fontSize: 23,
        }}
      >
        ◎
      </div>

      <div
        style={{
          color: 'var(--md-on-surface)',
          fontSize: 14,
          fontWeight: 650,
          lineHeight: 1.45,
        }}
      >
        {message}
      </div>

      {action && (
        <div style={{ marginTop: 17 }}>
          {action}
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* TOAST                                                                      */
/* -------------------------------------------------------------------------- */

export function Toast({
  message,
  type = 'success',
  onClose,
}) {
  const accent =
    type === 'error'
      ? COLORS.red
      : type === 'info'
        ? COLORS.cyan
        : COLORS.green

  const icon =
    type === 'error'
      ? '!'
      : type === 'info'
        ? 'i'
        : '✓'

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      style={{
        position: 'fixed',
        right: 'max(20px, env(safe-area-inset-right))',
        bottom: 'max(20px, env(safe-area-inset-bottom))',
        zIndex: 2000,
        width: 'min(420px, calc(100vw - 40px))',
        minHeight: 58,
        padding: '13px 15px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        color: 'var(--md-on-surface)',
        background: 'var(--md-surface)',
        border: `1px solid ${accent.border}`,
        borderLeft: `3px solid ${accent.main}`,
        borderRadius: 12,
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.20)',
        animation: 'fadeUp 180ms ease both',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 29,
          height: 29,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 9,
          color: accent.main,
          background: accent.soft,
          fontSize: 14,
          fontWeight: 800,
        }}
      >
        {icon}
      </span>

      <span
        style={{
          flex: 1,
          minWidth: 0,
          color: 'var(--md-on-surface)',
          fontSize: 13,
          fontWeight: 550,
          lineHeight: 1.5,
          overflowWrap: 'anywhere',
        }}
      >
        {message}
      </span>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss notification"
          style={{
            width: 30,
            height: 30,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 0,
            borderRadius: 8,
            background: 'transparent',
            color: 'var(--md-on-surface-variant)',
            cursor: 'pointer',
            fontSize: 19,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* CONFIRM DIALOG                                                             */
/* -------------------------------------------------------------------------- */

export function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm delete',
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      width={420}
    >
      <p
        style={{
          margin: '0 0 25px',
          color: 'var(--md-on-surface-variant)',
          fontSize: 14,
          lineHeight: 1.7,
        }}
      >
        {message}
      </p>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onCancel}
          style={{
            minWidth: 100,
            justifyContent: 'center',
          }}
        >
          Cancel
        </button>

        <button
          type="button"
          className="btn btn-danger"
          onClick={onConfirm}
          style={{
            minWidth: 140,
            justifyContent: 'center',
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
