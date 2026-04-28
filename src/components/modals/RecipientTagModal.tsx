import React, { useState, useEffect, useRef } from "react";
import {
    Anchor,
    Button,
    Divider,
    Group,
    Stepper,
    Text,
    TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { yupResolver } from "mantine-form-yup-resolver";
import * as yup from "yup";
import { isAddress, isError } from "ethers";
import { useTranslation } from "react-i18next";
import FAssetModal from "@/components/modals/FAssetModal";
import ModalConfirmStep from "@/components/elements/ModalConfirmStep";
import ModalSuccessStep from "@/components/elements/ModalSuccessStep";
import FormAlert from "@/components/elements/FormAlert";
import { ITagsByAddress } from "@/types";
import { useWeb3 } from "@/hooks/useWeb3";
import { useSetMintingRecipient } from "@/hooks/useContracts";
import { WALLET } from "@/constants";
import LedgerConfirmTransactionCard from "@/components/cards/LedgerConfirmTransactionCard";
import PasteClipboard from "../elements/PasteClipboard";

interface IRecipientTagModal {
    opened: boolean;
    tag: ITagsByAddress | null;
    onClose: () => void;
    onSuccess: () => void;
}

const STEP_FORM = 0;
const STEP_CONFIRM = 1;
const STEP_SUCCESS = 2;

export default function RecipientTagModal({ opened, tag, onClose, onSuccess }: IRecipientTagModal) {
    const [currentStep, setCurrentStep] = useState(STEP_FORM);
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
    const { t } = useTranslation();
    const { mainToken, displayWalletName } = useWeb3();
    const setMintingRecipient = useSetMintingRecipient();
    const isRequestActive = useRef<boolean>(false);

    const schema = yup.object().shape({
        mintingRecipient: yup
            .string()
            .required(t('validation.messages.required', { field: t('edit_tag_modal.minting_recipient_label') }))
            .test(
                'is-valid-address',
                t('validation.messages.invalid_address', { field: t('edit_tag_modal.minting_recipient_label') }),
                (val) => isAddress(val ?? "")
            ),
    });

    const form = useForm({
        mode: 'controlled',
        initialValues: {
            mintingRecipient: tag?.mintingRecipient ?? "",
        },
        validate: yupResolver(schema),
    });

    useEffect(() => {
        if (!opened) {
            setCurrentStep(STEP_FORM);
            setErrorMessage(undefined);
        }
    }, [opened]);

    useEffect(() => {
        if (tag) {
            form.setValues({
                mintingRecipient: tag.mintingRecipient ?? "",
            });
        }
    }, [tag]);

    const handleSaveButton = () => {
        if (isRequestActive.current || !tag) return;
        const result = form.validate();
        if (result.hasErrors) return;

        setErrorMessage(undefined);

        if (mainToken?.connectedWallet === WALLET.LEDGER) {
            setCurrentStep(STEP_CONFIRM);
        } else {
            editTagRequest();
        }
    };

    const editTagRequest = async () => {
        if (isRequestActive.current || !tag) return;
        const result = form.validate();
        if (result.hasErrors) return;

        setErrorMessage(undefined);
        isRequestActive.current = true;
        setCurrentStep(STEP_CONFIRM);
        try {
            await setMintingRecipient.mutateAsync({
                tagId: Number(tag.tagId),
                mintingRecipient: form.getValues().mintingRecipient,
            });
            setCurrentStep(STEP_SUCCESS);
        } catch (error: any) {
            if (isError(error, "ACTION_REJECTED")) {
                setErrorMessage(t("notifications.request_rejected_by_user_label"));
            } else {
                setErrorMessage(error?.message ?? t("edit_tag_modal.error_label"));
            }
            setCurrentStep(STEP_FORM);
        } finally {
            isRequestActive.current = false;
        }
    };

    const handleDone = () => {
        onSuccess();
        onClose();
    };
    return (
        <FAssetModal
            opened={opened}
            onClose={onClose}
            centered
            size="lg"
            title={t('edit_tag_modal.title', { tagId: tag?.tagId })}
        >
            <FAssetModal.Body>
                <FormAlert message={errorMessage} />
                <Stepper
                    active={currentStep}
                    size="xs"
                    classNames={{ content: 'pt-0', separator: 'hidden' }}
                >
                    {/* Step 0: FORM */}
                    <Stepper.Step withIcon={false}>
                        <Text
                            className="text-12"
                            fw={400}
                            c="var(--flr-gray)"
                            mb="xs"
                            style={{ letterSpacing: '0.05em' }}
                        >
                            {t('edit_tag_modal.minting_recipient_label').toUpperCase()}
                        </Text>
                        <Group gap="xl" align="flex-start" mb={2}>
                            <TextInput
                                style={{ flex: 1, maxWidth: 400 }}
                                placeholder={t('edit_tag_modal.minting_recipient_placeholder')}
                                rightSection={
                                   <PasteClipboard onPaste={(text) => form.setFieldValue("mintingRecipient",text)} />
                                }
                                {...form.getInputProps('mintingRecipient')}
                            />
                            <Anchor
                                className="text-12 whitespace-nowrap pt-[9px]"
                                c="var(--flr-black)"
                                fw={500}
                                underline="always"
                                onClick={() => form.setFieldValue('mintingRecipient', mainToken?.address ?? "")}
                            >
                                {t('edit_tag_modal.use_my_address_button')}
                            </Anchor>
                        </Group>
                        <Text className="text-12 mb-4" mt={"6"} fw={400} c="var(--flr-gray)">
                            {t('edit_tag_modal.minting_recipient_hint')}
                        </Text>
                    </Stepper.Step>

                    {/* Step 1: CONFIRM */}
                    <Stepper.Step withIcon={false}>
                        <ModalConfirmStep
                            title={t('edit_tag_modal.confirm_title')}
                            stepLabel={t('edit_tag_modal.confirm_step_label')}
                            stepDescription={t('edit_tag_modal.confirm_step_description')}
                            walletInfoLabel={t('edit_tag_modal.wallet_info_label', { wallet: displayWalletName })}
                            isPending={setMintingRecipient.isPending}
                            isSuccess={setMintingRecipient.isSuccess}
                        />
                        {currentStep === STEP_CONFIRM && mainToken?.connectedWallet === WALLET.LEDGER &&
                            <>
                                <Divider
                                    className="my-8"
                                    classNames={{ root: 'mx-[-1rem] sm:mx-[-2.7rem]' }}
                                />
                                <LedgerConfirmTransactionCard
                                    appName={mainToken?.network?.ledgerApp!}
                                    onClick={() => editTagRequest()}
                                    isLoading={setMintingRecipient.isPending}
                                    isDisabled={setMintingRecipient.isPending || setMintingRecipient.isSuccess}
                                />
                            </>
                        }
                    </Stepper.Step>

                    {/* Step 2: SUCCESS */}
                    <Stepper.Step withIcon={false}>
                        <ModalSuccessStep
                            title={t('edit_tag_modal.success_title', { tagId: tag?.tagId })}
                            description={t('edit_tag_modal.success_description')}
                        />
                    </Stepper.Step>
                </Stepper>
            </FAssetModal.Body>

            {currentStep === STEP_FORM && (
                <FAssetModal.Footer>
                    <Button
                        onClick={handleSaveButton}
                        variant="filled"
                        color="var(--mantine-color-black)"
                        radius="xl"
                        size="sm"
                        fullWidth
                        className="hover:text-white"
                    >
                        {t('edit_tag_modal.save_button')}
                    </Button>
                </FAssetModal.Footer>
            )}

            {currentStep === STEP_SUCCESS && (
                <FAssetModal.Footer>
                    <Button
                        onClick={handleDone}
                        variant="filled"
                        color="var(--mantine-color-black)"
                        radius="xl"
                        size="sm"
                        fullWidth
                        className="hover:text-white"
                    >
                        {t('edit_tag_modal.done_button')}
                    </Button>
                </FAssetModal.Footer>
            )}
        </FAssetModal>
    );
}
