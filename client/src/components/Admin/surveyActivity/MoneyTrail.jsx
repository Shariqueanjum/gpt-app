import { Box, Typography } from '@mui/material'
import { formatUTCDateTime } from '../../../utils/formatTime'
import { formatPoints } from './surveyActivityConstants'

const MONEY_LABELS = {
  survey: 'Survey credited',
  reversal: 'Reversed',
  undo_reversal: 'Reversal undone',
  referral: 'Referral commission',
}

// Permanent ledger for this click (survives even if raw logs are ever cleaned up)
const MoneyTrail = ({ money, COLORS }) => {
  if (!money || money.length === 0) {
    return (
      <Typography sx={{ fontSize: '0.8rem', color: COLORS.textMuted, py: 1.5 }}>
        No money has moved for this click.
      </Typography>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
      {money.map((tx) => {
        const amount = Number(tx.amount || 0)
        const negative = amount < 0
        return (
          <Box key={tx.id} sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5,
            p: 1.2, borderRadius: 2.5, border: `1px solid ${COLORS.border}`, bgcolor: COLORS.cardBg,
          }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: COLORS.textPrimary }}>
                {MONEY_LABELS[tx.type] || tx.type}
                <Box component="span" sx={{ fontWeight: 500, color: COLORS.textMuted }}> · {tx.username}</Box>
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: COLORS.textMuted }}>
                {formatUTCDateTime(tx.created_at)} UTC · {tx.status}
                {tx.metadata?.reason ? ` · ${tx.metadata.reason}` : ''}
              </Typography>
            </Box>
            <Typography sx={{
              fontSize: '0.9rem', fontWeight: 800, whiteSpace: 'nowrap',
              color: negative ? COLORS.danger : '#10b981',
            }}>
              {negative ? '' : '+'}{formatPoints(amount)}
            </Typography>
          </Box>
        )
      })}
    </Box>
  )
}

export default MoneyTrail
