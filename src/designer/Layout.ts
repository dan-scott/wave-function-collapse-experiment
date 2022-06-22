import { Container, Graphics } from "pixi.js";
import { Tile, TileId, TileSet } from "../tilesets/TileSet";
import { Action } from "../Action";
import { LayoutDesignerAction } from "./LayoutDesigner";
import { GridNav } from "./GridNav";
import { getStoreVal, setGridCell, setStoreVal } from "../Store";

export class Layout extends Container {
  readonly #grid: { tid: TileId; tile: Tile }[];
  readonly #columns: number;
  readonly #rows: number;
  readonly #tileSize: number;
  readonly #nav: GridNav;
  readonly #highlight: Graphics;
  readonly #tileSet: TileSet;
  readonly #gridContainer: Container;
  StampTileId: TileId = "empty";

  constructor(
    tileSet: TileSet,
    columns: number,
    rows: number,
    tileSize: number
  ) {
    super();
    this.#tileSet = tileSet;
    this.#columns = columns;
    this.#rows = rows;
    this.#tileSize = tileSize;
    this.#grid = [];
    this.#gridContainer = new Container();
    this.addChild(this.#gridContainer);
    const grid = getStoreVal("grid");
    for (let col = 0; col < this.#columns; col++) {
      for (let row = 0; row < this.#rows; row++) {
        const idx = col + row * columns;
        const tid = grid[idx] ?? "empty";
        const tile = this.#tileSet.GetTile(tid);
        tile.x = col * tileSize;
        tile.y = row * tileSize;
        this.#grid[idx] = { tid, tile };
        this.#gridContainer.addChild(tile);
      }
    }
    this.#nav = new GridNav({
      rows,
      columns,
      onChange: (n) => this.#updateSelected(n.XY),
    });
    this.#highlight = new Graphics();
    this.#highlight.lineStyle(1, 0xff0000, 0.8);
    this.#highlight.drawRect(0, 0, tileSize, tileSize);
    this.addChild(this.#highlight);

    const frame = new Graphics();
    frame.lineStyle(3, 0xffffff, 1);
    frame.drawRect(0, 0, tileSize * columns, tileSize * rows);
    this.addChild(frame);
    this.#nav.Idx = getStoreVal("cell");
  }

  act(action: LayoutDesignerAction) {
    switch (action.type) {
      case "Layout::cell::up":
        this.#nav.up();
        break;
      case "Layout::cell::down":
        this.#nav.down();
        break;
      case "Layout::cell::left":
        this.#nav.left();
        break;
      case "Layout::cell::right":
        this.#nav.right();
        break;
      case "Layout::cell::stamp":
        this.#stamp();
        break;
      default:
        break;
    }
  }

  #updateSelected([x, y]: [number, number]) {
    this.#highlight.x = x * this.#tileSize;
    this.#highlight.y = y * this.#tileSize;
    setStoreVal("cell", this.#nav.Idx);
  }

  #stamp() {
    const cell = this.#grid[this.#nav.Idx];
    this.#gridContainer.removeChild(cell.tile);
    cell.tid = this.StampTileId;
    cell.tile.destroy();
    cell.tile = this.#tileSet.GetTile(cell.tid);
    const [x, y] = this.#nav.XY;
    cell.tile.x = x * this.#tileSize;
    cell.tile.y = y * this.#tileSize;
    this.#gridContainer.addChild(cell.tile);
    setGridCell(this.#nav.Idx, cell.tid);
  }
}

export type LayoutAction =
  | Action<"Layout::cell::up">
  | Action<"Layout::cell::down">
  | Action<"Layout::cell::left">
  | Action<"Layout::cell::right">
  | Action<"Layout::cell::stamp">;
