import { Issue } from "@/core/alerts";

export type XrplDestinationIssueCode = "deposit_auth" | "dest_tag_required" | "tag_not_supported";

export interface IXrplDestinationInput {
    // Account flags of the destination; undefined = unknown (no address, loading, disabled)
    flags?: { depositAuth?: boolean; requireDestTag?: boolean };
    // "" = no tag; "0" is a tag
    tag: string;
    // AssetManager redeemWithTagSupported(); undefined = unknown
    tagSupported?: boolean;
    tagSupportLoading: boolean;
}

/**
 * XRPL destination checks (as in RedeemModal), in priority order:
 * depositAuth → requireDestTag without a tag → tag entered but not supported by the
 * AssetManager. Tag support fails closed (unknown blocks), but its message waits until the
 * answer is in — otherwise it flashes while the AssetManager query loads.
 */
export function evaluateXrplDestination({ flags, tag, tagSupported, tagSupportLoading }: IXrplDestinationInput): {
    issues: Issue<XrplDestinationIssueCode>[];
    isBlocked: boolean;
} {
    const hasTag = tag.trim() !== "";
    const tagSupportUnknown = hasTag && !tagSupported;

    const issues: Array<Issue<XrplDestinationIssueCode> | false> = [
        !!flags?.depositAuth && { code: "deposit_auth", severity: "error", blocking: true },
        !!flags?.requireDestTag && !hasTag && { code: "dest_tag_required", severity: "error", blocking: true },
        tagSupportUnknown && !tagSupportLoading && { code: "tag_not_supported", severity: "error", blocking: true },
    ];
    const visible = issues.filter((issue): issue is Issue<XrplDestinationIssueCode> => !!issue);

    return { issues: visible, isBlocked: visible.length > 0 || tagSupportUnknown };
}
