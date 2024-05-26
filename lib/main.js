const { DepTree } = require("./Dep");
const { findModules } = require("./finder");
const { Logger } = require("scope-logger");

module.exports = findLib

/**
 *
 * @param {string} searchQuery
 * @param {Object} [searchOpts]
 * @param {Object} [depOpts]
 */
async function findLib(searchQuery, searchOpts, depOpts) {
  // const foundModules = await findModules("cross-spawn", { size: 1 });
  const foundModules = await findModules(searchQuery, searchOpts);

  //if foundModules.objects.total !== provided => nth found?

  const logger = new Logger("Lazy");

  for (const module of foundModules.objects) {
    // logger.log({ module });

    // const opts = { ttlDeps: 4 }; //cross-spawn: 5
    // const opts = { firstLayer: 3 };

    const tree = new DepTree(
      module.package.name,
      module.package.version,
      depOpts
    );

    await tree.addNodes(); //NOT returning

    //false if passes depOpts
    if (!tree.earlyReturn) {
      console.log("Nodes-added tree: ", JSON.stringify(tree, null, 2));
      // console.error(JSON.stringify(tree, null, 2));  + \n
      process.stderr.write(JSON.stringify(tree, null, 2));
    } else {
      // console.error("depOpts option failed");
      process.stderr.write("depOpts option failed");
    }
  }
}
