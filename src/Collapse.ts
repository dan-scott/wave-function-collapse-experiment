import { TileId } from "./tilesets/TileSet";
import { Direction, GridNav } from "./designer/GridNav";
import { SpriteId } from "./sprites/SpriteAtlas";

type TileIdStr = SpriteId | "empty" | `${SpriteId}_${SpriteId}`;

type CompatStr = `${TileIdStr}::${Direction}::${TileIdStr}`;

function compatStr(
  origin: TileIdStr,
  dir: Direction,
  tgt: TileIdStr
): CompatStr {
  return `${origin}::${dir}::${tgt}`;
}

function toStr(id?: TileId): TileIdStr {
  if (!id || id === "empty") {
    return "empty";
  }
  if (Array.isArray(id)) {
    if (id[0] === id[1]) {
      return id[0];
    }
    return `${id[0]}_${id[1]}`;
  }
  return id;
}

function fromStr(id: TileIdStr): TileId {
  if (typeof id === "number" || id === "empty") {
    return id;
  }
  const parts = id.split("_");
  return [parseInt(parts[0], 10), parseInt(parts[1], 10)];
}

interface Opts {
  inputGrid: TileId[];
  inputWidth: number;
  rows: number;
  columns: number;
}

interface SuperPosition {
  tiles: Array<TileIdStr>;
  entropy: number;
}

export class WaveFunction {
  readonly #opts: Opts;
  readonly #superPos: Array<SuperPosition>;
  readonly #compat: Set<CompatStr>;
  readonly #weights: Map<TileIdStr, number>;

  constructor(opts: Opts) {
    this.#opts = opts;
    this.#weights = WaveFunction.#calcWeights(opts);
    this.#superPos = this.#genSuperPos(opts);
    this.#compat = WaveFunction.#genCompat(opts);
  }

  gen(): TileId[] {
    while (!this.#isFullyCollapsed()) {
      const idx = this.#minEntropyIdx();
      this.#collapseIdx(idx);
      this.#propagateFrom(idx);
    }
    return this.#getOutputGrid();
  }

  #isFullyCollapsed(): boolean {
    for (const { tiles } of this.#superPos) {
      if (tiles.length > 1) {
        return false;
      }
    }
    return true;
  }

  static #calcWeights({ inputGrid }: Opts) {
    const weights: Map<TileIdStr, number> = new Map<TileIdStr, number>();
    for (const tid of inputGrid) {
      const idStr = toStr(tid);
      weights.set(idStr, 1 + (weights.get(idStr) ?? 0));
    }
    return weights;
  }

  #entropyOf(tiles: Array<TileIdStr>): number {
    let weightSum = 0;
    let logWeightSum = 0;
    for (const tile of tiles) {
      const weight = this.#weights.get(tile) ?? 0;
      weightSum += weight;
      logWeightSum += weight * Math.log(weight);
    }

    return Math.log(weightSum) - logWeightSum / weightSum;
  }

  #genSuperPos({ inputGrid }: Opts): Array<SuperPosition> {
    const tileStrings: TileIdStr[] = [...this.#weights.keys()];
    const entropy = this.#entropyOf(tileStrings);
    return inputGrid.map(() => ({
      tiles: [...tileStrings],
      entropy: entropy,
    }));
  }

  static #genCompat({ inputGrid, inputWidth }: Opts) {
    const inputHeight = inputGrid.length / inputWidth;
    const inputNav = new GridNav({
      columns: inputWidth,
      rows: inputHeight,
      wrap: false,
    });
    return inputGrid.reduce((compat, tileId, i) => {
      inputNav.Idx = i;
      const tile = toStr(tileId);
      for (const { idx, direction } of inputNav.neighbours()) {
        compat.add(`${tile}::${direction}::${toStr(inputGrid[idx])}`);
      }
      return compat;
    }, new Set<CompatStr>());
  }

  #minEntropyIdx(): number {
    let min = Number.MAX_VALUE;
    let minIdx = this.#superPos.length;
    for (let i = 0; i < this.#superPos.length; i++) {
      if (this.#superPos[i].tiles.length <= 1) {
        continue;
      }
      const ent = this.#superPos[i].entropy - Math.random() / 1000;
      if (ent < min) {
        min = ent;
        minIdx = i;
      }
    }
    return minIdx;
  }

  #collapseIdx(idx: number) {
    const weights = this.#superPos[idx].tiles.map((tileId) => ({
      tileId,
      weight: this.#weights.get(tileId) ?? 0,
    }));
    const total = weights.reduce((t, w) => t + w.weight, 0);
    let rand = Math.random() * total;
    let chosen: TileIdStr | undefined;
    for (const { tileId, weight } of weights) {
      rand -= weight;
      if (rand < 0) {
        chosen = tileId;
      }
    }
    if (chosen === undefined) {
      throw new Error("HOW NO TILE!?");
    }
    this.#superPos[idx].tiles = [chosen];
  }

  #propagateFrom(startIdx: number) {
    const stack = [startIdx];
    const nav = new GridNav({
      rows: this.#opts.rows,
      columns: this.#opts.columns,
      wrap: false,
    });
    while (stack.length > 0) {
      const currIdx = stack.pop()!;
      const currSuper = this.#superPos[currIdx].tiles;
      nav.Idx = currIdx;
      for (const { idx, direction } of nav.neighbours()) {
        const otherTiles = [...this.#superPos[idx].tiles];
        for (const tile of otherTiles) {
          const isPossible = currSuper.some((t) =>
            this.#compat.has(compatStr(t, direction, tile))
          );
          if (!isPossible) {
            const idxO = this.#superPos[idx].tiles.indexOf(tile);
            this.#superPos[idx].tiles.splice(idxO, 1);
            this.#superPos[idx].entropy = this.#entropyOf(
              this.#superPos[idx].tiles
            );
            if (stack.indexOf(idx) == -1) {
              stack.push(idx);
            }
          }
        }
      }
    }
  }

  #getOutputGrid() {
    return this.#superPos.map(({ tiles }) => fromStr(tiles[0]));
  }
}
