import React, { useState } from "react";
import { UseQueryResult } from "@tanstack/react-query";
import { Avatar, Group, lighten, LoadingOverlay, ScrollArea, Text } from "@mantine/core";
import CopyIcon from "@/components/icons/CopyIcon";
import { toNumber, truncateString } from "@/utils";
import { IAgent } from "@/types";
import { useMediaQuery } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import classes from "@/styles/components/forms/MintForm.module.scss";

interface IAgentList {
    agents: UseQueryResult<IAgent[], Error>,
    setAgent: (event: React.MouseEvent<HTMLDivElement>, agent: IAgent) => void;
    lots: number | undefined;
}

export default function AgentsList({ agents, setAgent, lots }: IAgentList) {
    const { t } = useTranslation();
    const isMobile = useMediaQuery('(max-width: 640px)');
    const availableAgents = agents.data?.filter(agent => toNumber(agent.freeLots) >= (lots ?? 0));

    return (
        <ScrollArea
            mah={400}
            scrollbars="y"
            className="relative overflow-y-auto"
        >
            <LoadingOverlay visible={agents.isPending} />
            <div>
                {!agents.isPending && agents.data && agents?.data?.length === 0 &&
                    <Text>{t('mint_modal.form.change_agent_table.no_agents_available_label')}</Text>
                }
                {availableAgents?.map((agent, index) => (
                    <Group
                        onClick={(event) => setAgent(event, agent)}
                        classNames={{
                            root: `py-3 items-baseline cursor-pointer rounded-3xl justify-between ${availableAgents.length > 1 && availableAgents.length - 1 < index ? 'mb-4' : ''} ${classes.agentRow}`
                        }}
                        key={agent.vault}
                        grow
                        wrap="nowrap"
                    >
                        <div className="max-[360px]:w-[50px] w-[70px] md:w-[112px] max-w-none">
                            <Text
                                c="var(--flr-gray)"
                                className="uppercase text-12"
                                truncate="end"
                                fw={400}
                            >
                                {t('mint_modal.form.change_agent_table.agent_name_label')}
                            </Text>
                            <div className="flex items-center">
                                <Avatar
                                    src={agent.url}
                                    radius="xs"
                                    size={isMobile ? 'xs' : 'sm'}
                                    className="mb-1 mr-2"
                                />
                                <Text
                                    className="text-16"
                                    fw={400}
                                    truncate="end"
                                >
                                    {agent.agentName}
                                </Text>
                            </div>
                        </div>
                        <div className="max-[360px]:w-[60px] w-[80px] md:w-[108px] max-w-none">
                            <Text
                                c="var(--flr-gray)"
                                className="uppercase mb-1 text-12"
                                fw={400}
                                truncate="end"
                            >
                                {t('mint_modal.form.change_agent_table.vault_address_label')}
                            </Text>
                            <div className="flex items-center">
                                <Text
                                    className="text-14"
                                >
                                    {truncateString(agent.vault, isMobile ? 3 : 5, isMobile ? 3 : 5)}
                                </Text>
                                <CopyIcon
                                    text={agent.vault}
                                    size={12}
                                    color={lighten('var(--flr-black)', 0.8)}
                                />
                            </div>
                        </div>
                        <div className="max-[360px]:w-[40px] w-[55px] md:w-[72px] max-w-none">
                            <Text
                                c="var(--flr-gray)"
                                className="uppercase mb-1 text-12"
                                fw={400}
                                truncate="end"
                            >
                                {t('mint_modal.form.change_agent_table.handshake_label')}
                            </Text>
                            <Text
                                className="mb-0 sm:mb-2 text-14"
                            >
                                {t(agent?.handshakeType !== 0 ?
                                    'mint_modal.form.yes_label' : 'mint_modal.form.no_label')
                                }
                            </Text>
                        </div>
                        <div className="max-[360px]:w-[30px] w-[40px] md:w-[72px] max-w-none">
                            <Text
                                c="var(--mantine-color-gray-6)"
                                className="uppercase mb-1 text-12"
                                fw={400}
                                truncate="end"
                            >
                                {t('mint_modal.form.change_agent_table.free_lots_label')}
                            </Text>
                            <Text
                                className="mb-0 sm:mb-2 text-14"
                                truncate="end"
                            >
                                {agent.freeLots}
                            </Text>
                        </div>
                        <div className="max-[360px]:w-[40px] w-[50px] md:w-[72px] max-w-none">
                            <Text
                                c="var(--flr-gray)"
                                className="uppercase mb-1 text-12"
                                fw={400}
                                truncate="end"
                            >
                                {t('mint_modal.form.change_agent_table.mint_fee_label')}
                            </Text>
                            <Text
                                className="mb-0 sm:mb-2 text-14"
                                truncate="end"
                            >
                                {agent.mintFee} <span className="ml-1 text-[var(--flr-gray)]">%</span>
                            </Text>
                        </div>
                    </Group>
                ))}
            </div>
        </ScrollArea>
    );
}
