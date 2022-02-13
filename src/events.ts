import { Coordinates } from "./Coordinates";
import { TitleParameters } from "./TitleParameters";

export interface StreamDeckEvent {
  event: string;
}

export interface ActionEvent<T = unknown> extends StreamDeckEvent {
  context: string;
  coordinates: { column: number; row: number };
  isInMultiAction: boolean;
  settings: T;
  state: number;
  userDesiredState: number;
}

export interface DidReceiveGlobalSettingsEvent<T = unknown> {
  event: string;
  settings: T;
}

export interface DidReceiveSettingsEvent<T = unknown> {
  action: string;
  event: string;
  context: string;
  device: string;
  settings: T;
  coordinates: Coordinates;
  isInMultiAction: boolean;
}

export type KeyDownEvent<T = unknown> = ActionEvent<T>;
export type KeyUpEvent<T = unknown> = ActionEvent<T>;
export type WillAppearEvent<T = unknown> = ActionEvent<T>;
export type WillDisappearEvent<T = unknown> = ActionEvent<T>;

export interface TitleParametersDidChangeEvent<T = unknown>
  extends StreamDeckEvent {
  coordinates: Coordinates;
  settings: T;
  state: number;
  title: string;
  titleParameters: TitleParameters;
}

export interface DeviceDidConnectEvent extends StreamDeckEvent {
  device: string;
  deviceInfo: {
    name: string;
    type: number;
    size: {
      columns: number;
      rows: number;
    };
  };
}

export interface DeviceDidDisconnectEvent extends StreamDeckEvent {
  device: string;
}

export interface ApplicationDidLaunchEvent extends StreamDeckEvent {
  application: string;
}

export interface ApplicationDidTerminateEvent extends StreamDeckEvent {
  application: string;
}

export type SystemWakeUpEvent = StreamDeckEvent;
export type PropertyInspectorDidAppearEvent<T = unknown> = ActionEvent<T>;
export type PropertyInspectorDidDisappearEvent<T = unknown> = ActionEvent<T>;
export type SendToPluginEvent<T = unknown> = ActionEvent<T>;
export type SendToPropertyInspectorEvent<T = unknown> = ActionEvent<T>;

export class Events<SettingsType = unknown, GlobalSettingsType = unknown> {
  debug(...args: unknown[]) {
    // eslint-disable-next-line no-console
    console.log(`[${this.constructor.name}]`, ...args);
  }

  /**
   * Handle all messages received.
   * @param {unknown} _event The event data.
   * @return {void}
   */
  handleMessage(_event: unknown): void {
    // noop
  }

  /**
   * Handle the didReceiveGlobalSettings event.
   * @param {SettingsEvent} event The event data.
   * @return {void}
   */
  handleDidReceiveGlobalSettings(
    event: DidReceiveGlobalSettingsEvent<GlobalSettingsType>,
  ) {
    this.debug("Received didReceiveGlobalSettings event:", event);
  }

  /**
   * Handle the didReceiveSettings event.
   * @param {SettingsEvent} event The event data.
   * @return {void}
   */
  handleDidReceiveSettings(event: DidReceiveSettingsEvent<SettingsType>) {
    this.debug("Received didReceiveSettings event:", event);
  }

  /**
   * Triggered whenever the websocket connection is established.
   * @return {void}
   */
  handleDidConnectToSocket(): void {
    this.debug("Received didConnectToSocket event");
  }
}

export class PluginEvents<
  SettingsType = unknown,
  GlobalSettingsType = unknown,
> extends Events<SettingsType, GlobalSettingsType> {
  /**
   * Handle the titleParametersDidChange event.
   * @param {TitleParametersDidChangeEvent} event The event data.
   * @return {void}
   */
  handleTitleParametersDidChange(
    event: TitleParametersDidChangeEvent<SettingsType>,
  ): void {
    this.debug("Received titleParametersDidChange event:", event);
  }

  /**
   * Handle the deviceDidConnect event.
   * @param {DeviceDidConnectEvent} event The event data.
   * @return {void}
   */
  handleDeviceDidConnect(event: DeviceDidConnectEvent): void {
    this.debug("Received deviceDidConnect event:", event);
  }

  /**
   * Handle the deviceDidDisconnect event.
   * @param {DeviceDidDisconnectEvent} event The event data.
   * @return {void}
   */
  handleDeviceDidDisconnect(event: DeviceDidDisconnectEvent): void {
    this.debug("Received deviceDidDisconnect event:", event);
  }

  /**
   * Handle the applicationDidLaunch event.
   * @param {ApplicationDidLaunchEvent} event The event data.
   * @return {void}
   */
  handleApplicationDidLaunch(event: ApplicationDidLaunchEvent): void {
    this.debug("Received applicationDidLaunch event:", event);
  }

  /**
   * Handle the applicationDidTerminate event.
   * @param {ApplicationDidTerminateEvent} event The event data.
   * @return {void}
   */
  handleApplicationDidTerminate(event: ApplicationDidTerminateEvent): void {
    this.debug("Received applicationDidTerminate event:", event);
  }

  /**
   * Handle the systemDidWakeUp event.
   * @param {SystemWakeUpEvent} event The event data.
   * @return {void}
   */
  handleSystemDidWakeUp(event: SystemWakeUpEvent): void {
    this.debug("Received systemDidWakeUp event:", event);
  }
}

export class ActionEvents extends Events {
  /**
   * Handle the keyDown event.
   * @param {KeyDownEvent} event The event data.
   * @return {void}
   */
  handleKeyDown(event: KeyDownEvent): void {
    this.debug("Received keyDown event:", event);
  }

  /**
   * Handle the keyUp event.
   * @param {KeyUpEvent} event The event data.
   * @return {void}
   */
  handleKeyUp(event: KeyUpEvent): void {
    this.debug("Received keyUp event:", event);
  }

  /**
   * Handle the willAppear event.
   * @param {WillAppearEvent} event The event data.
   * @return {void}
   */
  handleWillAppear(event: WillAppearEvent): void {
    this.debug("Received willAppear event:", event);
  }

  /**
   * Handle the willDisappear event.
   * @param {WillDisappearEvent} event The event data.
   * @return {void}
   */
  handleWillDisappear(event: WillDisappearEvent): void {
    this.debug("Received willDisappear event:", event);
  }

  /**
   * Handle the propertyInspectorDidAppear event.
   * @param {PropertyInspectorDidAppearEvent} event The event data.
   * @return {void}
   */
  handlePropertyInspectorDidAppear(
    event: PropertyInspectorDidAppearEvent,
  ): void {
    this.debug("Received propertyInspectorDidAppear event:", event);
  }

  /**
   * Handle the propertyInspectorDidDisappear event.
   * @param {PropertyInspectorDidDisappearEvent} event The event data.
   * @return {void}
   */
  handlePropertyInspectorDidDisappear(
    event: PropertyInspectorDidDisappearEvent,
  ): void {
    this.debug("Received propertyInspectorDidAppear event:", event);
  }

  /**
   * Handle the sendToPlugin event.
   * @param {SendToPluginEvent} event The event data.
   * @return {void}
   */
  handleSendToPlugin(event: SendToPluginEvent): void {
    this.debug("Received sendToPlugin event:", event);
  }
}

export class InspectorEvents<
  SettingsType = unknown,
  GlobalSettingsType = SettingsType,
> extends Events<SettingsType, GlobalSettingsType> {
  /**
   * Handle the sendToPlugin event.
   * @param {SendToPluginEvent} event The event data.
   * @return {void}
   */
  handleSendToPropertyInspector(event: SendToPropertyInspectorEvent): void {
    this.debug("Received sendToPropertyInspector event:", event);
  }
}
