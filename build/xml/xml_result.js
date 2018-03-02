"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class XMLResult {
    constructor(rootNode, dtd) {
        this.rootNode = rootNode;
        this.DTD = dtd;
    }
    find(query) {
        return this.rootNode.find(query);
    }
    single(query) {
        return this.rootNode.single(query);
    }
    toJSON() {
        return this.rootNode.toJSON();
    }
}
exports.XMLResult = XMLResult;
//# sourceMappingURL=xml_result.js.map