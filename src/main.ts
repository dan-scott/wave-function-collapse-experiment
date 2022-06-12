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

type ViewMode = "waveFunction" | "atlas";

const getViewMode = (): ViewMode =>
  (localStorage.getItem("view_mode") as ViewMode | undefined) ?? "atlas";

const flipViewMode = () => {
  localStorage.setItem(
    "view_mode",
    getViewMode() === "atlas" ? "waveFunction" : "atlas"
  );
};

document.body.appendChild(app.view);

// const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function drawWaveFunction(
  affinity: AffinityMap,
  atlas: ITileAtlas,
  container: Container
) {
  const wfg = new WaveFunctionGrid({ affinity, atlas, width: 30, height: 30 });
  container.y = 260;
  while (wfg.step()) {
    // await delay(1);
    // const children = container.removeChildren();
    // children.forEach((c) => c.destroy({ children: true }));
    // wfg.draw(container);
  }
  wfg.draw(container);
}

(async () => {
  const [atlas, affinity] = await loadPacked();

  let wfgContainer = new Container();
  wfgContainer.y = 260;

  let atlasContainer = new Container();
  atlasContainer.y = 260;
  atlas.draw(0, 0, 2, atlasContainer);

  const drawMain = () => {
    if (getViewMode() === "atlas") {
      app.stage.removeChild(wfgContainer);
      app.stage.addChild(atlasContainer);
    } else {
      app.stage.removeChild(atlasContainer);
      app.stage.addChild(wfgContainer);
    }
  };

  drawMain();

  affinity.drawTiles(0, 230, app.stage, 1);

  let affinityContainer = new Container();
  app.stage.addChild(affinityContainer);
  drawAffinity(affinity);

  window.addEventListener("keypress", (evt) => {
    if (evt.key === "r" && getViewMode() === "waveFunction") {
      app.stage.removeChild(wfgContainer);
      wfgContainer.destroy({ children: true });
      wfgContainer = new Container();
      app.stage.addChild(wfgContainer);
      drawWaveFunction(affinity, atlas, wfgContainer);
    }

    if (evt.key === "e") {
      flipViewMode();
      drawMain();
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
      0,
      20,
      affinityContainer
    );
  }
})();
