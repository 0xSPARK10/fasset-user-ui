import { IAlertMessage } from "@/components/elements/FormAlert";


export function resolveAlert(candidates: Array<IAlertMessage | undefined | null | false>) : IAlertMessage | undefined {
    return candidates.find((c): c is IAlertMessage => !!c && !!c.msg)
}
