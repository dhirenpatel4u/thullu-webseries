export const initializeCast = () => {
    window.__onGCastApiAvailable = (available) => {
        if (!available) return;

        cast.framework.CastContext.getInstance().setOptions({
            receiverApplicationId:
                chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
            autoJoinPolicy:
                chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
        });
    };
};
