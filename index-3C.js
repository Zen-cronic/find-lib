// index-3B upgrade to recursion

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

const origTree = {
  root: {
    deps: {
      "path-key": {
        deps: {},
        version: "1.0.0",
        name: "path-key",
      },
      "shebang-command": {
        deps: {},
        version: "2.0.0",
        name: "shebang-command",
      },
      which: {
        deps: {},
        version: "3.0.1",
        name: "which",
      },
    },
    version: "3.2.4",
    name: "cross-spawn",
  },
};

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
  for (const dep in depsObj_1) {
    await addNodes(dep, depsObj_1[dep], depsObj_1);
  }

  async function addNodes(outerName, outerVersion, depsObj) {
    //   const name = dep;
    //   const version = depsObj.version;
    const nestedDeps_2 = await asyncGetDep(outerName, outerVersion);
    if (Object.keys(nestedDeps_2).length === 0) {
      console.log("2nd 0 deps");
    } else {
      console.log({ nestedDeps_2 });

      for (const innerDep in nestedDeps_2) {
        const name = innerDep;
        const version = nestedDeps_2[innerDep];
        console.log("name and version from for: ", name, version);
        console.log("depsObj: ", depsObj);
        //   let nestedDepsObj = depsObj[name]["deps"]
        let nestedDepsObj = depsObj[outerName]["deps"];

                // !!layer nu need cuz nestedDepsObj travers the nested layers
        //   if(layer > 0){
        //     nestedDepsObj = nestedDepsObj[name]["deps"]
        //   }
        
        //default: writable, configurable, enumerable: false
        Object.defineProperty(nestedDepsObj, name, {
          value: new LibNode(name, version, {}),
          writable: false,
          configurable: false,
          enumerable: true,
        });

        await addNodes(name, version, nestedDepsObj);
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
      };

      break;
  }

  return deps;
}
