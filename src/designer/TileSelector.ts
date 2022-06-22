import { Container, Graphics } from "pixi.js";
import { SpriteAtlas } from "../sprites/SpriteAtlas";
import { LayoutDesignerAction } from "./LayoutDesigner";
import { GridNav } from "./GridNav";
import { TileId } from "../tilesets/TileSet";
import { Action } from "../Action";
import { getStoreVal, setStoreVal } from "../Store";

export class TileSelector extends Container {
  readonly #atlas: SpriteAtlas;

  readonly #primaryNav: GridNav;
  readonly #primaryHighlight: Graphics;
  #primaryEnabled: boolean = true;

  readonly #secondaryNav: GridNav;
  readonly #secondaryHighlight: Graphics;
  #secondaryEnabled: boolean = false;

  get TileId(): TileId {
    if (!this.#primaryEnabled) {
      return "empty";
    }
    return this.#secondaryEnabled
      ? [this.#secondaryNav.Idx, this.#primaryNav.Idx]
      : this.#primaryNav.Idx;
  }

  constructor(atlas: SpriteAtlas) {
    super();
    this.#atlas = atlas;
    this.#atlas.draw(0, 0, 1, this);
    this.#primaryNav = new GridNav({
      columns: atlas.Columns,
      rows: atlas.Rows,
      onChange: () => this.#updatePrimary(),
    });

    this.#secondaryNav = new GridNav({
      columns: atlas.Columns,
      rows: atlas.Rows,
      onChange: () => this.#updateSecondary(),
    });

    this.#primaryHighlight = new Graphics();
    this.#primaryHighlight.lineStyle(4, 0x0000ff, 0.6);
    this.#primaryHighlight.drawRect(
      2,
      2,
      this.#atlas.TileSize - 4,
      this.#atlas.TileSize - 4
    );
    this.addChild(this.#primaryHighlight);

    this.#secondaryHighlight = new Graphics();
    this.#secondaryHighlight.lineStyle(4, 0x00ff00, 0.6);
    this.#secondaryHighlight.drawRect(
      6,
      6,
      this.#atlas.TileSize - 12,
      this.#atlas.TileSize - 12
    );
    this.addChild(this.#secondaryHighlight);

    this.#loadState();
  }

  act(action: LayoutDesignerAction) {
    const [cls, cmp, act] = action.type.split("::");
    if (cls !== "TileSelector") {
      return;
    }

    if (cmp === "sprites") {
      this.#swap();
      this.#persistSelection();
      return;
    }

    const nav = cmp === "primary" ? this.#primaryNav : this.#secondaryNav;

    switch (act) {
      case "up":
        nav.up();
        break;
      case "down":
        nav.down();
        break;
      case "left":
        nav.left();
        break;
      case "right":
        nav.right();
        break;
      case "toggle":
        if (cmp === "primary") {
          this.#primaryEnabled = !this.#primaryEnabled;
        } else {
          this.#secondaryEnabled = !this.#secondaryEnabled;
        }
        break;
    }
    this.#persistSelection();
  }

  #updatePrimary() {
    this.#updateHighlight(this.#primaryHighlight, this.#primaryNav.XY);
  }

  #updateSecondary() {
    this.#updateHighlight(this.#secondaryHighlight, this.#secondaryNav.XY);
  }

  #updateHighlight(hgl: Container, pos: [number, number]) {
    hgl.x = pos[0] * (this.#atlas.TileSize + 2);
    hgl.y = pos[1] * (this.#atlas.TileSize + 2);
  }

  #persistSelection() {
    setStoreVal("tile", this.TileId);
  }

  #swap() {
    const tmp = this.#primaryNav.Idx;
    this.#primaryNav.Idx = this.#secondaryNav.Idx;
    this.#secondaryNav.Idx = tmp;
  }

  #loadState() {
    const tile = getStoreVal("tile");
    if (tile === "empty") {
      this.#primaryEnabled = false;
      this.#secondaryEnabled = false;
    } else if (Array.isArray(tile)) {
      this.#primaryEnabled = true;
      this.#secondaryEnabled = true;
      this.#primaryNav.Idx = tile[0];
      this.#secondaryNav.Idx = tile[1];
    } else {
      this.#primaryEnabled = true;
      this.#secondaryEnabled = false;
      this.#secondaryNav.Idx = tile;
    }
  }
}

export type SpriteAction =
  | Action<"TileSelector::primary::up">
  | Action<"TileSelector::primary::down">
  | Action<"TileSelector::primary::left">
  | Action<"TileSelector::primary::right">
  | Action<"TileSelector::primary::toggle">
  | Action<"TileSelector::secondary::up">
  | Action<"TileSelector::secondary::down">
  | Action<"TileSelector::secondary::left">
  | Action<"TileSelector::secondary::right">
  | Action<"TileSelector::secondary::toggle">
  | Action<"TileSelector::sprites::swap">;
