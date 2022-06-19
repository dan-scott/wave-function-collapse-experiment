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
import { idx, SpriteId } from "./spriteId";

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
  readonly #empty: Sprite;

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
    return this.#empty;
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
      this.#empty = this.spriteAt(emptySprite);
    } else {
      this.#empty = new Sprite(Texture.EMPTY);
      this.#empty.width = this.#tileSize;
      this.#empty.height = this.#tileSize;
    }
  }

  public spriteAt(id: SpriteId): Sprite {
    if (id.isEmpty) {
      const spr = new Sprite();
      spr.width = this.#tileSize;
      spr.height = this.#tileSize;
    }
    return new Sprite(this.#sheet.textures[id.id]);
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
        const spr = this.spriteAt(idx(x, y));
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
      frames[idx(x, y).id] = {
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
