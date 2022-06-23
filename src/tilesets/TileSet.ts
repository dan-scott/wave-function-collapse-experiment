import { SpriteAtlas, SpriteId } from "../sprites/SpriteAtlas";
import { Container } from "pixi.js";

export type TileId = "empty" | SpriteId | [SpriteId, SpriteId];

export class Tile extends Container {
  constructor(atlas: SpriteAtlas, ...sprites: SpriteId[]) {
    super();
    if (sprites.length === 0) {
      this.addChild(atlas.Empty);
    } else {
      if (sprites.length > 0) {
        this.addChild(...sprites.map((s) => atlas.spriteAt(s)));
      }
    }
  }
}

export class TileSet {
  readonly #atlas: SpriteAtlas;

  public get TileSize() {
    return this.#atlas.TileSize;
  }

  constructor(atlas: SpriteAtlas) {
    this.#atlas = atlas;
  }

  public GetTile(id: TileId): Tile {
    if (id === "empty") {
      return new Tile(this.#atlas);
    }

    if (Array.isArray(id)) {
      return new Tile(this.#atlas, ...id);
    }

    return new Tile(this.#atlas, id);
  }
}
