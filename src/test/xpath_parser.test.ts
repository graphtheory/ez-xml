import * as assert from "assert";

import { NodeType } from "../xml/constants";
import { BinaryOperation } from "../xpath/ast";
import { Axis, NodeTest } from "../xpath/constants";
import { xpath_parser } from "../xpath/xpath_parser";

describe("XPathParser", () => {
    describe("Absolute paths", () => {
        it("/", () => {
            const pathExpression = xpath_parser("/");

            assert.equal(pathExpression.StepExpressions.length, 0);
            assert.equal(pathExpression.Root, true);
        });

        it("/company", () => {
            const pathExpression = xpath_parser("/company");
            const paths = pathExpression.StepExpressions;

            assert.equal(pathExpression.Root, true);
            assert.equal(paths.length, 1);
            assert.equal(paths[0].axis, Axis.Child);
            assert.equal(paths[0].nodeTest, NodeTest.NameTest);
            assert.equal(paths[0].nameTest, "company");
        });

        it("/comment()", () => {
            const pathExpression = xpath_parser("/comment()");
            const paths = pathExpression.StepExpressions;

            assert.equal(paths.length, 1);
            assert.equal(paths[0].axis, Axis.Child);
            assert.equal(paths[0].nodeType, NodeType.COMMENT);
            assert.equal(paths[0].nodeTest, NodeTest.KindTest);
        });

        it("/company/office", () => {
            const pathExpression = xpath_parser("/company/office");
            const paths = pathExpression.StepExpressions;

            assert.equal(paths.length, 2);
            assert.equal(paths[0].axis, Axis.Child);
            assert.equal(paths[0].nodeTest, NodeTest.NameTest);
            assert.equal(paths[0].nameTest, "company");
            assert.equal(paths[0].nodeType, NodeType.ELEMENT);

            assert.equal(paths[1].axis, Axis.Child);
            assert.equal(paths[1].nodeTest, NodeTest.NameTest);
            assert.equal(paths[1].nameTest, "office");
            assert.equal(paths[1].nodeType, NodeType.ELEMENT);
        });

        it("/company/office[2]", () => {
            const pathExpression = xpath_parser("/company/office[2]");
            const paths = pathExpression.StepExpressions;

            const predicateList = paths[1].predicateList;

            assert.equal(predicateList.length, 1);

            const predicate = predicateList[0];

            assert.equal(predicate.value, "=");
            assert.equal((predicate.left as BinaryOperation).value, "position");
            assert.equal((predicate.right as BinaryOperation).value, "2");
        });

        it("/company/office[position() = 2]", () => {
            const pathExpression = xpath_parser("/company/office[position() = 2]");
            const paths = pathExpression.StepExpressions;

            const predicateList = paths[1].predicateList;

            assert.equal(predicateList.length, 1);

            const predicate = predicateList[0];

            assert.equal(predicate.value, "=");
            assert.equal((predicate.left as BinaryOperation).value, "position");
            assert.equal((predicate.right as BinaryOperation).value, "2");
        });

        it("/company/office/@location", () => {
            const pathExpression = xpath_parser("/company/office/@location");
            const paths = pathExpression.StepExpressions;

            assert.equal(paths[2].nameTest, "location");
            assert.equal(paths[2].nodeTest, NodeTest.NameTest);
            assert.equal(paths[2].axis, Axis.Attribute);
        });

        it("/company/office[@location = 'Boston']", () => {
            const pathExpression = xpath_parser("/company/office[@location = 'Boston']");
            const paths = pathExpression.StepExpressions;

            assert.equal(paths.length, 2);

            const predicateList = paths[1].predicateList;

            assert.equal(predicateList.length, 1);

            const predicate = predicateList[0];

            assert.equal(predicate.value, "=");
            assert.equal((predicate.left as BinaryOperation).value, "@location");
            assert.equal((predicate.right as BinaryOperation).value, '"Boston"');
        });

        it("//employee", () => {
            const pathExpression = xpath_parser("//employee");
            const paths = pathExpression.StepExpressions;

            assert.equal(paths.length, 1);
            assert.equal(paths[0].axis, Axis.DescendantOrSelf);
            assert.equal(paths[0].nameTest, "employee");
            assert.equal(paths[0].nodeType, NodeType.ELEMENT);
        });

        it("//employee[age > 30]", () => {
            const pathExpression = xpath_parser("//employee[age > 30]");
            const paths = pathExpression.StepExpressions;

            const predicateList = paths[0].predicateList;

            assert.equal(predicateList.length, 1);

            const predicate = predicateList[0];

            assert.equal(predicate.value, ">");
            assert.equal((predicate.left as BinaryOperation).value, "age");
            assert.equal((predicate.right as BinaryOperation).value, "30");
        });

        it("//employee[age > 30 and age < 40]", () => {
            const pathExpression = xpath_parser("//employee[age > 30 and age < 40]");
            const paths = pathExpression.StepExpressions;

            assert.equal(paths.length, 1);

            const predicateList = paths[0].predicateList;

            assert.equal(predicateList.length, 1);

            const predicate = predicateList[0];

            assert.equal(predicate.value, "and");

            const left = predicate.left as BinaryOperation;
            const right = predicate.right as BinaryOperation;

            assert.equal(left.value, ">");
            assert.equal(right.value, "<");

            assert.equal((left.left as BinaryOperation).value, "age");
            assert.equal((left.right as BinaryOperation).value, "30");
            assert.equal((right.left as BinaryOperation).value, "age");
            assert.equal((right.right as BinaryOperation).value, "40");
        });

        it("//employee[age >= 30 and age <= 40]", () => {
            const pathExpression = xpath_parser("//employee[age >= 30 and age <= 40]");
            const paths = pathExpression.StepExpressions;

            assert.equal(paths.length, 1);

            const predicateList = paths[0].predicateList;

            assert.equal(predicateList.length, 1);

            const predicate = predicateList[0];

            assert.equal(predicate.value, "and");

            const left = predicate.left as BinaryOperation;
            const right = predicate.right as BinaryOperation;

            assert.equal(left.value, ">=");
            assert.equal(right.value, "<=");

            assert.equal((left.left as BinaryOperation).value, "age");
            assert.equal((left.right as BinaryOperation).value, "30");
            assert.equal((right.left as BinaryOperation).value, "age");
            assert.equal((right.right as BinaryOperation).value, "40");
        });

        it("/company/office/employee/name/text()", () => {
            const pathExpression = xpath_parser("/company/office/employee/name/text()");
            const paths = pathExpression.StepExpressions;

            assert.equal(paths.length, 5);

            assert.equal(paths[0].nameTest, "company");
            assert.equal(paths[1].nameTest, "office");
            assert.equal(paths[2].nameTest, "employee");
            assert.equal(paths[3].nameTest, "name");
            assert.equal(paths[4].nameTest, "");

            assert.equal(paths[0].nodeType, NodeType.ELEMENT);
            assert.equal(paths[1].nodeType, NodeType.ELEMENT);
            assert.equal(paths[2].nodeType, NodeType.ELEMENT);
            assert.equal(paths[3].nodeType, NodeType.ELEMENT);
            assert.equal(paths[4].nodeType, NodeType.TEXT);

            assert.equal(paths[0].axis, Axis.Child);
            assert.equal(paths[1].axis, Axis.Child);
            assert.equal(paths[2].axis, Axis.Child);
            assert.equal(paths[3].axis, Axis.Child);
            assert.equal(paths[4].axis, Axis.Child);

            assert.equal(paths[0].predicateList.length, 0);
            assert.equal(paths[1].predicateList.length, 0);
            assert.equal(paths[2].predicateList.length, 0);
            assert.equal(paths[3].predicateList.length, 0);
            assert.equal(paths[4].predicateList.length, 0);
        });

        it("book[(3 * 5 + 6) div 7 - 1]", () => {
            const pathExpression = xpath_parser("//book[(3 * 5 + 6) div 7 - 1]");
            const paths = pathExpression.StepExpressions;

            assert.equal(paths.length, 1);
        });

        it("//book/*", () => {
            const pathExpression = xpath_parser("//book/*");
            const paths = pathExpression.StepExpressions;

            assert.equal(paths.length, 2);
        });
    });

    describe("Relative paths", () => {
        it(".", () => {
            const pathExpression = xpath_parser(".");
            const paths = pathExpression.StepExpressions;

            assert.equal(paths.length, 1);
            assert.equal(paths[0].axis, Axis.Self);
        });

        it("..", () => {
            const pathExpression = xpath_parser("..");
            const paths = pathExpression.StepExpressions;

            assert.equal(paths.length, 1);
            assert.equal(paths[0].axis, Axis.Parent);
        });

        it("../..", () => {
            const pathExpression = xpath_parser("../..");
            const paths = pathExpression.StepExpressions;

            assert.equal(paths.length, 2);
            assert.equal(paths[0].axis, Axis.Parent);
            assert.equal(paths[1].axis, Axis.Parent);
        });

        it("employee", () => {
            const pathExpression = xpath_parser("employee");
            const paths = pathExpression.StepExpressions;

            assert.equal(paths.length, 1);
            assert.equal(paths[0].axis, Axis.Child);
            assert.equal(paths[0].nameTest, "employee");
        });

        it("*", () => {
            const pathExpression = xpath_parser("*");
            const paths = pathExpression.StepExpressions;

            assert.equal(paths.length, 1);
            assert.equal(paths[0].axis, Axis.Child);
            assert.equal(paths[0].nodeType, NodeType.ELEMENT);
        });

        it("age/text()", () => {
            const pathExpression = xpath_parser("age/text()");
            const paths = pathExpression.StepExpressions;

            assert.equal(paths.length, 2);
            assert.equal(paths[0].axis, Axis.Child);
            assert.equal(paths[0].nodeType, NodeType.ELEMENT);
            assert.equal(paths[0].nameTest, "age");
            assert.equal(paths[1].axis, Axis.Child);
            assert.equal(paths[1].nodeType, NodeType.TEXT);
            assert.equal(paths[1].nameTest, "");
        });

        it("../following-sibling::office/@location", () => {
            const pathExpression = xpath_parser("../following-sibling::office/@location");
            const paths = pathExpression.StepExpressions;

            assert.equal(paths.length, 3);
            assert.equal(paths[0].axis, Axis.Parent);
            assert.equal(paths[1].nameTest, "office");
            assert.equal(paths[1].axis, Axis.FollowingSibling);
            assert.equal(paths[2].axis, Axis.Attribute);
            assert.equal(paths[2].nameTest, "location");
        });

        it("parent::node()", () => {
            const pathExpression = xpath_parser("parent::node()");
            const paths = pathExpression.StepExpressions;

            assert.equal(paths.length, 1);
            assert.equal(paths[0].axis, Axis.Parent);
            assert.equal(paths[0].nodeType, NodeType.NODE);
        });

        it("parent::document-node()", () => {
            const pathExpression = xpath_parser("parent::document-node()");
            const paths = pathExpression.StepExpressions;

            assert.equal(paths.length, 1);
            assert.equal(paths[0].axis, Axis.Parent);
            assert.equal(paths[0].nodeType, NodeType.DOCUMENT_NODE);
        });

        it("child::element()", () => {
            const pathExpression = xpath_parser("child::element()");
            const paths = pathExpression.StepExpressions;

            assert.equal(paths.length, 1);
            assert.equal(paths[0].axis, Axis.Child);
            assert.equal(paths[0].nodeType, NodeType.ELEMENT);
        });

        it("descendant::attribute('location')", () => {
            const pathExpression = xpath_parser("descendant::attribute('location')");
            const paths = pathExpression.StepExpressions;

            assert.equal(paths.length, 1);
            assert.equal(paths[0].axis, Axis.Descendant);
            assert.equal(paths[0].nodeType, NodeType.ATTRIBUTE);
            assert.equal(paths[0].nodeKindTestArgs[0], '"location"');
        });

        it("attribute::location", () => {
            const pathExpression = xpath_parser("attribute::location");
            const paths = pathExpression.StepExpressions;

            assert.equal(paths.length, 1);
            assert.equal(paths[0].axis, Axis.Attribute);
            assert.equal(paths[0].nodeType, NodeType.ELEMENT);
            assert.equal(paths[0].nameTest, "location");
        });

        it("self::age", () => {
            const pathExpression = xpath_parser("self::age");
            const paths = pathExpression.StepExpressions;

            assert.equal(paths.length, 1);
            assert.equal(paths[0].axis, Axis.Self);
            assert.equal(paths[0].nameTest, "age");
        });

        it("descendant-or-self::schema-element()", () => {
            const pathExpression = xpath_parser("descendant-or-self::schema-element()");
            const paths = pathExpression.StepExpressions;

            assert.equal(paths.length, 1);
            assert.equal(paths[0].axis, Axis.DescendantOrSelf);
            assert.equal(paths[0].nodeType, NodeType.SCHEMA_ELEMENT);
        });

        it("following-sibling::schema-attribute()", () => {
            const pathExpression = xpath_parser("following-sibling::schema-attribute()");
            const paths = pathExpression.StepExpressions;

            assert.equal(paths.length, 1);
            assert.equal(paths[0].axis, Axis.FollowingSibling);
            assert.equal(paths[0].nodeType, NodeType.SCHEMA_ATTRIBUTE);
        });

        it("following::processing-instruction()", () => {
            const pathExpression = xpath_parser("following::processing-instruction()");
            const paths = pathExpression.StepExpressions;

            assert.equal(paths.length, 1);
            assert.equal(paths[0].axis, Axis.Following);
            assert.equal(paths[0].nodeType, NodeType.PROCESSING_INSTRUCTION);
        });

        it("parent::namespace-node()", () => {
            const pathExpression = xpath_parser("parent::namespace-node()");
            const path = pathExpression.StepExpressions;

            assert.equal(path.length, 1);
            assert.equal(path[0].axis, Axis.Parent);
            assert.equal(path[0].nodeType, NodeType.NAMESPACE_NODE);
        });

        it("ancestor::company", () => {
            const pathExpression = xpath_parser("ancestor::company");
            const path = pathExpression.StepExpressions;

            assert.equal(path.length, 1);
            assert.equal(path[0].axis, Axis.Ancestor);
            assert.equal(path[0].nameTest, "company");
        });

        it("preceding-sibling::office", () => {
            const pathExpression = xpath_parser("preceding-sibling::office");
            const path = pathExpression.StepExpressions;

            assert.equal(path.length, 1);
            assert.equal(path[0].axis, Axis.PrecedingSibling);
            assert.equal(path[0].nameTest, "office");
        });

        it("preceding::office", () => {
            const pathExpression = xpath_parser("preceding::office");
            const path = pathExpression.StepExpressions;

            assert.equal(path.length, 1);
            assert.equal(path[0].axis, Axis.Preceding);
            assert.equal(path[0].nameTest, "office");
        });

        it("ancestor-or-self::company", () => {
            const pathExpression = xpath_parser("ancestor-or-self::company");
            const path = pathExpression.StepExpressions;

            assert.equal(path.length, 1);
            assert.equal(path[0].axis, Axis.AncestorOrSelf);
            assert.equal(path[0].nameTest, "company");
        });

        it("//element(*, xs:date)", () => {
            const pathExpression = xpath_parser("//element(*, xs:date)");
            const paths = pathExpression.StepExpressions;

            assert.equal(paths.length, 1);
            assert.equal(paths[0].axis, Axis.DescendantOrSelf);
            assert.equal(paths[0].nodeKindTestArgs.length, 2);
            assert.equal(paths[0].nodeKindTestArgs[0], "*");
            assert.equal(paths[0].nodeKindTestArgs[1], "xs:date");
        });

        it("//element('', xs:date)", () => {
            const pathExpression = xpath_parser("//element('', xs:date)");
            const paths = pathExpression.StepExpressions;

            assert.equal(paths.length, 1);
            assert.equal(paths[0].axis, Axis.DescendantOrSelf);
            assert.equal(paths[0].nodeKindTestArgs.length, 2);
            assert.equal(paths[0].nodeKindTestArgs[0], '""');
            assert.equal(paths[0].nodeKindTestArgs[1], "xs:date");
        });

        it("//employee[age != 40]", () => {
            const pathExpression = xpath_parser("//employee[age != 40]");
            const paths = pathExpression.StepExpressions;

            assert.equal(paths.length, 1);

            const predicateList = paths[0].predicateList;

            assert.equal(predicateList.length, 1);

            const predicate = predicateList[0];

            assert.equal(predicate.value, "!=");
            assert.equal((predicate.left as BinaryOperation).value, "age");
            assert.equal((predicate.right as BinaryOperation).value, "40");
        });

        it("//employee[name = 'John Smith']", () => {
            const pathExpression = xpath_parser("//employee[name = 'John Smith']");
            const paths = pathExpression.StepExpressions;

            assert.equal(paths.length, 1);
            const predicateList = paths[0].predicateList;

            assert.equal(predicateList.length, 1);

            const predicate = predicateList[0];

            assert.equal(predicate.value, "=");
            assert.equal((predicate.left as BinaryOperation).value, "name");
            assert.equal((predicate.right as BinaryOperation).value, '"John Smith"');
        });

        it("//employee[../company = 'ms']", () => {
            const pathExpression = xpath_parser("//employee[../company = 'ms']");

            assert.equal(pathExpression.StepExpressions.length, 1);
        });

        it("//employee[../company = 'ms']", () => {
            const pathExpression = xpath_parser("//employee[{} = 'ms']");

            assert.equal(pathExpression.StepExpressions.length, 1);
        });
    });

    describe("Errors", () => {
        it("//employee[name = 'John Smith'", () => {
            assert.throws(() => {
                xpath_parser("//employee[name = 'John Smith'");
            }, Error);
        });

        it("invalid-axis::company", () => {
            assert.throws(() => {
                xpath_parser("invalid-axis::company");
            }, Error);
        });

        it("parent::invalidNodeKindFunctionTest()", () => {
            assert.throws(() => {
                xpath_parser("parent::invalidNodeKindFunctionTest()");
            }, Error);
        });

        it("//employee[age > 40", () => {
            assert.throws(() => {
                xpath_parser("//employee[age > 40");
            }, Error);
        });

        it("//employee[@", () => {
            assert.throws(() => {
                xpath_parser("//employee[@");
            }, Error);
        });

        it("//employee[@::", () => {
            assert.throws(() => {
                xpath_parser("//employee[@::");
            }, Error);
        });

        it("::", () => {
            assert.throws(() => {
                xpath_parser("::");
            }, Error);
        });

        it("@::", () => {
            assert.throws(() => {
                xpath_parser("@::");
            }, Error);
        });

        it("//book[]", () => {
            assert.throws(() => {
                xpath_parser("//book[]");
            }, Error);
        });

        it("$x := 'ms'", () => {
            assert.throws(() => {
                xpath_parser("$x := 'ms'");
            }, Error);
        });
    });
});
