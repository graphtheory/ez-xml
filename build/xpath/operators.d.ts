import { Dictionary } from "../common/interfaces";
export declare class Operator {
    symbol: string;
    rightAssociative: boolean;
    precedence: number;
    constructor(symbol: string, precedence: number, rightAssociative: boolean);
    compare(o: Operator): 1 | 0 | -1;
}
export declare var Operators: Dictionary<Operator>;
