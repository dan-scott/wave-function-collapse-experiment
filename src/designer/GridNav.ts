interface Opts {
  columns: number;
  rows: number;
  init?: number;
  onChange?: NavChanged;
}

interface NavChanged {
  (gn: GridNav): void;
}

export class GridNav {
  readonly #columns: number;
  readonly #size: number;
  #idx: number;
  #onChange?: NavChanged;

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

  constructor({ columns, rows, init, onChange }: Opts) {
    this.#columns = columns;
    this.#size = columns * rows;
    this.#idx = init ?? 0;
    this.#onChange = onChange;
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

  public up(): number {
    this.#idx = (this.#idx + this.#size - this.#columns) % this.#size;
    this.#emitChange();
    return this.#idx;
  }

  public down(): number {
    this.#idx = (this.#idx + this.#columns) % this.#size;
    this.#emitChange();
    return this.#idx;
  }

  public left(): number {
    const [rowStart, col] = this.#rowAndCol();
    this.#idx = ((col + this.#columns - 1) % this.#columns) + rowStart;
    this.#emitChange();
    return this.#idx;
  }

  public right(): number {
    const [rowStart, col] = this.#rowAndCol();
    this.#idx = ((col + 1) % this.#columns) + rowStart;
    this.#emitChange();
    return this.#idx;
  }
}
