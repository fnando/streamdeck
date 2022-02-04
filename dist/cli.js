"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yargs_1 = __importDefault(require("yargs"));
const bundle_1 = require("./cli/bundle");
(0, yargs_1.default)(process.argv.slice(2))
    .usage("Usage: $0 <command> [options]")
    .command("bundle", "Build ", (_argv) => (0, bundle_1.bundle)())
    .help()
    .strictCommands()
    .demandCommand(1)
    .parse();
//# sourceMappingURL=cli.js.map