import tiles from "../../res/tilesheet.png";
import { loadAtlas, SpriteAtlas } from "../sprites/SpriteAtlas";
import { AffinityMap } from "../affinityMap";

export async function loadSimplePlatformer(): Promise<
  [SpriteAtlas, AffinityMap]
> {
  const atlas = await loadAtlas({
    url: tiles,
    columns: 9,
    rows: 3,
    tileSize: 64,
  });

  const aff = new AffinityMap(atlas);

  aff.add("empty", "n", "empty");
  aff.add("empty", "s", "empty");
  aff.add("empty", "e", "empty");
  aff.add("empty", "w", "empty");

  aff.add("1_0", "n", "empty");
  aff.add("1_0", "s", "0_0");
  aff.add("1_0", "e", "2_0");
  aff.add("1_0", "w", "empty");

  aff.add("2_0", "n", "empty");
  aff.add("2_0", "s", "0_0");
  aff.add("2_0", "e", "2_0", "3_0");
  aff.add("2_0", "w");

  aff.add("3_0", "n", "empty");
  aff.add("3_0", "s", "0_0");
  aff.add("3_0", "e", "empty");
  aff.add("3_0", "w");

  aff.add("0_0", "n");
  aff.add("0_0", "s", "empty");
  aff.add("0_0", "e", "empty");
  aff.add("0_0", "w", "empty");

  aff.add("1_2", "n", "1_1");
  aff.add("1_2", "s", "0_0");
  aff.add("1_2", "e", "0_0");
  aff.add("1_2", "w", "1_0", "2_0");

  aff.add("2_2", "n", "2_1");
  aff.add("2_2", "s", "0_0");
  aff.add("2_2", "e", "2_0", "3_0");
  aff.add("2_2", "w", "0_0");

  aff.add("1_1", "n", "empty");
  aff.add("1_1", "s");
  aff.add("1_1", "e", "2_0", "3_0", "2_1");
  aff.add("1_1", "w", "empty");

  aff.add("2_1", "n", "empty");
  aff.add("2_1", "s");
  aff.add("2_1", "e", "empty");
  aff.add("2_1", "w", "1_0", "2_0");

  return [atlas, aff];
}
