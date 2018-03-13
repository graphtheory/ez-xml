# EZ-XML


![Travis](https://img.shields.io/travis/graphtheory/ez-xml.svg)
[![Coverage Status](https://coveralls.io/repos/github/graphtheory/ez-xml/badge.svg?branch=master)](https://coveralls.io/github/graphtheory/ez-xml?branch=master)
![npm](https://img.shields.io/npm/v/ez-xml.svg)
![npm](https://img.shields.io/npm/l/ez-xml.svg)


EZ-XML is a XML library that allows you to easily extract information from XML documents with XPath expressions.

[![NPM](https://nodei.co/npm/ez-xml.png?compact=true)](https://nodei.co/npm/ez-xml/)

## Docs

* [API Reference](https://github.com/graphtheory/ez-xml/blob/master/docs/API.md)
* [Contributing](https://github.com/graphtheory/ez-xml/blob/master/docs/CONTRIBUTING.md)

## Installation

EZ-XML is available as the `ez-xml` package on npm. Simply install it with

```shell
npm i ez-xml
```

## Examples

You can find the following examples as a test [here](https://github.com/graphtheory/ez-xml/blob/master/src/test/example.test.ts). Given the following XML 1.0 document

```xml
<!-- This is my collection of books -->
<library>
    <book name="Lifters guide to the galaxy">
        <price>42</price>
    </book>
    <book name="Baby owners manual" isbn="123">
        <price>35</price>
    </book>
    <book name="Wheel of time: The eye of the world">
        <price>50</price>
    </book>
</library>
```

### Parsing a document

```javascript
import {parse} from "ez-xml";

const doc = parse(`<library>...</library>`);
```

Getting the comment:

```javascript
const comment = doc.find("/comment()")[0]; // This is my collection of books
```

Finding the second book in a few different ways (quite many ways of doing the same thing in XPath)

```javascript
const book = doc.single("//book[last()]");
book.attr("name"); // Wheel of time: The eye of the world
book.text("price"); // 50
```

`//` is an abbrevation for traversing on the descendant-or-self axis. With XPath there are an infinite way of combinations for achieving the same result. For example, getting the third book can be achieved by this as well

```javascript
doc.single("//book[3]") // NB: XPath starts counting from 1 instead of 0
```

Which is equivalent to 

```javascript
doc.single("/bookstore/book[(3 * 5 + 6) div 7]");
```

Finding a book by it's attribute

```javascript
doc.find("//book[@name = 'Baby owners manual']/..");
```

Or by its price

```javascript
doc.find("//book[price = 35]");
```

You can also combine predicates like

```javascript
doc.find("//book[price > 30 and price < 40]");
```

Or searching for nodes that has certain attributes

```javascript
doc.find("//book[@name and @isbn]");
```

Or finding all the books that has a position() greater than 2

```javascript
doc.find("//book[position() > 2]");
```

And a lot of other fun combinations. 

## Licensing

ez-xml is released under the [MIT license](https://github.com/graphtheory/ez-xml/blob/master/LICENSE). See the LICENSE file for additional details.
