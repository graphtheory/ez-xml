import * as assert from 'assert';

import { NodeType } from '../xml/constants';
import { XMLNode } from '../xml/xml_node';
import { bookstore } from './files/bookstore';
import { company } from './files/company';

describe("XMLNode", () => {
    describe("Predicates", () => {
        it("//employee[name = 'John Smith']", () => {
            const result = company.find("//employee[name = 'John Smith']");
    
            assert.equal(result.length, 1);
            assert.equal(result[0].name, "employee");
        });
    
        it("//employee[age > 40]", () => {
            const result = company.find("//employee[age > 40]");
    
            assert.equal(result.length, 1);
            assert.equal(result[0].name, "employee");
        });
    
        it("//employee[age > 35 and age < 40]", () => {
            const result = company.find("//employee[age > 35 and age < 40]");
    
            assert.equal(result.length, 1);
        });
    
        it("//employee[age <= 40 and age >= 35]", () => {
            const result = company.find("//employee[age <= 40 and age >= 35]");
    
            assert.equal(result.length, 1);
        });
    
        it("//employee[age = 37]", () => {
            const result = company.find("//employee[age = 37]");
    
            assert.equal(result.length, 1);
        });
        it("//employee[age != 37]", () => {
            const result = company.find("//employee[age != 37]");
    
            assert.equal(result.length, 2);
        });
    
        it("/company/office[1 + 2 - 1]", () => {
            const result = company.find("/company/office[1 + 2 - 1]");
            const location = result[0].attributes.find(a => a.name === "location") as XMLNode;
    
            assert.equal(result.length, 1);
            assert.equal(result[0].nodeType, NodeType.ELEMENT);
            assert.notEqual(typeof location, "undefined");
            assert.equal(location.value, "Vienna");
        });

        it("//office[54]", () => {
            const offices = company.find("//office[54]");
            assert.equal(offices.length, 0);
        });

        it("//office[54]", () => {
            const books = bookstore.find("//book[@isbn]");
            assert.equal(books.length, 1);
        });


        it("/company/office[@location = 'Boston']", () => {
            const result = company.find("/company/office[@location = 'Boston']");
            const dummy = result[0].attr("undef");
    
            assert.equal(result.length, 1);
            assert.equal(dummy, undefined);
        });
    
        it("/company/office[position() = 0]", () => {
            const result = company.find("/company/office[position() = 0]");
    
            assert.equal(result.length, 0);
        });
    
        it("/company/office[position() = 54]", () => {
            const result = company.find("/company/office[position() = 54]");
    
            assert.equal(result.length, 0);
        });

        it("/company/office[position() = 2]", () => {
            const result = company.find("/company/office[2]");
            const location = result[0].attributes.find(a => a.name === "location") as XMLNode;
    
            assert.equal(result.length, 1);
            assert.equal(result[0].nodeType, NodeType.ELEMENT);
            assert.notEqual(typeof location, "undefined");
            assert.equal(location.value, "Vienna");
        });    
    });

    describe("Node tests", () => {
        it("/comment()", () => {
            const result = company.find("/comment()");
    
            assert.equal(result.length, 1);
            assert.equal(result[0].nodeType, NodeType.COMMENT);
            assert.equal(result[0].value, "This is awesome");
        });
    });

    describe("Absolute path queries", () => {
        it("/", () => {
            const result = company.find("/");
    
            assert.equal(result.length, 1);
            assert.equal(result[0].nodeType, NodeType.DOCUMENT_NODE);
            assert.equal(result[0].parentNode, null);
        });

        it("/company", () => {
            const result = company.find("/company");
    
            assert.equal(result.length, 1);
            assert.equal(result[0].nodeType, NodeType.ELEMENT);
            assert.equal(result[0].name, "company");
        });
    
        it("/company/office", () => {
            const result = company.find("/company/office");
    
            assert.equal(result.length, 3);
            assert.equal(result[0].nodeType, NodeType.ELEMENT);
            assert.equal(result[0].name, "office");
        });
    
        it("/company/office/@location", () => {
            const result = company.find("/company/office/@location");
    
            assert.equal(result.length, 3);
            assert.equal(result[0].value, "Boston");
            assert.equal(result[1].value, "Vienna");
            assert.equal(result[2].value, "Stockholm");
        });
    });


    describe("Axis queries", () => {
        it("ancestor::office", () => {
            const employee = company.find("//employee[name = 'John Smith']");
            const result = employee[0].find("ancestor::office");
    
            assert.equal(result.length, 1);
            assert.equal(result[0].name, "office");
        });
    
        it("ancestor-or-self::office", () => {
            const employee = company.find("//employee[name = 'John Smith']");
            const result = employee[0].find("ancestor-or-self::office");
    
            assert.equal(result.length, 1);
            assert.equal(result[0].name, "office");
        });
    
        it("descendant::office", () => {
            const result = company.find("descendant::office");
    
            assert.equal(result.length, 3);
        });
    
        it("preceding::office", () => {
            const vienna = company.find("//office");
    
            assert.equal(vienna.length, 3);
    
            const boston = vienna[1].find("preceding::office");
    
            assert.equal(boston.length, 1);
    
            const location = boston[0].find("self::@location");
    
            assert.equal(location.length, 1);
            assert.equal(location[0].value, "Boston");
        });
    
        it("preceding-sibling::office", () => {
            const vienna = company.find("//office");
    
            assert.equal(vienna.length, 3);
    
            const boston = vienna[1].find("preceding-sibling::office");
    
            assert.equal(boston.length, 1);
    
            const location = boston[0].find("self::@location");
    
            assert.equal(location.length, 1);
            assert.equal(location[0].value, "Boston");
        });
    
        it("following-sibling::office", () => {
            const vienna = company.find("//office");
    
            assert.equal(vienna.length, 3);
    
            const boston = vienna[1].find("following-sibling::office");
    
            assert.equal(boston.length, 1);
    
            const location = boston[0].find("self::@location");
    
            assert.equal(location.length, 1);
            assert.equal(location[0].value, "Stockholm");
        });
    
        it("following::office", () => {
            const vienna = company.find("//office");
    
            assert.equal(vienna.length, 3);
    
            const boston = vienna[1].find("following::office");
    
            assert.equal(boston.length, 1);
    
            const location = boston[0].find("self::@location");
    
            assert.equal(location.length, 1);
            assert.equal(location[0].value, "Stockholm");
        });
    
        it("following-sibling::office - last", () => {
            const office = company.find("//office");
    
            assert.equal(office.length, 3);
    
            const lastOffice = office[2].find("following-sibling::office");
    
            assert.equal(lastOffice.length, 0);
        });
    
        it("preceding-sibling::office - first", () => {
            const office = company.find("//office");
    
            assert.equal(office.length, 3);
    
            const lastOffice = office[0].find("preceding-sibling::office");
    
            assert.equal(lastOffice.length, 0);
        });
    
        it("parent::office - first", () => {
            const office = company.find("//office");
    
            assert.equal(office.length, 3);
    
            const el = office[0].find("parent::element()");
    
            assert.equal(el.length, 1);
            assert.equal(el[0].name, "company");
        });
    
        it("parent on root element", () => {
            const office = company.find("/");
    
            assert.equal(office.length, 1);
    
            const aboveRoot = office[0].find("..");
    
            assert.equal(aboveRoot.length, 0);
        });
    
        it("preceding on root element", () => {
            const office = company.find("/");
    
            assert.equal(office.length, 1);
    
            const aboveRoot = office[0].find("preceding::document-node()");
    
            assert.equal(aboveRoot.length, 0);
        });
    });


    describe("Text queries", () => {
        it("Without query", () => {
            const price = bookstore.single("//book[@name = 'XML for dummies']/price");

            assert.equal(price.text(), "50");
        });

        it("With query", () => {
            const book = bookstore.single("//book[@name = 'XML for dummies']");

            assert.equal(book.text("price"), "50");
        });
    });

    // Most of these should be errors from the xpath parser
    describe("Invalid queries", () => {
        it("Empty union", () => {
            const books = bookstore.find("//book[ and ]");
            assert.equal(books.length, 0);
        });

        it("Empty intersection", () => {
            const books = bookstore.find("//book[ or ]");
            assert.equal(books.length, 0);
        });

        it("Union between [] and ![]", () => {
            const books = bookstore.find("//book[2 and position()]");
            assert.equal(books.length, 0);
        });

        it("Intersection between [] and ![]", () => {
            const books = bookstore.find("//book[2 or position()]");
            assert.equal(books.length, 0);
        });

        it("Union between number[] and string[]", () => {
            const books = bookstore.find("//book[position() and @name]");
            assert.equal(books.length, 0);
        });

        it("Intersection between number[] and string[]", () => {
            const books = bookstore.find("//book[position() or @name]");
            assert.equal(books.length, 0);
        });
        
        it("self::price", () => {
            const books = bookstore.find("//book/self::price");

            assert.equal(books.length, 0);
        });

        it("Missing comparission argument", () => {
            const books = bookstore.find("//book[position = ]");
            assert.equal(books.length, 0);
        });

        it("Predicate literal", () => {
            const books = bookstore.find("//book['bad']");
            assert.equal(books.length, 0);
        });

        it("Empty node equal to string", () => {
            const books = bookstore.find("//book[badnode = 'bad']");
            assert.equal(books.length, 0);
        });
    });
});
