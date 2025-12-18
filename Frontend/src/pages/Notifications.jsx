import React, { useEffect, useState } from 'react';
import {
  Bell,
  Heart,
  UserPlus,
  MessageCircle,
  Search,
  Filter,
} from 'lucide-react';
import api from '../lib/axios';
import useThemeStore from '../store/useThemeStore';
import useNotificationStore from '../store/useNotificationStore';
import { formatRelativeDate } from '../utils/formatDate';
import { Link } from 'react-router-dom';
import NotificationSkeleton from '../components/skeletons/NotificationSkeleton';
import { useCallback } from 'react';

const Notifications = () => {
  const [allNotifications, setAllNotifications] = useState([]); // Store full list
  const [filteredNotifications, setFilteredNotifications] = useState([]); // Store filtered list
  const [loading, setLoading] = useState(true);
  const { theme } = useThemeStore();
  const isDarkMode = theme === 'dark';
  const { setUnreadCount } = useNotificationStore();

  // Filter States
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, LIKE, COMMENT, FOLLOW

  // const fetchNotifications = async () => {
  //     try {
  //         const response = await api.get('/notifications');
  //         const notifs = response.data.data.notifications || [];
  //         setAllNotifications(notifs);
  //         setFilteredNotifications(notifs);

  //         // Mark as read logic
  //         if (response.data.data.unreadCount > 0) {
  //             await api.patch('/notifications/read/all');
  //             setUnreadCount(0);

  //             // Update local UI state to show read
  //             const readNotifs = notifs.map((n) => ({ ...n, isRead: true }));
  //             setAllNotifications(readNotifs);
  //             setFilteredNotifications(readNotifs);
  //         }
  //     } catch (error) {
  //         console.error('Failed to fetch notifications', error);
  //     } finally {
  //         setLoading(false);
  //     }
  // };

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get('/notifications');
      const notifs = response.data.data.notifications || [];
      setAllNotifications(notifs);
      setFilteredNotifications(notifs);

      // Mark as read logic
      if (response.data.data.unreadCount > 0) {
        await api.patch('/notifications/read/all');
        setUnreadCount(0);

        // Update local UI state to show read
        const readNotifs = notifs.map((n) => ({ ...n, isRead: true }));
        setAllNotifications(readNotifs);
        setFilteredNotifications(readNotifs);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  }, [setUnreadCount]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Search & Filter Logic
  useEffect(() => {
    let result = allNotifications;

    // 1. Filter by Type
    if (filterType !== 'ALL') {
      const typeMap = {
        LIKE: 'LIKE_RECIPE',
        COMMENT: 'COMMENT',
        FOLLOW: 'FOLLOW',
      };
      result = result.filter((n) => n.type === typeMap[filterType]);
    }

    // 2. Filter by Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (n) =>
          n.sender?.username.toLowerCase().includes(q) ||
          n.recipe?.title.toLowerCase().includes(q)
      );
    }

    setFilteredNotifications(result);
  }, [search, filterType, allNotifications]);

  const getIcon = (type) => {
    switch (type) {
      case 'LIKE_RECIPE':
        return <Heart className="text-red-500 fill-red-500" size={20} />;
      case 'FOLLOW':
        return <UserPlus className="text-blue-500" size={20} />;
      case 'COMMENT':
        return <MessageCircle className="text-green-500" size={20} />;
      default:
        return <Bell className="text-gray-500" size={20} />;
    }
  };

  const getMessage = (n) => {
    const senderName = n.sender?.username || 'Someone';
    switch (n.type) {
      case 'LIKE_RECIPE':
        return (
          <span>
            <span className="font-bold">{senderName}</span> liked your recipe{' '}
            {n.recipe && (
              <Link
                to={`/recipes/${n.recipe._id}`}
                className="font-bold hover:underline ml-1 text-[#f97316]"
              >
                {n.recipe.title}
              </Link>
            )}
          </span>
        );
      case 'FOLLOW':
        return (
          <span>
            <span className="font-bold">{senderName}</span> started following
            you.
          </span>
        );
      case 'COMMENT':
        return (
          <span>
            <span className="font-bold">{senderName}</span> commented on{' '}
            {n.recipe && (
              <Link
                to={`/recipes/${n.recipe._id}`}
                className="font-bold hover:underline ml-1 text-[#f97316]"
              >
                {n.recipe.title}
              </Link>
            )}
          </span>
        );
      default:
        return <span>New notification</span>;
    }
  };

  // Styles
  const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
  const subText = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const cardBg = isDarkMode
    ? 'bg-[#1e1e1e] border-gray-700'
    : 'bg-white border-gray-200';
  const inputBg = isDarkMode
    ? 'bg-[#2d2d2d] border-gray-600 text-white'
    : 'bg-gray-50 border-gray-200 text-gray-900';

  if (loading) return <NotificationSkeleton />;

  return (
    <div className="max-w-3xl mx-auto space-y-6 mb-20 font-dancing">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1
          className={`text-3xl font-bold flex items-center gap-3 ${textColor}`}
        >
          <Bell /> Notifications
        </h1>

        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#f97316]/50 text-sm ${inputBg}`}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['ALL', 'LIKE', 'COMMENT', 'FOLLOW'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-colors ${
              filterType === type
                ? 'bg-[#f97316] text-white border-[#f97316]'
                : `${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`
            }`}
          >
            {type === 'ALL'
              ? 'All'
              : type === 'LIKE'
                ? 'Likes'
                : type === 'COMMENT'
                  ? 'Comments'
                  : 'Followers'}
          </button>
        ))}
      </div>

      <div
        className={`rounded-xl shadow-sm border divide-y ${cardBg} ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'} overflow-hidden`}
      >
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <div
              key={notif._id}
              className={`p-4 flex items-start gap-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50`}
            >
              <Link
                to={`/profile/${notif.sender?.username}`}
                className="shrink-0"
              >
                <img
                  src={notif.sender?.avatar || 'https://via.placeholder.com/40'}
                  className={`w-10 h-10 rounded-full object-cover border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}
                  alt="Sender"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {getIcon(notif.type)}
                  <p className={`text-sm ${textColor} truncate`}>
                    {getMessage(notif)}
                  </p>
                </div>
                <span className={`text-xs ${subText}`}>
                  {formatRelativeDate(notif.createdAt)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className={`p-12 text-center ${subText}`}>
            <Bell size={48} className="mb-4 mx-auto opacity-20" />
            <p>No notifications found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
