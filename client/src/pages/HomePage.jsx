import Layout from '../components/Layout/Layout.jsx'
import Hero from '../components/sections/Hero.jsx'
import HowItWorks from '../components/sections/HowItWorks.jsx'
import WhyChooseUs from '../components/sections/WhyChooseUs.jsx'
import Redeem from '../components/sections/Redeem.jsx'
import WePaid from '../components/sections/WePaid.jsx'
import FinalCTA from '../components/sections/FinalCTA.jsx'

const HomePage = () => {
  return (
    <Layout>
      <Hero />
      <HowItWorks />
      <WhyChooseUs />
      <Redeem />
      <WePaid />
      <FinalCTA />
    </Layout>
  )
}

export default HomePage