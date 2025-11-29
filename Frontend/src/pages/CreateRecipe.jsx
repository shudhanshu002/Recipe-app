import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Loader2, Upload, Plus, X, Video } from 'lucide-react';
import { recipeApi } from '../api/recipes';
import Input from '../components/Input';
import useThemeStore from '../store/useThemeStore';

const CreateRecipe = () => {
    const navigate = useNavigate();
    const { isDarkMode } = useThemeStore();
    const [isLoading, setIsLoading] = useState(false);
    const [ingredients, setIngredients] = useState(['']);
    const [images, setImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);

    // ✅ NEW: Video State
    const [video, setVideo] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);

    const { register, handleSubmit } = useForm();

    // Ingredient Handlers
    const handleAddIngredient = () => setIngredients([...ingredients, '']);
    const handleRemoveIngredient = (i) => setIngredients(ingredients.filter((_, idx) => idx !== i));
    const handleIngredientChange = (i, v) => {
        const n = [...ingredients];
        n[i] = v;
        setIngredients(n);
    };

    // Image Handler
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages([...images, ...files]);
        setPreviewUrls([...previewUrls, ...files.map((f) => URL.createObjectURL(f))]);
    };

    // ✅ NEW: Video Handler
    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setVideo(file);
            setVideoPreview(URL.createObjectURL(file));
        }
    };

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            Object.keys(data).forEach((key) => formData.append(key, data[key]));

            ingredients.forEach((i) => i.trim() && formData.append('ingredients', i));
            images.forEach((i) => formData.append('images', i));

            // ✅ Append Video
            if (video) {
                formData.append('video', video);
            }

            await recipeApi.create(formData);
            navigate('/');
        } catch (error) {
            console.error(error);
            alert('Failed to create recipe. Check console.');
        } finally {
            setIsLoading(false);
        }
    };

    // Styles
    const cardBg = isDarkMode ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-100';
    const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
    const labelColor = isDarkMode ? 'text-gray-300' : 'text-gray-700';
    const inputBg = isDarkMode ? 'bg-[#1e1e1e] border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900';

    return (
        <div className="max-w-3xl mx-auto mb-10">
            <div className="mb-8">
                <h1 className={`text-3xl font-bold ${textColor}`}>Create New Recipe</h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className={`space-y-8 p-8 rounded-xl shadow-sm border ${cardBg}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Recipe Title" placeholder="Spicy Chicken" {...register('title', { required: true })} />
                    <Input label="Main Ingredient" placeholder="Chicken" {...register('mainIngredient', { required: true })} />
                </div>

                {/* Dropdowns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-1">
                        <label className={`text-sm font-medium ${labelColor}`}>Cuisine</label>
                        <select {...register('cuisine')} className={`w-full px-4 py-2 rounded-lg border ${inputBg}`}>
                            <option value="Italian">Italian</option>
                            <option value="Indian">Indian</option>
                            <option value="Mexican">Mexican</option>
                            <option value="Chinese">Chinese</option>
                            <option value="American">American</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className={`text-sm font-medium ${labelColor}`}>Difficulty</label>
                        <select {...register('difficulty')} className={`w-full px-4 py-2 rounded-lg border ${inputBg}`}>
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                    </div>
                    <Input label="Time (mins)" type="number" {...register('cookingTime')} />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1">
                    <label className={`text-sm font-medium ${labelColor}`}>Description</label>
                    <textarea rows="3" className={`w-full px-4 py-2 rounded-lg border focus:outline-none ${inputBg}`} {...register('description')} />
                </div>

                {/* Dynamic Ingredients */}
                <div>
                    <label className={`text-sm font-medium mb-2 block ${labelColor}`}>Ingredients</label>
                    <div className="space-y-3">
                        {ingredients.map((ing, i) => (
                            <div key={i} className="flex gap-2">
                                <input value={ing} onChange={(e) => handleIngredientChange(i, e.target.value)} className={`flex-1 px-4 py-2 rounded-lg border ${inputBg}`} />
                                <button type="button" onClick={() => handleRemoveIngredient(i)} className="p-2 text-red-500">
                                    <X size={20} />
                                </button>
                            </div>
                        ))}
                        <button type="button" onClick={handleAddIngredient} className="text-sm text-primary flex items-center gap-1 mt-2">
                            <Plus size={16} /> Add
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    <label className={`text-sm font-medium ${labelColor}`}>Instructions</label>
                    <textarea rows="6" className={`w-full px-4 py-2 rounded-lg border focus:outline-none ${inputBg}`} {...register('instructions')} />
                </div>

                {/* Image Upload */}
                <div>
                    <label className={`text-sm font-medium mb-2 block ${labelColor}`}>Images</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {previewUrls.map((url, i) => (
                            <img key={i} src={url} className="aspect-square rounded-lg object-cover" />
                        ))}
                        <label
                            className={`aspect-square flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}
                        >
                            <Upload className="text-gray-400" />
                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                        </label>
                    </div>
                </div>

                {/* ✅ Video Upload Section */}
                <div>
                    <label className={`text-sm font-medium mb-2 block ${labelColor}`}>Video Tutorial (Optional)</label>
                    <div className={`p-4 border-2 border-dashed rounded-xl text-center ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                        {videoPreview ? (
                            <div className="relative w-full max-w-sm mx-auto">
                                <video src={videoPreview} controls className="rounded-lg w-full" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setVideo(null);
                                        setVideoPreview(null);
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <label className="cursor-pointer block py-8">
                                <Video className="mx-auto text-gray-400 mb-2" size={32} />
                                <span className={`text-sm ${labelColor}`}>Click to upload video</span>
                                <input type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
                            </label>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <input type="checkbox" {...register('isPremium')} className="w-5 h-5 text-primary rounded" />
                    <label className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Mark as Premium</label>
                </div>

                <button type="submit" disabled={isLoading} className="w-full py-3 bg-primary text-black font-bold rounded-lg flex items-center justify-center gap-2 bg-orange-500">
                    {isLoading ? <Loader2 className="animate-spin" /> : 'Publish Recipe'}
                </button>
            </form>
        </div>
    );
};

export default CreateRecipe;
