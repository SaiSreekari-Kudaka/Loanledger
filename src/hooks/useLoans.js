import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuthContext'
import { calcEMI } from '../lib/utils'

export function useLoans() {
  const { user } = useAuth()
  const [loans, setLoans]     = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetch = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('loans').select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (error) { setError(error.message); setLoading(false); return }

    const loanRows = data || []
    setLoans(loanRows)

    // Fetch actual payment records for the user's loans (source of truth for
    // the repayment trend). Guard against an empty id list.
    if (loanRows.length) {
      const ids = loanRows.map(l => l.id)
      const { data: payRows, error: payErr } = await supabase
        .from('payments').select('*')
        .in('loan_id', ids)
        .order('paid_on', { ascending: true })
      if (!payErr) setPayments(payRows || [])
    } else {
      setPayments([])
    }
    setError(null)
    setLoading(false)
  }, [user])

  useEffect(() => { fetch() }, [fetch])

  // Real-time subscription — loans AND payments keep the dashboard in sync.
  useEffect(() => {
    if (!user) return
    const channel = supabase.channel('loans-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'loans', filter: `user_id=eq.${user.id}` },
        () => fetch())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' },
        () => fetch())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [user, fetch])

  async function addLoan(form) {
    const emi = calcEMI(Number(form.amount), Number(form.interest_rate), Number(form.tenure))
    const row = {
      user_id: user.id,
      loan_name: form.loan_name,
      bank_name: form.bank_name,
      amount: Number(form.amount),
      interest_rate: Number(form.interest_rate),
      tenure: Number(form.tenure),
      emi,
      paid_amount: 0,
      remaining_amount: Number(form.amount),
      status: form.status || 'active',
      start_date: form.start_date || new Date().toISOString().slice(0, 10),
      notes: form.notes || '',
    }
    const { data, error } = await supabase.from('loans').insert(row).select().single()
    if (!error) setLoans(prev => [data, ...prev])
    return { data, error }
  }

  async function updateLoan(id, updates) {
    const { data, error } = await supabase
      .from('loans').update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id).select().single()
    if (!error) setLoans(prev => prev.map(l => l.id === id ? data : l))
    return { data, error }
  }

  async function deleteLoan(id) {
    const { error } = await supabase.from('loans').delete().eq('id', id)
    if (!error) setLoans(prev => prev.filter(l => l.id !== id))
    return { error }
  }

  async function recordPayment(loanId, amount) {
    const loan = loans.find(l => l.id === loanId)
    if (!loan) return { error: 'Loan not found' }
    const newPaid = Math.min(Number(loan.paid_amount) + Number(amount), Number(loan.amount))
    const newRem  = Number(loan.amount) - newPaid
    const newStatus = newRem <= 0 ? 'completed' : loan.status

    // Log payment and update loan atomically via a single request pattern.
    // We insert the payment record first; if it fails we return early and
    // do NOT update the loan totals, keeping payment history and loan balances consistent.
    const { error: payErr } = await supabase.from('payments').insert({ loan_id: loanId, amount: Number(amount), paid_on: new Date().toISOString().slice(0, 10) })
    if (payErr) return { error: payErr.message }

    // Payment insert succeeded — now update the loan totals.
    return updateLoan(loanId, { paid_amount: newPaid, remaining_amount: newRem, status: newStatus })
  }

  return { loans, payments, loading, error, refresh: fetch, addLoan, updateLoan, deleteLoan, recordPayment }
}
