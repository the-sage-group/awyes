#!/usr/bin/env node
const fs = require("fs");
const child_process = require("child_process");

// Run the cloudview interface
if (fs.existsSync("./.awyes")) {
  fs.rmSync("./.awyes", { recursive: true });
}
child_process.spawnSync("git", [
  "clone",
  "https://github.com/the-sage-group/awyes.git",
  ".awyes",
]);
child_process.spawnSync("npm", ["install"], { cwd: "./.awyes/cloudview" });
fs.cpSync("./awyes.ts", "./.awyes/cloudview/clients/awyes.ts");
fs.cpSync("./package.json", "./.awyes/cloudview/clients/package.json");
child_process.spawnSync("npm", ["install"], {
  cwd: "./.awyes/cloudview/clients",
});
const cloudview = child_process.spawn("npm", [
  "run",
  "dev",
  "--prefix",
  "./.awyes/cloudview",
]);
cloudview.stdout.on("data", (data) => console.log(data.toString()));
cloudview.stderr.on("data", (data) => console.log(data.toString()));
