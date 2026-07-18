import { useRef, useEffect, useState } from "react";
import { saveRecentlyPlayed, getRecentlyPlayed } from "../utils/recentlyPlayed";

const placeholderTitle = (title) => {
  const words = title.trim().split(/\s+/);

  if (words.length < 4) {
    return encodeURIComponent(title);
  }

  const middle = Math.ceil(words.length / 2);

  return encodeURIComponent(
    words.slice(0, middle).join(" ") +
      "\n" +
      words.slice(middle).join(" ")
  );
};

export default function VideoPlayer({
  episode,
  showId,
  showTitle,
  episodeIndex
}) {

  const videoRef = useRef();
  const [poster, setPoster] = useState("");

  // Check poster image
  useEffect(() => {
    if (!episode) return;

    const img = new Image();

    img.onload = () => {
      setPoster(episode.poster);
    };

    img.onerror = () => {
      setPoster(
        `https://placehold.co/600x400/D3D3D3/red?font=lora&text=${placeholderTitle(showTitle)}`
      );
    };

    img.src = episode.poster;
  }, [episode, showTitle]);

  // Resume playback
  useEffect(() => {

    const video = videoRef.current;

    video.load();

    const history = getRecentlyPlayed();

    const item = history.find(
      x =>
        x.id === showId &&
        x.episodeIndex === episodeIndex
    );

    const playVideo = () => {

      if (item) {
        video.currentTime = item.time;
      }

      video.play().catch(() => {});

    };

    video.addEventListener("loadedmetadata", playVideo);

    return () => {
      video.removeEventListener("loadedmetadata", playVideo);
    };

  }, [episode, showId, episodeIndex]);

  // Save every 5 seconds
  const handleTimeUpdate = () => {

    const video = videoRef.current;

    if (Math.floor(video.currentTime) % 5 !== 0) return;

    saveRecentlyPlayed({
      id: showId,
      title: showTitle,
      poster: episode.poster,
      episodeIndex,
      episodeTitle: episode.episode,
      time: video.currentTime
    });

  };

useEffect(() => {
    if (!episode) return;

    const attachListener = () => {
        if (
            !window.cast ||
            !window.cast.framework
        ) {
            return false;
        }

        const context =
            window.cast.framework.CastContext.getInstance();

        const handleCast = async (event) => {

            console.log(
                "Session State:",
                event.sessionState
            );

              // Chromecast disconnected
            if (
                event.sessionState ===
                window.cast.framework
                    .SessionState
                    .SESSION_ENDED
            ) {
                videoRef.current?.play();
                return;
            }

            // Handle both first connection and reconnects
            if (
                event.sessionState !==
                    window.cast.framework.SessionState
                        .SESSION_STARTED &&
                event.sessionState !==
                    window.cast.framework.SessionState
                        .SESSION_RESUMED
            ) {
                return;
            }

            const session =
                context.getCurrentSession();

            if (!session) return;

            const mediaInfo =
                new window.chrome.cast.media.MediaInfo(
                    episode.url,
                    "video/mp4"
                );

            mediaInfo.metadata =
                new window.chrome.cast.media.GenericMediaMetadata();

            mediaInfo.metadata.title =
                episode.episode;

            mediaInfo.metadata.images = [
                { url: poster }
            ];

            const currentTime =
                videoRef.current?.currentTime || 0;

            const request =
                new window.chrome.cast.media.LoadRequest(
                    mediaInfo
                );

            request.autoplay = true;
            request.currentTime = currentTime;

            try {

                // Stop previous video if one exists
                const media =
                    session.getMediaSession();

                if (media) {
                    await media.stop();

                    // Give Chromecast time
                    await new Promise(
                        resolve =>
                            setTimeout(
                                resolve,
                                1000
                            )
                    );
                }

                console.log(
                    "Casting:",
                    episode.episode
                );

                await session.loadMedia(
                    request
                );

                videoRef.current?.pause();

                console.log(
                    "Cast success"
                );

            } catch (e) {

                console.error(
                    "Cast failed:",
                    e
                );

            }
        };

        context.addEventListener(
            window.cast.framework.CastContextEventType
                .SESSION_STATE_CHANGED,
            handleCast
        );

        return () => {
            context.removeEventListener(
                window.cast.framework.CastContextEventType
                    .SESSION_STATE_CHANGED,
                handleCast
            );
        };
    };

    // SDK already loaded
    if (attachListener()) {
        return;
    }

    // Wait for SDK
    const interval = setInterval(() => {
        if (attachListener()) {
            clearInterval(interval);
        }
    }, 500);

    return () => clearInterval(interval);

}, [episode, poster]);

const [castReady, setCastReady] = useState(false);

useEffect(() => {
    const interval = setInterval(() => {
        if (
            window.cast &&
            window.cast.framework
        ) {
            setCastReady(true);
            clearInterval(interval);
        }
    }, 500);

    return () => clearInterval(interval);
}, []);
  

  return (
    <div className="relative">
      <video
        ref={videoRef}
        src={episode.url}
        poster={poster}
        controls
        controlsList="nodownload"
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        className="
          w-full
          rounded-xl
          bg-black
        "
      />

      {castReady && (
          <div className="absolute top-3 right-3 z-10">
              <google-cast-launcher />
          </div>
      )}
    </div>
  );
}
