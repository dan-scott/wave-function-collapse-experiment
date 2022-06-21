import { Container } from "pixi.js";
import { Tile, TileSet } from "../tilesets/TileSet";
import { SpriteAtlas } from "../sprites/SpriteAtlas";
import { SpriteAction, TileSelector } from "./TileSelector";
import { Layout, LayoutAction } from "./Layout";

export type LayoutDesignerAction = SpriteAction | LayoutAction;

interface Options {
  width: number;
  height: number;
}

const defaultOptions: Options = {
  width: 10,
  height: 10,
};

export class LayoutDesigner extends Container {
  readonly #tileSet: TileSet;
  readonly #layout: Layout;
  readonly #options: Options;
  readonly #tileSelector: TileSelector;
  #currentTilePreview: Tile;

  constructor(atlas: SpriteAtlas, opts: Partial<Options> = {}) {
    super();
    this.#tileSet = new TileSet(atlas);
    this.#options = { ...defaultOptions, ...opts };

    this.#tileSelector = new TileSelector(atlas);
    this.#tileSelector.scale = { x: 0.5, y: 0.5 };
    this.addChild(this.#tileSelector);

    this.#currentTilePreview = this.#tileSet.GetTile("empty");
    this.addChild(this.#currentTilePreview);

    this.#layout = new Layout(
      this.#tileSet,
      this.#options.width,
      this.#options.height,
      atlas.TileSize
    );
    this.addChild(this.#layout);
    this.#layout.y = this.#tileSelector.height + 5;
  }

  act(action: LayoutDesignerAction) {
    this.#tileSelector.act(action);
    this.#updateSelectedTile();
    this.#layout.act(action);
  }

  #updateSelectedTile() {
    this.removeChild(this.#currentTilePreview);
    this.#currentTilePreview.destroy();
    this.#currentTilePreview = this.#tileSet.GetTile(this.#tileSelector.TileId);
    this.#currentTilePreview.x = this.#tileSelector.width + 5;
    this.addChild(this.#currentTilePreview);
    this.#layout.StampTileId = this.#tileSelector.TileId;
  }
}
