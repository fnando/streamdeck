/* eslint-disable no-console */
import path from "path";
import fs from "fs";
import childProcess from "child_process";
import { Action, Plugin, State } from "..";

const sourceDir = path.join(process.cwd(), "src");
const filesDir = path.join(sourceDir, "files");
const distDir = path.join(process.cwd(), "dist");
const pluginPath = path.join(distDir, "plugin.js");

const isFile = (name: string) => {
  try {
    return fs.statSync(path.join(distDir, name)).isFile();
  } catch (error) {
    return false;
  }
};

const assert = (passed: boolean, message: string) => {
  if (passed) {
    return;
  }

  console.error("ERROR:", message);
  process.exit(1);
};

const assertFile = (name: string) => {
  assert(
    isFile(name),
    `Expected "src/${name.replace(".js", ".ts")}" to exist.`,
  );
};

const assertImages = (
  name: string,
  {
    optional = false,
    extensions = ["png", "gif", "jpg"],
  }: { optional?: boolean; extensions?: string[] } = {},
) => {
  for (const extension of extensions) {
    const lowResImagePath = `${name}.${extension}`;
    const hiResImagePath = `${name}@2x.${extension}`;

    const lowResImageExists = isFile(lowResImagePath);
    const hiResImageExists = isFile(hiResImagePath);

    if (lowResImageExists && hiResImageExists) {
      return;
    }

    if (lowResImageExists && !hiResImageExists) {
      assert(false, `Expected "src/${hiResImagePath}" to be a file.`);
    }

    if (!lowResImageExists && hiResImageExists) {
      assert(false, `Expected "src/${lowResImagePath}" to be a file.`);
    }
  }

  if (optional) {
    return;
  }

  assert(
    false,
    `Expected "src/${name}.{${extensions.join(",")}}" and ` +
      `"src/${name}@2x.{${extensions.join(",")}}" to be set.`,
  );
};

function assertState(_plugin: Plugin, _action: Action, state: State) {
  assert(
    Boolean(state.imageName),
    `Expect state to have an image (${JSON.stringify(state)})`,
  );

  assertImages(
    `files/images/actions/${state.actionClass.name}/${state.imageName}`,
  );
}

function assertAction(plugin: Plugin, actionClass: typeof Action) {
  const actionName = actionClass.name;
  const action = new Action({ plugin });

  assertFile(`actions/${actionName}.js`);
  assertImages(`files/images/actions/${actionName}`);
  assertImages(`files/images/multiActions/${actionName}`, {
    optional: true,
  });

  assert(
    actionClass.states.length > 0,
    `Expected the action "${actionName}" to have at least 1 state.`,
  );

  assert(
    Boolean(actionClass.title),
    `Expected the action "${actionName}" to set a title.`,
  );

  actionClass.states.forEach((state) => assertState(plugin, action, state));
}

function validate(plugin: Plugin) {
  assertFile("plugin.js");
  assertFile("files/plugin.html");
  assertFile("files/propertyInspector.html");
  assertImages("files/images/plugin");
  assertImages("files/images/category", {
    optional: true,
    extensions: ["png"],
  });

  assert(Boolean(plugin.version), "Expected plugin to define `version`.");
  assert(
    plugin.actions.length > 0,
    "Expected plugin to have at least 1 action.",
  );
  assert(plugin.os.length > 0, "Expected plugin to set OS requirements.");

  plugin.actions.forEach((action) => assertAction(plugin, action));
}

export function bundle() {
  fs.rmSync(distDir, { recursive: true, force: true });
  childProcess.execSync("yarn build");
  childProcess.execFileSync("cp", ["-r", filesDir, distDir]);

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { default: defaultExport } = require(pluginPath);
  const plugin = defaultExport as Plugin;

  validate(plugin);

  fs.writeFileSync(
    "dist/manifest.json",
    JSON.stringify(plugin.toManifest(), null, 2),
  );
}
