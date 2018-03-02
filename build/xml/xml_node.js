"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xml_traversal_1 = require("./xml_traversal");
class XMLNode {
    constructor() {
        this.children = [];
        this.attributes = [];
        this.name = "";
        this.value = "";
        this.parentNode = null;
        this.nodeType = 9;
    }
    find(query) {
        return new xml_traversal_1.XMLTraversal(this).find(query);
    }
    single(query) {
        return new xml_traversal_1.XMLTraversal(this).find(query)[0];
    }
    attr(name) {
        const result = new xml_traversal_1.XMLTraversal(this).find("@" + name);
        return result.length === 1 ? result[0].value : void 0;
    }
    text(query) {
        const traversal = new xml_traversal_1.XMLTraversal(this);
        if (typeof query === "undefined") {
            return this.innerText(traversal.find("//text()"));
        }
        return this.innerText(traversal.find(query + "/text()"));
    }
    toJSON() {
        return {
            name: this.name,
            attributes: this.attributes.reduce((prev, curr) => {
                prev[curr.name] = curr.value;
                return prev;
            }, {}),
            nodeType: this.nodeType,
            value: this.value,
            children: this.children.map(c => c.toJSON())
        };
    }
    innerText(nodes) {
        return nodes.reduce((prev, next) => prev + next.value, "");
    }
}
exports.XMLNode = XMLNode;
//# sourceMappingURL=xml_node.js.map