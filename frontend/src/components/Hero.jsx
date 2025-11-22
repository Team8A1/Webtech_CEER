import { useState, useEffect } from 'react'

function Hero() {
  const [isVisible, setIsVisible] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const images = [
    '/images/college.png',
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1920',
    'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1920',
    'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1920'
  ]

  useEffect(() => {
    setIsVisible(true)
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [images.length])

  return (
    <section className="relative h-[600px] bg-slate-900 overflow-hidden">
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1500 ease-in-out ${
            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url('${image}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      ))}

      <div className="absolute inset-0 bg-slate-900/60" />
      
      {/* Bottom fade to white */}
      {/* <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent" /> */}

      <div className="relative h-full max-w-7xl mx-auto px-6 flex items-center">
        <div
          className={`max-w-3xl transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-0 pb-0 leading-tight">
            Welcome to CEER
          </h1>
          <p className="text-sm md:text-base text-slate-300 tracking-wider mt-0 pt-0">
            (center for engineering education research)
          </p>
          <p className="text-xl md:text-2xl text-slate-200 mb-2 leading-relaxed">
            Access your portal, resources & community. Your gateway to academic excellence and student life at KLE Tech.
          </p>
          
          {/* <div className="flex flex-wrap gap-4">
            <button className="px-8 py-3 bg-maroon-700 hover:bg-maroon-800 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
              Student Portal
            </button>
            <button className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg backdrop-blur-sm transition-all duration-300 border-2 border-white/30">
              Explore Resources
            </button>
          </div> */}
        </div>
      </div>
    </section>
  )
}

export default Hero
