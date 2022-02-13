declare module "rage-edit";

declare module "zip-dir";

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
