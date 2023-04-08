declare global {
  // eslint-disable-next-line no-underscore-dangle
  const __DEV__: boolean;

  interface Window {
    connectElgatoStreamDeckSocket(
      port: string,
      uuid: string,
      registerEvent: string,
      info: unknown,
      actionInfo: unknown,
    ): void;
  }
}

export * from "./Plugin";
export * from "./Action";
export * from "./State";
export * from "./Inspector";
export * from "./events";
export * from "./Encoder";
export * from "./Layout";
