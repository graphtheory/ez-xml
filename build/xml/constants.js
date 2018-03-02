"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Char = /[\u0001-\uD7FF\uE000-\uFFFD]/;
exports.RestrictedChar = /[\u0001-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u0084\u0086-\u009F]/;
exports.WhiteSpace = /[\u0020\u0009\u000D\u000A]/;
exports.NameStartChar = /[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
exports.NameChar = /[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-\.0-9\u00B7\u0300-\u036F\u203F-\u2040]/;
//# sourceMappingURL=constants.js.map