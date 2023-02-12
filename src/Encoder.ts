/**
 * The encoder is used to configure the dial and display segment on an SD+.
 * It is completely optional.
 */
export class Encoder {
  /**
   * Default background for the touch display slot
   * @type {string}
   */
  public background?: string;

  /**
   * Default icon for the Property Inspector, dial stack and layout. Falls back
   * to the Action List Icon
   *
   * @type {string}
   */
  public icon?: string;

  /**
   * Either a built-in layout (string) or a path to a JSON file that describes
   * a custom layout. Can be changed with `setFeedbackLayout` event.
   * @see Layout
   * @type {string}
   */
  public layout?: string;

  /**
   * The color used as the background of the Dial Stack
   * @type {string}
   */
  public stackColor?: string;

  /**
   * Part of TriggerDescription. Describes the action performed on rotation of
   * the dial
   * @type {string}
   */
  public onRotateDescription?: string;

  /**
   * Part of TriggerDescription. Describes the action performed on pressing of
   * the dial
   * @type {string}
   */
  public onPushDescription?: string;

  /**
   * Part of TriggerDescription. Describes the action performed on touching the
   * display pad
   * @type {string}
   */
  public onTouchDescription?: string;

  /**
   * Part of TriggerDescription. Describes the action performed on long pressing
   * the display pad
   * @type {string}
   */
  public onLongTouchDescription?: string;

  public toManifest(): Record<string, unknown> {
    const snippet: Record<string, unknown> = {
      background: this.background,
      Icon: this.icon,
      layout: this.layout,
      StackColor: this.stackColor,
      TriggerDescription: {
        Rotate: this.onRotateDescription,
        Push: this.onPushDescription,
        Touch: this.onTouchDescription,
        LongTouch: this.onLongTouchDescription,
      },
    };

    const optionals: [string, unknown, unknown][] = [
      ["background", this.background, this.background],
      ["Icon", this.icon, this.icon],
      ["layout", this.layout, this.layout],
      ["StackColor", this.stackColor, this.stackColor],
      ["StackColor", this.stackColor, this.stackColor],
      [
        "TriggerDescription",
        this.onRotateDescription ||
          this.onPushDescription ||
          this.onTouchDescription ||
          this.onLongTouchDescription,
        this.buildTriggerDescription(),
      ],
    ];

    this.evaluateOptionalValues(optionals, snippet);
    return snippet;
  }

  private buildTriggerDescription() {
    const snippet: Record<string, unknown> = {};

    const optionals: [string, unknown, unknown][] = [
      ["Rotate", this.onRotateDescription, this.onRotateDescription],
      ["Push", this.onPushDescription, this.onPushDescription],
      ["Touch", this.onTouchDescription, this.onTouchDescription],
      ["LongTouch", this.onLongTouchDescription, this.onLongTouchDescription],
    ];

    this.evaluateOptionalValues(optionals, snippet);
    return snippet;
  }

  private evaluateOptionalValues(
    optionals: [string, unknown, unknown][],
    object: Record<string, unknown>,
  ): Record<string, unknown> {
    optionals.forEach(([prop, condition, value]) => {
      if (condition) {
        object[prop] = value;
      }
    });

    return object;
  }
}
