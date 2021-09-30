/*
 * Copyright (C) 2020 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { Context, Script } from "vm";
import NodeEnvironment from "jest-environment-node";
import type { Config, Global } from '@jest/types';

/** Special context which is handled specially in the hacked runInContext method below */
const RUN_IN_THIS_CONTEXT = {}

/** Remembered original runInContext method. */
const origRunInContext = Script.prototype.runInContext;

/**
 * Ugly hack to allow Jest to just use a single Node VM context. The Jest code in question is in a large private
 * method of the standard Jest runtime and it would be a lot of code-copying to create a custom runtime which
 * replaces the script run code. So we hack into the `script.runInContext` method instead to redirect it to
 * `script.runInThisContext` when environment returns the special [[RUN_IN_THIS_CONTEXT]] context.
 */
Script.prototype.runInContext = function(context, options) {
    if (context === RUN_IN_THIS_CONTEXT) {
        return this.runInThisContext(options);
    } else {
        return origRunInContext.call(this, context, options);
    }
}

class SingleContextNodeEnvironment extends NodeEnvironment {
    constructor(config: Config.ProjectConfig) {
        super(config);

        // Use shared global environment for all tests
        this.global = global as unknown as Global.Global;
    }

    public getVmContext(): Context | null {
        // Return special context which is handled specially in the hacked `script.runInContext` function
        return RUN_IN_THIS_CONTEXT;
    }
}

export = SingleContextNodeEnvironment;
