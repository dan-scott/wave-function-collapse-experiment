import { Tile, TileId, TileSet } from "./tilesets/TileSet";
import { Container } from "pixi.js";
import { GridNav } from "./designer/GridNav";

interface GridCell {
  tid: TileId;
  tile: Tile;
}

interface Opts {
  tileSet: TileSet;
  columns: number;
  rows: number;
  grid?: TileId[];
}

export class GridDisplay extends Container {
  readonly #tileSet: TileSet;
  #nav: GridNav = new GridNav({ columns: 0, rows: 0 });
  #grid: Array<GridCell> = [];

  constructor({ columns, rows, grid, tileSet }: Opts) {
    super();
    this.#tileSet = tileSet;
    if (grid === undefined) {
      this.#setEmptyGrid(columns, rows);
    } else {
      this.setGrid(grid, columns);
    }
  }

  #setEmptyGrid(columns: number, rows: number): Array<GridCell> {
    this.#nav = new GridNav({ columns, rows });
    return [...Array(columns * rows).keys()].map((_, idx) => {
      const cell: GridCell = {
        tid: "empty",
        tile: this.#tileSet.GetTile("empty"),
      };
      this.#setTilePos(idx, cell.tile);
      this.addChild(cell.tile);
      return cell;
    });
  }

  #setTilePos(idx: number, tile: Tile) {
    this.#nav.Idx = idx;
    const [x, y] = this.#nav.XY;
    tile.x = x * this.#tileSet.TileSize;
    tile.y = y * this.#tileSet.TileSize;
  }

  setGrid(grid: TileId[], columns: number) {
    const rows = grid.length / columns;
    if (rows !== Math.round(rows)) {
      throw new Error("invalid column size for grid");
    }
    if (this.#grid) {
      this.#grid.forEach(({ tile }) => {
        this.removeChild(tile);
        tile.destroy({ children: true });
      });
    }
    this.#nav = new GridNav({ rows, columns });
    this.#grid = grid.map((tid, idx) => {
      const tile = this.#tileSet.GetTile(tid);
      this.#setTilePos(idx, tile);
      this.addChild(tile);
      return {
        tid,
        tile,
      };
    });
  }

  setCell(idx: number, tid: TileId) {
    const cell = this.#grid[idx];
    this.removeChild(cell.tile);
    cell.tile.destroy({ children: true });
    cell.tid = tid;
    cell.tile = this.#tileSet.GetTile(tid);
    this.#setTilePos(idx, cell.tile);
    this.addChild(cell.tile);
  }
}
