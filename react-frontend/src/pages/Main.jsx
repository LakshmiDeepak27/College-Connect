import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';

function Main() {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostImage, setNewPostImage] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        Promise.all([fetchUserProfile(), fetchPosts(), fetchSuggestions()]).finally(() => {
            setIsLoading(false);
        });
    }, []);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/user/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCurrentUser(res.data.user);
        } catch (error) {
            console.error('Error fetching user profile', error);
            if (error.response && (error.response.status === 401 || error.response.status === 404)) {
                localStorage.removeItem('token');
                navigate('/signin');
            }
        }
    };

    const fetchPosts = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/posts/feed', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPosts(res.data);
        } catch (error) {
            console.error('Error fetching posts', error);
        }
    };

    const fetchSuggestions = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/user/suggestions', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuggestions(res.data);
        } catch (error) {
            console.error('Error fetching suggestions', error);
        }
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim() && !newPostImage) return;
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('content', newPostContent);
            if (newPostImage) formData.append('image', newPostImage);

            const res = await axios.post('http://localhost:5000/api/posts/create', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setPosts([res.data, ...posts]);
            setNewPostContent('');
            setNewPostImage(null);
        } catch (error) {
            console.error('Error creating post', error);
        }
    };

    const handleLikeUpdate = (postId, newLikes) => {
        setPosts(posts.map(post =>
            post._id === postId ? { ...post, likes: newLikes } : post
        ));
    };

    const handleCommentUpdate = (updatedPost) => {
        setPosts(posts.map(post =>
            post._id === updatedPost._id ? updatedPost : post
        ));
    };

    const handlePostUpdate = (updatedPost) => {
        setPosts(posts.map(post =>
            post._id === updatedPost._id ? updatedPost : post
        ));
    };

    const handlePostDelete = (postId) => {
        setPosts(posts.filter(post => post._id !== postId));
    };

    return (
        <MainLayout>
            <div className="flex space-x-6 w-full max-w-6xl mx-auto">

                {/* Left Sidebar - Profile Summary */}
                <div className="w-1/4 hidden md:block">
                    {currentUser && (
                        <div className="bg-white/5 backdrop-blur-md rounded-xl shadow-sm border border-white/10 overflow-hidden text-white/90">
                            <div className="h-16 bg-blue-600"></div>
                            <div className="px-4 pb-4">
                                <div className="h-16 w-16 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-200 font-bold border-4 border-[#0a0a0a] -mt-8 mx-auto overflow-hidden">
                                    {currentUser.profilePicture ? (
                                        <img src={currentUser.profilePicture} alt="Profile" className="h-full w-full object-cover" />
                                    ) : (
                                        currentUser.username?.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="text-center mt-2">
                                    <h2 className="text-lg font-semibold text-white">{currentUser.username}</h2>
                                    <p className="text-sm text-white/60 capitalize">{currentUser.role} {currentUser.department ? `• ${currentUser.department}` : ''}</p>
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/60">Connections</span>
                                        <span className="text-blue-600 font-medium">{currentUser.connections?.length || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Middle Column - Feed */}
                <div className="flex-1 max-w-2xl">
                    <div className="bg-white/5 backdrop-blur-md rounded-xl shadow-sm border border-white/10 p-4 mb-4 text-white/90">
                        <div className="flex space-x-4">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-white/10 flex items-center justify-center font-bold overflow-hidden">
                                {currentUser?.profilePicture ? (
                                    <img src={currentUser?.profilePicture} alt="" className="w-full h-full object-cover"/>
                                ) : currentUser?.username?.charAt(0)?.toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <textarea
                                    className="block w-full rounded-md shadow-sm border border-white/10 bg-white/5 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 text-white placeholder-white/40 resize-none transition-colors"
                                    placeholder="Start a professional post..."
                                    rows="3"
                                    value={newPostContent}
                                    onChange={(e) => setNewPostContent(e.target.value)}
                                ></textarea>

                                {newPostImage && (
                                    <div className="mt-2 text-sm text-blue-400 flex items-center bg-blue-900/20 px-3 py-1.5 rounded-md border border-blue-500/20 w-fit">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        <span className="truncate max-w-[150px]">{newPostImage.name}</span>
                                        <button onClick={() => setNewPostImage(null)} className="ml-2 text-white/50 hover:text-red-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                )}

                                <div className="mt-2 flex justify-between items-center">
                                    <label className="cursor-pointer text-white/60 hover:text-blue-400 flex items-center transition-colors px-2 py-1 rounded hover:bg-white/5">
                                        <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        <span className="text-sm font-medium">Photo</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => setNewPostImage(e.target.files[0])} />
                                    </label>

                                    <button
                                        onClick={handleCreatePost}
                                        disabled={!newPostContent.trim() && !newPostImage}
                                        className="inline-flex items-center px-4 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                    >
                                        Post
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 pb-2">
                            <hr className="flex-grow border-white/10" />
                            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Sort by: Top</span>
                            <hr className="flex-grow border-white/10" />
                        </div>

                        {isLoading ? (
                            <div className="py-10"><LoadingSpinner size="lg" /></div>
                        ) : posts.map(post => (
                            <PostCard
                                key={post._id}
                                post={post}
                                currentUserId={currentUser?._id}
                                onLike={handleLikeUpdate}
                                onComment={handleCommentUpdate}
                                onUpdate={handlePostUpdate}
                                onDelete={handlePostDelete}
                            />
                        ))}
                    </div>
                </div>

                {/* Right Sidebar - Widgets */}
                <div className="w-1/4 hidden lg:block">
                    <div className="bg-white/5 backdrop-blur-md rounded-xl shadow-sm border border-white/10 p-4 mb-4 text-white/90">
                        <h2 className="text-sm font-semibold text-white mb-3">Add to your network</h2>
                        
                        {suggestions.length === 0 ? (
                            <p className="text-xs text-white/50 text-center py-2">No suggestions right now.</p>
                        ) : (
                            <ul className="space-y-4">
                                {suggestions.map(sugg => (
                                    <li key={sugg._id} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2 min-w-0">
                                            <div className="h-8 w-8 rounded-full bg-blue-900/50 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white overflow-hidden border border-white/10">
                                                {sugg.profilePicture ? (
                                                    <img src={sugg.profilePicture} alt="Profile" className="h-full w-full object-cover" />
                                                ) : (
                                                    <span className="text-blue-200">{sugg.username?.charAt(0)?.toUpperCase()}</span>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-white truncate">{sugg.username}</p>
                                                <p className="text-[10px] text-white/50 truncate capitalize">{sugg.role} {sugg.department ? `• ${sugg.department}` : ''}</p>
                                            </div>
                                        </div>
                                        <button 
                                            className="ml-2 flex-shrink-0 bg-white/10 hover:bg-blue-600 border border-white/10 hover:border-transparent text-white rounded-full p-1.5 transition-colors"
                                            title="Connect"
                                            onClick={() => navigate(`/profile/${sugg._id}`)}
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                        
                        <div className="mt-4 pt-3 border-t border-white/10 text-center">
                            <button className="text-xs font-medium text-blue-400 hover:text-blue-300">View all recommendations</button>
                        </div>
                    </div>
                </div>

            </div>
        </MainLayout>
    );
}

export default Main;