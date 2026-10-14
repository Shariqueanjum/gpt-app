import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import adminAxiosInstance from '../utils/adminAxiosInstance'
import { useDebouncedValue } from '../components/Admin/AdminUiKit'
import {
  DEFAULT_FILTERS, TEXT_FILTER_KEYS, buildQueryParams, getApiErrorMessage,
} from '../components/Admin/surveyActivity/surveyActivityConstants'

const BASE = '/admin/survey-activity'
const LIVE_REFRESH_MS = 15000

// Owns everything the Survey Activity list needs: filters, paging, the list +
// stats requests, dropdown options and the optional live refresh. The page
// component stays purely presentational.
const useSurveyActivity = (initialFilters = {}) => {
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS, ...initialFilters })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)

  const [rows, setRows] = useState([])
  const [meta, setMeta] = useState(null)
  const [stats, setStats] = useState(null)
  const [options, setOptions] = useState({ offer_walls: [], statuses: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [live, setLive] = useState(false)

  // Typed filters wait 400ms after the last keystroke; dropdowns apply instantly
  const typed = useMemo(
    () => Object.fromEntries(TEXT_FILTER_KEYS.map((key) => [key, filters[key]])),
    [filters]
  )
  const debouncedTyped = useDebouncedValue(typed, 400)
  const effectiveFilters = useMemo(() => ({ ...filters, ...debouncedTyped }), [filters, debouncedTyped])
  const queryKey = JSON.stringify(effectiveFilters)

  // Only the newest request may update the screen (fast typing can reorder responses)
  const requestId = useRef(0)

  const fetchData = useCallback(async ({ silent = false } = {}) => {
    const current = ++requestId.current
    if (!silent) setLoading(true)
    setError(null)

    try {
      const filterParams = buildQueryParams(effectiveFilters)
      const [listRes, statsRes] = await Promise.all([
        adminAxiosInstance.get(BASE, { params: { ...filterParams, page, limit } }),
        adminAxiosInstance.get(`${BASE}/stats`, {
          // stats ignore paging and sorting
          params: Object.fromEntries(Object.entries(filterParams).filter(([k]) => k !== 'sort_by' && k !== 'sort_order')),
        }),
      ])
      if (current !== requestId.current) return
      setRows(listRes.data?.data || [])
      setMeta(listRes.data?.meta || null)
      setStats(statsRes.data?.data || null)
    } catch (err) {
      if (current !== requestId.current) return
      setError(getApiErrorMessage(err, 'Could not load survey activity'))
    } finally {
      if (current === requestId.current) setLoading(false)
    }
    // queryKey stands in for effectiveFilters so object identity changes don't refetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey, page, limit])

  useEffect(() => { fetchData() }, [fetchData])

  // Dropdown options (offer walls + statuses that exist) — loaded once
  useEffect(() => {
    adminAxiosInstance.get(`${BASE}/filters`)
      .then((res) => setOptions(res.data?.data || { offer_walls: [], statuses: [] }))
      .catch(() => { /* filters still work without the dropdown options */ })
  }, [])

  // Live mode: quietly re-poll so pending → completed changes appear on their own
  useEffect(() => {
    if (!live) return undefined
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') fetchData({ silent: true })
    }, LIVE_REFRESH_MS)
    return () => clearInterval(timer)
  }, [live, fetchData])

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }, [])

  const updateFilters = useCallback((patch) => {
    setFilters((prev) => ({ ...prev, ...patch }))
    setPage(1)
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS })
    setPage(1)
  }, [])

  const changeLimit = useCallback((value) => {
    setLimit(value)
    setPage(1)
  }, [])

  return {
    filters, updateFilter, updateFilters, resetFilters,
    page, setPage, limit, changeLimit,
    rows, meta, stats, options,
    loading, error, refresh: fetchData,
    live, setLive,
  }
}

export default useSurveyActivity
