import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

// recipe api to create call
import { recipeApi } from '../api/recipes';

// theme store
import useThemeStore from '../store/useThemeStore';

// usable components
import RichTextEditor from '../components/RichTextEditor';  // for high user end test editor
import { FilterDropdown } from '../components/FilterDropdown'; // ui interactive dropdown
import Input from '../components/Input'; // input component

// icons & toast
import { toast, ToastContainer } from 'react-toastify';
import { Loader2, Upload, Plus, X, Video, Trash2, Image as ImageIcon, Leaf, Drumstick, BarChart, Utensils } from 'lucide-react';


// options
const CUISINES = ['Italian','Indian','Mexican','Chinese','American','Thai','Japanese','French','Greek','Spanish','Lebanese','Korean','Vietnamese','Turkish','Caribbean','Mediterranean','German','Brazilian','Moroccan','Ethiopian','Other',];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const CreateRecipe = () => {
    const navigate = useNavigate();
    const { theme } = useThemeStore();
    const isDarkMode = theme === 'dark';

    const [isLoading, setIsLoading] = useState(false);

    // Arrays state
    const [ingredients, setIngredients] = useState(['']);
    const [images, setImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [isVegetarian, setIsVegetarian] = useState(true);

    // Video state
    const [video, setVideo] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);
    const [videoThumbnail, setVideoThumbnail] = useState(null); 
    const [thumbnailPreview, setThumbnailPreview] = useState(null);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm(
        {defaultValues: {
            cuisine: 'Italian',
            difficulty: 'Easy'
        }}
    );

    const selectedCuisine = watch('cuisine');
    const selectedDifficulty = watch('difficulty');

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
        if (files.length + images.length > 10) return toast.info('Max 10 images allowed');
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

            
            formData.append('title', data.title);
            formData.append('description', data.description);

            // Instructions from RichTextEditor
            formData.append('instructions', data.instructions || '')
            formData.append('difficulty', data.difficulty);
            formData.append('mainIngredient', data.mainIngredient);
            formData.append('cookingTime', data.cookingTime);
            formData.append('isPremium', data.isPremium);
            formData.append('isVegetarian', isVegetarian);
            formData.append('calories', data.calories);

            // Custom Cuisine Logic
            let finalCuisine = data.cuisine;
            if (finalCuisine === 'Other') {
                if (!data.customCuisine || data.customCuisine.trim() === '') {
                    toast.arguments('Please type the name of the cuisine.');
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
            toast.error('Failed to create recipe. Check console.');
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
        <div className="max-w-3xl mx-auto mb-10 font-dancing">
            <ToastContainer />
            <div className="mb-8">
                <h1 className={`text-3xl font-bold ${textColor}`}>Create New Recipe</h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className={`space-y-8 p-8 rounded-xl shadow-sm border ${cardBg}`}>
                {/* Title & Main Ingredient */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Recipe Title" placeholder="Spicy Chicken" {...register('title', { required: true })} />
                    <Input label="Main Ingredient" placeholder="Chicken" {...register('mainIngredient', { required: true })} />
                </div>

                <div className="flex flex-col gap-2">
                    <label className={`text-sm font-medium ${labelColor}`}>Dietary Type</label>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => setIsVegetarian(true)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border transition-all ${
                                isVegetarian ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : `${inputBg}`
                            } `}
                        >
                            <Leaf size={18} /> Veg
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsVegetarian(false)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border transition-all ${
                                !isVegetarian ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' : `${inputBg}`
                            }`}
                        >
                            <Drumstick size={18} /> Non-Veg
                        </button>
                    </div>
                </div>

                {/* Meta Data */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Replaced native Cuisine Select with FilterDropdown */}
                    <div className="flex flex-col gap-1">
                        <label className={`text-sm font-medium ${labelColor}`}>Cuisine</label>
                        <FilterDropdown
                            label="Select"
                            icon={Utensils}
                            value={selectedCuisine}
                            options={CUISINES}
                            isDarkMode={isDarkMode}
                            onChange={(val) => setValue('cuisine', val, { shouldValidate: true })}
                        />
                    </div>

                    {/* Replaced native Difficulty Select with FilterDropdown */}
                    <div className="flex flex-col gap-1">
                        <label className={`text-sm font-medium ${labelColor}`}>Difficulty</label>
                        <FilterDropdown
                            label="Select"
                            icon={BarChart}
                            value={selectedDifficulty}
                            options={DIFFICULTIES}
                            isDarkMode={isDarkMode}
                            onChange={(val) => setValue('difficulty', val, { shouldValidate: true })}
                        />
                    </div>
                    <Input label="Time (mins)" type="number" {...register('cookingTime')} />
                    {/* CALORIES INPUT */}
                    <Input label="Calories (kcal)" type="number" placeholder="450" {...register('calories')} />
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
                        <button type="button" onClick={handleAddIngredient} className="text-sm text-[#f97316] flex items-center gap-1 mt-2">
                            <Plus size={16} /> Add
                        </button>
                    </div>
                </div>

                {/* INSTRUCTIONS (RICH TEXT EDITOR) */}
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
                            <div key={i} className={`relative group aspect-square rounded-lg overflow-hidden border ${isDarkMode ? '' : 'border-gray-700'}`}>
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
                            className={`aspect-square flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:border-[#f97316] hover:bg-[#f97316]/5 transition-colors ${
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
                                <label className={`cursor-pointer block py-8 transition-colors rounded-lg ${isDarkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'}`}>
                                    <Video className="mx-auto text-gray-400 mb-2" size={32} />
                                    <span className={`text-sm ${labelColor}`}>Click to upload video</span>
                                    <input type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Video Thumbnail Upload (Only if video exists) */}
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
                                    <label className={`cursor-pointer block py-8 transition-colors rounded-lg ${isDarkMode ? 'hover:bg-gray-800/50 ' : 'hover:bg-gray-50'}`}>
                                        <ImageIcon className="mx-auto text-gray-400 mb-2" size={32} />
                                        <span className={`text-sm ${labelColor}`}>Upload Cover Image</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />
                                    </label>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className={`flex items-center gap-3 p-4 rounded-lg ${isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
                    <input type="checkbox" {...register('isPremium')} className="w-5 h-5 text-[#f97316] rounded" />
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>Mark as Premium</label>
                </div>

                <button type="submit" disabled={isLoading} className="w-full py-3 bg-[#f97316] text-white font-bold rounded-lg flex items-center justify-center gap-2">
                    {isLoading ? <Loader2 className="animate-spin" /> : 'Publish Recipe'}
                </button>
            </form>
        </div>
    );
};

export default CreateRecipe;
