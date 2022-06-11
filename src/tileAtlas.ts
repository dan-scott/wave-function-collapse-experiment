import {
  BaseTexture,
  Container,
  ISpritesheetData,
  Sprite,
  Spritesheet,
  Text,
  TextStyle,
} from "pixi.js";

interface Options {
  url: string;
  columns: number;
  rows: number;
  tileSize: number;
}

export interface ITileAtlas {
  readonly Rows: number;
  readonly Columns: number;
  draw(x: number, y: number, scale: number, container: Container): void;
  spriteAt(x: number, y: number): Sprite;
}

const id = (x: number, y: number) => `f${x}_${y}`;

class TileAtlas implements ITileAtlas {
  readonly #sheet: Spritesheet;
  readonly #base: BaseTexture;
  readonly #columns: number;
  readonly #rows: number;
  readonly #tileSize: number;

  public get SpriteSheet() {
    return this.#sheet;
  }
  public get BaseTexture() {
    return this.#base;
  }
  public get Columns() {
    return this.#columns;
  }
  public get Rows() {
    return this.#rows;
  }

  constructor(
    sheet: Spritesheet,
    base: BaseTexture,
    columns: number,
    rows: number,
    tileSize: number
  ) {
    this.#sheet = sheet;
    this.#base = base;
    this.#columns = columns;
    this.#rows = rows;
    this.#tileSize = tileSize;
  }

  public spriteAt(x: number, y: number): Sprite {
    return new Sprite(this.#sheet.textures[id(x, y)]);
  }

  draw(xp: number, yp: number, scale: number, container: Container): void {
    const skewStyle = new TextStyle({
      fontFamily: "Arial",
      fill: ["#ffffff"],
      fontSize: 10,
      fontWeight: "lighter",
      strokeThickness: 2,
      stroke: "red",
    });
    for (let x = 0; x < 23; x++) {
      for (let y = 0; y < 8; y++) {
        const spr = this.spriteAt(x, y);
        spr.scale = { x: scale, y: scale };
        spr.x = xp + x * (this.#tileSize + 1) * scale;
        spr.y = yp + y * (this.#tileSize + 1) * scale;
        container.addChild(spr);
        const lbl = new Text(`${x}-${y}`, skewStyle);
        lbl.x = spr.x + 8;
        lbl.y = spr.y + 8;
        container.addChild(lbl);
      }
    }
  }
}

export function loadTileAtlas({
  url,
  columns,
  rows,
  tileSize,
}: Options): Promise<ITileAtlas> {
  const bt = BaseTexture.from(url);
  const sh = new Spritesheet(bt, spriteDataOf(columns, rows, tileSize));
  return new Promise((resolve) => {
    sh.parse(() => resolve(new TileAtlas(sh, bt, columns, rows, tileSize)));
  });
}

function spriteDataOf(
  columns: number,
  rows: number,
  size: number
): ISpritesheetData {
  const frames: ISpritesheetData["frames"] = {};
  for (let x = 0; x < columns; x++) {
    for (let y = 0; y < rows; y++) {
      frames[id(x, y)] = {
        frame: {
          x: x * size,
          y: y * size,
          w: size,
          h: size,
        },
        rotated: false,
        trimmed: false,
        sourceSize: {
          w: size,
          h: size,
        },
        spriteSourceSize: {
          x: 0,
          y: 0,
        },
      };
    }
  }

  return {
    frames,
    meta: {
      scale: "1",
    },
  };
}
