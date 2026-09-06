import React, { useEffect } from 'react';
import { ExternalLink, Play, Video } from 'lucide-react';

interface VideoEmbedProps {
  url: string;
  title?: string;
  className?: string;
}

/**
 * Extracts YouTube video ID from various YouTube URL formats
 */

function getYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

/**
 * Extracts TikTok video ID from TikTok URL formats
 */
function getTikTokId(url: string): string | null {
  const regExp = /\/video\/(\d+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

export const VideoEmbed: React.FC<VideoEmbedProps> = ({ url, title = 'Video Embed', className = '' }) => {
  const youtubeId = getYouTubeId(url);
  const tiktokId = getTikTokId(url);

  useEffect(() => {
    if (tiktokId) {
      const scriptId = 'tiktok-embed-script';
      let script = document.getElementById(scriptId) as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://www.tiktok.com/embed.js';
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, [tiktokId, url]);

  if (!url) return null;

  // YouTube Embed
  if (youtubeId) {
    return (
      <div className={`relative w-full overflow-hidden rounded-xl bg-black border border-gold-500/20 shadow-lg ${className}`}>
        <div className="relative w-full pt-[56.25%]">
          <iframe
            className="absolute top-0 left-0 w-full h-full rounded-xl border-0"
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  // TikTok Embed
  if (tiktokId || url.includes('tiktok.com')) {
    return (
      <div className={`relative w-full flex flex-col items-center justify-center p-4 bg-slate-900/60 border border-gold-500/20 rounded-xl ${className}`}>
        <blockquote
          className="tiktok-embed w-full max-w-[325px]"
          cite={url}
          data-video-id={tiktokId || ''}
          style={{ maxWidth: '325px', minWidth: '280px' }}
        >
          <section>
            <a target="_blank" rel="noopener noreferrer" href={url} className="text-gold-400 hover:underline text-sm font-medium flex items-center gap-1.5 justify-center py-4">
              <Play className="w-4 h-4" /> Watch Video on TikTok
            </a>
          </section>
        </blockquote>
      </div>
    );
  }

  // Generic Link Fallback
  return (
    <div className={`p-4 bg-slate-900/60 border border-gold-500/20 rounded-xl flex items-center justify-between gap-4 ${className}`}>
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="p-2.5 rounded-lg bg-gold-500/10 text-gold-400 shrink-0">
          <Video className="w-5 h-5" />
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-medium text-slate-200 truncate">{title}</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gold-400/80 hover:text-gold-300 hover:underline truncate block"
          >
            {url}
          </a>
        </div>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1.5 text-xs font-medium text-gold-400 bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/30 rounded-lg flex items-center gap-1.5 shrink-0 transition-colors"
      >
        <span>Open</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  );
};

export default VideoEmbed;
