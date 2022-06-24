import { SpriteAtlas, SpriteId } from "../sprites/SpriteAtlas";
import { Container, Text, TextStyle } from "pixi.js";

export type TileText = string;

export type TileId = "empty" | SpriteId | [SpriteId, SpriteId];

export interface Tile extends Container {}

export class TileSet {
  readonly #atlas: SpriteAtlas;

  public get TileSize() {
    return this.#atlas.TileSize;
  }

  constructor(atlas: SpriteAtlas) {
    this.#atlas = atlas;
  }

  public GetTile(idOrText: TileId | TileText): Tile {
    if (idOrText === "empty") {
      return this.#atlas.Empty as Tile;
    }

    if (typeof idOrText === "string") {
      return this.#genTextTile(idOrText);
    }

    if (Array.isArray(idOrText)) {
      return this.#layeredTile(idOrText);
    }

    return this.#atlas.spriteAt(idOrText);
  }

  #layeredTile([bottom, top]: [number, number]) {
    const container = new Container();
    container.addChild(this.#atlas.spriteAt(bottom), this.#atlas.spriteAt(top));
    return container;
  }

  #genTextTile(text: string) {
    const style = new TextStyle({
      fill: "white",
      fontSize: this.TileSize / 2,
    });
    const txtTile = new Text(text, style);
    txtTile.calculateBounds();
    txtTile.x = (this.#atlas.TileSize - txtTile.width) / 2;
    txtTile.y = (this.#atlas.TileSize - txtTile.height) / 2;
    const container = new Container();
    container.addChild(txtTile);
    return container;
  }
}
