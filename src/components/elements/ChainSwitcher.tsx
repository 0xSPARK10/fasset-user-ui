import { Button, Menu } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { CoinEnum, ICoin } from "@/types";
import { useWeb3 } from "@/hooks/useWeb3";
import { C2FLR, CFLR, FLR, SGB } from "@/config/coin";

interface IChainSwitcher {
    className?: string
}

export default function ChainSwitcher({ className }: IChainSwitcher) {
    const { mainToken } = useWeb3();
    const coins: (ICoin & { url: string })[] = [FLR, SGB, C2FLR, CFLR]
        .filter(coin => {
            if (coin.type === CoinEnum.CFLR) {
                return process.env.CFLR_URL !== undefined;
            } else if (coin.type === CoinEnum.C2FLR) {
                return process.env.C2FLR_URL !== undefined;
            } else if (coin.type === CoinEnum.FLR) {
                return process.env.FLR_URL !== undefined;
            } else if (coin.type === CoinEnum.SGB) {
                return process.env.SGB_URL !== undefined;
            }
        })
        .map(coin => {
            let url = '';
            switch (coin.type) {
                case CoinEnum.C2FLR:
                    url = process.env.C2FLR_URL!;
                    break;
                case CoinEnum.CFLR:
                    url = process.env.CFLR_URL!;
                    break;
                case CoinEnum.FLR:
                    url = process.env.FLR_URL!;
                    break;
                case CoinEnum.SGB:
                    url = process.env.SGB_URL!;
                    break;
            }

            return {
                ...coin,
                url: url
            }
        });

    const getUrl = (coin: ICoin) => {
        switch (coin.type) {
            case CoinEnum.C2FLR:
                return process.env.C2FLR_URL;
            case CoinEnum.CFLR:
                return process.env.CFLR_URL;
            case CoinEnum.FLR:
                return process.env.FLR_URL;
            case CoinEnum.SGB:
                return process.env.SGB_URL;
            default:
                return '';
        }
    }

    return (
        <Menu
            radius={16}
            width="target"
            classNames={{
                item: 'max-[640px]:flex-col max-[640px]:justify-center',
                itemSection: 'max-[640px]:me-0'
            }}
        >
            <Menu.Target>
                <div className={className}>
                    <Button
                        variant="outline"
                        radius="xl"
                        size="md"
                        className="h-[40px] text-black border-gray-200 pl-1 pr-3 hover:bg-transparent hidden sm:block"
                        classNames={{
                            section: 'my-1',
                            label: 'mr-3'
                        }}
                        leftSection={mainToken?.icon({ width: '30', height: '30' })}
                        rightSection={<IconChevronDown size={20} />}
                        fw={400}
                    >
                        {mainToken?.network?.shortName}
                    </Button>
                    <Button
                        variant="outline"
                        radius="xl"
                        size="md"
                        rightSection={<IconChevronDown size={20} />}
                        classNames={{
                            section: 'my-2'
                        }}
                        className="block sm:hidden h-[40px] text-black border-gray-200 pl-1 pr-3 hover:bg-transparent"
                    >
                        {mainToken?.icon({ width: '30', height: '30' })}
                    </Button>
                </div>
            </Menu.Target>
            <Menu.Dropdown>
                {coins.map(coin => (
                    <Menu.Item
                        component="a"
                        href={coin.url}
                        leftSection={coin?.icon({ width: '30', height: '30' })}
                        fw={400}
                        key={coin.type}
                    >
                        <span className="hidden sm:block">{coin?.network?.shortName}</span>
                    </Menu.Item>
                ))}
            </Menu.Dropdown>
        </Menu>
    )
}