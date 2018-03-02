export declare const enum AstNodes {
    PathExpression = 0,
    StepExpression = 1,
    BinaryOperation = 2,
}
export declare const enum Axis {
    Ancestor = 0,
    AncestorOrSelf = 1,
    Attribute = 2,
    Child = 3,
    Descendant = 4,
    DescendantOrSelf = 5,
    Following = 6,
    FollowingSibling = 7,
    Parent = 8,
    Preceding = 9,
    PrecedingSibling = 10,
    Self = 11,
}
export declare const enum NodeTest {
    KindTest = 0,
    NameTest = 1,
}
export declare const enum States {
    Begin = 0,
    PathExpression = 1,
    Predicate = 2,
    NodeKindArgs = 3,
}
export declare const enum TokenTypes {
    Abbrevation = 0,
    Identifier = 1,
    Separator = 2,
    Operator = 3,
    Literal = 4,
    Comment = 5,
    Whitespace = 6,
}
