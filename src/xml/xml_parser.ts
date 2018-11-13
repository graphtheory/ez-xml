import { Dictionary } from "../common/interfaces";
import { isWhitespace } from "../common/utils";
import { NodeType, NameChar, NameStartChar, ParserState } from "./constants";
import { XMLNode } from "./xml_node";
import { XMLResult } from "./xml_result";

export class XMLParser {
    private documentRoot = new XMLNode();
    private currentNode = this.documentRoot;
    public line = 0;
    public column = 0;
    private state = ParserState.BEGIN;
    private sawRoot = false;
    private closedRoot = false;
    private rootName = "";
    private tagName = "";
    private comment = "";
    private attributeName = "";
    private attributeValue = "";
    private quote = "";
    private doctype = "";
    private cdata = "";
    private sgmlDecl = "";
    private piTarget = "";
    private piContent = "";
    private textContent = "";
    private entityBuffer = "";

    private readonly predefinedEntities: Dictionary<string> = {
        quot: '"',
        amp: "&",
        apos: "'",
        lt: "<",
        gt: ">"
    };

    constructor() {
        this.documentRoot.nodeType = NodeType.DOCUMENT_NODE;
    }

    private isQuote(c: string) {
        return c === '"' || c === "'";
    }

    private error(message: string) {
        throw new Error("(" + this.line + ", " + this.column + ") " + message);
    }

    private newDocumentRoot() {
        const documentRoot = new XMLNode();
        documentRoot.nodeType = NodeType.DOCUMENT_NODE;

        this.documentRoot = documentRoot;
        this.currentNode = documentRoot;
    }

    private resetElement(selfClosing: boolean) {
        if (!selfClosing) {
            this.state = ParserState.TEXT;
            this.tagName = "";
        }

        this.attributeName = "";
        this.attributeValue = "";
    }

    private closeTag() {
        if (this.tagName !== this.currentNode.name) {
            this.error("The end-tag (" + this.tagName + ") doesn't match the start-tag (" + this.tagName + ").");
        }

        if (this.tagName === this.rootName) {
            this.closedRoot = true;
        }

        this.currentNode = this.currentNode.parentNode as XMLNode;
        this.tagName = this.attributeName = this.attributeValue = "";
        this.state = ParserState.TEXT;
    }

    private newElement() {
        let newElement = new XMLNode();
        newElement.name = this.tagName;
        newElement.parentNode = this.currentNode;
        newElement.nodeType = NodeType.ELEMENT;

        if (this.sawRoot === false) {
            this.sawRoot = true;
            this.rootName = this.tagName;
        }

        this.currentNode.children.push(newElement);
        this.currentNode = newElement;
    }

    private newProcessingInstruction(piTarget: string, piContent: string) {
        const piContentTrimmed = piContent.trim();
        let pi = new XMLNode();
        pi.name = piTarget;
        pi.value = piContentTrimmed;
        pi.nodeType = NodeType.PROCESSING_INSTRUCTION;
        pi.parentNode = this.currentNode;

        this.currentNode.children.push(pi);

        this.piTarget = "";
        this.piContent = "";
        this.state = ParserState.TEXT;
    }

    private newTextNode() {
        const textContent = this.textContent.trim();

        if (textContent === "") {
            return;
        }

        this.textContent = "";

        const textNode = new XMLNode();

        textNode.nodeType = NodeType.TEXT;
        textNode.value = textContent;
        textNode.parentNode = this.currentNode;

        this.currentNode.children.push(textNode);
    }

    private newCommentNode(comment: string) {
        const commentTrimmed = comment.trim();
        const commentNode = new XMLNode();
        commentNode.nodeType = NodeType.COMMENT;
        commentNode.value = commentTrimmed;
        commentNode.parentNode = this.currentNode;

        this.currentNode.children.push(commentNode);
    }

    private addAttribute() {
        const newAttribute = new XMLNode();
        newAttribute.nodeType = NodeType.ATTRIBUTE;
        newAttribute.name = this.attributeName;
        newAttribute.value = this.attributeValue;
        newAttribute.parentNode = this.currentNode;

        this.currentNode.attributes.push(newAttribute);
    }

    parse(str: string) {
        this.state = ParserState.BEGIN;
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
            } else {
                this.column++;
            }

            switch (this.state) {
                // document ::= ( prolog element Misc* ) - ( Char* RestrictedChar Char* )
                case ParserState.BEGIN:
                    if (c === "\uFEFF") {
                        continue;
                    }

                    if (c === "<") {
                        this.state = ParserState.START_TAG;
                    } else if (!isWhitespace(c)) {
                        this.error("Text content without element parent");
                    }
                    continue;

                // Comment ::= '<!--' ((Char - '-') | ('-' (Char - '-')))* '-->'
                case ParserState.COMMENT:
                    if (c === "-") {
                        this.state = ParserState.COMMENT_ENDING;
                    } else {
                        this.comment += c;
                    }
                    continue;

                case ParserState.COMMENT_ENDING:
                    if (c === "-") {
                        this.state = ParserState.COMMENT_ENDED;
                        this.newCommentNode(this.comment);
                        this.comment = "";
                    } else {
                        this.comment += "-" + c;
                        this.state = ParserState.COMMENT;
                    }
                    continue;

                case ParserState.COMMENT_ENDED:
                    if (c !== ">") {
                        this.error("Invalid comment format");
                    } else {
                        this.state = ParserState.TEXT;
                    }
                    continue;

                // STag ::= '<' Name (S Attribute)* S? '>'
                case ParserState.START_TAG:
                    if (c === "!") {
                        this.state = ParserState.PROLOG;
                        this.sgmlDecl = "";
                    } else if (isWhitespace(c)) {
                        this.error("Stag-tag contains space as a first character");
                    } else if (NameStartChar.test(c)) {
                        this.state = ParserState.START_TAG_NAME;
                        this.tagName = c;
                    } else if (c === "/") {
                        this.state = ParserState.CLOSE_TAG;
                        this.tagName = "";
                    } else if (c === "?") {
                        this.piTarget = "";
                        this.piContent = "";
                        this.state = ParserState.PROCESSING_INSTRUCTION;
                    } else {
                        this.error("Unencoded <");
                    }
                    continue;

                case ParserState.START_TAG_NAME:
                    if (NameChar.test(c)) {
                        this.tagName += c;
                    } else if (c === ">") {
                        this.newElement();
                        this.resetElement(false);
                    } else if (c === "/") {
                        this.newElement();
                        this.state = ParserState.EMPTY_ELEMENT_TAG;
                    } else if (isWhitespace(c)) {
                        this.newElement();
                        this.state = ParserState.ATTRIBUTE;
                    } else {
                        throw new Error("Invalid start-tag namechar");
                    }
                    continue;

                case ParserState.EMPTY_ELEMENT_TAG:
                    if (c === ">") {
                        this.resetElement(true);
                        this.closeTag();
                    } else {
                        this.error("Forward-slash in opening tag not followed by >");
                    }
                    continue;

                // ETag ::= '</' Name S? '>'
                case ParserState.CLOSE_TAG:
                    if (!this.tagName) {
                        if (isWhitespace(c)) {
                            this.error("A start tag needs to begin with a name");
                        } else if (!NameStartChar.test(c)) {
                            this.error("Invalid tagname in closing tag.");
                        } else {
                            this.tagName = c;
                        }
                    } else if (c === ">") {
                        this.closeTag();
                    } else if (NameChar.test(c)) {
                        this.tagName += c;
                    } else if (!isWhitespace(c)) {
                        this.error("End-tag contains invalid character (" + c + ")");
                    } else {
                        this.state = ParserState.CLOSE_TAG_SPACE;
                    }
                    continue;

                case ParserState.CLOSE_TAG_SPACE:
                    if (isWhitespace(c)) {
                        continue;
                    } else if (c === ">") {
                        this.closeTag();
                    } else {
                        this.error("Invalid characters in closing tag");
                    }
                    continue;

                case ParserState.TEXT:
                    if (this.sawRoot && !this.closedRoot) {
                        var starti = i - 1;
                        while (c && c !== "<" && c !== "&") {
                            c = str[i++];

                            if (c) {
                                if (c === "\n") {
                                    this.line++;
                                    this.column = 0;
                                } else {
                                    this.column++;
                                }
                            } else {
                                this.error("Unexpected end of input");
                            }
                        }
                        this.textContent += str.substring(starti, i - 1);
                        this.newTextNode();
                    }

                    if (c === "<" && !(this.sawRoot && this.closedRoot)) {
                        this.state = ParserState.START_TAG;
                        continue;
                    } else {
                        if (!isWhitespace(c) && (!this.sawRoot || this.closedRoot)) {
                            this.error("Content after root node.");
                        }

                        if (c === "&") {
                            this.entityBuffer = "";
                            this.state = ParserState.TEXT_ENTITY;
                        } else {
                            this.textContent += c;
                        }
                    }

                    continue;

                case ParserState.ATTRIBUTE:
                    if (isWhitespace(c)) {
                        continue;
                    } else if (c === ">") {
                        this.resetElement(false);
                    } else if (c === "/") {
                        this.state = ParserState.EMPTY_ELEMENT_TAG;
                    } else if (NameStartChar.test(c)) {
                        this.attributeName = c;
                        this.attributeValue = "";
                        this.state = ParserState.ATTRIBUTE_NAME;
                    } else {
                        this.error("Invalid attribute name");
                    }
                    continue;

                case ParserState.ATTRIBUTE_NAME:
                    if (c === "=") {
                        this.state = ParserState.ATTRIBUTE_VALUE;
                    } else if (c === ">") {
                        this.error("Attribute without value");
                    } else if (isWhitespace(c)) {
                        continue;
                    } else if (NameChar.test(c)) {
                        this.attributeName += c;
                    } else {
                        this.error("Invalid attribute name");
                    }
                    continue;

                case ParserState.ATTRIBUTE_VALUE:
                    if (isWhitespace(c)) {
                        continue;
                    } else if (c === '"' || c === "'") {
                        this.quote = c;
                        this.state = ParserState.ATTRIBUTE_VALUE_QUOTED;
                    } else {
                        this.error("Unquoted attribute value");
                    }
                    continue;

                case ParserState.ATTRIBUTE_VALUE_QUOTED:
                    if (c !== this.quote) {
                        this.attributeValue += c;
                        continue;
                    }

                    this.addAttribute();
                    this.quote = "";
                    this.state = ParserState.ATTRIBUTE_VALUE_CLOSED;
                    continue;

                case ParserState.ATTRIBUTE_VALUE_CLOSED:
                    if (isWhitespace(c)) {
                        this.state = ParserState.ATTRIBUTE;
                    } else if (c === ">") {
                        this.resetElement(false);
                    } else if (c === "/") {
                        this.state = ParserState.EMPTY_ELEMENT_TAG;
                    } else if (NameStartChar.test(c)) {
                        this.error("No whitespace between attributes");
                    } else {
                        this.error("Invalid attribute name");
                    }
                    continue;

                case ParserState.PROCESSING_INSTRUCTION:
                    if (c === "?" && this.piTarget === "") {
                        this.error("Missing processing instruction target");
                    } else if (isWhitespace(c) && this.piTarget === "xml") {
                        this.newDocumentRoot();
                        this.state = ParserState.XML_PROLOG_ATTRIBUTE;
                    } else if (isWhitespace(c) && this.piTarget !== "") {
                        this.state = ParserState.PROCESSING_INSTRUCTION_CONTENT;
                    } else if (isWhitespace(c)) {
                        continue;
                    } else {
                        this.piTarget += c;
                    }
                    continue;

                case ParserState.PROCESSING_INSTRUCTION_CONTENT:
                    if (!this.piContent && isWhitespace(c)) {
                        continue;
                    } else if (c === "?") {
                        this.state = ParserState.PROCESSING_INSTRUCTION_ENDING;
                    } else {
                        this.piContent += c;
                    }
                    continue;

                case ParserState.PROCESSING_INSTRUCTION_ENDING:
                    if (c === ">") {
                        this.newProcessingInstruction(this.piTarget, this.piContent);
                    } else {
                        this.piContent += "?" + c;
                        this.state = ParserState.PROCESSING_INSTRUCTION_CONTENT;
                    }
                    continue;

                case ParserState.XML_PROLOG_ATTRIBUTE:
                    if (c === "?") {
                        this.state = ParserState.XML_PROLOG_ENDING;
                    } else if (isWhitespace(c)) {
                        continue;
                    } else if (NameStartChar.test(c)) {
                        this.attributeName = c;
                        this.state = ParserState.XML_PROLOG_ATTRIBUTE_NAME;
                    } else {
                        this.error("Invalid attribute name");
                    }
                    continue;

                case ParserState.XML_PROLOG_ATTRIBUTE_NAME:
                    if (c === "=") {
                        this.state = ParserState.XML_PROLOG_ATTRIBUTE_VALUE;
                    } else if (c === "?" || c === ">") {
                        this.error("Attribute without value");
                    } else if (isWhitespace(c)) {
                        continue;
                    } else if (NameChar.test(c)) {
                        this.attributeName += c;
                    } else {
                        this.error("Invalid attribute name");
                    }
                    continue;

                case ParserState.XML_PROLOG_ATTRIBUTE_VALUE:
                    if (this.isQuote(c)) {
                        this.quote = c;
                        this.state = ParserState.XML_PROLOG_ATTRIBUTE_VALUE_QUOTED;
                        this.attributeValue = "";
                    } else if (c === ">" || c === "?") {
                        this.error("Attribute without value");
                    } else if (isWhitespace(c)) {
                        continue;
                    } else {
                        this.error("Invalid attribute name");
                    }
                    continue;

                case ParserState.XML_PROLOG_ATTRIBUTE_VALUE_QUOTED:
                    if (c === this.quote) {
                        const newRootAttribute = new XMLNode();
                        newRootAttribute.nodeType = NodeType.ATTRIBUTE;
                        newRootAttribute.name = this.attributeName;
                        newRootAttribute.value = this.attributeValue;

                        this.documentRoot.attributes.push(newRootAttribute);
                        this.state = ParserState.XML_PROLOG_ATTRIBUTE;
                    } else {
                        this.attributeValue += c;
                    }
                    continue;

                case ParserState.XML_PROLOG_ENDING:
                    if (c === ">") {
                        this.state = ParserState.TEXT;
                    } else {
                        this.error("Invalid XML prolog ending");
                    }
                    continue;

                case ParserState.PROLOG:
                    if ((this.sgmlDecl + c).toUpperCase() === "[CDATA[") {
                        // emitNode(parser, 'onopencdata')
                        this.state = ParserState.CDATA;
                        this.sgmlDecl = "";
                        this.cdata = "";
                    } else if (this.sgmlDecl + c === "--") {
                        this.state = ParserState.COMMENT;
                        this.comment = "";
                        this.sgmlDecl = "";
                    } else if ((this.sgmlDecl + c).toUpperCase() === "DOCTYPE") {
                        this.state = ParserState.DOCTYPE;
                    } else {
                        this.sgmlDecl += c;
                    }
                    continue;

                case ParserState.DOCTYPE:
                    if (c === ">") {
                        this.state = ParserState.TEXT;
                    } else {
                        this.doctype += c;

                        if (c === "[") {
                            this.state = ParserState.DOCTYPE_DTD;
                        } else if (this.isQuote(c)) {
                            this.state = ParserState.DOCTYPE_QUOTED;
                            this.quote = c;
                        }
                    }
                    continue;

                case ParserState.DOCTYPE_QUOTED:
                    this.doctype += c;
                    if (c === this.quote) {
                        this.quote = "";
                        this.state = ParserState.DOCTYPE;
                    }
                    continue;

                case ParserState.DOCTYPE_DTD:
                    this.doctype += c;

                    if (c === "]") {
                        this.state = ParserState.DOCTYPE;
                    }
                    continue;

                case ParserState.CDATA:
                    if (c === "]") {
                        this.state = ParserState.CDATA_MAYBE_END;
                    } else {
                        this.cdata += c;
                    }
                    continue;

                case ParserState.CDATA_MAYBE_END:
                    if (c === "]") {
                        this.state = ParserState.CDATA_PROBABLY_END;
                    } else {
                        this.cdata += "]" + c;
                        this.state = ParserState.CDATA;
                    }
                    continue;

                case ParserState.CDATA_PROBABLY_END:
                    if (c === ">") {
                        this.textContent = this.cdata;
                        this.newTextNode();
                        this.cdata = "";
                        this.state = ParserState.TEXT;
                    } else if (c === "]" && (str.charAt(i) == ">" || str.charAt(i) == "]")) {
                        this.cdata += ']';
                    } else {
                        this.cdata += "]]" + c;
                        this.state = ParserState.CDATA;
                    }
                    continue;

                case ParserState.TEXT_ENTITY:
                    if (NameStartChar.test(c)) {
                        this.entityBuffer = c;
                        this.state = ParserState.TEXT_ENTITY_NAME;
                    } else {
                        this.error("Invalid entity start char (" + c + ")");
                    }
                    continue;

                case ParserState.TEXT_ENTITY_NAME:
                    if (c === ";") {
                        if (this.predefinedEntities[this.entityBuffer]) {
                            this.textContent += this.predefinedEntities[this.entityBuffer];
                        } else {
                            this.textContent += "&" + this.entityBuffer + ";";
                        }
                        this.state = ParserState.TEXT;
                    } else if (NameChar.test(c)) {
                        this.entityBuffer += c;
                    } else {
                        this.error("Invalid name character (" + c + ")");
                    }
                    continue;
            }
        }

        switch (this.state) {
            case ParserState.XML_PROLOG_ATTRIBUTE:
            case ParserState.XML_PROLOG_ATTRIBUTE_NAME:
            case ParserState.XML_PROLOG_ATTRIBUTE_VALUE:
            case ParserState.XML_PROLOG_ATTRIBUTE_VALUE_QUOTED:
                this.error("Invalid root node");
        }

        return new XMLResult(this.documentRoot, this.doctype.trim());
    }
}
