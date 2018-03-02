import { isWhitespace } from "../common/utils";
import { TokenTypes } from "./constants";

const enum States {
    Text,
    COMMENT,
    STRING_LITERAL,
    IDENTIFIER
}

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
// space is not required for any of these
const generalOperators = ["=", "+", "*", "[", "]"];
const separators = [",", "{", "}", ")"];
const ambigiousOperators = ["(", "/", "!", "<", ">", "|", ".", '"', "'", ":"];

export function xpath_tokenizer(str: string) {
    let state = States.Text;
    let token = "";
    let prevChar = "";
    let column = 0;
    let commentsOpen = 0;
    let quoteStyle = "";
    let tokens: XPathToken[] = [];
    let prevToken: XPathToken | undefined;
    const newToken = (type: TokenTypes, value: string) => {
        const tokenRef: XPathToken = {type, value};
        tokens.push(tokenRef);
        prevToken = tokenRef;
        token = "";
    };

    while (true) {
        let c = str[column++];

        if (!c) {
            if (token !== "") {
                newToken(TokenTypes.Literal, token);
            }
            break;
        }

        switch (state) {
            case States.Text:
                if (
                    prevToken &&
                    prevToken.type === TokenTypes.Whitespace &&
                    spaceBeforeAndAfter.includes(token + c) &&
                    isWhitespace(str[column])
                ) {
                    newToken(TokenTypes.Operator, token + c);
                    column++;
                } else if (spaceAfter.includes(token + c) && isWhitespace(str[column])) {
                    newToken(TokenTypes.Operator, token + c);
                    column++;
                } else if (ambigiousOperators.includes(c)) {
                    if (token !== "") {
                        newToken(TokenTypes.Literal, token);
                    }

                    const nextChar = str[column];

                    switch (c) {
                        case "(":
                            if (nextChar === ":") {
                                column++;
                                commentsOpen++;
                                prevChar = "";
                                state = States.COMMENT;
                            } else {
                                newToken(TokenTypes.Separator, "(");
                            }
                            continue;

                        case "/":
                            if (nextChar === "/") {
                                column++;
                                newToken(TokenTypes.Operator, "//");
                            } else {
                                newToken(TokenTypes.Operator, "/");
                            }
                            continue;

                        case "!":
                            if (nextChar === "=") {
                                column++;
                                newToken(TokenTypes.Operator, "!=");
                            } else {
                                newToken(TokenTypes.Operator, "!");
                            }
                            continue;

                        case "<":
                            if (nextChar === "=") {
                                column++;
                                newToken(TokenTypes.Operator, "<=");
                            } else if (nextChar === "<") {
                                column++;
                                newToken(TokenTypes.Operator, "<<");
                            } else {
                                newToken(TokenTypes.Operator, "<");
                            }
                            continue;

                        case ">":
                            if (nextChar === "=") {
                                column++;
                                newToken(TokenTypes.Operator, ">=");
                            } else if (nextChar === ">") {
                                column++;
                                newToken(TokenTypes.Operator, ">>");
                            } else {
                                newToken(TokenTypes.Operator, ">");
                            }
                            continue;

                        case "|":
                            if (nextChar === "|") {
                                column++;
                                newToken(TokenTypes.Operator, "||");
                            } else {
                                newToken(TokenTypes.Operator, "|");
                            }
                            continue;

                        case ":":
                            if (nextChar === ":") {
                                column++;
                                newToken(TokenTypes.Operator, "::");
                            } else if (nextChar === "=") {
                                column++;
                                newToken(TokenTypes.Operator, ":=");
                            } else {
                                const lastToken = tokens.pop() as XPathToken;
                                token = lastToken.value + c;
                            }
                            continue;

                        case ".":
                            if (nextChar === ".") {
                                column++;
                                newToken(TokenTypes.Abbrevation, "..");
                            } else {
                                newToken(TokenTypes.Operator, ".");
                            }
                            continue;

                        default:
                            // e.g. c === "\"" || c === "'"
                            quoteStyle = c;
                            token = '"';
                            state = States.STRING_LITERAL;
                    }
                } else if (generalOperators.includes(c)) {
                    if (token !== "") {
                        newToken(TokenTypes.Literal, token);
                    }
                    newToken(TokenTypes.Operator, c);
                } else if (c === "@") {
                    newToken(TokenTypes.Abbrevation, c);
                } else if (c === "-" && token === "") {
                    newToken(TokenTypes.Operator, "-");
                } else if (c === "$") {
                    state = States.IDENTIFIER;
                } else if (separators.includes(c)) {
                    if (token !== "") {
                        newToken(TokenTypes.Literal, token);
                    }

                    newToken(TokenTypes.Separator, c);
                } else if (isWhitespace(c)) {
                    if (token !== "") {
                        newToken(TokenTypes.Literal, token);
                    }

                    let tempIndex = column;
                    while (isWhitespace(str[tempIndex])) {
                        tempIndex++;
                        continue;
                    }
                    column = tempIndex;
                    newToken(TokenTypes.Whitespace, "");
                } else {
                    token += c;
                }
                continue;

            case States.IDENTIFIER:
                token = "";

                let nextChar = c;
                let index = column;

                while (nextChar && !isWhitespace(nextChar) && nextChar !== ",") {
                    token += nextChar;
                    nextChar = str[index++];
                }

                column = index - 1;

                newToken(TokenTypes.Identifier, token);
                state = States.Text;
                continue;

            case States.COMMENT:
                if (c === ")" && prevChar === ":") {
                    commentsOpen--;

                    if (commentsOpen > 0) {
                        token += ")";
                    }
                } else if (c === ":" && prevChar === "(") {
                    commentsOpen++;
                    token += ":";
                } else {
                    token += c;
                }

                prevChar = c;

                if (commentsOpen === 0) {
                    // Don't add comments
                    token = "";
                    state = States.Text;
                }
                continue;

            case States.STRING_LITERAL:
                if (c === quoteStyle) {
                    newToken(TokenTypes.Literal, token + '"');
                    state = States.Text;
                } else {
                    token += c;
                }
                continue;
        }
    }

    // We don't care about whitespace anymore
    return tokens.filter(t => t.type !== TokenTypes.Whitespace);
}

export interface XPathToken {
    type: TokenTypes;
    value: string;
}
