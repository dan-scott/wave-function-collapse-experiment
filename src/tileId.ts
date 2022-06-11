const idStr = (x: number, y: number) => `${x}_${y}`;

const idxDict: Record<string, TileId> = {};

export class TileId {
  readonly #x: number;
  readonly #y: number;
  readonly #id: string;

  public get x() {
    return this.#x;
  }

  public get y() {
    return this.#y;
  }

  public get id() {
    return this.#id;
  }

  private constructor(x: number, y: number, id: string) {
    this.#x = x;
    this.#y = y;
    this.#id = id;
  }

  public static Of(x: number, y: number) {
    const i = idStr(x, y);
    if (!idxDict[i]) {
      idxDict[i] = new TileId(x, y, i);
    }
    return idxDict[i];
  }
}

export const idx = (x: number, y: number): TileId => TileId.Of(x, y);
