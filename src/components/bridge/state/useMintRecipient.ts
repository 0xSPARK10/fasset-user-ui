import { useEffect } from "react";
import { useForm } from "@mantine/form";
import { yupResolver } from "mantine-form-yup-resolver";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { useWeb3 } from "@/hooks/useWeb3";
import { useUserTags } from "@/api/tags";
import { FASSET_COIN } from "@/config/coin";
import { isValidEvmAddress } from "@/utils/guards";

import type { IMintRecipientValues } from "@/core/bridge/types";
export type { IMintRecipientValues } from "@/core/bridge/types";

/**
 * Mint destination of the bridge page — the address part of the MintForm destination logic
 * (MintForm:141-301): a Flare address, with the wallet's own minting tag auto-filled for the
 * wallet's address. The bridge page has no minting-tag input. The values are exactly what
 * mint/ConfirmStepper reads (also for /mint), so the tag-mode fields stay at their defaults.
 */
export function useMintRecipient(enabled: boolean) {
    const { t } = useTranslation();
    const { mainToken } = useWeb3();
    const addressForTagLookup = mainToken?.address ?? "";

    // MintForm:121-136
    const schema = yup.object().shape({
        destinationAddress: yup.string()
            .required(t("validation.messages.required", { field: t("mint_modal.form.destination_address_label") }))
            .test("is-valid-address", t("validation.messages.invalid_address"), (value) => isValidEvmAddress(value)),
    });

    const form = useForm<IMintRecipientValues>({
        mode: "controlled",
        validate: yupResolver(schema),
        initialValues: {
            destinationMode: "address",
            destinationAddress: addressForTagLookup,
            destinationTag: "",
            resolvedAddress: "",
            addressTag: "",
        },
    });

    const tagsByAddressQuery = useUserTags(
        FASSET_COIN.type,
        addressForTagLookup,
        enabled && addressForTagLookup.length > 0 && isValidEvmAddress(addressForTagLookup),
    );

    const ownTag = () => tagsByAddressQuery.data
        ?.filter(tag => tag.mintingRecipient === addressForTagLookup)?.[0]?.tagId ?? "";

    // The default address follows the connected wallet until the user edits it. Runs before the
    // tag effect below, which reads the address it sets.
    useEffect(() => {
        if (!form.isDirty("destinationAddress")) form.setFieldValue("destinationAddress", addressForTagLookup);
    }, [addressForTagLookup]); // eslint-disable-line react-hooks/exhaustive-deps

    // MintForm:236-240 — the wallet's own tag, only while the field holds the wallet: the payment
    // sends the tag instead of the address, so on a typed address it would mint to the wallet
    useEffect(() => {
        if (!addressForTagLookup) return;
        const isWalletAddress = form.getValues().destinationAddress === addressForTagLookup;
        form.setFieldValue("addressTag", isWalletAddress ? ownTag() : "");
    }, [tagsByAddressQuery.data, addressForTagLookup]); // eslint-disable-line react-hooks/exhaustive-deps

    // MintForm:289-301 — another address is not the user's own, its tag does not apply
    form.watch("destinationAddress", ({ value }) => {
        if (value !== addressForTagLookup) form.setFieldValue("addressTag", "");
    });

    // "Remove" — back to the connected wallet, with its own tag
    const reset = () => {
        form.setValues({ destinationAddress: addressForTagLookup, addressTag: ownTag() });
        form.resetDirty();
        form.clearErrors();
    };

    const values = form.getValues();
    // MintForm:180-204 part 5 + :243-256 (blocked while the address tag is fetched)
    const isValid = isValidEvmAddress(values.destinationAddress) && !tagsByAddressQuery.isFetching;

    return {
        form,
        values,
        isValid,
        recipientAddress: values.destinationAddress,
        isAddressTagLoading: tagsByAddressQuery.isFetching,
        reset,
    };
}
