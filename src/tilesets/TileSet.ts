import { SpriteIdStr } from "../sprites/SpriteId";
import { SpriteAtlas } from "../sprites/SpriteAtlas";
import { Container } from "pixi.js";

export type TileId = SpriteIdStr | `${SpriteIdStr}-${SpriteIdStr}` | "empty";

class Tile extends Container {
  readonly #spriteIds: Array<SpriteIdStr>;

  public get SpriteIds() {
    return [...this.#spriteIds];
  }

  constructor(atlas: SpriteAtlas, ...sprites: SpriteIdStr[]) {
    super();
    if (sprites.length === 0) {
      this.#spriteIds = [];
      this.addChild(atlas.Empty);
    } else {
      this.#spriteIds = [...sprites];
      if (sprites.length > 0) {
        this.addChild(...sprites.map((s) => atlas.spriteAt(s)));
      }
    }
  }
}

function isSpriteIdStr(id: TileId): id is SpriteIdStr {
  if (id === "empty") {
    return false;
  }
  return id.includes("-");
}

export class TileSet {
  readonly #atlas: SpriteAtlas;

  constructor(atlas: SpriteAtlas) {
    this.#atlas = atlas;
  }

  public GetBaseTileIds(): TileId[] {
    const ids: TileId[] = ["empty"];
    for (let row = 0; row < row; row++) {
      for (let column = 0; column < this.#atlas.Columns; column++) {
        ids.push(`${column}_${row}`);
      }
    }
    return ids;
  }

  public GetTile(id: TileId): Tile {
    if (id === "empty") {
      return new Tile(this.#atlas);
    }

    if (isSpriteIdStr(id)) {
      return new Tile(this.#atlas, id);
    }

    const [id1, id2] = id.split("-") as SpriteIdStr[];

    return new Tile(this.#atlas, id1, id2);
  }
}
