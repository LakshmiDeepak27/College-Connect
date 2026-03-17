import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MainLayout from '../components/MainLayout';
import LoadingSpinner from '../components/LoadingSpinner';

function SearchPage() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        query: '',
        department: '',
        graduationYear: '',
        role: ''
    });
    
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const query = params.get('q') || '';
        const dept = params.get('dept') || '';
        const year = params.get('year') || '';
        const role = params.get('role') || '';

        setFilters({
            query,
            department: dept,
            graduationYear: year,
            role
        });

        fetchResults(query, dept, year, role);
    }, [location.search]);

    const fetchResults = async (q, dept, year, role) => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            let url = `http://localhost:5000/api/user/search?query=${q}`;
            if (dept) url += `&department=${dept}`;
            if (year) url += `&graduationYear=${year}`;
            if (role) url += `&role=${role}`;

            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (error) {
            console.error('Error fetching search results', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);
        
        // Update URL
        const params = new URLSearchParams();
        if (newFilters.query) params.set('q', newFilters.query);
        if (newFilters.department) params.set('dept', newFilters.department);
        if (newFilters.graduationYear) params.set('year', newFilters.graduationYear);
        if (newFilters.role) params.set('role', newFilters.role);
        
        navigate(`/search?${params.toString()}`);
    };

    const handleConnect = async (receiverId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/connections/send', { receiverId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Connection request sent!');
        } catch (error) {
            alert('Error sending request. Maybe already connected or pending.');
        }
    };

    return (
        <MainLayout>
            <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-6">
                {/* Filters Sidebar */}
                <div className="w-full md:w-64 bg-white/5 backdrop-blur-md rounded-xl p-5 border border-white/10 h-fit sticky top-20">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Filters
                    </h2>
                    
                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Role</label>
                            <select 
                                name="role" 
                                value={filters.role} 
                                onChange={handleFilterChange}
                                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="" className="bg-[#121212]">All Roles</option>
                                <option value="student" className="bg-[#121212]">Students</option>
                                <option value="alumni" className="bg-[#121212]">Alumni</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Department</label>
                            <select 
                                name="department" 
                                value={filters.department} 
                                onChange={handleFilterChange}
                                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="" className="bg-[#121212]">All Departments</option>
                                <option value="Computer Science" className="bg-[#121212]">Computer Science</option>
                                <option value="Electronics" className="bg-[#121212]">Electronics</option>
                                <option value="Mechanical" className="bg-[#121212]">Mechanical</option>
                                <option value="Civil" className="bg-[#121212]">Civil</option>
                                <option value="Information Technology" className="bg-[#121212]">Information Technology</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Graduation Year</label>
                            <input 
                                type="number" 
                                name="graduationYear" 
                                value={filters.graduationYear} 
                                onChange={handleFilterChange}
                                placeholder="e.g. 2024"
                                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        <button 
                            onClick={() => {
                                setFilters({ query: '', department: '', graduationYear: '', role: '' });
                                navigate('/search');
                            }}
                            className="w-full py-2 text-xs font-medium text-white/40 hover:text-white transition-colors"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>

                {/* Results Area */}
                <div className="flex-1">
                    <div className="mb-6 flex justify-between items-center bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10">
                        <h2 className="text-lg font-semibold flex items-center gap-3">
                            Search Results 
                            <span className="text-sm font-normal text-white/40">({users.length} found)</span>
                        </h2>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
                    ) : users.length === 0 ? (
                        <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-20 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4 border border-white/10">
                                <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-medium text-white mb-2">No results found</h3>
                            <p className="text-white/40 max-w-xs mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {users.map(user => (
                                <div key={user._id} className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden hover:border-blue-500/50 transition-all group flex flex-col">
                                    <div className="p-5 flex flex-col items-center flex-1">
                                        <div 
                                            onClick={() => navigate(`/profile/${user._id}`)}
                                            className="w-20 h-20 rounded-full bg-blue-900/40 border-2 border-white/10 overflow-hidden mb-4 cursor-pointer group-hover:border-blue-500/50 transition-colors"
                                        >
                                            {user.profilePicture ? (
                                                <img src={user.profilePicture} alt={user.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-blue-200">
                                                    {user.username.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <h3 onClick={() => navigate(`/profile/${user._id}`)} className="text-lg font-bold text-white mb-1 cursor-pointer hover:text-blue-400 transition-colors">{user.username}</h3>
                                        <p className="text-xs text-blue-400 font-medium uppercase tracking-wider mb-1">{user.role}</p>
                                        <p className="text-sm text-white/60 mb-1">{user.department}</p>
                                        {user.graduationYear && (
                                            <p className="text-xs text-white/40">Class of {user.graduationYear}</p>
                                        )}
                                    </div>
                                    <div className="p-4 border-t border-white/5 bg-white/2 flex gap-2">
                                        <button 
                                            onClick={() => navigate(`/profile/${user._id}`)}
                                            className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-medium transition-colors"
                                        >
                                            View Profile
                                        </button>
                                        {user.connectionStatus === 'none' && (
                                            <button 
                                                onClick={() => handleConnect(user._id)}
                                                className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm font-semibold transition-colors shadow-lg shadow-blue-600/20"
                                            >
                                                Connect
                                            </button>
                                        )}
                                        {user.connectionStatus === 'pending' && user.isSender && (
                                            <div className="flex-1 py-2 rounded-lg bg-yellow-600/20 border border-yellow-500/30 text-yellow-500 text-xs font-semibold flex items-center justify-center">
                                                Pending
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}

export default SearchPage;
