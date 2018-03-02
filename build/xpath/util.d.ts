import { NodeType } from "../xml/constants";
import { BinaryOperation } from "./ast";
import { Axis } from "./constants";
export declare function peek<T>(stack: T[]): T | undefined;
export declare function addBinaryOperation(stack: BinaryOperation[], token: string): void;
export declare function nodeKind(functionName: string): NodeType;
export declare function getAxis(axis: string): Axis;
