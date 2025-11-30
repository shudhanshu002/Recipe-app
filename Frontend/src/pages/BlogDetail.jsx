import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogApi } from '../api/blogs';
import useThemeStore from '../store/useThemeStore';
import useAuthStore from '../store/useAuthStore';
import { formatRelativeDate } from '../utils/formatDate';
import { Loader2, MessageCircle, Heart, Send, ThumbsUp } from 'lucide-react';
import parse from 'html-react-parser'; 

const CommentThread = ({ comment, blogId, depth = 0, activeReplyId, setActiveReplyId, onReply, onLike, user, styles }) => {
    // ... existing logic ...
    // Just pasting the return for context, use full code from previous step
    return (
        <div className={`mt-4 ${depth > 0 ? 'pl-4 border-l-2 border-gray-200 dark:border-gray-700' : ''}`}>
            <div className="flex gap-3">
                <img src={comment.author?.avatar || 'https://via.placeholder.com/40'} className="w-8 h-8 rounded-full object-cover" alt="User" />
                <div className="flex-1">
                    <div className={`p-3 rounded-xl rounded-tl-none ${styles.cardBg}`}>
                        <div className="flex justify-between items-center mb-1">
                            <span className={`font-bold text-sm ${styles.textColor}`}>{comment.author?.username}</span>
                            <span className="text-xs text-gray-400">{formatRelativeDate(comment.createdAt)}</span>
                        </div>
                        <p className={`text-sm ${styles.subText}`}>{comment.content}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-1 ml-2">
                        <button
                            onClick={() => onLike(comment._id)}
                            className={`flex items-center gap-1 text-xs transition-colors ${comment.likes.includes(user?._id) ? 'text-red-500 font-bold' : 'text-gray-500 hover:text-red-500'}`}
                        >
                            <Heart size={12} fill={comment.likes.includes(user?._id) ? 'currentColor' : 'none'} /> {comment.likes.length || 0}
                        </button>
                        <button onClick={() => setActiveReplyId(activeReplyId === comment._id ? null : comment._id)} className="text-xs text-gray-500 hover:text-primary font-medium">
                            Reply
                        </button>
                    </div>
                    {/* Reply Input Logic ... */}
                    {comment.children &&
                        comment.children.map((child) => (
                            <CommentThread
                                key={child._id}
                                comment={child}
                                blogId={blogId}
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
            </div>
        </div>
    );
};

const BlogDetail = () => {
    const { id } = useParams();
    const { isDarkMode } = useThemeStore();
    const { user } = useAuthStore();
    const [blog, setBlog] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [activeReplyId, setActiveReplyId] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshData = async () => {
        try {
            const [blogData, commentsData] = await Promise.all([blogApi.getOne(id), blogApi.getComments(id)]);
            setBlog(blogData);
            setComments(commentsData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, [id]);

    const buildTree = (flatComments) => {
        const map = {};
        const roots = [];
        const list = JSON.parse(JSON.stringify(flatComments));
        list.forEach((c) => {
            map[c._id] = { ...c, children: [] };
        });
        list.forEach((c) => {
            if (c.parentId && map[c.parentId]) {
                map[c.parentId].children.push(map[c._id]);
            } else {
                roots.push(map[c._id]);
            }
        });
        return roots;
    };
    const commentTree = buildTree(comments);

    const handlePostComment = async () => {
        if (!commentText.trim()) return;
        try {
            await blogApi.addComment(id, { content: commentText });
            setCommentText('');
            refreshData();
        } catch (e) {
            alert('Login to comment');
        }
    };
    const handleReply = async (parentId, text) => {
        try {
            await blogApi.addComment(id, { content: text, parentId });
            refreshData();
        } catch (e) {
            alert('Failed to reply');
        }
    };
    const handleLikeComment = async (commentId) => {
        try {
            await blogApi.toggleCommentLike(commentId);
            const newComments = await blogApi.getComments(id);
            setComments(newComments);
        } catch (e) {
            console.error(e);
        }
    };

    const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
    const subText = isDarkMode ? 'text-gray-400' : 'text-gray-500';
    const styles = {
        textColor,
        subText,
        cardBg: isDarkMode ? 'bg-[#1e1e1e] border border-gray-700' : 'bg-gray-100 border border-gray-200',
        inputBg: isDarkMode ? 'bg-[#2d2d2d] border-gray-600 text-white focus:outline-none' : 'bg-white border-gray-300 text-gray-900 focus:outline-none',
    };

    if (!blog)
        return (
            <div className="text-center py-20">
                <Loader2 className="animate-spin mx-auto" />
            </div>
        );

    return (
        <div className="max-w-3xl mx-auto mb-20">
            {blog.coverImage && <img src={blog.coverImage} className="w-full h-64 object-cover rounded-2xl mb-8 shadow-md" alt="Cover" />}

            <div className="mb-6">
                <span className="px-3 py-1 rounded-full text-xs font-bold text-white mb-4 inline-block shadow-sm" style={{ backgroundColor: blog.topicColor }}>
                    {blog.topic}
                </span>
                <h1 className={`text-4xl font-bold mb-4 ${textColor}`}>{blog.title}</h1>
                <div className="flex items-center gap-3">
                    <img src={blog.author?.avatar} className="w-10 h-10 rounded-full border-2 border-gray-200" alt="Author" />
                    <div>
                        <p className={`text-sm font-bold ${textColor}`}>{blog.author?.username}</p>
                        <p className="text-xs text-gray-500">{formatRelativeDate(blog.createdAt)}</p>
                    </div>
                </div>
            </div>

            {/* PARSE HTML CONTENT */}
            <div className={`prose max-w-none mb-12 leading-relaxed text-lg ${isDarkMode ? 'prose-invert text-gray-300' : 'text-gray-700'}`}>{parse(blog.content)}</div>

            <hr className={`border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} />

            <div className="mt-8">
                <h3 className={`text-xl font-bold mb-4 ${textColor}`}>Comments</h3>
                {user && (
                    <div className="flex gap-2 mb-8">
                        <input
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Write a comment..."
                            className={`flex-1 px-4 py-2 rounded-lg border focus:outline-none ${styles.inputBg}`}
                        />
                        <button onClick={handlePostComment} className="px-4 py-2 bg-primary text-white rounded-lg font-bold">
                            Post
                        </button>
                    </div>
                )}
                <div className="space-y-2">
                    {commentTree.map((c) => (
                        <CommentThread
                            key={c._id}
                            comment={c}
                            blogId={id}
                            activeReplyId={activeReplyId}
                            setActiveReplyId={setActiveReplyId}
                            onReply={handleReply}
                            onLike={handleLikeComment}
                            user={user}
                            styles={styles}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
export default BlogDetail;
