import React, { useState, useEffect, useRef, useCallback } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import axios from 'axios';
import { Save, Loader2, BookOpen, ShieldCheck } from 'lucide-react';

const AdminInstructions = () => {
    const [activeTab, setActiveTab] = useState('locker');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    const editorRef = useRef(null);
    const quillInstance = useRef(null);

    // Register Sizes and Fonts
    const Size = Quill.import('attributors/style/size');
    Size.whitelist = ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '32px', '48px'];
    Quill.register(Size, true);

    const Font = Quill.import('attributors/style/font');
    Font.whitelist = ['serif', 'monospace', 'arial', 'inter', 'georgia', 'courier'];
    Quill.register(Font, true);

    // Initialize Quill
    useEffect(() => {
        if (editorRef.current && !quillInstance.current) {
            quillInstance.current = new Quill(editorRef.current, {
                theme: 'snow',
                modules: {
                    toolbar: [
                        [{ 'font': ['serif', 'monospace', 'arial', 'inter', 'georgia', 'courier'] }],
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
            quillInstance.current.on('text-change', () => {
                // We don't necessarily need to sync to state on every change
                // but we can extract it on save
            });
        }
    }, []);

    const fetchContent = useCallback(async () => {
        setFetching(true);
        try {
            const title = activeTab === 'locker' ? 'Locker Instructions' : 'Thinkering Lab Policies';
            const response = await axios.get(`http://localhost:8000/api/instructions/${title}`);
            if (response.data.success) {
                const content = response.data.data.content || '';
                if (quillInstance.current) {
                    quillInstance.current.root.innerHTML = content;
                }
            }
        } catch (error) {
            console.error('Error fetching instructions:', error);
        } finally {
            setFetching(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchContent();
    }, [fetchContent]);

    const handleSave = async () => {
        if (!quillInstance.current) return;

        setLoading(true);
        setMessage({ type: '', text: '' });

        const content = quillInstance.current.root.innerHTML;

        try {
            const title = activeTab === 'locker' ? 'Locker Instructions' : 'Thinkering Lab Policies';
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:8000/api/instructions/${title}`,
                { content },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setMessage({ type: 'success', text: 'Instructions updated successfully!' });
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
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold mb-1">Student Instructions</h2>
                    <p className="text-gray-500 text-sm">Update locker rules and lab policies for students.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading || fetching}
                    className="flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                </button>
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {message.text}
                </div>
            )}

            <div className="flex gap-4 p-1 bg-gray-100 rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab('locker')}
                    className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'locker' ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <BookOpen className="w-4 h-4 inline mr-2" />
                    Locker Instructions
                </button>
                <button
                    onClick={() => setActiveTab('lab')}
                    className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'lab' ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <ShieldCheck className="w-4 h-4 inline mr-2" />
                    Lab Policies
                </button>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm min-h-[500px]">
                {fetching && (
                    <div className="flex items-center justify-center h-64 absolute inset-0 bg-white/50 z-10">
                        <Loader2 className="w-8 h-8 text-gray-300 animate-spin" />
                    </div>
                )}
                <div className="relative">
                    <div ref={editorRef} style={{ height: '400px' }} />
                </div>
            </div>
            <style>{`
                .ql-picker.ql-size .ql-picker-label::before,
                .ql-picker.ql-size .ql-picker-item::before {
                    content: attr(data-value) !important;
                }
                .ql-picker.ql-font[data-value="arial"] .ql-picker-label::before,
                .ql-picker.ql-font[data-value="arial"] .ql-picker-item::before {
                    content: "Arial" !important;
                    font-family: "Arial";
                }
                .ql-picker.ql-font[data-value="inter"] .ql-picker-label::before,
                .ql-picker.ql-font[data-value="inter"] .ql-picker-item::before {
                    content: "Inter" !important;
                    font-family: "Inter";
                }
                .ql-picker.ql-font[data-value="georgia"] .ql-picker-label::before,
                .ql-picker.ql-font[data-value="georgia"] .ql-picker-item::before {
                    content: "Georgia" !important;
                    font-family: "Georgia";
                }
                .ql-picker.ql-font[data-value="courier"] .ql-picker-label::before,
                .ql-picker.ql-font[data-value="courier"] .ql-picker-item::before {
                    content: "Courier" !important;
                    font-family: "Courier";
                }
            `}</style>
        </div>
    );
};

export default AdminInstructions;
