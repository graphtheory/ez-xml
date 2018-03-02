export function isWhitespace(c: string) {
    return c === " " || c === "\n" || c === "\r" || c === "\t";
}

export function isInteger(c: string) {
    return /^[0-9]+$/.test(c);
}
