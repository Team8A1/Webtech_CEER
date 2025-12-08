import React, { useState, useEffect } from 'react';
import axios from 'axios';

function RecentEvents() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [recentEvents, setRecentEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/events');
                if (response.data.success && response.data.data.length > 0) {
                    setRecentEvents(response.data.data);
                } else {
                    // Fallback to sample data if no events found or API fails
                    setRecentEvents([
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
                        }
                    ]);
                }
            } catch (error) {
                console.error('Error fetching events:', error);
                setRecentEvents([
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
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const handlePrevious = () => {
        setActiveIndex((prev) => (prev === 0 ? recentEvents.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setActiveIndex((prev) => (prev === recentEvents.length - 1 ? 0 : prev + 1));
    };

    const getVisibleCards = () => {
        if (recentEvents.length === 0) return [];
        const prevIndex = activeIndex === 0 ? recentEvents.length - 1 : activeIndex - 1;
        const nextIndex = activeIndex === recentEvents.length - 1 ? 0 : activeIndex + 1;
        return [
            { event: recentEvents[prevIndex], position: 'left', index: prevIndex },
            { event: recentEvents[activeIndex], position: 'center', index: activeIndex },
            { event: recentEvents[nextIndex], position: 'right', index: nextIndex }
        ];
    };

    if (loading) return null;

    return (
        <section className="py-0 bg-white from-slate-50 via-white to-slate-100 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-0">
                    <div className="inline-block mb-0">

                    </div>
                    <h2 className="text-5xl md:text-6xl mt-2 font-bold text-maroon-700 mb-4">
                        Recent Events
                    </h2>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Explore the vibrant moments and memorable experiences from our campus
                    </p>
                </div>

                <div className="relative flex items-center justify-center min-h-[550px]">
                    {/* Left Arrow */}
                    <button
                        onClick={handlePrevious}
                        className="absolute left-0 md:left-4 z-20 w-14 h-14 flex items-center justify-center bg-white/80 backdrop-blur-sm text-slate-800 hover:bg-white hover:text-maroon-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                        aria-label="Previous event"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* Cards Container */}
                    <div className="flex items-center justify-center gap-6 md:gap-10 w-full max-w-6xl">
                        {getVisibleCards().map(({ event, position, index }) => (
                            <div
                                key={index}
                                className={`transition-all duration-700 ease-out ${position === 'center'
                                        ? 'w-80 md:w-[350px] h-[420px] md:h-[480px] scale-100 opacity-100 z-10'
                                        : 'w-52 md:w-60 h-[340px] md:h-[380px] scale-90 opacity-50'
                                    }`}
                            >
                                <div className="relative w-full h-full rounded-[2rem] overflow-hidden border border-slate-200/50 shadow-2xl hover:shadow-3xl transition-shadow duration-300 bg-white">
                                    <img
                                        src={event.image || event.imageUrl} // Handle both potential backend keys
                                        alt={event.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />

                                    {position === 'center' && (
                                        <>
                                            {/* Animated Border Glow */}
                                            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />

                                            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="px-4 py-1.5 bg-maroon-700/90 backdrop-blur-md rounded-full text-xs font-bold tracking-wide uppercase shadow-lg">
                                                        {event.category}
                                                    </span>
                                                    <div className="flex-1 h-px bg-gradient-to-r from-white/50 to-transparent" />
                                                </div>
                                                <h3 className="text-2xl md:text-3xl font-bold mb-2 drop-shadow-lg">
                                                    {event.title}
                                                </h3>
                                                <div className="flex items-center gap-2 text-sm text-slate-200">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    {event.date}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Arrow */}
                    <button
                        onClick={handleNext}
                        className="absolute right-0 md:right-4 z-20 w-14 h-14 flex items-center justify-center bg-white/80 backdrop-blur-sm text-slate-800 hover:bg-white hover:text-maroon-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                        aria-label="Next event"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Modern Dots Indicator */}
                <div className="flex justify-center items-center gap-3 mt-16">
                    {recentEvents.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveIndex(index)}
                            className={`transition-all duration-500 rounded-full ${index === activeIndex
                                    ? 'w-12 h-3 bg-maroon-700 shadow-lg'
                                    : 'w-3 h-3 bg-slate-300 hover:bg-slate-400 hover:scale-125'
                                }`}
                            aria-label={`Go to event ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

export default RecentEvents;
