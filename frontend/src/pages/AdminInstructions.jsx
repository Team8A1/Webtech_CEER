import React, { useState, useEffect, useRef, useCallback } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import axios from 'axios';
import { Save, Loader2, BookOpen, ShieldCheck, Edit2 } from 'lucide-react';

const AdminInstructions = () => {
    const [activeTab, setActiveTab] = useState('locker');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const editorRef = useRef(null);
    const quillInstance = useRef(null);

    // Register Sizes and Fonts with more options
    const Size = Quill.import('attributors/style/size');
    Size.whitelist = ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '32px', '48px'];
    Quill.register(Size, true);

    const Font = Quill.import('attributors/style/font');
    Font.whitelist = ['serif', 'monospace', 'arial', 'inter', 'georgia', 'courier', 'verdana', 'trebuchet', 'times', 'helvetica', 'comic-sans'];
    Quill.register(Font, true);

    // Handle beforeunload to warn about unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    // Initialize Quill
    useEffect(() => {
        if (editorRef.current && !quillInstance.current) {
            quillInstance.current = new Quill(editorRef.current, {
                theme: 'snow',
                modules: {
                    toolbar: [
                        [{ 'font': ['serif', 'monospace', 'arial', 'inter', 'georgia', 'courier', 'verdana', 'trebuchet', 'times', 'helvetica', 'comic-sans'] }],
                        [{ 'size': ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '32px', '48px'] }],
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'align': [] }],
                        ['link', 'clean']
                    ]
                },
                placeholder: 'Write instructions here...'
            });

            // Handle content changes
            quillInstance.current.on('text-change', (delta, oldDelta, source) => {
                if (source === 'user') {
                    setHasUnsavedChanges(true);
                    // Save to localStorage to preserve unsaved changes
                    const content = quillInstance.current.root.innerHTML;
                    localStorage.setItem(`unsaved_${activeTab}`, content);
                }
            });
        }
    }, []);

    const fetchContent = useCallback(async () => {
        setFetching(true);
        try {
            let title = '';
            if (activeTab === 'locker') title = 'Locker Instructions';
            else if (activeTab === 'lab') title = 'Thinkering Lab Policies';
            else if (activeTab === 'custom') title = 'Custom Instructions';

            // Check for unsaved changes in localStorage first
            const unsavedContent = localStorage.getItem(`unsaved_${activeTab}`);

            if (unsavedContent) {
                // Load unsaved content
                if (quillInstance.current) {
                    quillInstance.current.root.innerHTML = unsavedContent;
                    setHasUnsavedChanges(true);
                }
            } else {
                // Fetch from server
                const response = await axios.get(`http://localhost:8000/api/instructions/${title}`);
                if (response.data.success) {
                    const content = response.data.data.content || '';
                    if (quillInstance.current) {
                        quillInstance.current.root.innerHTML = content;
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching instructions:', error);
            // If fetch fails, still load unsaved content if available
            const unsavedContent = localStorage.getItem(`unsaved_${activeTab}`);
            if (unsavedContent && quillInstance.current) {
                quillInstance.current.root.innerHTML = unsavedContent;
                setHasUnsavedChanges(true);
            } else if (quillInstance.current) {
                quillInstance.current.root.innerHTML = '';
            }
        } finally {
            setFetching(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchContent();
    }, [fetchContent]);

    const handleTabChange = (tab) => {
        if (hasUnsavedChanges) {
            if (!window.confirm('You have unsaved changes. Switching tabs will keep them in draft. Continue?')) {
                return;
            }
        }
        setActiveTab(tab);
        setHasUnsavedChanges(false);
    };

    const handleSave = async () => {
        if (!quillInstance.current) return;

        setLoading(true);
        setMessage({ type: '', text: '' });

        const content = quillInstance.current.root.innerHTML;

        try {
            let title = '';
            if (activeTab === 'locker') title = 'Locker Instructions';
            else if (activeTab === 'lab') title = 'Thinkering Lab Policies';
            else if (activeTab === 'custom') title = 'Custom Instructions';

            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:8000/api/instructions/${title}`,
                { content },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setMessage({ type: 'success', text: 'Instructions updated successfully!' });
                setHasUnsavedChanges(false);
                // Clear unsaved content from localStorage after successful save
                localStorage.removeItem(`unsaved_${activeTab}`);
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update instructions.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto p-6">
            <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold mb-1">Student Instructions</h2>
                    <p className="text-stone-500 text-sm">Update locker rules, lab policies, and custom instructions for students.</p>
                </div>
                <div className="flex items-center gap-4">
                    {hasUnsavedChanges && (
                        <span className="text-xs text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200 font-medium">
                            Unsaved Changes
                        </span>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={loading || fetching}
                        className="flex items-center gap-2 px-6 py-2.5 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {message.text}
                </div>
            )}

            <div className="flex gap-4 p-1 bg-stone-100 rounded-lg w-fit">
                <button
                    onClick={() => handleTabChange('locker')}
                    className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'locker' ? 'bg-white shadow text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}
                >
                    <BookOpen className="w-4 h-4 inline mr-2" />
                    Locker Instructions
                </button>
                <button
                    onClick={() => handleTabChange('lab')}
                    className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'lab' ? 'bg-white shadow text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}
                >
                    <ShieldCheck className="w-4 h-4 inline mr-2" />
                    Lab Policies
                </button>
                <button
                    onClick={() => handleTabChange('custom')}
                    className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'custom' ? 'bg-white shadow text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}
                >
                    <Edit2 className="w-4 h-4 inline mr-2" />
                    Custom Instructions
                </button>
            </div>

            <div className="bg-white border border-stone-100 rounded-xl overflow-hidden shadow-sm min-h-[500px]">
                {fetching && (
                    <div className="flex items-center justify-center h-64 absolute inset-0 bg-white/50 z-10">
                        <Loader2 className="w-8 h-8 text-stone-300 animate-spin" />
                    </div>
                )}
                <div className="relative">
                    <div ref={editorRef} style={{ height: '400px' }} />
                </div>
            </div>
            <style>{`
                /* Spacing between toolbar groups */
                .ql-toolbar .ql-formats {
                    margin-right: 24px !important;
                }
                
                .ql-picker.ql-size .ql-picker-label::before,
                .ql-picker.ql-size .ql-picker-item::before {
                    content: attr(data-value) !important;
                }
                .ql-picker.ql-font[data-value="arial"] .ql-picker-label::before, .ql-picker.ql-font[data-value="arial"] .ql-picker-item::before { content: "Arial" !important; font-family: "Arial"; }
                .ql-picker.ql-font[data-value="inter"] .ql-picker-label::before, .ql-picker.ql-font[data-value="inter"] .ql-picker-item::before { content: "Inter" !important; font-family: "Inter"; }
                .ql-picker.ql-font[data-value="georgia"] .ql-picker-label::before, .ql-picker.ql-font[data-value="georgia"] .ql-picker-item::before { content: "Georgia" !important; font-family: "Georgia"; }
                .ql-picker.ql-font[data-value="courier"] .ql-picker-label::before, .ql-picker.ql-font[data-value="courier"] .ql-picker-item::before { content: "Courier" !important; font-family: "Courier"; }
                .ql-picker.ql-font[data-value="verdana"] .ql-picker-label::before, .ql-picker.ql-font[data-value="verdana"] .ql-picker-item::before { content: "Verdana" !important; font-family: "Verdana"; }
                .ql-picker.ql-font[data-value="trebuchet"] .ql-picker-label::before, .ql-picker.ql-font[data-value="trebuchet"] .ql-picker-item::before { content: "Trebuchet MS" !important; font-family: "Trebuchet MS"; }
                .ql-picker.ql-font[data-value="times"] .ql-picker-label::before, .ql-picker.ql-font[data-value="times"] .ql-picker-item::before { content: "Times New Roman" !important; font-family: "Times New Roman"; }
                .ql-picker.ql-font[data-value="helvetica"] .ql-picker-label::before, .ql-picker.ql-font[data-value="helvetica"] .ql-picker-item::before { content: "Helvetica" !important; font-family: "Helvetica"; }
                .ql-picker.ql-font[data-value="comic-sans"] .ql-picker-label::before, .ql-picker.ql-font[data-value="comic-sans"] .ql-picker-item::before { content: "Comic Sans" !important; font-family: "Comic Sans MS"; }
            `}</style>
        </div>
    );
};

export default AdminInstructions;
