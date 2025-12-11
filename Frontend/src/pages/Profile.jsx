import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';

// api
import api from '../lib/axios';

// store
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';

// components
import RecipeCard from '../components/RecipeCard';
import ProfileSkeleton from '../components/skeletons/ProfileSkeleton';

// icons
import { Users, BookOpen, Edit, Check, Camera, Loader2, Save, Image as ImageIcon, UserPlus, UserCheck, Lock, Bookmark, X } from 'lucide-react';

const Profile = () => {
    const { username } = useParams();
    const { user: currentUser, updateUser } = useAuthStore();
    const { theme } = useThemeStore();
    const isDarkMode = theme === 'dark';

    const [profile, setProfile] = useState(null);
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubscribed, setIsSubscribed] = useState(false);

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ about: '', title: '', isFollowingPublic: true });
    const [isSaving, setIsSaving] = useState(false);

    // Modals & Lists
    const [showFollowers, setShowFollowers] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);
    const [userList, setUserList] = useState([]);
    const [listLoading, setListLoading] = useState(false);

    // Upload States
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const avatarInputRef = useRef(null);
    const coverInputRef = useRef(null);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setError(null);
            try {
                // 1. Fetch Profile Info
                const profileRes = await api.get(`/subscriptions/c/${username}`);
                setProfile(profileRes.data.data);
                setIsSubscribed(profileRes.data.data.isSubscribed);

                setEditForm({
                    about: profileRes.data.data.about || '',
                    title: profileRes.data.data.title || '',
                    isFollowingPublic: profileRes.data.data.isFollowingPublic,
                });

                // 2. Fetch User's Recipes
                const recipesRes = await api.get(`/recipes`);
                const userRecipes = recipesRes.data.data.recipes.filter((r) => r.createdBy?.username === username);
                setRecipes(userRecipes);
            } catch (error) {
                console.error('Failed to fetch profile', error);
                setError('User not found');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [username]);

    // --- Handlers ---

    const fetchUserList = async (type) => {
        if (type === 'following' && !profile.isFollowingPublic && currentUser?.username !== profile.username) {
            return alert("This user's following list is private.");
        }

        setListLoading(true);
        setUserList([]);
        try {
            const endpoint = type === 'followers' ? `/subscriptions/followers/${profile._id}` : `/subscriptions/following/${profile._id}`;

            const res = await api.get(endpoint);
            setUserList(res.data.data);
            if (type === 'followers') setShowFollowers(true);
            else setShowFollowing(true);
        } catch (error) {
            console.error(error);
        } finally {
            setListLoading(false);
        }
    };

    const handleSubscribe = async () => {
        if (!currentUser) return alert('Login to follow users');

        const previousState = isSubscribed;
        const previousCount = profile.subscribersCount;

        setIsSubscribed(!isSubscribed);
        setProfile((prev) => ({
            ...prev,
            subscribersCount: !previousState ? prev.subscribersCount + 1 : prev.subscribersCount - 1,
        }));

        try {
            await api.post(`/subscriptions/c/${profile._id}`);
        } catch (error) {
            setIsSubscribed(previousState);
            setProfile((prev) => ({ ...prev, subscribersCount: previousCount }));
            alert('Something went wrong');
        }
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            await api.patch('/users/update-account', editForm);
            setProfile((prev) => ({ ...prev, ...editForm }));
            if (currentUser.username === profile.username) updateUser(editForm);
            setIsEditing(false);
        } catch {
            alert('Update failed');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingAvatar(true);
        const fd = new FormData();
        fd.append('avatar', file);
        try {
            const res = await api.patch('/users/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setProfile((p) => ({ ...p, avatar: res.data.data.avatar }));
            if (currentUser.username === profile.username) updateUser({ avatar: res.data.data.avatar });
        } catch {
            alert('Upload failed');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleCoverChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingCover(true);
        const fd = new FormData();
        fd.append('coverImage', file);
        try {
            const res = await api.patch('/users/cover-image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setProfile((p) => ({ ...p, coverImage: res.data.data.coverImage }));
        } catch {
            alert('Upload failed');
        } finally {
            setUploadingCover(false);
        }
    };

    const handleRemoveRecipe = (deletedId) => {
        setRecipes((prev) => prev.filter((r) => r._id !== deletedId));
        setProfile((prev) => ({
            ...prev,
            stats: {
                ...prev.stats,
                recipes: Math.max(0, (prev.stats?.recipes || 0) - 1),
            },
        }));
    };

    // Styles
    const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
    const cardBg = isDarkMode ? 'bg-[#1e1e1e] border-gray-700' : 'bg-white border-gray-100';
    const subText = isDarkMode ? 'text-gray-400' : 'text-gray-500';
    const inputBg = isDarkMode ? 'bg-[#2d2d2d] border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900';

    if (loading) return <ProfileSkeleton />;
    if (error || !profile) return <div className={`text-center py-20 ${textColor}`}>{error}</div>;

    const isMyProfile = currentUser?.username === profile.username;

    // --- Helper Component for Modal ---
    const UserListModal = ({ title, onClose, users }) => (
        <div className="font-dancing fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className={`w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden ${cardBg}`}>
                <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    <h3 className={`font-bold text-lg ${textColor}`}>{title}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <X className="text-gray-500 hover:text-red-500" size={20} />
                    </button>
                </div>
                <div className="overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {users.length > 0 ? (
                        users.map((u) => (
                            <Link
                                key={u._id}
                                to={`/profile/${u.username}`}
                                onClick={onClose}
                                className={`flex items-center gap-4 p-3 rounded-xl transition-all ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
                            >
                                <img src={u.avatar} className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700" alt={u.username} />
                                <div>
                                    <p className={`font-bold text-sm ${textColor}`}>{u.username}</p>
                                    {u.title && <p className="text-xs text-[#f97316] font-medium">{u.title}</p>}
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="flex flex-col items-center py-8 text-center">
                            <Users size={40} className="text-gray-300 mb-2" />
                            <p className={`${subText}`}>No users found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="font-dancing max-w-7xl mx-auto space-y-8 mb-16 px-4 md:px-6">
            {/* Banner Section */}
            <div className="relative w-full h-64 md:h-80 rounded-3xl overflow-hidden group shadow-md bg-gray-200">
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent z-10" />
                <img
                    src={profile.coverImage || 'https://placehold.co/1200x400?text=Cover+Image'}
                    alt="Cover"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {isMyProfile && (
                    <>
                        <button
                            onClick={() => coverInputRef.current.click()}
                            disabled={uploadingCover}
                            className="absolute top-4 right-4 z-20 p-2.5 bg-black/40 backdrop-blur-md text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60"
                        >
                            {uploadingCover ? <Loader2 className="animate-spin" size={20} /> : <ImageIcon size={20} />}
                        </button>
                        <input type="file" ref={coverInputRef} onChange={handleCoverChange} accept="image/*" className="hidden" />
                    </>
                )}
            </div>

            {/* Profile Info Card */}
            <div className="relative px-2 md:px-8 -mt-24 md:-mt-28 z-20">
                <div className={`rounded-3xl p-6 md:p-8 shadow-xl border backdrop-blur-sm relative ${cardBg}`}>
                    <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                        {/* Avatar Column */}
                        <div className="flex flex-col items-center md:items-start -mt-20 md:-mt-24">
                            <div className="relative group">
                                <div className={`p-1.5 rounded-full ${cardBg}`}>
                                    <img
                                        src={profile.avatar || 'https://placehold.co/150x150?text=Avatar'}
                                        alt={profile.username}
                                        className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover shadow-lg"
                                    />
                                </div>

                                {isMyProfile && (
                                    <>
                                        <button
                                            onClick={() => avatarInputRef.current.click()}
                                            disabled={uploadingAvatar}
                                            className="absolute inset-0 m-1.5 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white backdrop-blur-[2px]"
                                        >
                                            {uploadingAvatar ? <Loader2 className="animate-spin" size={32} /> : <Camera size={32} />}
                                        </button>
                                        <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                                    </>
                                )}
                            </div>

                            {/* Mobile Actions */}
                            <div className="md:hidden mt-4 w-full flex justify-center gap-3">
                                {/* Buttons rendered here for mobile layout */}
                                {!isMyProfile ? (
                                    <button
                                        onClick={handleSubscribe}
                                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg flex items-center gap-2 ${
                                            isSubscribed
                                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                                                : 'bg-[#f97316] text-white hover:bg-orange-600 hover:shadow-orange-500/20'
                                        }`}
                                    >
                                        {isSubscribed ? (
                                            <>
                                                <UserCheck size={18} /> Following
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus size={18} /> Follow
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <Link
                                        to="/favorites"
                                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border shadow-sm ${
                                            isDarkMode ? 'border-gray-700 hover:bg-gray-800 text-gray-300' : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                                        }`}
                                    >
                                        <Bookmark size={18} /> Saved
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Info Column */}
                        <div className="flex-1 w-full pt-2 text-center md:text-left">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                <div>
                                    <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                                        <h1 className={`text-3xl md:text-4xl font-black tracking-tight ${textColor}`}>{profile.username}</h1>
                                        {profile.title && !isEditing && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                                                {profile.title}
                                            </span>
                                        )}
                                        {isMyProfile && !isEditing && (
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="p-2 text-gray-400 hover:text-[#f97316] hover:bg-orange-50 dark:hover:bg-orange-900/10 rounded-full transition-colors"
                                            >
                                                <Edit size={18} />
                                            </button>
                                        )}
                                    </div>
                                    {!isEditing && <p className={`text-sm ${subText} font-medium`}>Joined Chef's Kitchen Community</p>}
                                </div>

                                {/* Desktop Actions */}
                                <div className="hidden md:flex items-center gap-3">
                                    {!isMyProfile ? (
                                        <button
                                            onClick={handleSubscribe}
                                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg flex items-center gap-2 active:scale-95 ${
                                                isSubscribed
                                                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                                                    : 'bg-[#f97316] text-white hover:bg-orange-600 hover:shadow-orange-500/20'
                                            }`}
                                        >
                                            {isSubscribed ? (
                                                <>
                                                    <UserCheck size={18} /> Following
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlus size={18} /> Follow
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <Link
                                            to="/favorites"
                                            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border shadow-sm ${
                                                isDarkMode ? 'border-gray-700 hover:bg-gray-800 text-gray-300' : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                                            }`}
                                        >
                                            <Bookmark size={18} /> Saved
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Edit Form or Bio */}
                            {isEditing ? (
                                <div className="mt-4 p-5 bg-gray-50 dark:bg-black/20 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 animate-in fade-in slide-in-from-top-2">
                                    <div className="grid gap-4">
                                        <div className="space-y-1">
                                            <label className={`text-xs font-bold uppercase ${subText}`}>Display Title</label>
                                            <input
                                                value={editForm.title}
                                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                                className={`w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-[#f97316]/50 outline-none transition-all ${inputBg}`}
                                                placeholder="e.g. Master Chef"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className={`text-xs font-bold uppercase ${subText}`}>About You</label>
                                            <textarea
                                                value={editForm.about}
                                                onChange={(e) => setEditForm({ ...editForm, about: e.target.value })}
                                                className={`w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-[#f97316]/50 outline-none transition-all ${inputBg}`}
                                                placeholder="Tell us about your culinary journey..."
                                                rows={3}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between pt-2">
                                            <div
                                                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                                                onClick={() => setEditForm({ ...editForm, isFollowingPublic: !editForm.isFollowingPublic })}
                                            >
                                                <div
                                                    className={`w-5 h-5 rounded border flex items-center justify-center ${
                                                        editForm.isFollowingPublic ? 'bg-[#f97316] border-[#f97316]' : 'border-gray-400'
                                                    }`}
                                                >
                                                    {editForm.isFollowingPublic && <Check size={14} className="text-white" />}
                                                </div>
                                                <span className={`text-sm font-medium ${textColor}`}>Public Following List</span>
                                            </div>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => setIsEditing(false)}
                                                    className={`px-4 py-2 rounded-xl text-sm font-bold border hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${textColor} ${
                                                        isDarkMode ? 'border-gray-600' : 'border-gray-300'
                                                    }`}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleSaveProfile}
                                                    disabled={isSaving}
                                                    className="px-6 py-2 bg-[#f97316] hover:bg-orange-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20"
                                                >
                                                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className={`${subText} text-base leading-relaxed max-w-3xl mb-6 mx-auto md:mx-0`}>{profile.about || 'This chef keeps their recipes spicy but their bio empty.'}</p>
                            )}

                            {/* Stats Row */}
                            <div className={`flex flex-wrap justify-center md:justify-start gap-2 md:gap-8 pt-6 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                                <button
                                    onClick={() => fetchUserList('followers')}
                                    className="group flex flex-col items-center md:items-start px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    <span className={`text-2xl font-black ${textColor} group-hover:text-[#f97316] transition-colors`}>{profile.subscribersCount}</span>
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">Followers</span>
                                </button>

                                <div className={`w-px h-12 self-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />

                                <button
                                    onClick={() => fetchUserList('following')}
                                    className="group flex flex-col items-center md:items-start px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors relative"
                                >
                                    <span className={`text-2xl font-black ${textColor} group-hover:text-blue-500 transition-colors`}>{profile.subscribedToCount || 0}</span>
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                                        Following {!profile.isFollowingPublic && !isMyProfile && <Lock size={10} />}
                                    </span>
                                </button>

                                <div className={`w-px h-12 self-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />

                                <div className="flex flex-col items-center md:items-start px-4 py-2">
                                    <span className={`text-2xl font-black ${textColor}`}>{recipes.length}</span>
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Recipes</span>
                                </div>
                            </div>

                            {/* Badges */}
                            {profile.badges?.length > 0 && (
                                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                                    {profile.badges.map((badge, idx) => (
                                        <span
                                            key={idx}
                                            className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-sm bg-${badge.color}-50 text-${badge.color}-700 border-${badge.color}-200`}
                                        >
                                            {badge.icon} {badge.label}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showFollowers && <UserListModal title="Followers" users={userList} onClose={() => setShowFollowers(false)} />}
            {showFollowing && <UserListModal title="Following" users={userList} onClose={() => setShowFollowing(false)} />}

            {/* Recipes Section */}
            <div className="px-2">
                <div className="flex items-center gap-3 mb-6 px-4">
                    <div className="h-8 w-1.5 bg-[#f97316] rounded-full" />
                    <h2 className={`text-2xl md:text-3xl font-bold ${textColor}`}>Latest Recipes</h2>
                </div>

                {recipes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {recipes.map((r) => (
                            <div key={r._id} className="transform transition-all duration-300 hover:-translate-y-1">
                                <RecipeCard recipe={r} onDelete={isMyProfile ? handleRemoveRecipe : undefined} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={`text-center py-16 rounded-3xl border border-dashed ${isDarkMode ? 'border-gray-800 bg-[#1e1e1e]/50' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <BookOpen size={32} />
                        </div>
                        <h3 className={`text-xl font-bold mb-2 ${textColor}`}>No Recipes Yet</h3>
                        <p className={subText}>This chef hasn't published any recipes.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
