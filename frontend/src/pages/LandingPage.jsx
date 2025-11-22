import Header from '../components/Header'
import Hero from '../components/Hero'
import RecentEvents from '../components/RecentEvents'
import OurProjects from '../components/OurProjects'
import ResourcesSection from '../components/ResourcesSection'
import Footer from '../components/Footer'

function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div id="home">
        <Hero />
      </div>

      <div id="events">
        <RecentEvents />
      </div>

      <div id="news">
        <OurProjects />
      </div>

      <div id="about">
        <Footer />
      </div>
    </div>

  )
}

export default LandingPage
