import { Box, Typography } from '@mui/material'
import CopyText from '../CopyText'
import { formatUTCDateTime } from '../../../utils/formatTime'
import WallTypePill from './WallTypePill'
import { formatPoints, formatDollar } from './surveyActivityConstants'

const Item = ({ label, children, COLORS }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography sx={{ fontSize: '0.66rem', fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.2 }}>
      {label}
    </Typography>
    {children}
  </Box>
)

const Text = ({ children, COLORS, bold }) => (
  <Typography sx={{ fontSize: '0.8rem', fontWeight: bold ? 700 : 500, color: COLORS.textPrimary, wordBreak: 'break-word' }}>
    {children || '—'}
  </Typography>
)

// Everything we know about the click itself, in a two-column grid
const ClickSummary = ({ click, COLORS }) => {
  const commission = click.commission_rate
  const wallType = click.offer_wall_type || click.integration_type

  return (
    <Box sx={{
      display: 'grid', gap: 1.8, gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)' },
      p: 1.8, borderRadius: 3, border: `1px solid ${COLORS.border}`, bgcolor: COLORS.cardBg,
    }}>
      <Item label="User" COLORS={COLORS}>
        <Text COLORS={COLORS} bold>{click.username}</Text>
        <Typography sx={{ fontSize: '0.7rem', color: COLORS.textMuted }}>{click.user_public_id}</Typography>
      </Item>
      <Item label="Offer wall" COLORS={COLORS}>
        <Text COLORS={COLORS} bold>{click.offer_wall_name}</Text>
        <WallTypePill type={wallType} />
      </Item>
      <Item label="Origin" COLORS={COLORS}>
        <Text COLORS={COLORS}>{click.is_auto_created ? 'Auto-created from a postback' : 'Direct click'}</Text>
      </Item>

      <Item label="Our transaction ID" COLORS={COLORS}>
        <CopyText value={click.transaction_id} COLORS={COLORS} maxWidth="100%" />
      </Item>
      <Item label="External transaction ID" COLORS={COLORS}>
        <CopyText value={click.external_transaction_id} COLORS={COLORS} maxWidth="100%" />
      </Item>
      <Item label="Postbacks received" COLORS={COLORS}>
        <Text COLORS={COLORS}>{click.postback_count}</Text>
      </Item>

      <Item label="Provider payout" COLORS={COLORS}>
        <Text COLORS={COLORS}>{click.cpa_original ? `${formatPoints(click.cpa_original)} (${formatDollar(click.cpa_original)})` : null}</Text>
      </Item>
      <Item label={`User share${commission != null ? ` (after ${commission}% commission)` : ''}`} COLORS={COLORS}>
        <Text COLORS={COLORS} bold>{click.cpa_user ? `${formatPoints(click.cpa_user)} (${formatDollar(click.cpa_user)})` : null}</Text>
      </Item>
      <Item label="Funds" COLORS={COLORS}>
        <Text COLORS={COLORS}>{click.credit_transaction_id ? (click.funds_locked ? 'Locked' : 'Available') : null}</Text>
      </Item>

      <Item label="Survey" COLORS={COLORS}>
        <Text COLORS={COLORS}>{[click.survey_name, click.survey_id].filter(Boolean).join(' · ')}</Text>
        {(click.loi || click.country) && (
          <Typography sx={{ fontSize: '0.7rem', color: COLORS.textMuted }}>
            {[click.loi ? `${click.loi} min` : null, click.country].filter(Boolean).join(' · ')}
          </Typography>
        )}
      </Item>
      <Item label="Created (UTC)" COLORS={COLORS}>
        <Text COLORS={COLORS}>{formatUTCDateTime(click.created_at)}</Text>
      </Item>
      <Item label="Last updated (UTC)" COLORS={COLORS}>
        <Text COLORS={COLORS}>{formatUTCDateTime(click.updated_at)}</Text>
      </Item>
    </Box>
  )
}

export default ClickSummary
