import { SerializedXMLElement } from "../common/interfaces";
import { XMLNode } from "./xml_node";
export declare class XMLResult {
    rootNode: XMLNode;
    DTD: string;
    constructor(rootNode: XMLNode, dtd: string);
    find(query: string): XMLNode[];
    single(query: string): XMLNode;
    toJSON(): SerializedXMLElement;
}
