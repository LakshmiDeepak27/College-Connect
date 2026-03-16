import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import MainLayout from '../components/MainLayout';
import LoadingSpinner from '../components/LoadingSpinner';

function ChatPage() {
    const [connections, setConnections] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoadingConnections, setIsLoadingConnections] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const socketRef = useRef();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Initialize socket
        socketRef.current = io('http://localhost:5000');

        fetchUserProfile();

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!currentUser) return;
        fetchConnections();
    }, [currentUser]);

    useEffect(() => {
        if (!socketRef.current) return;

        socketRef.current.on('receive_message', (msg) => {
            // Only add if it belongs to the current open chat
            if (
                selectedUser &&
                (msg.sender === selectedUser._id || msg.receiver === selectedUser._id)
            ) {
                setMessages((prev) => [...prev, msg]);
                scrollToBottom();
            }
        });

        return () => {
            socketRef.current.off('receive_message');
        };
    }, [selectedUser]);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/user/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCurrentUser(res.data.user);
        } catch (error) {
            console.error('Error fetching profile', error);
        }
    };

    const fetchConnections = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/user/connections/${currentUser._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setConnections(res.data);
        } catch (error) {
            console.error('Error fetching connections', error);
        } finally {
            setIsLoadingConnections(false);
        }
    };

    const handleSelectUser = async (user) => {
        setSelectedUser(user);
        setIsLoadingMessages(true);

        // Define room name based on sorted IDs
        const room = [currentUser._id, user._id].sort().join('_');
        socketRef.current.emit('join_room', room);

        // Fetch history
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/messages/${user._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(res.data);
            scrollToBottom();
        } catch (error) {
            console.error('Error fetching history', error);
        } finally {
            setIsLoadingMessages(false);
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        const room = [currentUser._id, selectedUser._id].sort().join('_');
        const messageData = {
            room,
            sender: currentUser._id,
            receiver: selectedUser._id,
            text: newMessage
        };

        socketRef.current.emit('send_message', messageData);
        setNewMessage('');
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    return (
        <MainLayout>
            <div className="w-full flex space-x-6 h-[calc(100vh-100px)]">
                {/* Left Sidebar - Contacts List */}
                <div className="w-1/3 bg-white/5 backdrop-blur-md rounded-xl shadow-sm border border-white/10 overflow-hidden flex flex-col h-full text-white/90">
                    <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center backdrop-blur-md">
                        <h2 className="text-lg font-semibold text-white">Connections</h2>
                        <span className="bg-blue-600/20 text-blue-400 border border-blue-500/20 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {connections.length}
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {isLoadingConnections ? (
                            <div className="py-10"><LoadingSpinner color="text-blue-400" /></div>
                        ) : connections.length === 0 ? (
                            <div className="p-6 text-center text-white/50 text-sm">
                                You don't have any connections yet to chat with.
                            </div>
                        ) : (
                            <ul>
                                {connections.map((user) => (
                                        <li
                                        key={user._id}
                                        onClick={() => handleSelectUser(user)}
                                        className={`p-4 border-b border-white/5 cursor-pointer transition-colors duration-150 flex items-center space-x-3 
                                            ${selectedUser?._id === user._id ? 'bg-blue-600/10 border-l-4 border-l-blue-500' : 'hover:bg-white/5 border-l-4 border-l-transparent'}`}
                                    >
                                        <div className="h-10 w-10 rounded-full bg-blue-900/40 flex items-center justify-center text-blue-200 font-bold flex-shrink-0 overflow-hidden border border-blue-500/20">
                                            {user.profilePicture ? (
                                                <img src={user.profilePicture} alt="Profile" className="h-full w-full object-cover" />
                                            ) : (
                                                user.username?.charAt(0)?.toUpperCase()
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{user.username}</p>
                                            <p className="text-xs text-white/50 truncate capitalize">{user.role}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 bg-white/5 backdrop-blur-md rounded-xl shadow-sm border border-white/10 flex flex-col h-full relative overflow-hidden text-white/90">
                    {selectedUser ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-white/10 bg-white/5 flex items-center space-x-3 shadow-sm z-10 backdrop-blur-md">
                                <div className="h-10 w-10 rounded-full bg-blue-900/40 flex items-center justify-center text-blue-200 font-bold overflow-hidden border border-blue-500/20">
                                    {selectedUser.profilePicture ? (
                                        <img src={selectedUser.profilePicture} alt="Profile" className="h-full w-full object-cover" />
                                    ) : (
                                        selectedUser.username?.charAt(0)?.toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-white">{selectedUser.username}</h2>
                                    <p className="text-xs text-blue-400 capitalize font-medium">{selectedUser.department || selectedUser.role}</p>
                                </div>
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {isLoadingMessages ? (
                                    <div className="h-full flex items-center justify-center"><LoadingSpinner size="lg" color="text-blue-400" /></div>
                                ) : messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-white/40">
                                        <svg className="w-12 h-12 mb-3 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        <p className="text-sm border border-white/10 bg-white/5 px-4 py-2 rounded-full shadow-sm text-white/60">Start a professional conversation with {selectedUser.username}</p>
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => {
                                        const isMe = msg.sender === currentUser._id;
                                        return (
                                            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm backdrop-blur-md ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white/10 border border-white/10 text-white rounded-bl-none'
                                                    }`}>
                                                    <p>{msg.text}</p>
                                                    <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-white/40'}`}>
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Chat Input */}
                            <div className="p-4 bg-white/5 border-t border-white/10 backdrop-blur-md">
                                <form onSubmit={handleSendMessage} className="flex space-x-3 items-end">
                                    <div className="flex-1 border border-white/10 rounded-2xl bg-white/5 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-white/20 transition-all duration-200 p-1 flex">
                                        <textarea
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage(e);
                                                }
                                            }}
                                            placeholder="Type a message..."
                                            className="w-full bg-transparent border-none focus:ring-0 resize-none text-sm p-3 max-h-32 text-white placeholder-white/40"
                                            rows="1"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm flex-shrink-0"
                                    >
                                        <svg className="w-5 h-5 ml-1 transform rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </button>
                                </form>
                                <div className="mt-2 text-center">
                                    <p className="text-[10px] text-white/30">Press Enter to send, Shift + Enter for new line</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-white/50 bg-white/5 backdrop-blur-md">
                            <div className="h-20 w-20 bg-blue-900/30 rounded-full flex items-center justify-center mb-4 border border-blue-500/20">
                                <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-white mb-1">Your Messages</h3>
                            <p className="text-sm max-w-xs text-center text-white/60">Select a connection from the left to start a professional conversation.</p>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}

export default ChatPage;
