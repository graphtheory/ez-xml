import { XMLNode } from './xml_node';
export declare class XMLTraversal {
    private indexNextComparission;
    private startNode;
    constructor(startNode: XMLNode);
    find(query: string): XMLNode[];
    private compare<T>(compare, left, right);
    private intersect(a, b);
    private nonEmptyIndices(arr);
    private shuntingYard(contextNodes, node);
    private handlePredicate(predicate, currentNodes);
    private getAxisNodes(currentNodes, axis);
    private intersectSelf(currentNode, axis, result);
    private getAllDescendants(node, result);
}
