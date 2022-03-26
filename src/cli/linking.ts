import path from "path";
import os from "os";
import fs from "fs";

import { bundle } from "./bundle";
import { die } from "./helpers/die";

const pluginDirs = {
  darwin: path.join(
    os.homedir(),
    "Library/Application Support/com.elgato.StreamDeck/Plugins",
  ),
  win32: path.join(
    process.env.APPDATA ?? path.join(os.homedir(), "AppData/Roaming"),
    "Elgato/StreamDeck/Plugins",
  ),
};

function getData() {
  const pluginsDir: string =
    (pluginDirs[process.platform as keyof typeof pluginDirs] as string) ??
    die("ERROR: Your operating system is not supported by this command.");
  const config = require(path.join(process.cwd(), "src/streamdeck.json"));
  const distDir = path.join(process.cwd(), `build/dev.${config.id}.sdPlugin`);
  const targetPath = path.join(pluginsDir, `dev.${config.id}.sdPlugin`);

  return { pluginsDir, distDir, targetPath };
}

export function unlink() {
  const { targetPath } = getData();

  try {
    fs.unlinkSync(targetPath);
  } catch (error) {
    // noop
  }
}

export async function link(params: { force?: boolean }) {
  await bundle({ dev: true });

  const { targetPath, distDir } = getData();
  const targetStat = fs.lstatSync(targetPath, { throwIfNoEntry: false });

  if (targetStat) {
    if (!params.force) {
      die(
        `ERROR: Couldn't link the extension because "${targetPath}" already exists.`,
      );
    }

    fs.rmSync(targetPath, { recursive: true, force: true });
  }

  fs.symlinkSync(distDir, targetPath, "junction");
}
