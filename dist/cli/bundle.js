"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bundle = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const child_process_1 = __importDefault(require("child_process"));
const __1 = require("..");
const sourceDir = path_1.default.join(process.cwd(), "src");
const filesDir = path_1.default.join(sourceDir, "files");
const distDir = path_1.default.join(process.cwd(), "dist");
const pluginPath = path_1.default.join(distDir, "plugin.js");
const isFile = (name) => {
    try {
        return fs_1.default.statSync(path_1.default.join(distDir, name)).isFile();
    }
    catch (error) {
        return false;
    }
};
const assert = (passed, message) => {
    if (passed) {
        return;
    }
    console.error("ERROR:", message);
    process.exit(1);
};
const assertFile = (name) => {
    assert(isFile(name), `Expected "src/${name.replace(".js", ".ts")}" to exist.`);
};
const assertImages = (name, { optional = false, extensions = ["png", "gif", "jpg"], } = {}) => {
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
    assert(false, `Expected "src/${name}.{${extensions.join(",")}}" and ` +
        `"src/${name}@2x.{${extensions.join(",")}}" to be set.`);
};
function assertState(_plugin, _action, state) {
    assert(Boolean(state.imageName), `Expect state to have an image (${JSON.stringify(state)})`);
    assertImages(`files/images/actions/${state.actionClass.name}/${state.imageName}`);
}
function assertAction(plugin, actionClass) {
    const actionName = actionClass.name;
    const action = new __1.Action({ plugin });
    assertFile(`actions/${actionName}.js`);
    assertImages(`files/images/actions/${actionName}`);
    assertImages(`files/images/multiActions/${actionName}`, {
        optional: true,
    });
    assert(actionClass.states.length > 0, `Expected the action "${actionName}" to have at least 1 state.`);
    assert(Boolean(actionClass.title), `Expected the action "${actionName}" to set a title.`);
    actionClass.states.forEach((state) => assertState(plugin, action, state));
}
function validate(plugin) {
    assertFile("plugin.js");
    assertFile("files/plugin.html");
    assertFile("files/propertyInspector.html");
    assertImages("files/images/plugin");
    assertImages("files/images/category", {
        optional: true,
        extensions: ["png"],
    });
    assert(Boolean(plugin.version), "Expected plugin to define `version`.");
    assert(plugin.actions.length > 0, "Expected plugin to have at least 1 action.");
    assert(plugin.os.length > 0, "Expected plugin to set OS requirements.");
    plugin.actions.forEach((action) => assertAction(plugin, action));
}
function bundle() {
    fs_1.default.rmSync(distDir, { recursive: true, force: true });
    child_process_1.default.execSync("yarn build");
    child_process_1.default.execFileSync("cp", ["-r", filesDir, distDir]);
    const { default: defaultExport } = require(pluginPath);
    const plugin = defaultExport;
    validate(plugin);
    fs_1.default.writeFileSync("dist/manifest.json", JSON.stringify(plugin.toManifest(), null, 2));
}
exports.bundle = bundle;
//# sourceMappingURL=bundle.js.map