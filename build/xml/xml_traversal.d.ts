import { XMLNode } from './xml_node';
export declare class XMLTraversal {
    private indexNextComparission;
    private startNode;
    constructor(startNode: XMLNode);
    find(query: string): XMLNode[];
    private compare;
    private intersect;
    private nonEmptyIndices;
    private shuntingYard;
    private handlePredicate;
    private getAxisNodes;
    private intersectSelf;
    private getAllDescendants;
}
