import { ITileAtlas } from "./tileAtlas";
import { AffinityMap, Direction } from "./affinityMap";
import { TileId } from "./tileId";
import { Container, Graphics } from "pixi.js";

interface Options {
  atlas: ITileAtlas;
  affinity: AffinityMap;
  width: number;
  height: number;
}

const randIdx = (i: ArrayLike<any>) =>
  Math.round(Math.random() * (i.length - 1));

const randItem = <T>(i: Iterable<T>): T => {
  const arr = Array.from(i);
  return arr[randIdx(arr)];
};

export class WaveFunctionGrid {
  readonly #atlas: ITileAtlas;
  readonly #affinity: AffinityMap;
  readonly #width: number;
  readonly #height: number;

  readonly #superPos: Array<Set<TileId>>;

  #visited: Set<number>;
  #modified: Set<number>;

  constructor({ atlas, affinity, width, height }: Options) {
    this.#atlas = atlas;
    this.#affinity = affinity;
    this.#width = width;
    this.#height = height;
    this.#superPos = [...Array(width * height).keys()].map(
      () => new Set(affinity.Ids)
    );
    this.#visited = new Set<number>();
    this.#modified = new Set<number>();
  }

  private idx(x: number, y: number) {
    return x + y * this.#width;
  }

  public step(): boolean {
    if (this.#modified.size === 0) {
      this.#visited.clear();
      return this.setLowestEntropyCell();
    }

    const nextModified = new Set<number>();
    for (const pos of this.#modified) {
      const tilesOfPos = this.#superPos[pos];
      for (const nhb of this.unvisitedNeighbours(pos)) {
        const modified = this.#affinity.intersection(
          tilesOfPos,
          nhb.dir,
          this.#superPos[nhb.pos]
        );
        if (modified) {
          nextModified.add(nhb.pos);
        }
      }
      this.#visited.add(pos);
    }
    this.#modified = nextModified;

    return true;
  }

  private unvisitedNeighbours(pos: number) {
    const orthoNeighbours: Array<{ dir: Direction; pos: number }> = [];
    if (pos % this.#width > 0) {
      orthoNeighbours.push({ dir: "w", pos: pos - 1 });
    }
    if (pos % this.#width < this.#width - 1) {
      orthoNeighbours.push({ dir: "e", pos: pos + 1 });
    }
    if (pos > this.#width) {
      orthoNeighbours.push({ dir: "n", pos: pos - this.#width });
    }
    if (pos < this.#superPos.length - this.#width) {
      orthoNeighbours.push({ dir: "s", pos: pos + this.#width });
    }
    return orthoNeighbours.filter(
      (t) => !this.#visited.has(t.pos) && this.#superPos[t.pos].size > 1
    );
  }

  private setLowestEntropyCell(): boolean {
    let byEnt = this.#superPos
      .map((s, i) => [i, s.size])
      .filter((t) => t[1] > 1);
    if (byEnt.length === 0) {
      return false;
    }
    byEnt.sort((a, b) => (a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0));
    const min = byEnt[0][1];
    byEnt = byEnt.filter((x) => x[1] == min);
    const [pos] = randItem(byEnt);
    const id = randItem(this.#superPos[pos]);
    this.#superPos[pos].clear();
    this.#superPos[pos].add(id);
    this.#modified.add(pos);

    return true;
  }

  public draw(container: Container) {
    for (let x = 0; x < this.#width; x++) {
      for (let y = 0; y < this.#height; y++) {
        const xs = x * this.#atlas.TileSize;
        const ys = y * this.#atlas.TileSize;
        const ts = this.#superPos[this.idx(x, y)];
        if (ts.size === 1) {
          const spr = this.#atlas.spriteAt(ts.values().next().value);
          spr.x = xs + 1;
          spr.y = ys + 1;
          container.addChild(spr);
        }
      }
    }
    const bounds = new Graphics();
    bounds.lineStyle(2, 0xffffff);
    bounds.drawRect(
      0,
      0,
      this.#width * this.#atlas.TileSize + 1,
      this.#height * this.#atlas.TileSize + 1
    );
    container.addChild(bounds);
  }
}
