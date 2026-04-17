declare module 'bikram-sambat' {
    interface BSDate {
        year: number;
        month: number;
        day: number;
    }

    function toBik(date: Date): BSDate;
    function toGreg(year: number, month: number, day: number): BSDate;

    const bs: {
        toBik: typeof toBik;
        toGreg: typeof toGreg;
    };

    export default bs;
}
