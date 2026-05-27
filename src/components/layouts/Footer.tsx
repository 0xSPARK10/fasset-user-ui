import { Container } from "@mantine/core";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useVersion } from "@/api/version";

export default function Footer() {
    const { t } = useTranslation();
    const isTestnet = process.env.NETWORK === 'testnet';
    const version = useVersion(isTestnet);

    return (
        <Container
            fluid
            className="flex flex-col md:flex-row justify-between md:items-center px-[25px] py-3 w-full mt-5 bg-[var(--flr-lightest-gray)]"
        >
            <div className="flex flex-wrap items-center pb-4 md:pb-0 md:ml-0 md:mr-5">
                <div className="pr-3 mr-3 text-[12px] font-medium not-italic leading-normal uppercase text-[var(--Neutrals-Gray,#777)]">
                    {t('footer.explore_label')}
                </div>
                <Link
                    href="https://flare.network/products/fassets"
                    target="_blank"
                    className="font-normal text-12 border-r pr-3 mr-3 border-[--flr-border-color]"
                >
                    {t('footer.flare_fasset_label')}
                </Link>
                <Link
                    href="https://dev.flare.network/fassets/overview/"
                    target="_blank"
                    className={`font-normal text-12 ${isTestnet ? 'pr-3 mr-3 border-r border-[--flr-border-color]' : ''}`}
                >
                    {t('footer.developer_hub')}
                </Link>
                {isTestnet &&
                    <div className="inline">
                        <p
                            className="inline font-normal text-12 border-r pr-3 mr-3 border-[--flr-border-color]"
                        >
                            {t('footer.fe_version', { version: process.env.APP_VERSION })}
                        </p>
                        <p
                            className="inline font-normal text-12"
                        >
                            {t('footer.be_version', { version: version.data })}
                        </p>
                    </div>
                }
            </div>
        </Container>
    );
}
