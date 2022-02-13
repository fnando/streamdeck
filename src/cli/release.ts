import path from "path";
import fs from "fs";

import { bundle } from "./bundle";
import { exec } from "./helpers/exec";
import { die } from "./helpers/die";

export async function release(params: { version: string }) {
  const cwd = process.cwd();
  const streamDeckConfigPath = path.join(cwd, "src", "streamdeck.json");

  if (!fs.existsSync(streamDeckConfigPath)) {
    die(`ERROR: Expected "src/streamdeck.json" to be a file.`);
  }

  const config = require(streamDeckConfigPath);

  fs.writeFileSync(
    streamDeckConfigPath,
    JSON.stringify({ ...config, version: params.version }, null, 2),
  );

  await bundle({ dev: false });
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const changelogPath = path.join(cwd, "CHANGELOG.md");
  let changelog = fs.readFileSync(changelogPath).toString("utf-8");

  if (!params.version.match(/^\d+\.\d+\.\d+$/)) {
    die("ERROR: Version must be a semantic versioning string like 1.0.0");
  }

  if (!changelog.includes("## Unreleased")) {
    die(`ERROR: Couldn't find the "## Unreleased" section of your changelog.`);
  }

  const date = new Date().toISOString().substring(0, 10);

  changelog = changelog.replace(
    "## Unreleased",
    `## v${params.version} - ${date}`,
  );

  fs.writeFileSync(changelogPath, changelog);

  exec("git", ["add", "src/streamdeck.json", "CHANGELOG.md", "release/"], {
    error: "Couldn't add files to Git's stage.",
    cwd,
  });

  exec("git", ["commit", "--message", `Release v${params.version}.`], {
    error: "Couldn't commit files.",
    cwd,
  });

  exec("git", ["tag", `v${params.version}`], {
    error: "Couldn't tag commit.",
    cwd,
  });

  exec("git", ["push"], { error: "Couldn't push code.", cwd });
  exec("git", ["push", "--tags"], { error: "Couldn't push tags.", cwd });

  console.log(`${config.name} v${params.version} has been released.`);
}
