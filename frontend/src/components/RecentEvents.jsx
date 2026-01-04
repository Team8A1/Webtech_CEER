import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

function RecentEvents() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [recentEvents, setRecentEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/events');
                if (response.data.success && response.data.data.length > 0) {
                    // Sort events: active first, then inactive
                    const sortedEvents = response.data.data.sort((a, b) => {
                        if (a.isActive === b.isActive) return 0;
                        return a.isActive ? -1 : 1;
                    });
                    setRecentEvents(sortedEvents);
                } else {
                    // Fallback to sample data if no events found or API fails
                    setRecentEvents([
                        {
                            title: 'Tech Summit 2025',
                            date: 'December 15, 2025',
                            image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=500&fit=crop',
                            category: 'Conference',
                            isActive: true
                        },
                        {
                            title: 'Hackathon Week',
                            date: 'December 5-10, 2025',
                            image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=500&fit=crop',
                            category: 'Competition',
                            isActive: true
                        },
                        {
                            title: 'Cultural Festival',
                            date: 'November 28, 2025',
                            image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=500&fit=crop',
                            category: 'Cultural',
                            isActive: false
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
                        category: 'Conference',
                        isActive: true
                    },
                    {
                        title: 'Hackathon Week',
                        date: 'December 5-10, 2025',
                        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=500&fit=crop',
                        category: 'Competition',
                        isActive: true
                    },
                    {
                        title: 'Cultural Festival',
                        date: 'November 28, 2025',
                        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=500&fit=crop',
                        category: 'Cultural',
                        isActive: false
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
                    <h2 className="text-5xl md:text-6xl mt-2 font-serif font-bold text-maroon-700 mb-4">
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
                                onClick={() => setSelectedEvent(event)}
                                className={`transition-all duration-700 ease-out relative cursor-pointer ${position === 'center'
                                    ? 'w-80 md:w-[350px] h-[420px] md:h-[480px] scale-100 opacity-100 z-10'
                                    : 'w-52 md:w-60 h-[340px] md:h-[380px] scale-90 opacity-50'
                                    }`}
                            >
                                <div className="relative w-full h-full rounded-[2rem] overflow-hidden border border-slate-200/50 shadow-2xl transition-shadow duration-300 bg-white">
                                    <img
                                        src={event.image || event.imageUrl}
                                        alt={event.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />

                                    {/* Status Badge - Top Right */}
                                    {position === 'center' && (
                                        <div className="absolute top-4 right-4 z-20">
                                            {event.isActive ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                                    <span className="px-3 py-1 bg-green-600/90 backdrop-blur-md rounded-full text-xs font-bold tracking-wide text-white shadow-lg">UPCOMING</span>
                                                </div>
                                            ) : (
                                                <span className="px-3 py-1 bg-gray-600/90 backdrop-blur-md rounded-full text-xs font-bold tracking-wide text-white shadow-lg">INACTIVE</span>
                                            )}
                                        </div>
                                    )}

                                    {position === 'center' && (
                                        <>
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

            {/* Event Detail Modal */}
            {selectedEvent && (
                <div
                    className="fixed inset-0 bg-stone-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedEvent(null)}
                >
                    <div
                        className="bg-white rounded-[2rem] max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="grid md:grid-cols-[45%_55%] overflow-hidden">
                            {/* Left - Image Section */}
                            <div className="relative h-[500px] md:h-full bg-stone-50">
                                <img
                                    src={selectedEvent.image || selectedEvent.imageUrl}
                                    alt={selectedEvent.title}
                                    className="w-full h-full object-contain"
                                />
                                {/* Removed gradient overlay for better image visibility */}

                                {/* Status indicator on image */}
                                <div className="absolute top-4 left-4 z-20">
                                    {selectedEvent.isActive ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                            <span className="px-3 py-1 bg-green-600/90 backdrop-blur-md rounded-full text-xs font-bold tracking-wide text-white shadow-lg">UPCOMING</span>
                                        </div>
                                    ) : (
                                        <span className="px-3 py-1 bg-gray-600/90 backdrop-blur-md rounded-full text-xs font-bold tracking-wide text-white shadow-lg">INACTIVE</span>
                                    )}
                                </div>
                            </div>

                            {/* Right - Details Section */}
                            <div className="p-8 md:p-10 flex flex-col relative">
                                {/* Close Button */}
                                <button
                                    onClick={() => setSelectedEvent(null)}
                                    className="absolute top-4 right-4 p-2 hover:bg-stone-100 rounded-full transition-colors z-20"
                                >
                                    <X className="w-6 h-6 text-stone-400 hover:text-stone-900" />
                                </button>

                                {/* Category Badge */}
                                <div className="mb-4">
                                    <span className="inline-block px-4 py-1.5 bg-maroon-100 text-maroon-700 text-xs font-bold rounded-full uppercase tracking-widest">
                                        {selectedEvent.category}
                                    </span>
                                    {selectedEvent._id && (
                                        <p className="text-xs text-stone-500 mt-2 font-medium">ID: {selectedEvent._id.slice(-8)}</p>
                                    )}
                                </div>

                                {/* Title */}
                                <h2 className="text-4xl md:text-5xl font-serif text-stone-900 mb-6 leading-tight">
                                    {selectedEvent.title}
                                </h2>

                                {/* About Section */}
                                <div className="space-y-6 flex-1 overflow-y-auto max-h-[400px] pr-2">
                                    <div>
                                        <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <span className="w-8 h-px bg-stone-200"></span> Event Details
                                        </h4>
                                        <p className="text-stone-600 leading-relaxed font-light">
                                            {selectedEvent.title} is an exciting campus event happening on {selectedEvent.date}. Join us for an enriching experience and memorable moments.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-stone-100">
                                        <div>
                                            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Date</h4>
                                            <p className="text-lg font-semibold text-stone-900">{selectedEvent.date}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Category</h4>
                                            <p className="text-lg font-semibold text-stone-900">{selectedEvent.category}</p>
                                        </div>
                                    </div>

                                    {selectedEvent.isActive && (
                                        <div className="pt-4 border-t border-stone-100">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                                <span className="text-sm font-semibold text-green-700">This event is upcoming and active</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="pt-8 border-t border-stone-100 mt-8 flex gap-3">
                                    <button
                                        onClick={() => setSelectedEvent(null)}
                                        className="flex-1 px-6 py-3 border border-stone-200 text-stone-900 rounded-xl font-semibold hover:bg-stone-50 transition-colors"
                                    >
                                        Close
                                    </button>
                                    {selectedEvent.isActive && (
                                        <button className="flex-1 px-6 py-3 bg-maroon-700 text-white rounded-xl font-semibold hover:bg-maroon-800 transition-colors flex items-center justify-center gap-2">
                                            <span>Learn More</span>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default RecentEvents;
