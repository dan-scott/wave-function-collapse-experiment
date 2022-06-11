import { ITileAtlas } from "./tileAtlas";
import { Container } from "pixi.js";

interface TileId {
  x: number;
  y: number;
}

interface IAffinity {
  n: Set<TileId>;
  s: Set<TileId>;
  e: Set<TileId>;
  w: Set<TileId>;
}

export type Direction = keyof IAffinity;

const contra: Record<Direction, Direction> = {
  n: "s",
  s: "n",
  e: "w",
  w: "e",
};

const idxDict: Record<string, TileId> = {};

export const idx = (x: number, y: number): TileId => {
  const i = `f${x}_${y}`;
  if (!idxDict[i]) {
    idxDict[i] = Object.freeze({ x, y });
  }
  return idxDict[i];
};

export class AffinityMap {
  readonly #atlas: ITileAtlas;
  readonly #map: Record<string, IAffinity> = {};

  private idx = ({ x, y }: TileId) => `f${x}_${y}`;

  public constructor(atlas: ITileAtlas) {
    this.#atlas = atlas;
    for (let x = 0; x < atlas.Columns; x++) {
      for (let y = 0; y < atlas.Rows; y++) {
        this.#map[this.idx(idx(x, y))] = {
          n: new Set(),
          s: new Set(),
          e: new Set(),
          w: new Set(),
        };
      }
    }
  }

  public addAffinity(l: TileId, d: Direction, ...rs: TileId[]) {
    rs.forEach((r) => {
      this.#map[this.idx(l)][d].add(r);
      this.#map[this.idx(r)][contra[d]].add(l);
    });
  }

  public drawTileAffinity(
    id: TileId,
    x: number,
    y: number,
    container: Container
  ) {
    const centerSprite = this.#atlas.spriteAt(id.x, id.y);
    centerSprite.x = x;
    centerSprite.y = y;
    centerSprite.scale = { x: 3, y: 3 };
    container.addChild(centerSprite);

    Array.from(this.#map[this.idx(id)].n).forEach((t, i) => {
      const spr = this.#atlas.spriteAt(t.x, t.y);
      spr.x = x + i * 17;
      spr.y = y - 73;
      container.addChild(spr);
    });

    Array.from(this.#map[this.idx(id)].s).forEach((t, i) => {
      const spr = this.#atlas.spriteAt(t.x, t.y);
      spr.x = x + i * 17;
      spr.y = y + 100;
      container.addChild(spr);
    });

    Array.from(this.#map[this.idx(id)].e).forEach((t, i) => {
      const spr = this.#atlas.spriteAt(t.x, t.y);
      spr.x = x + 100;
      spr.y = y + i * 17;
      container.addChild(spr);
    });

    Array.from(this.#map[this.idx(id)].w).forEach((t, i) => {
      const spr = this.#atlas.spriteAt(t.x, t.y);
      spr.x = x - 73;
      spr.y = y + i * 17;
      container.addChild(spr);
    });
  }
}
