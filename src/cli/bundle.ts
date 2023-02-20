/* eslint-disable no-console */
import path from "path";
import fs from "fs";
import imageSize from "image-size";
import glob from "glob";
import { build } from "esbuild";
import zipdir from "zip-dir";
import { Action, Plugin, State } from "..";
import { die } from "./helpers/die";

interface Params {
  dev?: boolean;
}

const sourceDir = path.join(process.cwd(), "src");

const isFile = (name: string, rootDir: string) =>
  Boolean(
    fs.statSync(path.join(rootDir, name), { throwIfNoEntry: false })?.isFile(),
  );

const assert = (passed: boolean, message: string) => {
  if (passed) {
    return;
  }

  console.error("ERROR:", message);
  process.exit(1);
};

const assertFile = (name: string, rootDir: string) => {
  assert(
    isFile(name, rootDir),
    `Expected "src/${name.replace(".js", ".ts")}" to exist.`,
  );
};

const assertImageSize = (name: string, size: number, distDir: string) => {
  try {
    const dimensions = imageSize(path.join(distDir, name));

    if (dimensions.width === size && dimensions.height === size) {
      return;
    }

    assert(
      false,
      `Expected "src/${name}" to be ${size}x${size} (got ${dimensions.width}x${dimensions.height}).`,
    );
  } catch (error) {
    assert(
      false,
      `Expected "src/${name}" to be ${size}x${size} (error: ${
        (error as Error).message
      }).`,
    );
  }
};

const assertImages = (
  name: string,
  {
    distDir,
    size,
    optional = false,
    extensions = ["png", "gif", "jpg"],
  }: {
    distDir: string;
    size: number;
    optional?: boolean;
    extensions?: string[];
  } = { distDir: "", size: 0 },
) => {
  for (const extension of extensions) {
    const lowResImagePath = `${name}.${extension}`;
    const hiResImagePath = `${name}@2x.${extension}`;
    const lowResImageExists = isFile(lowResImagePath, distDir);
    const hiResImageExists = isFile(hiResImagePath, distDir);

    if (lowResImageExists && hiResImageExists) {
      assertImageSize(lowResImagePath, size, distDir);
      assertImageSize(hiResImagePath, size * 2, distDir);

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

function assertState(
  _plugin: Plugin,
  _action: Action,
  state: State,
  distDir: string,
) {
  const actionName = state.action.constructor.name;
  const stateName = state.title || state.name || "<unnamed>";

  assert(
    Boolean(state.image),
    `Expect state "${stateName}" from "${actionName}" to have an image`,
  );

  if (state.fontSize > 18) {
    assert(
      false,
      `Expect state "${stateName}" from "${actionName}" to have font size up to 18`,
    );
  }

  assertImages(`images/actions/${actionName}/${state.image}`, {
    distDir,
    size: 72,
  });

  assertImages(`images/multiActions/${actionName}/${state.image}`, {
    distDir,
    size: 72,
    optional: true,
  });
}

function assertAction(plugin: Plugin, action: Action, distDir: string) {
  const actionName = action.constructor.name;

  assertFile(`actions/${actionName}.ts`, sourceDir);
  assertImages(`images/actions/${actionName}`, { size: 20, distDir });

  assert(
    action.states.length > 0,
    `Expected the action "${actionName}" to have at least 1 state.`,
  );

  assert(
    Boolean(action.name),
    `Expected the action "${actionName}" to set a name.`,
  );

  if (action.inspectorName) {
    assertFile(`inspectors/${action.inspectorName}.html`, sourceDir);
    assertFile(`inspectors/${action.inspectorName}.ts`, sourceDir);
  }

  action.states.forEach((state) => assertState(plugin, action, state, distDir));
}

function validate(plugin: Plugin, distDir: string) {
  assertImages("images/plugin", { size: 72, distDir });

  assertImages("images/category", {
    distDir,
    optional: true,
    extensions: ["png"],
    size: 28,
  });

  assert(Boolean(plugin.version), "Expected plugin to define `version`.");
  assert(
    plugin.actions.length > 0,
    "Expected plugin to have at least 1 action.",
  );
  assert(plugin.os.length > 0, "Expected plugin to set OS requirements.");

  plugin.actions.forEach((action) => assertAction(plugin, action, distDir));
}

async function compile(distDir: string, params: Params) {
  fs.rmSync(path.resolve("build"), { recursive: true, force: true });

  await build({
    entryPoints: [`${sourceDir}/plugin.ts`],
    bundle: true,
    keepNames: true,
    format: "cjs",
    target: "node16",
    logLevel: "silent",
    outfile: `${distDir}/plugin-node.js`,
    define: {
      __DEV__: JSON.stringify(params.dev),
    },
  });

  fs.writeFileSync(
    `${distDir}/run.ts`,
    `
    import plugin from "../../src/plugin";
    plugin.run();
    `,
  );

  const inspectors = glob.sync(`${sourceDir}/inspectors/*.ts`);

  const entryPoints = [
    path.join(sourceDir, "plugin.ts"),
    path.join(distDir, "run.ts"),
    path.join(sourceDir, "inspector.ts"),
    ...inspectors,
  ];

  await build({
    entryPoints,
    bundle: true,
    keepNames: true,
    platform: "browser",
    logLevel: "silent",
    outdir: distDir,
    define: {
      __DEV__: JSON.stringify(params.dev),
    },
  });

  glob.sync(`${distDir}/{src,build}/**/*.js`).forEach((filePath) => {
    fs.renameSync(filePath, path.join(distDir, path.basename(filePath)));
  });

  glob.sync(`${sourceDir}/locales/*.json`).forEach((filePath) => {
    try {
      const content = JSON.stringify(
        fs.readFileSync(filePath).toString("utf-8"),
      );

      if (!content || content?.constructor !== Object) {
        throw new Error("Invalid JSON file.");
      }
    } catch (e) {
      die(
        `ERROR: The file "${path.relative(
          process.cwd(),
          filePath,
        )}" is not a valid JSON file (expected an object).`,
      );
    }

    fs.copyFileSync(filePath, path.join(distDir, path.basename(filePath)));
  });

  fs.mkdirSync(path.join(distDir, "inspectors"), { recursive: true });

  inspectors.forEach((filePath) => {
    const fileName = path.basename(filePath).replace(".ts", ".js");

    fs.renameSync(
      path.join(distDir, fileName),
      path.join(distDir, "inspectors", fileName),
    );
  });

  fs.renameSync(`${distDir}/run.js`, `${distDir}/plugin.js`);
  fs.rmSync(`${distDir}/dist`, { recursive: true, force: true });
  fs.rmSync(`${distDir}/build`, { recursive: true, force: true });
  fs.rmSync(`${distDir}/src`, { recursive: true, force: true });
  fs.rmSync(`${distDir}/run.ts`, { recursive: true, force: true });

  fs.copyFileSync(`${sourceDir}/inspector.html`, `${distDir}/inspector.html`);

  glob.sync(path.join(sourceDir, "inspectors/*.html")).forEach((filePath) => {
    fs.copyFileSync(
      filePath,
      `${distDir}/inspectors/${path.basename(filePath)}`,
    );
  });

  const filesToCopy = glob.sync(`${sourceDir}/{images,css,previews}/**/*.*`);

  filesToCopy.sort();

  filesToCopy.forEach((filePath) => {
    const targetPath = path.join(
      distDir,
      path.relative(path.join(process.cwd(), "src"), filePath),
    );

    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.copyFileSync(filePath, targetPath);
  });

  fs.writeFileSync(
    `${distDir}/plugin.html`,
    '<script src="plugin.js"></script>',
  );
}

async function archive(pluginId: string, distDir: string) {
  const outputPath = path.join(
    process.cwd(),
    "release",
    `${pluginId}.streamDeckPlugin`,
  );

  fs.rmSync(outputPath, { force: true });
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  await zipdir(path.dirname(distDir), { saveTo: outputPath });
}

export async function bundle(params: Params) {
  assertFile("streamdeck.json", sourceDir);
  assertFile("plugin.ts", sourceDir);
  assertFile("inspector.html", sourceDir);
  assertFile("inspector.ts", sourceDir);
  assertFile("css/sdpi.css", sourceDir);
  assertFile("css/custom.css", sourceDir);
  assertFile("CHANGELOG.md", process.cwd());

  const config = require(`${sourceDir}/streamdeck.json`);
  const distDir = path.resolve(
    params.dev
      ? `build/dev.${config.id}.sdPlugin`
      : `build/${config.id}.sdPlugin`,
  );
  const pluginPath = path.join(distDir, "plugin-node.js");

  await compile(distDir, params);

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const plugin = require(pluginPath);

  assert(
    !(plugin.default instanceof Plugin),
    `Expected the default export to be an instance of Plugin.`,
  );

  validate(plugin.default, distDir);

  const manifest = plugin.default.toManifest();

  if (config.monitor) {
    manifest.ApplicationsToMonitor = config.monitor;
  }

  fs.writeFileSync(
    `${distDir}/manifest.json`,
    JSON.stringify(manifest, null, 2),
  );

  fs.rmSync(pluginPath);

  if (!params.dev) {
    await archive(plugin.default.id, distDir);
  }
}
