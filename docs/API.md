# API

EZ-XML exposes one syncronos function `parse` which results in a XMLResult object with the following methods

```typescript
interface XMLResult {
    find(query: string): XMLNode[];
    single(query: string): XMLNode | undefined;
    toJSON(): SerializedXMLElement;
}
```

Every XMLNode has a few utility functions to allow further querying:

```typescript
interface XMLNode {
    find(query: string): XMLNode[];
    single(query: string): XMLNode | undefined;
    attr(name: string): string | undefined;
    text(query: string): string | undefined;
    toJSON(): SerializedXMLElement;
}
```

The structure of the JSON document when calling `toJSON()`

```typescript
interface SerializedXMLElement {
    name: string;
    attributes: Dictionary<string>;
    value: string;
    children: SerializedXMLElement[];
    nodeType: NodeType;
}
```