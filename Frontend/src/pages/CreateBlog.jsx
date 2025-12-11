import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { blogApi } from '../api/blogs';
import useThemeStore from '../store/useThemeStore';
import RichTextEditor from '../components/RichTextEditor'; 
import { Loader2 } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';

const CreateBlog = () => {
    const navigate = useNavigate();
    const { theme } = useThemeStore();
    const isDarkMode = theme === 'dark';
    // Initial content can be empty string
    const [formData, setFormData] = useState({ title: '', content: '', topic: '', topicColor: '#ff642f' });
    const [cover, setCover] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.content === '<p></p>' || !formData.content.trim()) {
            return toast.info('Please write some content!');
        }

        setLoading(true);
        const fd = new FormData();
        Object.keys(formData).forEach((key) => fd.append(key, formData[key]));
        if (cover) fd.append('coverImage', cover);

        try {
            await blogApi.create(fd);
            navigate('/blogs');
        } catch (error) {
            toast.error('Failed to publish');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = `w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#f97316]/50 ${
        isDarkMode ? 'bg-[#2d2d2d] border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
    }`;
    const textColor = isDarkMode ? 'text-white' : 'text-gray-900';

    return (
        <div className="max-w-3xl mx-auto mb-20 font-dancing">
            <ToastContainer/>
            <h1 className={`text-3xl font-bold mb-6 ${textColor}`}>Write a Blog...</h1>
            <form onSubmit={handleSubmit} className={`p-8 rounded-xl border space-y-6 ${isDarkMode ? 'bg-[#1e1e1e] border-gray-700' : 'bg-white border-gray-200'}`}>
                <div>
                    <label className="text-sm font-bold mb-1 block text-gray-500">Title</label>
                    <input className={inputStyle} placeholder="Enter title..." value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="text-sm font-bold mb-1 block text-gray-500">Topic</label>
                        <input className={inputStyle} placeholder="e.g. Healthy Tips" value={formData.topic} onChange={(e) => setFormData({ ...formData, topic: e.target.value })} required />
                    </div>
                    <div>
                        <label className="text-sm font-bold mb-1 block text-gray-500">Color</label>
                        <input
                            type="color"
                            value={formData.topicColor}
                            onChange={(e) => setFormData({ ...formData, topicColor: e.target.value })}
                            className="h-10 w-20 rounded cursor-pointer block bg-transparent"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-sm font-bold mb-1 block text-gray-500">Content</label>
                    <RichTextEditor content={formData.content} onChange={(html) => setFormData({ ...formData, content: html })} />
                </div>

                <div>
                    <label className="text-sm font-bold mb-1 block text-gray-500">Cover Image (Optional)</label>
                    <input
                        type="file"
                        onChange={(e) => setCover(e.target.files[0])}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#f97316]/10 file:text-[#f97316] hover:file:bg-[#f97316]/20"
                    />
                </div>

                <button disabled={loading} className="w-full py-3 bg-[#f97316] text-white font-bold rounded-lg hover:bg-orange-600 disabled:opacity-50 flex justify-center">
                    {loading ? <Loader2 className="animate-spin" /> : 'Publish Post'}
                </button>
            </form>
        </div>
    );
};
export default CreateBlog;
