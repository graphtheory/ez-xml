import * as assert from "assert";

import { parse } from "..";
import { NodeType } from "../xml/constants";

describe("XMLParser", () => {
    describe("Begin", () => {
        it("Byte Order Mark", () => {
            const parsed = parse(`\uFEFF<root />`);
            const result = parsed.find("//root");

            assert.equal(result.length, 1);
        });

        it("Content without element", () => {
            assert.throws(() => {
                parse(`This is some content`);
            }, Error);
        });

        it("Space before first element", () => {
            const parsed = parse(` <root />`);
            const result = parsed.find("//root");

            assert.equal(result.length, 1);
        });
    });

    describe("Comments", () => {
        it("Valid comment", () => {
            const parsed = parse(`<!--A - B--><root />`);
            const result = parsed.find("/comment()");

            assert.equal(result.length, 1);
        });

        it("Invalid comment", () => {
            assert.throws(() => {
                parse(`<!-- B+, B, or B--->`);
            }, Error);
        });
    });

    // STag ::= '<' Name (S Attribute)* S? '>'
    describe("Start-tag", () => {
        it("Space before start character", () => {
            assert.throws(() => {
                parse(`< root></root>`);
            }, Error);
        });

        it("Invalid start character", () => {
            assert.throws(() => {
                parse(`<<root></root>`);
            }, Error);
        });

        it("Invalid name character", () => {
            assert.throws(() => {
                parse(`<ro<ot />`);
            }, Error);
        });
    });

    // ETag ::= '</' Name S? '>'
    describe("End-tag", () => {
        it("Space after", () => {
            const doc = parse(`<root></root   >`);

            assert.equal(doc.rootNode.nodeType, NodeType.DOCUMENT_NODE);
            assert.equal(doc.rootNode.children[0].nodeType, NodeType.ELEMENT);
            assert.equal(doc.rootNode.children[0].name, "root");
        });

        it("Space before", () => {
            assert.throws(() => {
                parse(`<root></ root>`);
            }, Error);
        });

        it("Empty closing", () => {
            assert.throws(() => {
                parse(`<root></>`);
            }, Error);
        });

        it("Doesn't match", () => {
            assert.throws(() => {
                parse(`<root></root2>`);
            }, Error);
        });

        it("Invalid characters in closing", () => {
            assert.throws(() => {
                parse(`<root></root foo="bar">`);
            }, Error);
        });

        it("Invalid characters in closing (2)", () => {
            assert.throws(() => {
                parse(`<root></root<>`);
            }, Error);
        });
    });

    // EmptyElemTag ::= '<' Name (S Attribute)* S? '/>'
    describe("Empty-element", () => {
        it("Valid", () => {
            const parsed = parse(`<root />`);
            const result = parsed.find("/root");

            assert.equal(result.length, 1);
        });
        it("Valid", () => {
            const parsed = parse(`<root/>`);
            const result = parsed.find("/root");

            assert.equal(result.length, 1);
        });

        it("Space before /", () => {
            assert.throws(() => {
                parse(`< root />`);
            }, Error);
        });

        it("Space after /", () => {
            assert.throws(() => {
                parse(`<root / >`);
            }, Error);
        });
    });

    describe("Text", () => {
        it("Content after root", () => {
            assert.throws(() => {
                parse(`<root></root>Some more text..`);
            }, Error);
        });

        it("Unexpected end", () => {
            assert.throws(() => {
                parse(`<root>Roses are red`);
            }, Error);
        });

        it("Multiline text", () => {
            parse(`
                <root>
                    Roses are red,
                    Violets are
                </root>`);
        });
    });

    describe("Attribute", () => {
        it("Valid", () => {
            const parsed = parse(`<root foo="bar"></root>`);
            const result = parsed.find("/root/@foo");

            assert.equal(result.length, 1);
            assert.equal(result[0].value, "bar");
        });

        it("With whitespace", () => {
            const parsed = parse(`<root  foo  =  "bar" ></root>`);
            const result = parsed.find("/root/@foo");

            assert.equal(result.length, 1);
            assert.equal(result[0].value, "bar");
        });

        it("Invalid attribute name (<root foo>)", () => {
            assert.throws(() => {
                parse(`<root foo>`);
            }, Error);
        });

        it('Invalid attribute name (<root <foo="bar">)', () => {
            assert.throws(() => {
                parse(`<root <foo="bar">`);
            }, Error);
        });

        it('Invalid attribute name (<root f<oo="bar">)', () => {
            assert.throws(() => {
                parse(`<root f<oo="bar">`);
            }, Error);
        });

        it("Invalid second attribute name", () => {
            assert.throws(() => {
                parse(`<root foo="bar"<foo2="bar2">`);
            }, Error);
        });

        it("Unquoted attribute value", () => {
            assert.throws(() => {
                parse(`<root foo=bar>`);
            }, Error);
        });

        it("Attributes without space", () => {
            assert.throws(() => {
                parse(`<root foo="bar"foo2="bar2">`);
            }, Error);
        });

        it("Attributes without space", () => {
            assert.throws(() => {
                parse(`<root foo="bar"foo2="bar2">`);
            }, Error);
        });

        it("Empty element attribute", () => {
            const parsed = parse(`<?xml version="1.0" encoding="utf-8"?><root foo="bar"/>`);

            const result = parsed.find("/root/@foo");

            assert.equal(result.length, 1);
            assert.equal(result[0].value, "bar");
        });
    });

    describe("Processing Instruction", () => {
        it("Valid", () => {
            const parsed = parse(`<?xml version="1.0" encoding="utf-8"?>
            <?xml-stylesheet href="mystyle.css" type="text/css"?>
            <root></root>`);

            const result = parsed.find("/processing-instruction()");

            assert.equal(result.length, 1);
            assert.equal(result[0].name, "xml-stylesheet");
            assert.equal(result[0].value, `href="mystyle.css" type="text/css"`);
        });

        it("Space", () => {
            const parsed = parse(`<?xml version="1.0" encoding="utf-8"?>
            <?xml-stylesheet  href="mystyle.css" type="text/css"  ?>
            <root></root>`);

            const result = parsed.find("/processing-instruction()");

            assert.equal(result.length, 1);
            assert.equal(result[0].name, "xml-stylesheet");
            assert.equal(result[0].value, `href="mystyle.css" type="text/css"`);
        });

        it("With ?", () => {
            const parsed = parse(`<?xml version="1.0" encoding="utf-8"?>
            <?xml-stylesheet href="mystyle?.css" type="text/css"  ?>
            <root></root>`);

            const result = parsed.find("/processing-instruction()");

            assert.equal(result.length, 1);
            assert.equal(result[0].name, "xml-stylesheet");
        });

        it("No processing instruction target", () => {
            assert.throws(() => {
                parse(`<?xml version="1.0" encoding="utf-8"?>
                <?  ?>
                <root></root>`);
            });
        });
    });

    describe("XML Prolog", () => {
        it("Invalid XML prolog (1)", () => {
            assert.throws(() => {
                parse(`<?xml version="1.0" encoding=?>`);
            }, Error);
        });

        it("Invalid XML prolog (2)", () => {
            assert.throws(() => {
                parse(`<?xml version="1.0" encoding = "`);
            }, Error);
        });

        it("Invalid XML prolog (3)", () => {
            assert.throws(() => {
                parse(`<?xml version="1.0" encoding=`);
            }, Error);
        });

        it("Invalid XML prolog (4)", () => {
            assert.throws(() => {
                parse(`<?xml version="1.0" encoding`);
            }, Error);
        });

        it("Invalid XML prolog (5)", () => {
            assert.throws(() => {
                parse(`<?xml version="1.0"`);
            }, Error);
        });

        it("Invalid XML prolog (6)", () => {
            assert.throws(() => {
                parse(`<?xml `);
            }, Error);
        });

        it("Invalid XML prolog (6)", () => {
            assert.throws(() => {
                parse(`<?xml -version="1.0"?>`);
            }, Error);
        });

        it("Invalid XML prolog (6)", () => {
            assert.throws(() => {
                parse(`<?xml version=?>`);
            }, Error);
        });

        it("Invalid XML prolog (6)", () => {
            assert.throws(() => {
                parse(`<?xml version = ape>`);
            }, Error);
        });

        it("Invalid XML prolog (7)", () => {
            assert.throws(() => {
                parse(`<?xml version ?>`);
            }, Error);
        });

        it("Invalid XML prolog (7)", () => {
            assert.throws(() => {
                parse(`<?xml v<ersion?>`);
            }, Error);
        });

        it("inv", () => {
            assert.throws(() => {
                parse(`<?xml version="1.0" encoding="utf-8"? >`);
            });
        });
    });

    describe("CDATA", () => {
        it("Parsers correctly", () => {
            const parsed = parse(
                `<?xml version="1.0" encoding="utf-8"?><root><![CDATA[<sender>John Smith</sender>]]></root>`
            );
            const result = parsed.find("//root/text()");

            assert.equal(result.length, 1);
            assert.equal(result[0].value, "<sender>John Smith</sender>");
        });

        it("Avoids exit before", () => {
            const parsed = parse(`<?xml version="1.0" encoding="utf-8"?><root><![CDATA[John]Smith]]Senior]]></root>`);
            const result = parsed.find("//root/text()");

            assert.equal(result.length, 1);
            assert.equal(result[0].value, "John]Smith]]Senior");
        });
    });

    describe("DTD", () => {
        it("External DTD", () => {
            const result = parse(`
            <?xml version="1.1"?>
            <!DOCTYPE greeting SYSTEM "hello.dtd">
            <greeting>Hello, world!</greeting>`);

            assert.equal(result.DTD, `greeting SYSTEM "hello.dtd"`);
        });

        it("Local DTD", () => {
            const result = parse(`
            <?xml version="1.1"?>
            <!DOCTYPE greeting [
                <!ELEMENT greeting (#PCDATA)>
            ]>
            <greeting>Hello, world!</greeting>`);

            assert.notEqual(result.DTD, "");
        });

        it("After root element", () => {
            assert.throws(() => {
                parse(`<?xml version="1.1"?>
                <greeting>Hello, world!</greeting>
                <!DOCTYPE greeting SYSTEM "hello.dtd">`);
            });
        });
    });

    describe("Entities", () => {
        it("Handles built in entities", () => {
            const result = parse(`<?xml version="1.1"?>
                <greeting>
                    <quot>&quot;</quot>
                    <amp>&amp;</amp>
                    <apos>&apos;</apos>
                    <lt>&lt;</lt>
                    <gt>&gt;</gt>
                </greeting>
            `);
            const quot = result.find("/greeting/quot/text()");
            const amp = result.find("/greeting/amp/text()");
            const apos = result.find("/greeting/apos/text()");
            const lt = result.find("/greeting/lt/text()");
            const gt = result.find("/greeting/gt/text()");

            assert.equal(quot.length, 1);
            assert.equal(amp.length, 1);
            assert.equal(apos.length, 1);
            assert.equal(lt.length, 1);
            assert.equal(gt.length, 1);

            assert.equal(quot[0].value, '"');
            assert.equal(amp[0].value, "&");
            assert.equal(apos[0].value, "'");
            assert.equal(lt[0].value, "<");
            assert.equal(gt[0].value, ">");
        });

        it("Bad startchar", () => {
            assert.throws(() => {
                parse(`<?xml version="1.1"?>
                    <greeting>&<invalidRef;</greeting>
                `);
            }, Error);
        });

        it("Bad namechar", () => {
            assert.throws(() => {
                parse(`<?xml version="1.1"?>
                    <greeting>&i<nvalidRef;</greeting>
                `);
            }, Error);
        });

        it("Handles not found entities", () => {
            const result = parse(`<?xml version="1.1"?>
                <greeting>&notfound;</greeting>
            `);
            const text = result.find("/greeting/text()");

            assert.equal(text.length, 1);
            assert.equal(text[0].value, "&notfound;");
        });
    });
});
