"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../common/utils");
const xpath_parser_1 = require("../xpath/xpath_parser");
class XMLTraversal {
    constructor(startNode) {
        this.indexNextComparission = false;
        this.startNode = startNode;
    }
    find(query) {
        const path = xpath_parser_1.xpath_parser(query);
        let paths = path.StepExpressions;
        let currentNodes = [this.startNode];
        for (var i = 0; i < paths.length; i++) {
            const currentPath = paths[i];
            currentNodes = this.getAxisNodes(currentNodes, currentPath.axis);
            if (currentPath.nodeType !== 9) {
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
    compare(compare, left, right) {
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
    intersect(a, b) {
        return [
            ...new Set(a.filter((n) => b.indexOf(n) !== -1))
        ];
    }
    nonEmptyIndices(arr) {
        return arr.reduce((prev, currentValue, currentIndex) => {
            if (currentValue !== "") {
                prev.push(currentIndex + 1);
            }
            return prev;
        }, []);
    }
    shuntingYard(contextNodes, node) {
        const left = node.left ? this.shuntingYard(contextNodes, node.left) : [];
        const right = node.right ? this.shuntingYard(contextNodes, node.right) : [];
        switch (node.value) {
            case "=":
                return this.compare((i, l) => i === l, left, right);
            case ">":
                return this.compare((a, b) => a > b, left, right);
            case ">=":
                return this.compare((a, b) => a >= b, left, right);
            case "<":
                return this.compare((a, b) => a < b, left, right);
            case "<=":
                return this.compare((a, b) => a <= b, left, right);
            case "!=":
                return this.compare((a, b) => !(a === b), left, right);
            case "+":
                return left + right;
            case "-":
                return left - right;
            case "*":
                return left * right;
            case "div":
                return left / right;
            case "and":
                if (typeof node.left === "undefined" || typeof node.right === "undefined") {
                    return [];
                }
                if (Array.isArray(left) && Array.isArray(right)) {
                    if (typeof left[0] === "string" && typeof right[0] === "string") {
                        return this.intersect(this.nonEmptyIndices(left), this.nonEmptyIndices(right));
                    }
                    if (typeof left[0] === "number" && typeof right[0] === "number") {
                        return this.intersect(left, right);
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
                        return [...new Set([...left, ...right])];
                    }
                    return [];
                }
                return [];
            default:
                if (utils_1.isInteger(node.value)) {
                    return parseInt(node.value, 10);
                }
                else if (node.value === "last") {
                    return contextNodes.length;
                }
                else if (node.value === "position") {
                    return Array(contextNodes.length)
                        .fill(1)
                        .map((a, b) => a + b);
                }
                else if (node.value[0] === "@") {
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
                }
                else if (node.value[0] === '"' && node.value[node.value.length - 1] === '"') {
                    return node.value.slice(1, node.value.length - 1);
                }
                else {
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
                        if (utils_1.isInteger(value)) {
                            return parseInt(value, 10);
                        }
                        return value;
                    });
                }
        }
    }
    handlePredicate(predicate, currentNodes) {
        const result = this.shuntingYard(currentNodes, predicate);
        const finalResult = [];
        if (Array.isArray(result)) {
            for (var i = 0; i < result.length; i++) {
                let r = result[i];
                if (typeof r === "number" && typeof currentNodes[r - 1] !== "undefined") {
                    finalResult.push(currentNodes[r - 1]);
                }
                else if (typeof r === "string" && typeof currentNodes[i] !== "undefined" && r !== "") {
                    finalResult.push(currentNodes[i]);
                }
            }
        }
        else if (typeof result === "number" && typeof currentNodes[result - 1] !== "undefined") {
            finalResult.push(currentNodes[result - 1]);
        }
        return finalResult;
    }
    getAxisNodes(currentNodes, axis) {
        let result = [];
        let parentNode;
        currentNodes.forEach(currentNode => {
            switch (axis) {
                case 0:
                    parentNode = currentNode.parentNode;
                    while (parentNode) {
                        result.push(parentNode);
                        if (!parentNode.parentNode) {
                            break;
                        }
                        parentNode = parentNode.parentNode;
                    }
                    break;
                case 1:
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
                case 2:
                    currentNode.attributes.forEach(a => {
                        result.push(a);
                    });
                    break;
                case 3:
                    currentNode.children.forEach(child => {
                        result.push(child);
                    });
                    break;
                case 4:
                    result = result.concat(this.getAllDescendants(this.startNode, []));
                    break;
                case 5:
                    result = result.concat(this.getAllDescendants(this.startNode, []));
                    result.push(currentNode);
                    break;
                case 6:
                    this.intersectSelf(currentNode, axis, result);
                    break;
                case 7:
                    this.intersectSelf(currentNode, axis, result);
                    break;
                case 8:
                    if (currentNode.parentNode) {
                        result.push(currentNode.parentNode);
                    }
                    break;
                case 9:
                    this.intersectSelf(currentNode, axis, result);
                    break;
                case 10:
                    this.intersectSelf(currentNode, axis, result);
                    break;
                case 11:
                    result.push(currentNode);
                    break;
            }
        });
        return result;
    }
    intersectSelf(currentNode, axis, result) {
        const before = [];
        const after = [];
        let found = false;
        if (currentNode.parentNode) {
            for (var i = 0; i < currentNode.parentNode.children.length; i++) {
                if (currentNode.parentNode.children[i] === currentNode) {
                    found = true;
                }
                else if (found === true) {
                    after.push(currentNode.parentNode.children[i]);
                }
                else {
                    before.push(currentNode.parentNode.children[i]);
                }
            }
        }
        switch (axis) {
            case 9:
                before.forEach(n => {
                    result.push(n);
                });
                break;
            case 10:
                if (before.length > 0) {
                    result.push(before[before.length - 1]);
                }
                break;
            case 6:
                after.forEach(n => {
                    result.push(n);
                });
                break;
            case 7:
                if (after.length > 0) {
                    result.push(after[0]);
                }
                break;
        }
    }
    getAllDescendants(node, result) {
        node.children.forEach(childNode => {
            this.getAllDescendants(childNode, result);
            result.push(childNode);
        });
        return result;
    }
}
exports.XMLTraversal = XMLTraversal;
//# sourceMappingURL=xml_traversal.js.map