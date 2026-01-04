import { useNavigate } from 'react-router-dom';

const BackToLoginButton = () => {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate('/login')}
            className="absolute top-8 left-8 bg-white border border-stone-300 text-stone-700 hover:text-stone-900 hover:border-stone-400 px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md z-50 group"
        >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm">Back to Roles</span>
        </button>
    );
};

export default BackToLoginButton;
