/*
 * Copyright (C) 2020 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

const NodeEnvironment = require("jest-environment-node");

/**
 * Special node environment class for Jest which runs all scripts in the same context. This effectively disables
 * the sandbox isolation which is completely broken (See https://github.com/facebook/jest/issues/2549)
 */
module.exports = class extends NodeEnvironment {
    constructor(config, context) {
        super(config, context);

        // Use shared global environment for all tests
        this.global = global;

        // For Jest 25 this method must be removed. Overwriting it with a method which returns null doesn't work...
        this.getVmContext = null;

        // Make process.exit immutable to prevent Jest adding some annoying logging output to it
        /* Disabled for now, looks like it is no longer needed?
        const realExit = global.process.exit;
        Object.defineProperty(global.process, "exit", {
            get() { return realExit },
            set() {}
        });
        */
    }

    runScript(script) {
        return script.runInThisContext();
    }
}
