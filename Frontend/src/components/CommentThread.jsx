import React, { useState } from 'react';
import { formatRelativeDate } from '../utils/formatDate';
import { Heart, MessageCircle, Send, CornerDownRight } from 'lucide-react';
import useThemeStore from '../store/useThemeStore';

const CommentThread = ({ comment, depth = 0, activeReplyId, setActiveReplyId, onReply, onLike, user, styles }) => {
    const { theme } = useThemeStore();
    const isDarkMode = theme === 'dark';
    const [replyText, setReplyText] = useState('');
    const isReplying = activeReplyId === comment._id;
    const isLiked = comment.likes?.includes(user?._id);

    const handleSubmitReply = () => {
        if (!replyText.trim()) return;
        onReply(comment._id, replyText); 
        setReplyText('');
        setActiveReplyId(null);
    };

    return (
        <div className={`mt-4 ${depth > 0 ? 'ml-4 md:ml-8' : ''}`}>
            <div className="flex gap-3 group">
                {/* Visual Thread Line for nested comments */}
                {depth > 0 && (
                    <div className="text-gray-300 dark:text-gray-700 -mt-2">
                        <CornerDownRight size={16} />
                    </div>
                )}

                {/* User Avatar */}
                <img
                    src={comment.author?.avatar || 'https://via.placeholder.com/40'}
                    className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700 shrink-0"
                    alt={comment.author?.username}
                />

                <div className="flex-1">
                    {/* Comment Bubble */}
                    <div className={`p-3 rounded-2xl rounded-tl-none ${styles.cardBg}`}>
                        <div className="flex justify-between items-center mb-1">
                            <span className={`font-bold text-sm ${styles.textColor}`}>{comment.author?.username || 'Unknown User'}</span>
                            <span className="text-xs text-gray-400">{formatRelativeDate(comment.createdAt)}</span>
                        </div>
                        <p className={`text-sm ${styles.subText} whitespace-pre-wrap`}>{comment.content}</p>
                    </div>

                    {/* Action Buttons (Like / Reply) */}
                    <div className="flex items-center gap-4 mt-1 ml-2">
                        <button
                            onClick={() => onLike(comment._id)}
                            className={`flex items-center gap-1 text-xs transition-colors ${isLiked ? 'text-red-500 font-bold' : 'text-gray-500 hover:text-red-500'}`}
                        >
                            <Heart size={12} fill={isLiked ? 'currentColor' : 'none'} />
                            {comment.likes?.length || 0}
                        </button>

                        {user && (
                            <button onClick={() => setActiveReplyId(isReplying ? null : comment._id)} className="text-xs text-gray-500 hover:text-[#f97316] font-medium flex items-center gap-1">
                                <MessageCircle size={12} /> Reply
                            </button>
                        )}
                    </div>

                    {/* --- Reply Input Box (Conditional) --- */}
                    {isReplying && (
                        <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                            <div className="flex gap-2 items-end">
                                <div className={`flex-1 rounded-xl border p-2 ${styles.cardBg} ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                                    <textarea
                                        autoFocus
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder={`Replying to ${comment.author?.username}...`}
                                        className={`w-full bg-transparent outline-none text-sm resize-none ${styles.textColor}`}
                                        rows={2}
                                    />
                                </div>
                                <button
                                    onClick={handleSubmitReply}
                                    disabled={!replyText.trim()}
                                    className="p-2.5 bg-[#f97316] text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-colors"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- Recursively Render Children --- */}
            {comment.children && comment.children.length > 0 && (
                <div className="mt-2">
                    {comment.children.map((child) => (
                        <CommentThread
                            key={child._id}
                            comment={child}
                            depth={depth + 1}
                            activeReplyId={activeReplyId}
                            setActiveReplyId={setActiveReplyId}
                            onReply={onReply}
                            onLike={onLike}
                            user={user}
                            styles={styles}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};




export default CommentThread;
