import { Action, KeyDownEvent, WillAppearEvent } from "@fnando/streamdeck";

class Hello extends Action {
  handleWillAppear(event: WillAppearEvent): void {
    this.debug("willAppear:", event);
  }

  handleKeyDown(event: KeyDownEvent): void {
    this.debug("keyDown:", event);
  }
}

const hello = new Hello({
  name: "Hello",
  states: [{ image: "Key" }],
});

export default hello;
