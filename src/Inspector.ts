import { InspectorEvents } from "./events";
import { runHandler } from "./runHandler";
import type { Plugin } from "./Plugin";

export class Inspector<
  SettingsType = unknown,
  GlobalSettingsType = SettingsType,
> extends InspectorEvents<SettingsType, GlobalSettingsType> {
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
   * The plugin instance.
   * @type {Plugin}
   */
  public plugin: Plugin;

  constructor({ plugin }: { plugin: Plugin }) {
    super();
    this.plugin = plugin;
  }

  /**
   * Send message via websocket.
   * @param {unknown} payload The payload that will be sent via websocket.
   * @return {void}
   */
  send(payload: unknown): void {
    this.debug("Sending event:", payload);
    this.socket?.send(JSON.stringify(payload));
  }

  setGlobalSettings(payload: GlobalSettingsType): void {
    this.send({
      event: "setGlobalSettings",
      context: this.uuid,
      payload,
    });

    this.getGlobalSettings();
  }

  setSettings<T = unknown>(payload: T): void {
    this.send({
      event: "setSettings",
      context: this.uuid,
      payload,
    });

    this.getSettings();
  }

  getGlobalSettings(): void {
    this.send({ event: "getGlobalSettings", context: this.uuid });
  }

  getSettings(): void {
    this.send({ event: "getSettings", context: this.uuid });
  }

  openURL(url: string): void {
    this.send({ event: "openUrl", payload: { url } });
  }

  logMessage(message: string): void {
    this.send({ event: "logMessage", payload: { message } });
  }

  run(): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const inspector = this;

    window.connectElgatoStreamDeckSocket =
      function connectElgatoStreamDeckSocket(
        port: string,
        uuid: string,
        registerEvent: string,
        _info: unknown,
        _actionInfo: unknown,
      ) {
        const socket = new WebSocket(`ws://127.0.0.1:${port}`);

        inspector.socket = socket;
        inspector.uuid = uuid;

        socket.onmessage = ({ data: rawData }) => {
          const data = JSON.parse(rawData);

          if (data.event === "didReceiveGlobalSettings") {
            inspector.handleDidReceiveGlobalSettings({
              event: data.event,
              settings: data.payload.settings,
            });
            return;
          }

          runHandler<Inspector>(inspector, data);
        };

        socket.onopen = () => {
          inspector.send({ event: registerEvent, uuid });

          setTimeout(() => {
            inspector.getGlobalSettings();
            inspector.getSettings();
            inspector.handleDidConnectToSocket();
          }, 300);
        };
      };
  }
}
