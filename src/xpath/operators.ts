import { Dictionary } from "../common/interfaces";

export class Operator {
    public symbol: string;
    public rightAssociative: boolean;
    public precedence: number;

    constructor(symbol: string, precedence: number, rightAssociative: boolean) {
        this.symbol = symbol;
        this.rightAssociative = rightAssociative;
        this.precedence = precedence;
    }

    compare(o: Operator) {
        if (this.precedence > o.precedence) {
            return 1;
        }

        if (o.precedence == this.precedence) {
            return 0;
        }

        return -1;
    }
}

/**
 * https://www.w3.org/TR/xpath-30/#id-precedence-order
 */
const operators: [string, number, boolean][] = [
    [",", 1, false],
    ["for", 2, false],
    ["let", 2, false],
    ["some", 2, false],
    ["every", 2, false],
    ["if", 2, false],
    ["or", 3, false],
    ["and", 4, false],
    ["eq", 5, false],
    ["ne", 5, false],
    ["lt", 5, false],
    ["le", 5, false],
    ["gt", 5, false],
    ["ge", 5, false],
    ["=", 5, false],
    ["!=", 5, false],
    ["<", 5, false],
    ["<=", 5, false],
    [">", 5, false],
    [">=", 5, false],
    ["is", 5, false],
    ["<<", 5, false],
    [">>", 5, false],
    ["||", 6, false],
    ["to", 7, false],
    ["+", 8, false],
    ["-", 8, false],
    ["*", 9, false],
    ["div", 9, false],
    ["idiv", 9, false],
    ["mod", 9, false],
    ["union", 10, false],
    ["|", 10, false],
    ["intersect", 11, false],
    ["except", 11, false],
    ["instance of", 12, false],
    ["treat as", 13, false],
    ["castable as", 14, false],
    ["cast as", 15, false],
    ["!", 17, false],
    ["/", 18, false],
    ["//", 18, false],
    ["[", 19, false],
    ["]", 19, false]
];

export var Operators: Dictionary<Operator> = operators.reduce((prev: Dictionary<Operator>, op) => {
    prev[op[0]] = new Operator(op[0], op[1], op[2]);

    return prev;
}, {});
