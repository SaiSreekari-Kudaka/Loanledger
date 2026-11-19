
import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
  Building2,
  Landmark,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuthContext'

export default function AuthPage({ onBack }) {
  const { signIn, signUp, resetPassword } = useAuth()

  const [mode, setMode] = useState('login')
  const [role, setRole] = useState('user')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  function clearMessages() {
    setError('')
    setInfo('')
  }

  function changeMode(nextMode) {
    setMode(nextMode)
    clearMessages()
    setShowPassword(false)
  }

  function friendlyError(e) {
    const code = e?.code || ''
    const msg = (e?.message || '').toLowerCase()

    if (
      code === 'over_email_send_rate_limit' ||
      msg.includes('email rate limit')
    ) {
      return 'Too many emails have been sent. Please wait a while before trying again.'
    }

    if (msg.includes('email not confirmed')) {
      return 'Your email is not confirmed yet. Check your inbox for the confirmation link, then sign in.'
    }

    if (msg === 'invalid login credentials') {
      return 'Invalid email or password. If you just registered, confirm your email first.'
    }

    if (msg.includes('user already registered')) {
      return 'An account with this email already exists. Try signing in instead.'
    }

    if (msg.includes('password should be')) {
      return 'Your password does not meet the required security rules.'
    }

    return e?.message || 'Something went wrong. Please try again.'
  }

  async function handleSubmit(event) {
    event?.preventDefault()
    clearMessages()

    const cleanEmail = email.trim()

    if (!cleanEmail) {
      setError('Please enter your email address.')
      return
    }

    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your full name.')
      return
    }

    if (mode !== 'forgot' && !pass) {
      setError('Please enter your password.')
      return
    }

    if (mode !== 'forgot' && pass.length < 6) {
      setError('Your password must contain at least 6 characters.')
      return
    }

    setLoading(true)

    try {
      if (mode === 'forgot') {
        const { error: authError } = await resetPassword(cleanEmail)

        if (authError) {
          setError(friendlyError(authError))
        } else {
          setInfo('Password reset email sent. Check your inbox for the reset link.')
        }

        return
      }

      if (mode === 'signup') {
        const { data, error: authError } = await signUp(
          cleanEmail,
          pass,
          name.trim(),
          role
        )

        if (authError) {
          setError(friendlyError(authError))
          return
        }

        // When email confirmation is disabled, Supabase creates
        // an active session and the auth listener handles navigation.
        if (data?.session) return

        setInfo('Account created! Check your email to confirm your account, then sign in.')
        return
      }

      const { error: authError } = await signIn(cleanEmail, pass)

      if (authError) {
        setError(friendlyError(authError))
      }
    } catch (err) {
      console.error('Authentication error:', err)
      setError(friendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-background-glow auth-glow-one" />
      <div className="auth-background-glow auth-glow-two" />
      <div className="auth-background-grid" />

      <div className="auth-layout">
        <section className="auth-intro">
          <button
            type="button"
            className="auth-brand"
            onClick={onBack || (() => {})}
            disabled={!onBack}
          >
            <span className="auth-brand-icon">
              <Landmark size={21} />
            </span>
            <span>LoanLedger</span>
          </button>

          <div className="auth-intro-content">
            <div className="auth-intro-eyebrow">
              <span className="auth-eyebrow-dot" />
              SMARTER LOAN MANAGEMENT
            </div>

            <h1>
              Take control of
              <br />
              your <span>financial journey.</span>
            </h1>

            <p>
              Keep your loans organized, understand your repayments
              and stay on top of every financial commitment.
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature">
                <span className="auth-feature-icon">
                  <CalculatorIcon />
                </span>
                <div>
                  <strong>Understand your loans</strong>
                  <span>Calculate EMIs and compare loan options.</span>
                </div>
              </div>

              <div className="auth-feature">
                <span className="auth-feature-icon">
                  <ShieldCheck size={19} />
                </span>
                <div>
                  <strong>Track every repayment</strong>
                  <span>Keep clear records of payments and balances.</span>
                </div>
              </div>

              <div className="auth-feature">
                <span className="auth-feature-icon">
                  <Building2 size={19} />
                </span>
                <div>
                  <strong>Support through NGOs</strong>
                  <span>Help manage and verify beneficiary repayments.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-intro-footer">
            <ShieldCheck size={15} />
            Built to make loan management clearer and simpler.
          </div>
        </section>

        <section className="auth-form-section">
          <div className="auth-card">
            {onBack && (
              <button
                type="button"
                className="auth-back-button"
                onClick={onBack}
              >
                <ArrowLeft size={15} />
                Back to home
              </button>
            )}

            <div className="auth-mobile-brand">
              <span className="auth-brand-icon">
                <Landmark size={20} />
              </span>
              <span>LoanLedger</span>
            </div>

            <div className="auth-heading">
              <div className="auth-heading-icon">
                {mode === 'forgot' ? (
                  <LockKeyhole size={22} />
                ) : (
                  <UserRound size={22} />
                )}
              </div>

              <div className="auth-heading-eyebrow">
                {mode === 'login'
                  ? 'WELCOME BACK'
                  : mode === 'signup'
                    ? 'GET STARTED'
                    : 'ACCOUNT RECOVERY'}
              </div>

              <h2>
                {mode === 'login'
                  ? 'Sign in to your account'
                  : mode === 'signup'
                    ? 'Create your account'
                    : 'Reset your password'}
              </h2>

              <p>
                {mode === 'login'
                  ? 'Enter your details to continue to LoanLedger.'
                  : mode === 'signup'
                    ? 'Create an account to start managing loans.'
                    : 'Enter your email and we will send you a reset link.'}
              </p>
            </div>

            {mode !== 'forgot' && (
              <div className="auth-mode-switch" role="tablist" aria-label="Authentication mode">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'login'}
                  className={mode === 'login' ? 'active' : ''}
                  onClick={() => changeMode('login')}
                >
                  Sign in
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'signup'}
                  className={mode === 'signup' ? 'active' : ''}
                  onClick={() => changeMode('signup')}
                >
                  Create account
                </button>
              </div>
            )}

            {error && (
              <div className="auth-message error" role="alert">
                <AlertCircle size={17} />
                <span>{error}</span>
              </div>
            )}

            {info && (
              <div className="auth-message success" role="status">
                <CheckCircle2 size={17} />
                <span>{info}</span>
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <>
                  <div className="auth-field">
                    <label htmlFor="auth-name">Full name</label>
                    <div className="auth-input-wrap">
                      <UserRound size={17} />
                      <input
                        id="auth-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={event => setName(event.target.value)}
                        autoComplete="name"
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-field">
                    <label>Account type</label>

                    <div className="auth-role-options">
                      <button
                        type="button"
                        className={`auth-role-option ${role === 'user' ? 'selected' : ''}`}
                        onClick={() => setRole('user')}
                        aria-pressed={role === 'user'}
                        disabled={loading}
                      >
                        <span className="auth-role-icon">
                          <UserRound size={19} />
                        </span>
                        <span className="auth-role-text">
                          <strong>Individual</strong>
                          <small>Manage personal loans</small>
                        </span>
                        <span className="auth-role-radio" />
                      </button>

                      <button
                        type="button"
                        className={`auth-role-option ${role === 'ngo' ? 'selected' : ''}`}
                        onClick={() => setRole('ngo')}
                        aria-pressed={role === 'ngo'}
                        disabled={loading}
                      >
                        <span className="auth-role-icon">
                          <Building2 size={19} />
                        </span>
                        <span className="auth-role-text">
                          <strong>NGO admin</strong>
                          <small>Manage beneficiaries</small>
                        </span>
                        <span className="auth-role-radio" />
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div className="auth-field">
                <label htmlFor="auth-email">Email address</label>
                <div className="auth-input-wrap">
                  <Mail size={17} />
                  <input
                    id="auth-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={event => setEmail(event.target.value)}
                    autoComplete="email"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div className="auth-field">
                  <div className="auth-label-row">
                    <label htmlFor="auth-password">Password</label>

                    {mode === 'login' && (
                      <button
                        type="button"
                        className="auth-text-button"
                        onClick={() => changeMode('forgot')}
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>

                  <div className="auth-input-wrap">
                    <LockKeyhole size={17} />
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={pass}
                      onChange={event => setPass(event.target.value)}
                      autoComplete={
                        mode === 'login' ? 'current-password' : 'new-password'
                      }
                      minLength={6}
                      disabled={loading}
                      required
                    />

                    <button
                      type="button"
                      className="auth-visibility-button"
                      onClick={() => setShowPassword(value => !value)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      disabled={loading}
                    >
                      {showPassword
                        ? <EyeOff size={17} />
                        : <Eye size={17} />}
                    </button>
                  </div>

                  {mode === 'signup' && (
                    <span className="auth-field-hint">
                      Use at least 6 characters.
                    </span>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="auth-submit-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={17} className="auth-spinner" />
                    Please wait...
                  </>
                ) : (
                  <>
                    {mode === 'login'
                      ? 'Sign in'
                      : mode === 'signup'
                        ? 'Create account'
                        : 'Send reset link'}
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            {mode === 'forgot' && (
              <button
                type="button"
                className="auth-return-button"
                onClick={() => changeMode('login')}
              >
                <ArrowLeft size={15} />
                Back to sign in
              </button>
            )}

            {mode === 'login' && (
              <p className="auth-bottom-text">
                New to LoanLedger?{' '}
                <button
                  type="button"
                  onClick={() => changeMode('signup')}
                >
                  Create an account
                </button>
              </p>
            )}

            {mode === 'signup' && (
              <p className="auth-bottom-text">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => changeMode('login')}
                >
                  Sign in
                </button>
              </p>
            )}

            <div className="auth-security-footer">
              <ShieldCheck size={14} />
              Your account information is securely managed.
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: stretch;
          justify-content: center;
          position: relative;
          isolation: isolate;
          overflow: hidden;
          padding: 34px;
          background: var(--md-background);
          color: var(--md-on-surface);
        }

        .auth-background-glow {
          position: absolute;
          z-index: -1;
          width: 390px;
          height: 390px;
          border-radius: 50%;
          filter: blur(100px);
          opacity: .11;
          pointer-events: none;
        }

        .auth-glow-one {
          top: -190px;
          left: -130px;
          background: var(--md-primary);
        }

        .auth-glow-two {
          right: -170px;
          bottom: -180px;
          background: var(--md-tertiary);
        }

        .auth-background-grid {
          position: absolute;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          opacity: .12;
          background-image:
            linear-gradient(var(--md-outline-variant) 1px, transparent 1px),
            linear-gradient(90deg, var(--md-outline-variant) 1px, transparent 1px);
          background-size: 44px 44px;
          mask-image: linear-gradient(to bottom right, black, transparent 75%);
        }

        .auth-layout {
          width: 100%;
          max-width: 1120px;
          min-height: min(760px, calc(100vh - 68px));
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(390px, .9fr);
          overflow: hidden;
          border: 1px solid var(--md-outline-variant);
          border-radius: 25px;
          background: var(--md-surface-container-low);
          box-shadow: 0 20px 65px rgba(0, 0, 0, .12);
          animation: auth-enter .35s ease both;
        }

        .auth-intro {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-width: 0;
          padding: 42px;
          background: var(--md-surface-container);
          border-right: 1px solid var(--md-outline-variant);
        }

        .auth-brand {
          display: inline-flex;
          align-items: center;
          gap: 11px;
          width: fit-content;
          padding: 0;
          border: 0;
          background: transparent;
          color: var(--md-on-surface);
          font: inherit;
          font-size: 21px;
          font-weight: 800;
          letter-spacing: -.045em;
        }

        .auth-brand:disabled {
          cursor: default;
        }

        .auth-brand-icon {
          display: grid;
          place-items: center;
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          border-radius: 12px;
          background: var(--md-primary-container);
          color: var(--md-on-primary-container);
        }

        .auth-intro-content {
          max-width: 450px;
          padding: 42px 0;
        }

        .auth-intro-eyebrow,
        .auth-heading-eyebrow {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--md-primary);
          font-size: 10px;
          font-weight: 750;
          letter-spacing: .13em;
        }

        .auth-eyebrow-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--md-primary);
          box-shadow: 0 0 0 4px var(--md-primary-container);
        }

        .auth-intro-content h1 {
          margin: 22px 0 15px;
          color: var(--md-on-surface);
          font-size: clamp(35px, 4.2vw, 52px);
          font-weight: 800;
          letter-spacing: -.065em;
          line-height: 1.1;
        }

        .auth-intro-content h1 span {
          color: var(--md-primary);
        }

        .auth-intro-content > p {
          max-width: 390px;
          color: var(--md-on-surface-variant);
          font-size: 14px;
          line-height: 1.8;
          margin: 0;
        }

        .auth-feature-list {
          display: grid;
          gap: 20px;
          margin-top: 38px;
        }

        .auth-feature {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .auth-feature-icon {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          border: 1px solid var(--md-outline-variant);
          border-radius: 12px;
          background: var(--md-surface);
          color: var(--md-primary);
        }

        .auth-feature > div {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .auth-feature strong {
          color: var(--md-on-surface);
          font-size: 12px;
          font-weight: 700;
        }

        .auth-feature span:not(.auth-feature-icon) {
          color: var(--md-on-surface-variant);
          font-size: 11px;
          line-height: 1.5;
        }

        .auth-intro-footer {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--md-on-surface-variant);
          font-size: 11px;
        }

        .auth-intro-footer svg {
          color: var(--md-primary);
          flex-shrink: 0;
        }

        .auth-form-section {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 0;
          padding: 40px;
          background: var(--md-surface-container-low);
        }

        .auth-card {
          width: 100%;
          max-width: 390px;
        }

        .auth-back-button,
        .auth-return-button {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 0;
          border: 0;
          background: transparent;
          color: var(--md-on-surface-variant);
          font: inherit;
          font-size: 12px;
          cursor: pointer;
        }

        .auth-back-button {
          margin-bottom: 25px;
        }

        .auth-back-button:hover,
        .auth-return-button:hover {
          color: var(--md-primary);
        }

        .auth-mobile-brand {
          display: none;
        }

        .auth-heading {
          margin-bottom: 22px;
        }

        .auth-heading-icon {
          display: grid;
          place-items: center;
          width: 46px;
          height: 46px;
          border-radius: 13px;
          background: var(--md-primary-container);
          color: var(--md-on-primary-container);
          margin-bottom: 19px;
        }

        .auth-heading-eyebrow {
          margin-bottom: 8px;
        }

        .auth-heading h2 {
          color: var(--md-on-surface);
          font-size: 25px;
          font-weight: 800;
          letter-spacing: -.045em;
          line-height: 1.25;
          margin: 0;
        }

        .auth-heading p {
          color: var(--md-on-surface-variant);
          font-size: 12px;
          line-height: 1.65;
          margin: 8px 0 0;
        }

        .auth-mode-switch {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px;
          padding: 4px;
          border: 1px solid var(--md-outline-variant);
          border-radius: 11px;
          background: var(--md-surface-container);
          margin-bottom: 22px;
        }

        .auth-mode-switch button {
          min-height: 37px;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: var(--md-on-surface-variant);
          font: inherit;
          font-size: 12px;
          font-weight: 650;
          cursor: pointer;
          transition: background .18s ease, color .18s ease;
        }

        .auth-mode-switch button.active {
          background: var(--md-primary);
          color: var(--md-on-primary);
          box-shadow: 0 2px 6px rgba(0, 0, 0, .10);
        }

        .auth-message {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          padding: 11px 12px;
          border-radius: 10px;
          font-size: 11px;
          line-height: 1.55;
          margin-bottom: 16px;
        }

        .auth-message svg {
          flex-shrink: 0;
          margin-top: 1px;
        }

        .auth-message.error {
          background: var(--md-error-container);
          color: var(--md-on-error-container);
        }

        .auth-message.success {
          background: var(--md-success-container);
          color: var(--md-success);
        }

        .auth-form {
          display: grid;
          gap: 16px;
        }

        .auth-field {
          min-width: 0;
        }

        .auth-field label,
        .auth-label-row label {
          display: block;
          color: var(--md-on-surface);
          font-size: 11px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .auth-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .auth-text-button {
          padding: 0;
          border: 0;
          background: transparent;
          color: var(--md-primary);
          font: inherit;
          font-size: 11px;
          font-weight: 650;
          cursor: pointer;
        }

        .auth-text-button:hover {
          text-decoration: underline;
        }

        .auth-input-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          height: 46px;
          padding: 0 12px;
          border: 1px solid var(--md-outline-variant);
          border-radius: 10px;
          background: var(--md-surface);
          color: var(--md-on-surface-variant);
          transition: border-color .18s ease, box-shadow .18s ease;
        }

        .auth-input-wrap:focus-within {
          border-color: var(--md-primary);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--md-primary) 13%, transparent);
        }

        .auth-input-wrap > svg {
          flex-shrink: 0;
        }

        .auth-input-wrap input {
          width: 100%;
          min-width: 0;
          height: 100%;
          padding: 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: var(--md-on-surface);
          font: inherit;
          font-size: 12px;
        }

        .auth-input-wrap input::placeholder {
          color: var(--md-on-surface-variant);
          opacity: .7;
        }

        .auth-visibility-button {
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

        .auth-visibility-button:hover {
          background: var(--md-surface-container-high);
          color: var(--md-on-surface);
        }

        .auth-visibility-button:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        .auth-field-hint {
          display: block;
          color: var(--md-on-surface-variant);
          font-size: 10px;
          margin-top: 6px;
        }

        .auth-role-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 9px;
        }

        .auth-role-option {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 0;
          padding: 11px 9px;
          border: 1px solid var(--md-outline-variant);
          border-radius: 10px;
          background: var(--md-surface);
          color: var(--md-on-surface);
          text-align: left;
          cursor: pointer;
          transition: border-color .18s ease, background .18s ease;
        }

        .auth-role-option.selected {
          border-color: var(--md-primary);
          background: var(--md-primary-container);
          color: var(--md-on-primary-container);
        }

        .auth-role-option:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        .auth-role-icon {
          display: grid;
          place-items: center;
          width: 32px;
          height: 32px;
          flex-shrink: 0;
          border-radius: 9px;
          background: var(--md-surface-container-high);
          color: var(--md-primary);
        }

        .auth-role-text {
          display: flex;
          flex-direction: column;
          gap: 3px;
          flex: 1;
          min-width: 0;
        }

        .auth-role-text strong {
          font-size: 10px;
          font-weight: 750;
        }

        .auth-role-text small {
          color: var(--md-on-surface-variant);
          font-size: 9px;
          line-height: 1.3;
        }

        .auth-role-radio {
          width: 12px;
          height: 12px;
          flex-shrink: 0;
          border: 1.5px solid var(--md-outline);
          border-radius: 50%;
        }

        .auth-role-option.selected .auth-role-radio {
          border: 4px solid var(--md-primary);
          background: var(--md-surface);
        }

        .auth-submit-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          width: 100%;
          min-height: 46px;
          margin-top: 4px;
          padding: 0 16px;
          border: 1px solid var(--md-primary);
          border-radius: 10px;
          background: var(--md-primary);
          color: var(--md-on-primary);
          font: inherit;
          font-size: 12px;
          font-weight: 750;
          cursor: pointer;
          transition: opacity .18s ease, transform .18s ease;
        }

        .auth-submit-button:hover:not(:disabled) {
          opacity: .9;
          transform: translateY(-1px);
        }

        .auth-submit-button:disabled {
          opacity: .65;
          cursor: not-allowed;
        }

        .auth-spinner {
          animation: auth-spin 1s linear infinite;
        }

        .auth-bottom-text {
          color: var(--md-on-surface-variant);
          font-size: 11px;
          text-align: center;
          margin: 20px 0 0;
        }

        .auth-bottom-text button {
          padding: 0;
          border: 0;
          background: transparent;
          color: var(--md-primary);
          font: inherit;
          font-weight: 750;
          cursor: pointer;
        }

        .auth-bottom-text button:hover {
          text-decoration: underline;
        }

        .auth-return-button {
          display: flex;
          justify-content: center;
          width: 100%;
          margin-top: 18px;
          color: var(--md-primary);
          font-weight: 650;
        }

        .auth-security-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding-top: 19px;
          margin-top: 20px;
          border-top: 1px solid var(--md-outline-variant);
          color: var(--md-on-surface-variant);
          font-size: 10px;
        }

        .auth-security-footer svg {
          color: var(--md-primary);
          flex-shrink: 0;
        }

        @keyframes auth-spin {
          to { transform: rotate(360deg); }
        }

        @keyframes auth-enter {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 900px) {
          .auth-page {
            padding: 20px;
          }

          .auth-layout {
            grid-template-columns: minmax(0, 1fr) minmax(350px, .95fr);
            min-height: calc(100vh - 40px);
          }

          .auth-intro {
            padding: 30px;
          }

          .auth-form-section {
            padding: 28px;
          }

          .auth-intro-content h1 {
            font-size: 38px;
          }
        }

        @media (max-width: 700px) {
          .auth-page {
            padding: 14px;
            align-items: center;
          }

          .auth-layout {
            display: block;
            min-height: 0;
            max-width: 470px;
            border-radius: 20px;
          }

          .auth-intro {
            display: none;
          }

          .auth-form-section {
            padding: 25px 22px;
          }

          .auth-mobile-brand {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 27px;
            color: var(--md-on-surface);
            font-size: 19px;
            font-weight: 800;
            letter-spacing: -.04em;
          }

          .auth-mobile-brand .auth-brand-icon {
            width: 36px;
            height: 36px;
          }

          .auth-back-button {
            margin-bottom: 20px;
          }
        }

        @media (max-width: 380px) {
          .auth-form-section {
            padding: 22px 16px;
          }

          .auth-role-options {
            grid-template-columns: 1fr;
          }

          .auth-heading h2 {
            font-size: 22px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .auth-page *,
          .auth-page *::before,
          .auth-page *::after {
            animation-duration: .01ms !important;
            transition-duration: .01ms !important;
          }
        }
      `}</style>
    </main>
  )
}

function CalculatorIcon() {
  return <LockKeyhole size={19} />
}
