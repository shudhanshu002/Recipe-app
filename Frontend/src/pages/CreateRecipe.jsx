import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Loader2, Upload, Plus, X, Video, Trash2, Image as ImageIcon } from 'lucide-react';
import { recipeApi } from '../api/recipes';
import Input from '../components/Input';
import useThemeStore from '../store/useThemeStore';
import RichTextEditor from '../components/RichTextEditor'; // ✅ Import Rich Text Editor

const CUISINES = [
    'Italian',
    'Indian',
    'Mexican',
    'Chinese',
    'American',
    'Thai',
    'Japanese',
    'French',
    'Greek',
    'Spanish',
    'Lebanese',
    'Korean',
    'Vietnamese',
    'Turkish',
    'Caribbean',
    'Mediterranean',
    'German',
    'Brazilian',
    'Moroccan',
    'Ethiopian',
    'Other',
];

const CreateRecipe = () => {
    const navigate = useNavigate();
    const { isDarkMode } = useThemeStore();
    const [isLoading, setIsLoading] = useState(false);

    // Arrays state
    const [ingredients, setIngredients] = useState(['']);
    const [images, setImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);

    // Video state
    const [video, setVideo] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);
    const [videoThumbnail, setVideoThumbnail] = useState(null); // ✅ Thumbnail State
    const [thumbnailPreview, setThumbnailPreview] = useState(null);

    // We use setValue to manually update the 'instructions' field from the RichEditor
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm();

    const selectedCuisine = watch('cuisine');

    // --- Ingredient Handlers ---
    const handleAddIngredient = () => setIngredients([...ingredients, '']);
    const handleRemoveIngredient = (i) => setIngredients(ingredients.filter((_, idx) => idx !== i));
    const handleIngredientChange = (i, v) => {
        const n = [...ingredients];
        n[i] = v;
        setIngredients(n);
    };

    // --- Image Handlers ---
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 10) return alert('Max 10 images allowed');
        setImages((prev) => [...prev, ...files]);
        setPreviewUrls((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    };

    const handleRemoveImage = (index) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
        setPreviewUrls((prev) => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    // --- Video Handlers ---
    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setVideo(file);
            setVideoPreview(URL.createObjectURL(file));
        }
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setVideoThumbnail(file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    // --- Submit Handler ---
    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const formData = new FormData();

            // Basic Fields
            formData.append('title', data.title);
            formData.append('description', data.description);

            // ✅ Instructions from RichTextEditor
            // If user hasn't typed anything, data.instructions might be undefined, handle that
            formData.append('instructions', data.instructions || '');

            formData.append('difficulty', data.difficulty);
            formData.append('mainIngredient', data.mainIngredient);
            formData.append('cookingTime', data.cookingTime);
            formData.append('isPremium', data.isPremium);

            // Custom Cuisine Logic
            let finalCuisine = data.cuisine;
            if (finalCuisine === 'Other') {
                if (!data.customCuisine || data.customCuisine.trim() === '') {
                    alert('Please type the name of the cuisine.');
                    setIsLoading(false);
                    return;
                }
                finalCuisine = data.customCuisine.trim();
            }
            formData.append('cuisine', finalCuisine);

            // Arrays
            ingredients.forEach((ing) => {
                if (ing.trim()) formData.append('ingredients', ing);
            });

            images.forEach((image) => formData.append('images', image));

            if (video) formData.append('video', video);
            if (videoThumbnail) formData.append('videoThumbnail', videoThumbnail);

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
                {/* Title & Main Ingredient */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Recipe Title" placeholder="Spicy Chicken" {...register('title', { required: true })} />
                    <Input label="Main Ingredient" placeholder="Chicken" {...register('mainIngredient', { required: true })} />
                </div>

                {/* Meta Data */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-1">
                        <label className={`text-sm font-medium ${labelColor}`}>Cuisine</label>
                        <select {...register('cuisine')} className={`w-full px-4 py-2 rounded-lg border ${inputBg}`}>
                            {CUISINES.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
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

                {/* Custom Cuisine Input */}
                {selectedCuisine === 'Other' && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                        <Input label="Specify Cuisine Name" placeholder="e.g. Peruvian" {...register('customCuisine', { required: selectedCuisine === 'Other' })} />
                    </div>
                )}

                {/* Description */}
                <div className="flex flex-col gap-1">
                    <label className={`text-sm font-medium ${labelColor}`}>Description</label>
                    <textarea rows="3" className={`w-full px-4 py-2 rounded-lg border focus:outline-none ${inputBg}`} {...register('description', { required: true })} />
                </div>

                {/* Ingredients List */}
                <div>
                    <label className={`text-sm font-medium mb-2 block ${labelColor}`}>Ingredients</label>
                    <div className="space-y-3">
                        {ingredients.map((ing, i) => (
                            <div key={i} className="flex gap-2">
                                <input value={ing} onChange={(e) => handleIngredientChange(i, e.target.value)} className={`flex-1 px-4 py-2 rounded-lg border ${inputBg}`} />
                                <button type="button" onClick={() => handleRemoveIngredient(i)} className="p-2 text-red-500">
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))}
                        <button type="button" onClick={handleAddIngredient} className="text-sm text-primary flex items-center gap-1 mt-2">
                            <Plus size={16} /> Add
                        </button>
                    </div>
                </div>

                {/* ✅ INSTRUCTIONS (RICH TEXT EDITOR) */}
                <div>
                    <label className={`text-sm font-medium mb-2 block ${labelColor}`}>Instructions</label>
                    {/* Use Controller logic via manual onChange to hook into react-hook-form */}
                    <RichTextEditor content={watch('instructions')} onChange={(html) => setValue('instructions', html)} />
                </div>

                {/* Image Upload */}
                <div>
                    <label className={`text-sm font-medium mb-2 block ${labelColor}`}>Images</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {previewUrls.map((url, i) => (
                            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border dark:border-gray-700">
                                <img src={url} className="w-full h-full object-cover" alt="preview" />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(i)}
                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                        <label
                            className={`aspect-square flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors ${
                                isDarkMode ? 'border-gray-600' : 'border-gray-300'
                            }`}
                        >
                            <Upload className="text-gray-400" />
                            <span className="text-xs text-gray-500 mt-2">Upload</span>
                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                        </label>
                    </div>
                </div>

                {/* Video Upload */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={`text-sm font-medium mb-2 block ${labelColor}`}>Video (Optional)</label>
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
                                <label className="cursor-pointer block py-8 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-lg">
                                    <Video className="mx-auto text-gray-400 mb-2" size={32} />
                                    <span className={`text-sm ${labelColor}`}>Click to upload video</span>
                                    <input type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* ✅ Video Thumbnail Upload (Only if video exists) */}
                    {video && (
                        <div className="animate-in fade-in">
                            <label className={`text-sm font-medium mb-2 block ${labelColor}`}>Video Thumbnail (Optional)</label>
                            <div className={`p-4 border-2 border-dashed rounded-xl text-center ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                                {thumbnailPreview ? (
                                    <div className="relative w-full max-w-sm mx-auto">
                                        <img src={thumbnailPreview} className="rounded-lg w-full h-32 object-cover" alt="thumb" />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setVideoThumbnail(null);
                                                setThumbnailPreview(null);
                                            }}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="cursor-pointer block py-8 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-lg">
                                        <ImageIcon className="mx-auto text-gray-400 mb-2" size={32} />
                                        <span className={`text-sm ${labelColor}`}>Upload Cover Image</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />
                                    </label>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <input type="checkbox" {...register('isPremium')} className="w-5 h-5 text-primary rounded" />
                    <label className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Mark as Premium</label>
                </div>

                <button type="submit" disabled={isLoading} className="w-full py-3 bg-primary text-white font-bold rounded-lg flex items-center justify-center gap-2">
                    {isLoading ? <Loader2 className="animate-spin" /> : 'Publish Recipe'}
                </button>
            </form>
        </div>
    );
};

export default CreateRecipe;
