import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import api from '../lib/axios';
import useThemeStore from '../store/useThemeStore';

const Notifications = () => {
    const [notifs, setNotifs] = useState([]);
    const { isDarkMode } = useThemeStore();

    useEffect(() => {
        api.get('/notifications')
            .then((res) => setNotifs(res.data.data.notifications))
            .catch(console.error);
    }, []);

    const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
    const cardBg = isDarkMode ? 'bg-[#1e1e1e] border-gray-700' : 'bg-white border-gray-200';

    return (
        <div className="max-w-2xl mx-auto space-y-6 mb-10">
            <h1 className={`text-3xl font-bold flex gap-3 ${textColor}`}>
                <Bell /> Notifications
            </h1>
            <div className={`rounded-xl shadow-sm border divide-y ${cardBg} ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                {notifs.map((n) => (
                    <div key={n._id} className="p-4 flex gap-4">
                        <div className="flex-1">
                            <p className={`text-sm ${textColor}`}>
                                {n.sender?.username} {n.type.toLowerCase().replace('_', ' ')}
                            </p>
                            <span className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default Notifications;
