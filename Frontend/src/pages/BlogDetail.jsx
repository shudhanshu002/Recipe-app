import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

// api
import { blogApi } from '../api/blogs';

// store
import useThemeStore from '../store/useThemeStore';
import useAuthStore from '../store/useAuthStore';
import BlogDetailSkeleton from '../components/skeletons/BlogDetailSkeleton';
import CommentThread from '../components/CommentThread';

// utils
import { formatRelativeDate } from '../utils/formatDate';
import parse from 'html-react-parser';
import { toast, ToastContainer } from 'react-toastify';
import { useCallback } from 'react';

const BlogDetail = () => {
  const { id } = useParams();
  const { theme } = useThemeStore();
  const isDarkMode = theme === 'dark';
  const { user } = useAuthStore();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
    try {
      const [blogData, commentsData] = await Promise.all([
        blogApi.getOne(id),
        blogApi.getComments(id),
      ]);
      setBlog(blogData);
      setComments(commentsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refreshData();
  }, [id, refreshData]);

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
      toast.error('Login to comment');
    }
  };

  const handleReply = async (parentId, text) => {
    try {
      await blogApi.addComment(id, { content: text, parentId });
      refreshData();
    } catch (e) {
      toast.error('Failed to reply');
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
    cardBg: isDarkMode
      ? 'bg-[#1e1e1e] border border-gray-700'
      : 'bg-gray-100 border border-gray-200',
    inputBg: isDarkMode
      ? 'bg-[#2d2d2d] border-gray-600 text-white focus:outline-none'
      : 'bg-white border-gray-300 text-gray-900 focus:outline-none',
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen pt-20 pb-20 ${isDarkMode ? 'bg-[#121212]' : 'bg-white'}`}
      >
        <BlogDetailSkeleton />
      </div>
    );
  }

  if (!blog) return <div>Blog not found</div>;

  return (
    <div className="max-w-3xl mx-auto mb-20 font-dancing">
      <ToastContainer />
      {blog.coverImage && (
        <img
          src={blog.coverImage}
          className="w-full h-64 object-cover rounded-2xl mb-8 shadow-md"
          alt="Cover"
        />
      )}

      <div className="mb-6">
        <span
          className="px-3 py-1 rounded-full text-xs font-bold text-white mb-4 inline-block shadow-sm"
          style={{ backgroundColor: blog.topicColor }}
        >
          {blog.topic}
        </span>
        <h1 className={`text-4xl font-bold mb-4 ${textColor}`}>{blog.title}</h1>
        <div className="flex items-center gap-3">
          <img
            src={blog.author?.avatar}
            className="w-10 h-10 rounded-full border-2 border-gray-200"
            alt="Author"
          />
          <div>
            <p className={`text-sm font-bold ${textColor}`}>
              {blog.author?.username}
            </p>
            <p className="text-xs text-gray-500">
              {formatRelativeDate(blog.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* PARSE HTML CONTENT */}
      <div
        className={`prose max-w-none mb-12 leading-relaxed text-lg ${isDarkMode ? 'prose-invert text-gray-300' : 'text-gray-700'}`}
      >
        {parse(blog.content)}
      </div>

      <hr
        className={`border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
      />

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
            <button
              onClick={handlePostComment}
              className="px-4 py-2 bg-[#f97316] text-white rounded-lg font-bold"
            >
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
