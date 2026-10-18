import { Box, Typography, Chip, Avatar } from '@mui/material'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import SectionCard from './SectionCard'
import CopyText from '../CopyText'
import { formatDate } from './userDetailFormat'

const Field = ({ label, children, COLORS }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography sx={{ fontSize: '0.7rem', color: COLORS.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {label}
    </Typography>
    <Box sx={{ fontSize: '0.88rem', color: COLORS.textPrimary, fontWeight: 600, mt: 0.2, wordBreak: 'break-word' }}>
      {children || '—'}
    </Box>
  </Box>
)

/** Who the user is, and who referred him. */
const UserProfileSection = ({ user, COLORS, onOpenReferrer }) => {
  const statusChip = (label, color, icon) => (
    <Chip size="small" icon={icon} label={label}
      sx={{ bgcolor: `${color}15`, color, fontWeight: 700, fontSize: '0.72rem', '& .MuiChip-icon': { color } }} />
  )

  return (
    <SectionCard title="User details" COLORS={COLORS}
      action={
        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
          {user.is_active ? statusChip('Active', '#10b981') : statusChip('Banned', '#ef4444')}
          {user.is_verified && statusChip('Verified', '#2563eb', <VerifiedOutlinedIcon sx={{ fontSize: 14 }} />)}
          {statusChip(`Level ${user.level}`, COLORS.primary)}
        </Box>
      }>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 2 }}>
        <Field label="Username" COLORS={COLORS}>{user.username}</Field>
        <Field label="Public ID" COLORS={COLORS}><CopyText value={user.public_id} COLORS={COLORS} fontSize="0.85rem" /></Field>
        <Field label="Email" COLORS={COLORS}>{user.email}</Field>
        <Field label="Full name" COLORS={COLORS}>{user.full_name}</Field>
        <Field label="Country" COLORS={COLORS}>{user.country}</Field>
        <Field label="Joined" COLORS={COLORS}>{formatDate(user.created_at)}</Field>
        <Field label="Last login" COLORS={COLORS}>{formatDate(user.last_login_at)}</Field>
        <Field label="Daily streak" COLORS={COLORS}>{`${user.current_streak} day${user.current_streak === 1 ? '' : 's'}`}</Field>
        <Field label="Referral code" COLORS={COLORS}><CopyText value={user.referral_code} COLORS={COLORS} fontSize="0.85rem" /></Field>
        <Field label="Referred by" COLORS={COLORS}>
          {user.referred_by ? (
            <Box
              onClick={() => onOpenReferrer?.(user.referred_by.id)}
              sx={{
                display: 'inline-flex', alignItems: 'center', gap: 0.8, cursor: onOpenReferrer ? 'pointer' : 'default',
                color: COLORS.primaryLight, '&:hover': onOpenReferrer ? { textDecoration: 'underline' } : {},
              }}
            >
              <Avatar sx={{ width: 22, height: 22, bgcolor: COLORS.primary, fontSize: '0.7rem' }}>
                {user.referred_by.username?.[0]?.toUpperCase()}
              </Avatar>
              {user.referred_by.username}
            </Box>
          ) : 'Nobody (signed up directly)'}
        </Field>
      </Box>

      {!user.is_active && (
        <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: '#ef444412', border: '1px solid #ef444430' }}>
          <Typography sx={{ color: '#ef4444', fontWeight: 700, fontSize: '0.82rem' }}>Banned {user.banned_at ? `on ${formatDate(user.banned_at)}` : ''}</Typography>
          <Typography sx={{ color: COLORS.textSecondary, fontSize: '0.8rem', mt: 0.3 }}>Reason: {user.ban_reason || 'No reason recorded'}</Typography>
        </Box>
      )}
    </SectionCard>
  )
}

export default UserProfileSection
