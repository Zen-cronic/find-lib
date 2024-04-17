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
    //ltr: handle customError
    throw new Error(error);
  }

  //curl "https://registry.npmjs.org/-/v1/search?text="

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
      // if (error.status === 404) {
      // console.error("Package Not found with version");

      error.message = `Package "${name}" Not found with version "${version}"`;
    }

    // return error;
    // throw new Error(error);
    throw error;
  }
}

/**
 * @param {string} name
 * @param {string} version
 * @returns {Promise<Object>}
 */
async function getDeps(name, version) {
  try {
    if (typeof name !== "string" || typeof version !== "string") {
      throw new TypeError("name & version must be of type string");
    }
    const module = await findOneModule(name, version);

    let deps = module["dependencies"];

    const depsExist = hasDeps(deps);

    //if nu {}, undefined and hard to debug

    if (!depsExist) {
      deps = {};
    }

    //parse Version
    else {
      deps = parseVersion(deps);
    }

    return deps;
  } catch (error) {
    //error findOneModule
    console.error(
      `Error getting dependencies for ${name}@${version}: ${error.message}`
    );
    throw error; // if to be handled by higher levels
  }
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

        if (res.statusCode === 404) {
          //customError
          const error = new Error();
          error.name = "CustomFetchError";

          error.response = {
            data: res.statusMessage,
            headers: res.headers,
            status: res.statusCode,
            statusText: res.statusMessage,
          };
          reject(error);
        }

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

/**
 * @typedef {Object.<string, string>} ApiDeps
 */

/**
 *
 * @param {ApiDeps}  apiDeps
 */
function parseVersion(apiDeps) {
  const o = { ...apiDeps };

  for (const dep in o) {
    o[dep] = o[dep].replace("^", "");
  }

  return o;
}
async function main() {
  const foundModules = await findModules("cross-spawn", { size: 1 });
  // const foundModules = await findModules("easy-dep-graph", { size: 1 });

  //if foundModules.objects.total !== provided => nth found?

  //access packages array via objects prop

  for (const module of foundModules.objects) {
    console.log(module);

    //create tree for each package

    const tree = new LibTree(module.package.name, module.package.version);
    // const tree = new LibTree(module.package.name, "10.0.1");

    await tree.addNodes().then((t) => {
      console.log("Nodes-added tree: ", JSON.stringify(t, null, 2));
    });
    // console.log("Nodes-added tree: ", JSON.stringify(tree, null, 2));
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
        value: new LibNode(name, version),
        writable: false,
        configurable: false,
        enumerable: true,
      });

      this.ttlDeps++;

      await this.addNodes(nestedDeps[name], layer + 1);
    }

    // return currentNode
    return this;
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
