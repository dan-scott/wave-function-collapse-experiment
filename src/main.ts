import { Application, Container, Text, TextStyle } from "pixi.js";
import "./style.css";
import { loadPacked } from "./tilesets/packedRpg";
import { WaveFunctionGrid } from "./WaveFunctionGrid";
import { idx } from "./tileId";

let app = new Application({
  width: window.innerWidth,
  height: window.innerHeight,
});

document.body.appendChild(app.view);

// async function delay(ms: number): Promise<void> {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

(async () => {
  const [atlas, affinity] = await loadPacked();

  window.addEventListener("resize", () => {
    app.resize();
    app.render();
  });

  const wfg = new WaveFunctionGrid({ affinity, atlas, width: 30, height: 30 });
  const container = new Container();
  app.stage.addChild(container);

  while (wfg.step()) {}
  container.removeChildren();
  wfg.draw(container);

  const style = new TextStyle({
    fill: "green",
    fontSize: 60,
  });

  const txt = new Text("Done!", style);
  txt.x = 30;
  txt.y = 500;
  app.stage.addChild(txt);

  affinity.drawTiles(30, 560, app.stage);

  affinity.drawTileAffinity(idx(1, 3), 200, 700, app.stage);
})();
