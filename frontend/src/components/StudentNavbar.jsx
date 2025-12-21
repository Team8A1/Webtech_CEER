import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Wind, LogOut } from 'lucide-react';

const StudentNavbar = ({ user }) => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login/student');
    };

    return (
        <nav
            className={`fixed w-full z-50 transition-all duration-500 ${scrolled
                ? "bg-white/90 backdrop-blur-md py-4 shadow-sm border-b border-stone-100"
                : "bg-transparent py-8"
                }`}
        >
            <div className="container mx-auto px-6 flex justify-between items-center">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/student/dashboard')}>
                    <Wind className="w-6 h-6 text-red-700" />
                    <span className={`text-2xl font-serif tracking-widest font-bold transition-colors duration-500 ${scrolled ? 'text-stone-900' : 'text-stone-900'}`}>
                        Thinkering Lab
                    </span>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-12">
                    {['Projects', 'Team', 'Resources'].map((item) => (
                        <a
                            key={item}
                            href={`/student/dashboard#${item.toLowerCase()}`}
                            className="text-sm uppercase tracking-widest transition-colors relative group text-stone-500 hover:text-stone-900"
                        >
                            {item}
                            <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-red-700 transition-all duration-300 group-hover:w-full"></span>
                        </a>
                    ))}

                    <div className="flex items-center gap-4">
                        {user && (
                            <span className="text-sm font-medium text-stone-600 hidden lg:block">
                                Hello, {user.name || 'Student'}
                            </span>
                        )}
                        <button
                            onClick={handleLogout}
                            className="px-6 py-2 border rounded-full transition-all duration-300 text-sm tracking-wider border-stone-200 text-stone-900 hover:bg-red-700 hover:text-white hover:border-red-700 flex items-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            LOGOUT
                        </button>
                    </div>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-stone-900"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden absolute top-full left-0 w-full bg-white border-t border-stone-100 transition-all duration-300 overflow-hidden shadow-xl ${mobileMenuOpen ? 'max-h-96' : 'max-h-0'}`}>
                <div className="flex flex-col p-6 space-y-6">
                    {user && (
                        <div className="text-stone-500 text-sm font-medium pb-4 border-b border-stone-100">
                            Signed in as {user.name}
                        </div>
                    )}
                    {['Projects', 'Team', 'Resources'].map((item) => (
                        <a key={item} href={`/student/dashboard#${item.toLowerCase()}`} className="text-stone-600 hover:text-red-700 text-lg font-serif">
                            {item}
                        </a>
                    ))}
                    <button onClick={handleLogout} className="text-red-700 font-serif text-lg flex items-center gap-2">
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default StudentNavbar;
