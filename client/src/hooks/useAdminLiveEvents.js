import { useEffect, useRef, useState, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const useAdminLiveEvents = () => {
  const [events, setEvents] = useState([])
  const esRef = useRef(null)
  const retryRef = useRef(null)

  const connect = useCallback(() => {
    esRef.current?.close()
    const token = localStorage.getItem('adminToken')
    if (!token) return
    const es = new EventSource(`${API_BASE}/admin/live-events/stream?token=${token}`)
    esRef.current = es
    es.addEventListener('admin_event', (e) => {
      try { setEvents((prev) => [JSON.parse(e.data), ...prev].slice(0, 50)) } catch (_) {}
    })
    es.onerror = () => {
      es.close()
      retryRef.current = setTimeout(connect, 5000)
    }
  }, [])

  useEffect(() => {
    connect()
    return () => { esRef.current?.close(); clearTimeout(retryRef.current) }
  }, [connect])

  return { events }
}

export default useAdminLiveEvents