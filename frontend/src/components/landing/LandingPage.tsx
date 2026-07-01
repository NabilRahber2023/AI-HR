import Navbar from './Navbar'
import Hero from './Hero'
import ResearchBackground from './ResearchBackground'
import Features from './Features'
import Objectives from './Objectives'
import Modules from './Modules'
import Workflow from './Workflow'
import TechStack from './TechStack'
import Footer from './Footer'

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0e0d16] text-[#e4e1ee] antialiased">
      {/* Ambient background glows */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-[#4f46e5]/15 blur-[160px]" />
        <div className="absolute top-1/3 -right-40 h-[32rem] w-[32rem] rounded-full bg-[#00a572]/10 blur-[160px]" />
        <div className="absolute bottom-0 -left-40 h-[32rem] w-[32rem] rounded-full bg-[#4f46e5]/10 blur-[160px]" />
      </div>

      <Navbar />
      <main>
        <Hero />
        <ResearchBackground />
        <Features />
        <Objectives />
        <Modules />
        <Workflow />
        <TechStack />
      </main>
      <Footer />
    </div>
  )
}
