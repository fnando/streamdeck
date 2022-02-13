import childProcess from "child_process";
import fs from "fs";
import Registry from "rage-edit";

interface Params {
  action: string;
}

function die(message: string) {
  console.error(message);
  process.exit(1);
}

const debuggerUrl = "http://127.0.0.1:23654/";
const browserPaths = [
  "/Applications/Google Chrome.app",
  "/Applications/Brave Browser.app",
  "/Applications/Microsoft Edge.app",
  "/Applications/Opera.app",
];

const enableSuccessMessage =
  "Debugging mode has been enabled. Please restart the Stream Deck app.";
const enableErrorMessage = "ERROR: Couldn't enable the debugging mode.";
const disableSuccessMessage =
  "Debugging mode has been disabled. Please restart the Stream Deck app.";
const disableErrorMessage = "ERROR: Couldn't disable debugging mode.";
const openDebugMessage = `The debugger url is ${debuggerUrl}`;

const handlers = {
  darwin: {
    enable() {
      const result = childProcess.spawnSync("defaults", [
        "write",
        "com.elgato.StreamDeck",
        "html_remote_debugging_enabled",
        "-bool",
        "YES",
      ]);

      if (result.status === 0) {
        console.log(enableSuccessMessage);
      } else {
        die("ERROR: Couldn't enable debugging mode.");
      }
    },

    disable() {
      const result = childProcess.spawnSync("defaults", [
        "write",
        "com.elgato.StreamDeck",
        "html_remote_debugging_enabled",
        "-bool",
        "NO",
      ]);

      if (result.status === 0) {
        console.log(disableSuccessMessage);
      } else {
        die(disableErrorMessage);
      }
    },

    open() {
      const browserPath = browserPaths.find((path) => fs.existsSync(path));

      if (browserPath) {
        const result = childProcess.spawnSync("open", [
          "-a",
          browserPath,
          debuggerUrl,
        ]);

        if (result.status === 0) {
          return;
        }
      }

      console.log(openDebugMessage);
    },
  },

  win32: {
    async enable() {
      try {
        await Registry.set(
          "HKCU\\Software\\Elgato Systems GmbH\\StreamDeck",
          "html_remote_debugging_enabled",
          1,
        );

        console.log(enableSuccessMessage);
      } catch (e) {
        die(enableErrorMessage);
      }
    },

    async disable() {
      try {
        await Registry.set(
          "HKCU\\Software\\Elgato Systems GmbH\\StreamDeck",
          "html_remote_debugging_enabled",
          0,
        );

        console.log(disableSuccessMessage);
      } catch (e) {
        die(disableErrorMessage);
      }
    },

    open() {
      const result = childProcess.spawnSync("start", [debuggerUrl]);

      if (result.status === 0) {
        return;
      }

      console.log(openDebugMessage);
    },
  },

  default: {
    open() {
      console.log(openDebugMessage);
    },

    enable() {
      die("ERROR: Your operating system is not supported by this command.");
    },

    disable() {
      die("ERROR: Your operating system is not supported by this command.");
    },
  },
};

export function debug(params: Params) {
  const handler =
    handlers[process.platform as keyof typeof handlers] ?? handlers.default;

  if (params.action === "enable") {
    handler.enable();
  } else if (params.action === "disable") {
    handler.disable();
  } else {
    handler.open();
  }
}
