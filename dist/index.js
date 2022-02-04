"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.State = exports.Action = exports.Plugin = exports.OS = exports.run = void 0;
function run(plugin) {
    window.connectElgatoStreamDeckSocket = function connectElgatoStreamDeckSocket(port, uuid, registerEvent, info) {
        console.log({ info });
        const socket = new WebSocket(`ws://127.0.0.1:${port}`);
        plugin.socket = socket;
        plugin.uuid = uuid;
        socket.onopen = () => {
            socket.send(JSON.stringify({
                event: registerEvent,
                uuid,
            }));
        };
        socket.onmessage = ({ data }) => {
            const payload = JSON.parse(data);
            console.log({ payload });
        };
        socket.onclose = () => { };
    };
}
exports.run = run;
class OS {
    constructor(params) {
        this.minimumVersion = params.minimumVersion;
        this.platform = params.platform;
    }
    toManifest() {
        return {
            Platform: this.platform,
            MinimumVersion: this.minimumVersion,
        };
    }
}
exports.OS = OS;
class Plugin {
    constructor(params) {
        var _a;
        this.version = "";
        this.sdkVersion = 2;
        this.url = "";
        this.name = "";
        this.author = "";
        this.minimumSoftwareVersion = "5.0";
        this.category = "";
        this.description = "";
        this.actions = [];
        this.os = [];
        this.id = "";
        this.uuid = "";
        this.description = params.description;
        this.url = params.url;
        this.author = params.author;
        this.name = params.name;
        this.id = params.id;
        this.actions = params.actions;
        this.version = params.version;
        this.os = (_a = params.os) !== null && _a !== void 0 ? _a : [
            new OS({ platform: "windows", minimumVersion: "10" }),
            new OS({ platform: "mac", minimumVersion: "10.11" }),
        ];
    }
    toManifest() {
        const snippet = {
            Author: this.author,
            Actions: this.actions.map((a) => {
                a.pluginId = this.id;
                return a.toManifest();
            }),
            CodePath: "files/plugin.html",
            Icon: "files/images/plugin",
            Name: this.name,
            PropertyInspectorPath: "files/propertyInspector.html",
            Version: this.version,
            SDKVersion: this.sdkVersion,
            Software: { MinimumVersion: this.minimumSoftwareVersion },
            OS: this.os.map((o) => o.toManifest()),
        };
        const optionals = [
            ["Category", this.category, this.category],
            ["URL", this.url, this.url],
        ];
        if (this.category) {
            snippet.CategoryIcon = "files/images/category";
        }
        optionals.forEach(([prop, condition, value]) => {
            if (condition) {
                snippet[prop] = value;
            }
        });
        return snippet;
    }
}
exports.Plugin = Plugin;
class Action {
    constructor(params) {
        this.plugin = params.plugin;
    }
    static toManifest() {
        const snippet = {
            Icon: `files/actions/${this.name}`,
            UUID: `${this.pluginId}.${this.name}`,
            Name: this.title,
            States: this.states.map((s) => s.toManifest()),
        };
        const optionals = [
            [
                "PropertyInspectorPath",
                this.propertyInspectorName,
                `propertyInspectors/${this.name}.html`,
            ],
            ["Tooltip", this.tooltip, this.tooltip],
            [
                "SupportedInMultiActions",
                this.hasMultiActionSupport === false,
                this.hasMultiActionSupport,
            ],
        ];
        optionals.forEach(([prop, condition, value]) => {
            if (condition) {
                snippet[prop] = value;
            }
        });
        return snippet;
    }
    get id() {
        return `${this.plugin.id}.${this.constructor.name}`;
    }
    handleKeyUp() { }
    handleKeyDown() { }
    handleWillAppear() { }
    handleSettingsDidLoad() { }
    handleGlobalSettingsDidLoad() { }
    toManifest() {
        const actionClass = this.constructor;
        const snippet = {
            Icon: `files/images/`,
            Name: actionClass.title,
            States: actionClass.states.map((s) => s.toManifest()),
        };
        const optionals = [
            [
                "PropertyInspectorPath",
                actionClass.propertyInspectorName,
                `propertyInspectors/${actionClass.propertyInspectorName}.html`,
            ],
        ];
        optionals.forEach(([prop, condition, value]) => {
            if (condition) {
                snippet[prop] = value;
            }
        });
        return snippet;
    }
}
exports.Action = Action;
Action.pluginId = "";
Action.title = "";
Action.tooltip = "";
Action.hasMultiActionSupport = true;
Action.propertyInspectorName = "";
Action.states = [];
class State {
    constructor(params) {
        this.showTitle = true;
        this.name = "";
        this.title = "";
        this.imageName = "";
        this.multiActionImageName = "";
        this.actionClass = params.actionClass;
        this.imageName = params.imageName;
    }
    toManifest() {
        const actionName = this.actionClass.name;
        const snippet = {
            Image: `src/files/images/actions/${actionName}/${this.imageName}`,
        };
        const optionals = [
            [
                "MultiActionImage",
                this.multiActionImageName,
                `src/files/images/actions/${actionName}/${this.multiActionImageName}`,
            ],
            ["Name", this.name, this.name],
            ["Title", this.title, this.title],
            ["ShowTitle", this.showTitle === false, this.showTitle],
        ];
        optionals.forEach(([prop, condition, value]) => {
            if (condition) {
                snippet[prop] = value;
            }
        });
        return snippet;
    }
}
exports.State = State;
//# sourceMappingURL=index.js.map