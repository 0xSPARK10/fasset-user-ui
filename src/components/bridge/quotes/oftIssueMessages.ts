import { TFunction } from "i18next";
import { Issue } from "@/core/alerts";
import { OftIssueCode } from "@/core/bridge";
import { FASSET_COIN } from "@/config/coin";
import { formatNumber } from "@/utils";

// OFT rate limit code → bridge page text
export function oftIssueMessage(t: TFunction) {
    return (issue: Issue<OftIssueCode>): string => {
        switch (issue.code) {
            case "oft_limit_exceeded":
                return t("bridge_page.oft_limit_exceeded_label", {
                    max: formatNumber(issue.values?.max ?? 0, 2),
                    fAsset: FASSET_COIN.type,
                });
        }
    };
}
