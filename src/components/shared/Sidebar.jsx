import { useAuth } from '../../hooks/useAuthContext'

const Icons = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),

  logbook: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 7h8M8 11h8M8 15h5" />
    </svg>
  ),

  add: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),

  manager: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  ),

  calculator: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8 7h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01" />
    </svg>
  ),

  compare: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M7 3 3 7l4 4" />
      <path d="M3 7h13a4 4 0 0 1 4 4v1" />
      <path d="m17 21 4-4-4-4" />
      <path d="M21 17H8a4 4 0 0 1-4-4v-1" />
    </svg>
  ),

  bank: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="m3 10 9-6 9 6" />
      <path d="M5 10v8M9 10v8M15 10v8M19 10v8" />
      <path d="M3 21h18M4 18h16" />
    </svg>
  ),

  profile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  ),

  beneficiaries: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 21v-2a6 6 0 0 1 12 0v2" />
      <path d="M16 5.5a3 3 0 0 1 0 5.8" />
      <path d="M18 21v-2a6 6 0 0 0-3-5.2" />
    </svg>
  ),

  reports: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M4 19V10M10 19V5M16 19v-7M22 19H2" />
    </svg>
  ),

  logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
    </svg>
  ),
}

const USER_NAV = [
  { id: 'dashboard', icon: Icons.dashboard, label: 'Dashboard' },
  { id: 'logbook', icon: Icons.logbook, label: 'Loan Logbook' },
  { id: 'add-loan', icon: Icons.add, label: 'Add Loan' },
  { id: 'manager', icon: Icons.manager, label: 'Loan Manager' },
  { id: 'emi', icon: Icons.calculator, label: 'EMI Calculator' },
  { id: 'compare', icon: Icons.compare, label: 'Compare Loans' },
  { id: 'banks', icon: Icons.bank, label: 'Bank Loans' },
  { id: 'profile', icon: Icons.profile, label: 'Profile' },
]

const NGO_NAV = [
  { id: 'ngo-dashboard', icon: Icons.dashboard, label: 'NGO Dashboard' },
  { id: 'beneficiaries', icon: Icons.beneficiaries, label: 'Beneficiaries' },
  { id: 'assign-loan', icon: Icons.add, label: 'Assign Loan' },
  { id: 'ngo-manager', icon: Icons.manager, label: 'Loan Manager' },
  { id: 'reports', icon: Icons.reports, label: 'Reports' },
  { id: 'emi', icon: Icons.calculator, label: 'EMI Calculator' },
  { id: 'banks', icon: Icons.bank, label: 'Bank Loans' },
  { id: 'profile', icon: Icons.profile, label: 'Profile' },
]

export default function Sidebar({ page, setPage }) {
  const { profile, signOut } = useAuth()

  const isNGO = profile?.role === 'ngo'
  const navigation = isNGO ? NGO_NAV : USER_NAV

  const userName = profile?.full_name || profile?.email || 'User'
  const userEmail = profile?.email || ''
  const initial = userName[0]?.toUpperCase() || 'U'

  return (
    <aside className="ll-sidebar">
      {/* Brand */}
      <div className="ll-sidebar-brand">
        <button
          type="button"
          className="ll-brand-button"
          onClick={() =>
            setPage(isNGO ? 'ngo-dashboard' : 'dashboard')
          }
        >
          <div className="ll-brand-mark">
            <span />
            <span />
            <span />
          </div>

          <div className="ll-brand-copy">
            <div className="ll-brand-name">LoanLedger</div>
            <div className="ll-brand-subtitle">
              SMART LOAN MANAGEMENT
            </div>
          </div>
        </button>
      </div>

      {/* Role indicator */}
      <div className="ll-role-wrapper">
        <div
          className={`ll-role-indicator ${
            isNGO ? 'll-role-ngo' : 'll-role-user'
          }`}
        >
          <span className="ll-role-dot" />

          {isNGO ? 'NGO WORKSPACE' : 'PERSONAL WORKSPACE'}
        </div>
      </div>

      {/* Navigation */}
      <nav className="ll-sidebar-nav" aria-label="Main navigation">
        <div className="ll-nav-label">WORKSPACE</div>

        <div className="ll-nav-list">
          {navigation.map((item) => {
            const active = page === item.id

            return (
              <button
                key={item.id}
                type="button"
                className={`ll-nav-item ${active ? 'active' : ''} ${
                  isNGO ? 'ngo-mode' : ''
                }`}
                onClick={() => setPage(item.id)}
                aria-current={active ? 'page' : undefined}
              >
                <span className="ll-nav-icon">{item.icon}</span>

                <span className="ll-nav-text">{item.label}</span>

                {active && <span className="ll-nav-active-bar" />}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Account */}
      <div className="ll-sidebar-footer">
        <button
          type="button"
          className={`ll-account ${page === 'profile' ? 'active' : ''}`}
          onClick={() => setPage('profile')}
          title="Open profile"
        >
          <div className="ll-account-avatar">{initial}</div>

          <div className="ll-account-details">
            <div className="ll-account-name">{userName}</div>

            <div className="ll-account-email">
              {userEmail || (isNGO ? 'NGO Account' : 'Personal Account')}
            </div>
          </div>

          <span className="ll-account-arrow">›</span>
        </button>

        <button
          type="button"
          className="ll-signout-button"
          onClick={signOut}
        >
          <span className="ll-signout-icon">{Icons.logout}</span>
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  )
}