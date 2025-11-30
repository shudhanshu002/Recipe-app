import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, BookOpen, Edit, Check, Star, Camera, Loader2, Save, Image as ImageIcon, UserPlus, UserCheck, Lock, Bookmark, X } from 'lucide-react';
import api from '../lib/axios';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import RecipeCard from '../components/RecipeCard';

const Profile = () => {
    const { username } = useParams();
    const { user: currentUser, updateUser } = useAuthStore();
    const { isDarkMode } = useThemeStore();

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

    if (loading) return <div className={`text-center py-20 ${textColor}`}>Loading Profile...</div>;
    if (error || !profile) return <div className={`text-center py-20 ${textColor}`}>{error}</div>;

    const isMyProfile = currentUser?.username === profile.username;

    // --- Helper Component for Modal ---
    const UserListModal = ({ title, onClose, users }) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className={`w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[80vh] ${cardBg}`}>
                <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    <h3 className={`font-bold text-lg ${textColor}`}>{title}</h3>
                    <button onClick={onClose}>
                        <X className="text-gray-500 hover:text-red-500" />
                    </button>
                </div>
                <div className="overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {users.length > 0 ? (
                        users.map((u) => (
                            <Link key={u._id} to={`/profile/${u.username}`} onClick={onClose} className="flex items-center gap-3 hover:opacity-80">
                                <img src={u.avatar} className="w-10 h-10 rounded-full object-cover" alt={u.username} />
                                <div>
                                    <p className={`font-bold text-sm ${textColor}`}>{u.username}</p>
                                    {u.title && <p className="text-xs text-primary">{u.title}</p>}
                                </div>
                            </Link>
                        ))
                    ) : (
                        <p className={`text-center py-4 ${subText}`}>No users found.</p>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 mb-10">
            {/* Banner */}
            <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden group shadow-sm bg-gray-200">
                <img src={profile.coverImage || 'https://placehold.co/1200x400?text=Cover+Image'} alt="Cover" className="w-full h-full object-cover" />
                {isMyProfile && (
                    <>
                        <button
                            onClick={() => coverInputRef.current.click()}
                            disabled={uploadingCover}
                            className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                        >
                            {uploadingCover ? <Loader2 className="animate-spin" size={20} /> : <ImageIcon size={20} />}
                        </button>
                        <input type="file" ref={coverInputRef} onChange={handleCoverChange} accept="image/*" className="hidden" />
                    </>
                )}
            </div>

            {/* Profile Info */}
            <div className="relative px-6 md:px-10 -mt-16">
                <div className={`rounded-2xl p-8 shadow-lg border flex flex-col md:flex-row items-start gap-8 relative z-10 ${cardBg}`}>
                    {/* Avatar */}
                    <div className="relative group flex-shrink-0 mx-auto md:mx-0 -mt-16 md:-mt-12">
                        <img
                            src={profile.avatar || 'https://placehold.co/150x150?text=Avatar'}
                            alt={profile.username}
                            className={`w-32 h-32 rounded-full object-cover border-4 shadow-md ${isDarkMode ? 'border-[#1e1e1e]' : 'border-white'}`}
                        />
                        {isMyProfile && (
                            <>
                                <button
                                    onClick={() => avatarInputRef.current.click()}
                                    disabled={uploadingAvatar}
                                    className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                                >
                                    {uploadingAvatar ? <Loader2 className="animate-spin" size={24} /> : <Camera size={24} />}
                                </button>
                                <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                            </>
                        )}
                    </div>

                    <div className="flex-1 w-full pt-2">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                            <div className="w-full">
                                <div className="flex items-center gap-4 mb-2">
                                    <h1 className={`text-3xl font-bold ${textColor}`}>{profile.username}</h1>

                                    {/* Follow / Saved Button */}
                                    {!isMyProfile ? (
                                        <button
                                            onClick={handleSubscribe}
                                            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                                                isSubscribed
                                                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                                                    : 'bg-primary text-white hover:bg-orange-600 shadow-md'
                                            }`}
                                        >
                                            {isSubscribed ? (
                                                <>
                                                    <UserCheck size={16} /> Following
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlus size={16} /> Follow
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <Link
                                            to="/favorites"
                                            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 border ${
                                                isDarkMode ? 'border-gray-700 hover:bg-gray-800 text-gray-300' : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                                            }`}
                                        >
                                            <Bookmark size={16} /> Saved Recipes
                                        </Link>
                                    )}

                                    {isMyProfile && !isEditing && (
                                        <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-primary p-1">
                                            <Edit size={18} />
                                        </button>
                                    )}
                                </div>

                                {profile.title && !isEditing && (
                                    <span className="inline-block text-xs bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20 font-medium mb-2">{profile.title}</span>
                                )}

                                {isEditing ? (
                                    <div className="mt-4 space-y-3 max-w-lg p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                                        <input
                                            value={editForm.title}
                                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                            className={`w-full px-3 py-2 rounded border ${inputBg}`}
                                            placeholder="Title (e.g. Home Chef)"
                                        />
                                        <textarea
                                            value={editForm.about}
                                            onChange={(e) => setEditForm({ ...editForm, about: e.target.value })}
                                            className={`w-full px-3 py-2 rounded border ${inputBg}`}
                                            placeholder="Bio"
                                        />
                                        <div className="flex items-center gap-2 mt-2">
                                            <input
                                                type="checkbox"
                                                checked={editForm.isFollowingPublic}
                                                onChange={(e) => setEditForm({ ...editForm, isFollowingPublic: e.target.checked })}
                                                className="w-4 h-4 accent-primary"
                                            />
                                            <label className={`text-sm ${subText}`}>Make "Following" list Public</label>
                                        </div>
                                        <div className="flex gap-2 justify-end pt-2">
                                            <button onClick={() => setIsEditing(false)} className="px-3 py-1 border rounded text-sm dark:text-white">
                                                Cancel
                                            </button>
                                            <button onClick={handleSaveProfile} disabled={isSaving} className="px-3 py-1 bg-primary text-white rounded text-sm flex items-center gap-1">
                                                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className={`${subText} max-w-2xl leading-relaxed mb-4`}>{profile.about || "This chef hasn't written a bio yet."}</p>
                                )}
                            </div>
                        </div>


                        <div className="flex flex-wrap gap-6 pt-4 border-t border-gray-100 dark:border-gray-800 select-none">
                            <button onClick={() => fetchUserList('followers')} className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                                <Users size={18} className="text-primary" />
                                <span className={`font-bold ${textColor}`}>{profile.subscribersCount}</span> <span className="text-gray-500">Followers</span>
                            </button>

                            <button onClick={() => fetchUserList('following')} className="flex items-center gap-2 hover:opacity-70 transition-opacity relative group">
                                <div className="relative">
                                    <Users size={18} className="text-blue-500" />
                                    {!profile.isFollowingPublic && !isMyProfile && (
                                        <div className="absolute -bottom-1 -right-1 bg-gray-800 rounded-full p-[1px]">
                                            <Lock size={10} className="text-white" />
                                        </div>
                                    )}
                                </div>
                                <span className={`font-bold ${textColor}`}>{profile.subscribedToCount || 0}</span> <span className="text-gray-500">Following</span>
                            </button>

                            <div className="flex items-center gap-2">
                                <BookOpen size={18} className="text-primary" />
                                <span className={`font-bold ${textColor}`}>{recipes.length}</span>
                                <span className="text-gray-500">Recipes</span>
                            </div>
                        </div>

                        {/* Badges Row */}
                        {profile.badges?.length > 0 && (
                            <div className="flex flex-wrap gap-3 mt-4">
                                {profile.badges.map((badge, idx) => (
                                    <span
                                        key={idx}
                                        className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 bg-${badge.color}-50 text-${badge.color}-700 border-${badge.color}-200`}
                                    >
                                        {badge.icon} {badge.label}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showFollowers && <UserListModal title="Followers" users={userList} onClose={() => setShowFollowers(false)} />}
            {showFollowing && <UserListModal title="Following" users={userList} onClose={() => setShowFollowing(false)} />}

            <h2 className={`text-2xl font-bold mb-6 px-6 ${textColor}`}>Recipes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6">
                {recipes.map((r) => (
                    <RecipeCard
                        key={r._id}
                        recipe={r}
                        onDelete={isMyProfile ? handleRemoveRecipe : undefined}
                    />
                ))}
            </div>
        </div>
    );
};

export default Profile;
