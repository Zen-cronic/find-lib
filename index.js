//index-5 upgrades: ttlCount + 1st layer warning
//aka index-6

const { DepTree } = require("./Dep");
const { findModules } = require("./find");
const {Logger} = require("scope-logger")

async function main() {
  const foundModules = await findModules("easy-dep-graph", { size: 1 });
  // const foundModules = await findModules("easy-dep-graph", { size: 1 });

  //if foundModules.objects.total !== provided => nth found?

  //access packages array via objects prop

  const logger = new Logger("Lazy")

  for (const module of foundModules.objects) {
    // console.log(module);
    logger.log({module})

    //create tree for each package

    const tree = new DepTree(module.package.name, module.package.version);
    // const tree = new DepTree(module.package.name, "10.0.1");

    await tree.addNodes() //NOT returning
    console.log("Nodes-added tree: ",JSON.stringify(tree, null, 2));

      //thenable BUT infinite instance method calls
    //  tree.addNodes().then((t) => {
    //   console.log("Nodes-added tree: ", JSON.stringify(t, null, 2));
    // });

  }
}

//await
main();



