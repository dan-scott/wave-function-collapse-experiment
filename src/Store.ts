import { TileId } from "./tilesets/TileSet";

export interface IState {
  tile: TileId;
  width: number;
  height: number;
  cell: number;
  grid: TileId[];
}

const defaultState: IState = {
  grid: [],
  height: 10,
  width: 20,
  cell: 0,
  tile: "empty",
};

const storeKey = "layout_state";

function getState(): IState {
  let state: IState = { ...defaultState };
  let strVal = localStorage.getItem(storeKey);
  if (!strVal) {
    setState(defaultState);
  } else {
    state = JSON.parse(strVal);
  }
  return state;
}

function setState(state: IState) {
  localStorage.setItem(storeKey, JSON.stringify(state));
}

export function getStoreVal<K extends keyof IState>(key: K): IState[K] {
  return getState()[key];
}

export function setStoreVal<K extends keyof Omit<IState, "grid">>(
  key: K,
  val: IState[K]
) {
  const state = getState();
  state[key] = val;
  setState(state);
}

export function setGridCell(idx: number, tile: TileId) {
  const state = getState();
  state.grid[idx] = tile;
  setState(state);
}
