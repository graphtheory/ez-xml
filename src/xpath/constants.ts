export const enum AstNodes {
    PathExpression,
    StepExpression,
    BinaryOperation
}

export const enum Axis {
    Ancestor,
    AncestorOrSelf,
    Attribute,
    Child,
    Descendant,
    DescendantOrSelf,
    Following,
    FollowingSibling,
    Parent,
    Preceding,
    PrecedingSibling,
    Self,
}

export const enum NodeTest {
    KindTest,
    NameTest,
}

export const enum States {
    Begin,
    PathExpression,
    Predicate,
    NodeKindArgs
}

export const enum TokenTypes {
    Abbrevation,
    Identifier,
    Separator,
    Operator,
    Literal,
    Comment,
    Whitespace,
}
