//cont'd index-3s (esp 3D)
//clean up Classes
"use strict";

class LibTree {
  constructor(rootName, rootVersion) {
    this.root = new LibNode(rootName, rootVersion);
  }

  /**
   * @param {LibNode} [node=this.root]
   * @returns {Promise<void>}
   */
  async addNodes(node = this.root) {
    //this.root ALWAYS sent as first node
    let currentNode = node;

    const apiDeps = await asyncGetDep(currentNode.name, currentNode.version);

    for (const dep in apiDeps) {
      const name = dep;
      const version = apiDeps[dep];

      const nestedDepsObj = currentNode["deps"];

      //dev check
      if (nestedDepsObj.hasOwnProperty(name)) {
        throw new Error("Traversed more than once!");
      }

      Object.defineProperty(nestedDepsObj, name, {
        value: new LibNode(name, version),
        writable: false,
        configurable: false,
        enumerable: true,
      });

      await this.addNodes(nestedDepsObj[name]);
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
};

(async () => {
  const crossSpawnTree = new LibTree("cross-spawn", "3.2.4");

  console.log({ crossSpawnTree });

  //   console.log("root", crossSpawnTree.root);
  await crossSpawnTree.addNodes();

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
  }

  return deps;
}
