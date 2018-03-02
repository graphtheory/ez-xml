import * as assert from "assert";

import { bookstore } from './files/bookstore';

describe("Example", () => {
    it("/comment()", () => {
        const commentQuery = bookstore.find("/comment()");

        assert.equal(commentQuery.length, 1);

        const comment = commentQuery[0];

        assert.equal(comment.value, "A tiny bookstore");
    });

    it("//book[last()]", () => {
        const book = bookstore.single("//book[last()]");
        const name = book.attr("name");
        const price = book.text("price");

        assert.equal(name, "XML for dummies");
        assert.equal(price, "50");
    });

    it("/bookstore/book[2]", () => {
        const book = bookstore.single("/bookstore/book[2]");
        const name = book.attr("name");
        const price = book.text("price");

        assert.equal(name, "Baby owners manual");
        assert.equal(price, "35");
    });

    it("/bookstore/book[(3 * 5 + 6) div 7 - 1]", () => {
        const book = bookstore.single("/bookstore/book[(3 * 5 + 6) div 7 - 1]");
        const name = book.attr("name");
        const price = book.text("price");

        assert.equal(name, "Baby owners manual");
        assert.equal(price, "35");
    });

    it("/bookstore/book[position() = 2]", () => {
        const book = bookstore.find("/bookstore/book[position() = 2]")[0];
        const name = book.attr("name");
        const price = book.text("price");

        assert.equal(name, "Baby owners manual");
        assert.equal(price, "35");
    });

    it("/bookstore/book[2 = position()]", () => {
        const book = bookstore.find("/bookstore/book[2 = position()]")[0];
        const name = book.attr("name");
        const price = book.text("price");

        assert.equal(name, "Baby owners manual");
        assert.equal(price, "35");
    });

    it("/bookstore/book[position() = 2 and 2 = position()]", () => {
        const book = bookstore.find("/bookstore/book[position() = 2]")[0];
        const name = book.attr("name");
        const price = book.text("price");

        assert.equal(name, "Baby owners manual");
        assert.equal(price, "35");
    });

    it("//book[2]", () => {
        const book = bookstore.find("//book[2]")[0];
        const name = book.attr("name");
        const price = book.text("price");

        assert.equal(name, "Baby owners manual");
        assert.equal(price, "35");
    });

    it("descendant-or-self::book[2]", () => {
        const book = bookstore.find("descendant-or-self::book[2]")[0];
        const name = book.attr("name");
        const price = book.text("price");

        assert.equal(name, "Baby owners manual");
        assert.equal(price, "35");
    });

    it("//book[position() > 1 and position < 3]", () => {
        const book = bookstore.find("//book[position() > 1 and position < 3]")[0];
        const name = book.attr("name");
        const price = book.text("price");

        assert.equal(name, "Baby owners manual");
        assert.equal(price, "35");
    });

    it("//book[@name and @isbn]", () => {
        const book = bookstore.single("//book[@name and @isbn]");
        const name = book.attr("name");
        const price = book.text("price");

        assert.equal(name, "Baby owners manual");
        assert.equal(price, "35");
    });

    it("//book[@name = 'Baby owners manual']", () => {
        const book = bookstore.find("//book[@name = 'Baby owners manual']")[0];
        const name = book.attr("name");
        const price = book.text("price");

        assert.equal(name, "Baby owners manual");
        assert.equal(price, "35");
    });

    it("//book['Baby owners manual' = @name]", () => {
        const book = bookstore.find("//book['Baby owners manual' = @name]")[0];
        const name = book.attr("name");
        const price = book.text("price");

        assert.equal(name, "Baby owners manual");
        assert.equal(price, "35");
    });

    it("//book[position() < 2 or position() > 2]", () => {
        const book = bookstore.find("//book[position() < 2 or position() > 2]");

        assert.equal(book.length, 3);
    });

    it("//book[price = 35]", () => {
        const book = bookstore.find("//book[price = 35]")[0];
        const name = book.attr("name");
        const price = book.text("price");

        assert.equal(name, "Baby owners manual");
        assert.equal(price, "35");
    });

    it("//book[price > 30 and price < 40]", () => {
        const book = bookstore.find("//book[price > 30 and price < 40]")[0];
        const name = book.attr("name");
        const price = book.text("price");

        assert.equal(name, "Baby owners manual");
        assert.equal(price, "35");
    });
});
