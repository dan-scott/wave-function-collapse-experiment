import { Container } from "pixi.js";
import { Tile, TileSet } from "../tilesets/TileSet";
import { SpriteAtlas } from "../sprites/SpriteAtlas";
import { SpriteAction, TileSelector } from "./TileSelector";
import { Layout, LayoutAction } from "./Layout";
import { getStoreVal } from "../Store";

export type LayoutDesignerAction = SpriteAction | LayoutAction;

export class LayoutDesigner extends Container {
  readonly #tileSet: TileSet;
  readonly #layout: Layout;
  readonly #tileSelector: TileSelector;
  #currentTilePreview: Tile;

  constructor(atlas: SpriteAtlas) {
    super();
    this.#tileSet = new TileSet(atlas);

    this.#tileSelector = new TileSelector(atlas);
    this.#tileSelector.scale = { x: 0.5, y: 0.5 };
    this.addChild(this.#tileSelector);

    this.#currentTilePreview = this.#tileSet.getTile("empty");
    this.addChild(this.#currentTilePreview);

    const width = getStoreVal("width");
    const height = getStoreVal("height");

    this.#layout = new Layout(this.#tileSet, width, height);
    this.addChild(this.#layout);
    this.#layout.y = this.#tileSelector.height + 5;

    this.#updateSelectedTile();
  }

  act(action: LayoutDesignerAction) {
    this.#tileSelector.act(action);
    this.#updateSelectedTile();
    this.#layout.act(action);
  }

  #updateSelectedTile() {
    this.removeChild(this.#currentTilePreview);
    this.#currentTilePreview.destroy();
    this.#currentTilePreview = this.#tileSet.getTile(this.#tileSelector.TileId);
    this.#currentTilePreview.x = this.#tileSelector.width + 5;
    this.addChild(this.#currentTilePreview);
    this.#layout.StampTileId = this.#tileSelector.TileId;
  }
}
