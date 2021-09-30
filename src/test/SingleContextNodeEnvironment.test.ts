/*
 * Copyright (C) 2020 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import fs from "fs";
import util from "util";
import v8 from "v8";

const readFile = util.promisify(fs.readFile);

function getSuperClass(cls: Function): Function {
    const prototype = Object.getPrototypeOf(cls.prototype);
    return prototype ? prototype.constructor : null;
}

describe("instanceof", () => {
    const buffers = fs.readdirSync(__dirname);
    const buffer = fs.readFileSync(__filename);
    const error = (() => { try { fs.readFileSync("/"); } catch (e) { return e; } })() as Error;
    const promise = readFile(__filename);

    const nodeArrayType = buffers.constructor;
    const nodeErrorType = error.constructor;
    const nodePromiseType = promise.constructor;
    const nodeUint8ArrayType = getSuperClass(buffer.constructor);
    const nodeTypedArrayType = getSuperClass(nodeUint8ArrayType);
    const nodeObjectType = getSuperClass(nodeTypedArrayType);

    const globalTypedArrayType = getSuperClass(Uint8Array);

    it("works with node array type", () => {
        expect(buffers instanceof Array).toBe(true);
        expect(buffers instanceof Object).toBe(true);
        expect([] instanceof nodeArrayType).toBe(true);
        expect([] instanceof nodeObjectType).toBe(true);
    });

    it("works with node error type", () => {
        expect(error instanceof Error).toBe(true);
        expect(error instanceof Object).toBe(true);
        expect(new Error() instanceof nodeErrorType).toBe(true);
        expect(new Error() instanceof nodeObjectType).toBe(true);
    });

    it("works with node promise type", () => {
        expect(promise instanceof Promise).toBe(true);
        expect(promise instanceof Object).toBe(true);
        expect(new Promise<void>(resolve => resolve()) instanceof nodePromiseType).toBe(true);
        expect(new Promise<void>(resolve => resolve()) instanceof nodeObjectType).toBe(true);
    });

    it("works with node Uint8Array type", () => {
        expect(buffer instanceof Buffer).toBe(true);
        expect(buffer instanceof Uint8Array).toBe(true);
        expect(buffer instanceof globalTypedArrayType).toBe(true);
        expect(buffer instanceof Object).toBe(true);
        expect(new Uint8Array([]) instanceof nodeUint8ArrayType).toBe(true);
        expect(new Uint8Array([]) instanceof nodeTypedArrayType).toBe(true);
        expect(new Uint8Array([]) instanceof nodeObjectType).toBe(true);
    });

    it("recognizes typed arrays as objects",  () => {
        expect(new Uint8Array([ 1, 2, 3 ]) instanceof Object).toBe(true);
        expect(new Uint8ClampedArray([ 1, 2, 3 ]) instanceof Object).toBe(true);
        expect(new Uint16Array([ 1, 2, 3 ]) instanceof Object).toBe(true);
        expect(new Uint32Array([ 1, 2, 3 ]) instanceof Object).toBe(true);
        expect(new BigUint64Array([]) instanceof Object).toBe(true);
        expect(new Int8Array([ 1, 2, 3 ]) instanceof Object).toBe(true);
        expect(new Int16Array([ 1, 2, 3 ]) instanceof Object).toBe(true);
        expect(new Int32Array([ 1, 2, 3 ]) instanceof Object).toBe(true);
        expect(new BigInt64Array([]) instanceof Object).toBe(true);
        expect(new Float32Array([ 1, 2, 3 ]) instanceof Object).toBe(true);
        expect(new Float64Array([ 1, 2, 3 ]) instanceof Object).toBe(true);
    });

    it("recognizes typed arrays as instances of TypedArray",  () => {
        expect(new Uint8Array([ 1, 2, 3 ]) instanceof globalTypedArrayType).toBe(true);
        expect(new Uint8ClampedArray([ 1, 2, 3 ]) instanceof globalTypedArrayType).toBe(true);
        expect(new Uint16Array([ 1, 2, 3 ]) instanceof globalTypedArrayType).toBe(true);
        expect(new Uint32Array([ 1, 2, 3 ]) instanceof globalTypedArrayType).toBe(true);
        expect(new BigUint64Array([]) instanceof globalTypedArrayType).toBe(true);
        expect(new Int8Array([ 1, 2, 3 ]) instanceof globalTypedArrayType).toBe(true);
        expect(new Int16Array([ 1, 2, 3 ]) instanceof globalTypedArrayType).toBe(true);
        expect(new Int32Array([ 1, 2, 3 ]) instanceof globalTypedArrayType).toBe(true);
        expect(new BigInt64Array([]) instanceof globalTypedArrayType).toBe(true);
        expect(new Float32Array([ 1, 2, 3 ]) instanceof globalTypedArrayType).toBe(true);
        expect(new Float64Array([ 1, 2, 3 ]) instanceof globalTypedArrayType).toBe(true);
    });

    it("works with v8 serialize/deserialize", () => {
        const m1 = new Map();
        const m2 = v8.deserialize(v8.serialize(m1));
        expect(m1).toEqual(m2);
    });
});
