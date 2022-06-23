import {
  BaseTexture,
  Container,
  ISpritesheetData,
  Sprite,
  Spritesheet,
  Text,
  TextStyle,
  Texture,
} from "pixi.js";

export type SpriteId = number;

interface Options {
  url: string;
  columns: number;
  rows: number;
  tileSize: number;
}

export class SpriteAtlas {
  readonly #sheet: Spritesheet;
  readonly #base: BaseTexture;
  readonly #columns: number;
  readonly #rows: number;
  readonly #tileSize: number;
  readonly #empty: () => Sprite;

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
  public get TileSize() {
    return this.#tileSize;
  }
  public get Empty() {
    return this.#empty();
  }

  constructor(
    sheet: Spritesheet,
    base: BaseTexture,
    columns: number,
    rows: number,
    tileSize: number,
    emptySprite?: SpriteId
  ) {
    this.#sheet = sheet;
    this.#base = base;
    this.#columns = columns;
    this.#rows = rows;
    this.#tileSize = tileSize;
    if (emptySprite) {
      this.#empty = () => this.spriteAt(emptySprite);
    } else {
      this.#empty = () => {
        const empty = new Sprite(Texture.EMPTY);
        empty.width = this.#tileSize;
        empty.height = this.#tileSize;
        return empty;
      };
    }
  }

  public spriteAt(id: SpriteId): Sprite {
    return new Sprite(this.#sheet.textures[`s${id}`]);
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
    for (let x = 0; x < this.#columns; x++) {
      for (let y = 0; y < this.#rows; y++) {
        const spr = this.spriteAt(x + y * this.#columns);
        spr.scale = { x: scale, y: scale };
        spr.x = xp + x * (this.#tileSize + 2) * scale;
        spr.y = yp + y * (this.#tileSize + 2) * scale;
        container.addChild(spr);
        const lbl = new Text(`${x}-${y}`, skewStyle);
        lbl.x = spr.x + 8;
        lbl.y = spr.y + 8;
        container.addChild(lbl);
      }
    }
  }
}

export function loadAtlas({
  url,
  columns,
  rows,
  tileSize,
}: Options): Promise<SpriteAtlas> {
  const bt = BaseTexture.from(url);
  const sh = new Spritesheet(bt, spriteDataOf(columns, rows, tileSize));
  return new Promise((resolve) => {
    sh.parse(() => resolve(new SpriteAtlas(sh, bt, columns, rows, tileSize)));
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
      const id = `s${x + y * columns}`;
      frames[id] = {
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
