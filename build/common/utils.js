"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isWhitespace(c) {
    return c === " " || c === "\n" || c === "\r" || c === "\t";
}
exports.isWhitespace = isWhitespace;
function isInteger(c) {
    return /^[0-9]+$/.test(c);
}
exports.isInteger = isInteger;
//# sourceMappingURL=utils.js.map