export function formatTimestamp(timestamp: number): { date: string; time: string } {
    const d = new Date(timestamp * 1000);
    return {
        date: d.toLocaleDateString(),
        time: d.toLocaleTimeString(),
    };
}
