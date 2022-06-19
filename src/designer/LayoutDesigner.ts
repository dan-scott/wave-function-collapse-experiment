import { Container, Graphics } from "pixi.js";
import { TileId, TileSet } from "../tilesets/TileSet";
import { Coordinate, crd } from "../coord";
import { SpriteAtlas } from "../sprites/SpriteAtlas";
import { SpriteIdStr } from "../sprites/SpriteId";

interface Options {
  width: number;
  height: number;
}

const defaultOptions: Options = {
  width: 10,
  height: 10,
};

export class LayoutDesigner extends Container {
  readonly #tileSet: TileSet;
  readonly #options: Options;
  readonly #selected: Coordinate;
  readonly #tileSelector: TileSelector;

  constructor(atlas: SpriteAtlas, opts: Partial<Options> = {}) {
    super();
    this.#tileSet = new TileSet(atlas);
    this.#options = { ...defaultOptions, ...opts };
    this.#selected = crd(0, 0);

    this.#tileSelector = new TileSelector(atlas);
    this.addChild(this.#tileSelector);
  }

  act(action: LayoutDesignerAction) {
    this.#tileSelector.act(action);
  }
}

const asTid = ([x, y]: [number, number]): SpriteIdStr => `${x}_${y}`;
const areSameTile = (a?: [number, number], b?: [number, number]): boolean => {
  if (a === undefined || b === undefined) {
    return false;
  }
  return a[0] === b[0] && a[1] === b[1];
};

class TileSelector extends Container {
  readonly #atlas: SpriteAtlas;

  #currentTile: [number, number];
  #primaryTile?: [number, number];
  #secondaryTile?: [number, number];

  readonly #currentHighlight: Graphics;
  readonly #primaryHighlight: Graphics;
  readonly #secondaryHighlight: Graphics;

  get TileId(): TileId {
    if (this.#primaryTile === undefined) {
      return "empty";
    }
    return this.#secondaryTile
      ? `${asTid(this.#primaryTile)}-${asTid(this.#secondaryTile)}`
      : asTid(this.#primaryTile);
  }

  constructor(atlas: SpriteAtlas) {
    super();
    this.#atlas = atlas;
    this.#atlas.draw(0, 0, 1, this);

    this.#currentTile = [0, 0];
    this.#currentHighlight = new Graphics();
    this.#currentHighlight.name = "current_highlight";
    this.#currentHighlight.lineStyle(1, 0xff0000, 1);
    this.#currentHighlight.drawRect(
      0,
      0,
      this.#atlas.TileSize,
      this.#atlas.TileSize
    );
    this.addChild(this.#currentHighlight);

    this.#primaryHighlight = new Graphics();
    this.#primaryHighlight.name = "primary_highlight";
    this.#primaryHighlight.lineStyle(1, 0x0000ff, 0.8);
    this.#primaryHighlight.drawRect(
      2,
      2,
      this.#atlas.TileSize - 4,
      this.#atlas.TileSize - 4
    );

    this.#secondaryHighlight = new Graphics();
    this.#secondaryHighlight.name = "secondary_highlight";
    this.#secondaryHighlight.lineStyle(1, 0x00ff00, 0.8);
    this.#secondaryHighlight.drawRect(
      4,
      4,
      this.#atlas.TileSize - 8,
      this.#atlas.TileSize - 8
    );
  }

  act(action: LayoutDesignerAction) {
    switch (action.type) {
      case "sprite_up":
        this.#spriteUp();
        break;
      case "sprite_down":
        this.#spriteDown();
        break;
      case "sprite_left":
        this.#spriteLeft();
        break;
      case "sprite_right":
        this.#spriteRight();
        break;
      case "sprite_toggle_primary":
        this.#togglePrimary();
        break;
      case "sprite_toggle_secondary":
        this.#toggleSecondary();
        break;
      case "sprite_swap_primary_secondary":
        this.#swap();
      default:
        break;
    }
  }

  #updateHighlights() {
    this.#updateHighlight(this.#currentHighlight, 1, this.#currentTile);
    this.#updateHighlight(this.#primaryHighlight, 5, this.#primaryTile);
    this.#updateHighlight(this.#secondaryHighlight, 9, this.#secondaryTile);
  }

  #updateHighlight(hgl: Graphics, offset: number, pos?: [number, number]) {
    if (pos === undefined) {
      if (hgl.parent) {
        this.removeChild(hgl);
      }
      return;
    }
    if (!hgl.parent) {
      this.addChild(hgl);
    }
    hgl.x = pos[0] * (hgl.width + offset);
    hgl.y = pos[1] * (hgl.height + offset);
  }

  #spriteUp() {
    this.#currentTile[1] =
      (this.#currentTile[1] + this.#atlas.Rows - 1) % this.#atlas.Rows;
    this.#updateHighlights();
  }

  #spriteDown() {
    this.#currentTile[1] = (this.#currentTile[1] + 1) % this.#atlas.Rows;
    this.#updateHighlights();
  }

  #spriteLeft() {
    this.#currentTile[0] =
      (this.#currentTile[0] + this.#atlas.Columns - 1) % this.#atlas.Columns;
    this.#updateHighlights();
  }

  #spriteRight() {
    this.#currentTile[0] = (this.#currentTile[0] + 1) % this.#atlas.Columns;
    this.#updateHighlights();
  }

  #togglePrimary() {
    if (areSameTile(this.#primaryTile, this.#currentTile)) {
      // current tile is primary, so we clear it
      this.#primaryTile = undefined;
    } else {
      // primary is either not set, or we're changing it
      this.#primaryTile = [...this.#currentTile];
      if (areSameTile(this.#primaryTile, this.#secondaryTile)) {
        // clear secondary if it's the same as new primary
        this.#secondaryTile = undefined;
      }
    }
    this.#updateHighlights();
  }

  #toggleSecondary() {
    if (areSameTile(this.#primaryTile, this.#currentTile)) {
      // don't set secondary to the same as primary, abort
      return;
    }
    if (areSameTile(this.#secondaryTile, this.#currentTile)) {
      // current tile is secondary, so we clear it
      this.#secondaryTile = undefined;
    } else {
      // secondary is either not set, or we're changing it
      this.#secondaryTile = [...this.#currentTile];
    }
    this.#updateHighlights();
  }

  #swap() {
    if (this.#primaryTile && this.#secondaryTile) {
      const tmp = this.#primaryTile;
      this.#primaryTile = this.#secondaryTile;
      this.#secondaryTile = tmp;
    }
  }
}

export type LayoutDesignerAction = SpriteAction;

type SpriteAction =
  | SpriteUp
  | SpriteDown
  | SpriteLeft
  | SpriteRight
  | SpriteTogglePrimary
  | SpriteToggleSecondary
  | SpriteSwap;

interface SpriteUp {
  type: "sprite_up";
}

interface SpriteDown {
  type: "sprite_down";
}

interface SpriteLeft {
  type: "sprite_left";
}

interface SpriteRight {
  type: "sprite_right";
}

interface SpriteTogglePrimary {
  type: "sprite_toggle_primary";
}

interface SpriteToggleSecondary {
  type: "sprite_toggle_secondary";
}

interface SpriteSwap {
  type: "sprite_swap_primary_secondary";
}
