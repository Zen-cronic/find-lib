const fork = require("child_process").fork;
const path = require("path");
const assert = require("assert");
const fs = require("fs");

const { Logger } = require("scope-logger");

(async function () {
  const logger = new Logger("Test-log");

  // console.log("args", process.argv);

  const currentWorkingFile = process.argv[2];
  const modulePath = path.join(__dirname, "..", currentWorkingFile);
  if (!fs.existsSync(modulePath)) {
    throw new Error("File does not exists");
  }
  const subProcess = fork(modulePath, {
    stdio: ["ignore", "pipe", "pipe", "ipc"],
  });

  //to view stdout of sub in main
  // subProcess.stdout.pipe(process.stdout, { end: false });

  const resultPromise = await new Promise((resolve, reject) => {
    let result = "";
    subProcess.stdout.on("data", (data) => {
      result += data;
    });

    subProcess.stdout.once("error", reject);

    subProcess.stdout.once("end", () => {
      resolve(result);
    });
  });

  if (typeof resultPromise !== "string") {
    throw new Error("Not a string");
  }

  const modifiedTree = {
    root: {
      deps: {
        "path-key": {
          deps: {},
          version: "1.0.0",
          name: "path-key",
        },
        "shebang-command": {
          deps: {
            "regex-extra": {
              deps: {
                regex: {
                  deps: {},
                  version: "12.0.0",
                  name: "regex",
                },
                extra: {
                  deps: {},
                  version: "10.0.0",
                  name: "extra",
                },
              },
              version: "5.0.0",
              name: "regex-extra",
            },
            "shebang-regex": {
              deps: {},
              version: "1.0.0",
              name: "shebang-regex",
            },
          },
          version: "2.0.0",
          name: "shebang-command",
        },
        which: {
          deps: {
            isexe: {
              deps: {
                is: {
                  deps: {},
                  version: "0.0.1",
                  name: "is",
                },
                exe: {
                  deps: {},
                  version: "0.2.0",
                  name: "exe",
                },
              },
              version: "2.4.5",
              name: "isexe",
            },
            "another-isexe": {
              deps: {},
              version: "5.4.2",
              name: "another-isexe",
            },
          },
          version: "3.0.1",
          name: "which",
        },
      },
      version: "7.0.3",
      name: "cross-spawn",
    },
    ttlDeps: 11,
    layers: 3,
    firstLayer: 3
  };
  const expected = JSON.stringify(modifiedTree);
  // const { logBody } = logger.log({ expected });

  //JSON.stringified has no colourcode, whitespace, no \n
  console.log({expected});

  // console.log({logBody}); // \n and whitespace and lowercase

  console.log({ resultPromise }); //this output from another process has \n, whitespaces, not lowercase

  // const formattedResultPromise = resultPromise.replace(/(\n+)(\s{1,})/g, "").toLowerCase()
  const formattedResultPromise = resultPromise
    .replace(/[\n\s]/g, "")
    // .toLowerCase();
  console.log({ formattedResultPromise });

  // if(formattedResultPromise.includes(expected)){
  //   console.log("\nMatching");
  // }
  // else{
  //   throw new Error("Test fail")
  // }

  assert.ok(formattedResultPromise.includes(expected));
})();
