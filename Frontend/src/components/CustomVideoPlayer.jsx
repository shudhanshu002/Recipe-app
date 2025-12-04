import React, { useRef, useEffect, useState } from 'react';
import Plyr from 'plyr-react';
import 'plyr-react/plyr.css';
import Hls from 'hls.js';
import useThemeStore from '../store/useThemeStore';

const CustomVideoPlayer = ({ src, poster, captions = [] }) => {
    const { isDarkMode } = useThemeStore();
    const ref = useRef(null);

    // Plyr Options
    // We explicitly enable 'quality' and 'captions' in settings
    const plyrOptions = {
        controls: ['play-large', 'restart', 'rewind', 'play', 'fast-forward', 'progress', 'current-time', 'duration', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'],
        settings: ['captions', 'quality', 'speed', 'loop'],
        speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
        // Default quality config (will be overwritten by HLS)
        quality: { default: 576, options: [4320, 2880, 2160, 1440, 1080, 720, 576, 480, 360, 240] },
        keyboard: { focused: true, global: true },
        tooltips: { controls: true, seek: true },
    };

    useEffect(() => {
        const loadVideo = async () => {
            const video = document.querySelector('.plyr__video-wrapper video');
            if (!video || !src) return;

            // 1. Convert Cloudinary MP4 to HLS (m3u8) for streaming & quality support
            // This tells Cloudinary to generate adaptive bitrates
            const hlsUrl = src.includes('cloudinary') && src.endsWith('.mp4') ? src.replace('.mp4', '.m3u8') : src;

            const player = ref.current?.plyr;

            // 2. Initialize HLS if supported (Chrome, Firefox, Edge)
            if (Hls.isSupported() && (hlsUrl.endsWith('.m3u8') || src.includes('m3u8'))) {
                const hls = new Hls({
                    maxMaxBufferLength: 30, // 30s buffer
                });

                hls.loadSource(hlsUrl);
                hls.attachMedia(video);

                hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
                    // Extract available quality levels from HLS manifest
                    const availableQualities = hls.levels.map((l) => l.height);

                    // Add 'Auto' option (represented by 0 or undefined usually, but Plyr likes explicit numbers)
                    // We simply reverse to have highest first
                    availableQualities.reverse();

                    if (player) {
                        // Update Plyr settings to match HLS levels
                        player.config.quality = {
                            default: availableQualities[0],
                            options: availableQualities,
                            forced: true,
                            onChange: (newQuality) => {
                                // Map Plyr selection back to HLS level index
                                hls.levels.forEach((level, levelIndex) => {
                                    if (level.height === newQuality) {
                                        hls.currentLevel = levelIndex;
                                    }
                                });
                            },
                        };
                        // Force menu update if needed (often automatic in Plyr-React)
                    }
                });
            }
            // 3. Native HLS (Safari)
            else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = hlsUrl;
            }
            // 4. Fallback (Standard MP4)
            else {
                video.src = src;
            }
        };

        loadVideo();
    }, [src]);

    // Define Source
    // Note: If no captions are passed, the menu item hides automatically.
    // You can pass dummy captions to test: [{ kind: 'captions', label: 'English', srclang: 'en', src: '/path/to/vtt', default: true }]
    const source = {
        type: 'video',
        sources: [
            {
                src: src, // HLS logic inside useEffect overrides this for playback, but Plyr needs a base src
                type: 'video/mp4',
            },
        ],
        poster: poster,
        tracks: captions, // ✅ Pass VTT tracks here
    };

    return (
        // ✅ aspect-video prevents layout shift (jumping)
        <div className="w-full rounded-xl overflow-hidden shadow-lg relative z-0 group bg-black aspect-video">
            <div className={`plyr-wrapper w-full h-full ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
                <Plyr ref={ref} options={plyrOptions} source={source} />
            </div>

            {/* Custom Theme Styling */}
            <style>{`
                :root {
                    --plyr-color-main: #ff642f;
                    --plyr-video-background: #000;
                    --plyr-menu-background: ${isDarkMode ? '#1e1e1e' : '#ffffff'};
                    --plyr-menu-color: ${isDarkMode ? '#ffffff' : '#333333'};
                    --plyr-menu-shadow: 0 0px 15px rgba(0,0,0,0.2);
                    --plyr-font-family: 'Inter', sans-serif;
                }

                .plyr {
                    height: 100%;
                    width: 100%;
                }
                
                .plyr--full-ui.plyr--video .plyr__control--overlaid {
                    background: rgba(255, 100, 47, 0.9);
                    transition: transform 0.2s ease;
                }
                .plyr--full-ui.plyr--video .plyr__control--overlaid:hover {
                    background: #e55a2b;
                    transform: scale(1.1);
                }

                .plyr--video .plyr__controls .plyr__control:hover {
                    background: #ff642f;
                }
                
                .plyr__control input[type='range'] {
                    color: #ff642f;
                }

                .plyr__menu__container .plyr__control[role='menuitemradio'][aria-checked='true']::before {
                    background: #ff642f;
                }
                
                .plyr__control:focus-visible {
                    outline: 2px solid #ff642f;
                    outline-offset: 2px;
                }
            `}</style>
        </div>
    );
};

export default CustomVideoPlayer;
