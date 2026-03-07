type Props = {
    value: string;
    className?: string;
    height?: number;
};

const CODE39_PATTERNS: Record<string, string> = {
    '0': 'nnnwwnwnn',
    '1': 'wnnwnnnnw',
    '2': 'nnwwnnnnw',
    '3': 'wnwwnnnnn',
    '4': 'nnnwwnnnw',
    '5': 'wnnwwnnnn',
    '6': 'nnwwwnnnn',
    '7': 'nnnwnnwnw',
    '8': 'wnnwnnwnn',
    '9': 'nnwwnnwnn',
    A: 'wnnnnwnnw',
    B: 'nnwnnwnnw',
    C: 'wnwnnwnnn',
    D: 'nnnnwwnnw',
    E: 'wnnnwwnnn',
    F: 'nnwnwwnnn',
    G: 'nnnnnwwnw',
    H: 'wnnnnwwnn',
    I: 'nnwnnwwnn',
    J: 'nnnnwwwnn',
    K: 'wnnnnnnww',
    L: 'nnwnnnnww',
    M: 'wnwnnnnwn',
    N: 'nnnnwnnww',
    O: 'wnnnwnnwn',
    P: 'nnwnwnnwn',
    Q: 'nnnnnnwww',
    R: 'wnnnnnwwn',
    S: 'nnwnnnwwn',
    T: 'nnnnwnwwn',
    U: 'wwnnnnnnw',
    V: 'nwwnnnnnw',
    W: 'wwwnnnnnn',
    X: 'nwnnwnnnw',
    Y: 'wwnnwnnnn',
    Z: 'nwwnwnnnn',
    '-': 'nwnnnnwnw',
    '.': 'wwnnnnwnn',
    ' ': 'nwwnnnwnn',
    $: 'nwnwnwnnn',
    '/': 'nwnwnnnwn',
    '+': 'nwnnnwnwn',
    '%': 'nnnwnwnwn',
    '*': 'nwnnwnwnn',
};

function normalizeCode39Value(input: string): string {
    return input
        .toUpperCase()
        .split('')
        .filter((char) => CODE39_PATTERNS[char] !== undefined && char !== '*')
        .join('');
}

export function Code39Barcode({ value, className, height = 64 }: Props) {
    const narrowWidth = 2;
    const wideWidth = 6;
    const quietZone = 10;
    const interCharacterGap = narrowWidth;
    const encodedValue = `*${normalizeCode39Value(value)}*`;

    let x = quietZone;
    const bars: Array<{ x: number; width: number }> = [];

    for (const character of encodedValue) {
        const pattern = CODE39_PATTERNS[character] ?? CODE39_PATTERNS['-'];

        for (let index = 0; index < pattern.length; index += 1) {
            const width = pattern[index] === 'w' ? wideWidth : narrowWidth;
            const isBar = index % 2 === 0;

            if (isBar) {
                bars.push({ x, width });
            }

            x += width;
        }

        x += interCharacterGap;
    }

    const width = x + quietZone;
    const textY = height + 14;

    return (
        <svg
            viewBox={`0 0 ${width} ${textY + 4}`}
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label={`Barcode ${value}`}
        >
            <rect x="0" y="0" width={width} height={textY + 4} fill="#fff" />
            {bars.map((bar) => (
                <rect key={`${bar.x}-${bar.width}`} x={bar.x} y={0} width={bar.width} height={height} fill="#000" />
            ))}
            <text x={width / 2} y={textY} textAnchor="middle" fontFamily="monospace" fontSize="10" fill="#111827">
                {value}
            </text>
        </svg>
    );
}
