import Layout from '../components/Layout/Layout.jsx'
import Hero from '../components/sections/Hero.jsx'
import HowItWorks from '../components/sections/HowItWorks.jsx'
import WhyChooseUs from '../components/sections/WhyChooseUs.jsx'
import Redeem from '../components/sections/Redeem.jsx'
import FAQAndCTA from '../components/sections/FAQAndCTA.jsx'
import SEO from '../components/common/SEO'

const HomePage = () => {
  return (
    <>
    <SEO
        title="PickOpinion - Get Paid for Your Opinions | Paid Surveys & Rewards"
        description="Earn real money by sharing your opinions on PickOpinion. Take surveys, complete offers, and get paid via PayPal, UPI, Net Banking, crypto & gift cards. Join thousands earning daily!"
        keywords="paid surveys, earn money online, survey rewards, get paid for opinions, online earning, PickOpinion, paid surveys India, GPT site, offer walls, survey panel"
      />
    <Layout>
      <Hero />
      <HowItWorks />
      <WhyChooseUs />
      <Redeem />
     <FAQAndCTA />
    </Layout>
    </>
  )
}

export default HomePage