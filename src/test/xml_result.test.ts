import * as assert from "assert";

import { parse } from "..";
import { NodeType } from "../xml/constants";

var xml = `<?xml version="1.0" encoding="utf-8"?>
<!-- This is awesome -->
<company>
    <office location="Boston">
        <employee>
            <name>John Smith</name>
        <age born="Sweden">33</age>
    </employee>
  </office>
    <office location="Vienna">
        <employee>
            <name>Sylvester Stallone</name>
        <age>37</age>
    </employee>
  </office>
    <office location="Stockholm">
        <employee>
            <name>Adam Smith</name>
        <age>42</age>
    </employee>
  </office>
</company>`;

const parsed = parse(xml);

describe("XMLResult", () => {
    it("toJSON()", () => {
        const result = parsed.toJSON();

        assert.equal(result.name, "");
        assert.equal(result.nodeType, NodeType.DOCUMENT_NODE);
        assert.equal(result.children[0].nodeType, NodeType.COMMENT);
        assert.equal(result.children[1].nodeType, NodeType.ELEMENT);
        assert.equal(result.children[1].name, "company");
    });
});
