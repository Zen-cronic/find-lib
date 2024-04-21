const { getDeps } = require("./find");

class DepTree {
  /**
   * @typedef {Object} TtlDepsOptions
   * @property {number} ttlDeps - The total dependencies of a lib, including nested.
   */

  /**
   * @typedef {Object} FirstLayerOptions
   * @property {number} firstLayer - The number of dependencies in the 1st layer.
   */

  /**
   * @typedef {TtlDepsOptions | FirstLayerOptions} DepOptions
   */

  /**
   * Creates a new DepTree instance.
   *
   * @class
   * @param {string} rootName - The name of the root dependency.
   * @param {string} rootVersion - The version of the root dependency.
   * @param {DepOptions} depOpts - Options for the dependency tree.
   */
  constructor(rootName, rootVersion, depOpts) {
    this.root = new DepNode(rootName, rootVersion);
    this.ttlDeps = 0;
    this.layers = 0;
    this.firstLayer = 0;

    this._opts = depOpts;
    this.earlyReturn = false;
  }

  /**
   * @param {DepNode} [node=this.root]
   * @param {number} [layer=0]
   */
  async addNodes(node = this.root, layer = 0) {
    let currentNode = node;

    const apiDeps = await getDeps(currentNode.name, currentNode.version);
    // const apiDeps = await getDeps(currentNode.name, "10.20.1");   //version not found

    const apiDepsLen = Object.keys(apiDeps).length;

    //deps count
    if (apiDepsLen) {
      this.layers = layer + 1;
    }

    //1st layer
    if (layer === 0) {
      this.firstLayer = apiDepsLen;

      //but 1st layer NOT added yet
      // if (this.firstLayer > this._opts.firstLayer) {
      //   // throw new Error("More than specified deps count for FIRST layer");
      //   this.ttlDeps = this.firstLayer;
      //   return;
      // }
    }

    for (const dep in apiDeps) {
      if (this.earlyReturn) {
        return;
      }

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

      if (
        this._opts.ttlDeps !== undefined &&
        this.ttlDeps > this._opts.ttlDeps
      ) {
        // console.log("current ttlDeps:", this.ttlDeps, this._opts.ttlDeps);
        this.earlyReturn = true;
        return;
      }

      if (
        this._opts.firstLayer !== undefined &&
        this.firstLayer > this._opts.firstLayer
      ) {
        const condition =
          Object.keys(apiDeps).findIndex((v) => v === name) === apiDepsLen - 1;
        if (condition) {
          this.earlyReturn = true;
          return;
        }

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

//name prop MAY be dropped
class DepNode {
  constructor(name, version) {
    this.deps = {};
    this.version = version;
    this.name = name;
  }
}
module.exports = { DepTree };
