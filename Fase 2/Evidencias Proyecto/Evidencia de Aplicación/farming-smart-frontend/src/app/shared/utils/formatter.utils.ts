export const truncate = (value: number, decimals: number): number => {
    return Math.trunc(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
};
