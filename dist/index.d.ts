declare global {
    interface Window {
        connectElgatoStreamDeckSocket: (port: number, uuid: string, registerEvent: string, info: unknown) => void;
    }
}
export declare function run(plugin: Plugin): void;
declare type Platform = "mac" | "windows";
export declare class OS {
    platform: Platform;
    minimumVersion: string;
    constructor(params: {
        platform: Platform;
        minimumVersion: string;
    });
    toManifest(): {
        Platform: Platform;
        MinimumVersion: string;
    };
}
export declare class Plugin {
    version: string;
    sdkVersion: number;
    url: string;
    name: string;
    author: string;
    minimumSoftwareVersion: string;
    category: string;
    description: string;
    actions: typeof Action[];
    os: OS[];
    id: string;
    socket?: WebSocket;
    uuid: string;
    constructor(params: {
        description: string;
        url: string;
        author: string;
        name: string;
        id: string;
        actions: typeof Action[];
        version: string;
        os?: OS[];
    });
    toManifest(): Record<string, unknown>;
}
export declare class Action {
    static pluginId: string;
    static title: string;
    static tooltip: string;
    static hasMultiActionSupport: boolean;
    static propertyInspectorName: string;
    static states: State[];
    static toManifest(): Record<string, unknown>;
    readonly plugin: Plugin;
    constructor(params: {
        plugin: Plugin;
    });
    get id(): string;
    handleKeyUp(): void;
    handleKeyDown(): void;
    handleWillAppear(): void;
    handleSettingsDidLoad(): void;
    handleGlobalSettingsDidLoad(): void;
    toManifest(): Record<string, unknown>;
}
export declare class State {
    actionClass: typeof Action;
    showTitle: boolean;
    name: string;
    title: string;
    imageName: string;
    multiActionImageName: string;
    constructor(params: {
        actionClass: typeof Action;
        imageName: string;
    });
    toManifest(): Record<string, unknown>;
}
export {};
