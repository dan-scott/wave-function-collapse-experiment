import { ITileAtlas } from "./tileAtlas";
import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { idx, TileId } from "./tileId";

interface IAffinity {
  n: Set<TileId>;
  s: Set<TileId>;
  e: Set<TileId>;
  w: Set<TileId>;
}

export type Direction = keyof IAffinity;

const contra: Record<Direction, Direction> = {
  n: "s",
  s: "n",
  e: "w",
  w: "e",
};

export class AffinityMap {
  readonly #atlas: ITileAtlas;
  readonly #map: Record<string, IAffinity> = {};
  readonly #tileIds: Set<TileId> = new Set<TileId>();

  public get Ids() {
    return Array.from(this.#tileIds);
  }

  public constructor(atlas: ITileAtlas) {
    this.#atlas = atlas;
    for (let x = 0; x < atlas.Columns; x++) {
      for (let y = 0; y < atlas.Rows; y++) {
        this.#map[idx(x, y).id] = {
          n: new Set(),
          s: new Set(),
          e: new Set(),
          w: new Set(),
        };
      }
    }
  }

  public add(l: TileId, d: Direction, ...rs: TileId[]) {
    this.#tileIds.add(l);
    rs.forEach((r) => {
      this.#tileIds.add(r);
      this.#map[l.id][d].add(r);
      this.#map[r.id][contra[d]].add(l);
    });
  }

  public drawTileAffinity(
    id: TileId,
    x: number,
    y: number,
    container: Container
  ) {
    const centerSprite = this.#atlas.spriteAt(id);
    centerSprite.x = x;
    centerSprite.y = y;
    centerSprite.scale = { x: 3, y: 3 };
    container.addChild(centerSprite);
    let obj = new Graphics();
    obj.lineStyle(1, 0xff0000);
    Array.from(this.#map[id.id].n).forEach((t, i) => {
      const spr = this.#atlas.spriteAt(t);
      spr.x = x + i * 17;
      spr.y = y - 73;
      container.addChild(spr);
      obj.drawRect(spr.x - 1, spr.y - 1, 18, 18);
    });

    Array.from(this.#map[id.id].s).forEach((t, i) => {
      const spr = this.#atlas.spriteAt(t);
      spr.x = x + i * 17;
      spr.y = y + 100;
      container.addChild(spr);
      obj.drawRect(spr.x - 1, spr.y - 1, 18, 18);
    });

    Array.from(this.#map[id.id].e).forEach((t, i) => {
      const spr = this.#atlas.spriteAt(t);
      spr.x = x + 100;
      spr.y = y + i * 17;
      container.addChild(spr);
      obj.drawRect(spr.x - 1, spr.y - 1, 18, 18);
    });

    Array.from(this.#map[id.id].w).forEach((t, i) => {
      const spr = this.#atlas.spriteAt(t);
      spr.x = x - 73;
      spr.y = y + i * 17;
      container.addChild(spr);
      obj.drawRect(spr.x - 1, spr.y - 1, 18, 18);
    });
    container.addChild(obj);
  }

  public drawTiles(x: number, y: number, container: Container) {
    const txtStyle = new TextStyle({
      fill: "white",
      stroke: "red",
      strokeThickness: 2,
      fontSize: 10,
    });
    Array.from(this.#tileIds).forEach((id, i) => {
      const spr = this.#atlas.spriteAt(id);
      spr.x = x + (this.#atlas.TileSize + 1) * i * 2;
      spr.y = y;
      spr.scale = { x: 2, y: 2 };
      container.addChild(spr);
      const txt = new Text(id.id, txtStyle);
      txt.x = spr.x + 6;
      txt.y = spr.y + 7;
      container.addChild(txt);
    });
  }

  intersection(
    sourceTiles: Set<TileId>,
    direction: Direction,
    targetSuperPosition: Set<TileId>
  ) {
    const allValid = new Set<TileId>();
    sourceTiles.forEach((v) => {
      this.#map[v.id][direction].forEach((t) => allValid.add(t));
    });
    const toRemove = Array.from(targetSuperPosition.values()).filter(
      (t) => !allValid.has(t)
    );

    if (toRemove.length === 0) {
      return false;
    }
    toRemove.forEach((t) => targetSuperPosition.delete(t));
    return true;
  }
}
