import { useState, useEffect, useCallback } from 'react'
import adminAxiosInstance from '../../../utils/adminAxiosInstance'

/** Loads the top part of the detail view (identity, balances, totals, providers). */
const useUserOverview = (userId, open) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async (silent = false) => {
    if (!userId) return
    if (!silent) setLoading(true)
    setError(null)
    try {
      const res = await adminAxiosInstance.get(`/admin/users/${userId}/overview`)
      setData(res.data?.data || null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load user')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (open && userId) {
      setData(null)
      load()
    }
  }, [open, userId, load])

  return { data, loading, error, reload: load }
}

export default useUserOverview
