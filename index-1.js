const axios = require("axios").default;

async function main() {
  /**
   *
   * @param {string} searchQuery
   * @param {Object} options
   * @returns
   */
  async function findModules(searchQuery, options) {
    let searchSize;
    let response;
    if (options) {
      searchSize = options.size;
      searchFrom = options.from;
      // response = await axios.get(`https://registry.npmjs.org/-/v1/search?text=${searchQuery}&size=${searchSize}`);
      response = await axios.get(
        `https://registry.npmjs.org/-/v1/search?text=${searchQuery}&size=${searchSize}&size=${searchFrom}`
      );
    } else {
      response = await axios.get(
        `https://registry.npmjs.org/-/v1/search?text=${searchQuery}`
      );
    }

    //curl https://registry.npmjs.org/-/v1/search?text=${searchQuery}
    //curl https://registry.npmjs.org/node-libcurl

    console.log(searchSize);
    const data = response.data;
    return data;

    const latestVersion = data["dist-tags"]["latest"];

    console.log({ latestVersion });

    const depObj = data.versions[latestVersion].dependencies;
    if (depObj) {
      let ttlDep = 0;

      for (const dep in depObj) {
        const depVer = depObj[dep];

        const response = await axios.get(
          `https://registry.npmjs.org/${dep}/${depVer}`
        );

        const data = response.data;

        const latestVersion = data["dist-tags"]["latest"];

        const innerDepObj = data.versions[latestVersion].dependencies;
        console.log("- ", innerDepObj);
      }
      //for each dep
      //for each dep
      //for each dep until !dependencies || !versions[latestVersion].dependencies

      console.log(depObj);
    } else if (!Object.keys(depObj)) {
      console.log("Nu dep obj");
    } else {
      console.log("Only devDep");
      console.log(data.versions[latestVersion].devDependencies);
    }

    // return res.end()
  }

  /**
   *
   * @param {string} name
   * @param {string} [version=undefined]
   * @returns {Promise<any>}
   */
  async function findOneModule(name, version = undefined) {
    let response;

    try {
      //default to latest
      if (!version) {
        response = await axios.get(`https://registry.npmjs.org/${name}`);
      } else {
        response = await axios.get(
          `https://registry.npmjs.org/${name}/${version}`
        );
      }

      const data = response.data;

      return data;
    } catch (error) {
      if (error.response.status === 404) {
        console.error("Package Not found with version");
      }
      // console.error(error.toJSON());
      // console.error(error.code);
      // console.error("Error: ", error.message);
      return error;
    }
  }

  /**
   *
   * @returns {string | Object}
   */
  async function getDeps() {
    let deps;
    //extract name and version? from globalLike - class ||
    //traverse params from getDeps() to findOneModule()

    // const module = await findOneModule("debug", "4.3.4");
    const module = await findOneModule("scope-logger", "1.1.0");

    if (module instanceof Error) {
      return "Error from findOneModule";
    }

    //determine if module is Version or Package
    //Package
    if (module["dist-tags"]) {
      //&& module["versions"]
      const latestVersion = module["dist-tags"]["latest"];
      deps = module.versions[latestVersion].dependencies;

      console.log({ latestVersion });

      //Version  module["version"]
    } else {
      deps = module["dependencies"];
    }

    checkDepsExist(deps);

    //if nu {}, undefined and hard to debug
    return {deps};
  }

  function checkDepsExist(o) {
    if (!o) {
      console.log("0 dependencies");
    }
  }
  // const modules = await findModules("scope-logger", {size: 2})
  // const modules = await findModules("scope-logger")

  // const modules = await findModules("stream", {size: 3, from: 2})
  // console.log(modules);
  // console.log(JSON.stringify(modules.objects, null, 2));
  // console.log("result length: ", modules.objects.length);

  //one module wo version
  const module = await findOneModule("scope-logger");
  // console.log(JSON.stringify(module, null, 2));

  //one module w version
  // const moduleV = await findOneModule("scope-logger", "1.1.0")
  const moduleV = await findOneModule("debug", "4.3.4"); //error return undefined

  console.log(JSON.stringify(moduleV, null, 2));

  const depsObj = await getDeps();
  console.log(depsObj);
}

main();
