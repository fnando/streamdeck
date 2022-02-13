import { PluginEvents } from "./events";
import { OS } from "./OS";
import { runHandler } from "./runHandler";
import type { Action } from "./Action";

export class Plugin<
  SettingsType = unknown,
  GlobalSettingsType = SettingsType,
> extends PluginEvents<SettingsType, GlobalSettingsType> {
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
  public actions: Action[] = [];

  /**
   * The list of operating systems and versions supported by the plugin.
   * @type {OS[]}
   */
  public os: OS[] = [];

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
  public get id(): string {
    // eslint-disable-next-line no-underscore-dangle
    return __DEV__ ? `dev.${this.idInternal}` : this.idInternal;
  }

  private idInternal: string;

  constructor(params: {
    description: string;
    url: string;
    author: string;
    name: string;
    id: string;
    actions: Action[];
    version: string;
    os?: OS[];
    category?: string;
  }) {
    super();

    this.description = params.description;
    this.url = params.url;
    this.author = params.author;
    this.name = params.name;
    this.idInternal = params.id;
    this.actions = params.actions;
    this.version = params.version;
    this.category = params.category ?? "";
    this.os = params.os ?? [
      new OS({ platform: "windows", minimumVersion: "10" }),
      new OS({ platform: "mac", minimumVersion: "10.11" }),
    ];

    this.actions.forEach((action) => {
      action.plugin = this;
    });
  }

  /**
   * Run the plugin.
   * This is a required step, which bootstraps and connects and the wires with
   * the global Elgato Stream Deck SDK.
   *
   * @return {void}
   */
  run(): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const plugin = this;

    window.connectElgatoStreamDeckSocket =
      function connectElgatoStreamDeckSocket(
        port: string,
        uuid: string,
        registerEvent: string,
        _info: unknown,
      ) {
        const socket = new WebSocket(`ws://127.0.0.1:${port}`);

        plugin.socket = socket;
        plugin.uuid = uuid;

        socket.onopen = () => {
          plugin.send({ event: registerEvent, uuid });

          setTimeout(() => {
            plugin.getGlobalSettings();
            plugin.getSettings();
            plugin.handleDidConnectToSocket();
          }, 300);
        };

        socket.onmessage = ({ data: rawData }) => {
          const data = JSON.parse(rawData);

          if (data.event === "didReceiveGlobalSettings") {
            const payload = {
              event: data.event,
              settings: data.payload.settings,
            };

            plugin.handleDidReceiveGlobalSettings(payload);

            plugin.actions.forEach((action) => {
              action.handleDidReceiveGlobalSettings(payload);
            });

            return;
          }

          const action = plugin.actions.find((a) => a.uuid === data.action);

          if (!action) {
            runHandler<Plugin>(plugin, data);
            return;
          }

          action.context = data.context;
          action.device = data.device;

          runHandler<Action>(action, data);
          action.handleMessage(data);
        };
      };
  }

  /**
   * Send message via websocket.
   * @param {unknown} payload The payload that will be sent via websocket.
   * @return {void}
   */
  send(payload: unknown): void {
    this.socket?.send(JSON.stringify(payload));
  }

  toManifest() {
    const snippet: Record<string, unknown> = {
      Author: this.author,
      Actions: this.actions.map((a) => a.toManifest()),
      CodePath: "plugin.html",
      Icon: "images/plugin",
      Name: this.name,
      Description: this.description,
      PropertyInspectorPath: "inspector.html",
      Version: this.version,
      SDKVersion: this.sdkVersion,
      Software: { MinimumVersion: this.minimumSoftwareVersion },
      OS: this.os.map((o) => o.toManifest()),
    };

    const optionals = [
      ["Category", this.category, this.category + (__DEV__ ? " (dev)" : "")],
      ["URL", this.url, this.url],
    ];

    if (this.category) {
      snippet.CategoryIcon = "images/category";
    }

    optionals.forEach(([prop, condition, value]) => {
      if (condition) {
        snippet[prop] = value;
      }
    });

    return snippet;
  }

  public getGlobalSettings(): void {
    this.send({
      event: "getGlobalSettings",
      context: this.uuid,
    });
  }

  public setGlobalSettings(payload: GlobalSettingsType): void {
    this.send({
      event: "setGlobalSettings",
      context: this.uuid,
      payload,
    });

    this.getGlobalSettings();
  }

  public getSettings(): void {
    this.send({
      event: "getSettings",
      context: this.uuid,
    });
  }

  public setSettings(payload: SettingsType): void {
    this.send({
      event: "setSettings",
      context: this.uuid,
      payload,
    });

    this.getSettings();
  }
}
