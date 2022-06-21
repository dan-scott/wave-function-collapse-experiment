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

const shiftMap: Record<string, LayoutDesignerAction["type"]> = {
  ArrowUp: "TileSelector::primary::up",
  ArrowDown: "TileSelector::primary::down",
  ArrowLeft: "TileSelector::primary::left",
  ArrowRight: "TileSelector::primary::right",
  Space: "TileSelector::primary::toggle",
  KeyS: "TileSelector::sprites::swap",
};

const altMap: Record<string, LayoutDesignerAction["type"]> = {
  ArrowUp: "TileSelector::secondary::up",
  ArrowDown: "TileSelector::secondary::down",
  ArrowLeft: "TileSelector::secondary::left",
  ArrowRight: "TileSelector::secondary::right",
  Space: "TileSelector::secondary::toggle",
  KeyS: "TileSelector::sprites::swap",
};

const keymap: Record<string, LayoutDesignerAction["type"]> = {};

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
    let map = keymap;
    if (evt.altKey) {
      map = altMap;
    } else if (evt.shiftKey) {
      map = shiftMap;
    }
    if (map[evt.code]) {
      designer.act({ type: map[evt.code] });
    }
  });
})();
