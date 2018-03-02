"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../common/utils");
const ast_1 = require("./ast");
const operators_1 = require("./operators");
const util_1 = require("./util");
const xpath_tokenizer_1 = require("./xpath_tokenizer");
function xpath_parser(query) {
    const tokens = xpath_tokenizer_1.xpath_tokenizer(query);
    const numTokens = tokens.length;
    const pathExpression = new ast_1.PathExpression();
    const operatorStack = [];
    const operandStack = [];
    let state = 0;
    let currentStep = new ast_1.StepExpression();
    let temp = "";
    for (var i = 0; i < numTokens; i++) {
        const token = tokens[i];
        const prev = tokens[i - 1];
        switch (state) {
            case 0:
                switch (token.type) {
                    case 3:
                        if (token.value === "/") {
                            if (pathExpression.StepExpressions.length === 0) {
                                pathExpression.Root = true;
                            }
                            if (i + 1 !== numTokens) {
                                currentStep = new ast_1.StepExpression();
                                pathExpression.StepExpressions.push(currentStep);
                            }
                        }
                        else if (token.value === "//") {
                            currentStep = new ast_1.StepExpression();
                            currentStep.axis = 5;
                            currentStep.nodeType = 9;
                            pathExpression.StepExpressions.push(currentStep);
                        }
                        else if (token.value === ".") {
                            currentStep = new ast_1.StepExpression();
                            currentStep.axis = 11;
                            pathExpression.StepExpressions.push(currentStep);
                        }
                        else if (token.value === "[") {
                            state = 2;
                        }
                        else if (token.value === "*") {
                            if (pathExpression.StepExpressions.length === 0) {
                                currentStep = new ast_1.StepExpression();
                                pathExpression.StepExpressions.push(currentStep);
                            }
                            currentStep.nodeType = 1;
                        }
                        else {
                            throw new Error("Unexpected operator (" + token.value + ")");
                        }
                        continue;
                    case 4:
                        const nextToken = tokens[i + 1];
                        if (pathExpression.StepExpressions.length === 0) {
                            currentStep = new ast_1.StepExpression();
                            pathExpression.StepExpressions.push(currentStep);
                        }
                        if (nextToken && nextToken.type === 2 && nextToken.value === "(") {
                            i++;
                            currentStep.nodeTest = 0;
                            currentStep.nodeType = util_1.nodeKind(token.value);
                            temp = "";
                            state = 3;
                        }
                        else if (nextToken && nextToken.type === 3 && nextToken.value === "::") {
                            i++;
                            currentStep.axis = util_1.getAxis(token.value);
                        }
                        else {
                            currentStep.nodeType = 1;
                            currentStep.nodeTest = 1;
                            currentStep.nameTest = token.value;
                        }
                        continue;
                    case 0:
                        if (pathExpression.StepExpressions.length === 0) {
                            currentStep = new ast_1.StepExpression();
                            pathExpression.StepExpressions.push(currentStep);
                        }
                        if (token.value === "@") {
                            currentStep.axis = 2;
                            const nextToken = tokens[i + 1];
                            if (nextToken.type === 4) {
                                currentStep.nameTest = nextToken.value;
                                i++;
                            }
                        }
                        if (token.value === "..") {
                            currentStep.axis = 8;
                        }
                        continue;
                    default:
                        throw new Error("Not implemented");
                }
            case 3:
                if (token.type === 2) {
                    switch (token.value) {
                        case ")":
                            if (temp !== "") {
                                currentStep.nodeKindTestArgs.push(temp);
                            }
                            state = 0;
                            continue;
                        case ",":
                            currentStep.nodeKindTestArgs.push(temp);
                            temp = "";
                            continue;
                    }
                }
                else {
                    temp += token.value;
                }
                continue;
            case 2:
                const nextToken = tokens[i + 1];
                switch (token.type) {
                    case 0:
                        if (token.value === "@") {
                            if (!nextToken) {
                                throw new Error("Expected attribute name in predicate");
                            }
                            else if (nextToken.type !== 4) {
                                throw new Error("Expected attribute name");
                            }
                            else {
                                operandStack.push(new ast_1.BinaryOperation(token.value + nextToken.value));
                                i++;
                            }
                        }
                        if (token.value === "..") {
                            operandStack.push(new ast_1.BinaryOperation(token.value + nextToken.value));
                        }
                        continue;
                    case 4:
                        if (utils_1.isInteger(token.value) &&
                            nextToken &&
                            nextToken.type === 3 &&
                            nextToken.value === "]" &&
                            prev.type === 3 &&
                            prev.value === "[") {
                            operandStack.push(new ast_1.BinaryOperation("position"));
                            operatorStack.push("=");
                            operandStack.push(new ast_1.BinaryOperation(token.value));
                        }
                        else {
                            operandStack.push(new ast_1.BinaryOperation(token.value));
                        }
                        continue;
                    case 2:
                        switch (token.value) {
                            case "(":
                                operatorStack.push(token.value);
                                continue;
                            case ")":
                                while (typeof util_1.peek(operatorStack) === "string" && util_1.peek(operatorStack) !== "(") {
                                    util_1.addBinaryOperation(operandStack, operatorStack.pop());
                                }
                                operatorStack.pop();
                                continue;
                            default:
                                continue;
                        }
                    case 3:
                        if (token.value === "]") {
                            while (operatorStack.length > 0) {
                                util_1.addBinaryOperation(operandStack, operatorStack.pop());
                            }
                            const operationTree = operandStack.pop();
                            if (operationTree) {
                                currentStep.predicateList.push(operationTree);
                            }
                            else {
                                throw new Error("Missing predicate");
                            }
                            state = 0;
                            continue;
                        }
                        const o1 = operators_1.Operators[token.value];
                        let o2 = operators_1.Operators[operatorStack.slice(-1)[0]];
                        while (operatorStack.length > 0 && o2) {
                            if ((!o1.rightAssociative && 0 == o1.compare(o2)) || o1.compare(o2) < 0) {
                                operatorStack.pop();
                                util_1.addBinaryOperation(operandStack, o2.symbol);
                                o2 = operators_1.Operators[operatorStack.slice(-1)[0]];
                            }
                            else {
                                break;
                            }
                        }
                        operatorStack.push(token.value);
                        continue;
                }
        }
    }
    if (state === 2) {
        throw new Error("Predicate doesn't have a closing bracket");
    }
    return pathExpression;
}
exports.xpath_parser = xpath_parser;
//# sourceMappingURL=xpath_parser.js.map