import { useState, useEffect, useCallback } from 'react'
import adminAxiosInstance from '../utils/adminAxiosInstance'
import { getApiErrorMessage } from '../components/Admin/surveyActivity/surveyActivityConstants'

// Loads one click with its money trail and every request that touched it.
// Pass null to stay idle (drawer closed). refreshKey: change it to force a reload.
const useSurveyClickDetail = (clickId, refreshKey = 0) => {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchDetail = useCallback(async () => {
    if (!clickId) return
    setLoading(true)
    setError(null)
    try {
      const res = await adminAxiosInstance.get(`/admin/survey-activity/${clickId}`)
      setDetail(res.data?.data || null)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load survey details'))
    } finally {
      setLoading(false)
    }
  }, [clickId])

  // Opening a different click clears the old one; a refreshKey bump (after
  // Reverse / Undo) re-reads the same click without blanking the drawer.
  useEffect(() => { setDetail(null) }, [clickId])
  useEffect(() => { fetchDetail() }, [fetchDetail, refreshKey])

  return { detail, loading, error, refresh: fetchDetail }
}

export default useSurveyClickDetail
