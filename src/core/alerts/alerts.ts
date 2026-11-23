import type { IAlertMessage } from "@/core/alerts/types";


export function resolveAlert(candidates: Array<IAlertMessage | undefined | null | false>) : IAlertMessage | undefined {
    return candidates.find((c): c is IAlertMessage => !!c && !!c.msg)
}
