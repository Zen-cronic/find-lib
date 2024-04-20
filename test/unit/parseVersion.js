/**
 *
 * @param {ApiDeps}  apiDeps
 */
function parseVersion(apiDeps) {
  const o = { ...apiDeps };

  for (const dep in o) {
    o[dep] = o[dep].replace(/[~^v\s]/g, ""); //err out when ||, cuz 405 not handled

    // handle || - prefer latest

    if (/\|\|/.test(o[dep])) {
      const [l, r] = o[dep].split("||");

      //both single digits
      if (isSingleDigitStr(l) && isSingleDigitStr(r)) {
        o[dep] = Math.max(+l, +r).toString() + ".0.0";

      }

      //both d.d.d
      else {
        const [dl, dr] = [l, r].map((v) => {
          //the str digit  out of [0], [1], [2]
          const o = { firstDigit: v.split(".")[0], fullVersion: v };
          return o;
        });

        // o[dep] = Math.max(+dl, +dr)
        const maxNum = Math.max(+dl.firstDigit, +dr.firstDigit);

        o[dep] = [dl, dr].find((v) => maxNum === +v.firstDigit).fullVersion;
      }
    }
    // if (isSingleDigitStr(o[dep])) {
    //   o[dep] += ".0.0";
    // }
    // if (/^\d$/.test(o[dep])) {
    //   o[dep] += ".0.0";
    // }
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

// const deps = { minimatch: "2 || 3" };
// const deps = { minimatch: "2.1.2 || 3.4.3" };
const deps = { minimatch: "^3 ||^2" };
console.log(deps);

const result = parseVersion(deps);
console.log({ result });
