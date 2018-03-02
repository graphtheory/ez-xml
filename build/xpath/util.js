"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ast_1 = require("./ast");
function peek(stack) {
    const last = stack.slice(-1);
    if (last.length) {
        return last[0];
    }
    return void 0;
}
exports.peek = peek;
function addBinaryOperation(stack, token) {
    const right = stack.pop();
    const left = stack.pop();
    stack.push(new ast_1.BinaryOperation(token, left, right));
}
exports.addBinaryOperation = addBinaryOperation;
function nodeKind(functionName) {
    switch (functionName.toLowerCase()) {
        case "document-node":
            return 0;
        case "element":
            return 1;
        case "attribute":
            return 2;
        case "schema-element":
            return 3;
        case "schema-attribute":
            return 4;
        case "processing-instruction":
            return 5;
        case "comment":
            return 6;
        case "text":
            return 7;
        case "namespace-node":
            return 8;
        case "node":
            return 9;
        default:
            throw new Error("Invalid kind test function: " + functionName);
    }
}
exports.nodeKind = nodeKind;
function getAxis(axis) {
    switch (axis.toLowerCase()) {
        case "child":
            return 3;
        case "descendant":
            return 4;
        case "attribute":
            return 2;
        case "self":
            return 11;
        case "descendant-or-self":
            return 5;
        case "following-sibling":
            return 7;
        case "following":
            return 6;
        case "parent":
            return 8;
        case "ancestor":
            return 0;
        case "preceding-sibling":
            return 10;
        case "preceding":
            return 9;
        case "ancestor-or-self":
            return 1;
        default:
            throw new Error("Unknown Axis");
    }
}
exports.getAxis = getAxis;
//# sourceMappingURL=util.js.map