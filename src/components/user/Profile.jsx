
import { useEffect, useState } from 'react'
import {
  UserRound,
  Mail,
  ShieldCheck,
  CalendarDays,
  Save,
  LogOut,
  Trash2,
  Landmark,
  CheckCircle2,
  AlertTriangle,
  LockKeyhole,
} from 'lucide-react'

import { useAuth } from '../../hooks/useAuthContext'
import { supabase } from '../../lib/supabase'
import {
  SectionTitle,
  Field,
  Toast,
  ConfirmDialog,
} from '../shared/UI'

const C = {
  surface: 'var(--md-surface-container)',
  elevated: 'var(--md-surface-container-high)',
  border: 'var(--md-outline-variant)',
  text: 'var(--md-on-surface)',
  muted: 'var(--md-on-surface-variant)',
  primary: 'var(--md-primary)',
  error: 'var(--md-error)',
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div
      style={{
        minWidth: 0,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 11,
        padding: 15,
        borderRadius: 13,
        background: C.elevated,
      }}
    >
      <div
        style={{
          width: 33,
          height: 33,
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          borderRadius: 10,
          background: C.surface,
          color: C.primary,
        }}
      >
        <Icon size={16} />
      </div>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            color: C.muted,
            fontSize: 10,
            fontWeight: 650,
            letterSpacing: '0.055em',
            marginBottom: 5,
          }}
        >
          {label}
        </div>

        <div
          style={{
            color: C.text,
            fontSize: 13,
            fontWeight: 550,
            overflowWrap: 'anywhere',
          }}
        >
          {value || '—'}
        </div>
      </div>
    </div>
  )
}

export default function Profile() {
  const {
    profile,
    fetchProfile,
    user,
    signOut,
    deleteAccount,
  } = useAuth()

  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  const [toast, setToast] = useState(null)

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'User'

  const email =
    profile?.email ||
    user?.email ||
    ''

  const role =
    profile?.role ||
    user?.user_metadata?.role ||
    'user'

  const isNGO = role === 'ngo'

  useEffect(() => {
    setName(displayName)
  }, [displayName])

  useEffect(() => {
    if (!toast) return undefined

    const timer = setTimeout(() => {
      setToast(null)
    }, 3500)

    return () => clearTimeout(timer)
  }, [toast])

  function showToast(message, type = 'success') {
    setToast({ message, type })
  }

  const trimmedName = name.trim()
  const hasChanges = trimmedName !== displayName

  async function handleSave() {
    if (!user?.id) {
      showToast('Unable to identify your account.', 'error')
      return
    }

    if (!trimmedName) {
      showToast('Please enter your name.', 'error')
      return
    }

    if (!hasChanges) return

    setSaving(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: trimmedName,
          email: user.email,
        })
        .eq('id', user.id)

      if (error) {
        console.error('Profile update error:', error)
        showToast(error.message || 'Could not update profile.', 'error')
        return
      }

      await fetchProfile(user.id)
      showToast('Your profile has been updated.')
    } catch (error) {
      console.error('Profile save error:', error)
      showToast(
        'Something went wrong while saving your profile.',
        'error'
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)

    try {
      const { error } = await deleteAccount()

      if (error) {
        showToast(
          error.message || 'Could not delete account.',
          'error'
        )
      }

      setConfirmDel(false)
    } catch (error) {
      console.error('Account deletion error:', error)
      showToast(
        error.message || 'Something went wrong while deleting your account.',
        'error'
      )
      setConfirmDel(false)
    } finally {
      setDeleting(false)
    }
  }

  const initial = displayName.charAt(0).toUpperCase()

  const memberSince =
    profile?.created_at || user?.created_at
      ? new Date(
          profile?.created_at || user?.created_at
        ).toLocaleDateString('en-IN', {
          month: 'long',
          year: 'numeric',
        })
      : '—'

  return (
    <div
      className="anim-fade-up"
      style={{
        width: '100%',
        maxWidth: 900,
        minWidth: 0,
      }}
    >
      <SectionTitle>My Profile</SectionTitle>

      <p
        style={{
          color: C.muted,
          fontSize: 13,
          lineHeight: 1.6,
          marginTop: -7,
          marginBottom: 21,
        }}
      >
        Manage your account information and preferences.
      </p>

      {/* ACCOUNT HEADER */}
      <section
        style={{
          padding: 23,
          marginBottom: 15,
          border: `1px solid ${C.border}`,
          borderRadius: 18,
          background: C.surface,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 17,
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              width: 68,
              height: 68,
              flexShrink: 0,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 20,
              background: 'var(--md-primary-container)',
              color: 'var(--md-on-primary-container)',
              fontFamily: 'var(--font-d)',
              fontSize: 29,
              fontWeight: 750,
            }}
          >
            {initial}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                color: C.text,
                fontFamily: 'var(--font-d)',
                fontSize: 23,
                fontWeight: 700,
                overflowWrap: 'anywhere',
              }}
            >
              {displayName}
            </div>

            <div
              style={{
                color: C.muted,
                fontSize: 13,
                marginTop: 4,
                overflowWrap: 'anywhere',
              }}
            >
              {email || 'No email available'}
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 10px',
                marginTop: 10,
                borderRadius: 999,
                background: isNGO
                  ? 'var(--md-tertiary-container)'
                  : 'var(--md-primary-container)',
                color: isNGO
                  ? 'var(--md-on-tertiary-container)'
                  : 'var(--md-on-primary-container)',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.045em',
              }}
            >
              <ShieldCheck size={13} />
              {isNGO ? 'NGO VOLUNTEER' : 'PERSONAL ACCOUNT'}
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))',
            gap: 10,
            marginTop: 22,
          }}
        >
          <InfoItem
            icon={Mail}
            label="EMAIL ADDRESS"
            value={email}
          />

          <InfoItem
            icon={UserRound}
            label="ACCOUNT TYPE"
            value={isNGO ? 'NGO Volunteer' : 'Personal Loan Manager'}
          />

          <InfoItem
            icon={CalendarDays}
            label="MEMBER SINCE"
            value={memberSince}
          />
        </div>
      </section>

      {/* PERSONAL DETAILS */}
      <section
        style={{
          padding: 23,
          marginBottom: 15,
          border: `1px solid ${C.border}`,
          borderRadius: 18,
          background: C.surface,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 6,
          }}
        >
          <div
            style={{
              width: 35,
              height: 35,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 11,
              background: 'var(--md-primary-container)',
              color: C.primary,
            }}
          >
            <UserRound size={17} />
          </div>

          <div
            style={{
              color: C.text,
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            Personal details
          </div>
        </div>

        <p
          style={{
            color: C.muted,
            fontSize: 12,
            lineHeight: 1.6,
            marginBottom: 21,
          }}
        >
          Update the name associated with your LoanLedger account.
        </p>

        <Field label="Full name">
          <input
            className="input-field"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter your full name"
            maxLength={100}
            autoComplete="name"
          />
        </Field>

        <Field label="Email address">
          <div style={{ position: 'relative' }}>
            <input
              className="input-field"
              value={email}
              disabled
              aria-label="Account email address"
              style={{
                paddingRight: 42,
                opacity: 0.8,
                cursor: 'not-allowed',
              }}
            />

            <LockKeyhole
              size={15}
              color={C.muted}
              style={{
                position: 'absolute',
                right: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            />
          </div>
          <div
            style={{
              color: C.muted,
              fontSize: 10,
              marginTop: 6,
            }}
          >
            Your account email cannot be changed here.
          </div>
        </Field>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
            marginTop: 8,
          }}
        >
          <button
            type="button"
            className="btn btn-cyan"
            onClick={handleSave}
            disabled={saving || !hasChanges || !trimmedName}
            style={{ gap: 8 }}
          >
            {saving ? (
              'Saving…'
            ) : (
              <>
                <Save size={15} />
                Save changes
              </>
            )}
          </button>

          {hasChanges && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setName(displayName)}
              disabled={saving}
            >
              Discard changes
            </button>
          )}

          {!hasChanges && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                color: C.muted,
                fontSize: 11,
              }}
            >
              <CheckCircle2 size={14} />
              Profile is up to date
            </span>
          )}
        </div>
      </section>

      {/* SESSION */}
      <section
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          padding: 20,
          marginBottom: 15,
          border: `1px solid ${C.border}`,
          borderRadius: 18,
          background: C.surface,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 12,
              background: C.elevated,
              color: C.primary,
            }}
          >
            <LogOut size={17} />
          </div>

          <div>
            <div style={{ color: C.text, fontSize: 14, fontWeight: 650 }}>
              Sign out
            </div>
            <div style={{ color: C.muted, fontSize: 11, marginTop: 3 }}>
              Sign out of your current LoanLedger session.
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-ghost"
          onClick={signOut}
          style={{ gap: 8 }}
        >
          <LogOut size={15} />
          Sign out
        </button>
      </section>

      {/* DANGER ZONE */}
      <section
        style={{
          padding: 22,
          border: `1px solid color-mix(in srgb, ${C.error} 40%, ${C.border})`,
          borderRadius: 18,
          background: C.surface,
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
              width: 38,
              height: 38,
              flexShrink: 0,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 12,
              background: 'var(--md-error-container)',
              color: C.error,
            }}
          >
            <AlertTriangle size={18} />
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                color: C.error,
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              Delete account
            </div>

            <p
              style={{
                color: C.muted,
                fontSize: 12,
                lineHeight: 1.65,
                marginTop: 6,
                marginBottom: 15,
              }}
            >
              Permanently delete your account and its associated loan,
              beneficiary, and payment data. This action cannot be undone.
            </p>

            <button
              type="button"
              className="btn btn-danger"
              onClick={() => setConfirmDel(true)}
              disabled={deleting}
              style={{ gap: 8 }}
            >
              <Trash2 size={15} />
              Delete my account
            </button>
          </div>
        </div>
      </section>

      {/* APP INFORMATION */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
          flexWrap: 'wrap',
          padding: '18px 5px 5px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 10,
              background: 'var(--md-primary-container)',
              color: C.primary,
            }}
          >
            <Landmark size={17} />
          </div>

          <div>
            <div style={{ color: C.text, fontSize: 13, fontWeight: 700 }}>
              LoanLedger
            </div>
            <div style={{ color: C.muted, fontSize: 10, marginTop: 3 }}>
              Loan management and NGO assistance platform
            </div>
          </div>
        </div>

        <span style={{ color: C.muted, fontSize: 11 }}>
          Version 1.0.0
        </span>
      </div>

      <ConfirmDialog
        open={confirmDel}
        title="Permanently delete account?"
        message="This permanently deletes your account and all associated data. This action cannot be undone. Are you sure you want to continue?"
        confirmLabel={deleting ? 'Deleting…' : 'Delete forever'}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!deleting) setConfirmDel(false)
        }}
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
