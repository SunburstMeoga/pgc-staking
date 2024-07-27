export const formateAddress = (address, n = 4) => {
    const start = address.slice(0, n);
    const end = address.slice(-n);
    return `${start}...${end}`;
}