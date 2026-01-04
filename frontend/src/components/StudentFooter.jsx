import React from 'react';
import { Wind } from 'lucide-react';

const StudentFooter = () => (
    <footer className="bg-stone-50 pt-6 pb-4 border-t border-stone-200">
        <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                    {/* <Wind className="w-5 h-5 text-red-700" /> */}
                    {/* <span className="text-lg font-serif text-stone-900 tracking-widest font-bold">DASHBOARD</span> */}
                </div>
                <p className="text-stone-400 text-xs">© 2024 University Portal. All rights reserved.</p>
            </div>
        </div>
    </footer>
);

export default StudentFooter;
