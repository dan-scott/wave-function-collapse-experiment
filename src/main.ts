import { Application } from "pixi.js";
import { loadAtlas } from "./sprites/SpriteAtlas";
import tiles from "../res/tilesheet.png";
import {
  LayoutDesigner,
  LayoutDesignerAction,
} from "./designer/LayoutDesigner";

import "./style.css";
import { WaveFunction } from "./Collapse";
import { getStoreVal } from "./Store";
import { TileSet } from "./tilesets/TileSet";

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

const keymap: Record<string, LayoutDesignerAction["type"]> = {
  ArrowUp: "Layout::cell::up",
  ArrowDown: "Layout::cell::down",
  ArrowLeft: "Layout::cell::left",
  ArrowRight: "Layout::cell::right",
  Space: "Layout::cell::stamp",
};

(async () => {
  const atlas = await loadAtlas({
    url: tiles,
    columns: 9,
    rows: 3,
    tileSize: 64,
  });

  let showingDesigner = true;

  const designer = new LayoutDesigner(atlas);
  designer.x = 3;
  designer.y = 3;
  app.stage.addChild(designer);

  let waveFn: WaveFunction | undefined;

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
    if (evt.code === "KeyG") {
      if (showingDesigner) {
        app.stage.removeChild(designer);
        showingDesigner = false;
      }
      if (waveFn) {
        app.stage.removeChild(waveFn);
        waveFn.destroy({ children: true });
      }
      waveFn = new WaveFunction({
        inputGrid: getStoreVal("grid"),
        rows: 10,
        columns: 20,
        inputWidth: 20,
        tileSet: new TileSet(atlas),
      });
      app.stage.addChild(waveFn);
      waveFn.gen();
    }
    if (evt.code === "KeyH") {
      if (showingDesigner) {
        return;
      }
      showingDesigner = true;
      if (waveFn) {
        app.stage.removeChild(waveFn);
        waveFn.destroy({ children: true });
        waveFn = undefined;
      }
      app.stage.addChild(designer);
    }
  });
})();
