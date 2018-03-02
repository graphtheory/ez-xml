import { parse } from '../..';
import { XMLResult } from '../../xml/xml_result';

export const company: XMLResult = parse(`<?xml version="1.0" encoding="utf-8"?>
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
</company>`);
