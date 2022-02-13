import { Inspector } from "@fnando/streamdeck";
import plugin from "./plugin";

class DefaultPropertyInspector extends Inspector {
  handleDidConnectToSocket(): void {
    // Set up your HTML event handlers here
  }
}

const inspector = new DefaultPropertyInspector({ plugin });

inspector.run();
