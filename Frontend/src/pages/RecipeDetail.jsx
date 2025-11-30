import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Clock,
    User,
    Star,
    Lock,
    ChevronLeft,
    ChevronRight,
    PlayCircle,
    Video,
    MessageCircle,
    ThumbsUp,
    Send,
    Image as ImageIcon,
    Film,
    Upload,
    X,
    Check,
    ChevronDown,
    ChevronUp,
    Loader2,
    Smile,
} from 'lucide-react';
import { recipeApi } from '../api/recipes';
import api from '../lib/axios';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import { formatTime, formatRelativeDate } from '../utils/formatDate';

// --- Reaction Picker Component ---
const ReactionPicker = ({ onReact, onClose }) => {
    const emojis = ['👍', '❤️', '😂', '😮', '😢', '😡'];
    return (
        <div className="absolute bottom-8 left-0 bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 rounded-full p-2 flex gap-2 animate-in fade-in zoom-in duration-200 z-50">
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

// --- Recursive Comment Component ---
const CommentThread = ({ reply, reviewId, depth = 0, activeReplyBox, setActiveReplyBox, handleReply, handleReact, user, inputBg, textColor, subText, replyBg }) => {
    const isReplying = activeReplyBox.reviewId === reviewId && activeReplyBox.parentId === reply._id;
    const [localReplyText, setLocalReplyText] = useState('');
    const [showReactions, setShowReactions] = useState(false);

    // Get user's reaction if any
    const myReaction = reply.reactions?.find((r) => r.user === user?._id)?.emoji;

    return (
        <div className={`mt-3 ${depth > 0 ? 'pl-4 border-l-2 border-gray-200 dark:border-gray-700' : ''}`}>
            <div className="flex gap-3">
                <img src={reply.author?.avatar || 'https://via.placeholder.com/40'} className="w-6 h-6 rounded-full object-cover" alt="User" />
                <div className="flex-1">
                    <div className={`p-3 rounded-lg ${replyBg} relative group/reply`}>
                        <div className="flex justify-between">
                            <span className={`font-bold text-xs block mb-1 ${textColor}`}>{reply.author?.username}</span>
                            <span className="text-[10px] text-gray-400">{formatRelativeDate(reply.createdAt)}</span>
                        </div>
                        <p className={`text-xs ${subText}`}>{reply.content}</p>
                        {reply.media && <img src={reply.media} className="mt-2 rounded-lg max-h-32 object-cover" alt="Reply Media" />}

                        {/* Reaction Counts */}
                        {reply.reactions?.length > 0 && (
                            <div className="absolute -bottom-3 right-2 bg-white dark:bg-gray-700 shadow-sm border dark:border-gray-600 rounded-full px-2 py-0.5 text-[10px] flex gap-1 items-center cursor-default">
                                {Array.from(new Set(reply.reactions.map((r) => r.emoji))).slice(0, 3)}
                                <span className={textColor}>{reply.reactions.length}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4 mt-1 ml-1 relative">
                        <div className="relative">
                            <button
                                onClick={() => setShowReactions(!showReactions)}
                                className={`flex items-center gap-1 text-[10px] hover:text-primary transition-colors ${myReaction ? 'text-primary font-bold' : 'text-gray-500'}`}
                            >
                                {myReaction ? myReaction : <ThumbsUp size={10} />} {myReaction ? 'Reacted' : 'Like'}
                            </button>
                            {showReactions && (
                                <ReactionPicker
                                    onClose={() => setShowReactions(false)}
                                    onReact={(emoji) => {
                                        handleReact(reviewId, reply._id, emoji);
                                        setShowReactions(false);
                                    }}
                                />
                            )}
                        </div>

                        <button
                            onClick={() => setActiveReplyBox(isReplying ? { reviewId: null, parentId: null } : { reviewId, parentId: reply._id })}
                            className="text-[10px] text-gray-500 hover:text-primary font-medium"
                        >
                            Reply
                        </button>
                    </div>

                    {/* Reply Input */}
                    {isReplying && user && (
                        <div className="flex gap-2 mt-2 animate-in fade-in">
                            <input
                                autoFocus
                                value={localReplyText}
                                onChange={(e) => setLocalReplyText(e.target.value)}
                                placeholder={`Reply to ${reply.author?.username}...`}
                                className={`flex-1 px-3 py-1.5 rounded-lg border text-xs ${inputBg}`}
                            />
                            <button
                                onClick={() => {
                                    handleReply(reviewId, localReplyText, reply._id);
                                    setLocalReplyText('');
                                }}
                                className="px-3 py-1 bg-primary text-white rounded-lg text-xs hover:bg-orange-600"
                            >
                                Send
                            </button>
                        </div>
                    )}

                    {/* Recursive Children */}
                    {reply.children?.map((child) => (
                        <CommentThread
                            key={child._id}
                            reply={child}
                            reviewId={reviewId}
                            depth={depth + 1}
                            activeReplyBox={activeReplyBox}
                            setActiveReplyBox={setActiveReplyBox}
                            handleReply={handleReply}
                            handleReact={handleReact}
                            user={user}
                            inputBg={inputBg}
                            textColor={textColor}
                            subText={subText}
                            replyBg={replyBg}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Helper to build nested comment tree ---
const buildReplyTree = (replies) => {
    if (!replies) return [];
    const map = {};
    const roots = [];
    const repliesCopy = JSON.parse(JSON.stringify(replies)); // Deep copy

    repliesCopy.forEach((r) => {
        map[r._id] = { ...r, children: [] };
    });

    repliesCopy.forEach((r) => {
        if (r.parentId && map[r.parentId]) {
            map[r.parentId].children.push(map[r._id]);
        } else {
            roots.push(map[r._id]);
        }
    });

    return roots.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const RecipeDetail = () => {
    const { id } = useParams();
    const { user } = useAuthStore();
    const { isDarkMode } = useThemeStore();

    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLocked, setIsLocked] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Data State
    const [reviews, setReviews] = useState([]);
    const [shorts, setShorts] = useState([]);

    // Inputs
    const [newComment, setNewComment] = useState('');
    const [commentMedia, setCommentMedia] = useState(null);
    const [activeReplyBox, setActiveReplyBox] = useState({ reviewId: null, parentId: null });
    const [showMainReactions, setShowMainReactions] = useState(null);

    // Upload Loading
    const [isUploadingShort, setIsUploadingShort] = useState(false);
    const [isPostingComment, setIsPostingComment] = useState(false);

    const commentFileRef = useRef(null);
    const shortFileRef = useRef(null);

    // Fetch Data
    const fetchAllData = async () => {
        try {
            const data = await recipeApi.getOne(id);
            setRecipe(data);

            try {
                const reviewsRes = await api.get(`/reviews/${id}`);
                setReviews(reviewsRes.data.data);
            } catch (e) {
                console.error('Reviews error', e);
            }

            try {
                const shortsRes = await api.get(`/shorts/${id}`);
                setShorts(shortsRes.data.data);
            } catch (e) {
                console.error('Shorts error', e);
            }
        } catch (err) {
            if (err.response?.status === 403) {
                setRecipe(err.response.data.data);
                setIsLocked(true);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchAllData();
    }, [id]);

    // --- Helpers ---
    const getMediaList = () => {
        if (!recipe) return [];
        const list = recipe.images?.map((url) => ({ type: 'image', url })) || [];
        // ✅ Add Video to Carousel List
        if (recipe.videoUrl && !isLocked) {
            list.push({ type: 'video', url: recipe.videoUrl });
        }
        return list;
    };

    const mediaList = getMediaList();
    const currentMedia = mediaList[currentIndex];

    const nextSlide = (e) => {
        e?.stopPropagation();
        if (mediaList.length > 1) setCurrentIndex((prev) => (prev + 1) % mediaList.length);
    };
    const prevSlide = (e) => {
        e?.stopPropagation();
        if (mediaList.length > 1) setCurrentIndex((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1));
    };

    const getDiffColor = (diff) => {
        switch (diff?.toLowerCase()) {
            case 'easy':
                return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900';
            case 'medium':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900';
            case 'hard':
                return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    // --- Actions ---
    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() && !commentMedia) return;
        setIsPostingComment(true);

        const formData = new FormData();
        formData.append('content', newComment);
        formData.append('rating', 5);
        if (commentMedia) formData.append('media', commentMedia);

        try {
            await api.post(`/reviews/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setNewComment('');
            setCommentMedia(null);
            const res = await api.get(`/reviews/${id}`);
            setReviews(res.data.data);
        } catch {
            alert('Failed to post comment');
        } finally {
            setIsPostingComment(false);
        }
    };

    const handleReply = async (reviewId, text, parentId = null) => {
        if (!text.trim()) return;
        try {
            await api.post(`/reviews/${reviewId}/reply`, { content: text, parentId });
            setActiveReplyBox({ reviewId: null, parentId: null });
            const res = await api.get(`/reviews/${id}`);
            setReviews(res.data.data);
        } catch {
            alert('Failed to reply');
        }
    };

    const handleReact = async (reviewId, replyId, emoji) => {
        try {
            const endpoint = replyId ? `/reviews/${reviewId}/replies/${replyId}/react` : `/reviews/${reviewId}/react`;

            await api.post(endpoint, { emoji });
            const res = await api.get(`/reviews/${id}`);
            setReviews(res.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleUploadShort = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 100 * 1024 * 1024) return alert('File too large (Max 100MB)');
        setIsUploadingShort(true);
        const formData = new FormData();
        formData.append('video', file);
        formData.append('caption', `Short by ${user.username}`);
        try {
            alert('Uploading Short... This may take a moment.');
            await api.post(`/shorts/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            const res = await api.get(`/shorts/${id}`);
            setShorts(res.data.data);
            alert('Short uploaded!');
        } catch {
            alert('Upload failed.');
        } finally {
            setIsUploadingShort(false);
        }
    };

    // Styles
    const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
    const subText = isDarkMode ? 'text-gray-400' : 'text-gray-500';
    const metaBorder = isDarkMode ? 'border-gray-700' : 'border-gray-100';
    const inputBg = isDarkMode ? 'bg-[#2d2d2d] border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900';
    const replyBg = isDarkMode ? 'bg-[#252525]' : 'bg-gray-50';
    const cardBg = isDarkMode ? 'bg-[#1e1e1e]' : 'bg-gray-100';

    if (loading) return <div className={`text-center py-20 ${textColor}`}>Loading...</div>;
    if (!recipe && !isLocked) return <div className={`text-center py-20 ${textColor}`}>Recipe not found</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 mb-20">
            {/* 1. Carousel with Video Support */}
            <div className="space-y-4">
                <div className={`aspect-video w-full rounded-2xl overflow-hidden shadow-lg relative bg-black group`}>
                    {currentMedia?.type === 'video' ? (
                        <video src={currentMedia.url} controls className="w-full h-full object-contain" autoPlay muted />
                    ) : (
                        <img src={currentMedia?.url} alt={recipe.title} className="w-full h-full object-cover transition-transform duration-300" />
                    )}

                    {mediaList.length > 1 && (
                        <>
                            <button
                                onClick={prevSlide}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100 z-20"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={nextSlide}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100 z-20"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </>
                    )}
                </div>

                {/* Thumbnails with Video Icon */}
                {mediaList.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {mediaList.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                                    currentIndex === idx ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'
                                }`}
                            >
                                {item.type === 'video' ? (
                                    <div className="w-full h-full bg-gray-900 flex items-center justify-center text-white">
                                        <PlayCircle size={24} />
                                    </div>
                                ) : (
                                    <img src={item.url} className="w-full h-full object-cover" />
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* 2. Info */}
            <div className="space-y-4">
                <div className="flex justify-between items-start">
                    <h1 className={`text-4xl font-bold ${textColor}`}>{recipe?.title}</h1>
                    <span className={`px-3 py-1 rounded-full border text-xs font-bold uppercase ${getDiffColor(recipe?.difficulty)}`}>{recipe?.difficulty}</span>
                </div>
                <p className={`text-lg leading-relaxed ${subText}`}>{recipe?.description}</p>

                <div className={`flex flex-wrap justify-between items-center gap-4 py-4 border-y ${metaBorder} ${subText}`}>
                    <div className="flex gap-6">
                        <Link to={`/profile/${recipe?.createdBy?.username}`} className="flex items-center gap-2 hover:text-primary font-medium">
                            <img src={recipe?.createdBy?.avatar} className="w-8 h-8 rounded-full" alt="chef" /> {recipe?.createdBy?.username}
                        </Link>
                        <div className="flex items-center gap-2">
                            <Clock size={18} /> {formatTime(recipe?.cookingTime)}
                        </div>
                        <div className="flex items-center gap-2">
                            <Star size={18} className="text-yellow-500" fill="currentColor" /> {recipe?.averageRating?.toFixed(1)}
                        </div>
                    </div>
                    <span className="text-sm">Published: {formatRelativeDate(recipe?.createdAt)}</span>
                </div>
            </div>

            {/* 3. Instructions/Ingredients */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-6">
                    <h3 className={`text-xl font-bold ${textColor}`}>Ingredients</h3>
                    <ul className="space-y-3">
                        {recipe?.ingredients?.map((ing, i) => (
                            <li key={i} className={`flex gap-3 ${subText}`}>
                                <span className="w-2 h-2 bg-primary rounded-full mt-2" />
                                {ing}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="md:col-span-2 space-y-6">
                    <h3 className={`text-xl font-bold ${textColor}`}>Instructions</h3>
                    <div className={`whitespace-pre-wrap leading-relaxed ${subText}`}>{recipe?.instructions}</div>
                </div>
            </div>

            {/* 4. Shorts Section */}
            <div className={`pt-8 border-t ${metaBorder}`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-2xl font-bold flex items-center gap-2 ${textColor}`}>
                        <Film className="text-pink-500" /> Community Shorts
                    </h3>
                    {user && (
                        <>
                            <button
                                onClick={() => shortFileRef.current.click()}
                                disabled={isUploadingShort}
                                className="px-4 py-2 bg-pink-600 text-white rounded-full text-sm font-bold hover:bg-pink-700 flex gap-2"
                            >
                                {isUploadingShort ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />} Upload
                            </button>
                            <input type="file" ref={shortFileRef} className="hidden" accept="video/*" onChange={handleUploadShort} />
                        </>
                    )}
                </div>
                {shorts.length > 0 && (
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {shorts.map((short) => (
                            <div key={short._id} className="w-40 flex-shrink-0 rounded-xl overflow-hidden bg-black aspect-[9/16] shadow-lg group relative">
                                <video src={short.videoUrl} className="w-full h-full object-cover" controls />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 5. Comments with Emojis */}
            <div className={`pt-8 border-t ${metaBorder}`}>
                <h3 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${textColor}`}>
                    <MessageCircle className="text-primary" /> Community
                </h3>

                {/* Comment Input */}
                {user && (
                    <form onSubmit={handlePostComment} className="flex gap-3 mb-8">
                        <img src={user.avatar} className="w-10 h-10 rounded-full" />
                        <div className="flex-1 relative">
                            <div className={`flex items-center rounded-xl border focus-within:ring-2 focus-within:ring-primary/50 overflow-hidden ${inputBg}`}>
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Add a comment..."
                                    className={`w-full px-4 py-3 resize-none bg-transparent focus:outline-none ${textColor}`}
                                    rows="1"
                                />
                                {commentMedia && (
                                    <div className="px-2 text-xs text-green-500 flex items-center gap-1">
                                        <Check size={12} /> Image
                                    </div>
                                )}
                                <div className="flex items-center pr-2 gap-1">
                                    <button type="button" onClick={() => commentFileRef.current.click()} className="p-2 text-gray-400 hover:text-primary">
                                        <ImageIcon size={20} />
                                    </button>
                                    <button type="submit" disabled={isPostingComment} className="p-2 bg-primary text-white rounded-lg">
                                        <Send size={18} />
                                    </button>
                                </div>
                            </div>
                            <input type="file" ref={commentFileRef} className="hidden" accept="image/*,image/gif" onChange={(e) => setCommentMedia(e.target.files[0])} />
                        </div>
                    </form>
                )}

                {/* Reviews Loop */}
                <div className="space-y-6">
                    {reviews.map((review) => {
                        const replyTree = buildReplyTree(review.replies);
                        const myReaction = review.reactions?.find((r) => r.user === user?._id)?.emoji;

                        return (
                            <div key={review._id} className="group">
                                <div className="flex gap-4">
                                    <img src={review.author?.avatar} className="w-10 h-10 rounded-full" />
                                    <div className="flex-1">
                                        <div className={`p-4 rounded-xl rounded-tl-none ${cardBg} relative group/main`}>
                                            <div className="flex justify-between mb-1">
                                                <span className={`font-bold text-sm ${textColor}`}>{review.author?.username}</span>
                                                <span className="text-xs text-gray-400">{formatRelativeDate(review.createdAt)}</span>
                                            </div>
                                            <p className={`text-sm ${subText}`}>{review.content}</p>
                                            {review.media && <img src={review.media} className="mt-2 rounded-lg max-h-60 object-cover" />}

                                            {/* Reactions Badge */}
                                            {review.reactions?.length > 0 && (
                                                <div className="absolute -bottom-3 right-2 bg-white dark:bg-gray-700 shadow-sm border dark:border-gray-600 rounded-full px-2 py-0.5 text-[10px] flex gap-1 items-center cursor-default">
                                                    {Array.from(new Set(review.reactions.map((r) => r.emoji))).slice(0, 3)}
                                                    <span className={textColor}>{review.reactions.length}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-4 mt-1 ml-2 relative">
                                            <div className="relative">
                                                <button
                                                    onClick={() => setShowMainReactions(showMainReactions === review._id ? null : review._id)}
                                                    className={`flex items-center gap-1 text-xs hover:text-primary transition ${myReaction ? 'text-primary font-bold' : 'text-gray-500'}`}
                                                >
                                                    {myReaction ? myReaction : <ThumbsUp size={12} />} {myReaction ? 'Reacted' : 'Like'}
                                                </button>
                                                {showMainReactions === review._id && (
                                                    <ReactionPicker
                                                        onClose={() => setShowMainReactions(null)}
                                                        onReact={(emoji) => {
                                                            handleReact(review._id, null, emoji);
                                                            setShowMainReactions(null);
                                                        }}
                                                    />
                                                )}
                                            </div>
                                            <button
                                                onClick={() =>
                                                    setActiveReplyBox(
                                                        activeReplyBox.reviewId === review._id && !activeReplyBox.parentId
                                                            ? { reviewId: null, parentId: null }
                                                            : { reviewId: review._id, parentId: null },
                                                    )
                                                }
                                                className="text-xs text-gray-500 hover:text-primary font-medium"
                                            >
                                                Reply
                                            </button>
                                        </div>

                                        {/* Main Reply Input */}
                                        {activeReplyBox.reviewId === review._id && activeReplyBox.parentId === null && user && (
                                            <div className="flex gap-2 mt-3 ml-2 animate-in fade-in">
                                                <input
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    placeholder="Write a reply..."
                                                    className={`flex-1 px-3 py-2 rounded-lg border text-sm ${inputBg}`}
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={() => {
                                                        handleReply(review._id, replyText);
                                                        setReplyText('');
                                                    }}
                                                    className="px-3 py-1 bg-primary text-white rounded-lg text-xs"
                                                >
                                                    Send
                                                </button>
                                            </div>
                                        )}

                                        {/* Nested Replies */}
                                        {replyTree.map((node) => (
                                            <CommentThread
                                                key={node._id}
                                                reply={node}
                                                reviewId={review._id}
                                                activeReplyBox={activeReplyBox}
                                                setActiveReplyBox={setActiveReplyBox}
                                                handleReply={handleReply}
                                                handleReact={handleReact}
                                                user={user}
                                                inputBg={inputBg}
                                                textColor={textColor}
                                                subText={subText}
                                                replyBg={replyBg}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default RecipeDetail;
