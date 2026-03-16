import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../components/MainLayout';
import LoadingSpinner from '../components/LoadingSpinner';

function EventsPage() {
    const [events, setEvents] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        type: 'Virtual'
    });

    useEffect(() => {
        Promise.all([fetchCurrentUser(), fetchEvents()]).finally(() => setIsLoading(false));
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/user/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCurrentUser(res.data.user);
        } catch (error) {
            console.error('Error fetching user', error);
        }
    };

    const fetchEvents = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/events', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEvents(res.data);
        } catch (error) {
            console.error('Error fetching events', error);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/events/create', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Re-fetch to get correct sorting
            fetchEvents();
            setShowForm(false);
            setFormData({ title: '', description: '', date: '', location: '', type: 'Virtual' });
        } catch (error) {
            console.error('Error creating event', error);
        }
    };

    const handleAttend = async (eventId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`http://localhost:5000/api/events/attend/${eventId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update the specific event in state
            setEvents(events.map(ev => ev._id === eventId ? res.data : ev));
        } catch (error) {
            console.error('Error attending event', error);
        }
    };

    return (
        <MainLayout>
            <div className="w-full max-w-5xl mx-auto flex space-x-6">

                {/* Left Sidebar / Controls */}
                <div className="w-1/4">
                    <div className="bg-white/5 backdrop-blur-md rounded-xl shadow-sm border border-white/10 p-4 sticky top-20 text-white/90">
                        <h2 className="text-lg font-semibold text-white mb-4">Events Map</h2>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            {showForm ? 'Cancel Event' : 'Host an Event'}
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1">
                    {/* Create Event Form */}
                    {showForm && (
                        <div className="bg-white/5 backdrop-blur-md rounded-xl shadow-sm border border-white/10 p-6 mb-6 text-white/90">
                            <h3 className="text-lg font-semibold text-white mb-4">Host a new Event</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/70">Event Title *</label>
                                    <input type="text" name="title" required value={formData.title} onChange={handleInputChange} className="mt-1 block w-full rounded border-white/10 bg-white/5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 sm:text-sm p-2 border text-white placeholder-white/40" placeholder="e.g., Alumni Tech Meetup" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-white/70">Date & Time *</label>
                                        <input type="datetime-local" name="date" required value={formData.date} onChange={handleInputChange} className="mt-1 block w-full rounded border-white/10 bg-white/5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 sm:text-sm p-2 border text-white appearance-none color-scheme-dark" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-white/70">Type *</label>
                                        <select name="type" value={formData.type} onChange={handleInputChange} className="mt-1 block w-full rounded border-white/10 bg-white/5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 sm:text-sm p-2 border text-white">
                                            <option className="bg-[#0a0a0a]">Virtual</option>
                                            <option className="bg-[#0a0a0a]">In-Person</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/70">Location / Link *</label>
                                    <input type="text" name="location" required value={formData.location} onChange={handleInputChange} className="mt-1 block w-full rounded border-white/10 bg-white/5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 sm:text-sm p-2 border text-white placeholder-white/40" placeholder="Zip code, Address, or Zoom link" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/70">Description *</label>
                                    <textarea name="description" required rows="3" value={formData.description} onChange={handleInputChange} className="mt-1 block w-full rounded border-white/10 bg-white/5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 sm:text-sm p-2 border text-white placeholder-white/40" placeholder="What is this event about?"></textarea>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button type="submit" className="bg-blue-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                                        Create Event
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Events List */}
                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="py-10"><LoadingSpinner size="lg" /></div>
                        ) : events.length === 0 ? (
                            <div className="bg-white/5 backdrop-blur-md p-10 text-center rounded-xl shadow-sm border border-white/10">
                                <p className="text-white/50">No events are scheduled right now. Host one to bring people together!</p>
                            </div>
                        ) : (
                            events.map((ev) => {
                                const eventDate = new Date(ev.date);
                                const isAttending = currentUser && ev.attendees.some(a => a._id === currentUser._id);

                                return (
                                    <div key={ev._id} className="bg-white/5 backdrop-blur-md rounded-xl shadow-sm border border-white/10 hover:bg-white/10 transition-colors overflow-hidden">
                                        <div className="flex">
                                            {/* Date Box */}
                                            <div className="bg-white/5 backdrop-blur-sm w-24 flex flex-col items-center justify-center p-4 border-r border-white/10 flex-shrink-0">
                                                <span className="text-sm font-bold text-red-500 uppercase tracking-wider">
                                                    {eventDate.toLocaleString('default', { month: 'short' })}
                                                </span>
                                                <span className="text-2xl font-black text-white leading-none my-1">
                                                    {eventDate.getDate()}
                                                </span>
                                                <span className="text-xs font-medium text-white/50">
                                                    {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>

                                            {/* Content */}
                                            <div className="p-5 flex-1 text-white/90">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-white">{ev.title}</h3>
                                                        <p className="text-sm font-medium text-white/60 mt-1 flex items-center">
                                                            <svg className="w-4 h-4 mr-1 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                            {ev.type} • {ev.location}
                                                        </p>
                                                    </div>
                                                </div>

                                                <p className="mt-3 text-white/80 text-sm">{ev.description}</p>

                                                <div className="mt-5 flex justify-between items-center bg-white/5 border border-white/10 p-3 rounded-lg backdrop-blur-sm">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="h-8 w-8 rounded-full bg-white/10 overflow-hidden border border-white/5">
                                                            {ev.organizer.profilePicture ? (
                                                                <img src={ev.organizer.profilePicture} alt="" className="h-full w-full object-cover" />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center font-bold text-white/60">{ev.organizer?.username?.charAt(0)?.toUpperCase()}</div>
                                                            )}
                                                        </div>
                                                        <div className="text-xs">
                                                            <p className="font-medium text-white/90">Hosted by {ev.organizer.username}</p>
                                                            <p className="text-white/50">{ev.attendees.length} attending</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleAttend(ev._id)}
                                                        className={`text-sm font-medium py-1.5 px-4 rounded transition-colors shadow-sm ${isAttending
                                                                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                                                                : 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30'
                                                            }`}
                                                    >
                                                        {isAttending ? 'Attending ✓' : 'Attend Event'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

export default EventsPage;
