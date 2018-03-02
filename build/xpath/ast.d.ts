import { NodeType } from "../xml/constants";
import { AstNodes, Axis, NodeTest } from "./constants";
export declare class AstNode {
    type: AstNodes;
    constructor(type: AstNodes);
}
export declare class PathExpression extends AstNode {
    StepExpressions: StepExpression[];
    Root: boolean;
    constructor();
}
export declare class StepExpression extends AstNode {
    axis: Axis;
    nodeTest: NodeTest;
    nameTest: string;
    nodeType: NodeType;
    predicateList: BinaryOperation[];
    nodeKindTestArgs: string[];
    constructor();
}
export declare class BinaryOperation extends AstNode {
    value: string;
    left?: BinaryOperation;
    right?: BinaryOperation;
    constructor(value: string, left?: BinaryOperation, right?: BinaryOperation);
}
