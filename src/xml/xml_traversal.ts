import { NodeType } from '../xml/constants';
import { isInteger } from '../common/utils';
import { BinaryOperation } from '../xpath/ast';
import { Axis } from '../xpath/constants';
import { xpath_parser } from '../xpath/xpath_parser';
import { XMLNode } from './xml_node';

export class XMLTraversal {
    private indexNextComparission = false;
    private startNode: XMLNode;

    constructor(startNode: XMLNode) {
        this.startNode = startNode;
    }

    find(query: string) { 
        const path = xpath_parser(query);
        let paths = path.StepExpressions;
        let currentNodes: XMLNode[] = [this.startNode];

        for (var i = 0; i < paths.length; i++) {
            const currentPath = paths[i];

            currentNodes = this.getAxisNodes(currentNodes, currentPath.axis);

            if (currentPath.nodeType !== NodeType.NODE) {
                currentNodes = currentNodes.filter(n => n.nodeType === currentPath.nodeType);
            }

            if (currentPath.nameTest) {
                currentNodes = currentNodes.filter(node => node.name === currentPath.nameTest);
            }

            if (currentPath.predicateList.length > 0) {
                for (var j = 0; j < currentPath.predicateList.length; j++) {
                    currentNodes = this.handlePredicate(currentPath.predicateList[j], currentNodes);
                }
            }
        }

        return currentNodes;
    }

    private compare<T>(compare: (item: T, right: T) => boolean, left: T[] | T, right: T[] | T) {
        let res = [];

        if (Array.isArray(left) && !Array.isArray(right)) {
            res = left.filter(l => {
                return compare(l, right);
            });

            if (typeof res[0] === "string" || this.indexNextComparission) {
                this.indexNextComparission = false;
                return res.map(r => left.indexOf(r) + 1);
            }

            return res;
        }

        if (!Array.isArray(left) && Array.isArray(right)) {
            res = right.filter(r => {
                return compare(left, r);
            });

            if (typeof res[0] === "string" || this.indexNextComparission) {
                this.indexNextComparission = false;
                return res.map(r => right.indexOf(r) + 1);
            }

            return res;
        }

        return [];
    }

    private intersect(a: number[], b: number[]) {
        return [
            ...new Set(
                a.filter((n) => b.indexOf(n) !== -1)
            )
        ];
    }

    private nonEmptyIndices(arr: string[]) {
        return arr.reduce((prev: number[], currentValue, currentIndex) => {
            if (currentValue !== "") {
                prev.push(currentIndex + 1);
            }

            return prev;
        }, []);
    }

    private shuntingYard(contextNodes: XMLNode[], node: BinaryOperation): number[] | string[] | string | number {
        const left = node.left ? this.shuntingYard(contextNodes, node.left) : [];
        const right = node.right ? this.shuntingYard(contextNodes, node.right) : [];

        switch (node.value) {
            case "=":
                return this.compare((i, l) => i === l, left as number, right as number);

            case ">":
                return this.compare((a, b) => a > b, left as number, right as number);

            case ">=":
                return this.compare((a, b) => a >= b, left as number, right as number);

            case "<":
                return this.compare((a, b) => a < b, left as number, right as number);

            case "<=":
                return this.compare((a, b) => a <= b, left as number, right as number);

            case "!=":
                return this.compare((a, b) => !(a === b), left as number, right as number);

            case "+":
                return (left as number) + (right as number);

            case "-":
                return (left as number) - (right as number);

            case "*":
                return (left as number) * (right as number);

            case "div":
                return (left as number) / (right as number);

            case "and":
                if (typeof node.left === "undefined" || typeof node.right === "undefined") {
                    return [];
                }

                if (Array.isArray(left) && Array.isArray(right)) {
                    if (typeof left[0] === "string" && typeof right[0] === "string") {
                        return this.intersect(
                            this.nonEmptyIndices(left as string[]),
                            this.nonEmptyIndices(right as string[])
                        );
                    }

                    if (typeof left[0] === "number" && typeof right[0] === "number") {
                        return this.intersect(left as number[], right as number[]);
                    }

                    return [];
                }

                return [];

            case "or":
                if (typeof node.left === "undefined" || typeof node.right === "undefined") {
                    return [];
                }

                if (Array.isArray(left) && Array.isArray(right)) {
                    if (typeof left[0] === "number" && typeof right[0] === "number") {
                        return [...new Set([...(left as number[]), ...(right as number[])])];
                    }
                    return [];
                }

                return [];

            default:
                if (isInteger(node.value)) {
                    return parseInt(node.value, 10);
                } else if (node.value === "last") {
                    return contextNodes.length;
                } else if (node.value === "position") {
                    return Array(contextNodes.length)
                        .fill(1)
                        .map((a: number, b) => a + b);
                } else if (node.value[0] === "@") {
                    const attributeName = node.value.slice(1);

                    return contextNodes.map(n => {
                        const found = n.attributes.find(a => {
                            return a.name === attributeName;
                        });

                        if (!found) {
                            return "";
                        }

                        return found.value;
                    });
                } else if (node.value[0] === '"' && node.value[node.value.length - 1] === '"') {
                    return node.value.slice(1, node.value.length - 1);
                } else {
                    this.indexNextComparission = true;

                    return contextNodes.map(n => {
                        const found = n.find(node.value);

                        if (found.length === 0) {
                            return "";
                        }

                        if (found[0].children.length === 0) {
                            return "";
                        }

                        const value = found[0].children[0].value;

                        if (isInteger(value)) {
                            return parseInt(value, 10);
                        }

                        return value;
                        // This is a bit optimistic...
                    }) as number[] | string[];
                }
        }
    }

    private handlePredicate(predicate: BinaryOperation, currentNodes: XMLNode[]) {
        const result = this.shuntingYard(currentNodes, predicate);
        const finalResult: XMLNode[] = [];

        if (Array.isArray(result)) {
            for (var i = 0; i < result.length; i++) {
                let r = result[i];

                if (typeof r === "number" && typeof currentNodes[r - 1] !== "undefined") {
                    finalResult.push(currentNodes[r - 1]);
                } else if (typeof r === "string" && typeof currentNodes[i] !== "undefined" && r !== "") {
                    // e.g. [@attr]
                    finalResult.push(currentNodes[i]);
                }
            }
        } else if (typeof result === "number" && typeof currentNodes[result - 1] !== "undefined") {
            // A binary operation that results in a number e.g. "last() - 1"
            finalResult.push(currentNodes[result - 1]);
        }

        return finalResult;
    }
    
    private getAxisNodes(currentNodes: XMLNode[], axis: Axis) {
        let result: XMLNode[] = [];
        let parentNode: XMLNode | null;

        currentNodes.forEach(currentNode => {
            switch (axis) {
                case Axis.Ancestor:
                    parentNode = currentNode.parentNode;
                    while (parentNode) {
                        result.push(parentNode);

                        if (!parentNode.parentNode) {
                            break;
                        }

                        parentNode = parentNode.parentNode;
                    }
                    break;

                case Axis.AncestorOrSelf:
                    result.push(currentNode);

                    parentNode = currentNode.parentNode;
                    while (parentNode) {
                        result.push(parentNode);

                        if (!parentNode.parentNode) {
                            break;
                        }

                        parentNode = parentNode.parentNode;
                    }
                    break;

                case Axis.Attribute:
                    currentNode.attributes.forEach(a => {
                        result.push(a);
                    });
                    break;

                case Axis.Child:
                    currentNode.children.forEach(child => {
                        result.push(child);
                    });
                    break;

                case Axis.Descendant:
                    result = result.concat(this.getAllDescendants(this.startNode, []));
                    break;

                case Axis.DescendantOrSelf:
                    result = result.concat(this.getAllDescendants(this.startNode, []));
                    result.push(currentNode);
                    break;

                case Axis.Following:
                    this.intersectSelf(currentNode, axis, result);
                    break;

                case Axis.FollowingSibling:
                    this.intersectSelf(currentNode, axis, result);
                    break;

                case Axis.Parent:
                    if (currentNode.parentNode) {
                        result.push(currentNode.parentNode);
                    }
                    break;

                case Axis.Preceding:
                    this.intersectSelf(currentNode, axis, result);
                    break;

                case Axis.PrecedingSibling:
                    this.intersectSelf(currentNode, axis, result);
                    break;

                case Axis.Self:
                    result.push(currentNode);
                    break;
            }
        });

        return result;
    }

    private intersectSelf(currentNode: XMLNode, axis: Axis, result: XMLNode[]) {
        const before: XMLNode[] = [];
        const after: XMLNode[] = [];
        let found = false;

        if (currentNode.parentNode) {
            for (var i = 0; i < currentNode.parentNode.children.length; i++) {
                if (currentNode.parentNode.children[i] === currentNode) {
                    found = true;
                } else if (found === true) {
                    after.push(currentNode.parentNode.children[i]);
                } else {
                    before.push(currentNode.parentNode.children[i]);
                }
            }
        }

        switch (axis) {
            case Axis.Preceding:
                before.forEach(n => {
                    result.push(n);
                });
                break;

            case Axis.PrecedingSibling:
                if (before.length > 0) {
                    result.push(before[before.length - 1]);
                }
                break;

            case Axis.Following:
                after.forEach(n => {
                    result.push(n);
                });
                break;

            case Axis.FollowingSibling:
                if (after.length > 0) {
                    result.push(after[0]);
                }
                break;
        }
    }

    private getAllDescendants(node: XMLNode, result: XMLNode[]) {
        node.children.forEach(childNode => {
            this.getAllDescendants(childNode, result);

            result.push(childNode);
        });

        return result;
    }
}
