import { useState, useEffect, useCallback, useRef } from 'react'
import adminAxiosInstance from '../../../utils/adminAxiosInstance'
import { useDebouncedValue } from '../AdminUiKit'

// Drop empty filter values so the URL only carries what the admin actually chose
const compact = (obj) => {
  const out = {}
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== '' && v !== null && v !== undefined) out[k] = v
  })
  return out
}

/**
 * Generic paged + filtered list for ONE user.
 *  endpoint   e.g. 'history/surveys'
 *  filters    { status:'', search:'', ... }  (empty = not applied)
 *  refreshKey bump this number to force a reload (after unlock / undo)
 */
const useUserHistory = ({ userId, endpoint, filters, refreshKey = 0 }) => {
  const [rows, setRows] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)

  // Wait for the admin to stop typing before calling the API
  const filtersKey = useDebouncedValue(JSON.stringify(filters), 400)

  // Any filter change goes back to page 1
  useEffect(() => { setPage(1) }, [filtersKey, limit, userId])

  const load = useCallback(async () => {
    if (!userId) return
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError(null)
    try {
      const params = { ...compact(JSON.parse(filtersKey)), page, limit }
      const res = await adminAxiosInstance.get(`/admin/users/${userId}/${endpoint}`, { params, signal: controller.signal })
      setRows(res.data?.data || [])
      setMeta(res.data?.meta || null)
    } catch (err) {
      if (err.code === 'ERR_CANCELED' || err.name === 'CanceledError') return
      const msg = err.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to load')
      setRows([])
      setMeta(null)
    } finally {
      if (abortRef.current === controller) setLoading(false)
    }
  }, [userId, endpoint, filtersKey, page, limit])

  useEffect(() => { load() }, [load, refreshKey])
  useEffect(() => () => abortRef.current?.abort(), [])

  return { rows, meta, loading, error, page, setPage, limit, setLimit, reload: load }
}

export default useUserHistory
