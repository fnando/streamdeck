import { Plugin } from "@fnando/streamdeck";
import * as config from "./streamdeck.json";
import hello from "./actions/Hello";

const plugin = new Plugin({ ...config, actions: [hello] });

export default plugin;
