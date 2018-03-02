"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xml_parser_1 = require("./xml/xml_parser");
function parse(xml) {
    return new xml_parser_1.XMLParser().parse(xml);
}
exports.parse = parse;
//# sourceMappingURL=index.js.map