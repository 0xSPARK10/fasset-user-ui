import { useEffect, useState } from "react";

/**
 * XRPL destination tag of the bridge page. Cleared whenever the recipient falls back to the
 * wallet — a tag typed for a custom (e.g. exchange) address means nothing for the user's own wallet.
 */
export function useBridgeDestinationTag(isRecipientOpen: boolean) {
    const [destinationTag, setDestinationTag] = useState<string>("");
    const [isDestinationTagValid, setIsDestinationTagValid] = useState<boolean>(true);
    // Bumped to remount (= clear) the destination tag field
    const [tagFieldKey, setTagFieldKey] = useState<number>(0);

    // `remount`: also clear what the field shows (it is uncontrolled)
    const reset = ({ remount }: { remount: boolean }) => {
        setDestinationTag("");
        setIsDestinationTagValid(true);
        if (remount) setTagFieldKey(key => key + 1);
    };

    useEffect(() => {
        if (!isRecipientOpen) reset({ remount: true });
    }, [isRecipientOpen]);

    return {
        destinationTag,
        isDestinationTagValid,
        tagFieldKey,
        reset,
        onDestinationTagChange: (tag: string, isValid: boolean) => {
            setDestinationTag(tag);
            setIsDestinationTagValid(isValid);
        },
    };
}
