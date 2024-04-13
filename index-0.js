// from streams/index-4


app.get("/", async function (req, res) {
    // const context = res
  
    // const packageId = "debug"
    // const packageId = "scope-logger"
    const packageId = "node-libcurl";
    const response = await axios.get(`https://registry.npmjs.org/${packageId}`);
  
    //or
    // const responses = exec("curl https://registry.npmjs.org/debug", {encoding: "utf-8"},
    // (err, stdout, stderr) => {
  
    //     if(err){
    //         console.error(err)
    //     }
  
    //     console.log(stdout);
    // })
  
    //curl https://registry.npmjs.org/node-libcurl
  
    //canNOt access .data properties on non-awaited response!
  
    const data = response.data;
  
    // const latestVersion = "4.3.4"
    // const latestVersion = "1.1.0"
    const latestVersion = data["dist-tags"]["latest"];
  
    console.log({ latestVersion });
  
    //for node-libcurl
    // {
    //     '@mapbox/node-pre-gyp': '1.0.11',
    //     'env-paths': '2.2.0',
    //     nan: '2.18.0',
    //     'node-gyp': '10.0.1',
    //     npmlog: '7.0.1',
    //     rimraf: '5.0.5',
    //     tslib: '2.6.2'
    //   }
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
    return res.end();
    // return res.end()
  });