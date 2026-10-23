import { IAlertMessage } from "@/components/elements/FormAlert";
import { useState, useCallback } from "react";

export function useFormAlerts<C extends string>() {
    const [alerts, setAlerts] = useState<Partial<Record<C, IAlertMessage>>>({})

    const set = useCallback((channel: C, alert: IAlertMessage) => {
        setAlerts(prev => ({ ...prev, [channel]: alert }))
    }, [])

    const get = ((channel: C) => alerts[channel]);

    const clear = useCallback((channel: C) => {
        setAlerts(prev => {
            if (!(channel in prev)) return prev;
            const next = { ...prev };
            delete next[channel];
            return next;
        })
    }, [])

    const clearAll = useCallback(() => setAlerts({}), [])

    const setOrClear = useCallback((channel: C, msg: string | undefined | null, type: IAlertMessage["type"] = "error") => {
        msg ? set(channel, { msg, type }) : clear(channel);
    }, [clear, set])

    return { alerts, set, get, clearAll, clear, setOrClear }
}
