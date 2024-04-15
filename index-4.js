//cont'd index-3s (esp 3D)
//clean up Classes
"use strict";

class LibTree {
  constructor(rootName, rootVersion) {
    this.root = new LibNode(rootName, rootVersion);
    this.ttlDeps = 0;
    this.layers = 0;
    this.firstLayer = 0;
  }

  /**
   * @param {LibNode} [node=this.root]
   * @param {number} [layer=0]
   * @returns {Promise<void>}
   */
  async addNodes(node = this.root, layer = 0) {
    //this.root ALWAYS set as first node
    let currentNode = node;

    const apiDeps = await asyncGetDep(currentNode.name, currentNode.version);

    const apiDepsLen = Object.keys(apiDeps).length;

    //deps count
    if (apiDepsLen) {
      this.layers = layer + 1;
    }

    //1st layer
    if (layer === 0) {
      this.firstLayer = apiDepsLen;
    }

    for (const dep in apiDeps) {
      const name = dep;
      const version = apiDeps[dep];

      const nestedDeps = currentNode["deps"];

      //dev check
      if (nestedDeps.hasOwnProperty(name)) {
        throw new Error("Traversed more than once!");
      }

      Object.defineProperty(nestedDeps, name, {
        value: new LibNode(name, version),
        writable: false,
        configurable: false,
        enumerable: true,
      });

      this.ttlDeps++;

      await this.addNodes(nestedDeps[name], layer + 1);
    }
  }
}

//name prop MAY be dropped
class LibNode {
  constructor(name, version) {
    this.deps = {};
    this.version = version;
    this.name = name;
  }
}

const modifiedTree = {
  root: {
    deps: {
      "path-key": {
        deps: {},
        version: "1.0.0",
        name: "path-key",
      },
      "shebang-command": {
        deps: {
          "regex-extra": {
            deps: {
              regex: {
                deps: {},
                version: "12.0.0",
                name: "regex",
              },
              extra: {
                deps: {},
                version: "10.0.0",
                name: "extra",
              },
            },
            version: "5.0.0",
            name: "regex-extra",
          },
          "shebang-regex": {
            deps: {},
            version: "1.0.0",
            name: "shebang-regex",
          },
        },
        version: "2.0.0",
        name: "shebang-command",
      },
      which: {
        deps: {
          isexe: {
            deps: {
              is: {
                deps: {},
                version: "0.0.1",
                name: "is",
              },
              exe: {
                deps: {},
                version: "0.2.0",
                name: "exe",
              },
            },
            version: "2.4.5",
            name: "isexe",
          },
          "another-isexe": {
            deps: {},
            version: "5.4.2",
            name: "another-isexe",
          },
        },
        version: "3.0.1",
        name: "which",
      },
    },
    version: "3.2.4",
    name: "cross-spawn",
  },
  ttlDeps: 11,
  layers: 3,
  firstLayer: 3,
};

(async () => {
  const crossSpawnTree = new LibTree("cross-spawn", "3.2.4");
  //   const crossSpawnTree = new LibTree("scope-logger", "1.1.0");
  // const crossSpawnTree = new LibTree("debug", "1.1.0");
  //   const crossSpawnTree = new LibTree("easy-dep-graph", "1.1.0");

  console.log({ crossSpawnTree });
  console.log("ttlDeps b4: ", crossSpawnTree.ttlDeps);

  //   console.log("root", crossSpawnTree.root);
  await crossSpawnTree.addNodes();
  console.log("ttlDeps aft: ", crossSpawnTree.ttlDeps);

  console.log("------------\n\n" + "Nodes-added tree:\n");
  console.log(JSON.stringify(crossSpawnTree, null, 2));
})();

/**
 *
 * @param {string} name
 * @param {string} version
 */
async function asyncGetDep(name, version) {
  //async fetch to axios /name/version

  let deps = {};
  switch (name) {
    //0th layer:
    case "cross-spawn":
      deps = {
        "path-key": "1.0.0",
        "shebang-command": "2.0.0",
        which: "3.0.1",
      };

      break;

    //1st layers
    case "path-key":
      //nu dep

      break;
    case "shebang-command":
      deps = {
        "regex-extra": "5.0.0",
        "shebang-regex": "1.0.0",
      };
      break;
    case "which":
      deps = {
        isexe: "2.4.5",
        "another-isexe": "5.4.2",
      };
      break;

    //2nd layers

    case "isexe":
      deps = {
        is: "0.0.1",
        exe: "0.2.0",
      };
      break;

    case "another-isexe":
      //nu dep
      break;

    case "regex-extra":
      deps = {
        regex: "12.0.0",
        extra: "10.0.0",
        // extreme: "10.0.0",
      };

      break;

    //0 layer , 0 deps
    case "scope-logger":
      break;

    //1 layer , 1 dep
    case "debug":
      deps = {
        ms: "4.3.4",
      };
      break;

    //1 layer, 4 dep in 1st
    case "easy-dep-graph":
      deps = {
        fastify: "10.0.0",
        mustache: "2.0.0",
        open: "3.0.0",
        shelljs: "4.0.0",
      };
      break;
  }

  return deps;
}
