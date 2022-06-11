import { Application } from "pixi.js";
import tiles from "../res/tiles_packed.png";
import "./style.css";
import { loadTileAtlas } from "./tileAtlas";
import { AffinityMap, idx } from "./affinityMap";

let app = new Application({
  width: window.innerWidth,
  height: window.innerHeight,
});

document.body.appendChild(app.view);

(async () => {
  const atlas = await loadTileAtlas({
    url: tiles,
    columns: 23,
    rows: 8,
    tileSize: 16,
  });

  atlas.draw(30, 30, 2, app.stage);

  const aff = new AffinityMap(atlas);
  aff.addAffinity(idx(22, 7), "n", idx(22, 7), idx(0, 4), idx(1, 4), idx(5, 4));
  aff.addAffinity(idx(22, 7), "s", idx(22, 7), idx(0, 0), idx(1, 0), idx(5, 0));
  aff.addAffinity(idx(22, 7), "e", idx(22, 7), idx(0, 0), idx(0, 1), idx(0, 4));
  aff.addAffinity(idx(22, 7), "w", idx(22, 7), idx(5, 0), idx(5, 1), idx(5, 4));

  aff.addAffinity(idx(4, 1), "n", idx(1, 3), idx(3, 3));
  aff.addAffinity(idx(4, 1), "s", idx(1, 4), idx(1, 1), idx(3, 1));
  aff.addAffinity(idx(4, 1), "e", idx(1, 1), idx(1, 3));
  aff.addAffinity(idx(4, 1), "w", idx(3, 1), idx(3, 3));

  aff.addAffinity(idx(0, 0), "n", idx(22, 7), idx(0, 4), idx(1, 4), idx(5, 4));
  aff.addAffinity(idx(0, 0), "s", idx(0, 1), idx(0, 4), idx(3, 3));
  aff.addAffinity(idx(0, 0), "e", idx(1, 0), idx(5, 0), idx(3, 3));
  aff.addAffinity(idx(0, 0), "w", idx(22, 7), idx(5, 0), idx(5, 1), idx(5, 4));

  aff.addAffinity(idx(0, 1), "n", idx(0, 1), idx(3, 1));
  aff.addAffinity(idx(0, 1), "s", idx(0, 4), idx(3, 3));
  aff.addAffinity(idx(0, 1), "e", idx(4, 1), idx(5, 1), idx(1, 1), idx(1, 3));
  aff.addAffinity(idx(0, 1), "w", idx(5, 0), idx(5, 1), idx(5, 4));

  aff.addAffinity(idx(0, 4), "n", idx(3, 1));
  aff.addAffinity(idx(0, 4), "s", idx(1, 0));
  aff.addAffinity(idx(0, 4), "e", idx(1, 4), idx(5, 4), idx(3, 1));
  aff.addAffinity(idx(0, 4), "w", idx(5, 1), idx(5, 4));

  aff.addAffinity(idx(1, 0), "n", idx(1, 4), idx(5, 4));
  aff.addAffinity(idx(1, 0), "s", idx(4, 1), idx(1, 1), idx(3, 1), idx(1, 4));
  aff.addAffinity(idx(1, 0), "e", idx(1, 0), idx(3, 3));
  aff.addAffinity(idx(1, 0), "w", idx(1, 3));

  aff.addAffinity(idx(5, 0), "n", idx(0, 4), idx(1, 4), idx(5, 4));
  aff.addAffinity(idx(5, 0), "s", idx(5, 1), idx(5, 4), idx(1, 3));
  aff.addAffinity(idx(5, 0), "e", idx(0, 4));
  aff.addAffinity(idx(5, 0), "w", idx(1, 0), idx(1, 3));

  aff.addAffinity(idx(5, 1), "n", idx(5, 1), idx(1, 1));
  aff.addAffinity(idx(5, 1), "s", idx(1, 3), idx(5, 4));
  aff.addAffinity(idx(5, 1), "e");
  aff.addAffinity(idx(5, 1), "w", idx(4, 1), idx(3, 1), idx(3, 3));

  aff.addAffinity(idx(1, 4), "n", idx(1, 3), idx(3, 3));
  aff.addAffinity(idx(1, 4), "s");
  aff.addAffinity(idx(1, 4), "e", idx(1, 4), idx(5, 4), idx(3, 1));
  aff.addAffinity(idx(1, 4), "w", idx(1, 1));

  aff.addAffinity(idx(5, 4), "n", idx(1, 1));
  aff.addAffinity(idx(5, 4), "s");
  aff.addAffinity(idx(5, 4), "e");
  aff.addAffinity(idx(5, 4), "w", idx(1, 1));

  aff.addAffinity(idx(1, 1), "n", idx(1, 3), idx(3, 3));
  aff.addAffinity(idx(1, 1), "s", idx(1, 3));
  aff.addAffinity(idx(1, 1), "e", idx(3, 1));
  aff.addAffinity(idx(1, 1), "w", idx(3, 1), idx(3, 3));

  aff.addAffinity(idx(3, 1), "n", idx(1, 3), idx(3, 3));
  aff.addAffinity(idx(3, 1), "s", idx(3, 3));
  aff.addAffinity(idx(3, 1), "e", idx(1, 3));
  aff.addAffinity(idx(3, 1), "w");

  aff.addAffinity(idx(1, 3), "n");
  aff.addAffinity(idx(1, 3), "s");
  aff.addAffinity(idx(1, 3), "e", idx(3, 3));
  aff.addAffinity(idx(1, 3), "w", idx(3, 3));

  aff.addAffinity(idx(3, 3), "n");
  aff.addAffinity(idx(3, 3), "s");
  aff.addAffinity(idx(3, 3), "e");
  aff.addAffinity(idx(3, 3), "w");
})();
