export const truncateString = (
    text: string,
    from: number = 4,
    to: number = 4,
) => {
    return `${text.substring(0, from)}...${text.substring(text.length - to, text.length)}`;
};
