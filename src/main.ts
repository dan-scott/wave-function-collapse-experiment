import { Application, Container } from "pixi.js";
import "./style.css";
import { loadPacked } from "./tilesets/packedRpg";
import { WaveFunctionGrid } from "./WaveFunctionGrid";
import { AffinityMap } from "./affinityMap";
import { ITileAtlas } from "./tileAtlas";

let app = new Application({
  width: window.innerWidth,
  height: window.innerHeight,
});

const setViewIdx = (idx: number) => {
  localStorage.setItem("affinity_tile_idx", `${idx}`);
};

const getViewIdx = () => {
  const val = localStorage.getItem("affinity_tile_idx");
  if (!val) {
    return 0;
  }
  return parseInt(val, 10);
};

// type ViewMode = "waveFunction" | "atlas";
//
// const getViewMode = (): ViewMode =>
//   (localStorage.getItem("view_mode") as ViewMode | undefined) ?? "atlas";
//
// const flipViewMode = () => {
//   localStorage.setItem(
//     "view_mode",
//     getViewMode() === "atlas" ? "waveFunction" : "atlas"
//   );
// };

document.body.appendChild(app.view);

function drawWaveFunction(
  affinity: AffinityMap,
  atlas: ITileAtlas,
  container: Container
) {
  const wfg = new WaveFunctionGrid({ affinity, atlas, width: 30, height: 30 });
  while (wfg.step()) {}
  wfg.draw(container);
}

(async () => {
  const [atlas, affinity] = await loadPacked();

  let wfgContainer = new Container();
  app.stage.addChild(wfgContainer);

  drawWaveFunction(affinity, atlas, wfgContainer);

  affinity.drawTiles(0, 560, app.stage, 1.8);

  let affinityContainer = new Container();
  app.stage.addChild(affinityContainer);
  drawAffinity(affinity);

  window.addEventListener("keypress", (evt) => {
    if (evt.key === "r") {
      app.stage.removeChild(wfgContainer);
      wfgContainer.destroy({ children: true });
      wfgContainer = new Container();
      app.stage.addChild(wfgContainer);
      drawWaveFunction(affinity, atlas, wfgContainer);
    }

    if (evt.key === "d") {
      setViewIdx((getViewIdx() + 1) % affinity.Ids.length);
      drawAffinity(affinity);
    }
    if (evt.key === "a") {
      setViewIdx(
        (getViewIdx() + affinity.Ids.length - 1) % affinity.Ids.length
      );
      drawAffinity(affinity);
    }
  });

  function drawAffinity(affinity: AffinityMap) {
    app.stage.removeChild(affinityContainer);
    affinityContainer.destroy({ children: true });
    affinityContainer = new Container();
    app.stage.addChild(affinityContainer);
    affinity.drawTileAffinity(
      affinity.Ids[getViewIdx()],
      100,
      700,
      affinityContainer
    );
  }
})();
