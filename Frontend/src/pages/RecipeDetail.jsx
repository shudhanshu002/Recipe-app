import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
    CornerDownRight,
    ShoppingCart,
    Share2,
} from 'lucide-react';
import { recipeApi } from '../api/recipes';
import api from '../lib/axios';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import { formatTime, formatRelativeDate } from '../utils/formatDate';
import ShareModal from '../components/ShareModal';
import CustomVideoPlayer from '../components/CustomVideoPlayer';

// --- Helper: Build Comment Tree ---
const buildReplyTree = (replies) => {
    if (!replies) return [];
    const map = {};
    const roots = [];
    const repliesCopy = JSON.parse(JSON.stringify(replies));
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

// --- Component: Recursive Comment ---
const CommentThread = ({ reply, reviewId, depth = 0, activeReplyBox, setActiveReplyBox, handleReply, handleLikeReply, user, inputBg, textColor, subText, replyBg }) => {
    const isReplying = activeReplyBox.reviewId === reviewId && activeReplyBox.parentId === reply._id;
    const [localReplyText, setLocalReplyText] = useState('');
    const [showNested, setShowNested] = useState(false); // ✅ NEW: Local toggle for nested replies

    const myReaction = reply.likes?.includes(user?._id);

    return (
        <div className={`mt-3 ${depth > 0 ? 'pl-4 border-l-2 border-gray-200 dark:border-gray-700' : ''}`}>
            <div className="flex gap-3">
                <Link to={`/profile/${reply.author?.username}`}>
                    <img src={reply.author?.avatar || 'https://via.placeholder.com/40'} className="w-6 h-6 rounded-full object-cover" alt="User" />
                </Link>
                <div className="flex-1">
                    <div className={`p-3 rounded-lg ${replyBg}`}>
                        <div className="flex justify-between">
                            <Link to={`/profile/${reply.author?.username}`} className={`font-bold text-xs block mb-1 ${textColor} hover:underline`}>
                                {reply.author?.username}
                            </Link>
                            <span className="text-[10px] text-gray-400">{formatRelativeDate(reply.createdAt)}</span>
                        </div>
                        <p className={`text-xs ${subText}`}>{reply.content}</p>
                        {reply.media && <img src={reply.media} className="mt-2 rounded-lg max-h-32 object-cover" alt="Reply Media" />}
                    </div>

                    <div className="flex items-center gap-4 mt-1 ml-1">
                        <button
                            onClick={() => handleLikeReply(reviewId, reply._id)}
                            className={`flex items-center gap-1 text-[10px] hover:text-primary ${myReaction ? 'text-primary font-bold' : 'text-gray-500'}`}
                        >
                            <ThumbsUp size={10} /> {reply.likes?.length || 0}
                        </button>
                        <button
                            onClick={() => setActiveReplyBox(isReplying ? { reviewId: null, parentId: null } : { reviewId, parentId: reply._id })}
                            className="text-[10px] text-gray-500 hover:text-primary font-medium"
                        >
                            Reply
                        </button>
                    </div>

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
                                className="px-3 py-1 bg-primary text-white rounded-lg text-xs"
                            >
                                Send
                            </button>
                        </div>
                    )}

                    {/* ✅ UPDATED: Nested Replies with Toggle */}
                    {reply.children && reply.children.length > 0 && (
                        <div className="mt-2">
                            {!showNested ? (
                                <button onClick={() => setShowNested(true)} className="text-xs font-bold text-primary flex items-center gap-1 ml-2 hover:underline">
                                    <ChevronDown size={14} /> View {reply.children.length} replies
                                </button>
                            ) : (
                                <div className="mt-2">
                                    {reply.children.map((child) => (
                                        <CommentThread
                                            key={child._id}
                                            reply={child}
                                            reviewId={reviewId}
                                            depth={depth + 1}
                                            activeReplyBox={activeReplyBox}
                                            setActiveReplyBox={setActiveReplyBox}
                                            handleReply={handleReply}
                                            handleLikeReply={handleLikeReply}
                                            user={user}
                                            inputBg={inputBg}
                                            textColor={textColor}
                                            subText={subText}
                                            replyBg={replyBg}
                                        />
                                    ))}
                                    <button onClick={() => setShowNested(false)} className="text-xs text-gray-400 flex items-center gap-1 mt-2 ml-4 hover:text-gray-600">
                                        <ChevronUp size={14} /> Hide replies
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// // ✅ NEW: Short Video Component
// const ShortVideoCard = ({ short }) => {
//     const videoRef = useRef(null);
//     const [isPlaying, setIsPlaying] = useState(false);
//     const navigate = useNavigate();

//     const togglePlay = (e) => {
//         e.stopPropagation();
//         if (videoRef.current.paused) {
//             videoRef.current.play();
//             setIsPlaying(true);
//         } else {
//             videoRef.current.pause();
//             setIsPlaying(false);
//         }
//     };

//     const handleFullScreen = (e) => {
//         e.stopPropagation();
//         if (videoRef.current.requestFullscreen) {
//             videoRef.current.requestFullscreen();
//         } else if (videoRef.current.webkitRequestFullscreen) { /* Safari */
//             videoRef.current.webkitRequestFullscreen();
//         } else if (videoRef.current.msRequestFullscreen) { /* IE11 */
//             videoRef.current.msRequestFullscreen();
//         }
//     };

//     return (
//         <div 
//             className="w-40 flex-shrink-0 rounded-xl overflow-hidden bg-black aspect-[9/16] shadow-lg group relative cursor-pointer"
//             onClick={togglePlay}
//             onDoubleClick={handleFullScreen}
//         >
//             <video 
//                 ref={videoRef}
//                 src={short.videoUrl} 
//                 className="w-full h-full object-cover" 
//                 loop
//                 muted={false}
//                 onEnded={() => setIsPlaying(false)}
//             />
            
//             {/* Play Icon Overlay (Only when paused) */}
//             {!isPlaying && (
//                 <div className="absolute inset-0 flex items-center justify-center bg-black/20">
//                     <PlayCircle size={32} className="text-white opacity-80" />
//                 </div>
//             )}

//             {/* User Info Overlay (Bottom) */}
//             <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 pt-6 pointer-events-none">
//                 <p className="text-white text-xs font-bold truncate mb-1 drop-shadow-md">{short.caption}</p>
//                 <div 
//                     className="flex items-center gap-2 text-white/90 text-[10px] pointer-events-auto cursor-pointer hover:opacity-80 transition-opacity"
//                     onClick={(e) => {
//                         e.stopPropagation(); // Prevent video toggle
//                         navigate(`/profile/${short.author?.username}`);
//                     }}
//                 >
//                     <img 
//                         src={short.author?.avatar || "https://via.placeholder.com/30"} 
//                         className="w-5 h-5 rounded-full border border-white object-cover" 
//                         alt="User"
//                     /> 
//                     <span className="font-medium drop-shadow-sm">{short.author?.username}</span>
//                 </div>
//             </div>
//         </div>
//     );
// };

const ShortCard = ({ short, onOpen }) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const togglePlay = (e) => {
        e.stopPropagation();
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    return (
        <div
            className="w-40 flex-shrink-0 rounded-xl overflow-hidden bg-black aspect-[9/16] shadow-lg group relative cursor-pointer transition-transform hover:scale-105"
            onClick={togglePlay}
            onDoubleClick={(e) => {
                e.stopPropagation();
                onOpen(short);
            }}
        >
            <video ref={videoRef} src={short.videoUrl} className="w-full h-full object-cover" loop onEnded={() => setIsPlaying(false)} />

            {/* Play Overlay */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <PlayCircle size={32} className="text-white opacity-90" />
                </div>
            )}

            {/* Info Overlay */}
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 pt-6 pointer-events-none">
                <p className="text-white text-xs font-bold truncate mb-1 drop-shadow-md">{short.caption}</p>
                <div className="flex items-center gap-1 text-white/90 text-[10px]">
                    <img src={short.author?.avatar || 'https://via.placeholder.com/30'} className="w-4 h-4 rounded-full border border-white" alt="User" />
                    <span>{short.author?.username}</span>
                </div>
            </div>
        </div>
    );
};

const RecipeDetail = () => {
    const { id } = useParams();
    const { user } = useAuthStore();
    const { isDarkMode } = useThemeStore();

    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLocked, setIsLocked] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [reviews, setReviews] = useState([]);
    const [shorts, setShorts] = useState([]);
    const [expandedReplies, setExpandedReplies] = useState({});

    const [visibleReviewsCount, setVisibleReviewsCount] = useState(5);

    const [newComment, setNewComment] = useState('');
    const [commentMedia, setCommentMedia] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [replyMedia, setReplyMedia] = useState(null);
    const [activeReplyBox, setActiveReplyBox] = useState({ reviewId: null, parentId: null });

    const [isUploadingShort, setIsUploadingShort] = useState(false);
    const [isPostingComment, setIsPostingComment] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);

    const [showShareModal, setShowShareModal] = useState(false);
    const [ratingHover, setRatingHover] = useState(0);
    const myReview = reviews.find((r) => r.author?._id === user?._id);
    const myRating = myReview?.rating || 0;
    const isOwner = user && recipe?.createdBy && (user._id === recipe.createdBy._id || user.username === recipe.createdBy.username);

    const commentFileRef = useRef(null);
    const replyFileRef = useRef(null);
    const shortFileRef = useRef(null);

    const [viewingShort, setViewingShort] = useState(null);

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

    const getMediaList = () => {
        if (!recipe) return [];
        const list = recipe.images?.map((url) => ({ type: 'image', url })) || [];
        if (recipe.videoUrl && !isLocked) {
            list.push({
                type: 'video',
                url: recipe.videoUrl,
                // ✅ Use custom thumbnail or fallback to first image
                thumbnail: recipe.videoThumbnail || recipe.images?.[0],
            });
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
    const toggleReplies = (reviewId) => {
        setExpandedReplies((prev) => ({ ...prev, [reviewId]: !prev[reviewId] }));
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

    const handleAddToShoppingList = async () => {
        if (!user) return alert('Login to use shopping list');
        setAddingToCart(true);
        try {
            const res = await api.post('/shoppinglist/add-from-recipe', { recipeId: id });
            alert(res.data.message || 'Ingredients added to shopping list!');
        } catch (error) {
            console.error(error);
            alert('Failed to add ingredients');
        } finally {
            setAddingToCart(false);
        }
    };

    const handleRateRecipe = async (rating) => {
        if (!user) return alert('Login to rate');
        try {
            const formData = new FormData();
            formData.append('rating', rating);
            formData.append('content', 'Rated via star click');
            await api.post(`/reviews/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            alert(`Rated ${rating} stars!`);
            const data = await recipeApi.getOne(id);
            setRecipe(data);
            const reviewsRes = await api.get(`/reviews/${id}`);
            setReviews(reviewsRes.data.data);
        } catch (e) {
            if (e.response?.status === 403) alert(e.response.data.message || 'You cannot rate your own recipe');
            else alert('Failed to submit rating');
        }
    };

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() && !commentMedia) return;
        setIsPostingComment(true);
        const formData = new FormData();
        formData.append('content', newComment);
        formData.append('rating', myRating || 5);
        if (commentMedia) formData.append('media', commentMedia);
        try {
            await api.post(`/reviews/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setNewComment('');
            setCommentMedia(null);
            const res = await api.get(`/reviews/${id}`);
            setReviews(res.data.data);
        } catch {
            alert('Failed to post');
        } finally {
            setIsPostingComment(false);
        }
    };

    const handleReply = async (reviewId, text, parentId = null) => {
        if (!text.trim()) return;
        try {
            await api.post(`/reviews/${reviewId}/reply`, { content: text, parentId });
            setActiveReplyBox({ reviewId: null, parentId: null });
            setExpandedReplies((prev) => ({ ...prev, [reviewId]: true }));
            const res = await api.get(`/reviews/${id}`);
            setReviews(res.data.data);
        } catch {
            alert('Failed to reply');
        }
    };

    const handleLikeReview = async (rid) => {
        try {
            await api.post(`/reviews/${rid}/like`);
            const res = await api.get(`/reviews/${id}`);
            setReviews(res.data.data);
        } catch {}
    };
    const handleLikeReply = async (reviewId, replyId) => {
        try {
            await api.post(`/reviews/${reviewId}/replies/${replyId}/like`);
            const res = await api.get(`/reviews/${id}`);
            setReviews(res.data.data);
        } catch {}
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
            await api.post(`/shorts/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            const res = await api.get(`/shorts/${id}`);
            setShorts(res.data.data);
            alert('Uploaded!');
        } catch {
            alert('Upload failed');
        } finally {
            setIsUploadingShort(false);
        }
    };

    const shareUrl = `${window.location.origin}/recipes/${id}`;
    const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
    const subText = isDarkMode ? 'text-gray-400' : 'text-gray-500';
    const metaBorder = isDarkMode ? 'border-gray-700' : 'border-gray-100';
    const inputBg = isDarkMode ? 'bg-[#2d2d2d] border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900';
    const replyBg = isDarkMode ? 'bg-[#252525]' : 'bg-gray-50';
    const lockBoxBg = isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-300';
    const tagBg = isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700';

    if (loading) return <div className={`text-center py-20 ${textColor}`}>Loading...</div>;
    if (!recipe && !isLocked) return <div className={`text-center py-20 ${textColor}`}>Recipe not found</div>;

    const visibleReviews = reviews.slice(0, visibleReviewsCount);

    return (
        <div className="max-w-4xl mx-auto space-y-8 mb-20">
            {/* 1. Carousel */}
            <div className="space-y-4">
                <div className={`aspect-video w-full rounded-2xl overflow-hidden shadow-lg relative ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} group`}>
                    {currentMedia?.type === 'video' ? (
                        <CustomVideoPlayer src={currentMedia.url} poster={currentMedia.thumbnail} />
                    ) : (
                        <img src={currentMedia?.url} alt={recipe.title} className="w-full h-full object-cover transition-transform duration-300" />
                    )}
                    {isLocked && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                            <Lock size={48} className="mb-4 text-yellow-400" />
                            <h2 className="text-3xl font-bold mb-2">Premium Content</h2>
                        </div>
                    )}
                    {mediaList.length > 1 && (
                        <>
                            <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white">
                                <ChevronLeft />
                            </button>
                            <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white">
                                <ChevronRight />
                            </button>
                        </>
                    )}
                </div>
                {/* Thumbnails */}
                {mediaList.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {mediaList.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                                    currentIndex === idx ? 'border-primary ring-2 ring-primary/30' : 'border-transparent opacity-70 hover:opacity-100'
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
                    <div className="flex gap-6 items-center">
                        <Link to={`/profile/${recipe?.createdBy?.username}`} className="flex items-center gap-2 hover:text-primary font-medium">
                            <img src={recipe?.createdBy?.avatar} className="w-8 h-8 rounded-full" alt="chef" /> {recipe?.createdBy?.username}
                        </Link>
                        <div className="flex items-center gap-2">
                            <Clock size={18} /> {formatTime(recipe?.cookingTime)}
                        </div>
                        <div className="flex items-center gap-2">
                            <Star size={18} className="text-yellow-500" fill="currentColor" /> {recipe?.averageRating?.toFixed(1)}
                        </div>
                        <button onClick={() => setShowShareModal(true)} className="flex items-center gap-2 text-gray-400 hover:text-blue-500 transition-colors">
                            <Share2 size={18} /> Share
                        </button>
                    </div>
                    <span className="text-sm">Published: {formatRelativeDate(recipe?.createdAt)}</span>
                </div>
            </div>

            {!isLocked && recipe?.videoUrl && (
                <div className="mt-6 pt-8 border-t border-gray-200 dark:border-gray-800">
                    <h3 className={`text-xl font-bold mb-3 flex items-center gap-2 ${textColor}`}>
                        <Video className="text-primary" size={20} /> Video Tutorial
                    </h3>
                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-black shadow-lg">
                        <CustomVideoPlayer src={recipe.videoUrl} poster={recipe.videoThumbnail || recipe.images?.[0]} />
                    </div>
                </div>
            )}

            {/* 3. Ingredients & Instructions */}
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
                    <button
                        onClick={handleAddToShoppingList}
                        disabled={addingToCart}
                        className={`w-full py-2.5 mt-4 rounded-xl flex items-center justify-center gap-2 font-medium transition-all shadow-md hover:shadow-lg ${
                            addingToCart ? 'bg-green-700 cursor-wait' : 'bg-green-600 hover:bg-green-700'
                        } text-white`}
                    >
                        {addingToCart ? <Loader2 className="animate-spin" size={18} /> : <ShoppingCart size={18} />} {addingToCart ? 'Adding...' : 'Add to Shopping List'}
                    </button>
                </div>
                <div className="md:col-span-2 space-y-6">
                    <h3 className={`text-xl font-bold ${textColor}`}>Instructions</h3>
                    {isLocked ? (
                        <div className={`p-8 rounded-xl text-center border-2 border-dashed ${lockBoxBg}`}>
                            <Lock className="mx-auto text-gray-400 mb-2" size={32} />
                            <p className={subText}>Locked Content</p>
                            <Link to="/subscription" className="text-primary hover:underline font-bold mt-2 inline-block">
                                Upgrade to Premium
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className={`whitespace-pre-wrap leading-relaxed ${subText}`}>{recipe?.instructions}</div>
                            <div className={`mt-8 pt-6 border-t ${metaBorder}`}>
                                <h4 className={`text-lg font-bold mb-3 ${textColor}`}>{isOwner ? 'Your Recipe Rating' : 'Rate this Recipe'}</h4>
                                {isOwner ? (
                                    <div className="flex items-center gap-2 opacity-50 cursor-not-allowed">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star key={star} size={32} className={recipe.averageRating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                                        ))}
                                        <span className={`ml-2 text-sm ${subText}`}>(You cannot rate your own recipe)</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onMouseEnter={() => setRatingHover(star)}
                                                onMouseLeave={() => setRatingHover(0)}
                                                onClick={() => handleRateRecipe(star)}
                                                className="transition-transform hover:scale-110"
                                            >
                                                <Star size={32} className={(ratingHover || myRating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                                            </button>
                                        ))}
                                        <span className={`ml-2 text-sm ${subText}`}>{myRating > 0 ? `Your rating: ${myRating}` : 'Click to rate'}</span>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* 4. Shorts */}
            {/* <div className={`pt-8 border-t ${metaBorder}`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-2xl font-bold flex items-center gap-2 ${textColor}`}>
                        <Film className="text-pink-500" /> Cook's Shorts
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
            </div> */}

            {/* <div className={`pt-8 border-t ${metaBorder}`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-2xl font-bold flex items-center gap-2 ${textColor}`}>
                        <Film className="text-pink-500" /> Cook's Shorts
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
                            <ShortVideoCard key={short._id} short={short} /> // ✅ Use new component
                        ))}
                    </div>
                )}
            </div> */}

            <div className={`pt-8 border-t ${metaBorder}`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-2xl font-bold flex items-center gap-2 ${textColor}`}>
                        <Film className="text-pink-500" /> Cook's Shorts
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
                            <ShortCard key={short._id} short={short} onOpen={setViewingShort} />
                        ))}
                    </div>
                )}
            </div>

            {/* 5. Comments */}
            <div className={`pt-8 border-t ${metaBorder}`}>
                <h3 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${textColor}`}>
                    <MessageCircle className="text-primary" /> Community
                </h3>
                {user ? (
                    <form onSubmit={handlePostComment} className="flex gap-3 mb-8">
                        <img src={user.avatar} className="w-10 h-10 rounded-full" />
                        <div className="flex-1 relative">
                            <input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." className={`w-full px-4 py-3 rounded-xl border ${inputBg}`} />
                            <div className="flex items-center pr-2 gap-1 absolute right-2 top-2">
                                <button type="button" onClick={() => commentFileRef.current.click()} className="p-2 text-gray-400">
                                    <ImageIcon size={20} />
                                </button>
                                <button type="submit" disabled={isPostingComment} className="p-2 bg-primary text-white rounded-lg">
                                    <Send size={18} />
                                </button>
                            </div>
                            <input type="file" ref={commentFileRef} className="hidden" accept="image/*,image/gif" onChange={(e) => setCommentMedia(e.target.files[0])} />
                        </div>
                    </form>
                ) : (
                    <p className={`mb-6 text-center py-4 rounded-lg bg-gray-100 dark:bg-gray-800 ${subText}`}>Login to join the conversation.</p>
                )}

                <div className="space-y-2">
                    {visibleReviews.map((review) => {
                        const replyTree = buildReplyTree(review.replies);
                        const isMainLiked = review.likes?.includes(user?._id);
                        return (
                            <div key={review._id} className="group">
                                <div className="flex gap-4">
                                    <Link to={`/profile/${review.author?.username}`}>
                                        <img src={review.author?.avatar} className="w-10 h-10 rounded-full hover:opacity-80" />
                                    </Link>
                                    <div className="flex-1">
                                        <div className={`p-4 rounded-xl rounded-tl-none ${isDarkMode ? 'bg-[#1e1e1e]' : 'bg-gray-100'}`}>
                                            <div className="flex justify-between mb-1">
                                                <Link to={`/profile/${review.author?.username}`} className={`font-bold text-sm ${textColor} hover:underline`}>
                                                    {review.author?.username}
                                                </Link>
                                                <span className="text-xs text-gray-400">{formatRelativeDate(review.createdAt)}</span>
                                            </div>
                                            <p className={`text-sm ${subText}`}>{review.content}</p>
                                            {review.media && <img src={review.media} className="mt-3 rounded-lg max-h-60" />}
                                        </div>
                                        <div className="flex items-center gap-4 mt-1 ml-2">
                                            <button
                                                onClick={() => handleLikeReview(review._id)}
                                                className={`flex items-center gap-1 text-xs hover:text-primary ${isMainLiked ? 'text-primary font-bold' : 'text-gray-500'}`}
                                            >
                                                <ThumbsUp size={12} /> {review.likes.length}
                                            </button>
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
                                        {activeReplyBox.reviewId === review._id && activeReplyBox.parentId === null && user && (
                                            <div className="flex gap-2 mt-3 ml-2">
                                                <input
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    placeholder="Reply..."
                                                    className={`flex-1 px-3 py-2 rounded-lg border text-sm ${inputBg}`}
                                                    autoFocus
                                                />
                                                <button onClick={() => handleReply(review._id, replyText)} className="px-3 py-1 bg-primary text-white rounded-lg text-xs">
                                                    Send
                                                </button>
                                            </div>
                                        )}
                                        {replyTree.length > 0 && (
                                            <div className="mt-2">
                                                {!expandedReplies[review._id] ? (
                                                    <button onClick={() => toggleReplies(review._id)} className="text-xs font-bold text-primary flex items-center gap-1 ml-2">
                                                        <ChevronDown size={14} /> View {review.replies.length} replies
                                                    </button>
                                                ) : (
                                                    <div className="mt-3">
                                                        {replyTree.map((node) => (
                                                            <CommentThread
                                                                key={node._id}
                                                                reply={node}
                                                                reviewId={review._id}
                                                                activeReplyBox={activeReplyBox}
                                                                setActiveReplyBox={setActiveReplyBox}
                                                                handleReply={handleReply}
                                                                handleLikeReply={handleLikeReply}
                                                                user={user}
                                                                inputBg={inputBg}
                                                                textColor={textColor}
                                                                subText={subText}
                                                                replyBg={replyBg}
                                                            />
                                                        ))}
                                                        <button onClick={() => toggleReplies(review._id)} className="text-xs text-gray-400 flex items-center gap-1 mt-2 ml-4">
                                                            <ChevronUp size={14} /> Hide replies
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {reviews.length > visibleReviewsCount && (
                        <button onClick={() => setVisibleReviewsCount((prev) => prev + 5)} className="w-full py-2 text-sm text-primary font-bold hover:bg-primary/10 rounded-lg transition-colors mt-4">
                            Load more comments ({reviews.length - visibleReviewsCount} remaining)
                        </button>
                    )}
                </div>
            </div>

            {viewingShort && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={() => setViewingShort(null)}>
                    <div className="relative w-full max-w-sm h-[80vh] bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800" onClick={(e) => e.stopPropagation()}>
                        <video src={viewingShort.videoUrl} className="w-full h-full object-cover" controls autoPlay />
                        <button onClick={() => setViewingShort(null)} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors z-50">
                            <X size={24} />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white pointer-events-none">
                            <div className="flex items-center gap-3 mb-3 pointer-events-auto cursor-pointer" onClick={() => (window.location.href = `/profile/${viewingShort.author?.username}`)}>
                                <img src={viewingShort.author?.avatar} className="w-10 h-10 rounded-full border-2 border-white" alt="Author" />
                                <span className="font-bold text-sm hover:underline">{viewingShort.author?.username}</span>
                            </div>
                            <p className="text-sm leading-relaxed">{viewingShort.caption}</p>
                        </div>
                    </div>
                </div>
            )}

            {showShareModal && <ShareModal url={shareUrl} title={recipe.title} onClose={() => setShowShareModal(false)} />}
        </div>
    );
};





export default RecipeDetail;
