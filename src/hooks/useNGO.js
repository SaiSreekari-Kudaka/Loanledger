import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuthContext'
import { calcEMI } from '../lib/utils'

export function useNGO() {
  const { user } = useAuth()
  const [beneficiaries, setBens] = useState([])
  const [ngoLoans, setNgoLoans]  = useState([])
  const [payments, setPayments]  = useState([])
  const [loading, setLoading]    = useState(true)

  const fetchAll = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const [bRes, lRes, pRes] = await Promise.all([
      supabase.from('beneficiaries').select('*').eq('ngo_id', user.id).order('created_at', { ascending: false }),
      supabase.from('ngo_loans').select('*, beneficiaries(name)').eq('ngo_id', user.id).order('created_at', { ascending: false }),
      supabase.from('payments').select('*').not('ngo_loan_id', 'is', null),
    ])
    setBens(bRes.data || [])
    setNgoLoans((lRes.data || []).map(l => ({ ...l, ben_name: l.beneficiaries?.name || '—' })))
    setPayments(pRes.data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Real-time
  useEffect(() => {
    if (!user) return
    const ch = supabase.channel('ngo-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'beneficiaries', filter: `ngo_id=eq.${user.id}` }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ngo_loans',     filter: `ngo_id=eq.${user.id}` }, fetchAll)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [user, fetchAll])

  /* BENEFICIARIES */
  async function addBeneficiary(form) {
    const { data, error } = await supabase.from('beneficiaries').insert({ ...form, ngo_id: user.id }).select().single()
    if (!error) setBens(prev => [data, ...prev])
    return { data, error }
  }
  async function updateBeneficiary(id, updates) {
    const { data, error } = await supabase.from('beneficiaries').update(updates).eq('id', id).select().single()
    if (!error) setBens(prev => prev.map(b => b.id === id ? data : b))
    return { data, error }
  }
  async function deleteBeneficiary(id) {
    const { error } = await supabase.from('beneficiaries').delete().eq('id', id)
    if (!error) setBens(prev => prev.filter(b => b.id !== id))
    return { error }
  }

  /* NGO LOANS */
  async function assignLoan(form) {
    const emi = calcEMI(Number(form.amount), Number(form.interest_rate), Number(form.tenure))
    const row = {
      ngo_id: user.id,
      beneficiary_id: form.beneficiary_id,
      bank_name: form.bank_name || '',
      amount: Number(form.amount),
      interest_rate: Number(form.interest_rate),
      tenure: Number(form.tenure),
      emi,
      paid_amount: 0,
      remaining_amount: Number(form.amount),
      status: 'active',
    }
    const { data, error } = await supabase.from('ngo_loans').insert(row).select('*, beneficiaries(name)').single()
    if (!error) setNgoLoans(prev => [{ ...data, ben_name: data.beneficiaries?.name || '—' }, ...prev])
    return { data, error }
  }

  async function updateNgoLoan(id, updates) {
    const { data, error } = await supabase.from('ngo_loans')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id).select('*, beneficiaries(name)').single()
    if (!error) setNgoLoans(prev => prev.map(l => l.id === id ? { ...data, ben_name: data.beneficiaries?.name || '—' } : l))
    return { data, error }
  }

  async function recordNgoPayment(loanId, amount) {
    const loan = ngoLoans.find(l => l.id === loanId)
    if (!loan) return { error: 'Loan not found' }
    const newPaid  = Math.min(Number(loan.paid_amount) + Number(amount), Number(loan.amount))
    const newRem   = Number(loan.amount) - newPaid
    // Keep defaulted status unless the loan is fully completed.
    // A defaulted loan does NOT automatically revert to active just because a payment is recorded.
    const newStatus = newRem <= 0 ? 'completed' : loan.status
    await supabase.from('payments').insert({ ngo_loan_id: loanId, amount: Number(amount), paid_on: new Date().toISOString().slice(0, 10) })
    return updateNgoLoan(loanId, { paid_amount: newPaid, remaining_amount: newRem, status: newStatus })
  }

  async function markDefaulted(loanId) {
    return updateNgoLoan(loanId, { status: 'defaulted' })
  }

  return {
    beneficiaries, ngoLoans, payments, loading, refresh: fetchAll,
    addBeneficiary, updateBeneficiary, deleteBeneficiary,
    assignLoan, updateNgoLoan, recordNgoPayment, markDefaulted,
  }
}
