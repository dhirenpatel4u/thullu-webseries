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
  const localPositionRef = useRef(0);
  const castPositionRef = useRef(0);
  const previousEpisode = useRef("");
  
  const [poster, setPoster] = useState("");
  const [isCasting, setIsCasting] = useState(false);
  const [castTime, setCastTime] = useState(0);
  const [castDuration, setCastDuration] = useState(0);

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

    if (isCasting) {
        return;
    }

    const video = videoRef.current;

    if (!video) {
        return;
    }

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

  }, [episode, showId, episodeIndex, isCasting]);

  // Save every 5 seconds
  const handleTimeUpdate = () => {

    const video = videoRef.current;

    localPositionRef.current =
        video.currentTime;

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

const handleSeek = async () => {

    if (
        !window.cast ||
        !window.cast.framework
    ) {
        return;
    }

    const session =
        window.cast.framework
            .CastContext
            .getInstance()
            .getCurrentSession();

    if (!session) return;

    const media =
        session.getMediaSession();

    if (!media) return;

    const request =
        new window.chrome.cast.media
            .SeekRequest();

    request.currentTime =
        videoRef.current.currentTime;

    request.resumeState =
        window.chrome.cast.media
            .ResumeState.PLAYBACK_START;

    media.seek(request);
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

    setIsCasting(false);

    setTimeout(() => {

        if (!videoRef.current) {
            return;
        }

        console.log(
            "Resume at:",
            castPositionRef.current
        );

        videoRef.current.currentTime =
            castPositionRef.current;

        videoRef.current.play();

    }, 500);

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
                  localPositionRef.current;
          
            const request =
                new window.chrome.cast.media.LoadRequest(
                    mediaInfo
                );

            request.autoplay = true;
          
            console.log(
                "Cast starts at:",
                currentTime
            );
          
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

                await session.loadMedia(request);

                previousEpisode.current =
                    episode.url;

                setIsCasting(true);

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

useEffect(() => {

    if (!isCasting) return;

    const interval = setInterval(() => {

        const session =
            window.cast.framework
                .CastContext
                .getInstance()
                .getCurrentSession();

        const media =
            session?.getMediaSession();

        if (!media) return;

        const time =
            media.getEstimatedTime();

        setCastTime(time);

        castPositionRef.current =
            time;
          // Save every 5 seconds
        if (
            Math.floor(time) % 5 === 0
        ) {
            saveRecentlyPlayed({
                id: showId,
                title: showTitle,
                poster: episode.poster,
                episodeIndex,
                episodeTitle: episode.episode,
                time
            });
        }

        setCastDuration(
            media.media?.duration || 0
        );

    }, 1000);

    return () => clearInterval(interval);

}, [isCasting, showId, showTitle, episode, episodeIndex]);

useEffect(() => {

    if (
        !isCasting ||
        !episode
    ) {
        return;
    }

    // First mount while casting
    if (
        previousEpisode.current === ""
    ) {

        previousEpisode.current =
            episode.url;

    } else if (
        previousEpisode.current ===
        episode.url
    ) {

        return;

    } else {

        previousEpisode.current =
            episode.url;

    }

    console.log(
        "Switching TV to:",
        episode.episode
    );

    const session =
        window.cast.framework
            .CastContext
            .getInstance()
            .getCurrentSession();

    if (!session) {
        return;
    }

    const mediaInfo =
        new window.chrome.cast.media
            .MediaInfo(
                episode.url,
                "video/mp4"
            );

    mediaInfo.metadata =
        new window.chrome.cast.media
            .GenericMediaMetadata();

    mediaInfo.metadata.title =
        episode.episode;

    mediaInfo.metadata.images = [
        { url: poster }
    ];

    const request =
        new window.chrome.cast.media
            .LoadRequest(mediaInfo);

    request.autoplay = true;

    session
        .loadMedia(request)
        .then(() => {

            setCastTime(0);

            console.log(
                "TV updated"
            );

        })
        .catch(console.error);

}, [episode, isCasting]);

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
  
  
useEffect(() => {

    if (
        !window.cast ||
        !window.cast.framework
    ) {
        return;
    }

    const context =
        window.cast.framework
            .CastContext
            .getInstance();

    const updateState = () => {

        const state =
            context.getSessionState();

        setIsCasting(
            state ===
                window.cast.framework
                    .SessionState
                    .SESSION_STARTED ||
            state ===
                window.cast.framework
                    .SessionState
                    .SESSION_RESUMED
        );
    };

    updateState();

    context.addEventListener(
        window.cast.framework
            .CastContextEventType
            .SESSION_STATE_CHANGED,
        updateState
    );

    return () => {

        context.removeEventListener(
            window.cast.framework
                .CastContextEventType
                .SESSION_STATE_CHANGED,
            updateState
        );

    };

}, []);

  
  return (
    <div className="relative">
{
    isCasting ? (

        <div
            className="
                w-full
                aspect-video
                rounded-xl
                overflow-hidden
                bg-black
                relative
            "
        >
            <img
                src={poster}
                className="
                    w-full
                    h-full
                    object-cover
                    opacity-40
                "
            />

            <div
                className="
                    absolute
                    inset-0
                    flex
                    flex-col
                    items-center
                    justify-center
                    gap-3
                "
            >
                <h2 className="text-2xl">
                    Casting to TV
                </h2>

                <p>
                    {episode.episode}
                </p>

                <p className="
                    text-sm
                    bg-black/50
                    px-3
                    py-1
                    rounded-full
                ">
                    {formatTime(castTime)}
                    {" • "}
                    {formatTime(castDuration)}
                </p>

                <input
                    type="range"
                    min="0"
                    max={castDuration}
                    value={castTime}
                    onChange={(e) => {

                        const session =
                            window.cast.framework
                                .CastContext
                                .getInstance()
                                .getCurrentSession();

                        const media =
                            session?.getMediaSession();

                        if (!media) return;

                        const request =
                            new window.chrome
                                .cast.media
                                .SeekRequest();

                        request.currentTime =
                            Number(
                                e.target.value
                            );

                        media.seek(request);
                    }}
                    className="w-3/4"
                />
            </div>
        </div>

    ) : (

        <video
            ref={videoRef}
            src={episode.url}
            poster={poster}
            controls
            controlsList="nodownload"
            preload="metadata"
            onTimeUpdate={handleTimeUpdate}
            onSeeked={() => {
                localPositionRef.current =
                    videoRef.current.currentTime;
                    handleSeek();
            }}
            className="
              w-full
              rounded-xl
              bg-black
            "
        />

    )
}

      {castReady && (
          <div className="absolute top-3 right-3 z-10">
              <google-cast-launcher />
          </div>
      )}
    </div>
  );
}

function formatTime(seconds) {

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    if (h > 0) {
        return `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
    }

    return `${m}:${String(s).padStart(2,"0")}`;
}
