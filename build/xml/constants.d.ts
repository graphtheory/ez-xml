export declare const enum NodeType {
    DOCUMENT_NODE = 0,
    ELEMENT = 1,
    ATTRIBUTE = 2,
    SCHEMA_ELEMENT = 3,
    SCHEMA_ATTRIBUTE = 4,
    PROCESSING_INSTRUCTION = 5,
    COMMENT = 6,
    TEXT = 7,
    NAMESPACE_NODE = 8,
    NODE = 9
}
export declare const enum ParserState {
    ATTRIBUTE = 0,
    ATTRIBUTE_NAME = 1,
    ATTRIBUTE_VALUE = 2,
    ATTRIBUTE_VALUE_CLOSED = 3,
    ATTRIBUTE_VALUE_QUOTED = 4,
    BEGIN = 5,
    CDATA = 6,
    CDATA_MAYBE_END = 7,
    CDATA_PROBABLY_END = 8,
    CLOSE_TAG = 9,
    CLOSE_TAG_SPACE = 10,
    COMMENT = 11,
    COMMENT_ENDED = 12,
    COMMENT_ENDING = 13,
    DOCTYPE = 14,
    DOCTYPE_DTD = 15,
    DOCTYPE_QUOTED = 16,
    EMPTY_ELEMENT_TAG = 17,
    PROCESSING_INSTRUCTION = 18,
    PROCESSING_INSTRUCTION_CONTENT = 19,
    PROCESSING_INSTRUCTION_ENDING = 20,
    PROLOG = 21,
    START_TAG = 22,
    START_TAG_NAME = 23,
    TEXT = 24,
    TEXT_ENTITY = 25,
    TEXT_ENTITY_NAME = 26,
    XML_PROLOG_ATTRIBUTE = 27,
    XML_PROLOG_ATTRIBUTE_NAME = 28,
    XML_PROLOG_ATTRIBUTE_VALUE = 29,
    XML_PROLOG_ATTRIBUTE_VALUE_QUOTED = 30,
    XML_PROLOG_ENDING = 31
}
export declare const Char: RegExp;
export declare const RestrictedChar: RegExp;
export declare const WhiteSpace: RegExp;
export declare const NameStartChar: RegExp;
export declare const NameChar: RegExp;
