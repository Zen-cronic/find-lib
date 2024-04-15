// https.request > axios

const https = require("https");

const axios = require("axios").default;

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
  let response;
  if (options) {
    searchSize = options.size;
    searchFrom = options.from;

    response = await customFetch(
      `https://registry.npmjs.org/-/v1/search?text=${searchQuery}&size=${searchSize}&size=${searchFrom}`
    );
    //   axios.get(
    //     `https://registry.npmjs.org/-/v1/search?text=${searchQuery}&size=${searchSize}&size=${searchFrom}`
    //   );
  } else {
    response = await customFetch(
      `https://registry.npmjs.org/-/v1/search?text=${searchQuery}`
    );
    //   axios.get(`https://registry.npmjs.org/-/v1/search?text=${searchQuery}`);
  }

  //curl https://registry.npmjs.org/-/v1/search?text=${searchQuery}

  // console.log(searchSize);
  // console.log({ response });
  return response.data;
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
  return { deps };
}

function checkDepsExist(o) {
  if (!o) {
    console.log("0 dependencies");
  }
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
        // console.log(JSON.parse(d.toString()));

        // process.stdout.write(d);
        // process.stdout.write(JSON.stringify(d.toString(), null, 2));
      });

      //   console.log(res.headers);
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
  //find modules testing
  const foundModules = await findModules("cross-spawn", { size: 2 });

  //if foundModules.objects.total !== provided => nth found?

  //access packages array via objects prop
//   console.log(foundModules);

    for(const package of foundModules.objects){

        console.log(package);
    }
}

//await
main();
