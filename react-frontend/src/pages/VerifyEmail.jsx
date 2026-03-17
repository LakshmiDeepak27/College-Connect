import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AuthNavbar from '../components/AuthNavbar';

function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('No verification token provided.');
            return;
        }

        const verify = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/auth/verify-email?token=${token}`);
                setStatus('success');
                setMessage(res.data.message);
                setTimeout(() => {
                    navigate('/signin');
                }, 3000);
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Verification failed. Token may be expired.');
            }
        };

        verify();
    }, [token, navigate]);

    return (
        <div className="bg-black text-white min-h-screen relative font-sans">
            <AuthNavbar />
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center pt-32 px-4 h-[calc(100vh-80px)] overflow-hidden">
                <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-xl flex flex-col items-center">
                    {status === 'verifying' && (
                        <>
                            <div className="h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <h2 className="text-xl font-semibold mb-2">Verifying Email...</h2>
                            <p className="text-white/60 text-center">Please wait while we verify your email address.</p>
                        </>
                    )}
                    {status === 'success' && (
                        <>
                            <div className="h-16 w-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-4 border border-green-500/40">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <h2 className="text-xl font-semibold mb-2">Email Verified Successfully!</h2>
                            <p className="text-white/60 text-center mb-4">{message}</p>
                            <p className="text-white/40 text-sm">Redirecting to login...</p>
                            <Link to="/signin" className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-center transition-colors shadow-lg shadow-blue-500/30">
                                Go to Login
                            </Link>
                        </>
                    )}
                    {status === 'error' && (
                        <>
                            <div className="h-16 w-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mb-4 border border-red-500/40">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </div>
                            <h2 className="text-xl font-semibold mb-2">Verification Failed</h2>
                            <p className="text-white/60 text-center mb-6">{message}</p>
                            <Link to="/signup" className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-lg text-center transition-colors">
                                Return to Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default VerifyEmail;
