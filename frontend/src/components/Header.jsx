import { useState, useEffect } from 'react'

function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const maxScroll = 200 // Full solid at 200px
      const progress = Math.min(scrollY / maxScroll, 1) // 0 to 1
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isScrolled = scrollProgress > 0.25

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-shadow duration-300 ${
        isScrolled ? 'shadow-lg' : ''
      } py-2`}
      style={{
        background: `linear-gradient(to bottom, 
          rgba(25, 30, 38, ${scrollProgress}) 0%, 
          rgba(25, 30, 38, ${scrollProgress}) ${scrollProgress * 100}%, 
          transparent ${scrollProgress * 100}%, 
          transparent 100%)`
      }}
    >
      <div className="max-w-full px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src="/images/logo.png" 
              alt="KLE Tech Logo" 
              className="h-10 w-auto object-contain"
            />
          </div>

          <nav className="hidden lg:flex items-center space-x-8">
            <a href="#home" className="text-white hover:text-maroon-400 font-medium transition-colors duration-200">
              Home
            </a>
            <a href="#about" className="text-white hover:text-maroon-400 font-medium transition-colors duration-200">
              About
            </a>
            {/* <a href="#departments" className="text-white hover:text-maroon-400 font-medium transition-colors duration-200">
              Departments
            </a>
            <a href="#resources" className="text-white hover:text-maroon-400 font-medium transition-colors duration-200">
              Student Resources
            </a>
            <a href="#contact" className="text-white hover:text-maroon-400 font-medium transition-colors duration-200">
              Contact
            </a> */}
            <a href="/login" className="text-white hover:text-maroon-400 font-medium transition-colors duration-200">
              Login
            </a>
          </nav>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {isMobileMenuOpen && (
          <nav className="lg:hidden mt-4 pb-4 space-y-3 bg-[#191E26] rounded-lg px-4 py-3 shadow-xl">
            <a href="#home" className="block text-white hover:text-maroon-400 font-medium transition-colors duration-200 py-2">
              Home
            </a>
            <a href="#about" className="block text-white hover:text-maroon-400 font-medium transition-colors duration-200 py-2">
              About
            </a>
            {/* <a href="#departments" className="block text-white hover:text-maroon-400 font-medium transition-colors duration-200 py-2">
              Departments
            </a>
            <a href="#resources" className="block text-white hover:text-maroon-400 font-medium transition-colors duration-200 py-2">
              Student Resources
            </a>
            <a href="#contact" className="block text-white hover:text-maroon-400 font-medium transition-colors duration-200 py-2">
              Contact
            </a> */}
            <a href="/login" className="block text-white hover:text-maroon-400 font-medium transition-colors duration-200 py-2">
              Login
            </a>
          </nav>
        )}
      </div>
    </header>
  )
}

export default Header
