import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import LoadingSpinner from '../components/LoadingSpinner';

function ConnectionsPage() {
    const [requests, setRequests] = useState([]);
    const [connections, setConnections] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('requests');
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/signin');
                return;
            }

            const reqsRes = await axios.get('http://localhost:5000/api/connections/requests', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const connsRes = await axios.get('http://localhost:5000/api/connections/list', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const suggsRes = await axios.get('http://localhost:5000/api/user/suggestions', {
                headers: { Authorization: `Bearer ${token}` }
            });

            setRequests(reqsRes.data);
            setConnections(connsRes.data);
            setSuggestions(suggsRes.data);
        } catch (error) {
            console.error('Error fetching connection data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (connectionId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/connections/accept', { connectionId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Connection accepted!');
            fetchData();
        } catch (error) {
            alert('Error accepting connection');
        }
    };

    const handleReject = async (connectionId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/connections/reject', { connectionId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Connection rejected!');
            fetchData();
        } catch (error) {
            alert('Error rejecting connection');
        }
    };

    const handleConnect = async (receiverId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/connections/send', { receiverId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Request sent!');
            fetchData();
        } catch (error) {
            alert('Error sending request. Maybe already connected or pending.');
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex justify-center mt-20">
                    <LoadingSpinner size="lg" />
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="max-w-6xl mx-auto pb-10">
                <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6 mb-8 text-white">
                    <h1 className="text-2xl font-bold mb-6 text-blue-400">Manage Network</h1>
                    
                    <div className="flex space-x-4 border-b border-white/10 mb-6">
                        <button
                            onClick={() => setActiveTab('requests')}
                            className={`pb-2 px-2 text-sm font-medium ${activeTab === 'requests' ? 'border-b-2 border-blue-500 text-white' : 'text-white/60 hover:text-white'}`}
                        >
                            Pending Requests ({requests.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('connections')}
                            className={`pb-2 px-2 text-sm font-medium ${activeTab === 'connections' ? 'border-b-2 border-blue-500 text-white' : 'text-white/60 hover:text-white'}`}
                        >
                            My Connections ({connections.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('suggestions')}
                            className={`pb-2 px-2 text-sm font-medium ${activeTab === 'suggestions' ? 'border-b-2 border-blue-500 text-white' : 'text-white/60 hover:text-white'}`}
                        >
                            Suggestions ({suggestions.length})
                        </button>
                    </div>

                    <div className="space-y-4">
                        {activeTab === 'requests' && (
                            <>
                                {requests.length === 0 ? (
                                    <p className="text-white/50 text-center py-8">No pending requests.</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {requests.map(req => (
                                            <div key={req._id} className="bg-black/40 border border-white/10 rounded-lg p-4 flex flex-col items-center">
                                                <div className="w-16 h-16 rounded-full bg-blue-900 border-2 border-blue-500 mb-3 overflow-hidden flex items-center justify-center text-xl font-bold">
                                                    {req.sender?.profilePicture ? (
                                                        <img src={req.sender.profilePicture} alt={req.sender.username} className="w-full h-full object-cover" />
                                                    ) : (
                                                        req.sender?.username?.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <Link to={`/profile/${req.sender?._id}`} className="font-semibold hover:text-blue-400">{req.sender?.username}</Link>
                                                <p className="text-xs text-white/50 mb-4">{req.sender?.role} {req.sender?.department ? `• ${req.sender.department}` : ''}</p>
                                                
                                                <div className="flex gap-2 w-full mt-auto">
                                                    <button onClick={() => handleAccept(req._id)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs py-2 rounded-md transition font-medium">Accept</button>
                                                    <button onClick={() => handleReject(req._id)} className="flex-1 bg-red-600 hover:bg-red-700 text-xs py-2 rounded-md transition font-medium">Reject</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {activeTab === 'connections' && (
                            <>
                                {connections.length === 0 ? (
                                    <p className="text-white/50 text-center py-8">You have no connections yet.</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {connections.map(user => (
                                            <div key={user._id} className="bg-black/40 border border-white/10 rounded-lg p-4 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition" onClick={() => navigate(`/profile/${user._id}`)}>
                                                <div className="w-14 h-14 rounded-full bg-indigo-900 border border-indigo-500 overflow-hidden flex-shrink-0 flex items-center justify-center font-bold">
                                                    {user.profilePicture ? (
                                                        <img src={user.profilePicture} alt={user.username} className="w-full h-full object-cover" />
                                                    ) : (
                                                        user.username?.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <h3 className="font-semibold truncate">{user.username}</h3>
                                                    <p className="text-xs text-white/50 truncate mb-1">{user.role} {user.department ? `• ${user.department}` : ''}</p>
                                                </div>
                                                <button onClick={(e) => { e.stopPropagation(); navigate('/chat') }} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-md text-xs font-medium transition">
                                                    Message
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {activeTab === 'suggestions' && (
                            <>
                                {suggestions.length === 0 ? (
                                    <p className="text-white/50 text-center py-8">No people to suggest right now.</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {suggestions.map(user => (
                                            <div key={user._id} className="bg-black/40 border border-white/10 rounded-lg p-4 flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full flex-shrink-0 bg-gray-800 overflow-hidden flex items-center justify-center font-bold">
                                                    {user.profilePicture ? (
                                                        <img src={user.profilePicture} alt={user.username} className="w-full h-full object-cover" />
                                                    ) : (
                                                        user.username?.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <Link to={`/profile/${user._id}`} className="font-semibold text-sm hover:text-blue-400 truncate block">{user.username}</Link>
                                                    <p className="text-xs text-white/50 truncate mb-1">{user.role}</p>
                                                </div>
                                                {user.connectionStatus === 'pending' ? (
                                                    <span className="text-[10px] text-yellow-500 font-bold px-2">Pending</span>
                                                ) : (
                                                    <button onClick={() => handleConnect(user._id)} className="px-3 py-1 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/50 rounded-md text-xs font-medium transition">
                                                        Connect
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

export default ConnectionsPage;
