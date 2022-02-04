import yargs from "yargs";

import {bundle} from "./cli/bundle";

// import fs from "fs";
// import path from "path";
// import glob from "glob";

// function writeFile(filePath: string, contents: string) {
//   fs.mkdirSync(path.dirname(filePath), { recursive: true });
//   fs.writeFileSync(
//     filePath,
//     contents
//   );
// }

yargs(process.argv.slice(2))
  .usage("Usage: $0 <command> [options]")
  .command(
    "bundle",
    "Build ",
    (_argv) => bundle(),
  )
  .help()
  .strictCommands()
  .demandCommand(1)
  .parse();
