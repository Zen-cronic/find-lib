//functions
"use strict";

const https = require("https");
const { Logger } = require("scope-logger");

const logger = new Logger("Fns");

// logger.disabled = true

module.exports = { getDeps, findModules };
/**
 * @typedef {Object} SearchOptions
 * @property {number} size - The size of the search.
 * @property {number} from - The starting point of the search.
 */

/**
 *
 * @param {string} searchQuery
 * @param {SearchOptions} [searchOpts]
 * @returns
 */
async function findModules(searchQuery, searchOpts) {
  let searchSize;
  let searchFrom;
  let response;

  try {
    if (searchOpts) {
      searchSize = searchOpts.size;
      searchFrom = searchOpts.from;

      response = await customFetch(
        `https://registry.npmjs.org/-/v1/search?text=${searchQuery}&size=${searchSize}`
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
    } else if (error.response.status === 405) {
      error.message = `Package "${name}" with version "${version}" Fetch Error`;
    }

    throw error;
  }
}

/**
 * @param {string} name
 * @param {string} version
 * @returns {Promise<Object>}
 */
async function getDeps(name, version) {
  logger.log({ name });
  logger.log({ version });
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
    // console.log("0 dependencies");
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
    throw new TypeError(`URL must be of type string: ${url}`);
  }

  // logger.log({ url });

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

        if (res.statusCode >= 400 && res.statusCode < 500) {

          //TC: if 404 (Not Found) -> fallback: retry Once w latest ver (w/o ver in api url) 

          if(res.statusCode == 404){
            console.log({url});
          }
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

//case: iconv-lite's safer-buffer: >= 2.1.2 < 3.0.0
//or >1.0.2 <= 2.3.4
/**
 *
 * @param {ApiDeps}  apiDeps
 */
function parseVersion(apiDeps) {
  // console.log({apiDeps});
  const o = { ...apiDeps };

  logger.log({ o });

  for (const dep in o) {
    console.log("orig o[dep]", o[dep]);

    //+ive lookhead for v
    //trailing -d+ but not -letter+

    o[dep] = o[dep].replace(/[~^\s]|v(?=\d+)|-\d+/g, "");
    o[dep] = o[dep].replace("x", "31");
    // assumed: both l & r same characteristics
    if (/\|\|/.test(o[dep])) {
      const [l, r] = o[dep].split("||");

      //both single digits
      if (isSingleDigitStr(l) && isSingleDigitStr(r)) {
        o[dep] = Math.max(+l, +r);
      }

      //both d.d.d
      else {
        const [sl, sr] = [l, r].map((v) => {
          const o = {
            firstDigit: v.split(".")[0], //the str digit  out of [0], [1], [2]
            fullVersion: v,
          };
          return o;
        });

        const maxNum = Math.max(+sl.firstDigit, +sr.firstDigit);

        o[dep] = [sl, sr].find((v) => maxNum === +v.firstDigit).fullVersion;
      }
    }

    console.log("whitespaced removed o[dep]", o[dep]);
    // >=< regex
    // subcase: >=< w/ d.d.d-d
    const equalityRangeRegex = /(>=|>)(\d+\.\d+\.\d+)(<=|<)(\d+\.\d+\.\d+)/;

    const singleEqualityRangeRegex = /(>=|>)(\d+\.\d+\.\d+)/;
    //remove every occurence of "-d" (most 2) see abv
    // o[dep] = o[dep].replace(/-\d+/g, "")

    const matched = o[dep].match(equalityRangeRegex);

    const singleMatched = o[dep].match(singleEqualityRangeRegex);

    //e.g.
    // matched: [
    //   '>=4.0.0<4.1.0',
    //   '>=',
    //   '4.0.0',
    //   '<',
    //   '4.1.0',
    //   index: 0,
    //   input: '>=4.0.0<4.1.0',
    //   groups: undefined
    // ]

    if (matched) {
      console.log({ matched });
      const lv = matched[2];
      const rv = matched[4];

      const greaterThan = matched[1];
      const lessThan = matched[3];

      if (lessThan === "<=") {
        o[dep] = rv;
      }
      // <
      else {
        const [d1, d2, d3] = rv.split(".");

        if (+d3 === 0) {
          if (greaterThan === ">=") {
            o[dep] = lv;
          }
          // >
          else {
            o[dep] = "Fetch from registry";
          }
        } else {
          o[dep] = "Fetch from registry";
        }
      }

      // singleMatched: [
      //   '>=0.0.4',
      //   '>=',
      //   '0.0.4',
      //   index: 0,
      //   input: '>=0.0.4',
      //   groups: undefined
      // ]
    } else if (!matched && singleMatched) {
      console.log({singleMatched});
      o[dep] = singleMatched[2];
    } else {
      console.log("No matched");
    }

    if (isSingleDigitStr(o[dep])) {
      o[dep] += ".0.0";
    }
  }

  return o;
}

/**
 * @param {string} s
 * @returns {boolean}
 */
function isSingleDigitStr(s) {
  if (/^\d$/.test(s)) {
    return true;
  }
  return false;
}
