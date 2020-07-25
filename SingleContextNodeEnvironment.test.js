/*
 * Copyright (C) 2020 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

const fs = require("fs");
const util = require("util");
const readFile = util.promisify(fs.readFile);

function getSuperClass(cls) {
    const prototype = Object.getPrototypeOf(cls.prototype);
    return prototype ? prototype.constructor : null;
}

describe("instanceof", () => {
    const buffers = fs.readdirSync(__dirname);
    const buffer = fs.readFileSync(__filename);
    const error = (() => { try { fs.readFileSync("/"); } catch (e) { return e; } })();
    const promise = readFile(__filename);

    const nodeErrorType = error.constructor;
    const nodeArrayType = buffers.constructor;
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
        expect(new Promise(resolve => resolve()) instanceof nodePromiseType).toBe(true);
        expect(new Promise(resolve => resolve()) instanceof nodeObjectType).toBe(true);
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
});
