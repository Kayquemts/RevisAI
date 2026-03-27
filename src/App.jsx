import Navbar from './components/Navbar'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'

export default function App() {
  return (
    <div className="min-h-screen bg-[#f5f5ec]">
      <Navbar />
      <Hero />
      <HowItWorks />
    </div>
  )
}