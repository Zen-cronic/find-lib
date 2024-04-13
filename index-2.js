//reW of index-1 with nested fn and this

"use strict";

const axios = require("axios").default;

module.exports = depsFn;

/**
 *
 * @param {string} searchQuery
 * @param {Object}[ options]
 * @returns
 */
async function depsFn(searchQuery, options) {
  if (!searchQuery || typeof searchQuery !== "string") {
    throw new Error("Must be a string argument");
  }

  /**
   * @returns {Promise<Array<any>>}
   */
  async function findModules() {
    let searchSize;
    let searchFrom;
    let response;
    if (options) {
      searchSize = options.size;
      searchFrom = options.from;
      response = await axios.get(
        `https://registry.npmjs.org/-/v1/search?text=${searchQuery}&size=${searchSize}`
      );
      //   response = await axios.get(
      //     `https://registry.npmjs.org/-/v1/search?text=${searchQuery}&size=${searchSize}&size=${searchFrom}`
      //   );
    } else {
      response = await axios.get(
        `https://registry.npmjs.org/-/v1/search?text=${searchQuery}`
      );
    }

    //curl https://registry.npmjs.org/-/v1/search?text=${searchQuery}
    //curl https://registry.npmjs.org/node-libcurl

    console.log({ searchSize });
    const data = response.data;
    // return data;
    return data.objects; //Array
  }

  /**
   *
   * @param {string} name
   * @param {string} version
   * @returns {Promise<any>}
   */
  async function findOneModule(name, version) {
    // console.log("name and version from findOneModule: ", name, version);
    let response;

    try {
      //default to latest
      //   if (!version) {
      //     response = await axios.get(`https://registry.npmjs.org/${name}`);
      //   } else {
      //     response = await axios.get(
      //       `https://registry.npmjs.org/${name}/${version}`
      //     );
      //   }
      response = await axios.get(
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
   *    @param {string} name
   * @param {string} version
   * @returns {string | Object}
   */
  async function getDeps(name, version) {
    let deps;
    //extract name and version? from globalLike - class ||
    //traverse params from getDeps() to findOneModule()

    console.log("name and version from getDeps: ", name, version);

    const module = await findOneModule(name, version);

    if (module instanceof Error) {
      return "Error from findOneModule";
    }

    // console.log({module});
    //determine if module is Version or Pac
    //Package
    // if (module["dist-tags"]) {
    //   //&& module["versions"]
    //   const latestVersion = module["dist-tags"]["latest"];
    //   deps = module.versions[latestVersion].dependencies;

    //   console.log({ latestVersion });

    //   //Version  module["version"]
    // } else {
    //   deps = module["dependencies"];
    // }

    deps = module["dependencies"]

    //deps obj:
    //{which: v
    //shebang-command: v
    //path-key: v}

    if (checkDepsExist(deps)) {

        for(const name in deps){
            //consider when deps is undefined,e.g, path-key has no deps
            console.log("name and v from for-in getDeps: ", name, deps[name].substring(1));
            deps = await getDeps(name, deps[name].substring(1))
            // return deps
        }
      // await getDeps()
    //   return deps
    }
    // else{
    //     return 
    // }

    //if nu {}, undefined and hard to debug
    // return { deps };
    return deps;
  }

  function checkDepsExist(o) {
    if (!o) {
      console.log("0 dependencies");
      return false;
    }
    return true;
  }

  const result = await findModules();

  //   const depsTree = {}
  //for each result,
  for (let i = 0; i < result.length; i++) {
    const lib = result[i].package;
    // console.log(lib);
    const depsObj = await getDeps(lib.name, lib.version);
    // console.log({ depsObj });

    const depsTree = {};
    //for each entry in depsObj, search for dep using [key] as name, [value] as version

    depsTree[lib.name] = { version: lib.version, dep: depsObj };

    console.log(depsTree);
  }
  //   return depsTree
}

// const moduleV = await findOneModule("debug", "4.3.4"); //error return undefined

// console.log(JSON.stringify(moduleV, null, 2));

// const depsObj = await getDeps();
// console.log(depsObj);

async function main() {
  //   const modules = await depsFn("debug", { size: 2 });
  const modules = await depsFn("cross-spawn", { size: 1 });

//   console.log(JSON.stringify(modules, null, 2));
}

main();
