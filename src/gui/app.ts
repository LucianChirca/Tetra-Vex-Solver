export interface View {
  handlePointer?(e: PointerEvent): void;
  update(dt: number): void;
  draw(ctx: CanvasRenderingContext2D): void;
}

// Owns the canvas + requestAnimationFrame loop; runs the active View.
export class App {
  readonly n: number;
  readonly mount: HTMLElement;

  constructor(mount: HTMLElement, n: number) {
    this.mount = mount;
    this.n = n;
  }

  run(_view: View): void {
    throw new Error("not implemented");
  }
}
