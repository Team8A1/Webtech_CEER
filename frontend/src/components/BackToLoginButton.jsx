import { useNavigate } from 'react-router-dom';

const BackToLoginButton = () => {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate('/login')}
            className="absolute top-12 left-12 bg-white border border-stone-200 text-stone-600 hover:text-stone-900 px-6 py-2.5 rounded-full font-medium flex items-center gap-2.5 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 z-50 group"
        >
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to roles
        </button>
    );
};

export default BackToLoginButton;
