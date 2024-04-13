// skeleton class for nodes




class LibTree {
  constructor(deps, version) {
    // this.root = new LibNode() // instead the search result e./g/ cross-spawn
    this.root = new LibNode(deps, version);
  }
}
class LibNode {
  constructor(deps, version) {
    // this.deps = {}
    // this.version = ""
    this.deps = deps;
    this.version = version;
  }
}

const sampleTree = {
  "cross-spawn": {
    version: "3.0.0",
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

//constructed upon search
const crossSpawnTree = new LibTree(
  {
    "path-key": {
      version: "1.0.0",
      deps: {},
    },
    "shebang-command": {
      version: "2.0.0",
      deps: {},
    },
    which: {
      version: "3.0.1",
      deps: {},
    },
  },
  "2.0.0"
);
console.log(crossSpawnTree);

// for(const dep in sampleTree["cross-spawn"].deps){
for (const dep in crossSpawnTree.root.deps) {
  const nestedDeps = asyncFetchDep(dep, crossSpawnTree.root.version);
  if (Object.keys(nestedDeps).length === 0) {
    console.log("0 deps");
  } else {
    console.log({ nestedDeps });

    // crossSpawnTree.root.deps[dep].deps = new LibNode(nestedDeps, Object.values(nestedDeps)[0])
    // crossSpawnTree.root.deps[dep] = new LibNode(nestedDeps, Object.values(nestedDeps)[0]) //each dep overriden
    const name = Object.keys(nestedDeps)[0];
    const version = Object.values(nestedDeps)[0];
    crossSpawnTree.root.deps[dep] = new LibNode(
      {
        name: {
          version: Object.values(nestedDeps)[0],
          deps: {},
        },
      },
      Object.values(nestedDeps)[0]
    );
  }
}

console.log(JSON.stringify(crossSpawnTree, null, 2));
/**
 *
 * @param {string} name
 * @param {string} version
 */
function asyncFetchDep(name, version) {
  //async fetch to axios /name/version

  let deps = {};
  switch (name) {
    case "path-key":
      //nu dep

      break;
    case "shebang-command":
      deps = { "shebang-regex": "1.0.0" };
      break;
    case "which":
      deps = { isexe: "2.4.5" };
      break;
  }

  return deps;
}
