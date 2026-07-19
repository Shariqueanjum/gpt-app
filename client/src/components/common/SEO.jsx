import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * SEO Component - Updates page title, meta description, and OG tags dynamically
 * Also helps Google generate sitelinks by providing clear page structure
 * 
 * Example usage in ANY page:
 * <SEO 
 *   title="Cookie Policy | PickOpinion" 
 *   description="Learn how PickOpinion uses cookies..."
 *   keywords="cookie policy, PickOpinion cookies..."
 *   noIndex={false}
 * />
 */
const SEO = ({ 
  title = 'PickOpinion - Get Paid for Your Opinions',
  description = 'Earn real money by sharing your opinions on PickOpinion. Take surveys, complete offers, and get paid via PayPal, UPI, Net Banking, crypto & gift cards.',
  keywords = 'paid surveys, earn money online, survey rewards, PickOpinion',
  ogImage = 'https://www.pickopinion.com/images/logo.png',
  ogType = 'website',
  noIndex = false
}) => {
  const location = useLocation()
  const canonicalUrl = `https://www.pickopinion.com${location.pathname}`

  useEffect(() => {
    // Update document title
    document.title = title

    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]')
    if (!metaDescription) {
      metaDescription = document.createElement('meta')
      metaDescription.setAttribute('name', 'description')
      document.head.appendChild(metaDescription)
    }
    metaDescription.setAttribute('content', description)

    // Update meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]')
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta')
      metaKeywords.setAttribute('name', 'keywords')
      document.head.appendChild(metaKeywords)
    }
    metaKeywords.setAttribute('content', keywords)

    // Update canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]')
    if (!canonicalLink) {
      canonicalLink = document.createElement('link')
      canonicalLink.setAttribute('rel', 'canonical')
      document.head.appendChild(canonicalLink)
    }
    canonicalLink.setAttribute('href', canonicalUrl)

    // Update OG tags
    const ogTags = {
      'og:title': title,
      'og:description': description,
      'og:url': canonicalUrl,
      'og:image': ogImage,
      'og:type': ogType,
    }

    Object.entries(ogTags).forEach(([property, content]) => {
      let tag = document.querySelector(`meta[property="${property}"]`)
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('property', property)
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', content)
    })

    // Update Twitter tags
    const twitterTags = {
      'twitter:title': title,
      'twitter:description': description,
      'twitter:url': canonicalUrl,
      'twitter:image': ogImage,
    }

    Object.entries(twitterTags).forEach(([property, content]) => {
      let tag = document.querySelector(`meta[property="${property}"]`)
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('property', property)
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', content)
    })

    // Robots meta (noIndex option)
    let robotsMeta = document.querySelector('meta[name="robots"]')
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta')
      robotsMeta.setAttribute('name', 'robots')
      document.head.appendChild(robotsMeta)
    }
    robotsMeta.setAttribute('content', noIndex ? 'noindex, nofollow' : 'index, follow')

    // Cleanup not needed - next page will overwrite
  }, [title, description, keywords, canonicalUrl, ogImage, ogType, noIndex])

  return null
}

export default SEO