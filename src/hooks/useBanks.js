import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useBanks() {
  const [banks, setBanks]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('banks').select('*').order('interest_rate')
    if (error) setError(error.message)
    else { setBanks(data || []); setError(null) }
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { banks, loading, error, refresh: fetch }
}
