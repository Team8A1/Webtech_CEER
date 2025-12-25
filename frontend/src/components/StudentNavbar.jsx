import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Wind, LogOut, KeyRound } from 'lucide-react';
import axios from 'axios';

const StudentNavbar = ({ user }) => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (user && user.mustChangePassword) {
            setShowPasswordModal(true);
        }
    }, [user]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login/student');
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:8000/api/student/auth/change-password',
                {
                    email: user.email,
                    oldPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                setPasswordSuccess('Password updated successfully');

                // Update local storage to reflect password change requirement met
                const currentUser = JSON.parse(localStorage.getItem('user'));
                if (currentUser) {
                    currentUser.mustChangePassword = false;
                    localStorage.setItem('user', JSON.stringify(currentUser));
                }

                setTimeout(() => {
                    setShowPasswordModal(false);
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setPasswordSuccess('');
                    // Reload to update application state
                    window.location.reload();
                }, 2000);
            }
        } catch (error) {
            setPasswordError(error.response?.data?.message || 'Failed to update password');
        }
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
                                Hello, {(user.name || 'Student').toUpperCase()}
                            </span>
                        )}
                        <button
                            onClick={() => setShowPasswordModal(true)}
                            className="p-2 border rounded-full transition-all duration-300 text-sm tracking-wider border-stone-200 text-stone-900 hover:bg-stone-900 hover:text-white hover:border-stone-900 flex items-center gap-2"
                            title="Change Password"
                        >
                            <KeyRound className="w-4 h-4" />
                        </button>
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
                            Signed in as {user.name.toUpperCase()}
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

            {/* Password Modal */}
            {
                showPasswordModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl relative">
                            {(!user || !user.mustChangePassword) && (
                                <button
                                    onClick={() => setShowPasswordModal(false)}
                                    className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}

                            <h2 className="text-2xl font-serif text-stone-900 mb-2">
                                {user?.mustChangePassword ? 'Security Alert' : 'Update Password'}
                            </h2>
                            <p className="text-sm text-stone-500 mb-6 font-light">
                                {user?.mustChangePassword
                                    ? 'You must change your default password to continue using the portal.'
                                    : 'Set a new password for your account to enable manual login.'}
                            </p>

                            {passwordError && (
                                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                                    {passwordError}
                                </div>
                            )}

                            {passwordSuccess && (
                                <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100">
                                    {passwordSuccess}
                                </div>
                            )}

                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Current Password</label>
                                    <input
                                        type="password"
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                        className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">New Password</label>
                                    <input
                                        type="password"
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                        className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-3 bg-stone-900 text-white rounded-full font-bold text-sm tracking-widest hover:bg-red-700 transition-colors shadow-lg"
                                >
                                    UPDATE PASSWORD
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }
        </nav >
    );
};

export default StudentNavbar;
