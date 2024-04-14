// index-3A reW

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

const sampleTree = {
  "cross-spawn": {
    version: "3.2.4",
    deps: {
      "path-key": {
        version: "1.0.0",
        deps: {},
      },
      "shebang-command": {
        version: "2.0.0",
        deps: {
          "shebang-regex": {
            version: "1.0.0",
            deps: {},
          },
        },
      },
      which: {
        version: "3.0.1",
        deps: {
          isexe: {
            version: "2.4.5",
            deps: {},
          },
        },
      },
    },
  },
};

(async () => {
  //constructed upon search
  const crossSpawnTree = new LibTree("cross-spawn", "3.2.4", {
    "path-key": new LibNode("path-key", "1.0.0", {}),

    "shebang-command": new LibNode("shebang-command", "2.0.0", {}),

    which: new LibNode("which", "3.0.1", {}),
  });
  console.log(crossSpawnTree);
  // console.log(JSON.stringify(crossSpawnTree, null, 2));


  const depsObj_1 = crossSpawnTree.root.deps;
  for (const dep in depsObj_1) {
    const nestedDeps_2 = await asyncGetDep(dep, depsObj_1.version);
    if (Object.keys(nestedDeps_2).length === 0) {
      console.log("2nd 0 deps");
     
    } else {
      
      console.log({ nestedDeps_2 });

      for (const innerDep in nestedDeps_2) {
        const name = innerDep;
        const version = nestedDeps_2[innerDep];

        // depsObj[dep]["deps"] ={ [name]:  new LibNode(name , version , {})}

        //consider case for 1+ deps

        const nestedDepsObj = depsObj_1[dep]["deps"];

        console.log(
          `prop ${name} alr E: `,
          nestedDepsObj.hasOwnProperty(name)
        );

        //default: writable, configurable, enumerable: false
        Object.defineProperty(nestedDepsObj, name, {
          value: new LibNode(name, version, {}),
          writable: false,
          configurable: false,
          enumerable: true,
        });

        //Obj.defProp or
        // nestedDepsObj[name] = new LibNode(name, version, {})


        const nestedDeps_3 = await asyncGetDep(innerDep, version);

        if (Object.keys(nestedDeps_3).length === 0) {
          console.log("3rd 0 deps");
        } else {
          console.log({ nestedDeps_3 });

          for (const anotherInnerDep in nestedDeps_3) {
            const name = anotherInnerDep;
            const version = nestedDeps_3[anotherInnerDep];

            const nestedDepsObj = depsObj_1[dep]["deps"][innerDep]["deps"]

            console.log(
              `prop ${name} alr E: `,
              nestedDepsObj.hasOwnProperty(name)
            );
            nestedDepsObj[name] = new LibNode(name, version, {});
          }
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
