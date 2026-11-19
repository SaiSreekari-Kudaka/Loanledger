
import { useState } from 'react'
import { useAuth } from './hooks/useAuthContext'

import AuthPage from './components/auth/AuthPage'
import LandingPage from './components/auth/LandingPage'
import ResetPassword from './components/auth/ResetPassword'

import Sidebar from './components/shared/Sidebar'
import Topbar from './components/shared/Topbar'
import { LoadingScreen } from './components/shared/UI'

// User pages
import UserDashboard from './components/user/UserDashboard'
import LoanLogbook from './components/user/LoanLogbook'
import AddLoan from './components/user/AddLoan'
import LoanManager from './components/user/LoanManager'
import EMICalculator from './components/user/EMICalculator'
import CompareLoans from './components/user/CompareLoans'
import BanksPage from './components/user/BanksPage'
import Profile from './components/user/Profile'

// NGO pages
import NGODashboard from './components/ngo/NGODashboard'
import {
  Beneficiaries,
  AssignLoan,
  NGOLoanManager,
  Reports,
} from './components/ngo/NGOPages'

export default function App() {
  const { user, profile, loading } = useAuth()

  const [page, setPage] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [loanSeed, setLoanSeed] = useState(null)

  const resetPasswordPath =
    window.location.pathname === '/reset-password'

  if (resetPasswordPath) {
    return <ResetPassword />
  }

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return showAuth ? (
      <AuthPage onBack={() => setShowAuth(false)} />
    ) : (
      <LandingPage onGetStarted={() => setShowAuth(true)} />
    )
  }

  const defaultPage =
    profile?.role === 'ngo'
      ? 'ngo-dashboard'
      : 'dashboard'

  const activePage = page || defaultPage

  function goTo(newPage) {
    setPage(newPage)
    setMenuOpen(false)
  }

  function recordBankLoan(bank) {
    setLoanSeed(bank)
    goTo('add-loan')
  }

  function renderPage() {
    switch (activePage) {
      // ==============================
      // USER PAGES
      // ==============================

      case 'dashboard':
        return <UserDashboard />

      case 'logbook':
        return <LoanLogbook />

      case 'add-loan':
        return (
          <AddLoan
            setPage={goTo}
            seed={loanSeed}
            clearSeed={() => setLoanSeed(null)}
          />
        )

      case 'manager':
        return <LoanManager />

      case 'emi':
        return <EMICalculator />

      case 'compare':
        return <CompareLoans onRecordLoan={recordBankLoan} />

      case 'banks':
        return <BanksPage onRecordLoan={recordBankLoan} />

      case 'profile':
        return <Profile />

      // ==============================
      // NGO PAGES
      // ==============================

      case 'ngo-dashboard':
        return <NGODashboard />

      case 'beneficiaries':
        return <Beneficiaries />

      case 'assign-loan':
        return <AssignLoan />

      case 'ngo-manager':
        return <NGOLoanManager />

      case 'reports':
        return <Reports />

      // ==============================
      // FALLBACK
      // ==============================

      default:
        return profile?.role === 'ngo'
          ? <NGODashboard />
          : <UserDashboard />
    }
  }

  return (
    <div className="app-shell">
      {/* Mobile backdrop */}
      <div
        className={`sidebar-backdrop ${
          menuOpen ? 'show' : ''
        }`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Application sidebar */}
      <div
        className={`app-sidebar ${
          menuOpen ? 'open' : ''
        }`}
      >
        <Sidebar
          page={activePage}
          setPage={goTo}
        />
      </div>

      {/* Main application area */}
      <div className="app-main">
        <Topbar
          page={activePage}
          setPage={goTo}
          onMenu={() =>
            setMenuOpen(current => !current)
          }
        />

        {/* Main scrollable content */}
        <main className="grid-bg app-content">
          <div className="page-inner">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  )
}