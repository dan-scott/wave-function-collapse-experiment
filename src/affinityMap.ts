import { ITileAtlas } from "./sprites/SpriteAtlas";
import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { idx, SpriteId, SpriteIdStr } from "./sprites/SpriteId";

interface IAffinity {
  n: Set<SpriteId>;
  s: Set<SpriteId>;
  e: Set<SpriteId>;
  w: Set<SpriteId>;
}

export type Direction = keyof IAffinity;

const contra: Record<Direction, Direction> = {
  n: "s",
  s: "n",
  e: "w",
  w: "e",
};

const asId = (i: SpriteId | SpriteIdStr | "empty") =>
  i === "empty" ? SpriteId.Empty() : typeof i === "object" ? i : SpriteId.Of(i);

export class AffinityMap {
  readonly #atlas: ITileAtlas;
  readonly #map: Record<string, IAffinity> = {};
  readonly #tileIds: Set<SpriteId> = new Set<SpriteId>();

  public get Ids() {
    return Array.from(this.#tileIds);
  }

  public constructor(atlas: ITileAtlas) {
    this.#atlas = atlas;
    this.#map[SpriteId.Empty().id] = {
      n: new Set(),
      s: new Set(),
      e: new Set(),
      w: new Set(),
    };
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
    l: SpriteId | SpriteIdStr | "empty",
    d: Direction,
    ...rs: Array<SpriteId | SpriteIdStr | "empty">
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
    id: SpriteId,
    x: number,
    y: number,
    container: Container,
    scale: number = 1
  ) {
    const centerSprite = this.#atlas.spriteAt(id);
    centerSprite.x = x;
    centerSprite.y = y;
    centerSprite.scale = { x: scale, y: scale };
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
    const offsetX = centerSprite.width + 15;
    const offsetY = (this.#atlas.TileSize * scale) / 2 + 15;

    this.drawDirAffinity(id, "n", obj, x + offsetX, y, container, scale / 2);
    this.drawDirAffinity(
      id,
      "w",
      obj,
      x + offsetX,
      y + offsetY * 2,
      container,
      scale / 2
    );
    this.drawDirAffinity(
      id,
      "e",
      obj,
      x + offsetX,
      y + offsetY * 3,
      container,
      scale / 2
    );
    this.drawDirAffinity(
      id,
      "s",
      obj,
      x + offsetX,
      y + offsetY * 4,
      container,
      scale / 2
    );

    container.addChild(obj);
  }

  private drawDirAffinity(
    t: SpriteId,
    d: Direction,
    obj: Graphics,
    x: number,
    y: number,
    container: Container,
    scale: number = 1
  ) {
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
    sourceTiles: Set<SpriteId>,
    direction: Direction,
    targetSuperPosition: Set<SpriteId>
  ) {
    if (!sourceTiles.size) {
      return false;
    }
    const allValid = new Set<SpriteId>();
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
