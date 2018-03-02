import { XMLParser } from "./xml/xml_parser";
import { XMLResult } from "./xml/xml_result";

export function parse(xml: string): XMLResult {
    return new XMLParser().parse(xml);
}
