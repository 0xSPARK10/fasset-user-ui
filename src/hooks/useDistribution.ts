import { DISTRIBUTION_START, DISTRIBUTION_CYCLES_COUNT, DISTRIBUTION_CYCLE_DAYS } from "@/constants";
import { useEffect, useRef, useState } from "react";
import moment, { Moment } from "moment/moment";
import { useInterval } from "@mantine/hooks";

export function useDistribution() {
    const [isDistributionCountdownActive, setIsDistributionCountdownActive] = useState<boolean>(false);
    const [distributionCountdown, setDistributionCountdown] = useState<string>();
    const [currentCycleCount, setCurrentCycleCount] = useState<number>(Math.ceil(moment().diff(moment.utc(DISTRIBUTION_START, 'YYYY-MM-DD HH:mm'), 'days', true) / DISTRIBUTION_CYCLE_DAYS));

    const distributionTargetDate = useRef<Moment | null>(null);

    const interval = useInterval(() => {
        if (!distributionTargetDate.current) return;
        setCurrentCycleCount(Math.ceil(moment().diff(moment.utc(DISTRIBUTION_START, 'YYYY-MM-DD HH:mm'), 'days', true) / DISTRIBUTION_CYCLE_DAYS));
        const now = moment();
        const duration = moment.duration(distributionTargetDate.current.diff(now));

        if (duration.asMilliseconds() <= 0) {
            setDistributionCountdown("0d 0h 0m 0s");
        } else {
            setDistributionCountdown(`${duration.days()}d ${duration.hours()}h ${duration.minutes()}m ${duration.seconds()}s`);
        }
    }, 1000);

    useEffect(() => {
        setIsDistributionCountdownActive(currentCycleCount <= DISTRIBUTION_CYCLES_COUNT);
    }, []);

    useEffect(() => {
        if (!isDistributionCountdownActive) return;
        distributionTargetDate.current = moment.utc(DISTRIBUTION_START, 'YYYY-MM-DD HH:mm')
            .add(currentCycleCount * DISTRIBUTION_CYCLE_DAYS, 'days');

        interval.start();
        return interval.stop;

    }, [isDistributionCountdownActive, currentCycleCount]);

    return {
        distributionCountdown,
        isDistributionCountdownActive,
        distributionTargetDate
    }
}
