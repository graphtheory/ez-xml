import { SerializedXMLElement } from "../common/interfaces";
import { XMLNode } from "./xml_node";

export class XMLResult {
    public rootNode: XMLNode;
    public DTD: string;

    constructor(rootNode: XMLNode, dtd: string) {
        this.rootNode = rootNode;
        this.DTD = dtd;
    }

    find(query: string) {
        return this.rootNode.find(query);
    }

    single(query: string) {
        return this.rootNode.single(query);
    }

    toJSON(): SerializedXMLElement {
        return this.rootNode.toJSON();
    }
}
