import { NodeType } from "../xml/constants";
export interface Dictionary<T> {
    [x: string]: T;
}
export interface SerializedXMLElement {
    name: string;
    attributes: Dictionary<string>;
    value: string;
    children: SerializedXMLElement[];
    nodeType: NodeType;
}
