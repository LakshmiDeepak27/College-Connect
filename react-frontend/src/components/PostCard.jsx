import React, { useState } from 'react';
import axios from 'axios';

function PostCard({ post, currentUserId, onLike, onComment, onUpdate, onDelete }) {
    const [commentText, setCommentText] = useState('');
    const [showComments, setShowComments] = useState(post.comments && post.comments.length > 0);
    
    // Edit/Delete Post State
    const [isEditingPost, setIsEditingPost] = useState(false);
    const [editPostContent, setEditPostContent] = useState(post.content);

    // Edit/Delete Comment State
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editCommentText, setEditCommentText] = useState('');

    const isLiked = post.likes.includes(currentUserId);

    const handleLike = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`http://localhost:5000/api/posts/like/${post._id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onLike(post._id, res.data.likes);
        } catch (error) {
            console.error('Error liking post', error);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`http://localhost:5000/api/posts/comment/${post._id}`, {
                text: commentText
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onComment(res.data);
            setCommentText('');
        } catch (error) {
            console.error('Error commenting', error);
        }
    };

    const handleUpdatePost = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`http://localhost:5000/api/posts/${post._id}`, {
                content: editPostContent
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onUpdate && onUpdate(res.data);
            setIsEditingPost(false);
        } catch (error) {
            console.error('Error updating post', error);
        }
    };

    const handleDeletePost = async () => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/posts/${post._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onDelete && onDelete(post._id);
        } catch (error) {
            console.error('Error deleting post', error);
        }
    };

    const handleUpdateComment = async (commentId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`http://localhost:5000/api/posts/${post._id}/comment/${commentId}`, {
                text: editCommentText
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onComment(res.data); // reuse onComment to update the whole post in parent
            setEditingCommentId(null);
        } catch (error) {
            console.error('Error updating comment', error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Delete this comment?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.delete(`http://localhost:5000/api/posts/${post._id}/comment/${commentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onComment(res.data); // reuse onComment to update the whole post in parent
        } catch (error) {
            console.error('Error deleting comment', error);
        }
    };

    return (
        <div className="bg-white/5 backdrop-blur-md rounded-xl shadow-sm border border-white/10 p-4 mb-4 text-white/90">
            <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-200 font-bold overflow-hidden border border-white/10">
                    {post.author?.profilePicture ? (
                        <img src={post.author.profilePicture} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                        post.author?.username?.charAt(0)?.toUpperCase()
                    )}
                </div>
                <div>
                    <h3 className="text-sm font-medium text-white">{post.author?.username}</h3>
                    <p className="text-xs text-white/60 capitalize">{post.author?.role} {post.author?.department ? `• ${post.author.department}` : ''}</p>
                    <p className="text-xs text-white/40">{new Date(post.createdAt).toLocaleString()}</p>
                </div>
                
                {/* Post Options (Edit/Delete) */}
                {(post.author?._id === currentUserId || post.author === currentUserId) && !isEditingPost && (
                    <div className="ml-auto flex space-x-2 self-start">
                        <button onClick={() => setIsEditingPost(true)} className="text-white/40 hover:text-blue-400">
                            <span className="text-xs">Edit</span>
                        </button>
                        <button onClick={handleDeletePost} className="text-white/40 hover:text-red-400">
                            <span className="text-xs">Delete</span>
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-3 text-sm text-white/80 whitespace-pre-wrap">
                {isEditingPost ? (
                    <div className="space-y-2">
                        <textarea
                            value={editPostContent}
                            onChange={(e) => setEditPostContent(e.target.value)}
                            className="w-full rounded border border-white/20 bg-white/5 p-2 text-white focus:outline-none focus:border-blue-500"
                            rows="3"
                        />
                        <div className="flex justify-end space-x-2">
                            <button onClick={() => setIsEditingPost(false)} className="text-xs px-3 py-1 bg-white/10 rounded hover:bg-white/20">Cancel</button>
                            <button onClick={handleUpdatePost} className="text-xs px-3 py-1 bg-blue-600 rounded hover:bg-blue-700">Save</button>
                        </div>
                    </div>
                ) : (
                    <p>{post.content}</p>
                )}
            </div>

            {post.image && (
                <div className="mt-3 rounded overflow-hidden">
                    <img src={post.image} alt="Post attachment" className="w-full h-auto object-cover max-h-96" />
                </div>
            )}

            <div className="mt-3 flex items-center text-xs text-white/50 space-x-4">
                <span>{post.likes.length} Likes</span>
                <span>{post.comments.length} Comments</span>
            </div>

            <div className="mt-3 pt-3 border-t border-white/10 flex space-x-4 text-sm text-white/60">
                <button
                    onClick={handleLike}
                    className={`font-medium flex items-center space-x-1 transition-colors ${isLiked ? 'text-blue-400' : 'hover:text-white'}`}
                >
                    <svg className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    <span>Like</span>
                </button>
                <button
                    onClick={() => setShowComments(!showComments)}
                    className="hover:text-white font-medium flex items-center space-x-1 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>Comment</span>
                </button>
            </div>

            {showComments && (
                <div className="mt-4 pt-4 border-t border-white/10">
                    <form onSubmit={handleComment} className="flex space-x-2 mb-4">
                        <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 rounded-full border border-white/10 bg-white/5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 sm:text-sm px-4 py-2 text-white placeholder-white/40 transition-colors"
                        />
                        <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors" disabled={!commentText.trim()}>
                            Post
                        </button>
                    </form>

                    <div className="space-y-3">
                        {post.comments.map((comment, index) => (
                            <div key={index} className="flex space-x-3">
                                <div className="h-8 w-8 rounded-full bg-white/10 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white/70 overflow-hidden border border-white/5">
                                    {comment.user?.profilePicture ? (
                                        <img src={comment.user.profilePicture} alt="Profile" className="h-full w-full object-cover" />
                                    ) : (
                                        comment.user?.username?.charAt(0)?.toUpperCase()
                                    )}
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-3 flex-1 backdrop-blur-sm relative group">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="text-xs font-bold text-white/90">{comment.user?.username}</h4>
                                        <span className="text-[10px] text-white/40">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                    </div>

                                    {editingCommentId === comment._id ? (
                                        <div className="mt-1 space-y-2">
                                            <input 
                                                type="text" 
                                                value={editCommentText} 
                                                onChange={(e) => setEditCommentText(e.target.value)}
                                                className="w-full text-xs rounded border border-white/20 bg-white/5 p-1 text-white focus:outline-none focus:border-blue-500"
                                            />
                                            <div className="flex justify-end space-x-2">
                                                <button onClick={() => setEditingCommentId(null)} className="text-[10px] text-white/60 hover:text-white">Cancel</button>
                                                <button onClick={() => handleUpdateComment(comment._id)} className="text-[10px] text-blue-400 hover:text-blue-300">Save</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-white/80">{comment.text}</p>
                                    )}

                                    {/* Comment Options */}
                                    {(comment.user?._id === currentUserId || comment.user === currentUserId || post.author?._id === currentUserId || post.author === currentUserId) && editingCommentId !== comment._id && (
                                        <div className="absolute top-2 right-2 hidden group-hover:flex space-x-2 bg-[#1a1a1a]/80 backdrop-blur px-2 py-1 rounded-md shadow-lg border border-white/10">
                                            {(comment.user?._id === currentUserId || comment.user === currentUserId) && (
                                                <button 
                                                    onClick={() => { setEditingCommentId(comment._id); setEditCommentText(comment.text); }} 
                                                    className="text-[10px] text-white/60 hover:text-blue-400"
                                                >
                                                    Edit
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleDeleteComment(comment._id)} 
                                                className="text-[10px] text-white/60 hover:text-red-400"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default PostCard;
