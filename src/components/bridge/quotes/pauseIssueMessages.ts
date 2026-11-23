import { TFunction } from "i18next";
import { Issue } from "@/core/alerts";
import { PauseIssueCode } from "@/core/bridge";
import { FASSET_COIN } from "@/config/coin";

// Pause codes → the texts the app already shows for them (banners)
export function pauseIssueMessage(t: TFunction) {
    return (issue: Issue<PauseIssueCode>): string => {
        switch (issue.code) {
            case "fasset_paused":
                return t("layout.fasset_system_paused_label", { tokens: FASSET_COIN.type });
            case "oft_paused":
                return t("bridge_page.oft_paused_label");
        }
    };
}
