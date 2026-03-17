import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../components/MainLayout';
import LoadingSpinner from '../components/LoadingSpinner';

function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchNotifications().finally(() => setIsLoading(false));
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data);
        } catch (error) {
            console.error('Error fetching notifications', error);
        }
    };

    const markAsRead = async (id = null) => {
        try {
            const token = localStorage.getItem('token');
            const url = id
                ? `http://localhost:5000/api/notifications/read/${id}`
                : `http://localhost:5000/api/notifications/read-all`;

            await axios.patch(url, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Local state update for snappy UI
            setNotifications(prev => prev.map(notif =>
                (id === null || notif._id === id) ? { ...notif, isRead: true } : notif
            ));
        } catch (error) {
            console.error('Error marking as read', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <MainLayout>
            <div className="w-full max-w-3xl mx-auto">
                <div className="bg-white/5 backdrop-blur-md rounded-xl shadow-sm border border-white/10 overflow-hidden text-white/90">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5 backdrop-blur-md">
                        <div className="flex items-center space-x-2">
                            <h1 className="text-xl font-semibold text-white">Notifications</h1>
                            {unreadCount > 0 && (
                                <span className="bg-blue-600/20 text-blue-400 border border-blue-500/20 text-xs font-semibold px-2 py-0.5 rounded-full">
                                    {unreadCount} New
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={() => markAsRead()}
                                className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="divide-y divide-white/5">
                        {isLoading ? (
                            <div className="py-10"><LoadingSpinner size="lg" /></div>
                        ) : notifications.length === 0 ? (
                            <div className="p-10 text-center text-white/50 flex flex-col items-center">
                                <svg className="w-12 h-12 text-white/20 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <p>You have no notifications yet.</p>
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification._id}
                                    onClick={() => !notification.isRead && markAsRead(notification._id)}
                                    className={`p-4 flex items-start space-x-4 transition-colors duration-150 cursor-pointer ${notification.isRead ? 'bg-transparent hover:bg-white/5' : 'bg-blue-900/20 hover:bg-blue-900/30'
                                        }`}
                                >
                                    <div className={`mt-1 flex-shrink-0 h-2 w-2 rounded-full ${notification.isRead ? 'bg-transparent' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]'}`}></div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <p className={`text-sm ${notification.isRead ? 'text-white/60' : 'text-white/90 font-medium'}`}>
                                                {notification.message}
                                            </p>
                                        </div>
                                        <p className="text-xs text-white/40 mt-1">
                                            {new Date(notification.createdAt).toLocaleString(undefined, {
                                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    {!notification.isRead && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                markAsRead(notification._id);
                                            }}
                                            className="text-xs font-medium text-blue-400 hover:text-blue-300"
                                        >
                                            Mark read
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

export default NotificationsPage;
