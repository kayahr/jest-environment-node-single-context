/*
 * Copyright (C) 2020 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { createContext, Context, Script } from "vm";
import NodeEnvironment from "jest-environment-node";
import type { Global } from "@jest/types";
import type { JestEnvironmentConfig, EnvironmentContext } from "@jest/environment";
import { LegacyFakeTimers, ModernFakeTimers } from "@jest/fake-timers";
import { ModuleMocker } from "jest-mock";

/** Special context which is handled specially in the hacked runInContext method below */
const singleContexts = new WeakSet<Context>();

/** Remembered original runInContext method. */
const origRunInContext = Script.prototype.runInContext;

/**
 * Ugly hack to allow Jest to just use a single Node VM context. The Jest code in question is in a large private
 * method of the standard Jest runtime and it would be a lot of code-copying to create a custom runtime which
 * replaces the script run code. So we hack into the `script.runInContext` method instead to redirect it to
 * `script.runInThisContext` for vm contexts recorded in `singleContexts` set.
 */
Script.prototype.runInContext = function(context, options) {
    if (singleContexts.has(context)) {
        return this.runInThisContext(options);
    } else {
        return origRunInContext.call(this, context, options);
    }
}

// Copy from jest-environment-node
type Timer = {
    id: number;
    ref: () => Timer;
    unref: () => Timer;
};
const timerIdToRef = (id: number) => ({
    id,
    ref() {
        return this;
    },
    unref() {
        return this;
    },
});
const timerRefToId = (timer: Timer): number | undefined => timer?.id;

class SingleContextNodeEnvironment extends NodeEnvironment {
    constructor(config: JestEnvironmentConfig, context: EnvironmentContext) {
        super(config, context);

        // Use shared global environment for all tests
        this.global = global as unknown as Global.Global;

        // Recreate context using the shared global environment. This fixes the environment for ESM module stuff of Jest (which doesn't just use the context
        // for `script.runInContext`) but a few type mismatches are still there unfortunately. For CJS mode this is irrelevant because calls for
        // `script.runInContext` using this context are always redirected to `script.runInThisContext`. All this would not be necessary if we could just get
        // the CURRENT vm context. But Node API doesn't allow that.
        this.context = createContext(global);

        if (this.context != null) {
            // Record the VM context of this environment so the hacked `script.runInContext` redirects the call to `script.runInThisContext` for this context.
            singleContexts.add(this.context);
        }

        // Install fake timers again, this time with shared global environment
        this.fakeTimers = new LegacyFakeTimers({
            config: config.projectConfig,
            global,
            moduleMocker: this.moduleMocker as ModuleMocker,
            timerConfig: {
                idToRef: timerIdToRef,
                refToId: timerRefToId
            }
        });
        this.fakeTimersModern = new ModernFakeTimers({
            config: config.projectConfig,
            global
        });
    }
}

export = SingleContextNodeEnvironment;
