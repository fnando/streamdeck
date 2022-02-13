import path from "path";
import os from "os";
import fs from "fs";

import { bundle } from "./bundle";

function getData() {
  const pluginsDir = path.join(
    os.homedir(),
    "Library/Application Support/com.elgato.StreamDeck/Plugins",
  );
  const config = require(path.join(process.cwd(), "src/streamdeck.json"));
  const distDir = path.join(process.cwd(), `build/dev.${config.id}.sdPlugin`);
  const targetPath = path.join(pluginsDir, `dev.${config.id}.sdPlugin`);

  return { pluginsDir, distDir, targetPath };
}

function die(message: string) {
  console.error(message);
  process.exit(1);
}

export function unlink() {
  const { targetPath } = getData();

  if (fs.existsSync(targetPath)) {
    fs.unlinkSync(targetPath);
  }
}

export async function link(params: { force?: boolean }) {
  await bundle({ dev: true });

  const { targetPath, distDir } = getData();

  if (fs.existsSync(targetPath)) {
    if (!params.force) {
      die(
        `ERROR: Couldn't link the extension because "${targetPath}" already exists.`,
      );
    }

    fs.rmSync(targetPath, { recursive: true, force: true });
  }

  fs.symlinkSync(distDir, targetPath);
}
