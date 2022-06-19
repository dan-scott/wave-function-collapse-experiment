export interface Coordinate {
  x: number;
  y: number;
}

export const crd = (x: number, y: number): Coordinate => ({ x, y });
