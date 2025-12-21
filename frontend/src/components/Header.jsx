import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-500 px-6 ${scrolled
        ? 'bg-[#0F172B]/90 backdrop-blur-md py-3 shadow-sm border-b border-slate-800'
        : 'bg-transparent py-4'
        }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img
              src="/images/logo.png"
              alt="KLE Tech Logo"
              className="h-10 w-auto object-contain"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-12">
            {[
              { name: 'Home', href: '#home' },
              { name: 'About', href: '#about' },
              { name: 'Login', href: '/login' }
            ].map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`text-sm uppercase tracking-widest font-medium transition-colors duration-300 relative group ${scrolled ? 'text-white hover:text-red-400' : 'text-white hover:text-gray-300'
                  }`}
              >
                {item.name}
                <span className={`absolute -bottom-2 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${scrolled ? 'bg-red-400' : 'bg-white'
                  }`}></span>
              </a>
            ))}
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors ${scrolled ? 'text-white hover:bg-white/10' : 'text-white hover:bg-white/10'
              }`}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden absolute top-full left-0 w-full bg-white border-t border-stone-100 transition-all duration-300 overflow-hidden shadow-xl ${isMobileMenuOpen ? 'max-h-96' : 'max-h-0'
          }`}>
          <nav className="flex flex-col p-6 space-y-6">
            {[
              { name: 'Home', href: '#home' },
              { name: 'About', href: '#about' },
              { name: 'Login', href: '/login' }
            ].map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-stone-600 hover:text-red-700 text-lg font-serif transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
