import { useState, useEffect, useCallback, useRef } from 'react'
import adminAxiosInstance from '../../../utils/adminAxiosInstance'
import { useDebouncedValue } from '../AdminUiKit'

const errorText = (err, fallback) => {
  const msg = err.response?.data?.message
  return Array.isArray(msg) ? msg.join(', ') : msg || fallback
}
const isCancelled = (err) => err.code === 'ERR_CANCELED' || err.name === 'CanceledError'

/**
 * Loads everything the Revenue & Profit page needs:
 *   meta       clients + year range (once)
 *   breakdown  the full numbers for the selected period
 *   trend      the list of periods for the chart (month list for a year, 4 quarters, or the years)
 * `controls` = { granularity, year, index, date_from, date_to, offer_wall_id }
 */
const useRevenueData = (controls) => {
  const [meta, setMeta] = useState(null)
  const [metaError, setMetaError] = useState(null)
  const [breakdown, setBreakdown] = useState(null)
  const [trend, setTrend] = useState(null)
  const [loading, setLoading] = useState(true)
  const [trendLoading, setTrendLoading] = useState(true)
  const [error, setError] = useState(null)
  const [trendError, setTrendError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const breakdownAbort = useRef(null)
  const trendAbort = useRef(null)

  // typing a custom date should not fire a request per keystroke
  const key = useDebouncedValue(JSON.stringify(controls), 350)

  useEffect(() => {
    let alive = true
    adminAxiosInstance.get('/admin/revenue/meta')
      .then((res) => { if (alive) setMeta(res.data?.data || null) })
      .catch((err) => { if (alive) setMetaError(errorText(err, 'Failed to load filters')) })
    return () => { alive = false }
  }, [])

  const loadBreakdown = useCallback(async (c) => {
    breakdownAbort.current?.abort()
    const controller = new AbortController()
    breakdownAbort.current = controller
    setLoading(true)
    setError(null)
    try {
      const params = { granularity: c.granularity }
      if (c.granularity === 'custom') { params.date_from = c.date_from; params.date_to = c.date_to }
      else { params.year = c.year; if (c.granularity !== 'year') params.index = c.index }
      if (c.offer_wall_id) params.offer_wall_id = c.offer_wall_id
      const res = await adminAxiosInstance.get('/admin/revenue/breakdown', { params, signal: controller.signal })
      setBreakdown(res.data?.data || null)
    } catch (err) {
      if (isCancelled(err)) return
      setError(errorText(err, 'Failed to load revenue'))
    } finally {
      if (breakdownAbort.current === controller) setLoading(false)
    }
  }, [])

  const loadTrend = useCallback(async (c) => {
    trendAbort.current?.abort()
    const controller = new AbortController()
    trendAbort.current = controller
    setTrendLoading(true)
    setTrendError(null)
    try {
      // custom ranges show the monthly picture of the year they start in
      const granularity = c.granularity === 'custom' ? 'month' : c.granularity
      const year = c.granularity === 'custom' ? (c.date_from || '').slice(0, 4) : c.year
      const params = { granularity }
      if (granularity !== 'year' && year) params.year = year
      if (c.offer_wall_id) params.offer_wall_id = c.offer_wall_id
      const res = await adminAxiosInstance.get('/admin/revenue/trend', { params, signal: controller.signal })
      setTrend(res.data?.data || null)
    } catch (err) {
      if (isCancelled(err)) return
      setTrendError(errorText(err, 'Failed to load trend'))
    } finally {
      if (trendAbort.current === controller) setTrendLoading(false)
    }
  }, [])

  useEffect(() => {
    const c = JSON.parse(key)
    if (!c.granularity || !c.year) return
    if (c.granularity === 'custom' && !(c.date_from && c.date_to)) return
    loadBreakdown(c)
    loadTrend(c)
  }, [key, refreshKey, loadBreakdown, loadTrend])

  useEffect(() => () => { breakdownAbort.current?.abort(); trendAbort.current?.abort() }, [])

  return { meta, metaError, breakdown, trend, loading, trendLoading, error, trendError, refresh: () => setRefreshKey((k) => k + 1) }
}

export default useRevenueData
