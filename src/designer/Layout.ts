import { Container, Graphics } from "pixi.js";
import { TileId, TileSet } from "../tilesets/TileSet";
import { Action } from "../Action";
import { LayoutDesignerAction } from "./LayoutDesigner";
import { GridNav } from "./GridNav";
import { getStoreVal, setGridCell, setStoreVal } from "../Store";
import { GridDisplay } from "../GridDisplay";

export class Layout extends Container {
  readonly #tileSize: number;
  readonly #nav: GridNav;
  readonly #highlight: Graphics;
  readonly #display: GridDisplay;
  StampTileId: TileId = "empty";

  constructor(tileSet: TileSet, columns: number, rows: number) {
    super();
    this.#tileSize = tileSet.TileSize;
    const grid = getStoreVal("grid");
    this.#display = new GridDisplay({ columns, rows, grid, tileSet });
    this.addChild(this.#display);
    this.#nav = new GridNav({
      rows,
      columns,
      onChange: (n) => this.#updateSelected(n.XY),
    });
    this.#highlight = new Graphics();
    this.#highlight.lineStyle(1, 0xff0000, 0.8);
    this.#highlight.drawRect(0, 0, this.#tileSize, this.#tileSize);
    this.addChild(this.#highlight);

    const frame = new Graphics();
    frame.lineStyle(3, 0xffffff, 1);
    frame.drawRect(0, 0, this.#tileSize * columns, this.#tileSize * rows);
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
    this.#display.setCell(this.#nav.Idx, this.StampTileId);
    setGridCell(this.#nav.Idx, this.StampTileId);
  }
}

export type LayoutAction =
  | Action<"Layout::cell::up">
  | Action<"Layout::cell::down">
  | Action<"Layout::cell::left">
  | Action<"Layout::cell::right">
  | Action<"Layout::cell::stamp">;
