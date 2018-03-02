import * as assert from "assert";

import { peek } from "../xpath/util";

describe("Utility tests", () => {
    it("peek", () => {
        const a = [42];

        assert.equal(peek(a), 42);
        assert.equal(peek([]), undefined);
    });
});
