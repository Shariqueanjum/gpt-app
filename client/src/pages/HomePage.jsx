import Layout from '../components/Layout/Layout.jsx'
import Hero from '../components/sections/Hero.jsx'
import HowItWorks from '../components/sections/HowItWorks.jsx'
import WhyChooseUs from '../components/sections/WhyChooseUs.jsx'
import Redeem from '../components/sections/Redeem.jsx'
import FAQAndCTA from '../components/sections/FAQAndCTA.jsx'
import SEO from '../components/common/SEO'
import FadeInSection from '../components/common/FadeInSection'

const HomePage = () => {
  return (
    <>
    <SEO
        title="PickOpinion - Get Paid for Your Opinions | Paid Surveys & Rewards"
        description="Earn real money by sharing your opinions on PickOpinion. Take surveys, complete offers, and get paid via PayPal, UPI, Net Banking, crypto & gift cards. Join thousands earning daily!"
        keywords="paid surveys, earn money online, survey rewards, get paid for opinions, online earning, PickOpinion, paid surveys India, GPT site, offer walls, survey panel"
      />
    <Layout>
    <FadeInSection><Hero /></FadeInSection>
    <FadeInSection delay={0.1}><HowItWorks /></FadeInSection>
    <FadeInSection delay={0.1}><WhyChooseUs /></FadeInSection>
    <FadeInSection delay={0.1}><Redeem /></FadeInSection>
    <FadeInSection delay={0.1}><FAQAndCTA /></FadeInSection>
    </Layout>
    </>
  )
}

export default HomePage