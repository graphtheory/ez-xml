import { SerializedXMLElement } from '../common/interfaces';
import { NodeType } from '../xml/constants';
export declare class XMLNode {
    name: string;
    nodeType: NodeType;
    children: XMLNode[];
    attributes: XMLNode[];
    value: string;
    parentNode: XMLNode | null;
    constructor();
    find(query: string): XMLNode[];
    single(query: string): XMLNode;
    attr(name: string): string | undefined;
    text(query?: string): string;
    toJSON(): SerializedXMLElement;
    private innerText;
}
