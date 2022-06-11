import { AffinityMap } from "../affinityMap";
import { ITileAtlas, loadTileAtlas } from "../tileAtlas";
import tiles from "../../res/tiles_packed.png";
import { idx } from "../tileId";

export async function loadPacked(): Promise<[ITileAtlas, AffinityMap]> {
  const atlas = await loadTileAtlas({
    url: tiles,
    columns: 23,
    rows: 8,
    tileSize: 16,
  });

  const aff = new AffinityMap(atlas);
  aff.add(idx(22, 7), "n", idx(22, 7), idx(0, 4), idx(1, 4), idx(5, 4));
  aff.add(idx(22, 7), "s", idx(22, 7), idx(0, 0), idx(1, 0), idx(5, 0));
  aff.add(idx(22, 7), "e", idx(22, 7), idx(0, 0), idx(0, 1), idx(0, 4));
  aff.add(idx(22, 7), "w", idx(22, 7), idx(5, 0), idx(5, 1), idx(5, 4));

  aff.add(idx(0, 4), "n", idx(3, 1));
  aff.add(idx(0, 4), "s");
  aff.add(idx(0, 4), "e", idx(1, 4), idx(5, 4), idx(3, 1));
  aff.add(idx(0, 4), "w");

  aff.add(idx(1, 4), "n", idx(1, 3), idx(3, 3));
  aff.add(idx(1, 4), "s");
  aff.add(idx(1, 4), "e", idx(1, 4), idx(5, 4), idx(3, 1));
  aff.add(idx(1, 4), "w", idx(1, 1));

  aff.add(idx(5, 4), "n", idx(1, 1));
  aff.add(idx(5, 4), "s");
  aff.add(idx(5, 4), "e");
  aff.add(idx(5, 4), "w", idx(1, 1));

  aff.add(idx(0, 0), "n");
  aff.add(idx(0, 0), "s", idx(0, 1), idx(0, 4), idx(3, 3));
  aff.add(idx(0, 0), "e", idx(1, 0), idx(5, 0), idx(3, 3));
  aff.add(idx(0, 0), "w");

  aff.add(idx(1, 0), "n");
  aff.add(idx(1, 0), "s", idx(4, 1), idx(1, 1), idx(3, 1), idx(1, 4));
  aff.add(idx(1, 0), "e", idx(1, 0), idx(3, 3));
  aff.add(idx(1, 0), "w", idx(1, 3));

  aff.add(idx(5, 0), "n");
  aff.add(idx(5, 0), "s", idx(5, 1), idx(5, 4), idx(1, 3));
  aff.add(idx(5, 0), "e");
  aff.add(idx(5, 0), "w", idx(1, 0), idx(1, 3));

  aff.add(idx(0, 1), "n", idx(0, 1), idx(3, 1));
  aff.add(idx(0, 1), "s", idx(0, 4), idx(3, 3));
  aff.add(idx(0, 1), "e", idx(4, 1), idx(5, 1), idx(1, 1), idx(1, 3));
  aff.add(idx(0, 1), "w");

  aff.add(idx(5, 1), "n", idx(5, 1), idx(1, 1));
  aff.add(idx(5, 1), "s", idx(1, 3), idx(5, 4));
  aff.add(idx(5, 1), "e");
  aff.add(idx(5, 1), "w", idx(4, 1), idx(3, 1), idx(3, 3));

  aff.add(idx(1, 1), "n", idx(1, 3), idx(3, 3));
  aff.add(idx(1, 1), "s");
  aff.add(idx(1, 1), "e");
  aff.add(idx(1, 1), "w", idx(3, 1), idx(3, 3));

  aff.add(idx(3, 1), "n", idx(1, 3), idx(3, 3));
  aff.add(idx(3, 1), "s");
  aff.add(idx(3, 1), "e", idx(1, 3));
  aff.add(idx(3, 1), "w");

  aff.add(idx(4, 1), "n", idx(1, 3), idx(3, 3));
  aff.add(idx(4, 1), "s", idx(1, 4), idx(1, 1), idx(3, 1));
  aff.add(idx(4, 1), "e", idx(1, 1), idx(1, 3));
  aff.add(idx(4, 1), "w", idx(3, 1), idx(3, 3));

  aff.add(idx(1, 3), "n");
  aff.add(idx(1, 3), "s");
  aff.add(idx(1, 3), "e");
  aff.add(idx(1, 3), "w", idx(3, 3));

  aff.add(idx(3, 3), "n");
  aff.add(idx(3, 3), "s");
  aff.add(idx(3, 3), "e");
  aff.add(idx(3, 3), "w");

  return [atlas, aff];
}
