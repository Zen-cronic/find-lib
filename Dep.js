const { getDeps } = require("./find");

class DepTree {
  constructor(rootName, rootVersion) {
    this.root = new DepNode(rootName, rootVersion);
    this.ttlDeps = 0;
    this.layers = 0;
    this.firstLayer = 0;
  }

  /**
   * @param {DepNode} [node=this.root]
   * @param {number} [layer=0]
   */
  async addNodes(node = this.root, layer = 0) {
    //this.root ALWAYS set as first node
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

      await this.addNodes(nestedDeps[name], layer + 1);
    }

    // return currentNode
    // return this;
    // return Promise.resolve(this)
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
