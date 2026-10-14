// ============================================================
// trafficLogStatus.js — the status of ONE log row, i.e. what that single
// request did at the moment it happened.
//
// The click's own status (pending → completed → reversed) changes over time,
// so showing it on every row made an old "click sent" row say "completed".
// This derives the status of the event itself from what the server recorded.
// ============================================================
 
const NON_SUCCESS_COLORS = {
  failed: 'error',
  rejected: 'error',
  security_terminated: 'error',
  quota_full: 'info',
}
 
// Returns { label, color } where color is a MUI Chip colour name
export const getLogEventStatus = (log) => {
  const result = log.processing_result || {}
 
  // A click being created is always pending at that moment
  if (log.direction === 'outgoing') return { label: 'pending', color: 'warning' }
 
  if (log.error_message || result.success === false) return { label: 'error', color: 'error' }
  if (result.acknowledged) return { label: 'ignored', color: 'info' }          // bonus / screenout, nothing credited
  if (result.reversed === true) return { label: 'reversed', color: 'default' }
 
  // Failed / quota full / terminated postbacks carry the mapped status
  if (result.status) return { label: result.status, color: NON_SUCCESS_COLORS[result.status] || 'default' }
 
  // A successful credit postback
  if (result.success === true && result.is_locked !== undefined) return { label: 'completed', color: 'success' }
 
  return { label: log.click_status || 'unknown', color: 'default' }
}