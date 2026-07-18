export const initializeCast = () => {
    window.__onGCastApiAvailable = function (available) {
        if (!available) return;

        cast.framework.CastContext.getInstance().setOptions({
            receiverApplicationId:
                chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
            autoJoinPolicy:
                chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
        });
    };
};

export const castVideo = (url, title, poster) => {
    const session =
        cast.framework.CastContext.getInstance().getCurrentSession();

    if (!session) {
        alert("Please connect to Chromecast first.");
        return;
    }

    const mediaInfo =
        new chrome.cast.media.MediaInfo(
            url,
            "video/mp4"
        );

    mediaInfo.metadata =
        new chrome.cast.media.GenericMediaMetadata();

    mediaInfo.metadata.title = title;

    mediaInfo.metadata.images = [
        { url: poster }
    ];

    const request =
        new chrome.cast.media.LoadRequest(
            mediaInfo
        );

    session.loadMedia(request);
};
