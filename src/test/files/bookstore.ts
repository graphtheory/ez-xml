import { parse } from '../..';
import { XMLResult } from '../../xml/xml_result';

export const bookstore: XMLResult = parse(`<?xml version="1.0" encoding="utf-8"?>
<!-- A tiny bookstore -->
<bookstore>
    <book name="The Hitchhiker's Guide to the Galaxy">
        <price>42</price>
        <year>1979</year>
    </book>
    <book name="Baby owners manual" isbn="123">
        <price>35</price>
        <year>2003</year>
    </book>
    <book name="Wheel of time: The eye of the world">
        <price>50</price>
        <year>1990</year>
    </book>
    <book name="XML for dummies">
        <price>50</price>
        <year>1998</year>
        <badnode />
    </book>
</bookstore>`);
