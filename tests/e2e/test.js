require("jest-to-log");
const { describe, it, expect } = require("@jest/globals");
const { findLib } = require("../../lib/index");

describe("findLib", () => {
  describe("given that a valid search is made", () => {
    it("should display the correct tree structure", async () => {

      const testFn = async () => {
        await findLib("cross-spawn", { size: 1 });
      };
      const tree = {
        root: {
          deps: {
            "path-key": {
              deps: {},
              version: "3.1.0",
              name: "path-key",
            },
            "shebang-command": {
              deps: {
                "shebang-regex": {
                  deps: {},
                  version: "3.0.0",
                  name: "shebang-regex",
                },
              },
              version: "2.0.0",
              name: "shebang-command",
            },
            which: {
              deps: {
                isexe: {
                  deps: {},
                  version: "2.0.0",
                  name: "isexe",
                },
              },
              version: "2.0.1",
              name: "which",
            },
          },
          version: "7.0.3",
          name: "cross-spawn",
        },
        ttlDeps: 5,
        layers: 2,
        firstLayer: 3,
        _opts: {},
        earlyReturn: false,
      };
      const expectedTree = JSON.stringify(tree, null, 2);

      expect(testFn).toLogStdout(expectedTree);
    });
  });
});
