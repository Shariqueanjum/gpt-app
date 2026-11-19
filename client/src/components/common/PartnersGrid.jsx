import { useState } from 'react'
import { Box, Typography } from '@mui/material'
import LockIcon from '@mui/icons-material/Lock'
import WallLockedDialog from './WallLockedDialog'

// Single partner tile: logo on top, name below. Nothing else.
const PartnerCard = ({ wall, COLORS, darkMode, onClick }) => {
  const [broken, setBroken] = useState(false)
  const showLogo = wall.logo_url && !broken
   const locked = Boolean(wall.is_locked)

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 1.5, px: 1.5, py: 2.5, minHeight: 112,
        borderRadius: 3, cursor: 'pointer', userSelect: 'none',
        bgcolor: darkMode ? 'rgba(255,255,255,0.04)' : '#f8f9fb',
        border: `1px solid ${COLORS.border}`,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(83,18,188,0.10)', borderColor: `${COLORS.primary}40` },
        '&:active': { transform: 'scale(0.98)' },
      }}
    >
      {locked && (
        <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1, width: 24, height: 24, borderRadius: '50%', bgcolor: COLORS.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(83,18,188,0.3)' }}>
          <LockIcon sx={{ fontSize: 14, color: '#fff' }} />
        </Box>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, width: '100%', filter: locked ? 'blur(1.5px)' : 'none', opacity: locked ? 0.7 : 1, transition: 'filter 0.2s ease' }}>
      <Box sx={{ height: 44, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {showLogo ? (
          <Box
            component="img"
            src={wall.logo_url}
            alt={wall.name}
            loading="lazy"
            onError={() => setBroken(true)}
            sx={{ maxWidth: '80%', maxHeight: 44, objectFit: 'contain', display: 'block' }}
          />
        ) : (
          <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: `${COLORS.primary}15`, color: COLORS.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem' }}>
            {wall.name?.[0]?.toUpperCase() || 'P'}
          </Box>
        )}
      </Box>
      <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: COLORS.textPrimary, textAlign: 'center', lineHeight: 1.2, wordBreak: 'break-word' }}>
        {wall.name}
      </Typography>
       </Box>
    </Box>
  )
}

const PartnersGrid = ({ walls, COLORS, darkMode, onSelect }) => {
  const [lockedWall, setLockedWall] = useState(null)

  // Locked walls never reach onSelect — we block the click and explain how to unlock.
  const handleClick = (wall) => {
    if (wall.is_locked) { setLockedWall(wall); return }
    onSelect(wall)
  }


  return (
  <>
  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(auto-fill, minmax(190px, 1fr))' }, gap: { xs: 1.5, md: 2 } }}>
    {walls.map((wall) => (
      <PartnerCard key={wall.id} wall={wall} COLORS={COLORS} darkMode={darkMode} onClick={() => handleClick(wall)} />
    ))}
  </Box>
  <WallLockedDialog wall={lockedWall} onClose={() => setLockedWall(null)} COLORS={COLORS} />
  </>
  )
}

export default PartnersGrid
