import { useEffect, useRef, useState } from 'react'
import { Box } from '@mui/material'

const FadeInSection = ({ children, delay = 0, direction = 'up', distance = 50, duration = 0.7 }) => {
  const [isVisible, setIsVisible] = useState(false)
  const domRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 }
    )

    const current = domRef.current
    if (current) observer.observe(current)

    return () => {
      if (current) observer.unobserve(current)
    }
  }, [])

  const getTransform = () => {
    if (isVisible) return 'translateY(0) translateX(0) scale(1)'
    switch (direction) {
      case 'up': return `translateY(${distance}px)`
      case 'down': return `translateY(-${distance}px)`
      case 'left': return `translateX(${distance}px)`
      case 'right': return `translateX(-${distance}px)`
      case 'zoom': return 'scale(0.85)'
      case 'zoomUp': return `scale(0.9) translateY(${distance * 0.6}px)`
      default: return `translateY(${distance}px)`
    }
  }

  return (
    <Box
      ref={domRef}
      sx={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: `opacity ${duration}s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s, transform ${duration}s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </Box>
  )
}

export default FadeInSection