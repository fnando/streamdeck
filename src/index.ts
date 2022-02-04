declare global {
  interface Window {
    connectElgatoStreamDeckSocket: (
      port: number,
      uuid: string,
      registerEvent: string,
      info: unknown,
    ) => void;
  }
}

/**
 * Run the plugin.
 * This is a required step, which bootstraps and connects and the wires with
 * the global Elgato Stream Deck SDK.
 *
 * @param {Plugin} plugin The plugin instance.
 * @return {void}
 */
export function run(plugin: Plugin): void {
  window.connectElgatoStreamDeckSocket = function connectElgatoStreamDeckSocket(
    port: number,
    uuid: string,
    registerEvent: string,
    info: unknown,
  ) {
    console.log({ info });
    const socket = new WebSocket(`ws://127.0.0.1:${port}`);

    plugin.socket = socket;
    plugin.uuid = uuid;

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          event: registerEvent,
          uuid,
        }),
      );
    };

    socket.onmessage = ({ data }) => {
      const payload = JSON.parse(data);
      console.log({ payload });
    };

    socket.onclose = () => {};
  };
}

type Platform = "mac" | "windows";

export class OS {
  /**
   * The name of the platform, mac or windows.
   * @type {string}
   */
  platform: Platform;

  /**
   * The minimum version of the operating system that the plugin requires.
   * For Windows 10, you can use `10`. For macOS 10.11, you can use `10.11`.
   * @type {string}
   */
  minimumVersion: string;

  constructor(params: { platform: Platform; minimumVersion: string }) {
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

export class Plugin {
  /**
   * The plugin version.
   * @type {string}
   */
  public version = "";

  /**
   * The current SDK version. The latest is 2.
   * @type {Number}
   */
  public sdkVersion = 2;

  /**
   * A site to provide more information about the plugin.
   * @type {string}
   */
  public url = "";

  /**
   * The name of the plugin. This string is displayed to the user in the Stream
   * Deck store.
   * @type {string}
   */
  public name = "";

  /**
   * The author of the plugin. This string is displayed to the user in the
   * Stream Deck store.
   * @type {string}
   */
  public author = "";

  /**
   * Indicates which version of the Stream Deck application is required to
   * install the plugin.
   * @type {string}
   */
  public minimumSoftwareVersion = "5.0";

  /**
   * The name of the custom category in which the actions should be listed.
   * This string is visible to the user in the actions list. If you don't
   * provide a category, the actions will appear inside a "Custom" category.
   * @type {string}
   */
  public category = "";

  /**
   * Provides a general description of what the plugin does. This string is
   * displayed to the user in the Stream Deck store.
   * @type {string}
   */
  public description = "";

  /**
   * Specifies a list of actions. A plugin can indeed have one or multiple
   * actions.
   * @type {Action[]}
   */
  public actions: typeof Action[] = [];

  /**
   * The list of operating systems and versions supported by the plugin.
   * @type {OS[]}
   */
  public os: OS[] = [];

  /**
   * The unique identifier of the action. It must be a uniform type
   * identifier (UTI) that contains only lowercase alphanumeric characters
   * (a-z, 0-9), hyphen (-), and period (.). The string must be in reverse-DNS
   * format. For example, if your domain is `elgato.com` and you create a
   * plugin named `Hello`, you could assign the string `com.elgato.hello` as
   * your action's Unique Identifier.
   *
   * Actions will prepend this value as part of their own ids. If you have an
   * action named `MyAction`, the action's id will be
   * `com.elgato.hello.MyAction`.
   */
  public id = "";

  /**
   * The websocket instance that connects with Stream Deck.
   * @type {WebSocket}
   */
  public socket?: WebSocket;

  /**
   * The Stream Deck uuid assigned during the plugin registration.
   * @type {string}
   */
  public uuid = "";

  constructor(params: {
    description: string;
    url: string;
    author: string;
    name: string;
    id: string;
    actions: typeof Action[];
    version: string;
    os?: OS[];
  }) {
    this.description = params.description;
    this.url = params.url;
    this.author = params.author;
    this.name = params.name;
    this.id = params.id;
    this.actions = params.actions;
    this.version = params.version;
    this.os = params.os ?? [
      new OS({ platform: "windows", minimumVersion: "10" }),
      new OS({ platform: "mac", minimumVersion: "10.11" }),
    ];
  }

  toManifest() {
    const snippet: Record<string, unknown> = {
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

/**
 * The Action must match a few files:
 *
 * - src/actions/{ActionClassName}.ts
 * - src/files/images/actions/{ActionClassName}.png
 * - src/files/images/actions/{ActionClassName}@2x.png
 *
 * Optionally, these files can also be set:
 *
 * - src/files/images/multiActions/{ActionClassName}.png
 * - src/files/images/multiActions/{ActionClassName}@2x.png
 */
export class Action {
  /**
   * The plugin id. This is set by the package bundler, so don't worry about it.
   * @type {string}
   */
  static pluginId = "";

  /**
   * The name of the action. This string is visible to the user in the actions
   * list.
   * @type {string}
   */
  static title = "";

  /**
   * The string is displayed as a tooltip when the user leaves the mouse over
   * your action in the actions list.
   * @type {string}
   */
  static tooltip = "";

  /**
   * Boolean to prevent the action from being used in a Multi Action.
   * The default is `true`.
   * @type {Boolean}
   */
  static hasMultiActionSupport = true;

  /**
   * This can override the global property inspector file member defined from
   * the plugin. The name must match a two files:
   *
   * - src/propertyInspectors/{propertyInspectorName}.ts
   * - src/propertyInspectors/{propertyInspectorName}.html
   *
   * So, if you're property inspector is called `Hello`, then you'll need these
   * files:
   *
   * - src/propertyInspectors/Hello.ts
   * - src/propertyInspectors/Hello.html
   *
   * @type {string}
   */
  static propertyInspectorName = "";

  /**
   * Specifies a list of states. Each action can have one or more states.
   * For example, the Hotkey action has a single state. However, the
   * Game Capture Record action has two states, active and inactive. The state
   * of an action, supporting multiple states, is always automatically toggled
   * whenever the action's key is released (after being pressed).
   * In addition, it is possible to force the action to switch its state by
   * sending a `setState` event.
   * @type {State[]}
   */
  static states: State[] = [];

  static toManifest() {
    const snippet: Record<string, unknown> = {
      Icon: `files/actions/${this.name}`,
      UUID: `${this.pluginId}.${this.name}`,
      Name: this.title,
      States: this.states.map((s) => s.toManifest()),
    };

    const optionals: [string, unknown, unknown][] = [
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

  /**
   * The plugin instance.
   * @type {Plugin}
   */
  public readonly plugin: Plugin;

  constructor(params: { plugin: Plugin }) {
    this.plugin = params.plugin;
  }

  /**
   * @return {string} The unique identifier of the action.
   * It must be a uniform type identifier (UTI) that uses the plugin's id as the
   * prefix. If your plugin's id is `com.elgato.hello` and your action is named
   * `MyAction`, this method will return `com.elgato.hello.MyAction`.
   */
  public get id(): string {
    return `${this.plugin.id}.${this.constructor.name}`;
  }

  /**
   * Handle the `keyUp` event.
   * @return {void}
   */
  handleKeyUp(): void {}

  /**
   * Handle the `keyDown` event.
   * @return {void}
   */
  handleKeyDown(): void {}

  /**
   * Handle the `willAppear` event.
   * @return {void}
   */
  handleWillAppear(): void {}

  /**
   * Handle the `[TBD]` event.
   * @return {void}
   */
  handleSettingsDidLoad(): void {}

  /**
   * Handle the `[TBD]` event.
   * @return {void}
   */
  handleGlobalSettingsDidLoad(): void {}

  toManifest() {
    const actionClass = this.constructor as typeof Action;

    const snippet: Record<string, unknown> = {
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

export class State {
  public actionClass: typeof Action;

  /**
   * Boolean to hide/show the title. The default is `true`.
   * @type {boolean}
   */
  public showTitle = true;

  /**
   * Optional. Displayed in the dropdown menu in the Multi-action. For example,
   * the Game Capture Record action has Start and Stop. If the name is not
   * provided, the state will not appear in the Multi-Action.
   * @type {string}
   */
  public name = "";

  /**
   * Default title.
   * @type {string}
   */
  public title = "";

  /**
   * Required. Image name, without the extension. If you set the image name as
   * `Selected`, then the file must live at
   * `src/files/images/actions/{ActionNameClass}/Selected.{png,jpg,gif}` and
   * must have a hi-res counterpart (i.e. `@2x.png`).
   *
   * @type {string}
   */
  public imageName = "";

  /**
   * Optional. Image name, with the extension. If you set the image name as
   * `Selected`, then the file must live at
   * `src/files/images/actions/{ActionNameClass}/Selected.{png,jpg,gif}` and
   * must have a hi-res counterpart (i.e. `@2x.png`).
   *
   * @type {string}
   */
  public multiActionImageName = "";

  constructor(params: { actionClass: typeof Action; imageName: string }) {
    this.actionClass = params.actionClass;
    this.imageName = params.imageName;
  }

  toManifest() {
    const actionName = this.actionClass.name;

    const snippet: Record<string, unknown> = {
      Image: `src/files/images/actions/${actionName}/${this.imageName}`,
    };

    const optionals: [string, unknown, unknown][] = [
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
