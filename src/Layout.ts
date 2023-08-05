/**
 * Describes available layouts for the SD+ Touch Display
 *
 * ID for built-in layouts are available as CONSTANTS
 * Object can be used to create a custom layout.
 *
 * @see https://developer.elgato.com/documentation/stream-deck/sdk/layouts/
 */
export class Layout {
  /**
   * Default layout, Title + Icon
   * @type {string}
   */
  static readonly ICON_LAYOUT: string = "$X1";

  /**
   * Custom Image with a title, canvas is more flexible
   * @type {string}
   */
  static readonly CANVAS_LAYOUT: string = "$A0";

  /**
   * Title, Icon and Text
   * @type {string}
   */
  static readonly VALUE_LAYOUT: string = "$A1";

  /**
   * Title, Icon,Value and Indicator. Better to represent a range.
   * @type {string}
   */
  static readonly INDICATOR_LAYOUT: string = "$B1";

  /**
   * Title, Icon, Value and Indicator with color. Better to represent a range
   * that can be explained better with colors
   * @type {string}
   */
  static readonly GRADIENT_INDICATOR_LAYOUT: string = "$B2";

  /**
   * Title, 2 icons and 2 indicators.
   * @type {string}
   */
  static readonly DOUBLE_INDICATOR_LAYOUT: string = "$C1";

  /**
   * Unique ID to identify a Custom Layout.
   * @type {string}
   */
  public id: string;

  /**
   * Array of Layout Items to compose a layout
   * @type {[LayoutItem]}
   */
  public items: [LayoutItem?] = [];

  constructor(id: string) {
    this.id = id;
  }

  public insertPlaccard(item: PlaccardItem): void {
    this.items.push({ ...item, type: "placcard" });
  }

  public insertPixmap(item: PixmapItem): void {
    this.items.push({ ...item, type: "pixmap" });
  }

  public insertBar(item: BarItem): void {
    this.items.push({ ...item, type: "bar" });
  }

  public insertGbar(item: GbarItem): void {
    this.items.push({ ...item, type: "gbar" });
  }

  public insertText(item: TextItem): void {
    this.items.push({ ...item, type: "text" });
  }
}

type LayoutItem = {
  /**
   * Name of the defined Item, used to identify it in `setFeedback`
   */
  key: string;

  /**
   * Pre-defined type of each Item
   */
  type: string;

  /**
   * The array holding the rectangle coordinates (x, y, w, h) of the defined
   * item. Items with the same zOrder must NOT overlap. The rectangle must be
   * inside of slot coordinates - (0, 0) x (200, 100).
   */
  rect: [number, number, number, number];

  /**
   * The non-negative integer in a range [0, 700) defining the z-order of the
   * item.
   */
  zOrder?: number;

  /**
   * Defines is the item is enabled
   */
  enabled?: boolean;

  /**
   * A real number in a range [0.0, 1.0] determining the opacity level of the
   * item
   */
  opacity?: number;

  /**
   * The string used to define the item background fill color.
   */
  background?: string;
};

type PlaccardItem = LayoutItem;

type PixmapItem = LayoutItem & {
  /**
   * Image path ot base64 encoded image itself
   */
  value: string;
};

type BarItem = LayoutItem & {
  /**
   * An integer value in the range [0, 100] to display an indicator.
   */
  value: string;

  /**
   * An integer value to represent shape:
   * 0 - rectangle,
   * 1 - double rectangle,
   * 2 - trapezoid,
   * 3 - double trapezoid,
   * 4 - groove
   * (groove is recommended design for SD+)
   */
  subtype?: 0 | 1 | 2 | 3 | 4;

  /**
   * 	An integer value for border width. Defaulted to 2
   */
  border_w?: number;

  /**
   * A string value to determine bar color or gradient. Defaulted to darkGray
   */
  bar_bg_c?: string;

  /**
   * A string value for bar border color. Defaulted to white
   */
  bar_border_c?: string;

  /**
   * A string value for bar indicator fill color. Defaulted to white
   */
  bar_fill_c?: string;
};

type GbarItem = LayoutItem & {
  /**
   * An integer value in the range [0, 100] to display an indicator.
   */
  value: string;

  /**
   * An integer value to represent shape:
   * 0 - rectangle,
   * 1 - double rectangle,
   * 2 - trapezoid,
   * 3 - double trapezoid,
   * 4 - groove
   * (groove is recommended design for SD+)
   */
  subtype?: 0 | 1 | 2 | 3 | 4;

  /**
   * 	An integer value for border width. Defaulted to 2
   */
  border_w?: number;

  /**
   * A string value to determine bar color or gradient. Defaulted to darkGray
   */
  bar_bg_c?: string;

  /**
   * A string value for bar border color. Defaulted to white
   */
  bar_border_c?: string;

  /**
   * An integer value for the indicator's groove height. The indicator height
   * will be adjusted to fit in the items height. Defaulted to 10.
   */
  bar_h?: number;
};

type TextItem = LayoutItem & {
  /**
   * A string value to display
   */
  value: string;

  /**
   * Describes the text visually
   */
  font?: TextItemFont;

  /**
   * A string describing the color of text. Defaulted to white.
   */
  color?: string;

  /**
   * A string describing the text alignment in the rectangle.
   * Values include: left, center, or right. Defaulted to center.
   */
  alignment?: "left" | "center" | "right";
};

type TextItemFont = {
  /**
   * An integer font pixel size
   */
  size?: number;

  /**
   * Weight of the font (an integer value between 100 and 1000 or the string
   * with a name of typographical weight).
   */
  weight?: number;
};
