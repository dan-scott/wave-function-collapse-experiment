export type TileIdStr = `${number}_${number}`;

const idStr = (x: number, y: number): TileIdStr => `${x}_${y}`;

const idxDict: Record<TileIdStr, TileId> = {};

export class TileId {
  readonly #x: number;
  readonly #y: number;
  readonly #id: TileIdStr;

  public get x() {
    return this.#x;
  }

  public get y() {
    return this.#y;
  }

  public get id() {
    return this.#id;
  }

  private constructor(x: number, y: number, id: TileIdStr) {
    this.#x = x;
    this.#y = y;
    this.#id = id;
  }

  public static Of(id: { x: number; y: number } | TileIdStr) {
    if (typeof id === "object") {
      const i = idStr(id.x, id.y);
      if (!idxDict[i]) {
        idxDict[i] = new TileId(id.x, id.y, i);
      }
      return idxDict[i];
    }
    if (!idxDict[id]) {
      const parts = id.split("_");
      idxDict[id] = new TileId(
        parseInt(parts[0], 10),
        parseInt(parts[1], 10),
        id
      );
    }
    return idxDict[id];
  }
}

export const idx = (x: number, y: number): TileId => TileId.Of({ x, y });
