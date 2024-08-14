const { getDeps } = require("./finder");

/**
 * @typedef {import('./js-doc.js').DepOptions} DepOptions
 */

class DepTree {
  /**
   * Creates a new DepTree instance.
   *
   * @class
   * @param {string} rootName - The name of the root dependency.
   * @param {string} rootVersion - The version of the root dependency.
   * @param {DepOptions} [depOpts] - Options for the dependency tree.
   */
  constructor(rootName, rootVersion, depOpts) {
    this.root = new DepNode(rootName, rootVersion);
    this.ttlDeps = 0;
    this.layers = 0;
    this.firstLayer = 0;

    this._opts = depOpts || {};
    this.earlyReturn = false;
  }

  /**
   * @param {DepNode} [node=this.root]
   * @param {number} [layer=0]
   */
  async addNodes(node = this.root, layer = 0) {
    if (this.earlyReturn) {
      return;
    }

    let currentNode = node;

    const apiDeps = await getDeps(currentNode.name, currentNode.version);
    // const apiDeps = await getDeps(currentNode.name, "10.20.1");   //version not found

    const apiDepsKeysArr = Object.keys(apiDeps);
    const apiDepsLen = apiDepsKeysArr.length;

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
        value: new DepNode(name, version),
        writable: false,
        configurable: false,
        enumerable: true,
      });

      this.ttlDeps++;

      if (this.ttlDeps > this._opts?.ttlDeps) {
        // console.log("current ttlDeps:", this.ttlDeps, this._opts.ttlDeps);
        this.earlyReturn = true;
        return;
      }

      if (this.firstLayer > this._opts?.firstLayer) {
        const condition =
          apiDepsKeysArr.findIndex((v) => v === name) === apiDepsLen - 1;
        if (condition) {
          this.earlyReturn = true;
          return;
        }

        //continue till last elem of 1st layer
        continue;
      }
      await this.addNodes(nestedDeps[name], layer + 1);
    }

    // return true

    // if (this.ttlDeps > this._opts.ttlDeps) {
    //   console.log("current ttlDeps:", this.ttlDeps, this._opts.ttlDeps);
    //   // throw new Error("More than specified dep");
    //   return false;
    // }
    // else{
    //   return true
    // }
  }
}

class DepNode {
  /**
   * @class
   * @param {string} name
   * @param {string} version
   */
  constructor(name, version) {
    this.deps = {};
    this.version = version;
    this.name = name;
  }
}
module.exports = { DepTree };
