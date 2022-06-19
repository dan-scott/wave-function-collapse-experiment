export type SpriteIdStr = `${number}_${number}`;

const idStr = (x: number, y: number): SpriteIdStr => `${x}_${y}`;

const idxDict: Record<SpriteIdStr, SpriteId> = {};

export class SpriteId {
  readonly #x: number;
  readonly #y: number;
  readonly #id: SpriteIdStr;

  public get x() {
    return this.#x;
  }

  public get y() {
    return this.#y;
  }

  public get id() {
    return this.#id;
  }

  public get isEmpty() {
    return this === SpriteId.Empty();
  }

  private constructor(x: number, y: number, id: SpriteIdStr) {
    this.#x = x;
    this.#y = y;
    this.#id = id;
  }

  public static Of(id: { x: number; y: number } | SpriteIdStr) {
    if (typeof id === "object") {
      const i = idStr(id.x, id.y);
      if (!idxDict[i]) {
        idxDict[i] = new SpriteId(id.x, id.y, i);
      }
      return idxDict[i];
    }
    if (!idxDict[id]) {
      const parts = id.split("_");
      idxDict[id] = new SpriteId(
        parseInt(parts[0], 10),
        parseInt(parts[1], 10),
        id
      );
    }
    return idxDict[id];
  }

  public static Empty(): SpriteId {
    return SpriteId.Of({ x: -1, y: -1 });
  }
}

export const idx = (x: number, y: number): SpriteId => SpriteId.Of({ x, y });
