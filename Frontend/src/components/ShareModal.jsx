import React from 'react';
import { X, Copy, Check } from 'lucide-react';
import useThemeStore from '../store/useThemeStore';

const ShareModal = ({ url, title, onClose }) => {
  const { theme } = useThemeStore();
  const isDarkMode = theme === 'dark';
  const [copied, setCopied] = React.useState(false);

  // Social Media Share Links
  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg',
      url: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
      color: 'bg-green-100 hover:bg-green-200',
    },
    {
      name: 'Facebook',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: 'bg-blue-100 hover:bg-blue-200',
    },
    {
      name: 'X (Twitter)',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      color: 'bg-gray-100 hover:bg-gray-200',
    },
    {
      name: 'LinkedIn',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      color: 'bg-blue-50 hover:bg-blue-100',
    },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Styles
  const modalBg = isDarkMode
    ? 'bg-[#1e1e1e] border-gray-700'
    : 'bg-white border-gray-200';
  const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
  const subText = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-sm rounded-2xl shadow-2xl border p-6 relative ${modalBg} transform transition-all scale-100`}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-lg font-bold ${textColor}`}>Share this post</h3>
          <button
            onClick={onClose}
            className={`p-1 rounded-full transition-colors ${subText} ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Social Grid */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {shareLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 group"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${link.color}`}
              >
                <img src={link.icon} alt={link.name} className="w-6 h-6" />
              </div>
              <span className={`text-xs font-medium ${subText}`}>
                {link.name}
              </span>
            </a>
          ))}
        </div>

        {/* Copy Link Section */}
        <div
          className={`flex items-center gap-2 p-2 rounded-lg border ${isDarkMode ? 'bg-[#2d2d2d] border-gray-600' : 'bg-gray-50 border-gray-200'}`}
        >
          <input
            type="text"
            readOnly
            value={url}
            className={`flex-1 bg-transparent text-sm outline-none px-2 truncate ${subText}`}
          />
          <button
            onClick={handleCopy}
            className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-[#f97316] text-white hover:bg-orange-600'
            }`}
          >
            {copied ? (
              <>
                <Check size={14} /> Copied
              </>
            ) : (
              <>
                <Copy size={14} /> Copy
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
