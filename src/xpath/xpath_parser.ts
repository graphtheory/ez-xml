import { NodeType } from '../xml/constants';
import { isInteger } from '../common/utils';
import { BinaryOperation, PathExpression, StepExpression } from './ast';
import { Axis, NodeTest, States, TokenTypes } from './constants';
import { Operators } from './operators';
import { addBinaryOperation, getAxis, nodeKind, peek } from './util';
import { xpath_tokenizer } from './xpath_tokenizer';

/**
 * Creates a Abstract Syntax Tree with a Path Expression as its root
 * since we are only dealing with XPath Path Expressions.
 */
export function xpath_parser(query: string) {
    const tokens = xpath_tokenizer(query);
    const numTokens = tokens.length;
    const pathExpression = new PathExpression();
    const operatorStack: string[] = [];
    const operandStack: BinaryOperation[] = [];
    let state = States.Begin;
    let currentStep = new StepExpression();
    let temp = "";

    for (var i = 0; i < numTokens; i++) {
        const token = tokens[i];
        const prev = tokens[i - 1];

        switch (state) {
            case States.Begin:
                switch (token.type) {
                    case TokenTypes.Operator:
                        if (token.value === "/") {
                            if (pathExpression.StepExpressions.length === 0) {
                                pathExpression.Root = true;
                            }

                            if (i + 1 !== numTokens) {
                                currentStep = new StepExpression();
                                pathExpression.StepExpressions.push(currentStep);
                            }
                        } else if (token.value === "//") {
                            currentStep = new StepExpression();
                            currentStep.axis = Axis.DescendantOrSelf;
                            currentStep.nodeType = NodeType.NODE;

                            pathExpression.StepExpressions.push(currentStep);
                        } else if (token.value === ".") {
                            currentStep = new StepExpression();

                            currentStep.axis = Axis.Self;
                            pathExpression.StepExpressions.push(currentStep);
                        } else if (token.value === "[") {
                            state = States.Predicate;
                        } else if (token.value === "*") {
                            if (pathExpression.StepExpressions.length === 0) {
                                currentStep = new StepExpression();
                                pathExpression.StepExpressions.push(currentStep);
                            }

                            currentStep.nodeType = NodeType.ELEMENT;
                        } else {
                            throw new Error("Unexpected operator (" + token.value + ")");
                        }
                        continue;

                    case TokenTypes.Literal:
                        const nextToken = tokens[i + 1];

                        if (pathExpression.StepExpressions.length === 0) {
                            currentStep = new StepExpression();
                            pathExpression.StepExpressions.push(currentStep);
                        }

                        if (nextToken && nextToken.type === TokenTypes.Separator && nextToken.value === "(") {
                            i++;
                            currentStep.nodeTest = NodeTest.KindTest;
                            currentStep.nodeType = nodeKind(token.value);
                            temp = "";
                            state = States.NodeKindArgs;
                        } else if (nextToken && nextToken.type === TokenTypes.Operator && nextToken.value === "::") {
                            i++;
                            currentStep.axis = getAxis(token.value);
                        } else {
                            currentStep.nodeType = NodeType.ELEMENT;
                            currentStep.nodeTest = NodeTest.NameTest;
                            currentStep.nameTest = token.value;
                        }
                        continue;

                    case TokenTypes.Abbrevation:
                        if (pathExpression.StepExpressions.length === 0) {
                            currentStep = new StepExpression();
                            pathExpression.StepExpressions.push(currentStep);
                        }

                        if (token.value === "@") {
                            currentStep.axis = Axis.Attribute;

                            const nextToken = tokens[i + 1];

                            if (nextToken.type === TokenTypes.Literal) {
                                currentStep.nameTest = nextToken.value;
                                i++;
                            }
                        }

                        if (token.value === "..") {
                            currentStep.axis = Axis.Parent;
                        }
                        continue;

                    default:
                        throw new Error("Not implemented");
                }

            case States.NodeKindArgs:
                if (token.type === TokenTypes.Separator) {
                    switch (token.value) {
                        case ")":
                            if (temp !== "") {
                                currentStep.nodeKindTestArgs.push(temp);
                            }
                            state = States.Begin;
                            continue;

                        case ",":
                            currentStep.nodeKindTestArgs.push(temp);
                            temp = "";
                            continue;
                    }
                } else {
                    temp += token.value;
                }
                continue;

            case States.Predicate:
                const nextToken = tokens[i + 1];
                switch (token.type) {
                    case TokenTypes.Abbrevation:
                        if (token.value === "@") {
                            if (!nextToken) {
                                throw new Error("Expected attribute name in predicate");
                            } else if (nextToken.type !== TokenTypes.Literal) {
                                throw new Error("Expected attribute name");
                            } else {
                                operandStack.push(new BinaryOperation(token.value + nextToken.value));
                                i++;
                            }
                        }

                        if (token.value === "..") {
                            operandStack.push(new BinaryOperation(token.value + nextToken.value));
                        }
                        continue;

                    case TokenTypes.Literal:
                        if (
                            isInteger(token.value) &&
                            nextToken &&
                            nextToken.type === TokenTypes.Operator &&
                            nextToken.value === "]" &&
                            prev.type === TokenTypes.Operator &&
                            prev.value === "["
                        ) {
                            operandStack.push(new BinaryOperation("position"));
                            operatorStack.push("=");
                            operandStack.push(new BinaryOperation(token.value));
                        } else {
                            operandStack.push(new BinaryOperation(token.value));
                        }

                        continue;

                    case TokenTypes.Separator:
                        switch (token.value) {
                            case "(":
                                operatorStack.push(token.value);
                                continue;

                            case ")":
                                while (typeof peek(operatorStack) === "string" && peek(operatorStack) !== "(") {
                                    addBinaryOperation(operandStack, operatorStack.pop() as string);
                                }

                                // Remove left parenthesis
                                operatorStack.pop();
                                continue;

                            default:
                                continue;
                        }

                    case TokenTypes.Operator:
                        if (token.value === "]") {
                            while (operatorStack.length > 0) {
                                addBinaryOperation(operandStack, operatorStack.pop() as string);
                            }

                            const operationTree = operandStack.pop();

                            if (operationTree) {
                                currentStep.predicateList.push(operationTree);
                            } else {
                                throw new Error("Missing predicate");
                            }

                            state = States.Begin;
                            continue;
                        }

                        const o1 = Operators[token.value];
                        let o2 = Operators[operatorStack.slice(-1)[0]];

                        while (operatorStack.length > 0 && o2) {
                            if ((!o1.rightAssociative && 0 == o1.compare(o2)) || o1.compare(o2) < 0) {
                                operatorStack.pop();

                                addBinaryOperation(operandStack, o2.symbol);
                                o2 = Operators[operatorStack.slice(-1)[0]];
                            } else {
                                break;
                            }
                        }

                        operatorStack.push(token.value);
                        continue;
                }
        }
    }

    if (state === States.Predicate) {
        throw new Error("Predicate doesn't have a closing bracket");
    }

    return pathExpression;
}
