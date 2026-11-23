// Alert shape shared by the rules in core/ and FormAlert (which re-exports it)
export type AlertType = "error" | "warning" | "info";

export interface IAlertMessage {
    msg: string;
    type?: AlertType;
}
