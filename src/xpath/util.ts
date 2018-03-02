import { NodeType } from "../xml/constants";
import { BinaryOperation } from "./ast";
import { Axis } from "./constants";

export function peek<T>(stack: T[]) {
    const last = stack.slice(-1);

    if (last.length) {
        return last[0];
    }

    return void 0;
}

export function addBinaryOperation(stack: BinaryOperation[], token: string) {
    const right = stack.pop();
    const left = stack.pop();

    stack.push(new BinaryOperation(token, left, right));
}

export function nodeKind(functionName: string) {
    switch (functionName.toLowerCase()) {
        case "document-node":
            return NodeType.DOCUMENT_NODE;

        case "element":
            return NodeType.ELEMENT;

        case "attribute":
            return NodeType.ATTRIBUTE;

        case "schema-element":
            return NodeType.SCHEMA_ELEMENT;

        case "schema-attribute":
            return NodeType.SCHEMA_ATTRIBUTE;

        case "processing-instruction":
            return NodeType.PROCESSING_INSTRUCTION;

        case "comment":
            return NodeType.COMMENT;

        case "text":
            return NodeType.TEXT;

        case "namespace-node":
            return NodeType.NAMESPACE_NODE;

        case "node":
            return NodeType.NODE;

        default:
            throw new Error("Invalid kind test function: " + functionName);
    }
}

export function getAxis(axis: string) {
    switch (axis.toLowerCase()) {
        case "child":
            return Axis.Child;
        case "descendant":
            return Axis.Descendant;
        case "attribute":
            return Axis.Attribute;
        case "self":
            return Axis.Self;
        case "descendant-or-self":
            return Axis.DescendantOrSelf;
        case "following-sibling":
            return Axis.FollowingSibling;
        case "following":
            return Axis.Following;
        case "parent":
            return Axis.Parent;
        case "ancestor":
            return Axis.Ancestor;
        case "preceding-sibling":
            return Axis.PrecedingSibling;
        case "preceding":
            return Axis.Preceding;
        case "ancestor-or-self":
            return Axis.AncestorOrSelf;

        default:
            throw new Error("Unknown Axis");
    }
}

