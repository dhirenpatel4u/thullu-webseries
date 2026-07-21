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
    episodeIndex,
    episodes,
    onEpisodeSelect
}) {

  const videoRef = useRef();
  const localPositionRef = useRef(0);
  const castPositionRef = useRef(0);
  const previousEpisode = useRef("");
  
  const [poster, setPoster] = useState("");
  const [isCasting, setIsCasting] = useState(false);
  const [castTime, setCastTime] = useState(0);
  const [castDuration, setCastDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [showUI, setShowUI] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const hideTimer = useRef();

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

    const video = videoRef.current;

    if (!video) return;

    const start = () =>
        setIsBuffering(true);

    const stop = () =>
        setIsBuffering(false);

    video.addEventListener(
        "waiting",
        start
    );

    video.addEventListener(
        "stalled",
        start
    );

    video.addEventListener(
        "playing",
        stop
    );

    video.addEventListener(
        "canplay",
        stop
    );

    return () => {

        video.removeEventListener(
            "waiting",
            start
        );

        video.removeEventListener(
            "stalled",
            start
        );

        video.removeEventListener(
            "playing",
            stop
        );

        video.removeEventListener(
            "canplay",
            stop
        );

    };

}, [episode]);

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

useEffect(() => {

    const handle =
        (e) => {

            if (
                !videoRef.current ||
                isCasting
            ) {
                return;
            }

            if (
                e.key ===
                "ArrowLeft"
            ) {

                videoRef.current
                    .currentTime -= 10;
            }

            if (
                e.key ===
                "ArrowRight"
            ) {

                videoRef.current
                    .currentTime += 10;
            }
        };

    window.addEventListener(
        "keydown",
        handle
    );

    return () => {

        window.removeEventListener(
            "keydown",
            handle
        );

    };

}, [isCasting]);

useEffect(() => {

    const video =
        videoRef.current;

    if (!video) return;

const update = () => {
    setCurrentTime(video.currentTime);
    setDuration(video.duration || 0);

    if (video.buffered.length > 0) {
        setBuffered(
            (
                video.buffered.end(
                    video.buffered.length - 1
                ) /
                video.duration
            ) * 100
        );
    }
};

    video.addEventListener(
        "timeupdate",
        update
    );

    return () => {

        video.removeEventListener(
            "timeupdate",
            update
        );
    };

}, [episode]);

const toggleFullscreen = () => {

    const container =
        videoRef.current?.parentElement;

    if (
        !document.fullscreenElement
    ) {

        container?.requestFullscreen();

        setIsFullscreen(true);

    } else {

        document.exitFullscreen();

        setIsFullscreen(false);

    }
};

const togglePlay = () => {

    const video = videoRef.current;

    if (!video) return;

    if (video.paused) {
        video.play();
    } else {
        video.pause();
    }

    showControls();
};

const showControls = () => {

    setShowUI(true);

    clearTimeout(
        hideTimer.current
    );

hideTimer.current =
    setTimeout(() => {

        if (
            !videoRef.current?.paused
        ) {
            setShowUI(false);
        }

    },3000);
};

  
  return (
    <div className="relative">

      
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

{
    isBuffering &&
    !isCasting && (

        <div
            className="
                absolute
                inset-0
                z-50
                flex
                items-center
                justify-center
                pointer-events-none
            "
        >

            <div
                className="
                    w-10
                    h-10
                    border-4
                    border-white/20
                    border-t-white
                    rounded-full
                    animate-spin
                "
            />

        </div>

    )
}

    {
        isCasting ? (

            <img
                src={poster}
                className="
                    w-full
                    h-full
                    object-cover
                    opacity-40
                "
            />

        ) : (

            <video
                ref={videoRef}
                src={episode.url}
                poster={poster}
                controls={false}
                onMouseMove={showControls}
                onClick={togglePlay}
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
                    h-full
                    object-cover
                "
            />

        )
    }

    {
        showUI && (

            <div
                className="
                    absolute
                    inset-0
                    z-10
                    flex
                    flex-col
                    justify-between
                    bg-gradient-to-t
                    from-black/90
                    via-transparent
                    to-black/70
                "
            >

                {/* TOP */}

                <div
                    className="
                        flex
                        justify-between
                        p-5
                    "
                >
                    <div>

                        <h2 className="text-xl font-bold">
                            {showTitle}
                        </h2>

                        <p>
                            {episode.episode}
                        </p>

                    </div>

                </div>


                {/* CENTER */}

                <div
                    className="
                        flex
                        justify-center
                        items-center
                    "
                >

                    {
                        isCasting ? (

                            <div
                                className="
                                    text-center
                                "
                            >
                                <h2 className="text-3xl">
                                    Casting to TV
                                </h2>

                                <p>
                                    {
                                        formatTime(
                                            castTime
                                        )
                                    }

                                    {" • "}

                                    {
                                        formatTime(
                                            castDuration
                                        )
                                    }
                                </p>

                            </div>

                        ) : (

                            <button
                                onClick={
                                    togglePlay
                                }
                                className="
                                    text-4xl
                                    bg-black/60
                                    backdrop-blur-md
                                    w-16
                                    h-16
                                    md:w-20
                                    md:h-20
                                    rounded-full
                                    flex
                                    items-center
                                    justify-center
                                    transition
                                  hover:scale-110
                                "
                            >
                                {
                                    videoRef.current
                                        ?.paused
                                        ? "▶"
                                        : "❚❚"
                                }
                            </button>

                        )
                    }

                </div>


                {/* BOTTOM */}

                <div className="px-4 pb-4 pt-2 md:p-5 safe-bottom">

<div className="relative w-full h-2">

    {/* Buffer */}
    <div
        className="
            absolute
            inset-0
            bg-white/20
            rounded-full
        "
    />

    <div
        className="
            absolute
            left-0
            top-0
            h-2
            bg-white/40
            rounded-full
        "
        style={{
            width: `${buffered}%`
        }}
    />

    {/* Played */}
    <div
        className="
            absolute
            left-0
            top-0
            h-2
            bg-red-600
            rounded-full
        "
        style={{
            width: `${
                (
                    (
                        isCasting
                            ? castTime
                            : currentTime
                    ) /
                    (
                        isCasting
                            ? castDuration
                            : duration
                    )
                ) * 100
            }%`
        }}
    />

    <input
        type="range"
        min="0"
        max={
            isCasting
                ? castDuration
                : duration
        }
        value={
            isCasting
                ? castTime
                : currentTime
        }
        onChange={...}
        className="
            absolute
            inset-0
            opacity-0
            cursor-pointer
            w-full
        "
    />

</div>

                    <div
                        className="
                            flex
                            justify-between
                            text-sm
                            mt-2
                        "
                    >

                        <span>

                            {
                                formatTime(
                                    isCasting
                                        ? castTime
                                        : currentTime
                                )
                            }

                        </span>

                        <span>

                            {
                                formatTime(
                                    isCasting
                                        ? castDuration
                                        : duration
                                )
                            }

                        </span>

                    </div>

                </div>

            </div>

        )
    }

</div>
      
<div className="absolute top-3 right-3 z-20 flex gap-2">

    <button
        onClick={() =>
            setShowEpisodes(
                !showEpisodes
            )
        }
        className="
            bg-black/60
            px-3
            py-2
            rounded-lg
        "
    >
        Episodes
    </button>

    <button
        onClick={toggleFullscreen}
        className="
            bg-black/60
            px-3
            py-2
            rounded-lg
        "
    >
        ⛶
    </button>

    {
        castReady &&
        <google-cast-launcher />
    }

</div>

{
    showEpisodes && (

        <div
            className="
                absolute
                top-0
                right-0
                h-full
                w-80
                bg-black/70
                backdrop-blur-md
                overflow-y-auto
                z-50
            "
        >

            <h2 className="p-4">
                Episodes
            </h2>

            {
                episodes?.map(
                    (
                        ep,
                        index
                    ) => (

                        <button
                            key={index}
                            className={`
                                block
                                w-full
                                p-4
                                text-left
                                hover:bg-white/10
                                ${
                                    index ===
                                    episodeIndex
                                        ? "bg-white/10"
                                        : ""
                                }
                            `}
                            onClick={() => {

                                onEpisodeSelect(
                                    ep,
                                    index
                                );

                                setShowEpisodes(
                                    false
                                );
                            }}
                        >
                            {ep.episode}
                        </button>

                    )
                )
            }

        </div>
    )
}
      
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
