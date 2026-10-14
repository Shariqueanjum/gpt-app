import { useState } from 'react'
import { Box, Collapse, Typography } from '@mui/material'
import CallMadeIcon from '@mui/icons-material/CallMade'
import CallReceivedIcon from '@mui/icons-material/CallReceived'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { StatusPill } from '../AdminUiKit'
import CopyText from '../CopyText'
import JsonBlock from '../JsonBlock'
import { formatUTCDateTime } from '../../../utils/formatTime'

const EVENT_TITLES = {
  survey_click: 'Click created and sent to the offer wall',
  s2s_callback: 'Postback received (server-to-server)',
  browser_callback: 'User returned via browser redirect',
  api_request: 'API request',
  redirect: 'Redirect',
}

// success / failure / "acknowledged but not credited" for the small pill
const resolveOutcome = (event) => {
  const result = event.processing_result || {}
  if (event.error_message || result.success === false) return { label: 'Error', color: '#ef4444' }
  if (result.acknowledged) return { label: 'Acknowledged', color: '#f59e0b' }
  if (result.success === true) return { label: 'OK', color: '#10b981' }
  return null
}

const Row = ({ label, children, COLORS }) => (
  <Box sx={{ display: 'flex', gap: 1.2, py: 0.45, alignItems: 'baseline', flexWrap: 'wrap' }}>
    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', minWidth: 96 }}>
      {label}
    </Typography>
    <Box sx={{ minWidth: 0, flex: 1 }}>{children}</Box>
  </Box>
)

const Mono = ({ children, COLORS }) => (
  <Typography sx={{ fontSize: '0.74rem', fontFamily: 'ui-monospace, Menlo, monospace', color: COLORS.textPrimary, wordBreak: 'break-all' }}>
    {children}
  </Typography>
)

// One request or response that touched the click, collapsed to a single line
// with every detail (URL, params, IP, response, error) one tap away.
const TrafficEvent = ({ event, COLORS, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen)
  const incoming = event.direction === 'incoming'
  const outcome = resolveOutcome(event)
  const message = event.error_message || event.processing_result?.message
  const params = incoming ? event.query_params : event.request_body
  const hasParams = params && Object.keys(params).length > 0

  return (
    <Box sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2.5, bgcolor: COLORS.cardBg, overflow: 'hidden' }}>
      <Box onClick={() => setOpen((o) => !o)} sx={{
        display: 'flex', alignItems: 'center', gap: 1.2, p: 1.3, cursor: 'pointer',
        '&:hover': { bgcolor: `${COLORS.primary}05` },
      }}>
        <Box sx={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center',
          bgcolor: incoming ? '#10b98118' : '#2563eb18', color: incoming ? '#10b981' : '#2563eb',
        }}>
          {incoming ? <CallReceivedIcon sx={{ fontSize: '1rem' }} /> : <CallMadeIcon sx={{ fontSize: '1rem' }} />}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: COLORS.textPrimary }}>
            {EVENT_TITLES[event.type] || event.type}
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', color: COLORS.textMuted }}>
            {formatUTCDateTime(event.created_at)} UTC
            {event.ip_address ? ` · ${event.ip_address}` : ''}
          </Typography>
          {message && (
            <Typography sx={{ fontSize: '0.74rem', color: event.error_message ? COLORS.danger : COLORS.textSecondary, mt: 0.3 }}>
              {message}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5, flexShrink: 0 }}>
          {outcome && <StatusPill label={outcome.label} color={outcome.color} />}
          {event.response_status && (
            <Typography sx={{ fontSize: '0.68rem', color: COLORS.textMuted }}>
              {event.method} · HTTP {event.response_status}
            </Typography>
          )}
        </Box>
        <ExpandMoreIcon sx={{
          fontSize: '1.2rem', color: COLORS.textMuted, transition: 'transform .15s',
          transform: open ? 'rotate(180deg)' : 'none',
        }} />
      </Box>

      <Collapse in={open} unmountOnExit>
        <Box sx={{ px: 1.6, pb: 1.6, pt: 0.4, borderTop: `1px solid ${COLORS.border}` }}>
          <Row label="URL" COLORS={COLORS}>
            <CopyText value={event.url} COLORS={COLORS} maxWidth="100%" fontSize="0.72rem" />
          </Row>
          {(event.internal_transaction_id || event.external_transaction_id) && (
            <Row label="IDs on request" COLORS={COLORS}>
              {event.internal_transaction_id && <Mono COLORS={COLORS}>ours / sub_id: {event.internal_transaction_id}</Mono>}
              {event.external_transaction_id && <Mono COLORS={COLORS}>provider: {event.external_transaction_id}</Mono>}
            </Row>
          )}
          {event.processing_time_ms != null && (
            <Row label="Processed in" COLORS={COLORS}><Mono COLORS={COLORS}>{event.processing_time_ms} ms</Mono></Row>
          )}
          {event.user_agent && (
            <Row label="User agent" COLORS={COLORS}><Mono COLORS={COLORS}>{event.user_agent}</Mono></Row>
          )}

          {hasParams && (
            <Box sx={{ mt: 1 }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', mb: 0.5 }}>
                {incoming ? 'Postback parameters' : 'Request body'}
              </Typography>
              <JsonBlock value={params} COLORS={COLORS} />
            </Box>
          )}
          {incoming && event.request_body && Object.keys(event.request_body).length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', mb: 0.5 }}>Request body</Typography>
              <JsonBlock value={event.request_body} COLORS={COLORS} />
            </Box>
          )}
          {event.response_body && (
            <Box sx={{ mt: 1 }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', mb: 0.5 }}>Our response</Typography>
              <JsonBlock value={event.response_body} COLORS={COLORS} />
            </Box>
          )}
          {event.processing_result && (
            <Box sx={{ mt: 1 }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', mb: 0.5 }}>Processing result</Typography>
              <JsonBlock value={event.processing_result} COLORS={COLORS} />
            </Box>
          )}
          {event.error_stack && (
            <Box sx={{ mt: 1 }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: COLORS.danger, textTransform: 'uppercase', mb: 0.5 }}>Error stack</Typography>
              <JsonBlock value={event.error_stack} COLORS={COLORS} />
            </Box>
          )}
          {event.headers && (
            <Box sx={{ mt: 1 }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', mb: 0.5 }}>Headers</Typography>
              <JsonBlock value={event.headers} COLORS={COLORS} maxHeight={160} />
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  )
}

export default TrafficEvent
