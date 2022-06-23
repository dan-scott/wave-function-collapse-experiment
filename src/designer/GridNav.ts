interface Opts {
  columns: number;
  rows: number;
  init?: number;
  onChange?: NavChanged;
  wrap?: boolean;
}

interface NavChanged {
  (gn: GridNav): void;
}

export type Direction = "up" | "down" | "left" | "right";

const dirs: Direction[] = ["up", "down", "left", "right"];

export class GridNav {
  readonly #columns: number;
  readonly #size: number;
  readonly #onChange?: NavChanged;
  readonly #wrap: boolean;
  #idx: number;

  public get Idx() {
    return this.#idx;
  }

  public set Idx(val) {
    this.#idx = val;
    this.#emitChange();
  }

  public get XY(): [number, number] {
    const [r, c] = this.#rowAndCol();
    return [c, r / this.#columns];
  }

  constructor({ columns, rows, init, onChange, wrap }: Opts) {
    this.#columns = columns;
    this.#size = columns * rows;
    this.#idx = init ?? 0;
    this.#onChange = onChange;
    this.#wrap = wrap ?? true;
  }

  #rowAndCol() {
    const rowStart = Math.floor(this.#idx / this.#columns) * this.#columns;
    const col = this.#idx - rowStart;
    return [rowStart, col];
  }

  #emitChange() {
    if (this.#onChange) {
      this.#onChange(this);
    }
  }

  #idxAt(dir: Direction): number {
    const [rowStart, col] = this.#rowAndCol();
    if (this.#wrap) {
      switch (dir) {
        case "up":
          return (this.#idx + this.#size - this.#columns) % this.#size;
        case "down":
          return (this.#idx + this.#columns) % this.#size;
        case "left":
          return ((col + this.#columns - 1) % this.#columns) + rowStart;
        case "right":
          return ((col + 1) % this.#columns) + rowStart;
      }
    } else {
      switch (dir) {
        case "up":
          return this.#idx < this.#columns
            ? this.#idx
            : this.#idx - this.#columns;
        case "down":
          return this.#idx >= this.#size - this.#columns
            ? this.#idx
            : this.#idx + this.#columns;
        case "left":
          return this.#idx % this.#columns === 0 ? this.#idx : this.#idx - 1;
        case "right":
          return this.#idx % this.#columns === this.#columns - 1
            ? this.#idx
            : this.#idx + 1;
      }
    }
  }

  public neighbours(): Array<{ idx: number; direction: Direction }> {
    const nbs = [];
    for (const direction of dirs) {
      const idx = this.#idxAt(direction);
      if (idx !== this.#idx) {
        nbs.push({ idx, direction });
      }
    }
    return nbs;
  }

  public up(): number {
    this.#idx = this.#idxAt("up");
    this.#emitChange();
    return this.#idx;
  }

  public down(): number {
    this.#idx = this.#idxAt("down");
    this.#emitChange();
    return this.#idx;
  }

  public left(): number {
    this.#idx = this.#idxAt("left");
    this.#emitChange();
    return this.#idx;
  }

  public right(): number {
    this.#idx = this.#idxAt("right");
    this.#emitChange();
    return this.#idx;
  }
}
