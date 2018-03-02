/**
 * XML NodeTypes that we can store, the parser currently
 * doesn't handle:
 *   + schema Elements
 *   + schema attributes
 *   + namespace nodes
 */
export const enum NodeType {
    DOCUMENT_NODE,
    ELEMENT,
    ATTRIBUTE,
    SCHEMA_ELEMENT,
    SCHEMA_ATTRIBUTE,
    PROCESSING_INSTRUCTION,
    COMMENT,
    TEXT,
    NAMESPACE_NODE,
    NODE,
}

export const enum ParserState {
    ATTRIBUTE,
    ATTRIBUTE_NAME,
    ATTRIBUTE_VALUE,
    ATTRIBUTE_VALUE_CLOSED,
    ATTRIBUTE_VALUE_QUOTED,
    BEGIN,
    CDATA,
    CDATA_MAYBE_END,
    CDATA_PROBABLY_END,
    CLOSE_TAG,
    CLOSE_TAG_SPACE,
    COMMENT,
    COMMENT_ENDED,
    COMMENT_ENDING,
    DOCTYPE,
    DOCTYPE_DTD,
    DOCTYPE_QUOTED,
    EMPTY_ELEMENT_TAG,
    PROCESSING_INSTRUCTION,
    PROCESSING_INSTRUCTION_CONTENT,
    PROCESSING_INSTRUCTION_ENDING,
    PROLOG,
    START_TAG,
    START_TAG_NAME,
    TEXT,
    TEXT_ENTITY,
    TEXT_ENTITY_NAME,
    XML_PROLOG_ATTRIBUTE,
    XML_PROLOG_ATTRIBUTE_NAME,
    XML_PROLOG_ATTRIBUTE_VALUE,
    XML_PROLOG_ATTRIBUTE_VALUE_QUOTED,
    XML_PROLOG_ENDING
}

/*
* Regular expressions
* https://www.w3.org/TR/xml11/#charsets
* Note: Currently doesn't include the #x10000-#x10FFFF range (UTF-16)
*/

export const Char = /[\u0001-\uD7FF\uE000-\uFFFD]/;
export const RestrictedChar = /[\u0001-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u0084\u0086-\u009F]/;
export const WhiteSpace = /[\u0020\u0009\u000D\u000A]/;
export const NameStartChar = /[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
export const NameChar = /[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-\.0-9\u00B7\u0300-\u036F\u203F-\u2040]/;
