//reW index-3C recursion
"use strict";

class LibTree {
  //deps provided only for rootNode
  constructor(rootName, rootVersion, deps = {}) {
    // this[rootName] = n ew LibNode()  //unidiomatic
    this.root = new LibNode(rootName, rootVersion, deps);
  }
}

//ltr merge LibTree and LibNode cuz same arg to constructors
class LibNode {
  constructor(name, version, deps) {
    // this.deps = {};

    this.deps = deps;
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
  //constructed after search
  const crossSpawnTree = new LibTree("cross-spawn", "3.2.4", {
    "path-key": new LibNode("path-key", "1.0.0", {}),

    "shebang-command": new LibNode("shebang-command", "2.0.0", {}),

    which: new LibNode("which", "3.0.1", {}),
  });
  console.log(crossSpawnTree);
  //   console.log(JSON.stringify(crossSpawnTree, null, 2));
  const depsObj_1 = crossSpawnTree.root.deps;

  let i = 1;
  await addNodes(depsObj_1);

  async function addNodes(outerDeps, layer = 1) {
    for (const dep in outerDeps) {
      const outerName = dep;
      const outerVersion = outerDeps[dep].version;
      console.log("name and version from 1st layer: ", outerName, outerVersion);
      //   await addNodes(name, version, depsObj_1);

      const apiDeps = await asyncGetDep(outerName, outerVersion);
      console.log("layer before add: ", layer);
      if (
        Object.keys(apiDeps).length === 0 ||
        //  ||       Object.keys(apiDeps).length ===
        layer === Object.keys(outerDeps[outerName]["deps"]).length
      ) {
        console.log("2nd 0 deps");
    
        continue;
      } else {
        // console.log({ apiDeps });

        for (const innerDep in apiDeps) {
          const name = innerDep;
          const version = apiDeps[innerDep];

          const nestedDepsObj = outerDeps[outerName]["deps"];

          // !!layer nu need cuz nestedDepsObj travers the nested layers
          // BUT layer needed to check traversal when recursive goes back to parent call

          console.log(
            `prop ${name} alr E: `,
            nestedDepsObj.hasOwnProperty(name)
          );
          Object.defineProperty(nestedDepsObj, name, {
            value: new LibNode(name, version, {}),
            writable: false, //can be false - nu longer retraversed
            configurable: false,
            enumerable: true,
          });
          
          console.log(i++, outerName, " | ", name, );
          console.log({ nestedDepsObj });

          // console.log(JSON.stringify(nestedDepsObj, null, 2));
          await addNodes(nestedDepsObj, layer + 1);
        }
      }
    }
  }

  console.log("------------\n\n" + "Modifiend spawn tree:\n");
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
    //2nd layers
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

    //3rd layers

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
