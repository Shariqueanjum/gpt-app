// client/src/components/sections/WhyChooseUs.jsx

import { useRef, useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Container,
  useTheme,
  useMediaQuery,
} from '@mui/material'

import SpeedIcon from '@mui/icons-material/Speed'
import SecurityIcon from '@mui/icons-material/Security'
import PaymentsIcon from '@mui/icons-material/Payments'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic'

// -----------------------------------------------------------------------------
// Features
// -----------------------------------------------------------------------------

const features = [
  {
    icon: <SpeedIcon sx={{ fontSize: 28 }} />,
    title: 'Lightning Fast',
    desc: 'New surveys drop every hour. Grab them before they fill up — the best ones go fast.',
    mobileDesc: 'New surveys arrive regularly. Grab the best ones before they fill up.',
    color: '#5312bc',
  },
  {
    icon: <SecurityIcon sx={{ fontSize: 28 }} />,
    title: 'Secure & Private',
    desc: 'Your personal data stays encrypted. We never share or sell your information.',
    mobileDesc: 'Your personal information stays protected and private.',
    color: '#006e2f',
  },
  {
    icon: <PaymentsIcon sx={{ fontSize: 28 }} />,
    title: 'Great Payouts',
    desc: 'We negotiate directly with advertisers for top rates.',
    mobileDesc: 'Earn competitive rewards for the time you spend on surveys.',
    color: '#623c00',
  },
  {
    icon: <EmojiEventsIcon sx={{ fontSize: 28 }} />,
    title: 'Daily Bonuses',
    desc: 'Streak rewards, leaderboard prizes, and surprise lootboxes.',
    mobileDesc: 'Keep your streak going and unlock extra rewards.',
    color: '#be185d',
  },
  {
    icon: <TrendingUpIcon sx={{ fontSize: 28 }} />,
    title: 'Level Up System',
    desc: 'Complete more surveys to climb levels. Higher levels unlock bigger rewards and exclusive offers.',
    mobileDesc: 'Complete more surveys and unlock better rewards as you level up.',
    color: '#1e40af',
  },
  {
    icon: <HeadsetMicIcon sx={{ fontSize: 28 }} />,
    title: '24/7 Live Support',
    desc: 'Real humans, not bots. Get help whenever you need it.',
    mobileDesc: 'Real people are here to help whenever you need us.',
    color: '#701a75',
  },
]

// -----------------------------------------------------------------------------
// Book settings
// -----------------------------------------------------------------------------

const FLIP_MS = 900
const STAGGER_MS = 140
const EASE = 'cubic-bezier(0.645, 0.045, 0.355, 1)'

const BRAND = '#5312bc'
const HAIRLINE = '1px solid rgba(203,195,215,0.4)'

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const toItems = (list) =>
  list.map((feature) => ({
    feature,
    number: String(features.indexOf(feature) + 1).padStart(2, '0'),
  }))

// -----------------------------------------------------------------------------
// Desktop feature block
// -----------------------------------------------------------------------------

const FeatureBlock = ({ feature, number, desktop, divided }) => (
  <Box
    sx={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      px: { xs: 3, md: 6 },
      py: { xs: 2.5, md: 4 },
      borderTop: divided ? HAIRLINE : 'none',
    }}
  >
    {/* Number */}
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mb: desktop ? 2.5 : 1.5,
      }}
    >
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          bgcolor: feature.color,
        }}
      />

      <Typography
        sx={{
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.14em',
          color: feature.color,
        }}
      >
        {number}
      </Typography>
    </Box>

    {/* Icon */}
    <Box
      sx={{
        width: desktop ? 52 : 44,
        height: desktop ? 52 : 44,
        borderRadius: '14px',
        bgcolor: `${feature.color}14`,
        color: feature.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: desktop ? 2.5 : 1.5,
      }}
    >
      {feature.icon}
    </Box>

    {/* Title */}
    <Typography
      sx={{
        fontFamily: '"Sora", sans-serif',
        fontSize: desktop ? '23px' : '19px',
        fontWeight: 800,
        color: '#131b2e',
        lineHeight: 1.25,
        mb: 1,
      }}
    >
      {feature.title}
    </Typography>

    {/* Desktop description */}
    <Typography
      sx={{
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        fontSize: desktop ? '15.5px' : '14px',
        lineHeight: 1.65,
        color: '#4b5563',
        fontWeight: 500,
        maxWidth: 380,
      }}
    >
      {feature.desc}
    </Typography>
  </Box>
)

// -----------------------------------------------------------------------------
// Mobile feature block
// -----------------------------------------------------------------------------

const MobileFeatureBlock = ({ feature, number, divided }) => (
  <Box
    sx={{
      flex: 1,
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',

      px: {
        xs: 2.5,
        sm: 3,
      },

      py: {
        xs: 1.55,
        sm: 2,
      },

      borderTop: divided
        ? '1px solid rgba(203,195,215,0.45)'
        : 'none',
    }}
  >
    {/* Top row */}
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 1.05,
      }}
    >
      {/* ---------------------------------------------------------------
          Premium number
      ---------------------------------------------------------------- */}

      <Box
        sx={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',

          minWidth: 38,
          height: 24,

          px: 1,

          borderRadius: '7px',

          background: `linear-gradient(
            135deg,
            ${feature.color}0d,
            ${feature.color}04
          )`,

          border: `1px solid ${feature.color}10`,

          overflow: 'hidden',

          // Very subtle glow around the number
          '&::after': {
            content: '""',
            position: 'absolute',
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: feature.color,
            opacity: 0.045,
            filter: 'blur(8px)',
          },
        }}
      >
        <Typography
          sx={{
            position: 'relative',
            zIndex: 1,

            fontFamily: '"Sora", sans-serif',

            fontSize: '10px',

            fontWeight: 700,

            letterSpacing: '0.16em',

            // Slightly faded rather than dark
            color: `${feature.color}b8`,

            lineHeight: 1,

            userSelect: 'none',
          }}
        >
          {number}
        </Typography>
      </Box>

      {/* ---------------------------------------------------------------
          Icon
      ---------------------------------------------------------------- */}

      <Box
        sx={{
          width: 40,
          height: 40,

          borderRadius: '12px',

          bgcolor: `${feature.color}11`,

          color: feature.color,

          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',

          '& svg': {
            fontSize: 23,
          },
        }}
      >
        {feature.icon}
      </Box>
    </Box>

    {/* ---------------------------------------------------------------
        Title
    ---------------------------------------------------------------- */}

    <Typography
      sx={{
        fontFamily: '"Sora", sans-serif',

        fontSize: {
          xs: '17px',
          sm: '18px',
        },

        fontWeight: 800,

        color: '#131b2e',

        lineHeight: 1.25,

        mb: 0.55,
      }}
    >
      {feature.title}
    </Typography>

    {/* ---------------------------------------------------------------
        Short mobile description
    ---------------------------------------------------------------- */}

    <Typography
      sx={{
        fontFamily: '"Plus Jakarta Sans", sans-serif',

        fontSize: {
          xs: '12.5px',
          sm: '13.5px',
        },

        lineHeight: 1.48,

        color: '#687184',

        fontWeight: 500,

        maxWidth: 430,
      }}
    >
      {feature.mobileDesc}
    </Typography>
  </Box>
)

// -----------------------------------------------------------------------------
// Render helpers
// -----------------------------------------------------------------------------

const renderDesktopItems = (items) =>
  items.map((it) => (
    <FeatureBlock
      key={it.feature.title}
      {...it}
      desktop
      divided={false}
    />
  ))

const renderMobileItems = (items) =>
  items.map((it, j) => (
    <MobileFeatureBlock
      key={it.feature.title}
      {...it}
      divided={j > 0}
    />
  ))

// -----------------------------------------------------------------------------
// Main component
// -----------------------------------------------------------------------------

const WhyChooseUs = () => {
  const theme = useTheme()

  const desktop = useMediaQuery(theme.breakpoints.up('md'), {
    noSsr: true,
  })

  const [current, setCurrent] = useState(0)

  const prevRef = useRef(0)
  const startX = useRef(null)

  // ---------------------------------------------------------------------------
  // Desktop:
  //
  // Feature 01 permanently on left.
  //
  // Remaining pages:
  //
  // 02 / 03
  // 04 / 05
  // 06
  //
  // Mobile:
  //
  // 01 / 02
  // 03 / 04
  // 05 / 06
  // ---------------------------------------------------------------------------

  const leafList = desktop
    ? Array.from(
        {
          length: Math.ceil((features.length - 1) / 2),
        },
        (_, i) => ({
          front: toItems([features[1 + 2 * i]]),

          back: features[2 + 2 * i]
            ? toItems([features[2 + 2 * i]])
            : [],
        })
      )
    : Array.from(
        {
          length: Math.ceil(features.length / 2),
        },
        (_, i) => ({
          front: toItems(
            features.slice(2 * i, 2 * i + 2)
          ),

          back: [],
        })
      )

  const total = leafList.length

  const page = Math.min(current, total - 1)

  // ---------------------------------------------------------------------------
  // Previous page
  // ---------------------------------------------------------------------------

  useEffect(() => {
    prevRef.current = page
  }, [page])

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  const goTo = (n) => {
    setCurrent(
      Math.max(
        0,
        Math.min(total - 1, n)
      )
    )
  }

  // ---------------------------------------------------------------------------
  // Swipe / drag
  // ---------------------------------------------------------------------------

  const onPointerDown = (e) => {
    startX.current = e.clientX
  }

  const onPointerUp = (e) => {
    if (startX.current === null) return

    const dx = e.clientX - startX.current

    startX.current = null

    if (Math.abs(dx) > 40) {
      goTo(page + (dx < 0 ? 1 : -1))
    }
  }

  const onPointerCancel = () => {
    startX.current = null
  }

  // ---------------------------------------------------------------------------
  // Keyboard
  // ---------------------------------------------------------------------------

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      goTo(page + 1)
    }

    if (e.key === 'ArrowLeft') {
      goTo(page - 1)
    }
  }

  // ---------------------------------------------------------------------------
  // Flip animation
  // ---------------------------------------------------------------------------

  const from = prevRef.current

  const flipDelay = (i) => {
    if (from === page) return 0

    if (page > from && i >= from && i < page) {
      return (i - from) * STAGGER_MS
    }

    if (page < from && i >= page && i < from) {
      return (from - 1 - i) * STAGGER_MS
    }

    return 0
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Box
      component="section"
      id="why-choose-us"
      sx={{
        position: 'relative',

        pt: {
          xs: 5.5,
          md: 8,
        },

        pb: {
          xs: 6,
          md: 10,
        },

        overflow: 'hidden',

        bgcolor: '#faf8ff',
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* -------------------------------------------------------------------
            Header
        ------------------------------------------------------------------- */}

        <Box
          sx={{
            mb: {
              xs: 3.2,
              md: 5,
            },

            textAlign: 'center',

            px: {
              xs: 1,
              sm: 0,
            },
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Sora", sans-serif',

              fontSize: {
                xs: '26px',
                sm: '30px',
                md: '36px',
              },

              fontWeight: 800,

              lineHeight: 1.15,

              color: '#131b2e',

              mb: {
                xs: 1.2,
                md: 1.5,
              },
            }}
          >
            Why Earners Choose Us
          </Typography>

          <Typography
            sx={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',

              fontSize: {
                xs: '0.9rem',
                sm: '1rem',
                md: '1.2rem',
              },

              lineHeight: 1.5,

              color: '#1f2937',

              fontWeight: 500,

              maxWidth: 480,

              mx: 'auto',
            }}
          >
            From your first survey to your first payout — we've got you covered.
          </Typography>
        </Box>

        {/* -------------------------------------------------------------------
            Browser / card frame
        ------------------------------------------------------------------- */}

        <Box
          sx={{
            maxWidth: 920,

            mx: 'auto',

            borderRadius: {
              xs: '20px',
              md: '20px',
            },

            overflow: 'hidden',

            // Mobile = clean card
            // Desktop = browser
            bgcolor: {
              xs: '#ffffff',
              md: '#1c1c1e',
            },

            border: {
              xs: '1px solid rgba(83,18,188,0.08)',
              md: 'none',
            },

            boxShadow: {
              xs: '0 18px 45px rgba(19,27,46,0.10)',
              md: '0 30px 70px rgba(19,27,46,0.22), 0 8px 20px rgba(19,27,46,0.10)',
            },
          }}
        >
          {/* -----------------------------------------------------------------
              Desktop browser title bar
          ----------------------------------------------------------------- */}

          <Box
            sx={{
              height: 46,

              display: {
                xs: 'none',
                md: 'flex',
              },

              alignItems: 'center',

              gap: 1,

              px: 2.25,
            }}
          >
            {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
              <Box
                key={c}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: c,
                }}
              />
            ))}

            <Box
              sx={{
                ml: 1.5,

                px: 2,

                py: 0.6,

                borderRadius: '8px',

                bgcolor: '#2b2b2e',

                color: '#a8a8ad',

                fontFamily: '"Plus Jakarta Sans", sans-serif',

                fontSize: 13,

                lineHeight: 1.2,
              }}
            >
              pickopinion.com
            </Box>
          </Box>

          {/* -----------------------------------------------------------------
              Main stage
          ----------------------------------------------------------------- */}

          <Box
            tabIndex={0}
            role="region"
            aria-roledescription="carousel"
            aria-label="Why earners choose us"
            onKeyDown={onKeyDown}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
            sx={{
              position: 'relative',

              height: {
                xs: 330,
                sm: 350,
                md: 350,
              },

              perspective: {
                xs: '1400px',
                md: '2600px',
              },

              bgcolor: {
                xs: '#ffffff',
                md: '#ece7f7',
              },

              overflow: 'hidden',

              touchAction: 'pan-y',

              userSelect: 'none',

              cursor: 'grab',

              '&:active': {
                cursor: 'grabbing',
              },

              '&:focus-visible': {
                outline: `2px solid ${BRAND}`,
                outlineOffset: -2,
              },
            }}
          >
            {/* -----------------------------------------------------------------
                Desktop permanent left page
            ----------------------------------------------------------------- */}

            {desktop && (
              <Box
                sx={{
                  position: 'absolute',

                  top: 0,
                  bottom: 0,

                  left: 0,

                  width: '50%',

                  zIndex: 0,

                  bgcolor: '#ffffff',

                  display: 'flex',

                  flexDirection: 'column',

                  backgroundImage:
                    'linear-gradient(270deg, rgba(83,18,188,0.10) 0%, rgba(83,18,188,0) 5%)',
                }}
              >
                {renderDesktopItems(
                  toItems([features[0]])
                )}
              </Box>
            )}

            {/* -----------------------------------------------------------------
                Pages
            ----------------------------------------------------------------- */}

            {leafList.map((leaf, i) => {
              const flipped = i < page

              const delay = flipDelay(i)

              const turn = `${FLIP_MS}ms ${EASE} ${delay}ms`

              return (
                <Box
                  key={i}
                  sx={{
                    position: 'absolute',

                    top: 0,
                    bottom: 0,

                    left: desktop
                      ? '50%'
                      : 0,

                    width: desktop
                      ? '50%'
                      : '100%',

                    transformOrigin: 'left center',

                    transformStyle: 'preserve-3d',

                    transform: flipped
                      ? 'rotateY(-180deg)'
                      : 'rotateY(0deg)',

                    zIndex: flipped
                      ? i + 1
                      : total - i + 1,

                    transition: `transform ${turn}, z-index 0s ${
                      delay + FLIP_MS / 2
                    }ms`,

                    '@media (prefers-reduced-motion: reduce)': {
                      transition: 'none',
                    },
                  }}
                >
                  {/* ---------------------------------------------------------
                      FRONT
                  --------------------------------------------------------- */}

                  <Box
                    sx={{
                      position: 'absolute',

                      inset: 0,

                      backfaceVisibility: 'hidden',

                      WebkitBackfaceVisibility: 'hidden',

                      bgcolor: '#ffffff',

                      display: 'flex',

                      flexDirection: 'column',

                      backgroundImage: desktop
                        ? 'linear-gradient(90deg, rgba(83,18,188,0.10) 0%, rgba(83,18,188,0) 5%)'
                        : 'none',
                    }}
                  >
                    {desktop
                      ? renderDesktopItems(leaf.front)
                      : renderMobileItems(leaf.front)}

                    {/* Desktop flip shadow */}

                    <Box
                      sx={{
                        position: 'absolute',

                        inset: 0,

                        pointerEvents: 'none',

                        background:
                          'linear-gradient(90deg, rgba(19,27,46,0.32), rgba(19,27,46,0))',

                        opacity: flipped ? 1 : 0,

                        transition: `opacity ${turn}`,

                        display: {
                          xs: 'none',
                          md: 'block',
                        },
                      }}
                    />
                  </Box>

                  {/* ---------------------------------------------------------
                      BACK
                  --------------------------------------------------------- */}

                  <Box
                    sx={{
                      position: 'absolute',

                      inset: 0,

                      backfaceVisibility: 'hidden',

                      WebkitBackfaceVisibility: 'hidden',

                      transform: 'rotateY(180deg)',

                      bgcolor: leaf.back.length
                        ? '#ffffff'
                        : '#f7f4fc',

                      display: 'flex',

                      flexDirection: 'column',

                      backgroundImage: leaf.back.length
                        ? 'linear-gradient(270deg, rgba(83,18,188,0.10) 0%, rgba(83,18,188,0) 5%)'
                        : 'none',
                    }}
                  >
                    {desktop &&
                      renderDesktopItems(leaf.back)}

                    <Box
                      sx={{
                        position: 'absolute',

                        inset: 0,

                        pointerEvents: 'none',

                        background:
                          'linear-gradient(270deg, rgba(19,27,46,0.32), rgba(19,27,46,0))',

                        opacity: flipped ? 0 : 1,

                        transition: `opacity ${turn}`,

                        display: {
                          xs: 'none',
                          md: 'block',
                        },
                      }}
                    />
                  </Box>
                </Box>
              )
            })}

            {/* -----------------------------------------------------------------
                Desktop book spine
            ----------------------------------------------------------------- */}

            {desktop && (
              <Box
                sx={{
                  position: 'absolute',

                  top: 0,
                  bottom: 0,

                  left: 'calc(50% - 22px)',

                  width: 44,

                  zIndex: 100,

                  pointerEvents: 'none',

                  background:
                    'linear-gradient(90deg, rgba(19,27,46,0) 0%, rgba(19,27,46,0.13) 50%, rgba(19,27,46,0) 100%)',
                }}
              />
            )}
          </Box>

          {/* -----------------------------------------------------------------
              Pagination
          ----------------------------------------------------------------- */}

          <Box
            sx={{
              height: {
                xs: 42,
                md: 52,
              },

              bgcolor: '#ffffff',

              borderTop:
                '1px solid rgba(203,195,215,0.35)',

              display: 'flex',

              alignItems: 'center',

              justifyContent: 'center',

              gap: {
                xs: 0.2,
                md: 0.5,
              },
            }}
          >
            {leafList.map((_, i) => {
              const active = i === page

              return (
                <Box
                  key={i}
                  component="button"
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to page ${i + 1} of ${total}`}
                  aria-current={
                    active ? 'true' : undefined
                  }
                  sx={{
                    p: {
                      xs: 0.75,
                      md: 1,
                    },

                    border: 0,

                    bgcolor: 'transparent',

                    cursor: 'pointer',

                    display: 'flex',

                    alignItems: 'center',

                    '&:focus-visible': {
                      outline: `2px solid ${BRAND}`,
                      outlineOffset: 2,
                      borderRadius: 4,
                    },
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      display: 'block',

                      height: {
                        xs: 7,
                        md: 8,
                      },

                      width: active
                        ? {
                            xs: 22,
                            md: 26,
                          }
                        : {
                            xs: 7,
                            md: 8,
                          },

                      borderRadius: '4px',

                      bgcolor: active
                        ? BRAND
                        : 'rgba(83,18,188,0.22)',

                      transition:
                        'width 0.35s ease, background-color 0.35s ease',
                    }}
                  />
                </Box>
              )
            })}
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default WhyChooseUs