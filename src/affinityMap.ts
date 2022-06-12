import { ITileAtlas } from "./tileAtlas";
import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { idx, TileId, TileIdStr } from "./tileId";

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

const asId = (i: TileId | TileIdStr) =>
  typeof i === "object" ? i : TileId.Of(i);

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

  public add(
    l: TileId | TileIdStr,
    d: Direction,
    ...rs: Array<TileId | TileIdStr>
  ) {
    const lId = asId(l);
    this.#tileIds.add(lId);

    rs.forEach((r) => {
      const rId = asId(r);
      this.#tileIds.add(rId);
      this.#map[lId.id][d].add(rId);
      this.#map[rId.id][contra[d]].add(lId);
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

    const txt = new Text(id.id, {
      fill: "white",
      fontSize: 10,
    });
    txt.x = x;
    txt.y = y - 20;
    container.addChild(txt);

    let obj = new Graphics();
    obj.lineStyle(1, 0xff0000, 1);

    this.drawDirAffinity(id, "n", obj, x + 65, y, container);
    this.drawDirAffinity(id, "w", obj, x + 65, y + 60, container);
    this.drawDirAffinity(id, "e", obj, x + 65, y + 100, container);
    this.drawDirAffinity(id, "s", obj, x + 65, y + 140, container);

    container.addChild(obj);
  }

  private drawDirAffinity(
    t: TileId,
    d: Direction,
    obj: Graphics,
    x: number,
    y: number,
    container: Container
  ) {
    const scale = 1.5;
    const style = new TextStyle({
      fill: "white",
      fontSize: 8,
    });
    const dirText = new Text(d, {
      fill: "white",
      fontSize: 12,
    });
    dirText.x = x - 12;
    dirText.y = y;
    container.addChild(dirText);

    const tSize = this.#atlas.TileSize * scale;
    let nY: CFunc;
    let nX: CFunc;
    let tY: CFunc;
    let tX: CFunc;
    let lX: CFunc;
    let lY: CFunc;

    switch (d) {
      case "n":
        nY = () => y;
        nX = (i) => x + i * (tSize + 4);
        tY = () => y + tSize;
        tX = nX;
        lY = () => y - 12;
        lX = nX;
        break;

      case "s":
        nY = () => y + tSize;
        nX = (i) => x + i * (tSize + 4);
        tY = () => y;
        tX = nX;
        lY = () => y - 12;
        lX = nX;
        break;

      case "w":
        nY = () => y;
        nX = (i) => x + tSize / 2 + i * (tSize * 2 + 10) - tSize / 2;
        tY = nY;
        tX = (i) => nX(i) + tSize;
        lY = () => y - 12;
        lX = (i) => nX(i);
        break;

      case "e":
        nY = () => y;
        nX = (i) => x + tSize / 2 + i * (tSize * 2 + 10) + tSize / 2;
        tY = nY;
        tX = (i) => nX(i) - tSize;
        lY = () => y - 12;
        lX = (i) => tX(i);
    }

    Array.from(this.#map[t.id][d]).forEach((nt, i) => {
      const spr = this.#atlas.spriteAt(nt);
      spr.x = nX(i);
      spr.y = nY(i);
      spr.scale = { x: scale, y: scale };
      container.addChild(spr);

      const tl = this.#atlas.spriteAt(t);
      tl.x = tX(i);
      tl.y = tY(i);
      tl.scale = { x: scale, y: scale };
      container.addChild(tl);

      obj.drawRect(spr.x, spr.y, tSize, tSize);

      const txt = new Text(nt.id, style);
      txt.x = lX(i);
      txt.y = lY(i);
      container.addChild(txt);
    });
  }

  public drawTiles(x: number, y: number, container: Container, scale = 2) {
    const txtStyle = new TextStyle({
      fill: "white",
      fontSize: 8,
    });

    Array.from(this.#tileIds).forEach((id, i) => {
      const spr = this.#atlas.spriteAt(id);
      spr.x = x + (this.#atlas.TileSize + 2) * i * scale;
      spr.y = y;
      spr.scale = { x: scale, y: scale };
      container.addChild(spr);
      const txt = new Text(id.id, txtStyle);
      txt.x = spr.x + (this.#atlas.TileSize * scale - txt.width) / 2;
      txt.y = spr.y - txt.height - 1;
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

interface CFunc {
  (i: number): number;
}
