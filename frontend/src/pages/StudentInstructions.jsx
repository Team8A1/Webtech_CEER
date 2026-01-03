import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, ShieldCheck, ArrowLeft } from 'lucide-react';

const StudentInstructions = () => {
    const [activeTab, setActiveTab] = useState('locker');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mark as seen when visiting the page
        localStorage.setItem('lastSeenInstructions', new Date().toISOString());
        // Trigger a custom event so the navbar can update immediately
        window.dispatchEvent(new Event('instructionsSeen'));
    }, []);

    useEffect(() => {
        fetchContent();
    }, [activeTab]);

    const fetchContent = async () => {
        setLoading(true);
        try {
            const title = activeTab === 'locker' ? 'Locker Instructions' : 'Thinkering Lab Policies';
            const response = await axios.get(`http://localhost:8000/api/instructions/${title}`);
            if (response.data.success) {
                setContent(response.data.data.content);
            }
        } catch (error) {
            console.error('Error fetching instructions:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 pt-28 pb-12 px-6">
            <div className="max-w-4xl mx-auto relative">
                <Link
                    to="/student/dashboard"
                    className="absolute -top-20 -left-12 inline-flex items-center gap-2 text-stone-500 hover:text-red-700 transition-all bg-white/50 hover:bg-white border border-stone-200/60 px-4 py-2 rounded-full shadow-sm hover:shadow-md text-sm font-medium group transition-all duration-300"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>

                <div className="mb-12">
                    <h1 className="text-4xl font-serif text-stone-900 mb-4">Instructions</h1>
                    <p className="text-stone-500 font-light tracking-wide">Guidelines and policies for the Thinkering Lab members.</p>
                </div>

                <div className="flex gap-4 mb-8 p-1 bg-stone-100 rounded-2xl w-fit">
                    <button
                        onClick={() => setActiveTab('locker')}
                        className={`px-8 py-3 rounded-xl text-sm font-bold tracking-widest transition-all duration-300 flex items-center gap-2 ${activeTab === 'locker' ? 'bg-white text-red-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                    >
                        <BookOpen className="w-4 h-4" />
                        LOCKER INSTRUCTIONS
                    </button>
                    <button
                        onClick={() => setActiveTab('lab')}
                        className={`px-8 py-3 rounded-xl text-sm font-bold tracking-widest transition-all duration-300 flex items-center gap-2 ${activeTab === 'lab' ? 'bg-white text-red-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                    >
                        <ShieldCheck className="w-4 h-4" />
                        LAB POLICIES
                    </button>
                </div>

                <div className="bg-white rounded-3xl p-10 shadow-sm border border-stone-100 min-h-[400px]">
                    {loading ? (
                        <div className="flex items-center justify-center space-x-2 animate-pulse h-64">
                            <div className="w-2 h-2 bg-red-700 rounded-full"></div>
                            <div className="w-2 h-2 bg-red-700 rounded-full"></div>
                            <div className="w-2 h-2 bg-red-700 rounded-full"></div>
                        </div>
                    ) : (
                        <div className="prose prose-stone max-w-none">
                            <div
                                className="ql-editor !p-0"
                                dangerouslySetInnerHTML={{ __html: content || '<p className="text-stone-400 italic">No instructions available at the moment.</p>' }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentInstructions;
