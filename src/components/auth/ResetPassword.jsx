
import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [validRecoverySession, setValidRecoverySession] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let mounted = true

    async function checkRecoverySession() {
      try {
        const { data, error: sessionError } =
          await supabase.auth.getSession()

        if (!mounted) return

        if (sessionError || !data.session) {
          setError(
            'This password reset link is invalid or has expired. Please request a new reset link.'
          )
          setValidRecoverySession(false)
        } else {
          setValidRecoverySession(true)
        }
      } catch {
        if (!mounted) return

        setError(
          'Unable to verify this password reset link. Please request a new one.'
        )
        setValidRecoverySession(false)
      } finally {
        if (mounted) setCheckingSession(false)
      }
    }

    checkRecoverySession()

    return () => {
      mounted = false
    }
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (!newPassword) {
      setError('Please enter your new password.')
      return
    }

    if (newPassword.length < 6) {
      setError('Your password must contain at least 6 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('The passwords do not match.')
      return
    }

    if (!validRecoverySession) {
      setError(
        'This password reset link is invalid or has expired. Please request a new reset link.'
      )
      return
    }

    setLoading(true)

    try {
      const { error: supabaseError } =
        await supabase.auth.updateUser({
          password: newPassword,
        })

      if (supabaseError) {
        const code = supabaseError.code || ''
        const message = supabaseError.message || ''
        const lowerMessage = message.toLowerCase()

        if (
          code === 'invalid_operation' ||
          lowerMessage.includes('invalid') ||
          lowerMessage.includes('expired')
        ) {
          setError(
            'This password reset link is invalid or has expired. Please request a new one.'
          )
        } else {
          setError(
            message || 'Unable to update your password. Please try again.'
          )
        }

        return
      }

      setSuccess(
        'Your password has been updated. Redirecting you to sign in...'
      )

      await supabase.auth.signOut()

      window.setTimeout(() => {
        window.location.href = '/'
      }, 1600)
    } catch (err) {
      console.error('Reset password error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function returnToSignIn() {
    window.location.href = '/'
  }

  if (checkingSession) {
    return (
      <div className="reset-page">
        <div className="reset-loading-card">
          <div className="reset-loading-icon">
            <Loader2 size={23} className="reset-spinner" />
          </div>

          <h2>Verifying your link</h2>
          <p>Please wait while we securely verify your password reset link.</p>
        </div>

        <ResetStyles />
      </div>
    )
  }

  if (!validRecoverySession) {
    return (
      <div className="reset-page">
        <div className="reset-card reset-unavailable">
          <div className="reset-brand">
            <div className="reset-brand-icon">
              <KeyRound size={19} />
            </div>
            <span>LoanLedger</span>
          </div>

          <div className="reset-state-icon error">
            <AlertCircle size={27} />
          </div>

          <h1>Reset link unavailable</h1>

          <p className="reset-description">
            {error ||
              'This password reset link is invalid or has expired.'}
          </p>

          <button
            type="button"
            className="reset-primary-button"
            onClick={returnToSignIn}
          >
            <ArrowLeft size={16} />
            Return to sign in
          </button>

          <div className="reset-security-note">
            <ShieldCheck size={15} />
            Your account remains protected.
          </div>
        </div>

        <ResetStyles />
      </div>
    )
  }

  return (
    <div className="reset-page">
      <div className="reset-card">
        <div className="reset-brand">
          <div className="reset-brand-icon">
            <KeyRound size={19} />
          </div>
          <span>LoanLedger</span>
        </div>

        <div className="reset-heading">
          <div className="reset-state-icon">
            <LockKeyhole size={26} />
          </div>

          <div className="reset-eyebrow">
            ACCOUNT SECURITY
          </div>

          <h1>Create a new password</h1>

          <p className="reset-description">
            Choose a strong password to secure your LoanLedger account.
          </p>
        </div>

        {error && (
          <div className="reset-message error" role="alert">
            <AlertCircle size={17} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="reset-message success" role="status">
            <CheckCircle2 size={17} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="reset-field">
            <label htmlFor="new-password">
              New password
            </label>

            <div className="reset-input-wrap">
              <LockKeyhole size={17} />

              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your new password"
                value={newPassword}
                onChange={event => setNewPassword(event.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
                disabled={loading || !!success}
              />

              <button
                type="button"
                className="reset-visibility-button"
                onClick={() => setShowPassword(value => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                disabled={loading || !!success}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            <span className="reset-field-hint">
              Use at least 6 characters.
            </span>
          </div>

          <div className="reset-field">
            <label htmlFor="confirm-password">
              Confirm new password
            </label>

            <div className="reset-input-wrap">
              <LockKeyhole size={17} />

              <input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Enter your password again"
                value={confirmPassword}
                onChange={event => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
                disabled={loading || !!success}
              />

              <button
                type="button"
                className="reset-visibility-button"
                onClick={() =>
                  setShowConfirmPassword(value => !value)
                }
                aria-label={
                  showConfirmPassword ? 'Hide password' : 'Show password'
                }
                disabled={loading || !!success}
              >
                {showConfirmPassword
                  ? <EyeOff size={17} />
                  : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="reset-primary-button"
            disabled={loading || !!success}
          >
            {loading ? (
              <>
                <LoaderCircle size={17} className="reset-spinner" />
                Updating password...
              </>
            ) : (
              <>
                <ShieldCheck size={17} />
                Update password
              </>
            )}
          </button>
        </form>

        <div className="reset-security-note">
          <ShieldCheck size={15} />
          Your password is securely managed by Supabase.
        </div>

        <button
          type="button"
          className="reset-back-button"
          onClick={returnToSignIn}
        >
          <ArrowLeft size={14} />
          Back to sign in
        </button>
      </div>

      <ResetStyles />
    </div>
  )
}

function ResetStyles() {
  return (
    <style>{`
      .reset-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 28px 16px;
        background: var(--md-background);
        color: var(--md-on-surface);
        position: relative;
        overflow: hidden;
        isolation: isolate;
      }

      .reset-page::before,
      .reset-page::after {
        content: '';
        position: absolute;
        width: 360px;
        height: 360px;
        border-radius: 50%;
        filter: blur(90px);
        opacity: .12;
        pointer-events: none;
        z-index: -1;
      }

      .reset-page::before {
        top: -180px;
        left: -150px;
        background: var(--md-primary);
      }

      .reset-page::after {
        right: -160px;
        bottom: -190px;
        background: var(--md-tertiary);
      }

      .reset-card,
      .reset-loading-card {
        width: 100%;
        max-width: 440px;
        padding: 32px;
        border: 1px solid var(--md-outline-variant);
        border-radius: 22px;
        background: var(--md-surface-container-low);
        box-shadow: 0 18px 55px rgba(0, 0, 0, .10);
        animation: reset-enter .35s ease both;
      }

      .reset-brand {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 30px;
        color: var(--md-on-surface);
        font-size: 19px;
        font-weight: 750;
        letter-spacing: -.04em;
      }

      .reset-brand-icon {
        display: grid;
        place-items: center;
        width: 36px;
        height: 36px;
        border-radius: 11px;
        background: var(--md-primary-container);
        color: var(--md-on-primary-container);
      }

      .reset-heading {
        margin-bottom: 24px;
      }

      .reset-state-icon {
        display: grid;
        place-items: center;
        width: 52px;
        height: 52px;
        border-radius: 15px;
        background: var(--md-primary-container);
        color: var(--md-on-primary-container);
        margin-bottom: 20px;
      }

      .reset-state-icon.error {
        background: var(--md-error-container);
        color: var(--md-on-error-container);
        margin: 0 auto 18px;
      }

      .reset-eyebrow {
        color: var(--md-primary);
        font-size: 10px;
        font-weight: 750;
        letter-spacing: .12em;
        margin-bottom: 8px;
      }

      .reset-card h1,
      .reset-loading-card h2 {
        color: var(--md-on-surface);
        font-size: 24px;
        font-weight: 750;
        letter-spacing: -.045em;
        line-height: 1.25;
        margin: 0;
      }

      .reset-description {
        color: var(--md-on-surface-variant);
        font-size: 13px;
        line-height: 1.65;
        margin: 9px 0 0;
      }

      .reset-field {
        margin-bottom: 18px;
      }

      .reset-field label {
        display: block;
        color: var(--md-on-surface);
        font-size: 12px;
        font-weight: 650;
        margin-bottom: 8px;
      }

      .reset-input-wrap {
        display: flex;
        align-items: center;
        gap: 10px;
        height: 47px;
        padding: 0 12px;
        border: 1px solid var(--md-outline-variant);
        border-radius: 11px;
        background: var(--md-surface);
        color: var(--md-on-surface-variant);
        transition: border-color .18s ease, box-shadow .18s ease;
      }

      .reset-input-wrap:focus-within {
        border-color: var(--md-primary);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--md-primary) 13%, transparent);
      }

      .reset-input-wrap input {
        flex: 1;
        min-width: 0;
        height: 100%;
        border: 0;
        outline: 0;
        background: transparent;
        color: var(--md-on-surface);
        font: inherit;
        font-size: 13px;
      }

      .reset-input-wrap input::placeholder {
        color: var(--md-on-surface-variant);
        opacity: .7;
      }

      .reset-visibility-button {
        display: grid;
        place-items: center;
        width: 30px;
        height: 30px;
        flex-shrink: 0;
        border: 0;
        border-radius: 7px;
        background: transparent;
        color: var(--md-on-surface-variant);
        cursor: pointer;
      }

      .reset-visibility-button:hover {
        background: var(--md-surface-container-high);
        color: var(--md-on-surface);
      }

      .reset-visibility-button:disabled {
        opacity: .5;
        cursor: not-allowed;
      }

      .reset-field-hint {
        display: block;
        color: var(--md-on-surface-variant);
        font-size: 10px;
        margin-top: 6px;
      }

      .reset-message {
        display: flex;
        align-items: flex-start;
        gap: 9px;
        padding: 11px 12px;
        border-radius: 10px;
        font-size: 12px;
        line-height: 1.55;
        margin-bottom: 17px;
      }

      .reset-message svg {
        flex-shrink: 0;
        margin-top: 1px;
      }

      .reset-message.error {
        background: var(--md-error-container);
        color: var(--md-on-error-container);
      }

      .reset-message.success {
        background: var(--md-success-container);
        color: var(--md-success);
      }

      .reset-primary-button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 9px;
        width: 100%;
        min-height: 46px;
        margin-top: 8px;
        padding: 0 16px;
        border: 1px solid var(--md-primary);
        border-radius: 11px;
        background: var(--md-primary);
        color: var(--md-on-primary);
        font: inherit;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        transition: opacity .18s ease, transform .18s ease;
      }

      .reset-primary-button:hover:not(:disabled) {
        opacity: .9;
        transform: translateY(-1px);
      }

      .reset-primary-button:disabled {
        opacity: .65;
        cursor: not-allowed;
      }

      .reset-security-note {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        color: var(--md-on-surface-variant);
        font-size: 10px;
        line-height: 1.5;
        margin-top: 22px;
      }

      .reset-security-note svg {
        color: var(--md-primary);
        flex-shrink: 0;
      }

      .reset-back-button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        width: 100%;
        margin-top: 17px;
        padding: 8px;
        border: 0;
        background: transparent;
        color: var(--md-primary);
        font: inherit;
        font-size: 12px;
        font-weight: 650;
        cursor: pointer;
      }

      .reset-back-button:hover {
        text-decoration: underline;
      }

      .reset-unavailable {
        text-align: center;
      }

      .reset-unavailable .reset-brand {
        justify-content: center;
      }

      .reset-unavailable .reset-description {
        margin-bottom: 22px;
      }

      .reset-unavailable .reset-security-note {
        margin-top: 20px;
      }

      .reset-loading-card {
        text-align: center;
      }

      .reset-loading-icon {
        display: grid;
        place-items: center;
        width: 52px;
        height: 52px;
        border-radius: 15px;
        background: var(--md-primary-container);
        color: var(--md-primary);
        margin: 0 auto 18px;
      }

      .reset-loading-card h2 {
        font-size: 19px;
      }

      .reset-loading-card p {
        color: var(--md-on-surface-variant);
        font-size: 12px;
        line-height: 1.6;
        margin: 8px 0 0;
      }

      .reset-spinner {
        animation: reset-spin 1s linear infinite;
      }

      @keyframes reset-spin {
        to { transform: rotate(360deg); }
      }

      @keyframes reset-enter {
        from {
          opacity: 0;
          transform: translateY(9px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @media (max-width: 480px) {
        .reset-card,
        .reset-loading-card {
          padding: 25px 20px;
          border-radius: 18px;
        }

        .reset-card h1 {
          font-size: 21px;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .reset-page *,
        .reset-page *::before,
        .reset-page *::after {
          animation-duration: .01ms !important;
          transition-duration: .01ms !important;
        }
      }
    `}</style>
  )
}
