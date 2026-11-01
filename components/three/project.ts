import { Vector3, type Camera } from "three";

const v = new Vector3();

/** World point -> 0..1 coordinates inside the View (y downward), for positioning DOM labels. */
export function toSlot(world: Vector3, camera: Camera): { x: number; y: number } {
  camera.updateMatrixWorld();
  v.copy(world).project(camera);
  return { x: v.x * 0.5 + 0.5, y: -v.y * 0.5 + 0.5 };
}
