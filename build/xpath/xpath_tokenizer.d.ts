import { TokenTypes } from "./constants";
export declare function xpath_tokenizer(str: string): XPathToken[];
export interface XPathToken {
    type: TokenTypes;
    value: string;
}
