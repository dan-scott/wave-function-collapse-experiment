import { Application } from "pixi.js";
import { loadAtlas } from "./sprites/SpriteAtlas";
import tiles from "../res/tilesheet.png";
import {
  LayoutDesigner,
  LayoutDesignerAction,
} from "./designer/LayoutDesigner";

import "./style.css";

let app = new Application({
  width: window.innerWidth,
  height: window.innerHeight - 2,
});

document.body.appendChild(app.view);

const keymap: Record<string, LayoutDesignerAction["type"]> = {
  ArrowUp: "sprite_up",
  ArrowDown: "sprite_down",
  ArrowLeft: "sprite_left",
  ArrowRight: "sprite_right",
  "[": "sprite_toggle_primary",
  "]": "sprite_toggle_secondary",
  ",": "sprite_swap_primary_secondary",
  w: "layout_cell_up",
  s: "layout_cell_down",
  a: "layout_cell_left",
  d: "layout_cell_right",
  " ": "layout_cell_stamp_selected_tile",
};

(async () => {
  const atlas = await loadAtlas({
    url: tiles,
    columns: 9,
    rows: 3,
    tileSize: 64,
  });

  const designer = new LayoutDesigner(atlas);
  designer.x = 3;
  designer.y = 3;
  app.stage.addChild(designer);

  window.addEventListener("keydown", (evt) => {
    console.log(evt.key);
    if (keymap[evt.key]) {
      designer.act({ type: keymap[evt.key] });
    }
  });
})();
