import { useEffect, useRef, useState, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const MAX_ITEMS = 30

/**
 * useLiveActivity
 * Connects to SSE /api/live-activity/stream.
 * Falls back to REST /api/live-activity/recent on SSE failure.
 *
 * Returns:
 *   activities  — array of activity objects (newest first)
 *   connected   — boolean SSE connection state
 *   error       — string | null
 */
const useLiveActivity = () => {
  const [activities, setActivities] = useState([])
  const [connected, setConnected]   = useState(false)
  const [error, setError]           = useState(null)
  const esRef    = useRef(null)
  const retryRef = useRef(null)
  const retries  = useRef(0)

  const prepend = useCallback((items) => {
    setActivities((prev) => {
      const next = Array.isArray(items) ? [...items, ...prev] : [items, ...prev]
      return next.slice(0, MAX_ITEMS)
    })
  }, [])

  const fetchRest = useCallback(async () => {
    try {
      const res  = await fetch(`${API_BASE}/live-activity/recent?limit=20`)
      const json = await res.json()
      if (json.success && json.data?.length) {
        setActivities(json.data.slice(0, MAX_ITEMS))
      }
    } catch (err) {
      // silently fail — dashboard still works without live feed
    }
  }, [])

  const connect = useCallback(() => {
    if (esRef.current) {
      esRef.current.close()
    }

    const token = localStorage.getItem('token')
    const url   = token
      ? `${API_BASE}/live-activity/stream?token=${token}`
      : `${API_BASE}/live-activity/stream`

    const es = new EventSource(url)
    esRef.current = es

    es.addEventListener('activity', (e) => {
      try {
        const data = JSON.parse(e.data)
        prepend(data)
      } catch (_) {}
    })

    es.addEventListener('heartbeat', () => {
      // connection alive — nothing to do
    })

    es.onopen = () => {
      setConnected(true)
      setError(null)
      retries.current = 0
    }

    es.onerror = () => {
      setConnected(false)
      es.close()

      retries.current += 1
      const delay = Math.min(30000, 3000 * Math.pow(1.5, retries.current))

      if (retries.current === 1) {
        // First failure — load REST feed so feed isn't empty
        fetchRest()
      }

      if (retries.current <= 8) {
        retryRef.current = setTimeout(connect, delay)
      } else {
        setError('Live feed unavailable — showing recent activity')
        fetchRest()
      }
    }
  }, [prepend, fetchRest])

  useEffect(() => {
    // Load REST feed immediately so feed is not empty while SSE connects
    fetchRest()
    connect()

    return () => {
      esRef.current?.close()
      clearTimeout(retryRef.current)
    }
  }, [])

  return { activities, connected, error }
}

export default useLiveActivity
