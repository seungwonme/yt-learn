"use client";

import YouTube, { YouTubeProps, YouTubePlayer } from "react-youtube";

interface VideoPlayerProps {
  videoId: string;
  onReady?: (player: YouTubePlayer) => void;
  onTimeUpdate?: (currentTime: number) => void;
}

export function VideoPlayer({
  videoId,
  onReady,
  onTimeUpdate,
}: VideoPlayerProps) {

  const opts: YouTubeProps["opts"] = {
    width: "100%",
    height: "100%",
    playerVars: {
      autoplay: 0,
      modestbranding: 1,
      rel: 0,
    },
  };

  const handleReady: YouTubeProps["onReady"] = (event) => {
    const ytPlayer = event.target;
    onReady?.(ytPlayer);

    // 시간 업데이트 추적
    if (onTimeUpdate) {
      const interval = setInterval(() => {
        if (ytPlayer && ytPlayer.getCurrentTime) {
          const currentTime = ytPlayer.getCurrentTime();
          onTimeUpdate(currentTime);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  };

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
      <YouTube
        videoId={videoId}
        opts={opts}
        onReady={handleReady}
        className="absolute inset-0"
        iframeClassName="w-full h-full"
      />
    </div>
  );
}
