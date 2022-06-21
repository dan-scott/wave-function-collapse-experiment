import { Container, Graphics } from "pixi.js";
import { Tile, TileId, TileSet } from "../tilesets/TileSet";
import { Action } from "../Action";
import { LayoutDesignerAction } from "./LayoutDesigner";

export class Layout extends Container {
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

export type LayoutAction =
  | Action<"Layout::cell::up">
  | Action<"Layout::cell::down">
  | Action<"Layout::cell::left">
  | Action<"Layout::cell::right">
  | Action<"Layout::cell::stamp">;
