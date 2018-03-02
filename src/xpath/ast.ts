import { NodeType } from "../xml/constants";
import { AstNodes, Axis, NodeTest } from "./constants";

export class AstNode {
    public type: AstNodes;

    constructor(type: AstNodes) {
        this.type = type;
    }
}

export class PathExpression extends AstNode {
    public StepExpressions: StepExpression[];
    public Root: boolean;

    constructor() {
        super(AstNodes.PathExpression);
        this.StepExpressions = [];
        this.Root = false;
    }
}

export class StepExpression extends AstNode {
    public axis: Axis;
    public nodeTest: NodeTest;
    public nameTest: string;
    public nodeType: NodeType;
    public predicateList: BinaryOperation[];
    public nodeKindTestArgs: string[];

    constructor() {
        super(AstNodes.StepExpression);
        this.nodeTest = NodeTest.NameTest;
        this.nameTest = "";
        this.axis = Axis.Child;
        this.nodeType = NodeType.NODE;
        this.predicateList = [];
        this.nodeKindTestArgs = [];
    }
}

export class BinaryOperation extends AstNode {
    public value: string;
    public left?: BinaryOperation;
    public right?: BinaryOperation;

    constructor(value: string, left?: BinaryOperation, right?: BinaryOperation) {
        super(AstNodes.BinaryOperation);
        this.value = value;
        this.left = left;
        this.right = right;
    }
}
