import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// api
import { blogApi } from '../api/blogs';

// store
import useThemeStore from '../store/useThemeStore';

// components
import BlogCard from '../components/BlogCard';
import BlogCardSkeleton from '../components/skeletons/BlogCardSkeleton';

// icons
import { PenTool } from 'lucide-react';

const BlogFeed = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { theme } = useThemeStore();
    const isDarkMode = theme === 'dark';

    useEffect(() => {
        blogApi
            .getAll()
            .then(setBlogs)
            .finally(() => setLoading(false));
    }, []);

    // Function to remove blog from local state immediately
    const handleRemoveBlog = (deletedId) => {
        setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog._id !== deletedId));
    };

    const textColor = isDarkMode ? 'text-white' : 'text-gray-900';

    

    return (
        <div className="max-w-3xl mx-auto space-y-8 mb-20 font-dancing">
            <div className="flex justify-between items-center mb-6">
                <h1 className={`text-3xl font-bold ${textColor}`}>Community Blog</h1>
                <Link to="/create-blog" className="px-4 py-2 bg-[#f97316] text-white rounded-lg flex items-center gap-2 hover:bg-orange-600 font-medium shadow-md">
                    <PenTool size={18} /> Write Post
                </Link>
            </div>

            {loading ? (
                //  Skeleton Loader Grid
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <BlogCardSkeleton key={i} />
                    ))}
                </div>
            ) : (
                //  Normal Blog Listing
                <div className="space-y-4">
                    {blogs.length > 0 ? (
                        blogs.map((blog) => <BlogCard key={blog._id} blog={blog} onDelete={handleRemoveBlog} />)
                    ) : (
                        <p className="text-center text-gray-500 py-10">No blog posts yet. Be the first to write one!</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default BlogFeed;
