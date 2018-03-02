import { Dictionary, SerializedXMLElement } from '../common/interfaces';
import { NodeType } from '../xml/constants';
import { XMLTraversal } from './xml_traversal';

export class XMLNode {
    public name: string;
    public nodeType: NodeType;
    public children: XMLNode[];
    public attributes: XMLNode[];
    public value: string;
    public parentNode: XMLNode | null;

    constructor() {
        this.children = [];
        this.attributes = [];
        this.name = "";
        this.value = "";
        this.parentNode = null;
        this.nodeType = NodeType.NODE;
    }

    find(query: string) {
        return new XMLTraversal(this).find(query);
    }

    single(query: string) {
        return new XMLTraversal(this).find(query)[0];
    }

    attr(name: string) {
        const result = new XMLTraversal(this).find("@" + name);

        return result.length === 1 ? result[0].value : void 0;
    }

    text(query?: string) {
        const traversal = new XMLTraversal(this);

        if (typeof query === "undefined") {
            return this.innerText(traversal.find("//text()"));
        }

        return this.innerText(traversal.find(query + "/text()"));
    }

    toJSON(): SerializedXMLElement {
        return {
            name: this.name,
            attributes: this.attributes.reduce((prev: Dictionary<string>, curr) => {
                prev[curr.name] = curr.value;
                return prev;
            }, {}),
            nodeType: this.nodeType,
            value: this.value,
            children: this.children.map(c => c.toJSON())
        };
    }

    private innerText(nodes: XMLNode[]) {
        return nodes.reduce((prev, next) => prev + next.value, "");
    }
}
