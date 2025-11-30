import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { blogApi } from '../api/blogs';
import useThemeStore from '../store/useThemeStore';
import { PenTool, Loader2 } from 'lucide-react';
import BlogCard from '../components/BlogCard'; 

const BlogFeed = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isDarkMode } = useThemeStore();

    useEffect(() => {
        blogApi
            .getAll()
            .then(setBlogs)
            .finally(() => setLoading(false));
    }, []);

    const textColor = isDarkMode ? 'text-white' : 'text-gray-900';

    if (loading)
        return (
            <div className={`text-center py-20 ${textColor}`}>
                <Loader2 className="animate-spin mx-auto" />
            </div>
        );

    return (
        <div className="max-w-3xl mx-auto space-y-8 mb-20">
            <div className="flex justify-between items-center mb-6">
                <h1 className={`text-3xl font-bold ${textColor}`}>Community Blog</h1>
                <Link to="/create-blog" className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 hover:bg-orange-600 font-medium shadow-md">
                    <PenTool size={18} /> Write Post
                </Link>
            </div>

            <div className="space-y-2">
                {blogs.length > 0 ? blogs.map((blog) => <BlogCard key={blog._id} blog={blog} />) : <p className="text-center text-gray-500 py-10">No blog posts yet. Be the first to write one!</p>}
            </div>
        </div>
    );
};
export default BlogFeed;
