
import { useAuth } from '../../hooks/useAuthContext'
import ThemeToggle from './ThemeToggle'

const TITLES = {
  dashboard: 'Dashboard',
  logbook: 'Loan Logbook',
  'add-loan': 'Add Loan',
  manager: 'Loan Manager',
  emi: 'EMI Calculator',
  compare: 'Compare Loans',
  banks: 'Bank Loans',
  profile: 'Profile',

  'ngo-dashboard': 'NGO Dashboard',
  beneficiaries: 'Beneficiaries',
  'assign-loan': 'Assign Loan',
  'ngo-manager': 'Loan Manager',
  reports: 'Reports & Analytics',
}

const SUBTITLES = {
  dashboard: 'Your financial overview and active loans',
  logbook: 'Track every loan in one organized workspace',
  'add-loan': 'Add and organize a new loan record',
  manager: 'Manage your loans and repayment progress',
  emi: 'Calculate repayments and plan your finances',
  compare: 'Compare loan options before making a decision',
  banks: 'Explore and compare available bank loan options',
  profile: 'Manage your account and preferences',

  'ngo-dashboard': 'Monitor beneficiaries and loan activity',
  beneficiaries: 'Manage the people your organization supports',
  'assign-loan': 'Create and assign a beneficiary loan record',
  'ngo-manager': 'Track and manage beneficiary repayments',
  reports: 'Understand loan performance and repayment activity',
}

export default function Topbar({ page, setPage, onMenu }) {
  const { profile } = useAuth()

  const title = TITLES[page] || 'LoanLedger'
  const subtitle =
    SUBTITLES[page] || 'Smart loan management platform'

  const displayName =
    profile?.full_name ||
    profile?.email?.split('@')[0] ||
    'User'

  const initial = displayName.charAt(0).toUpperCase()
  const isNGO = profile?.role === 'ngo'

  return (
    <header className="topbar">
      <div className="topbar-left">
        {/* Mobile navigation */}
        <button
          type="button"
          className="topbar-menu-btn"
          onClick={onMenu}
          aria-label="Open navigation"
        >
          <span />
          <span />
          <span />
        </button>

        <div className="topbar-heading">
          <div className="topbar-title-row">
            <div>
              <div className="topbar-eyebrow">
                {isNGO ? 'NGO OPERATIONS' : 'LOAN WORKSPACE'}
              </div>

              <h1>{title}</h1>
            </div>

            <span
              className={`topbar-role-badge ${
                isNGO ? 'ngo' : 'user'
              }`}
            >
              <span className="topbar-role-dot" />

              {isNGO ? 'NGO' : 'PERSONAL'}
            </span>
          </div>

          <p>{subtitle}</p>
        </div>
      </div>

      <div className="topbar-right">
        {/* System status */}
        <div className="topbar-status">
          <span className="topbar-status-dot" />

          <span>System online</span>
        </div>

        <div className="topbar-divider" />

        {/* Theme */}
        <div className="topbar-theme">
          <ThemeToggle />
        </div>

        {/* Profile */}
        <button
          type="button"
          className="topbar-profile"
          onClick={() => setPage('profile')}
          aria-label="Open profile"
        >
          <div className="topbar-avatar">{initial}</div>

          <div className="topbar-profile-info">
            <span className="topbar-profile-name">
              {displayName}
            </span>

            <span className="topbar-profile-role">
              {isNGO ? 'NGO Administrator' : 'Individual User'}
            </span>
          </div>

          <svg
            className="topbar-chevron"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
    </header>
  )
}
