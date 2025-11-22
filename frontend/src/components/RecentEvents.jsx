import { useState, useRef } from 'react'

function RecentEvents() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(0)
  const [dragCurrent, setDragCurrent] = useState(0)
  const carouselRef = useRef(null)

  const campusEvents = [
    {
      title: 'Tech Summit 2025',
      date: 'December 15, 2025',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=500&fit=crop',
      category: 'Conference'
    },
    {
      title: 'Hackathon Week',
      date: 'December 5-10, 2025',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=500&fit=crop',
      category: 'Competition'
    },
    {
      title: 'Cultural Festival',
      date: 'November 28, 2025',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=500&fit=crop',
      category: 'Cultural'
    },
    {
      title: 'Industry Expert Talk',
      date: 'November 25, 2025',
      image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&h=500&fit=crop',
      category: 'Seminar'
    },
    {
      title: 'Sports Championship',
      date: 'December 1-3, 2025',
      image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=500&fit=crop',
      category: 'Sports'
    },
    {
      title: 'Research Symposium',
      date: 'December 20, 2025',
      image: 'https://plus.unsplash.com/premium_photo-1677567996070-68fa4181775a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cmVzZWFyY2h8ZW58MHx8MHx8fDA%3D',
      category: 'Academic'
    }
  ]

  // Get card index helper
  const getIndex = (offset) => (currentIndex + offset + campusEvents.length) % campusEvents.length

  // Get prev, current, next cards
  const prevEvent = campusEvents[getIndex(-1)]
  const currentEvent = campusEvents[currentIndex]
  const nextEvent = campusEvents[getIndex(1)]

  // Mouse/Touch drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true)
    setDragStart(e.clientX)
    setDragCurrent(e.clientX)
  }

  const handleTouchStart = (e) => {
    setIsDragging(true)
    setDragStart(e.touches[0].clientX)
    setDragCurrent(e.touches[0].clientX)
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    setDragCurrent(e.clientX)
  }

  const handleTouchMove = (e) => {
    if (!isDragging) return
    setDragCurrent(e.touches[0].clientX)
  }

  const handleMouseUp = () => {
    if (!isDragging) return
    setIsDragging(false)
    handleDragEnd()
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    setIsDragging(false)
    handleDragEnd()
  }

  const handleDragEnd = () => {
    const dragDistance = dragStart - dragCurrent
    const swipeThreshold = 50

    if (dragDistance > swipeThreshold) {
      // Dragged left - show next card
      setCurrentIndex((prev) => (prev + 1) % campusEvents.length)
    } else if (dragDistance < -swipeThreshold) {
      // Dragged right - show previous card
      setCurrentIndex((prev) => (prev - 1 + campusEvents.length) % campusEvents.length)
    }
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-maroon-700 mb-4">
            Campus Highlights
          </h2>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto">
            Discover standout events and activities shaping our campus journey.
          </p>
        </div>

        {/* Carousel Container */}
        <div
          ref={carouselRef}
          className="relative flex items-center justify-center min-h-[550px] cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Carousel Content */}
          <div className="w-full flex items-center justify-center gap-4 md:gap-8 select-none">
            {/* Left Card */}
            <div className="hidden md:block transition-all duration-500 ease-out transform scale-85 opacity-40">
              <div className="relative w-64 h-80 rounded-[2rem] overflow-hidden border border-slate-200/50 shadow-lg bg-white pointer-events-none">
                <img
                  src={prevEvent.image}
                  alt={prevEvent.title}
                  className="w-full h-full object-cover"
                  draggable="false"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
              </div>
            </div>

            {/* Center Card (Active) */}
            <div className="transition-all duration-500 ease-out transform scale-100 opacity-100">
              <div className="relative w-80 md:w-96 h-96 md:h-[480px] rounded-[2rem] overflow-hidden border border-slate-200/50 shadow-2xl bg-white group pointer-events-none">
                <img
                  src={currentEvent.image}
                  alt={currentEvent.title}
                  className="w-full h-full object-cover"
                  draggable="false"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/40 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                  {/* Category Badge */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-4 py-1.5 bg-maroon-700/90 backdrop-blur-md rounded-full text-xs font-bold tracking-wide uppercase shadow-lg">
                      {currentEvent.category}
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-white/50 to-transparent" />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl md:text-3xl font-bold mb-3 drop-shadow-lg leading-tight">
                    {currentEvent.title}
                  </h3>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-sm text-slate-200">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {currentEvent.date}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card */}
            <div className="hidden md:block transition-all duration-500 ease-out transform scale-85 opacity-40">
              <div className="relative w-64 h-80 rounded-[2rem] overflow-hidden border border-slate-200/50 shadow-lg bg-white pointer-events-none">
                <img
                  src={nextEvent.image}
                  alt={nextEvent.title}
                  className="w-full h-full object-cover"
                  draggable="false"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
              </div>
            </div>
          </div>
        </div>

        {/* Indicators */}
        <div className="flex justify-center items-center gap-3 mt-12">
          {campusEvents.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`transition-all duration-500 rounded-full hover:scale-125 ${
                index === currentIndex
                  ? 'w-12 h-3 bg-maroon-700 shadow-lg'
                  : 'w-3 h-3 bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Go to event ${index + 1}`}
            />
          ))}
        </div>

        {/* Drag instruction text */}
        <p className="text-center text-slate-500 text-sm mt-6">Drag to navigate • Click dots to jump</p>
      </div>
    </section>
  )
}

export default RecentEvents
