import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

const ImageUploadZone = ({ onImageSelect, existingImage = null, onRemove }) => {
    const [preview, setPreview] = useState(existingImage);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);
    const dropZoneRef = useRef(null);

    useEffect(() => {
        setPreview(existingImage);
    }, [existingImage]);

    const validateFile = (file) => {
        // Check if it's an image
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file (PNG, JPG, GIF, etc.)');
            return false;
        }

        // Check file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            setError('Image size must be less than 5MB');
            return false;
        }

        setError('');
        return true;
    };

    const handleFile = (file) => {
        if (!validateFile(file)) return;

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);

        // Pass file to parent
        onImageSelect(file);
    };

    const handleFileInput = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    const handlePaste = (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file) {
                    handleFile(file);
                }
                break;
            }
        }
    };

    const handleRemoveImage = () => {
        setPreview(null);
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (onRemove) {
            onRemove();
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    // Add paste event listener
    useEffect(() => {
        const handleDocumentPaste = (e) => {
            // Only handle paste if the drop zone is focused or if we're in the modal
            if (dropZoneRef.current?.contains(document.activeElement) ||
                document.activeElement?.tagName === 'BODY') {
                handlePaste(e);
            }
        };

        document.addEventListener('paste', handleDocumentPaste);
        return () => {
            document.removeEventListener('paste', handleDocumentPaste);
        };
    }, []);

    return (
        <div className="space-y-2">
            <label className="block text-sm font-bold text-stone-700">
                Project Image <span className="text-stone-400 font-normal">(Optional)</span>
            </label>

            {preview ? (
                <div className="relative group">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-xl border-2 border-stone-200"
                    />
                    <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                    >
                        <X size={18} />
                    </button>
                    <div className="absolute bottom-3 left-3 right-3 bg-black/50 backdrop-blur-sm text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        Click the × button to remove or click to replace
                    </div>
                    <div
                        onClick={handleClick}
                        className="absolute inset-0 cursor-pointer"
                    />
                </div>
            ) : (
                <div
                    ref={dropZoneRef}
                    onClick={handleClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    tabIndex={0}
                    className={`
                        relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                        transition-all duration-200
                        ${isDragging
                            ? 'border-maroon-500 bg-maroon-50 scale-[1.02]'
                            : 'border-stone-300 bg-stone-50 hover:border-maroon-400 hover:bg-maroon-50/50'
                        }
                    `}
                >
                    <div className="flex flex-col items-center gap-3">
                        <div className={`p-4 rounded-full ${isDragging ? 'bg-maroon-100' : 'bg-stone-200'} transition-colors`}>
                            {isDragging ? (
                                <Upload className="text-maroon-600" size={32} />
                            ) : (
                                <ImageIcon className="text-stone-500" size={32} />
                            )}
                        </div>
                        <div>
                            <p className="text-stone-700 font-medium mb-1">
                                {isDragging ? 'Drop image here' : 'Click to upload, drag & drop, or paste'}
                            </p>
                            <p className="text-sm text-stone-500">
                                PNG, JPG, GIF up to 5MB
                            </p>
                        </div>
                        <div className="flex gap-2 text-xs text-stone-400">
                            <span className="px-2 py-1 bg-white rounded border border-stone-200">Click to browse</span>
                            <span className="px-2 py-1 bg-white rounded border border-stone-200">Drag & drop</span>
                            <span className="px-2 py-1 bg-white rounded border border-stone-200">Ctrl/Cmd + V</span>
                        </div>
                    </div>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
            />

            {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                    <X size={16} />
                    {error}
                </div>
            )}

            <p className="text-xs text-stone-500">
                💡 Tip: You can paste an image directly from your clipboard (screenshots, copied images)
            </p>
        </div>
    );
};

export default ImageUploadZone;
