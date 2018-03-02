import * as assert from "assert";

import { TokenTypes } from "../xpath/constants";
import { xpath_tokenizer } from "../xpath/xpath_tokenizer";

describe("XPath - Tokenizer", () => {
    describe("Comments", () => {
        it("(: this is a comment :)", () => {
            const tokens = xpath_tokenizer("(: this is a comment :)");
    
            assert.equal(tokens.length, 0);
        });
    
        it("(:a (:nested:) comment:)", () => {
            const tokens = xpath_tokenizer("(:a (:nested:) comment:)");
    
            assert.equal(tokens.length, 0);
        });
    });

    describe("Queries", () => {    
        it("following-sibling::office", () => {
            const tokens = xpath_tokenizer("following-sibling::office");
    
            assert.equal(tokens.length, 3);
        });
    
        it("let $x := 42", () => {
            const tokens = xpath_tokenizer("let $x := 42");
    
            assert.equal(tokens.length, 4);
    
            assert.equal(tokens[0].type, TokenTypes.Operator);
            assert.equal(tokens[0].value, "let");
    
            assert.equal(tokens[1].type, TokenTypes.Identifier);
            assert.equal(tokens[1].value, "x");
    
            assert.equal(tokens[2].type, TokenTypes.Operator);
            assert.equal(tokens[2].value, ":=");
    
            assert.equal(tokens[3].type, TokenTypes.Literal);
            assert.equal(tokens[3].value, "42");
        });
    
        it("//book[last() - 1]", () => {
            const tokens = xpath_tokenizer("//book[last() - 1]");
    
            assert.equal(tokens.length, 9);
    
            assert.equal(tokens[0].type, TokenTypes.Operator);
            assert.equal(tokens[0].value, "//");
    
            assert.equal(tokens[1].type, TokenTypes.Literal);
            assert.equal(tokens[1].value, "book");
    
            assert.equal(tokens[2].type, TokenTypes.Operator);
            assert.equal(tokens[2].value, "[");
    
            assert.equal(tokens[3].type, TokenTypes.Literal);
            assert.equal(tokens[3].value, "last");
    
            assert.equal(tokens[4].type, TokenTypes.Separator);
            assert.equal(tokens[4].value, "(");
    
            assert.equal(tokens[5].type, TokenTypes.Separator);
            assert.equal(tokens[5].value, ")");
    
            assert.equal(tokens[6].type, TokenTypes.Operator);
            assert.equal(tokens[6].value, "-");
    
            assert.equal(tokens[7].type, TokenTypes.Literal);
            assert.equal(tokens[7].value, "1");
    
            assert.equal(tokens[8].type, TokenTypes.Operator);
            assert.equal(tokens[8].value, "]");
        });

        it("a    lt   b", () => {
            const tokens = xpath_tokenizer("a      lt     b");
    
            assert.equal(tokens.length, 3);
            assert.equal(tokens[0].type, TokenTypes.Literal);
            assert.equal(tokens[1].type, TokenTypes.Operator);
            assert.equal(tokens[2].type, TokenTypes.Literal);
        });
    });

    describe("Operator tests", () => {
        it("/", () => {
            const tokens = xpath_tokenizer("a/b");

            assert.equal(tokens.length, 3);
            assert.equal(tokens[0].type, TokenTypes.Literal);
            assert.equal(tokens[0].value, "a");
            assert.equal(tokens[1].type, TokenTypes.Operator);
            assert.equal(tokens[1].value, "/");
            assert.equal(tokens[2].type, TokenTypes.Literal);
            assert.equal(tokens[2].value, "b");
        });

        it("!", () => {
            const tokens = xpath_tokenizer("!a");

            assert.equal(tokens.length, 2);
            assert.equal(tokens[0].type, TokenTypes.Operator);
            assert.equal(tokens[0].value, "!");
            assert.equal(tokens[1].type, TokenTypes.Literal);
            assert.equal(tokens[1].value, "a");
        });

        it("!=", () => {
            const tokens = xpath_tokenizer("a != b");

            assert.equal(tokens.length, 3);
            assert.equal(tokens[0].type, TokenTypes.Literal);
            assert.equal(tokens[0].value, "a");
            assert.equal(tokens[1].type, TokenTypes.Operator);
            assert.equal(tokens[1].value, "!=");
            assert.equal(tokens[2].type, TokenTypes.Literal);
            assert.equal(tokens[2].value, "b");
        });

        it("<", () => {
            const tokens = xpath_tokenizer("a < b");

            assert.equal(tokens.length, 3);
            assert.equal(tokens[0].type, TokenTypes.Literal);
            assert.equal(tokens[0].value, "a");
            assert.equal(tokens[1].type, TokenTypes.Operator);
            assert.equal(tokens[1].value, "<");
            assert.equal(tokens[2].type, TokenTypes.Literal);
            assert.equal(tokens[2].value, "b");
        });

        it("<=", () => {
            const tokens = xpath_tokenizer("a <= b");

            assert.equal(tokens.length, 3);
            assert.equal(tokens[0].type, TokenTypes.Literal);
            assert.equal(tokens[0].value, "a");
            assert.equal(tokens[1].type, TokenTypes.Operator);
            assert.equal(tokens[1].value, "<=");
            assert.equal(tokens[2].type, TokenTypes.Literal);
            assert.equal(tokens[2].value, "b");
        });

        it(">", () => {
            const tokens = xpath_tokenizer("a > b");

            assert.equal(tokens.length, 3);
            assert.equal(tokens[0].type, TokenTypes.Literal);
            assert.equal(tokens[0].value, "a");
            assert.equal(tokens[1].type, TokenTypes.Operator);
            assert.equal(tokens[1].value, ">");
            assert.equal(tokens[2].type, TokenTypes.Literal);
            assert.equal(tokens[2].value, "b");
        });

        it(">=", () => {
            const tokens = xpath_tokenizer("a >= b");

            assert.equal(tokens.length, 3);
            assert.equal(tokens[0].type, TokenTypes.Literal);
            assert.equal(tokens[0].value, "a");
            assert.equal(tokens[1].type, TokenTypes.Operator);
            assert.equal(tokens[1].value, ">=");
            assert.equal(tokens[2].type, TokenTypes.Literal);
            assert.equal(tokens[2].value, "b");
        });

        it("<<", () => {
            const tokens = xpath_tokenizer("a << b");

            assert.equal(tokens.length, 3);
            assert.equal(tokens[0].type, TokenTypes.Literal);
            assert.equal(tokens[0].value, "a");
            assert.equal(tokens[1].type, TokenTypes.Operator);
            assert.equal(tokens[1].value, "<<");
            assert.equal(tokens[2].type, TokenTypes.Literal);
            assert.equal(tokens[2].value, "b");
        });

        it(">>", () => {
            const tokens = xpath_tokenizer("a >> b");

            assert.equal(tokens.length, 3);
            assert.equal(tokens[0].type, TokenTypes.Literal);
            assert.equal(tokens[0].value, "a");
            assert.equal(tokens[1].type, TokenTypes.Operator);
            assert.equal(tokens[1].value, ">>");
            assert.equal(tokens[2].type, TokenTypes.Literal);
            assert.equal(tokens[2].value, "b");
        });

        it("|", () => {
            const tokens = xpath_tokenizer("a | b");

            assert.equal(tokens.length, 3);
            assert.equal(tokens[0].type, TokenTypes.Literal);
            assert.equal(tokens[0].value, "a");
            assert.equal(tokens[1].type, TokenTypes.Operator);
            assert.equal(tokens[1].value, "|");
            assert.equal(tokens[2].type, TokenTypes.Literal);
            assert.equal(tokens[2].value, "b");
        });

        it("||", () => {
            const tokens = xpath_tokenizer("a || b");

            assert.equal(tokens.length, 3);
            assert.equal(tokens[0].type, TokenTypes.Literal);
            assert.equal(tokens[0].value, "a");
            assert.equal(tokens[1].type, TokenTypes.Operator);
            assert.equal(tokens[1].value, "||");
            assert.equal(tokens[2].type, TokenTypes.Literal);
            assert.equal(tokens[2].value, "b");
        });

        it("::", () => {
            const tokens = xpath_tokenizer("a::b");

            assert.equal(tokens.length, 3);
            assert.equal(tokens[0].type, TokenTypes.Literal);
            assert.equal(tokens[0].value, "a");
            assert.equal(tokens[1].type, TokenTypes.Operator);
            assert.equal(tokens[1].value, "::");
            assert.equal(tokens[2].type, TokenTypes.Literal);
            assert.equal(tokens[2].value, "b");
        });

        it(".", () => {
            const tokens = xpath_tokenizer(". = 'test'");

            assert.equal(tokens.length, 3);
            assert.equal(tokens[0].type, TokenTypes.Operator);
            assert.equal(tokens[0].value, ".");
            assert.equal(tokens[1].type, TokenTypes.Operator);
            assert.equal(tokens[1].value, "=");
            assert.equal(tokens[2].type, TokenTypes.Literal);
            assert.equal(tokens[2].value, "\"test\"");
        });

        it(",", () => {
            const tokens = xpath_tokenizer("a, b");

            assert.equal(tokens.length, 3);
            assert.equal(tokens[0].type, TokenTypes.Literal);
            assert.equal(tokens[0].value, "a");
            assert.equal(tokens[1].type, TokenTypes.Separator);
            assert.equal(tokens[1].value, ",");
            assert.equal(tokens[2].type, TokenTypes.Literal);
            assert.equal(tokens[2].value, "b");
        });
    });

    describe("Abbrevations", () => {
        it("@attr", () => {
            const tokens = xpath_tokenizer("@attr");

            assert.equal(tokens.length, 2);
            assert.equal(tokens[0].type, TokenTypes.Abbrevation);
            assert.equal(tokens[0].value, "@");
            assert.equal(tokens[1].type, TokenTypes.Literal);
            assert.equal(tokens[1].value, "attr");
        });

        it("..", () => {
            const tokens = xpath_tokenizer("..");

            assert.equal(tokens.length, 1);
            assert.equal(tokens[0].type, TokenTypes.Abbrevation);
            assert.equal(tokens[0].value, "..");
        });
    });

    describe("Edge cases", () => {
        it("xl:style", () => {
            const tokens = xpath_tokenizer("xl:style");

            assert.equal(tokens.length, 1);
            assert.equal(tokens[0].type, TokenTypes.Literal);
            assert.equal(tokens[0].value, "xl:style");
        });

        // This is not the same as "xl - style" since nodes can contain dashes
        it("xl-style", () => {
            const tokens = xpath_tokenizer("xl-style");

            assert.equal(tokens.length, 1);
            assert.equal(tokens[0].type, TokenTypes.Literal);
            assert.equal(tokens[0].value, "xl-style");
        });
    });
});
