import React from 'react'
import { Badge as MantineBadge, BadgeProps, Text } from '@mantine/core'
import { IconCaretUpFilled, IconCaretDownFilled } from '@tabler/icons-react'

interface TrendBadgeProps extends Omit<BadgeProps, 'variant' | 'children' | 'leftSection' | 'rightSection'> {
    variant: 'trend'
    isPositive: boolean
    children: React.ReactNode
}

interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
    variant: 'status'
    dotColor: string
    bgColor: string
}

interface LabelBadgeProps extends Omit<BadgeProps, 'variant'> {
    variant: 'label'
}

interface InfoBadgeProps extends Omit<BadgeProps, 'variant'> {
    variant: 'info'
}

interface CountBadgeProps extends Omit<BadgeProps, 'variant'> {
    variant: 'count'
}

type AppBadgeProps =
    | TrendBadgeProps
    | StatusBadgeProps
    | LabelBadgeProps
    | InfoBadgeProps
    | CountBadgeProps

export default function Badge(props: AppBadgeProps) {
    const { variant, ...rest } = props

    if (variant === 'trend') {
        const { isPositive, children, className, ...badgeRest } = rest as Omit<TrendBadgeProps, 'variant'>
        const color = isPositive ? 'var(--flr-green)' : 'var(--flr-red)'
        const bgColor = isPositive ? 'var(--flr-lightest-green)' : 'var(--flr-lightest-red)'
        return (
            <MantineBadge
                variant="outline"
                radius="xs"
                color={bgColor}
                className={`px-1 ${className ?? ''}`}
                leftSection={isPositive
                    ? <IconCaretUpFilled size={15} color={color} />
                    : <IconCaretDownFilled size={15} color={color} />
                }
                {...badgeRest}
            >
                <Text className="text-14" fw={400} c={color}>
                    {children}
                </Text>
            </MantineBadge>
        )
    }

    if (variant === 'status') {
        const { dotColor, bgColor, children, ...badgeRest } = rest as Omit<StatusBadgeProps, 'variant'>
        return (
            <MantineBadge
                variant="outline"
                radius="xs"
                size="md"
                color={bgColor}
                fw={400}
                {...badgeRest}
            >
                <div className="flex items-center">
                    <span className="status-dot mr-1 shrink-0" style={{ backgroundColor: dotColor }} />
                    <span style={{ color: dotColor }}>{children}</span>
                </div>
            </MantineBadge>
        )
    }

    if (variant === 'label') {
        const { children, ...badgeRest } = rest as Omit<LabelBadgeProps, 'variant'>
        return (
            <MantineBadge
                variant="outline"
                radius="xs"
                size="lg"
                fw={400}
                color="var(--flr-gray)"
                {...badgeRest}
            >
                {children}
            </MantineBadge>
        )
    }

    if (variant === 'info') {
        const { children, ...badgeRest } = rest as Omit<InfoBadgeProps, 'variant'>
        return (
            <MantineBadge
                variant="outline"
                radius="xs"
                size="md"
                color="var(--flr-sky)"
                bd="1px solid var(--flr-sky-lighter)"
                className="font-normal"
                {...badgeRest}
            >
                <Text className="text-12" fw={400} c="var(--flr-sky)">
                    {children}
                </Text>
            </MantineBadge>
        )
    }

    // count
    const { children, ...badgeRest } = rest as Omit<CountBadgeProps, 'variant'>
    return (
        <MantineBadge
            variant="outline"
            radius="xs"
            color="var(--flr-black)"
            styles={{ root: { borderColor: '#eee' } }}
            {...badgeRest}
        >
            {children}
        </MantineBadge>
    )
}
