const { DepTree } = require("./Dep.js");
const { findModules, findOneModule } = require("./finder.js");

module.exports = { findLib };

/**
 * @typedef {import('./js-doc.js').DepOptions} DepOptions
 */
/**
 * @typedef {import('./js-doc.js').FindOptions} FindOptions
 */

/**
 *
 * @param {string} searchQuery
 * @param {FindOptions} [findOpts]
 */
async function findLib(searchQuery, findOpts) {
  let foundModules;

  // findModules("cross-spawn")
  // "dist-tags": {lastest: "x.y.z" }
  if (findOpts === undefined) {
    foundModules = await findOneModule(searchQuery);
  } else {
    // findModules("cross-spawn", { size: 1 });
    const { size = 1 } = findOpts;
    foundModules = await findModules(searchQuery, { size });
  }

  // LTR: if foundModules.objects.total !== provided => nth found?

  const ttlDeps = findOpts?.ttlDeps;
  const firstLayer = findOpts?.firstLayer;

  if (ttlDeps && firstLayer) {
    throw new TypeError(
      `DepOptions fields 'ttlDeps' and 'firstLayer' are mutually exclusive; Current parameter: ${JSON.stringify(
        findOpts,
        null,
        2
      )}`
    );
  }

  const depOpts = ttlDeps
    ? { ttlDeps }
    : firstLayer
    ? { firstLayer }
    : undefined;

  const foundModulesResult = foundModules.objects;

  if (!Array.isArray(foundModulesResult)) {
    const tree = new DepTree(
      foundModules.name,
      foundModules["dist-tags"]["latest"],
      depOpts
    );

    await tree.addNodes();

    process.stderr.write(JSON.stringify(tree, null, 2));
  } else {
    for (const module of foundModulesResult) {
      const tree = new DepTree(
        module.package.name,
        module.package.version,
        depOpts
      );

      await tree.addNodes();

      //false if passes depOpts
      if (!tree.earlyReturn) {
        process.stderr.write(JSON.stringify(tree, null, 2));
      } else {
        process.stderr.write("depOpts option failed");
      }
    }
  }
}
