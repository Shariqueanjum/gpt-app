import Layout from '../components/Layout/Layout.jsx'
import Hero from '../components/sections/Hero.jsx'
import HowItWorks from '../components/sections/HowItWorks.jsx'
import WhyChooseUs from '../components/sections/WhyChooseUs.jsx'
import Redeem from '../components/sections/Redeem.jsx'
import FAQAndCTA from '../components/sections/FAQAndCTA.jsx'

const HomePage = () => {
  return (
    <Layout>
      <Hero />
      <HowItWorks />
      <WhyChooseUs />
      <Redeem />
     <FAQAndCTA />
    </Layout>
  )
}

export default HomePage