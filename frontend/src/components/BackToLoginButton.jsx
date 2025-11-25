import { useNavigate } from 'react-router-dom';

const BackToLoginButton = () => {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate('/login')}
            className="absolute top-6 left-6 text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2 transition-colors z-50"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to role selection
        </button>
    );
};

export default BackToLoginButton;
