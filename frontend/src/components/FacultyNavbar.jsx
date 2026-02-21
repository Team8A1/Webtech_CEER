import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Wind, LogOut, KeyRound, X } from 'lucide-react';
import axios from 'axios';
import { BASE_URL } from '../utils/api';

function FacultyNavbar({ user, onPasswordChange }) {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login/faculty');
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
            const response = await axios.post(
                `${BASE_URL}/api/faculty/auth/change-password`,
                {
                    email: user?.email,
                    oldPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                setPasswordSuccess('Password updated successfully');

                // Update local storage
                const currentUser = JSON.parse(localStorage.getItem('user'));
                if (currentUser) {
                    currentUser.mustChangePassword = false;
                    localStorage.setItem('user', JSON.stringify(currentUser));
                }

                setTimeout(() => {
                    setShowPasswordModal(false);
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setPasswordSuccess('');
                    if (onPasswordChange) {
                        onPasswordChange();
                    }
                }, 2000);
            }
        } catch (error) {
            setPasswordError(error.response?.data?.message || 'Failed to update password');
        }
    };

    return (
        <>
            <nav
                className={`fixed w-full z-50 transition-all duration-500 ${scrolled
                    ? "bg-white/90 backdrop-blur-md py-4 shadow-sm border-b border-stone-100"
                    : "bg-transparent py-8"
                    }`}
            >
                <div className="container mx-auto px-36 flex justify-between items-center">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/faculty')}>
                        <Wind className="w-6 h-6 text-red-700" />
                        <span className={`text-2xl font-serif tracking-widest font-bold transition-colors duration-500 ${scrolled ? 'text-stone-900' : 'text-stone-900'}`}>
                            Thinkering Lab
                        </span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-12">
                        <div className="flex items-center gap-4">
                            {user && (
                                <span className="text-sm font-medium text-stone-600 hidden lg:block">
                                    Hello, {(user.name || 'Faculty').toUpperCase()}
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
                </div>
            </nav>

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl relative">
                        <button
                            onClick={() => setShowPasswordModal(false)}
                            className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-2xl font-serif text-stone-900 mb-2">
                            Update Password
                        </h2>
                        <p className="text-sm text-stone-500 mb-6 font-light">
                            Set a new password for your account.
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
                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">
                                    Current Password
                                </label>
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
                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">
                                    New Password
                                </label>
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
                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">
                                    Confirm Password
                                </label>
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
            )}
        </>
    );
}

export default FacultyNavbar;
