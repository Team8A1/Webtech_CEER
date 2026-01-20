import React from 'react';
import { useNavigate } from 'react-router-dom';

const ExplorerPortal = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-100 via-stone-50 to-white">
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/')}
                    className="mb-8 inline-flex items-center gap-2 text-stone-600 hover:text-maroon-700 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Home
                </button>

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-serif font-bold text-stone-900 mb-4">Explorer Portal</h1>
                    <p className="text-xl text-stone-600">Content will be added soon</p>
                </div>

                {/* Placeholder Content */}
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-stone-200">
                        <div className="w-20 h-20 bg-gradient-to-br from-maroon-100 to-maroon-200 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-maroon-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-serif font-bold text-stone-900 mb-4">Coming Soon</h2>
                        <p className="text-stone-600 text-lg mb-8">
                            This portal is currently under construction. Check back soon for updates!
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => navigate('/')}
                                className="px-8 py-3 bg-maroon-700 text-white rounded-xl hover:bg-maroon-800 transition-all font-semibold shadow-lg"
                            >
                                Return Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExplorerPortal;
