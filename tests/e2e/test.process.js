const findLib = require("../../lib/main");

(async function () {

  //case 1
  await findLib("cross-spawn",{size:1} )

 //case 2
//  await findLib("express", {size:1})

//  await findLib("pino", {size:1})
})();
