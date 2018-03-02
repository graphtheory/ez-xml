# Architecture

This project does two things, XML and XPath. 

## Goals

* Parse XML 1.1 documents into a DOM according to the W3 specification
* Support XPath 3.0 query statements on the structure

## XPath

Process `tokenizer` -> `parser` -> `Abstract Syntax Tree`, e.g. the frontend of a compiler. 

## XML

### Parsing process

`parser` -> `result`

### Query process

`xpath` -> `traversal`
