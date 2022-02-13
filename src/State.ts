import type { Action } from "./Action";
import { FontStyle } from "./FontStyle";

export interface StateProps {
  image: string;
  multiActionImage?: string;
  name?: string;
  title?: string;
  showTitle?: boolean;
  fontSize?: number;
  align?: "top" | "bottom" | "middle";
  underline?: boolean;
  fontStyle?: FontStyle;
  titleColor?: string;
}

export class State {
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
   * `src/images/actions/{ActionNameClass}/Selected.{png,jpg,gif}` and
   * must have a hi-res counterpart (i.e. `@2x.png`).
   *
   * @type {string}
   */
  public image = "";

  /**
   * Optional. Image name, with the extension. If you set the image name as
   * `Selected`, then the file must live at
   * `src/images/actions/{ActionNameClass}/Selected.{png,jpg,gif}` and
   * must have a hi-res counterpart (i.e. `@2x.png`).
   *
   * @type {string}
   */
  public multiActionImage = "";

  /**
   * Font size.
   * @type {number}
   */
  public fontSize: number;

  /**
   * Title alignment.
   * @type {string}
   */
  public align?: string;

  /**
   * The action instance.
   * @type {Action}
   */
  public action: Action;

  /**
   * The action instance.
   * @type {boolean}
   */
  public underline?: boolean;

  public fontStyle?: FontStyle;

  /**
   * Set the title color.
   * @type {string}
   */
  public titleColor?: string;

  constructor(params: StateProps & { action: Action }) {
    this.action = params.action;
    this.image = params.image;
    this.multiActionImage = params.multiActionImage ?? "";
    this.showTitle = params.showTitle ?? true;
    this.name = params.name ?? "";
    this.title = params.title ?? "";
    this.fontSize = params.fontSize ?? 16;
    this.align = params.align;
    this.underline = params.underline;
    this.fontStyle = params.fontStyle;
    this.titleColor = params.titleColor;
  }

  toManifest() {
    const actionName = (this.action.constructor as unknown as Action).name;
    const baseImagePath = `images/actions/${actionName}/${this.image}`;
    const snippet: Record<string, unknown> = { Image: baseImagePath };

    const optionals: [string, unknown, unknown][] = [
      [
        "MultiActionImage",
        this.multiActionImage,
        `src/images/actions/${actionName}/${this.multiActionImage}`,
      ],
      ["Name", this.name, this.name],
      ["Title", this.title, this.title],
      ["ShowTitle", this.showTitle === false, this.showTitle],
      ["FontSize", this.fontSize, String(this.fontSize)],
      ["FontUnderline", this.underline, this.underline],
      ["FontStyle", this.fontStyle, this.fontStyle],
      ["TitleAlignment", this.align, this.align],
      ["TitleColor", this.titleColor, this.titleColor],
    ];

    optionals.forEach(([prop, condition, value]) => {
      if (condition) {
        snippet[prop] = value;
      }
    });

    return snippet;
  }
}
