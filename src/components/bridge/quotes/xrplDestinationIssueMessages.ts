import { TFunction } from "i18next";
import { Issue } from "@/core/alerts";
import { XrplDestinationIssueCode } from "@/core/xrpl";

// XRPL destination codes → texts; the account-flag texts use the flow's own wording
// (`keys` = the redeem_modal or bridge_modal i18n namespace), tag support has one text
export function xrplDestinationIssueMessage(t: TFunction, keys: "redeem_modal" | "bridge_modal") {
    return (issue: Issue<XrplDestinationIssueCode>): string => {
        switch (issue.code) {
            case "deposit_auth":
                return t(`${keys}.limited_deposit_auth_settings_label`);
            case "dest_tag_required":
                return t(`${keys}.limited_destination_tags_settings_label`);
            case "tag_not_supported":
                return t("redeem_modal.form.destination_tag_not_supported_error");
        }
    };
}
