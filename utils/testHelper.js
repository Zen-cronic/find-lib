const { join } = require("path");
const { fork } = require("child_process");
const { existsSync } = require("fs");

module.exports = {
  setupTest,
};

/**
 * Sets up the test environment.
 * @param {...string} processFilePath - The path(s) to the test process file(s).
 */
function setupTest(...processFilePath) {
  const testProcessPath = join(__dirname, "..", "tests", ...processFilePath);

  let workerProcess;
  let testCaseNum = 0;

  /**
   * Creates worker process
   * @param {string} testProcessPath 
   */
  function createProcess(testProcessPath) {
    if (typeof testProcessPath !== "string" || !existsSync(testProcessPath)) {
      throw new Error("Test Process Path Does Not Exist");
    }

    workerProcess = fork(testProcessPath, {
      stdio: [0, "pipe", "pipe", "ipc"],

      env: Object.assign({}, process.env, { NODE_ENV: "test" }),
    });

    testCaseNum++;

    workerProcess.send(testCaseNum);

    workerProcess.stderr.pipe(process.stderr, { end: false });
    workerProcess.stdout.pipe(process.stdout, { end: false });
  }

  function createWorkerDataPromise() {
    return new Promise((resolve, reject) => {
      let data = "";

      workerProcess.stderr.on("data", (chunk) => {
        data += chunk;
      });

      workerProcess.stderr.once("end", () => {
        resolve(data);
      });

      workerProcess.stderr.once("error", reject);
    });
  }

  function createMessagePromise() {
    return new Promise((resolve, reject) => {
      workerProcess.once("error", reject);

      //once | on - either way, dependent on worker
      workerProcess.once("message", (message) => {
        if (message?.error) {
          reject(new Error(message.error));
        }
        resolve(message);
      });
    });
  }


  beforeEach(() => {
    
    createProcess(testProcessPath);
  });

  return { createMessagePromise, createWorkerDataPromise };
}
