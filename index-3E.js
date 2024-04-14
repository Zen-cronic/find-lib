// cht sol to index-3B
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
async function addNodes(node, deps) {
    for (const dep in deps) {
      const nestedDeps = await asyncGetDep(dep, deps[dep].version);
      if (Object.keys(nestedDeps).length === 0) {
        console.log("No more deps");
      } else {
        for (const innerDep in nestedDeps) {
          const name = innerDep;
          const version = nestedDeps[innerDep];

      
          if (!node.deps[dep]) {
            node.deps[dep] = new LibNode(dep, deps[dep].version, {});
          }
          node.deps[dep].deps[name] = new LibNode(name, version, {});
          await addNodes(node.deps[dep].deps[name], nestedDeps);
        }
      }
    }
  }
  
  (async () => {
    const crossSpawnTree = new LibTree("cross-spawn", "3.2.4", {
      "path-key": new LibNode("path-key", "1.0.0", {}),
      "shebang-command": new LibNode("shebang-command", "2.0.0", {}),
      which: new LibNode("which", "3.0.1", {}),
    });
  
    await addNodes(crossSpawnTree.root, crossSpawnTree.root.deps);
  
    console.log("------------\n\n" + "Modified spawn tree:\n");
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
  