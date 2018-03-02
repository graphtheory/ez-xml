"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../common/utils");
const spaceAfter = ["for", "let", "some", "every", "if"];
const spaceBeforeAndAfter = [
    "or",
    "and",
    "eq",
    "ne",
    "lt",
    "le",
    "gt",
    "ge",
    "to",
    "is",
    "intersect",
    "except",
    "instance of",
    "treat as",
    "castable as",
    "cast as",
    "div",
    "idiv",
    "mod",
    "union"
];
const generalOperators = ["=", "+", "*", "[", "]"];
const separators = [",", "{", "}", ")"];
const ambigiousOperators = ["(", "/", "!", "<", ">", "|", ".", '"', "'", ":"];
function xpath_tokenizer(str) {
    let state = 0;
    let token = "";
    let prevChar = "";
    let column = 0;
    let commentsOpen = 0;
    let quoteStyle = "";
    let tokens = [];
    let prevToken;
    const newToken = (type, value) => {
        const tokenRef = { type, value };
        tokens.push(tokenRef);
        prevToken = tokenRef;
        token = "";
    };
    while (true) {
        let c = str[column++];
        if (!c) {
            if (token !== "") {
                newToken(4, token);
            }
            break;
        }
        switch (state) {
            case 0:
                if (prevToken &&
                    prevToken.type === 6 &&
                    spaceBeforeAndAfter.includes(token + c) &&
                    utils_1.isWhitespace(str[column])) {
                    newToken(3, token + c);
                    column++;
                }
                else if (spaceAfter.includes(token + c) && utils_1.isWhitespace(str[column])) {
                    newToken(3, token + c);
                    column++;
                }
                else if (ambigiousOperators.includes(c)) {
                    if (token !== "") {
                        newToken(4, token);
                    }
                    const nextChar = str[column];
                    switch (c) {
                        case "(":
                            if (nextChar === ":") {
                                column++;
                                commentsOpen++;
                                prevChar = "";
                                state = 1;
                            }
                            else {
                                newToken(2, "(");
                            }
                            continue;
                        case "/":
                            if (nextChar === "/") {
                                column++;
                                newToken(3, "//");
                            }
                            else {
                                newToken(3, "/");
                            }
                            continue;
                        case "!":
                            if (nextChar === "=") {
                                column++;
                                newToken(3, "!=");
                            }
                            else {
                                newToken(3, "!");
                            }
                            continue;
                        case "<":
                            if (nextChar === "=") {
                                column++;
                                newToken(3, "<=");
                            }
                            else if (nextChar === "<") {
                                column++;
                                newToken(3, "<<");
                            }
                            else {
                                newToken(3, "<");
                            }
                            continue;
                        case ">":
                            if (nextChar === "=") {
                                column++;
                                newToken(3, ">=");
                            }
                            else if (nextChar === ">") {
                                column++;
                                newToken(3, ">>");
                            }
                            else {
                                newToken(3, ">");
                            }
                            continue;
                        case "|":
                            if (nextChar === "|") {
                                column++;
                                newToken(3, "||");
                            }
                            else {
                                newToken(3, "|");
                            }
                            continue;
                        case ":":
                            if (nextChar === ":") {
                                column++;
                                newToken(3, "::");
                            }
                            else if (nextChar === "=") {
                                column++;
                                newToken(3, ":=");
                            }
                            else {
                                const lastToken = tokens.pop();
                                token = lastToken.value + c;
                            }
                            continue;
                        case ".":
                            if (nextChar === ".") {
                                column++;
                                newToken(0, "..");
                            }
                            else {
                                newToken(3, ".");
                            }
                            continue;
                        default:
                            quoteStyle = c;
                            token = '"';
                            state = 2;
                    }
                }
                else if (generalOperators.includes(c)) {
                    if (token !== "") {
                        newToken(4, token);
                    }
                    newToken(3, c);
                }
                else if (c === "@") {
                    newToken(0, c);
                }
                else if (c === "-" && token === "") {
                    newToken(3, "-");
                }
                else if (c === "$") {
                    state = 3;
                }
                else if (separators.includes(c)) {
                    if (token !== "") {
                        newToken(4, token);
                    }
                    newToken(2, c);
                }
                else if (utils_1.isWhitespace(c)) {
                    if (token !== "") {
                        newToken(4, token);
                    }
                    let tempIndex = column;
                    while (utils_1.isWhitespace(str[tempIndex])) {
                        tempIndex++;
                        continue;
                    }
                    column = tempIndex;
                    newToken(6, "");
                }
                else {
                    token += c;
                }
                continue;
            case 3:
                token = "";
                let nextChar = c;
                let index = column;
                while (nextChar && !utils_1.isWhitespace(nextChar) && nextChar !== ",") {
                    token += nextChar;
                    nextChar = str[index++];
                }
                column = index - 1;
                newToken(1, token);
                state = 0;
                continue;
            case 1:
                if (c === ")" && prevChar === ":") {
                    commentsOpen--;
                    if (commentsOpen > 0) {
                        token += ")";
                    }
                }
                else if (c === ":" && prevChar === "(") {
                    commentsOpen++;
                    token += ":";
                }
                else {
                    token += c;
                }
                prevChar = c;
                if (commentsOpen === 0) {
                    token = "";
                    state = 0;
                }
                continue;
            case 2:
                if (c === quoteStyle) {
                    newToken(4, token + '"');
                    state = 0;
                }
                else {
                    token += c;
                }
                continue;
        }
    }
    return tokens.filter(t => t.type !== 6);
}
exports.xpath_tokenizer = xpath_tokenizer;
//# sourceMappingURL=xpath_tokenizer.js.map