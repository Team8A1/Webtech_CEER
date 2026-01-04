import { useState, useEffect, useRef } from 'react'

function OurProjects() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  const newsItems = [
    {
      title: 'Smart Campus IoT System',
      date: 'November 2025',
      category: 'IoT',
      snippet: 'Developed an integrated IoT solution for campus automation including smart lighting, attendance tracking, and energy management.'
    },
    {
      title: 'AI-Powered Student Assistant Chatbot',
      date: 'October 2025',
      category: 'AI/ML',
      snippet: 'Created an intelligent chatbot using NLP to help students with course information, timetables, and academic queries.'
    },
    {
      title: 'Web-Based Library Management System',
      date: 'September 2025',
      category: 'Web Development',
      snippet: 'Full-stack application with React and Node.js for efficient book cataloging, issuing, and digital resource management.'
    },
    {
      title: 'Mobile App for Campus Navigation',
      date: 'August 2025',
      category: 'Mobile Dev',
      snippet: 'Cross-platform mobile application using React Native with AR features for indoor campus navigation and facility locator.'
    }
  ]

  return (
    <section ref={sectionRef} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-serif font-bold text-slate-900 mb-4">Our Projects</h2>
          <p className="text-xl text-slate-600">Innovative solutions built by our students</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {newsItems.map((item, index) => (
            <div
              key={index}
              className={`bg-slate-50 rounded-xl p-8 border border-slate-200 hover:border-maroon-700 transition-all duration-500 cursor-pointer ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="flex items-center gap-4 mb-4">
                <span className="px-4 py-1 bg-maroon-700 text-white text-sm font-semibold rounded-full">
                  {item.category}
                </span>
                <span className="text-sm text-slate-500">{item.date}</span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-slate-900 mb-3 hover:text-maroon-700 transition-colors">
                {item.title}
              </h3>
              <p className="text-slate-600 leading-relaxed mb-4">{item.snippet}</p>
              <a href="#" className="text-maroon-700 font-semibold hover:text-maroon-800 inline-flex items-center gap-2 transition-colors">
                Read More
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default OurProjects
