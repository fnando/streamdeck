import childProcess from "child_process";

const url =
  "https://developer.elgato.com/documentation/stream-deck/sdk/overview/";
const openDebugMessage = `The docs url is ${url}`;

const handlers = {
  darwin: {
    open() {
      childProcess.spawnSync("open", [url]);
    },
  },

  win32: {
    open() {
      childProcess.spawnSync("start", [url]);
    },
  },

  default: {
    open() {
      console.log(openDebugMessage);
    },
  },
};

export function docs() {
  const handler =
    handlers[process.platform as keyof typeof handlers] ?? handlers.default;

  handler.open();
}
