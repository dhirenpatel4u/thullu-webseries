export const initializeCast = (setReady) => {

    window.__onGCastApiAvailable = (
        available
    ) => {

        if (
            !available ||
            !window.cast ||
            !window.cast.framework ||
            !window.chrome ||
            !window.chrome.cast
        ) {
            return;
        }

        window.cast.framework
            .CastContext
            .getInstance()
            .setOptions({
                receiverApplicationId:
                    window.chrome.cast.media
                        .DEFAULT_MEDIA_RECEIVER_APP_ID,

                autoJoinPolicy:
                    window.chrome.cast
                        .AutoJoinPolicy
                        .ORIGIN_SCOPED
            });

        console.log(
            "Chromecast initialized"
        );

        setReady(true);
    };
};
