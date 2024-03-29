import { ActionEvents } from "./events";
import { State, StateProps } from "./State";
import { Target } from "./Target";
import type { Plugin } from "./Plugin";

/**
 * The Action must match a few files:
 *
 * - src/actions/{ActionClassName}.ts
 * - src/images/actions/{ActionClassName}.png
 * - src/images/actions/{ActionClassName}@2x.png
 *
 * Optionally, these files can also be set:
 *
 * - src/images/multiActions/{ActionClassName}.png
 * - src/images/multiActions/{ActionClassName}@2x.png
 */
export class Action<
  SettingsType = unknown,
  GlobalSettingsType = SettingsType,
> extends ActionEvents {
  /**
   * Required. The name of the action. This string is visible to the user in the
   * actions list.
   * @type {string}
   */
  public name: string;

  /**
   * The string is displayed as a tooltip when the user leaves the mouse over
   * your action in the actions list.
   * @type {string}
   */
  public tooltip = "";

  /**
   * Boolean to prevent the action from being used in a Multi Action.
   * The default is `true`.
   * @type {Boolean}
   */
  public hasMultiActionSupport = true;

  /**
   * This can the global property inspector file member defined from
   * the plugin. The name must match a two files:
   *
   * - src/inspectors/{inspectorName}.ts
   * - src/inspectors/{inspectorName}.html
   *
   * So, if you're property inspector is called `Hello`, then you'll need these
   * files:
   *
   * - src/inspectors/Hello.ts
   * - src/inspectors/Hello.html
   *
   * @type {string}
   */
  public inspectorName = "";

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
  public states: State[] = [];

  /**
   * The plugin instance.
   * @type {Plugin}
   */
  public plugin: Plugin = undefined as unknown as Plugin;

  /**
   * The event context id.
   * This is set whenever receiving a WebSocket message. It's used by functions
   * that send WebSocket messages like `setTitle`, `setImage`, and others.
   * @type {string}
   */
  public context = "";

  /**
   * The event device id.
   * This is set whenever receiving a WebSocket message.
   * @type {string}
   */
  public device = "";

  constructor(params: {
    name: string;
    inspectorName?: string;
    hasMultiActionSupport?: boolean;
    tooltip?: string;
    states: StateProps[];
  }) {
    super();
    this.name = params.name;
    this.tooltip = params.tooltip ?? "";
    this.hasMultiActionSupport = params.hasMultiActionSupport ?? true;
    this.inspectorName = params.inspectorName ?? "";
    this.states = params.states.map((s) => new State({ action: this, ...s }));
  }

  public get uuid() {
    return `${this.plugin.id}.${this.constructor.name.toLowerCase()}`;
  }

  public toManifest() {
    const snippet: Record<string, unknown> = {
      Icon: `images/actions/${this.constructor.name}`,
      UUID: this.uuid,
      Name: this.name + (__DEV__ ? " (dev)" : ""),
      States: this.states.map((s) => s.toManifest()),
    };

    const optionals: [string, unknown, unknown][] = [
      [
        "PropertyInspectorPath",
        this.inspectorName,
        `inspectors/${this.inspectorName}.html`,
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
   * @return {string} The unique identifier of the action.
   * It must be a uniform type identifier (UTI) that uses the plugin's id as the
   * prefix. If your plugin's id is `com.elgato.hello` and your action is named
   * `MyAction`, this method will return `com.elgato.hello.myaction`.
   */
  public get id(): string {
    return `${this.plugin.id}.${this.constructor.name}`;
  }

  /**
   * Send payload via websockets.
   * @param {unknown} payload The message that's being sent.
   * @return {void}
   */
  public send(payload: unknown): void {
    this.debug("Sending event:", payload);
    this.plugin.send(payload);
  }

  /**
   * Set the key's title.
   * @param {unknown} input          The title that will be set.
   * @param {Target}  params.target  Specify if you want to display the title on
   *                                 the hardware and software (0), only on the
   *                                 hardware (1), or only on the software (2).
   *                                 Default is 0.
   * @param {State}   params.state   A 0-based integer value representing the
   *                                 state of an action with multiple states.
   *                                 If not specified, the title is set to all
   *                                 states.
   * @return {void}
   */
  public setTitle(
    input: unknown,
    { target = Target.both, state }: { target: Target; state?: number } = {
      target: Target.both,
    },
  ): void {
    this.send({
      event: "setTitle",
      context: this.context,
      payload: {
        title: String(input),
        target,
        state,
      },
    });
  }

  /**
   * Set the key's image.
   * @param {string}          input  The image to display encoded in base64 with
   *                                 the image format declared in the mime type
   *                                 (PNG, JPEG, BMP, ...). svg is also
   *                                 supported. If not provided, the image is
   *                                 reset to the default image from the
   *                                 manifest.
   * @param {Target}  params.target  Specify if you want to display the title on
   *                                 the hardware and software (0), only on the
   *                                 hardware (1), or only on the software (2).
   *                                 Default is 0.
   * @param {State}   params.state   A 0-based integer value representing the
   *                                 state of an action with multiple states.
   *                                 If not specified, the title is set to all
   *                                 states.
   * @return {void}
   */
  public setImage(
    input: string,
    { target = Target.both, state }: { target: Target; state?: number } = {
      target: Target.both,
    },
  ): void {
    this.send({
      event: "setImage",
      context: this.context,
      payload: {
        image: String(input),
        target,
        state,
      },
    });
  }

  /**
   * Temporarily show an alert icon on the image displayed by an instance of an
   * action.
   *
   * @param {Target}  params.target  Specify if you want to display the title on
   *                                 the hardware and software (0), only on the
   *                                 hardware (1), or only on the software (2).
   *                                 Default is 0.
   * @param {State}   params.state   A 0-based integer value representing the
   *                                 state of an action with multiple states.
   *                                 If not specified, the title is set to all
   *                                 states.
   * @return {void}
   */
  public showAlert(
    { target = Target.both, state }: { target: Target; state?: number } = {
      target: Target.both,
    },
  ): void {
    this.send({
      event: "showAlert",
      context: this.context,
      payload: {
        target,
        state,
      },
    });
  }

  /**
   * Request the data to be persisted for the action's instance.
   * @param {SettingsType} payload The object that will persisted.
   * @return {void}
   */
  public setSettings(payload: SettingsType): void {
    this.send({
      event: "setSettings",
      context: this.context,
      payload,
    });

    this.getSettings();
  }

  /**
   * Retrieve the local settings.
   * @return {void}
   */
  public getSettings(): void {
    this.send({
      event: "getSettings",
      context: this.context,
    });
  }

  /**
   * The data will be saved securely to the Keychain on macOS and the Credential
   * Store on Windows. This API can be used to save tokens that should be
   * available to every action in the plugin.
   *
   * @param {GlobalSettingsType} payload The object that will persisted.
   * @return {void}
   */
  public setGlobalSettings(payload: GlobalSettingsType): void {
    this.send({
      event: "setGlobalSettings",
      context: this.plugin.uuid,
      payload,
    });

    this.getGlobalSettings();
  }

  /**
   * Retrieve the global settings.
   *
   * @return {void}
   */
  public getGlobalSettings(): void {
    this.send({
      event: "getGlobalSettings",
      context: this.plugin.uuid,
    });
  }

  /**
   * write a debug message to the logs file
   * @param {string} message The message that will be logged
   * @return {void}
   */
  public logMessage(message: string): void {
    this.send({
      event: "logMessage",
      payload: { message },
    });
  }

  /**
   * Send data to the property inspector.
   * @param {unknown} payload The data that will be sent.
   * @return {void}
   */
  public sendToPropertyInspector(payload: unknown): void {
    this.send({
      action: this.id,
      event: "sendToPropertyInspector",
      context: this.context,
      payload,
    });
  }

  /**
   * Open an URL in the default browser
   * @param {string} url The url.
   * @return {void}
   */
  public openURL(url: string): void {
    this.send({
      event: "openUrl",
      payload: { url },
    });
  }

  /**
   * Temporarily show an OK checkmark icon on the image displayed by an instance
   * of an action.
   *
   * @param {Target}  params.target  Specify if you want to display the title on
   *                                 the hardware and software (0), only on the
   *                                 hardware (1), or only on the software (2).
   *                                 Default is 0.
   * @param {State}   params.state   A 0-based integer value representing the
   *                                 state of an action with multiple states.
   *                                 If not specified, the title is set to all
   *                                 states.
   * @return {void}
   */
  public showOK(
    { target = Target.both, state }: { target: Target; state?: number } = {
      target: Target.both,
    },
  ): void {
    this.plugin.send({
      event: "showOk",
      context: this.context,
      payload: {
        target,
        state,
      },
    });
  }

  /**
   * Dynamically change the state of an action supporting multiple states.
   * @param {number} state A 0-based integer value representing the state
   *                       requested.
   * @return {void}
   */
  public setState(state: number): void {
    this.plugin.send({
      event: "setState",
      context: this.context,
      payload: { state },
    });
  }

  /**
   * Switch to one of his preconfigured read-only profile.
   * @param {string} profile The name of the profile to switch to. The name
   *                         should be identical to the name provided in the
   *                         manifest.json file.
   * @return {void}
   */
  public switchToProfile(profile: string): void {
    this.plugin.send({
      event: "switchToProfile",
      context: this.context,
      device: this.device,
      payload: { profile },
    });
  }
}
