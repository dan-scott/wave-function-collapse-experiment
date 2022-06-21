import { Container, Graphics } from "pixi.js";
import { Tile, TileId, TileSet } from "../tilesets/TileSet";
import { SpriteAtlas } from "../sprites/SpriteAtlas";
import { SpriteIdStr } from "../sprites/SpriteId";

export type LayoutDesignerAction = SpriteAction | LayoutAction;

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
  readonly #layout: Layout;
  readonly #options: Options;
  readonly #tileSelector: TileSelector;
  #currentTilePreview: Tile;

  constructor(atlas: SpriteAtlas, opts: Partial<Options> = {}) {
    super();
    this.#tileSet = new TileSet(atlas);
    this.#options = { ...defaultOptions, ...opts };

    this.#tileSelector = new TileSelector(atlas);
    this.#tileSelector.scale = { x: 0.5, y: 0.5 };
    this.addChild(this.#tileSelector);

    this.#currentTilePreview = this.#tileSet.GetTile("empty");
    this.addChild(this.#currentTilePreview);

    this.#layout = new Layout(
      this.#tileSet,
      this.#options.width,
      this.#options.height,
      atlas.TileSize
    );
    this.addChild(this.#layout);
    this.#layout.y = this.#tileSelector.height + 5;
  }

  act(action: LayoutDesignerAction) {
    this.#tileSelector.act(action);
    this.#updateSelectedTile();
    this.#layout.act(action);
  }

  #updateSelectedTile() {
    this.removeChild(this.#currentTilePreview);
    this.#currentTilePreview.destroy();
    this.#currentTilePreview = this.#tileSet.GetTile(this.#tileSelector.TileId);
    this.#currentTilePreview.x = this.#tileSelector.width + 5;
    this.addChild(this.#currentTilePreview);
    this.#layout.StampTileId = this.#tileSelector.TileId;
  }
}

class Layout extends Container {
  readonly #grid: { tid: TileId; tile: Tile }[][];
  readonly #columns: number;
  readonly #rows: number;
  readonly #tileSize: number;
  readonly #current: [number, number];
  readonly #highlight: Graphics;
  readonly #tileSet: TileSet;
  StampTileId: TileId = "empty";

  constructor(
    tileSet: TileSet,
    width: number,
    height: number,
    tileSize: number
  ) {
    super();
    this.#tileSet = tileSet;
    this.#columns = width;
    this.#rows = height;
    this.#tileSize = tileSize;
    this.#grid = [];
    for (let col = 0; col < this.#columns; col++) {
      this.#grid[col] = [];
      for (let row = 0; row < this.#rows; row++) {
        this.#grid[col][row] = {
          tid: "empty",
          tile: this.#tileSet.GetTile("empty"),
        };
      }
    }
    this.#current = [0, 0];
    this.#highlight = new Graphics();
    this.#highlight.lineStyle(1, 0xff0000, 0.8);
    this.#highlight.drawRect(0, 0, tileSize, tileSize);
    this.addChild(this.#highlight);

    const frame = new Graphics();
    frame.lineStyle(3, 0xffffff, 1);
    frame.drawRect(0, 0, tileSize * width, tileSize * height);
    this.addChild(frame);
  }

  act(action: LayoutDesignerAction) {
    switch (action.type) {
      case "layout_cell_down":
        this.#current[1] = (this.#current[1] + 1) % this.#rows;
        break;
      case "layout_cell_up":
        this.#current[1] = (this.#current[1] + this.#rows - 1) % this.#rows;
        break;
      case "layout_cell_left":
        this.#current[0] =
          (this.#current[0] + this.#columns - 1) % this.#columns;
        break;
      case "layout_cell_right":
        this.#current[0] = (this.#current[0] + 1) % this.#columns;
        break;
      case "layout_cell_stamp_selected_tile":
        const cell = this.#grid[this.#current[0]][this.#current[1]];
        this.removeChild(cell.tile);
        cell.tid = this.StampTileId;
        cell.tile = this.#tileSet.GetTile(cell.tid);
        cell.tile.x = this.#current[0] * this.#tileSize;
        cell.tile.y = this.#current[1] * this.#tileSize;
        this.addChild(cell.tile);
        break;
      default:
        break;
    }
    this.#updateSelected();
  }

  #updateSelected() {
    this.#highlight.x = this.#current[0] * this.#tileSize;
    this.#highlight.y = this.#current[1] * this.#tileSize;
  }
}

type LayoutAction =
  | LayoutCellUp
  | LayoutCellDown
  | LayoutCellLeft
  | LayoutCellRight
  | LayoutCellStampSelected;

interface LayoutCellUp {
  type: "layout_cell_up";
}

interface LayoutCellDown {
  type: "layout_cell_down";
}

interface LayoutCellLeft {
  type: "layout_cell_left";
}

interface LayoutCellRight {
  type: "layout_cell_right";
}

interface LayoutCellStampSelected {
  type: "layout_cell_stamp_selected_tile";
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
    this.#currentHighlight.lineStyle(2, 0xff0000, 1);
    this.#currentHighlight.drawRect(
      0,
      0,
      this.#atlas.TileSize,
      this.#atlas.TileSize
    );
    this.addChild(this.#currentHighlight);

    this.#primaryHighlight = new Graphics();
    this.#primaryHighlight.name = "primary_highlight";
    this.#primaryHighlight.lineStyle(2, 0x0000ff, 0.8);
    this.#primaryHighlight.drawRect(
      2,
      2,
      this.#atlas.TileSize - 4,
      this.#atlas.TileSize - 4
    );

    this.#secondaryHighlight = new Graphics();
    this.#secondaryHighlight.name = "secondary_highlight";
    this.#secondaryHighlight.lineStyle(2, 0x00ff00, 0.8);
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
        break;
      default:
        break;
    }
    this.#updateHighlights();
  }

  #updateHighlights() {
    this.#updateHighlight(this.#currentHighlight, 0, this.#currentTile);
    this.#updateHighlight(this.#primaryHighlight, 4, this.#primaryTile);
    this.#updateHighlight(this.#secondaryHighlight, 8, this.#secondaryTile);
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
  }

  #spriteDown() {
    this.#currentTile[1] = (this.#currentTile[1] + 1) % this.#atlas.Rows;
  }

  #spriteLeft() {
    this.#currentTile[0] =
      (this.#currentTile[0] + this.#atlas.Columns - 1) % this.#atlas.Columns;
  }

  #spriteRight() {
    this.#currentTile[0] = (this.#currentTile[0] + 1) % this.#atlas.Columns;
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
  }

  #swap() {
    if (this.#primaryTile && this.#secondaryTile) {
      const tmp = this.#primaryTile;
      this.#primaryTile = this.#secondaryTile;
      this.#secondaryTile = tmp;
    }
  }
}

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
