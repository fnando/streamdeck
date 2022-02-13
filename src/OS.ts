export type Platform = "mac" | "windows";

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
