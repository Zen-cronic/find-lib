//index-1B https.request + index-4 layered nodes

"use strict";

const https = require("https");

/**
 * @typedef {Object} Options
 * @property {number} size - The size of the search.
 * @property {number} from - The starting point of the search.
 */

/**
 *
 * @param {string} searchQuery
 * @param {Options} options
 * @returns
 */
async function findModules(searchQuery, options) {
  let searchSize;
  let searchFrom;
  let response;

  try {
    if (options) {
      searchSize = options.size;
      searchFrom = options.from;

      response = await customFetch(
        `https://registry.npmjs.org/-/v1/search?text=${searchQuery}&size=${searchSize}&size=${searchFrom}`
      );
    } else {
      response = await customFetch(
        `https://registry.npmjs.org/-/v1/search?text=${searchQuery}`
      );
    }

    return response.data;
  } catch (error) {
    throw new Error(error);
  }

  //curl https://registry.npmjs.org/-/v1/search?text=${searchQuery}

  //   return response.data;
}
/**
 *
 * @param {string} name
 * @param {string} version
 * @returns {Promise<any>}
 */
async function findOneModule(name, version) {
  let response;

  try {
    response = await customFetch(
      `https://registry.npmjs.org/${name}/${version}`
    );

    const data = response.data;

    return data;
  } catch (error) {
    if (error.response.status === 404) {
      console.error("Package Not found with version");
    }

    return error;
  }
}

/**
 * @param {string} name
 * @param {string} version
 * @returns {Promise<"Error from findOneModule" | {deps: Object}>}
 */
async function getDeps(name, version) {
  if (typeof name !== "string" || typeof version !== "string") {
    throw new TypeError("name & version must be of type string");
  }

  const module = await findOneModule(name, version);

  if (module instanceof Error) {
    return "Error from findOneModule";
  }

  let deps = module["dependencies"];

  const depsExist = hasDeps(deps);

  //if nu {}, undefined and hard to debug

  if (!depsExist) {
    deps = {};
  }

  return deps;
}

function hasDeps(o) {
  if (!o) {
    console.log("0 dependencies");
    return false;
  }
  return true;
}

//return obj elem signature
// {
//     package: {
//       name: 'cross-spawn',
//       scope: 'unscoped',
//       version: '7.0.3',
//       description: 'Cross platform child_process#spawn and child_process#spawnSync',
//       keywords: [Array],
//       date: '2020-05-25T15:35:07.209Z',
//       links: [Object],
//       author: [Object],
//       publisher: [Object],
//       maintainers: [Array]
//     },
//     flags: { insecure: 0 },
//     score: { final: 0.3880367487895888, detail: [Object] },
//     searchScore: 100000.42
//   },
/**
 * @param {string} url
 * @returns {Promise<Object>}
 */
async function customFetch(url) {
  if (typeof url !== "string") {
    throw new TypeError("URL must be of type string");
  }

  const resultO = await new Promise((resolve, reject) => {
    const req = https.request(url, (res) => {
      let result = "";
      res.on("data", (data) => {
        result += data;
      });

      res.on("end", () => {
        //{
        // data: result,
        // headers
        // status
        // statusText
        // }

        const resolvedO = {
          data: result, //str later obj
          headers: res.headers,
          status: res.statusCode,
          statusText: res.statusMessage,
        };

        resolve(resolvedO);
      });

      res.on("error", reject);
    });

    req.on("error", (err) => {
      //   process.stderr.write(err);
      console.error(err);
      reject(err);
    });

    req.end();
  });

  //parse str
  const resultData = JSON.parse(resultO["data"]);

  //reassign as obj
  resultO["data"] = resultData;

  return resultO;
}

async function main() {
  // const foundModules = await findModules("cross-spawn", { size: 1 });
  const foundModules = await findModules("easy-dep-graph", { size: 1 });

  //if foundModules.objects.total !== provided => nth found?

  //access packages array via objects prop

  for (const module of foundModules.objects) {
    console.log(module);

    //create tree for each package

    const tree = new LibTree(module.package.name, module.package.version);
    // console.log(
    //   "name and version of each module: ",
    //   module.package.name,
    //   module.package.version
    // );
    await tree.addNodes();
    console.log("Nodes-added tree: ", JSON.stringify(tree, null, 2));
  }
}

//await
main();

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
   */
  async addNodes(node = this.root, layer = 0) {
    //this.root ALWAYS set as first node
    let currentNode = node;

    const apiDeps = await getDeps(currentNode.name, currentNode.version);

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
      const version = apiDeps[dep].replace("^", "");

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

/**
 *
 * @param {string} name
 * @param {string} version
 */
async function asyncGetDep(name, version) {
  //customFetch /name/version

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
