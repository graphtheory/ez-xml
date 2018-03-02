"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AstNode {
    constructor(type) {
        this.type = type;
    }
}
exports.AstNode = AstNode;
class PathExpression extends AstNode {
    constructor() {
        super(0);
        this.StepExpressions = [];
        this.Root = false;
    }
}
exports.PathExpression = PathExpression;
class StepExpression extends AstNode {
    constructor() {
        super(1);
        this.nodeTest = 1;
        this.nameTest = "";
        this.axis = 3;
        this.nodeType = 9;
        this.predicateList = [];
        this.nodeKindTestArgs = [];
    }
}
exports.StepExpression = StepExpression;
class BinaryOperation extends AstNode {
    constructor(value, left, right) {
        super(2);
        this.value = value;
        this.left = left;
        this.right = right;
    }
}
exports.BinaryOperation = BinaryOperation;
//# sourceMappingURL=ast.js.map