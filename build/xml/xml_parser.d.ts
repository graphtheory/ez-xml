import { XMLResult } from "./xml_result";
export declare class XMLParser {
    private documentRoot;
    private currentNode;
    line: number;
    column: number;
    private state;
    private sawRoot;
    private closedRoot;
    private rootName;
    private tagName;
    private comment;
    private attributeName;
    private attributeValue;
    private quote;
    private doctype;
    private cdata;
    private sgmlDecl;
    private piTarget;
    private piContent;
    private textContent;
    private entityBuffer;
    private readonly predefinedEntities;
    constructor();
    private isQuote;
    private error;
    private newDocumentRoot;
    private resetElement;
    private closeTag;
    private newElement;
    private newProcessingInstruction;
    private newTextNode;
    private newCommentNode;
    private addAttribute;
    parse(str: string): XMLResult;
}
