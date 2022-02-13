import yargs from "yargs";

import { bundle } from "./cli/bundle";
import { create } from "./cli/create";
import { images } from "./cli/images";
import { debug } from "./cli/debug";
import { release } from "./cli/release";
import { docs } from "./cli/docs";
import { styleGuide } from "./cli/styleGuide";
import { link, unlink } from "./cli/linking";

yargs(process.argv.slice(2))
  .usage("Usage: $0 <command> [options]")
  .command(
    "bundle",
    "Build files under `build` directory. While developing, use `--dev` to generate the files that can be linked to Stream Deck's plugins directory. It'll generate the `.streamDeckPlugin` otherwise.",
    (yargs) =>
      yargs.options({
        dev: {
          type: "boolean",
          describe:
            "Build files without generating the .streamDeckPlugin file.",
        },
      }),
    (argv) => bundle(argv),
  )
  .command(
    "release",
    "Release a new version of the plugin. This command will export a new bundle, make a new commit, tag it with the provided version, alter CHANGELOG.md, and push to your Git's repo origin source.",
    (yargs) =>
      yargs.version(false).options({
        version: {
          type: "string",
          demandOption: true,
          describe:
            "The version to be release, following semantic versioning (e.g. 1.0.0)",
        },
      }),
    (argv) => release(argv),
  )
  .command(
    "create [path]",
    "Create a new Stream Deck extension",
    (yargs) =>
      yargs
        .positional("path", {
          type: "string",
          describe: "The extension path.",
          demandOption: true,
        })
        .options({
          name: {
            demandOption: true,
            describe: "The human-readable name of the extension.",
            type: "string",
          },
          id: {
            demandOption: true,
            describe: "A reversed-DNS format that identifies the extension.",
            type: "string",
          },
          author: { describe: "The author name.", default: "" },
          email: { describe: "The author email.", default: "" },
          url: { describe: "The extension url.", default: "" },
          description: {
            describe: "The extension description.",
            default: "Your new Stream Deck plugin",
          },
          github: {
            default: "",
            describe:
              "Your Github user. When present, an origin pointing to Github will be added.",
          },
          gitlab: {
            default: "",
            describe:
              "Your Gitlab user. When present, an origin pointing to Gitlab will be added.",
          },
          install: {
            default: true,
            describe: "Install dependencies using npm.",
          },
        }),
    (argv) => create(argv),
  )
  .command("images", "Create file with embedded images", (_argv) => images())
  .command(
    "link",
    "Link the dist directory to Stream Deck's plugin directory.",
    (yargs) =>
      yargs.options({
        force: {
          type: "boolean",
          describe: "Replace installed extension, if any.",
        },
      }),
    (argv) => link(argv),
  )
  .command("unlink", "Remove the Stream Deck directory's link.", (_argv) =>
    unlink(),
  )
  .command("docs", "Open Elgato's docs.", (_argv) => docs())
  .command("styleguide", "Show Elgato's style guide", (_argv) => styleGuide())
  .command(
    "debug [action]",
    "Manage debugging mode.",
    (yargs) =>
      yargs.positional("action", {
        choices: ["open", "enable", "disable"],
        type: "string",
        default: "open",
      }),
    (argv) => debug({ action: argv.action }),
  )
  .help()
  .strictCommands()
  .demandCommand(1)
  .parse();
