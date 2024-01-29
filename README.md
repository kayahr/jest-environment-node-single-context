Single-context Node.js environment for Jest
===========================================

One of Jest's key features is context isolation so tests can't have side-effects on other tests by manipulating the global context. In theory that's a good idea but in practice the current implementation messes around with global types in a way which breaks pretty much all instanceof checks in tests against standard types like Uint8Array for example.

See [Jest issue #2549](https://github.com/facebook/jest/issues/2549) for details.

This small project provides a single-context Node.js environment which effectively sacrifices the context isolation feature by using a single context for all tests so instanceof checks works again as expected.

Alternatively you may want to try [jest-light-runner] which tackles the problem right at the base with a new test runner implementation instead of hacking the standard test runner of Jest.


Usage
-----

* Install dependency:

    ```
    npm install -D jest-environment-node-single-context
    ```

* Add this property to your Jest config:

    ```
    testEnvironment: "jest-environment-node-single-context"
    ```

[jest-light-runner]: https://www.npmjs.com/package/jest-light-runner
