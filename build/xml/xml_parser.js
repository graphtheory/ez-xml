"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../common/utils");
const constants_1 = require("./constants");
const xml_node_1 = require("./xml_node");
const xml_result_1 = require("./xml_result");
class XMLParser {
    constructor() {
        this.documentRoot = new xml_node_1.XMLNode();
        this.currentNode = this.documentRoot;
        this.line = 0;
        this.column = 0;
        this.state = 5;
        this.sawRoot = false;
        this.closedRoot = false;
        this.rootName = "";
        this.tagName = "";
        this.comment = "";
        this.attributeName = "";
        this.attributeValue = "";
        this.quote = "";
        this.doctype = "";
        this.cdata = "";
        this.sgmlDecl = "";
        this.piTarget = "";
        this.piContent = "";
        this.textContent = "";
        this.entityBuffer = "";
        this.predefinedEntities = {
            quot: '"',
            amp: "&",
            apos: "'",
            lt: "<",
            gt: ">"
        };
        this.documentRoot.nodeType = 0;
    }
    isQuote(c) {
        return c === '"' || c === "'";
    }
    error(message) {
        throw new Error("(" + this.line + ", " + this.column + ") " + message);
    }
    newDocumentRoot() {
        const documentRoot = new xml_node_1.XMLNode();
        documentRoot.nodeType = 0;
        this.documentRoot = documentRoot;
        this.currentNode = documentRoot;
    }
    resetElement(selfClosing) {
        if (!selfClosing) {
            this.state = 24;
            this.tagName = "";
        }
        this.attributeName = "";
        this.attributeValue = "";
    }
    closeTag() {
        if (this.tagName !== this.currentNode.name) {
            this.error("The end-tag (" + this.tagName + ") doesn't match the start-tag (" + this.tagName + ").");
        }
        if (this.tagName === this.rootName) {
            this.closedRoot = true;
        }
        this.currentNode = this.currentNode.parentNode;
        this.tagName = this.attributeName = this.attributeValue = "";
        this.state = 24;
    }
    newElement() {
        let newElement = new xml_node_1.XMLNode();
        newElement.name = this.tagName;
        newElement.parentNode = this.currentNode;
        newElement.nodeType = 1;
        if (this.sawRoot === false) {
            this.sawRoot = true;
            this.rootName = this.tagName;
        }
        this.currentNode.children.push(newElement);
        this.currentNode = newElement;
    }
    newProcessingInstruction(piTarget, piContent) {
        const piContentTrimmed = piContent.trim();
        let pi = new xml_node_1.XMLNode();
        pi.name = piTarget;
        pi.value = piContentTrimmed;
        pi.nodeType = 5;
        pi.parentNode = this.currentNode;
        this.currentNode.children.push(pi);
        this.piTarget = "";
        this.piContent = "";
        this.state = 24;
    }
    newTextNode() {
        const textContent = this.textContent.trim();
        if (textContent === "") {
            return;
        }
        this.textContent = "";
        const textNode = new xml_node_1.XMLNode();
        textNode.nodeType = 7;
        textNode.value = textContent;
        textNode.parentNode = this.currentNode;
        this.currentNode.children.push(textNode);
    }
    newCommentNode(comment) {
        const commentTrimmed = comment.trim();
        const commentNode = new xml_node_1.XMLNode();
        commentNode.nodeType = 6;
        commentNode.value = commentTrimmed;
        commentNode.parentNode = this.currentNode;
        this.currentNode.children.push(commentNode);
    }
    addAttribute() {
        const newAttribute = new xml_node_1.XMLNode();
        newAttribute.nodeType = 2;
        newAttribute.name = this.attributeName;
        newAttribute.value = this.attributeValue;
        newAttribute.parentNode = this.currentNode;
        this.currentNode.attributes.push(newAttribute);
    }
    parse(str) {
        this.state = 5;
        this.tagName = "";
        this.comment = "";
        this.sawRoot = false;
        this.textContent = "";
        let i = 0;
        let c = "";
        while (true) {
            c = str.charAt(i++);
            if (!c) {
                break;
            }
            if (c === "\n") {
                this.line++;
                this.column = 0;
            }
            else {
                this.column++;
            }
            switch (this.state) {
                case 5:
                    if (c === "\uFEFF") {
                        continue;
                    }
                    if (c === "<") {
                        this.state = 22;
                    }
                    else if (!utils_1.isWhitespace(c)) {
                        this.error("Text content without element parent");
                    }
                    continue;
                case 11:
                    if (c === "-") {
                        this.state = 13;
                    }
                    else {
                        this.comment += c;
                    }
                    continue;
                case 13:
                    if (c === "-") {
                        this.state = 12;
                        this.newCommentNode(this.comment);
                        this.comment = "";
                    }
                    else {
                        this.comment += "-" + c;
                        this.state = 11;
                    }
                    continue;
                case 12:
                    if (c !== ">") {
                        this.error("Invalid comment format");
                    }
                    else {
                        this.state = 24;
                    }
                    continue;
                case 22:
                    if (c === "!") {
                        this.state = 21;
                        this.sgmlDecl = "";
                    }
                    else if (utils_1.isWhitespace(c)) {
                        this.error("Stag-tag contains space as a first character");
                    }
                    else if (constants_1.NameStartChar.test(c)) {
                        this.state = 23;
                        this.tagName = c;
                    }
                    else if (c === "/") {
                        this.state = 9;
                        this.tagName = "";
                    }
                    else if (c === "?") {
                        this.piTarget = "";
                        this.piContent = "";
                        this.state = 18;
                    }
                    else {
                        this.error("Unencoded <");
                    }
                    continue;
                case 23:
                    if (constants_1.NameChar.test(c)) {
                        this.tagName += c;
                    }
                    else if (c === ">") {
                        this.newElement();
                        this.resetElement(false);
                    }
                    else if (c === "/") {
                        this.newElement();
                        this.state = 17;
                    }
                    else if (utils_1.isWhitespace(c)) {
                        this.newElement();
                        this.state = 0;
                    }
                    else {
                        throw new Error("Invalid start-tag namechar");
                    }
                    continue;
                case 17:
                    if (c === ">") {
                        this.resetElement(true);
                        this.closeTag();
                    }
                    else {
                        this.error("Forward-slash in opening tag not followed by >");
                    }
                    continue;
                case 9:
                    if (!this.tagName) {
                        if (utils_1.isWhitespace(c)) {
                            this.error("A start tag needs to begin with a name");
                        }
                        else if (!constants_1.NameStartChar.test(c)) {
                            this.error("Invalid tagname in closing tag.");
                        }
                        else {
                            this.tagName = c;
                        }
                    }
                    else if (c === ">") {
                        this.closeTag();
                    }
                    else if (constants_1.NameChar.test(c)) {
                        this.tagName += c;
                    }
                    else if (!utils_1.isWhitespace(c)) {
                        this.error("End-tag contains invalid character (" + c + ")");
                    }
                    else {
                        this.state = 10;
                    }
                    continue;
                case 10:
                    if (utils_1.isWhitespace(c)) {
                        continue;
                    }
                    else if (c === ">") {
                        this.closeTag();
                    }
                    else {
                        this.error("Invalid characters in closing tag");
                    }
                    continue;
                case 24:
                    if (this.sawRoot && !this.closedRoot) {
                        var starti = i - 1;
                        while (c && c !== "<" && c !== "&") {
                            c = str[i++];
                            if (c) {
                                if (c === "\n") {
                                    this.line++;
                                    this.column = 0;
                                }
                                else {
                                    this.column++;
                                }
                            }
                            else {
                                this.error("Unexpected end of input");
                            }
                        }
                        this.textContent += str.substring(starti, i - 1);
                        this.newTextNode();
                    }
                    if (c === "<" && !(this.sawRoot && this.closedRoot)) {
                        this.state = 22;
                        continue;
                    }
                    else {
                        if (!utils_1.isWhitespace(c) && (!this.sawRoot || this.closedRoot)) {
                            this.error("Content after root node.");
                        }
                        if (c === "&") {
                            this.entityBuffer = "";
                            this.state = 25;
                        }
                        else {
                            this.textContent += c;
                        }
                    }
                    continue;
                case 0:
                    if (utils_1.isWhitespace(c)) {
                        continue;
                    }
                    else if (c === ">") {
                        this.resetElement(false);
                    }
                    else if (c === "/") {
                        this.state = 17;
                    }
                    else if (constants_1.NameStartChar.test(c)) {
                        this.attributeName = c;
                        this.attributeValue = "";
                        this.state = 1;
                    }
                    else {
                        this.error("Invalid attribute name");
                    }
                    continue;
                case 1:
                    if (c === "=") {
                        this.state = 2;
                    }
                    else if (c === ">") {
                        this.error("Attribute without value");
                    }
                    else if (utils_1.isWhitespace(c)) {
                        continue;
                    }
                    else if (constants_1.NameChar.test(c)) {
                        this.attributeName += c;
                    }
                    else {
                        this.error("Invalid attribute name");
                    }
                    continue;
                case 2:
                    if (utils_1.isWhitespace(c)) {
                        continue;
                    }
                    else if (c === '"' || c === "'") {
                        this.quote = c;
                        this.state = 4;
                    }
                    else {
                        this.error("Unquoted attribute value");
                    }
                    continue;
                case 4:
                    if (c !== this.quote) {
                        this.attributeValue += c;
                        continue;
                    }
                    this.addAttribute();
                    this.quote = "";
                    this.state = 3;
                    continue;
                case 3:
                    if (utils_1.isWhitespace(c)) {
                        this.state = 0;
                    }
                    else if (c === ">") {
                        this.resetElement(false);
                    }
                    else if (c === "/") {
                        this.state = 17;
                    }
                    else if (constants_1.NameStartChar.test(c)) {
                        this.error("No whitespace between attributes");
                    }
                    else {
                        this.error("Invalid attribute name");
                    }
                    continue;
                case 18:
                    if (c === "?" && this.piTarget === "") {
                        this.error("Missing processing instruction target");
                    }
                    else if (utils_1.isWhitespace(c) && this.piTarget === "xml") {
                        this.newDocumentRoot();
                        this.state = 27;
                    }
                    else if (utils_1.isWhitespace(c) && this.piTarget !== "") {
                        this.state = 19;
                    }
                    else if (utils_1.isWhitespace(c)) {
                        continue;
                    }
                    else {
                        this.piTarget += c;
                    }
                    continue;
                case 19:
                    if (!this.piContent && utils_1.isWhitespace(c)) {
                        continue;
                    }
                    else if (c === "?") {
                        this.state = 20;
                    }
                    else {
                        this.piContent += c;
                    }
                    continue;
                case 20:
                    if (c === ">") {
                        this.newProcessingInstruction(this.piTarget, this.piContent);
                    }
                    else {
                        this.piContent += "?" + c;
                        this.state = 19;
                    }
                    continue;
                case 27:
                    if (c === "?") {
                        this.state = 31;
                    }
                    else if (utils_1.isWhitespace(c)) {
                        continue;
                    }
                    else if (constants_1.NameStartChar.test(c)) {
                        this.attributeName = c;
                        this.state = 28;
                    }
                    else {
                        this.error("Invalid attribute name");
                    }
                    continue;
                case 28:
                    if (c === "=") {
                        this.state = 29;
                    }
                    else if (c === "?" || c === ">") {
                        this.error("Attribute without value");
                    }
                    else if (utils_1.isWhitespace(c)) {
                        continue;
                    }
                    else if (constants_1.NameChar.test(c)) {
                        this.attributeName += c;
                    }
                    else {
                        this.error("Invalid attribute name");
                    }
                    continue;
                case 29:
                    if (this.isQuote(c)) {
                        this.quote = c;
                        this.state = 30;
                        this.attributeValue = "";
                    }
                    else if (c === ">" || c === "?") {
                        this.error("Attribute without value");
                    }
                    else if (utils_1.isWhitespace(c)) {
                        continue;
                    }
                    else {
                        this.error("Invalid attribute name");
                    }
                    continue;
                case 30:
                    if (c === this.quote) {
                        const newRootAttribute = new xml_node_1.XMLNode();
                        newRootAttribute.nodeType = 2;
                        newRootAttribute.name = this.attributeName;
                        newRootAttribute.value = this.attributeValue;
                        this.documentRoot.attributes.push(newRootAttribute);
                        this.state = 27;
                    }
                    else {
                        this.attributeValue += c;
                    }
                    continue;
                case 31:
                    if (c === ">") {
                        this.state = 24;
                    }
                    else {
                        this.error("Invalid XML prolog ending");
                    }
                    continue;
                case 21:
                    if ((this.sgmlDecl + c).toUpperCase() === "[CDATA[") {
                        this.state = 6;
                        this.sgmlDecl = "";
                        this.cdata = "";
                    }
                    else if (this.sgmlDecl + c === "--") {
                        this.state = 11;
                        this.comment = "";
                        this.sgmlDecl = "";
                    }
                    else if ((this.sgmlDecl + c).toUpperCase() === "DOCTYPE") {
                        this.state = 14;
                    }
                    else {
                        this.sgmlDecl += c;
                    }
                    continue;
                case 14:
                    if (c === ">") {
                        this.state = 24;
                    }
                    else {
                        this.doctype += c;
                        if (c === "[") {
                            this.state = 15;
                        }
                        else if (this.isQuote(c)) {
                            this.state = 16;
                            this.quote = c;
                        }
                    }
                    continue;
                case 16:
                    this.doctype += c;
                    if (c === this.quote) {
                        this.quote = "";
                        this.state = 14;
                    }
                    continue;
                case 15:
                    this.doctype += c;
                    if (c === "]") {
                        this.state = 14;
                    }
                    continue;
                case 6:
                    if (c === "]") {
                        this.state = 7;
                    }
                    else {
                        this.cdata += c;
                    }
                    continue;
                case 7:
                    if (c === "]") {
                        this.state = 8;
                    }
                    else {
                        this.cdata += "]" + c;
                        this.state = 6;
                    }
                    continue;
                case 8:
                    if (c === ">") {
                        this.textContent = this.cdata;
                        this.newTextNode();
                        this.cdata = "";
                        this.state = 24;
                    }
                    else if (c === "]" && (str.charAt(i) == ">" || str.charAt(i) == "]")) {
                        this.cdata += ']';
                    }
                    else {
                        this.cdata += "]]" + c;
                        this.state = 6;
                    }
                    continue;
                case 25:
                    if (constants_1.NameStartChar.test(c)) {
                        this.entityBuffer = c;
                        this.state = 26;
                    }
                    else {
                        this.error("Invalid entity start char (" + c + ")");
                    }
                    continue;
                case 26:
                    if (c === ";") {
                        if (this.predefinedEntities[this.entityBuffer]) {
                            this.textContent += this.predefinedEntities[this.entityBuffer];
                        }
                        else {
                            this.textContent += "&" + this.entityBuffer + ";";
                        }
                        this.state = 24;
                    }
                    else if (constants_1.NameChar.test(c)) {
                        this.entityBuffer += c;
                    }
                    else {
                        this.error("Invalid name character (" + c + ")");
                    }
                    continue;
            }
        }
        switch (this.state) {
            case 27:
            case 28:
            case 29:
            case 30:
                this.error("Invalid root node");
        }
        return new xml_result_1.XMLResult(this.documentRoot, this.doctype.trim());
    }
}
exports.XMLParser = XMLParser;
//# sourceMappingURL=xml_parser.js.map