// UTC time formatter — used across all pages
export const formatUTCDateTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ''
  
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  const h = String(date.getUTCHours()).padStart(2, '0')
  const min = String(date.getUTCMinutes()).padStart(2, '0')
  const s = String(date.getUTCSeconds()).padStart(2, '0')
  
  return `${y}-${m}-${d} ${h}:${min}:${s}`
}

// For date-only displays (e.g., "Jul 1, 2026")
export const formatUTCDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return 'N/A'
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`
}

// For "Member since" style
export const formatUTCMonthYear = (dateStr) => {
  if (!dateStr) return 'New member'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return 'New member'
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`
}