import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../components/MainLayout';
import LoadingSpinner from '../components/LoadingSpinner';

function OpportunitiesPage() {
    const [opportunities, setOpportunities] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        type: 'Full-time',
        location: '',
        description: '',
        applicationLink: ''
    });

    useEffect(() => {
        fetchOpportunities().finally(() => setIsLoading(false));
    }, []);

    const fetchOpportunities = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/opportunities', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOpportunities(res.data);
        } catch (error) {
            console.error('Error fetching opportunities', error);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/opportunities/create', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOpportunities([res.data, ...opportunities]);
            setShowForm(false);
            setFormData({
                title: '', company: '', type: 'Full-time', location: '', description: '', applicationLink: ''
            });
        } catch (error) {
            console.error('Error creating opportunity', error);
        }
    };

    return (
        <MainLayout>
            <div className="w-full max-w-5xl mx-auto flex space-x-6">

                {/* Left Sidebar / Controls */}
                <div className="w-1/4">
                    <div className="bg-white/5 backdrop-blur-md rounded-xl shadow-sm border border-white/10 p-4 sticky top-20 text-white/90">
                        <h2 className="text-lg font-semibold text-white mb-4">Opportunities</h2>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            {showForm ? 'Cancel Posting' : 'Post Opportunity'}
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1">
                    {/* Create Opportunity Form */}
                    {showForm && (
                        <div className="bg-white/5 backdrop-blur-md rounded-xl shadow-sm border border-white/10 p-6 mb-6 text-white/90">
                            <h3 className="text-lg font-semibold text-white mb-4">Post a new opportunity</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-white/70">Job Title *</label>
                                        <input type="text" name="title" required value={formData.title} onChange={handleInputChange} className="mt-1 block w-full rounded border-white/10 bg-white/5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 sm:text-sm p-2 border text-white placeholder-white/40" placeholder="e.g., Software Engineer Intern" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-white/70">Company *</label>
                                        <input type="text" name="company" required value={formData.company} onChange={handleInputChange} className="mt-1 block w-full rounded border-white/10 bg-white/5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 sm:text-sm p-2 border text-white placeholder-white/40" placeholder="e.g., Tech Corp" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-white/70">Type *</label>
                                        <select name="type" value={formData.type} onChange={handleInputChange} className="mt-1 block w-full rounded border-white/10 bg-white/5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 sm:text-sm p-2 border text-white">
                                            <option className="bg-[#0a0a0a]">Full-time</option>
                                            <option className="bg-[#0a0a0a]">Part-time</option>
                                            <option className="bg-[#0a0a0a]">Internship</option>
                                            <option className="bg-[#0a0a0a]">Freelance</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-white/70">Location *</label>
                                        <input type="text" name="location" required value={formData.location} onChange={handleInputChange} className="mt-1 block w-full rounded border-white/10 bg-white/5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 sm:text-sm p-2 border text-white placeholder-white/40" placeholder="e.g., Remote, CA" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/70">Description *</label>
                                    <textarea name="description" required rows="3" value={formData.description} onChange={handleInputChange} className="mt-1 block w-full rounded border-white/10 bg-white/5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 sm:text-sm p-2 border text-white placeholder-white/40" placeholder="Describe the role and requirements..."></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/70">Application Link (Optional)</label>
                                    <input type="url" name="applicationLink" value={formData.applicationLink} onChange={handleInputChange} className="mt-1 block w-full rounded border-white/10 bg-white/5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 sm:text-sm p-2 border text-white placeholder-white/40" placeholder="https://" />
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button type="submit" className="bg-blue-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                                        Post
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Opportunities List */}
                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="py-10"><LoadingSpinner size="lg" /></div>
                        ) : opportunities.length === 0 ? (
                            <div className="bg-white/5 backdrop-blur-md p-10 text-center rounded-xl shadow-sm border border-white/10">
                                <p className="text-white/50">No opportunities have been posted yet. Be the first!</p>
                            </div>
                        ) : (
                            opportunities.map((opp) => (
                                <div key={opp._id} className="bg-white/5 backdrop-blur-md rounded-xl shadow-sm border border-white/10 p-5 hover:bg-white/10 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold text-white">{opp.title}</h3>
                                            <p className="text-lg font-medium text-blue-400 mt-1">{opp.company}</p>
                                        </div>
                                        <span className="bg-blue-900/40 text-blue-300 text-xs font-semibold px-2.5 py-1 rounded border border-blue-500/30">
                                            {opp.type}
                                        </span>
                                    </div>

                                    <div className="flex items-center text-sm text-white/50 mt-3 space-x-4">
                                        <div className="flex items-center">
                                            <svg className="w-4 h-4 mr-1 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            {opp.location}
                                        </div>
                                        <div className="flex items-center">
                                            <svg className="w-4 h-4 mr-1 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            {new Date(opp.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <p className="mt-4 text-white/80 text-sm whitespace-pre-wrap">{opp.description}</p>

                                    <div className="mt-6 flex justify-between items-center border-t border-white/10 pt-4">
                                        <div className="flex items-center space-x-2">
                                            <div className="h-8 w-8 rounded-full bg-white/10 overflow-hidden flex-shrink-0 border border-white/10">
                                                {opp.author.profilePicture ? (
                                                    <img src={opp.author.profilePicture} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center font-bold text-white/60">{opp.author?.username?.charAt(0)?.toUpperCase()}</div>
                                                )}
                                            </div>
                                            <div className="text-xs">
                                                <p className="font-medium text-white/90">Posted by {opp.author.username}</p>
                                                <p className="text-white/50 capitalize">{opp.author.role}</p>
                                            </div>
                                        </div>
                                        {opp.applicationLink && (
                                            <a
                                                href={opp.applicationLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm font-medium text-white bg-green-600 hover:bg-green-700 py-1.5 px-4 rounded transition-colors shadow-sm"
                                            >
                                                Apply Now
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

export default OpportunitiesPage;
