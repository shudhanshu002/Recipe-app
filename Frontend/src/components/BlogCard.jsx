import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// stores
import useThemeStore from '../store/useThemeStore';
import useAuthStore from '../store/useAuthStore';

// blog api
import { blogApi } from '../api/blogs';

// sharing modal
import ShareModal from './ShareModal';

// utils
import { formatRelativeDate } from '../utils/formatDate';
import { toast, ToastContainer } from 'react-toastify';

// icons
import { MessageCircle, Eye, Heart, Send, Share2, Trash2 } from 'lucide-react';

// Helper to strip HTML
const stripHtml = (html) => {
    if (!html) return '';
    let processed = html
        .replace(/<\/p>/gi, '\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<\/h[1-6]>/gi, '\n')
        .replace(/<\/li>/gi, '\n');
    const tmp = document.createElement('DIV');
    tmp.innerHTML = processed;
    let text = tmp.textContent || tmp.innerText || '';
    return text.trim();
};

// emoji picker custom to like
const ReactionPicker = ({ onReact, onClose, isDarkMode }) => {
    const emojis = ['👍', '❤️', '😂', '😮', '😢', '😡'];
    return (
        <div
            className={`absolute bottom-10 right-0 shadow-xl border rounded-full p-2 flex gap-2 animate-in fade-in zoom-in duration-200 z-50 ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
        >
            {emojis.map((emoji) => (
                <button
                    key={emoji}
                    onClick={(e) => {
                        e.stopPropagation();
                        onReact(emoji);
                    }}
                    className="hover:scale-125 transition-transform text-xl leading-none"
                >
                    {emoji}
                </button>
            ))}
        </div>
    );
};

const BlogCard = ({ blog, onDelete }) => {
    const { theme } = useThemeStore();
    const isDarkMode = theme === 'dark';

    const { user } = useAuthStore();
    const navigate = useNavigate();

    const [reactions, setReactions] = useState(blog.reactions || []);
    const [commentCount, setCommentCount] = useState(blog.commentCount || 0);
    const [showReactions, setShowReactions] = useState(false);
    const [showCommentInput, setShowCommentInput] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);

    const myReaction = reactions.find((r) => r.user === user?._id)?.emoji;
    const shareUrl = `${window.location.origin}/blogs/${blog._id}`;

    // Check Ownership
    const isOwner = user && (user._id === blog.author?._id || user.username === blog.author?.username);

    // Handlers
    const handleCardClick = () => navigate(`/blogs/${blog._id}`);

    // to handle liking
    const handleReact = async (emoji) => { 
        if (!user) return toast.info('Login to react');
        try {
            const updatedReactions = await blogApi.toggleReaction(blog._id, emoji);
            setReactions(updatedReactions);
            setShowReactions(false);
        } catch (error) {
            console.error(error);
        }
    };

    // to handle comment posting
    const handlePostComment = async () => {
        if (!commentText.trim()) return;
        setIsPosting(true);
        try {
            await blogApi.addComment(blog._id, { content: commentText });
            setCommentCount((prev) => prev + 1);
            setCommentText('');
            setShowCommentInput(false);
            toast.done('Comment posted!');
        } catch (e) {
            toast.error('Failed to comment');
        } finally {
            setIsPosting(false);
        }
    };

    // DELETE HANDLER to delete blog
    const handleDelete = async (e) => {
        e.stopPropagation(); 
        if (!window.confirm('Are you sure you want to delete this blog post?')) return;

        try {
            await blogApi.delete(blog._id);
            if (onDelete) onDelete(blog._id);
        } catch (error) {
            toast.error('Failed to delete blog');
        }
    };

    // Styles for specific ui 
    const bubbleBg = isDarkMode ? 'bg-[#1e1e1e] border-gray-700' : 'bg-white border-gray-200';
    const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
    const subText = isDarkMode ? 'text-gray-400' : 'text-gray-500';
    const inputBg = isDarkMode ? 'bg-[#2d2d2d] border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900';
    const commentSectionBg = isDarkMode ? 'bg-[#252525]/50' : 'bg-gray-50';

    return (
        <>
            <ToastContainer />
            <>
                <div className="flex gap-4 mb-6 items-start group font-dancing">
                    <div
                        className="shrink-0 cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/profile/${blog.author?.username}`);
                        }}
                    >
                        <img
                            src={blog.author?.avatar || 'https://via.placeholder.com/50'}
                            alt="User"
                            className={`w-12 h-12 rounded-full object-cover border-2 shadow-sm ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                        />
                    </div>

                    <div
                        className={`flex-1 relative rounded-2xl border shadow-sm transition-shadow hover:shadow-md ${bubbleBg} before:content-[''] before:absolute before:top-4 before:-left-2 before:w-4 before:h-4 before:bg-inherit before:border-l before:border-b before:border-inherit before:rotate-45 before:z-0 z-10`}
                    >
                        <div className="p-5 cursor-pointer relative z-10" onClick={handleCardClick}>
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3
                                        className={`text-sm font-bold ${textColor} hover:underline`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/profile/${blog.author?.username}`);
                                        }}
                                    >
                                        {blog.author?.username}
                                    </h3>
                                    <span className={`text-xs ${subText}`}>{formatRelativeDate(blog.createdAt)}</span>
                                    <span className="inline-block text-[10px] px-2 py-0.5 rounded-full text-white font-bold" style={{ backgroundColor: blog.topicColor }}>
                                        {blog.topic}
                                    </span>
                                </div>

                                {/* Delete Button --- Visible only to Owner */}
                                {isOwner && (
                                    <button
                                        onClick={handleDelete}
                                        className={`p-1.5 transition-colors rounded-full z-20 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100 hover:text-red-500 text-gray-400'}`}
                                        title="Delete Post"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                            <h2 className={`text-lg font-bold mb-1 ${textColor}`}>{blog.title}</h2>
                            <p className={`text-sm mb-2 ${subText} line-clamp-3 whitespace-pre-line`}>{stripHtml(blog.content)}</p>
                            {blog.coverImage && (
                                <div className={`mt-3 h-32 w-full overflow-hidden rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                    <img src={blog.coverImage} alt="Cover" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                </div>
                            )}
                        </div>

                        <div className={`flex justify-end items-center gap-4 px-5 py-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} relative z-10`}>
                            <div className="flex items-center gap-1 text-xs text-gray-400" title="Views">
                                <Eye size={14} /> {blog.views}
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowCommentInput(!showCommentInput);
                                }}
                                className={`flex items-center gap-1 text-xs hover:text-blue-500 transition-colors ${showCommentInput ? 'text-blue-500 font-bold' : 'text-gray-400'}`}
                            >
                                <MessageCircle size={14} /> {commentCount}
                            </button>
                            <div className="relative">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowReactions(!showReactions);
                                    }}
                                    className={`flex items-center gap-1 text-xs hover:text-red-500 transition-colors ${myReaction ? 'text-red-500 font-bold' : 'text-gray-400'}`}
                                >
                                    {myReaction || <Heart size={14} />} {reactions.length}
                                </button>
                                {showReactions && <ReactionPicker onClose={() => setShowReactions(false)} onReact={handleReact} isDarkMode={isDarkMode} />}
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowShareModal(true);
                                }}
                                className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#f97316] transition-colors"
                            >
                                <Share2 size={14} /> Share
                            </button>
                        </div>

                        {showCommentInput && (
                            <div
                                className={`p-4 border-t rounded-b-2xl animate-in fade-in slide-in-from-top-2 relative z-20 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} ${commentSectionBg}`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex gap-3 items-center">
                                    {user && <img src={user.avatar} className="w-8 h-8 rounded-full object-cover" alt="You" />}
                                    <div className="flex-1 relative">
                                        <input
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            placeholder="Write a comment..."
                                            className={`w-full px-4 py-2 pr-10 rounded-full border text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]/50 transition-all ${inputBg}`}
                                            autoFocus
                                            onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                                        />
                                        <button
                                            onClick={handlePostComment}
                                            disabled={isPosting}
                                            className="absolute right-1.5 top-1.5 p-1.5 bg-[#f97316] text-white rounded-full hover:bg-orange-600 disabled:opacity-50 transition-colors"
                                        >
                                            <Send size={14} />
                                        </button>
                                    </div>
                                </div>
                                {!user && <p className="text-xs text-center text-gray-500 mt-2">Please login to comment.</p>}
                            </div>
                        )}
                    </div>
                </div>

                {showShareModal && <ShareModal url={shareUrl} title={blog.title} onClose={() => setShowShareModal(false)} />}
            </>
        </>
    );
};

export default BlogCard;
